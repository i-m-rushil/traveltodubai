# Travel Affiliate Booking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the Plan Trip page to real Travelpayouts flight/hotel data with affiliate deep-links, cached and tracked in Supabase.

**Architecture:** React page → `supabase.functions.invoke('travel-search')` Edge Function → Travelpayouts APIs (token in Supabase secrets) → results cached in Postgres with 30-min TTL. A second function `refresh-prices` runs nightly via pg_cron to fill `popular_routes`/`featured_hotels` for the decorative sections. Book clicks insert into `affiliate_clicks` then open the partner checkout with the affiliate `marker` param.

**Tech Stack:** React 19 + Vite (JS, inline styles), Supabase (Postgres, Edge Functions/Deno, pg_cron + pg_net), Travelpayouts Data APIs (Aviasales `prices_for_dates`, Hotellook `cache.json`).

**Spec:** `docs/superpowers/specs/2026-06-10-travel-affiliate-booking-design.md`

**Conventions:** Migrations named `YYYYMMDDHHMMSS_name.sql` like existing ones. Frontend uses plain JS with inline styles (match `PlanTripPage.jsx`). No JS test framework exists — do not add one; Edge Function helpers get `deno test` coverage (skip gracefully if Deno absent), frontend verified via `npm run build` + manual pass.

**Secrets (never committed):** `TRAVELPAYOUTS_TOKEN` (server-only), `TRAVELPAYOUTS_MARKER` (public ID, also exposed to frontend as `VITE_TRAVELPAYOUTS_MARKER` for fallback links), `CRON_SECRET` (guards refresh-prices).

---

### Task 1: Database migration

**Files:**
- Create: `supabase/migrations/20260610130000_travel_affiliate.sql`

- [ ] **Step 1: Write the migration**

```sql
-- Travel affiliate: price caches, popular routes, featured hotels, analytics
-- Spec: docs/superpowers/specs/2026-06-10-travel-affiliate-booking-design.md

-- ── Search result caches (written only by Edge Functions / service role) ──

create table public.flight_price_cache (
  id          uuid primary key default gen_random_uuid(),
  origin      text not null,
  destination text not null default 'DXB',
  depart_date date not null,
  return_date date,
  currency    text not null default 'usd',
  results     jsonb not null default '[]'::jsonb,
  fetched_at  timestamptz not null default now(),
  expires_at  timestamptz not null default now() + interval '30 minutes'
);

-- coalesce() lets one-way (null return) rows participate in uniqueness
create unique index flight_price_cache_key
  on public.flight_price_cache (origin, destination, depart_date, coalesce(return_date, '1900-01-01'::date), currency);

create table public.hotel_price_cache (
  id         uuid primary key default gen_random_uuid(),
  location   text not null default 'Dubai',
  check_in   date not null,
  check_out  date not null,
  adults     int  not null default 2,
  currency   text not null default 'aed',
  results    jsonb not null default '[]'::jsonb,
  fetched_at timestamptz not null default now(),
  expires_at timestamptz not null default now() + interval '30 minutes',
  unique (location, check_in, check_out, adults, currency)
);

-- ── Nightly-refreshed content for the decorative sections ──

create table public.popular_routes (
  id               uuid primary key default gen_random_uuid(),
  origin_code      text not null unique,
  origin_city      text not null,
  country_code     text not null,
  airline_iata     text,
  price            numeric not null,
  currency         text not null default 'usd',
  departure_at     timestamptz,
  transfers        int not null default 0,
  duration_minutes int,
  deep_link        text not null,
  updated_at       timestamptz not null default now()
);

create table public.featured_hotels (
  id             uuid primary key default gen_random_uuid(),
  hotel_id       bigint not null unique,
  name           text not null,
  stars          int,
  rating         numeric,
  price_from     numeric not null,
  price_avg      numeric,
  currency       text not null default 'aed',
  photo_url      text,
  location_label text default 'Dubai',
  deep_link      text not null,
  updated_at     timestamptz not null default now()
);

-- ── Analytics ──

create table public.travel_searches (
  id            uuid primary key default gen_random_uuid(),
  search_type   text not null check (search_type in ('flights', 'hotels')),
  params        jsonb not null,
  results_count int not null default 0,
  cache_hit     boolean not null default false,
  session_id    text,
  created_at    timestamptz not null default now()
);

create table public.affiliate_clicks (
  id            uuid primary key default gen_random_uuid(),
  click_type    text not null check (click_type in ('flight_result', 'hotel_result', 'route_card', 'deal_card', 'fallback_cta')),
  item_label    text,
  partner_url   text not null,
  price         numeric,
  currency      text,
  search_params jsonb,
  session_id    text,
  referrer      text,
  created_at    timestamptz not null default now()
);

create index affiliate_clicks_created_at on public.affiliate_clicks (created_at desc);
create index travel_searches_created_at  on public.travel_searches (created_at desc);

-- ── RLS ──

alter table public.flight_price_cache enable row level security;
alter table public.hotel_price_cache  enable row level security;
alter table public.popular_routes     enable row level security;
alter table public.featured_hotels    enable row level security;
alter table public.travel_searches    enable row level security;
alter table public.affiliate_clicks   enable row level security;

-- caches: no client policies (service role bypasses RLS; clients go through the Edge Function)

create policy "public read popular routes"
  on public.popular_routes for select to anon, authenticated using (true);

create policy "public read featured hotels"
  on public.featured_hotels for select to anon, authenticated using (true);

create policy "anyone can log affiliate clicks"
  on public.affiliate_clicks for insert to anon, authenticated with check (true);

create policy "authenticated read affiliate clicks"
  on public.affiliate_clicks for select to authenticated using (true);

create policy "authenticated read travel searches"
  on public.travel_searches for select to authenticated using (true);

-- ── Grants (project had grant issues before — be explicit) ──

grant select on public.popular_routes, public.featured_hotels to anon, authenticated;
grant insert on public.affiliate_clicks to anon, authenticated;
grant select on public.affiliate_clicks, public.travel_searches to authenticated;
grant all on public.flight_price_cache, public.hotel_price_cache,
             public.popular_routes, public.featured_hotels,
             public.travel_searches, public.affiliate_clicks to service_role;
```

- [ ] **Step 2: Push to the linked project**

Run: `supabase db push`
Expected: `Applying migration 20260610130000_travel_affiliate.sql... Finished supabase db push.`
(If the CLI isn't authenticated in this shell, hand the user the command instead and continue; nothing later in the frontend depends on the push having happened yet.)

- [ ] **Step 3: Commit**

```bash
git add supabase/migrations/20260610130000_travel_affiliate.sql
git commit -m "feat: travel affiliate schema (caches, routes, hotels, analytics)"
```

---

### Task 2: Shared Edge Function helpers (pure, testable)

**Files:**
- Create: `supabase/functions/_shared/cors.ts`
- Create: `supabase/functions/_shared/travelpayouts.ts`
- Test: `supabase/functions/_shared/travelpayouts.test.ts`

- [ ] **Step 1: Write `cors.ts`**

```ts
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-cron-secret',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};
```

- [ ] **Step 2: Write the failing tests** (`travelpayouts.test.ts`)

```ts
import { assertEquals, assert } from 'jsr:@std/assert@1';
import {
  validateFlightParams, validateHotelParams,
  buildFlightDeepLink, buildHotelDeepLink, nightsBetween,
  normalizeFlightOffers, normalizeHotelOffers,
} from './travelpayouts.ts';

Deno.test('validateFlightParams accepts a valid round trip', () => {
  const r = validateFlightParams({ origin: 'LHR', departDate: '2099-07-10', returnDate: '2099-07-17' });
  assertEquals(r.ok, true);
});

Deno.test('validateFlightParams rejects bad IATA and past dates', () => {
  assertEquals(validateFlightParams({ origin: 'London', departDate: '2099-07-10' }).ok, false);
  assertEquals(validateFlightParams({ origin: 'LHR', departDate: '2001-01-01' }).ok, false);
  assertEquals(validateFlightParams({ origin: 'LHR', departDate: '2099-07-10', returnDate: '2099-07-01' }).ok, false);
});

Deno.test('validateHotelParams enforces date order and adults range', () => {
  assertEquals(validateHotelParams({ checkIn: '2099-07-10', checkOut: '2099-07-13', adults: 2 }).ok, true);
  assertEquals(validateHotelParams({ checkIn: '2099-07-13', checkOut: '2099-07-10', adults: 2 }).ok, false);
  assertEquals(validateHotelParams({ checkIn: '2099-07-10', checkOut: '2099-07-13', adults: 0 }).ok, false);
});

Deno.test('buildFlightDeepLink appends marker to API-provided link', () => {
  const url = buildFlightDeepLink({
    link: '/search/LHR1007DXB17071?t=abc', origin: 'LHR', destination: 'DXB',
    departDate: '2099-07-10', returnDate: '2099-07-17', marker: 'M123', currency: 'usd',
  });
  assert(url.startsWith('https://www.aviasales.com/search/LHR1007DXB17071?t=abc&marker=M123'));
});

Deno.test('buildFlightDeepLink constructs a search URL when link is absent', () => {
  const oneWay = buildFlightDeepLink({
    link: null, origin: 'JFK', destination: 'DXB',
    departDate: '2099-12-05', returnDate: null, marker: 'M123', currency: 'usd',
  });
  assert(oneWay.includes('/search/JFK0512DXB1?'));
  assert(oneWay.includes('marker=M123'));
  const round = buildFlightDeepLink({
    link: undefined, origin: 'JFK', destination: 'DXB',
    departDate: '2099-12-05', returnDate: '2099-12-12', marker: 'M123', currency: 'usd',
  });
  assert(round.includes('/search/JFK0512DXB12121?'));
});

Deno.test('buildHotelDeepLink carries all booking params and marker', () => {
  const url = buildHotelDeepLink({
    hotelId: 12345, checkIn: '2099-07-10', checkOut: '2099-07-13',
    adults: 2, currency: 'aed', marker: 'M123',
  });
  assert(url.startsWith('https://search.hotellook.com/hotels?'));
  for (const part of ['hotelId=12345', 'checkIn=2099-07-10', 'checkOut=2099-07-13', 'adults=2', 'currency=aed', 'marker=M123']) {
    assert(url.includes(part), `missing ${part}`);
  }
});

Deno.test('nightsBetween', () => {
  assertEquals(nightsBetween('2099-07-10', '2099-07-13'), 3);
});

Deno.test('normalizeFlightOffers maps API rows to the offer shape', () => {
  const offers = normalizeFlightOffers(
    [{
      origin: 'LHR', destination: 'DXB', price: 389, airline: 'EK', flight_number: '4',
      departure_at: '2099-07-10T14:30:00Z', return_at: '2099-07-17T09:00:00Z',
      transfers: 0, return_transfers: 0, duration_to: 440, link: '/search/x?t=1',
    }],
    { currency: 'usd', marker: 'M123' },
  );
  assertEquals(offers.length, 1);
  assertEquals(offers[0].price, 389);
  assertEquals(offers[0].airlineIata, 'EK');
  assertEquals(offers[0].airlineName, 'Emirates');
  assertEquals(offers[0].transfers, 0);
  assert(offers[0].deepLink.includes('marker=M123'));
});

Deno.test('normalizeHotelOffers maps API rows and builds photo + deep link', () => {
  const offers = normalizeHotelOffers(
    [{ hotelId: 777, hotelName: 'Test Palace', stars: 5, priceFrom: 900, priceAvg: 1100 }],
    { checkIn: '2099-07-10', checkOut: '2099-07-13', adults: 2, currency: 'aed', marker: 'M123' },
  );
  assertEquals(offers[0].name, 'Test Palace');
  assertEquals(offers[0].nights, 3);
  assert(offers[0].photoUrl.includes('h777_1'));
  assert(offers[0].deepLink.includes('hotelId=777'));
});
```

- [ ] **Step 3: Run tests to verify they fail**

Run: `deno test supabase/functions/_shared/`
Expected: FAIL — module `./travelpayouts.ts` not found.
If `deno` is not installed on this machine, note it and rely on Step 5's check after implementation via `deno` in CI-less mode being skipped — implementation still proceeds; the functions get exercised end-to-end in Task 10.

- [ ] **Step 4: Implement `travelpayouts.ts`**

```ts
// Pure helpers + Travelpayouts API clients shared by travel-search and refresh-prices.
// Data APIs: https://support.travelpayouts.com/hc/en-us/articles/203956163

export const AVIASALES_BASE = 'https://www.aviasales.com';
export const HOTELLOOK_SEARCH = 'https://search.hotellook.com/hotels';
const FLIGHTS_API = 'https://api.travelpayouts.com/aviasales/v3/prices_for_dates';
const HOTELS_API = 'https://engine.hotellook.com/api/v2/cache.json';

const IATA_RE = /^[A-Z]{3}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export const AIRLINE_NAMES: Record<string, string> = {
  EK: 'Emirates', FZ: 'flydubai', EY: 'Etihad Airways', QR: 'Qatar Airways',
  BA: 'British Airways', VS: 'Virgin Atlantic', AF: 'Air France', LH: 'Lufthansa',
  TK: 'Turkish Airlines', SQ: 'Singapore Airlines', AI: 'Air India', '6E': 'IndiGo',
  UK: 'Vistara', AA: 'American Airlines', UA: 'United Airlines', DL: 'Delta',
  AC: 'Air Canada', QF: 'Qantas', SV: 'Saudia', MS: 'EgyptAir', GF: 'Gulf Air',
  WY: 'Oman Air', KU: 'Kuwait Airways', PK: 'PIA', KL: 'KLM', IB: 'Iberia',
  AZ: 'ITA Airways', LX: 'SWISS', OS: 'Austrian', SU: 'Aeroflot', CX: 'Cathay Pacific',
};

export function airlineName(iata: string): string {
  return AIRLINE_NAMES[iata] ?? iata;
}

function todayUtc(): string {
  return new Date().toISOString().slice(0, 10);
}

export function validateFlightParams(p: { origin?: string; departDate?: string; returnDate?: string | null }) {
  if (!p.origin || !IATA_RE.test(p.origin)) return { ok: false as const, error: 'origin must be a 3-letter IATA code' };
  if (!p.departDate || !DATE_RE.test(p.departDate)) return { ok: false as const, error: 'departDate must be YYYY-MM-DD' };
  if (p.departDate < todayUtc()) return { ok: false as const, error: 'departDate is in the past' };
  if (p.returnDate) {
    if (!DATE_RE.test(p.returnDate)) return { ok: false as const, error: 'returnDate must be YYYY-MM-DD' };
    if (p.returnDate < p.departDate) return { ok: false as const, error: 'returnDate is before departDate' };
  }
  return { ok: true as const };
}

export function validateHotelParams(p: { checkIn?: string; checkOut?: string; adults?: number }) {
  if (!p.checkIn || !DATE_RE.test(p.checkIn)) return { ok: false as const, error: 'checkIn must be YYYY-MM-DD' };
  if (!p.checkOut || !DATE_RE.test(p.checkOut)) return { ok: false as const, error: 'checkOut must be YYYY-MM-DD' };
  if (p.checkIn < todayUtc()) return { ok: false as const, error: 'checkIn is in the past' };
  if (p.checkOut <= p.checkIn) return { ok: false as const, error: 'checkOut must be after checkIn' };
  const adults = p.adults ?? 2;
  if (!Number.isInteger(adults) || adults < 1 || adults > 20) return { ok: false as const, error: 'adults must be 1-20' };
  return { ok: true as const };
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  return Math.round((Date.parse(checkOut) - Date.parse(checkIn)) / 86_400_000);
}

/** Aviasales URL date chunk: DDMM */
function ddmm(date: string): string {
  const [, m, d] = date.split('-');
  return `${d}${m}`;
}

export function buildFlightDeepLink(p: {
  link?: string | null; origin: string; destination: string;
  departDate: string; returnDate?: string | null; marker: string; currency: string;
}): string {
  if (p.link) {
    const sep = p.link.includes('?') ? '&' : '?';
    return `${AVIASALES_BASE}${p.link}${sep}marker=${encodeURIComponent(p.marker)}`;
  }
  const search = `${p.origin}${ddmm(p.departDate)}${p.destination}${p.returnDate ? ddmm(p.returnDate) : ''}1`;
  return `${AVIASALES_BASE}/search/${search}?marker=${encodeURIComponent(p.marker)}&currency=${p.currency}`;
}

export function buildHotelDeepLink(p: {
  hotelId: number | string; checkIn: string; checkOut: string;
  adults: number; currency: string; marker: string;
}): string {
  const q = new URLSearchParams({
    hotelId: String(p.hotelId), checkIn: p.checkIn, checkOut: p.checkOut,
    adults: String(p.adults), currency: p.currency, marker: p.marker,
  });
  return `${HOTELLOOK_SEARCH}?${q.toString()}`;
}

// ── Normalizers ──

export interface FlightOffer {
  price: number; currency: string; airlineIata: string; airlineName: string;
  flightNumber: string; departureAt: string; returnAt: string | null;
  transfers: number; returnTransfers: number | null; durationMinutes: number | null;
  deepLink: string;
}

export function normalizeFlightOffers(
  rows: Array<Record<string, unknown>>,
  ctx: { currency: string; marker: string },
): FlightOffer[] {
  return rows.map((r) => {
    const origin = String(r.origin ?? '');
    const destination = String(r.destination ?? 'DXB');
    const departureAt = String(r.departure_at ?? '');
    const returnAt = r.return_at ? String(r.return_at) : null;
    const iata = String(r.airline ?? '');
    return {
      price: Number(r.price ?? 0),
      currency: ctx.currency,
      airlineIata: iata,
      airlineName: airlineName(iata),
      flightNumber: String(r.flight_number ?? ''),
      departureAt,
      returnAt,
      transfers: Number(r.transfers ?? 0),
      returnTransfers: r.return_transfers == null ? null : Number(r.return_transfers),
      durationMinutes: r.duration_to != null ? Number(r.duration_to) : (r.duration != null ? Number(r.duration) : null),
      deepLink: buildFlightDeepLink({
        link: (r.link as string | undefined) ?? null,
        origin, destination,
        departDate: departureAt.slice(0, 10),
        returnDate: returnAt ? returnAt.slice(0, 10) : null,
        marker: ctx.marker, currency: ctx.currency,
      }),
    };
  });
}

export interface HotelOffer {
  hotelId: number; name: string; stars: number | null; rating: number | null;
  priceFrom: number; priceAvg: number | null; currency: string; nights: number;
  photoUrl: string; deepLink: string;
}

export function normalizeHotelOffers(
  rows: Array<Record<string, unknown>>,
  ctx: { checkIn: string; checkOut: string; adults: number; currency: string; marker: string },
): HotelOffer[] {
  const nights = nightsBetween(ctx.checkIn, ctx.checkOut);
  return rows
    .filter((r) => r.hotelId != null && Number(r.priceFrom ?? 0) > 0)
    .map((r) => {
      const hotelId = Number(r.hotelId);
      return {
        hotelId,
        name: String(r.hotelName ?? 'Hotel'),
        stars: r.stars != null ? Number(r.stars) : null,
        rating: r.rating != null ? Number(r.rating) : null,
        priceFrom: Number(r.priceFrom),
        priceAvg: r.priceAvg != null ? Number(r.priceAvg) : null,
        currency: ctx.currency,
        nights,
        photoUrl: `https://photo.hotellook.com/image_v2/limit/h${hotelId}_1/800/520.auto`,
        deepLink: buildHotelDeepLink({ hotelId, ...ctx }),
      };
    });
}

// ── Upstream fetchers (network; not unit-tested) ──

export async function fetchFlightPrices(p: {
  origin: string; destination?: string; departureAt: string; returnAt?: string | null;
  currency: string; token: string; limit?: number;
}): Promise<Array<Record<string, unknown>>> {
  const q = new URLSearchParams({
    origin: p.origin,
    destination: p.destination ?? 'DXB',
    departure_at: p.departureAt,
    currency: p.currency,
    sorting: 'price',
    limit: String(p.limit ?? 30),
    one_way: p.returnAt ? 'false' : 'true',
    token: p.token,
  });
  if (p.returnAt) q.set('return_at', p.returnAt);
  const res = await fetch(`${FLIGHTS_API}?${q.toString()}`);
  if (!res.ok) throw new Error(`travelpayouts flights HTTP ${res.status}`);
  const json = await res.json();
  if (!json.success) throw new Error(`travelpayouts flights error: ${JSON.stringify(json.error ?? json)}`);
  return json.data ?? [];
}

export async function fetchHotelPrices(p: {
  location?: string; checkIn: string; checkOut: string; adults?: number;
  currency: string; token: string; limit?: number;
}): Promise<Array<Record<string, unknown>>> {
  const q = new URLSearchParams({
    location: p.location ?? 'Dubai',
    checkIn: p.checkIn,
    checkOut: p.checkOut,
    adults: String(p.adults ?? 2),
    currency: p.currency,
    limit: String(p.limit ?? 25),
    token: p.token,
  });
  const res = await fetch(`${HOTELS_API}?${q.toString()}`);
  if (!res.ok) throw new Error(`hotellook HTTP ${res.status}`);
  const json = await res.json();
  if (!Array.isArray(json)) throw new Error(`hotellook error: ${JSON.stringify(json)}`);
  return json;
}
```

- [ ] **Step 5: Run tests to verify they pass**

Run: `deno test supabase/functions/_shared/`
Expected: all tests PASS. (Skip with a note if Deno is unavailable.)

- [ ] **Step 6: Commit**

```bash
git add supabase/functions/_shared/
git commit -m "feat: shared Travelpayouts helpers for edge functions"
```

---

### Task 3: `travel-search` Edge Function

**Files:**
- Create: `supabase/functions/travel-search/index.ts`

- [ ] **Step 1: Implement**

```ts
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import {
  validateFlightParams, validateHotelParams,
  normalizeFlightOffers, normalizeHotelOffers,
  fetchFlightPrices, fetchHotelPrices,
} from '../_shared/travelpayouts.ts';

const db = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);
const TOKEN = Deno.env.get('TRAVELPAYOUTS_TOKEN') ?? '';
const MARKER = Deno.env.get('TRAVELPAYOUTS_MARKER') ?? '';

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });

function logSearch(searchType: string, params: unknown, resultsCount: number, cacheHit: boolean, sessionId: string | null) {
  // fire-and-forget; never block or fail the response on analytics
  db.from('travel_searches')
    .insert({ search_type: searchType, params, results_count: resultsCount, cache_hit: cacheHit, session_id: sessionId })
    .then(({ error }) => { if (error) console.error('travel_searches insert failed:', error.message); });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return json({ error: 'POST only' }, 405);
  if (!TOKEN || !MARKER) return json({ error: 'server_not_configured', message: 'Travelpayouts secrets missing' }, 500);

  let body: Record<string, unknown>;
  try { body = await req.json(); } catch { return json({ error: 'invalid_json' }, 400); }
  const sessionId = typeof body.sessionId === 'string' ? body.sessionId : null;

  try {
    if (body.type === 'flights') {
      const origin = String(body.origin ?? '').toUpperCase();
      const departDate = String(body.departDate ?? '');
      const returnDate = body.returnDate ? String(body.returnDate) : null;
      const currency = (typeof body.currency === 'string' ? body.currency : 'usd').toLowerCase();

      const v = validateFlightParams({ origin, departDate, returnDate });
      if (!v.ok) return json({ error: 'invalid_params', message: v.error }, 400);

      let q = db.from('flight_price_cache').select('*')
        .eq('origin', origin).eq('destination', 'DXB')
        .eq('depart_date', departDate).eq('currency', currency);
      q = returnDate ? q.eq('return_date', returnDate) : q.is('return_date', null);
      const { data: cached } = await q.maybeSingle();

      if (cached && new Date(cached.expires_at) > new Date()) {
        logSearch('flights', { origin, departDate, returnDate, currency }, cached.results.length, true, sessionId);
        return json({ type: 'flights', offers: cached.results, currency, cacheHit: true, stale: false, fetchedAt: cached.fetched_at });
      }

      let offers;
      try {
        const rows = await fetchFlightPrices({ origin, departureAt: departDate, returnAt: returnDate, currency, token: TOKEN });
        offers = normalizeFlightOffers(rows, { currency, marker: MARKER });
      } catch (err) {
        console.error('upstream flights failed:', err);
        if (cached) {
          logSearch('flights', { origin, departDate, returnDate, currency }, cached.results.length, true, sessionId);
          return json({ type: 'flights', offers: cached.results, currency, cacheHit: true, stale: true, fetchedAt: cached.fetched_at });
        }
        return json({ error: 'upstream_unavailable' }, 502);
      }

      const row = {
        origin, destination: 'DXB', depart_date: departDate, return_date: returnDate, currency,
        results: offers, fetched_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 60_000).toISOString(),
      };
      const write = cached
        ? db.from('flight_price_cache').update(row).eq('id', cached.id)
        : db.from('flight_price_cache').insert(row);
      const { error: writeErr } = await write;
      if (writeErr) console.error('flight cache write failed:', writeErr.message);

      logSearch('flights', { origin, departDate, returnDate, currency }, offers.length, false, sessionId);
      return json({ type: 'flights', offers, currency, cacheHit: false, stale: false, fetchedAt: row.fetched_at });
    }

    if (body.type === 'hotels') {
      const checkIn = String(body.checkIn ?? '');
      const checkOut = String(body.checkOut ?? '');
      const adults = Number(body.adults ?? 2);
      const currency = (typeof body.currency === 'string' ? body.currency : 'aed').toLowerCase();

      const v = validateHotelParams({ checkIn, checkOut, adults });
      if (!v.ok) return json({ error: 'invalid_params', message: v.error }, 400);

      const { data: cached } = await db.from('hotel_price_cache').select('*')
        .eq('location', 'Dubai').eq('check_in', checkIn).eq('check_out', checkOut)
        .eq('adults', adults).eq('currency', currency).maybeSingle();

      if (cached && new Date(cached.expires_at) > new Date()) {
        logSearch('hotels', { checkIn, checkOut, adults, currency }, cached.results.length, true, sessionId);
        return json({ type: 'hotels', offers: cached.results, currency, cacheHit: true, stale: false, fetchedAt: cached.fetched_at });
      }

      let offers;
      try {
        const rows = await fetchHotelPrices({ checkIn, checkOut, adults, currency, token: TOKEN });
        offers = normalizeHotelOffers(rows, { checkIn, checkOut, adults, currency, marker: MARKER });
        offers.sort((a, b) => a.priceFrom - b.priceFrom);
      } catch (err) {
        console.error('upstream hotels failed:', err);
        if (cached) {
          logSearch('hotels', { checkIn, checkOut, adults, currency }, cached.results.length, true, sessionId);
          return json({ type: 'hotels', offers: cached.results, currency, cacheHit: true, stale: true, fetchedAt: cached.fetched_at });
        }
        return json({ error: 'upstream_unavailable' }, 502);
      }

      const row = {
        location: 'Dubai', check_in: checkIn, check_out: checkOut, adults, currency,
        results: offers, fetched_at: new Date().toISOString(),
        expires_at: new Date(Date.now() + 30 * 60_000).toISOString(),
      };
      const { error: writeErr } = await db.from('hotel_price_cache')
        .upsert(row, { onConflict: 'location,check_in,check_out,adults,currency' });
      if (writeErr) console.error('hotel cache write failed:', writeErr.message);

      logSearch('hotels', { checkIn, checkOut, adults, currency }, offers.length, false, sessionId);
      return json({ type: 'hotels', offers, currency, cacheHit: false, stale: false, fetchedAt: row.fetched_at });
    }

    return json({ error: 'invalid_params', message: "type must be 'flights' or 'hotels'" }, 400);
  } catch (err) {
    console.error('travel-search fatal:', err);
    return json({ error: 'internal' }, 500);
  }
});
```

- [ ] **Step 2: Commit**

```bash
git add supabase/functions/travel-search/
git commit -m "feat: travel-search edge function (cache-first Travelpayouts proxy)"
```

---

### Task 4: `refresh-prices` Edge Function + config

**Files:**
- Create: `supabase/functions/refresh-prices/index.ts`
- Modify: `supabase/config.toml` (append function config)

- [ ] **Step 1: Implement**

```ts
import { createClient } from 'npm:@supabase/supabase-js@2';
import { corsHeaders } from '../_shared/cors.ts';
import {
  fetchFlightPrices, fetchHotelPrices,
  normalizeFlightOffers, normalizeHotelOffers,
} from '../_shared/travelpayouts.ts';

const db = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
);
const TOKEN = Deno.env.get('TRAVELPAYOUTS_TOKEN') ?? '';
const MARKER = Deno.env.get('TRAVELPAYOUTS_MARKER') ?? '';
const CRON_SECRET = Deno.env.get('CRON_SECRET') ?? '';

const ORIGINS = [
  { code: 'LHR', city: 'London',    cc: 'GB' },
  { code: 'JFK', city: 'New York',  cc: 'US' },
  { code: 'CDG', city: 'Paris',     cc: 'FR' },
  { code: 'BOM', city: 'Mumbai',    cc: 'IN' },
  { code: 'SIN', city: 'Singapore', cc: 'SG' },
  { code: 'YYZ', city: 'Toronto',   cc: 'CA' },
  { code: 'SYD', city: 'Sydney',    cc: 'AU' },
  { code: 'FRA', city: 'Frankfurt', cc: 'DE' },
  { code: 'IST', city: 'Istanbul',  cc: 'TR' },
  { code: 'DEL', city: 'New Delhi', cc: 'IN' },
  { code: 'RUH', city: 'Riyadh',    cc: 'SA' },
  { code: 'CAI', city: 'Cairo',     cc: 'EG' },
];
const FLIGHT_CURRENCY = 'usd';
const HOTEL_CURRENCY = 'aed';

function monthStr(offsetMonths: number): string {
  const d = new Date();
  d.setUTCDate(1);
  d.setUTCMonth(d.getUTCMonth() + offsetMonths);
  return d.toISOString().slice(0, 7); // YYYY-MM — prices_for_dates accepts whole months
}

function dateStr(offsetDays: number): string {
  return new Date(Date.now() + offsetDays * 86_400_000).toISOString().slice(0, 10);
}

async function refreshRoutes(): Promise<{ updated: number; failed: string[] }> {
  let updated = 0;
  const failed: string[] = [];
  for (const o of ORIGINS) {
    try {
      // cheapest fare this month, falling back to next month near month-end
      let rows = await fetchFlightPrices({ origin: o.code, departureAt: monthStr(0), currency: FLIGHT_CURRENCY, token: TOKEN, limit: 1 });
      if (!rows.length) {
        rows = await fetchFlightPrices({ origin: o.code, departureAt: monthStr(1), currency: FLIGHT_CURRENCY, token: TOKEN, limit: 1 });
      }
      if (!rows.length) { failed.push(`${o.code}: no fares`); continue; }
      const [offer] = normalizeFlightOffers(rows, { currency: FLIGHT_CURRENCY, marker: MARKER });
      const { error } = await db.from('popular_routes').upsert({
        origin_code: o.code, origin_city: o.city, country_code: o.cc,
        airline_iata: offer.airlineIata, price: offer.price, currency: FLIGHT_CURRENCY,
        departure_at: offer.departureAt, transfers: offer.transfers,
        duration_minutes: offer.durationMinutes, deep_link: offer.deepLink,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'origin_code' });
      if (error) failed.push(`${o.code}: ${error.message}`); else updated++;
    } catch (err) {
      failed.push(`${o.code}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
  return { updated, failed };
}

async function refreshHotels(): Promise<{ updated: number; error?: string }> {
  const checkIn = dateStr(30);
  const checkOut = dateStr(33);
  try {
    const rows = await fetchHotelPrices({ checkIn, checkOut, adults: 2, currency: HOTEL_CURRENCY, token: TOKEN, limit: 40 });
    const offers = normalizeHotelOffers(rows, { checkIn, checkOut, adults: 2, currency: HOTEL_CURRENCY, marker: MARKER })
      .filter((h) => (h.stars ?? 0) >= 3)
      .sort((a, b) => (b.stars ?? 0) - (a.stars ?? 0) || a.priceFrom - b.priceFrom)
      .slice(0, 12);
    let updated = 0;
    for (const h of offers) {
      const { error } = await db.from('featured_hotels').upsert({
        hotel_id: h.hotelId, name: h.name, stars: h.stars, rating: h.rating,
        price_from: h.priceFrom, price_avg: h.priceAvg, currency: HOTEL_CURRENCY,
        photo_url: h.photoUrl, location_label: 'Dubai', deep_link: h.deepLink,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'hotel_id' });
      if (!error) updated++;
    }
    return { updated };
  } catch (err) {
    return { updated: 0, error: err instanceof Error ? err.message : String(err) };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (!CRON_SECRET || req.headers.get('x-cron-secret') !== CRON_SECRET) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  if (!TOKEN || !MARKER) {
    return new Response(JSON.stringify({ error: 'server_not_configured' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
  const [routes, hotels] = await Promise.all([refreshRoutes(), refreshHotels()]);
  console.log('refresh-prices:', JSON.stringify({ routes, hotels }));
  return new Response(JSON.stringify({ ok: true, routes, hotels }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  });
});
```

- [ ] **Step 2: Append to `supabase/config.toml`**

```toml

[functions.refresh-prices]
# Called by pg_cron, not browsers — auth is the x-cron-secret header instead of a JWT.
verify_jwt = false
```

- [ ] **Step 3: Commit**

```bash
git add supabase/functions/refresh-prices/ supabase/config.toml
git commit -m "feat: refresh-prices edge function for nightly route/hotel price refresh"
```

---

### Task 5: Deploy the functions

- [ ] **Step 1: Deploy**

Run: `supabase functions deploy travel-search refresh-prices`
Expected: both functions deployed. (If CLI auth fails, add the command to the runbook in Task 10 and continue.)
Note: the functions return `server_not_configured` until the user sets secrets — that's fine; UI handles the error state.

---

### Task 6: Frontend API module

**Files:**
- Create: `src/lib/travelApi.js`

- [ ] **Step 1: Implement**

```js
import { supabase } from './supabase';

export const FLIGHT_CURRENCY = 'usd';
export const HOTEL_CURRENCY = 'aed';

// Public affiliate ID (it appears in every partner URL) — safe in the client.
const MARKER = import.meta.env.VITE_TRAVELPAYOUTS_MARKER || '';

export const AIRLINE_NAMES = {
  EK: 'Emirates', FZ: 'flydubai', EY: 'Etihad Airways', QR: 'Qatar Airways',
  BA: 'British Airways', VS: 'Virgin Atlantic', AF: 'Air France', LH: 'Lufthansa',
  TK: 'Turkish Airlines', SQ: 'Singapore Airlines', AI: 'Air India', '6E': 'IndiGo',
  UK: 'Vistara', AA: 'American Airlines', UA: 'United Airlines', DL: 'Delta',
  AC: 'Air Canada', QF: 'Qantas', SV: 'Saudia', MS: 'EgyptAir', GF: 'Gulf Air',
  WY: 'Oman Air', KU: 'Kuwait Airways', PK: 'PIA', KL: 'KLM', IB: 'Iberia',
};

const CITY_TO_IATA = {
  london: 'LHR', 'new york': 'JFK', paris: 'CDG', mumbai: 'BOM',
  singapore: 'SIN', toronto: 'YYZ', sydney: 'SYD', frankfurt: 'FRA',
  istanbul: 'IST', 'new delhi': 'DEL', delhi: 'DEL', riyadh: 'RUH',
  cairo: 'CAI', manchester: 'MAN', 'los angeles': 'LAX', chicago: 'ORD',
  amsterdam: 'AMS', madrid: 'MAD', rome: 'FCO', moscow: 'SVO',
};

/** "London (LHR)" → "LHR"; "london" → "LHR"; "lhr" → "LHR"; unknown → null */
export function originToIata(label) {
  if (!label) return null;
  const paren = label.match(/\(([A-Za-z]{3})\)/);
  if (paren) return paren[1].toUpperCase();
  const cleaned = label.trim().toLowerCase();
  if (CITY_TO_IATA[cleaned]) return CITY_TO_IATA[cleaned];
  if (/^[A-Za-z]{3}$/.test(cleaned)) return cleaned.toUpperCase();
  return null;
}

export function getSessionId() {
  let id = localStorage.getItem('ttd_session_id');
  if (!id) {
    id = (crypto.randomUUID ? crypto.randomUUID() : `s-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    localStorage.setItem('ttd_session_id', id);
  }
  return id;
}

const CURRENCY_SYMBOL = { usd: '$', eur: '€', gbp: '£', aed: 'AED ' };
export function fmtPrice(price, currency) {
  const sym = CURRENCY_SYMBOL[(currency || '').toLowerCase()] ?? `${(currency || '').toUpperCase()} `;
  return `${sym}${Math.round(Number(price)).toLocaleString()}`;
}

export function fmtDuration(minutes) {
  if (minutes == null) return '';
  return `${Math.floor(minutes / 60)}h ${String(minutes % 60).padStart(2, '0')}m`;
}

export function airlineLogo(iata) {
  return `https://pics.avs.io/96/32/${iata}.png`;
}

// ── Search (via Edge Function) ──

async function invokeTravelSearch(body) {
  const { data, error } = await supabase.functions.invoke('travel-search', {
    body: { ...body, sessionId: getSessionId() },
  });
  if (error) {
    // FunctionsHttpError carries the response; surface our error codes
    let code = 'unknown';
    try { code = (await error.context?.json())?.error ?? 'unknown'; } catch { /* keep 'unknown' */ }
    const e = new Error(code);
    e.code = code;
    throw e;
  }
  return data;
}

export function searchFlights({ originCode, departDate, returnDate }) {
  return invokeTravelSearch({
    type: 'flights', origin: originCode, departDate,
    returnDate: returnDate || null, currency: FLIGHT_CURRENCY,
  });
}

export function searchHotels({ checkIn, checkOut, adults }) {
  return invokeTravelSearch({
    type: 'hotels', checkIn, checkOut, adults, currency: HOTEL_CURRENCY,
  });
}

// ── Cached content for decorative sections ──

export async function getPopularRoutes() {
  const { data } = await supabase.from('popular_routes').select('*').order('price');
  return data ?? [];
}

export async function getFeaturedHotels() {
  const { data } = await supabase.from('featured_hotels').select('*')
    .order('stars', { ascending: false }).order('price_from');
  return data ?? [];
}

// ── Affiliate click tracking + handoff ──

export function openAffiliate({ clickType, itemLabel, partnerUrl, price, currency, searchParams }) {
  // open synchronously so popup blockers treat it as a user gesture
  window.open(partnerUrl, '_blank', 'noopener');
  supabase.from('affiliate_clicks').insert({
    click_type: clickType,
    item_label: itemLabel ?? null,
    partner_url: partnerUrl,
    price: price ?? null,
    currency: currency ?? null,
    search_params: searchParams ?? null,
    session_id: getSessionId(),
    referrer: document.referrer || null,
  }).then(({ error }) => { if (error) console.error('click log failed:', error.message); });
}

/** Fallback CTA when the API is down/empty — still affiliate-attributed. */
export function aviasalesFallbackLink({ originCode, departDate, returnDate }) {
  const ddmm = (d) => `${d.slice(8, 10)}${d.slice(5, 7)}`;
  const search = originCode && departDate
    ? `${originCode}${ddmm(departDate)}DXB${returnDate ? ddmm(returnDate) : ''}1`
    : 'DXB';
  return `https://www.aviasales.com/search/${search}?marker=${encodeURIComponent(MARKER)}`;
}

export function hotellookFallbackLink({ checkIn, checkOut, adults }) {
  const q = new URLSearchParams({ destination: 'Dubai', marker: MARKER });
  if (checkIn) q.set('checkIn', checkIn);
  if (checkOut) q.set('checkOut', checkOut);
  if (adults) q.set('adults', String(adults));
  return `https://search.hotellook.com/hotels?${q.toString()}`;
}
```

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: build succeeds (module is importable; nothing uses it yet).

- [ ] **Step 3: Commit**

```bash
git add src/lib/travelApi.js
git commit -m "feat: travel API client (edge function search, click tracking, deep links)"
```

---

### Task 7: Search results component

**Files:**
- Create: `src/components/travel/TravelSearchResults.jsx`

Presentational component. Props:
`{ state, onBook, fallbackUrl }` where `state = { status: 'loading'|'success'|'error', type: 'flights'|'hotels', offers, stale, message, meta }`.

- [ ] **Step 1: Implement**

```jsx
import { fmtPrice, fmtDuration, airlineLogo } from '../../lib/travelApi';

const skeletonCSS = `
  @keyframes ttdPulse { 0%,100% { opacity: 0.55; } 50% { opacity: 1; } }
  .ttd-skel { animation: ttdPulse 1.4s ease-in-out infinite; background: #eee; border-radius: 8px; }
  .ttd-result-card { transition: box-shadow 0.2s ease, transform 0.2s ease; }
  .ttd-result-card:hover { box-shadow: 0 2px 4px rgba(0,0,0,0.08), 0 12px 28px rgba(0,0,0,0.12); transform: translateY(-2px); }
`;

const fmtTime = (iso) => iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
const fmtDay  = (iso) => iso ? new Date(iso).toLocaleDateString([], { day: 'numeric', month: 'short' }) : '';

function StopsBadge({ transfers }) {
  const nonstop = transfers === 0;
  return (
    <span style={{
      background: nonstop ? 'rgba(13,148,136,0.08)' : '#f5f5f5',
      color: nonstop ? '#0D9488' : '#717171',
      fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '20px',
      border: `1px solid ${nonstop ? 'rgba(13,148,136,0.2)' : '#e5e5e5'}`,
    }}>
      {nonstop ? 'Nonstop' : `${transfers} stop${transfers > 1 ? 's' : ''}`}
    </span>
  );
}

function FlightCard({ offer, onBook }) {
  return (
    <div className="ttd-result-card" style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: '16px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 200px', minWidth: 0 }}>
        <img src={airlineLogo(offer.airlineIata)} alt={offer.airlineName} style={{ width: '72px', height: '24px', objectFit: 'contain', flexShrink: 0 }}
          onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '14px', color: '#222', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{offer.airlineName}</div>
          <div style={{ fontSize: '12px', color: '#717171' }}>{offer.airlineIata} {offer.flightNumber}</div>
        </div>
      </div>
      <div style={{ flex: '1 1 180px', textAlign: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: '15px', color: '#222' }}>
          {fmtDay(offer.departureAt)} · {fmtTime(offer.departureAt)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px' }}>
          {offer.durationMinutes != null && <span style={{ fontSize: '12px', color: '#717171' }}>{fmtDuration(offer.durationMinutes)}</span>}
          <StopsBadge transfers={offer.transfers} />
        </div>
        {offer.returnAt && (
          <div style={{ fontSize: '12px', color: '#717171', marginTop: '4px' }}>Return {fmtDay(offer.returnAt)}</div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '0 0 auto', marginLeft: 'auto' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '10px', color: '#717171', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>from</div>
          <div style={{ fontWeight: 800, fontSize: '22px', color: '#222', letterSpacing: '-0.02em' }}>{fmtPrice(offer.price, offer.currency)}</div>
        </div>
        <button onClick={() => onBook(offer)} style={{ padding: '11px 22px', background: 'linear-gradient(135deg, #b1132f, #8e0f26)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(177,19,47,0.3)', whiteSpace: 'nowrap' }}>
          Book →
        </button>
      </div>
    </div>
  );
}

function HotelCard({ offer, onBook }) {
  const perNight = offer.nights > 0 ? offer.priceFrom / offer.nights : offer.priceFrom;
  return (
    <div className="ttd-result-card" style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: '150px', background: '#f0f0f0' }}>
        <img src={offer.photoUrl} alt={offer.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => { e.currentTarget.style.display = 'none'; }} />
      </div>
      <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
          <div style={{ fontWeight: 700, fontSize: '14px', color: '#222', lineHeight: 1.3 }}>{offer.name}</div>
          {offer.stars ? <span style={{ color: '#C9A050', fontSize: '12px', whiteSpace: 'nowrap', flexShrink: 0 }}>{'★'.repeat(offer.stars)}</span> : null}
        </div>
        <div style={{ marginTop: 'auto', paddingTop: '12px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '18px', color: '#b1132f', letterSpacing: '-0.02em' }}>{fmtPrice(perNight, offer.currency)}<span style={{ fontSize: '12px', color: '#717171', fontWeight: 500 }}> / night</span></div>
            <div style={{ fontSize: '11px', color: '#717171', marginTop: '2px' }}>{fmtPrice(offer.priceFrom, offer.currency)} total · {offer.nights} night{offer.nights !== 1 ? 's' : ''}</div>
          </div>
          <button onClick={() => onBook(offer)} style={{ padding: '10px 18px', background: 'linear-gradient(135deg, #b1132f, #8e0f26)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            Book →
          </button>
        </div>
      </div>
    </div>
  );
}

function Skeletons({ type }) {
  if (type === 'hotels') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ border: '1px solid #ebebeb', borderRadius: '16px', overflow: 'hidden' }}>
            <div className="ttd-skel" style={{ height: '150px', borderRadius: 0 }} />
            <div style={{ padding: '14px 16px' }}>
              <div className="ttd-skel" style={{ height: '14px', width: '70%', marginBottom: '10px' }} />
              <div className="ttd-skel" style={{ height: '20px', width: '40%' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{ border: '1px solid #ebebeb', borderRadius: '16px', padding: '18px 20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div className="ttd-skel" style={{ height: '24px', width: '90px' }} />
          <div className="ttd-skel" style={{ height: '16px', flex: 1, maxWidth: '220px' }} />
          <div className="ttd-skel" style={{ height: '28px', width: '90px', marginLeft: 'auto' }} />
        </div>
      ))}
    </div>
  );
}

export default function TravelSearchResults({ state, onBook, fallbackUrl, onFallbackClick }) {
  if (!state || state.status === 'idle') return null;
  const { status, type, offers = [], stale, meta } = state;
  const title = type === 'hotels' ? 'Hotels in Dubai' : `Flights to Dubai${meta?.originLabel ? ` from ${meta.originLabel}` : ''}`;

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '40px 24px 8px' }}>
      <style>{skeletonCSS}</style>
      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: 'clamp(20px,3vw,26px)', color: '#222', letterSpacing: '-0.025em', margin: '0 0 4px' }}>{title}</h2>
        <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>
          We may earn a commission when you book through links on this page, at no extra cost to you.
        </p>
      </div>

      {stale && status === 'success' && (
        <div style={{ background: 'rgba(201,160,80,0.08)', border: '1px solid rgba(201,160,80,0.3)', color: '#A07830', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', marginBottom: '16px' }}>
          Live prices are temporarily unavailable — showing recently cached fares. Final prices are confirmed on the booking site.
        </div>
      )}

      {status === 'loading' && <Skeletons type={type} />}

      {status === 'success' && offers.length > 0 && (
        type === 'hotels' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
            {offers.map((o) => <HotelCard key={o.hotelId} offer={o} onBook={onBook} />)}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {offers.map((o, i) => <FlightCard key={`${o.airlineIata}-${o.flightNumber}-${o.departureAt}-${i}`} offer={o} onBook={onBook} />)}
          </div>
        )
      )}

      {(status === 'error' || (status === 'success' && offers.length === 0)) && (
        <div style={{ textAlign: 'center', border: '1px dashed #ddd', borderRadius: '16px', padding: '40px 24px' }}>
          <div style={{ fontWeight: 700, fontSize: '16px', color: '#222', marginBottom: '6px' }}>
            {status === 'error' ? "We couldn't load prices right now" : 'No cached fares for these dates yet'}
          </div>
          <div style={{ fontSize: '13px', color: '#717171', marginBottom: '18px' }}>
            {type === 'hotels' ? 'Check live hotel prices for your dates on our partner site.' : 'Check live prices for this route on our partner site.'}
          </div>
          <button onClick={onFallbackClick} style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #b1132f, #8e0f26)', color: '#fff', border: 'none', borderRadius: '24px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
            {type === 'hotels' ? 'Search hotels on Hotellook →' : 'Search flights on Aviasales →'}
          </button>
        </div>
      )}
    </div>
  );
}
```

(Note: `fallbackUrl` is consumed by the parent's `onFallbackClick`, which both opens it and logs the click — the component itself stays presentation-only. Remove the unused prop if the parent doesn't need it passed down.)

- [ ] **Step 2: Verify build**

Run: `npm run build`
Expected: success.

- [ ] **Step 3: Commit**

```bash
git add src/components/travel/TravelSearchResults.jsx
git commit -m "feat: travel search results component (flights/hotels cards, states)"
```

---

### Task 8: Wire up search on PlanTripPage

**Files:**
- Modify: `src/pages/PlanTripPage.jsx`

- [ ] **Step 1: Add imports and state**

At the top of the file (after existing imports):

```jsx
import { useState, useEffect, useRef } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';
import TravelSearchResults from '../components/travel/TravelSearchResults';
import {
  searchFlights, searchHotels, originToIata, openAffiliate,
  aviasalesFallbackLink, hotellookFallbackLink,
} from '../lib/travelApi';
```

Inside `PlanTripPage()` (next to existing state, around line 346):

```jsx
  /* Live search */
  const [searchState, setSearchState] = useState({ status: 'idle' });
  const [formError, setFormError] = useState('');
  const resultsRef = useRef(null);
```

- [ ] **Step 2: Add the search handler** (inside the component, after `swapCities`)

```jsx
  async function handleSearch() {
    setFormError('');
    const isHotels = tab === 'hotels';

    if (isHotels) {
      if (!checkIn || !checkOut) { setFormError('Please pick check-in and check-out dates.'); return; }
      if (checkOut <= checkIn) { setFormError('Check-out must be after check-in.'); return; }
    } else {
      // flights & packages share the flight form; multi-city searches as round trip
      const originCode = originToIata(from);
      if (!originCode) { setFormError('Please choose an origin city or enter an airport code (e.g. LHR).'); return; }
      if (!depart) { setFormError('Please pick a departure date.'); return; }
      if (tripType === 'round' && ret && ret < depart) { setFormError('Return date must be after departure.'); return; }
    }

    const type = isHotels ? 'hotels' : 'flights';
    const meta = isHotels
      ? { checkIn, checkOut, adults: hGuests }
      : { originCode: originToIata(from), originLabel: from.split('(')[0].trim(), departDate: depart, returnDate: tripType === 'round' ? (ret || null) : null };

    setSearchState({ status: 'loading', type, meta });
    setTimeout(() => resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);

    try {
      const data = isHotels
        ? await searchHotels({ checkIn, checkOut, adults: hGuests })
        : await searchFlights({ originCode: meta.originCode, departDate: depart, returnDate: meta.returnDate });
      setSearchState({ status: 'success', type, offers: data.offers, stale: data.stale, meta });
    } catch (err) {
      console.error('travel search failed:', err);
      setSearchState({ status: 'error', type, meta });
    }
  }

  function handleBook(offer) {
    const isHotels = searchState.type === 'hotels';
    openAffiliate({
      clickType: isHotels ? 'hotel_result' : 'flight_result',
      itemLabel: isHotels ? offer.name : `${searchState.meta?.originCode || ''}→DXB ${offer.airlineIata}${offer.flightNumber}`,
      partnerUrl: offer.deepLink,
      price: isHotels ? offer.priceFrom : offer.price,
      currency: offer.currency,
      searchParams: searchState.meta,
    });
  }

  function handleFallbackClick() {
    const isHotels = searchState.type === 'hotels';
    const url = isHotels ? hotellookFallbackLink(searchState.meta || {}) : aviasalesFallbackLink(searchState.meta || {});
    openAffiliate({ clickType: 'fallback_cta', itemLabel: isHotels ? 'hotellook fallback' : 'aviasales fallback', partnerUrl: url, searchParams: searchState.meta });
  }
```

- [ ] **Step 3: Wire the desktop Search button** (the button inside `SearchPillDesktop`, ~line 518)

Change `<button style={{ height:'48px', …` to `<button onClick={handleSearch} style={{ height:'48px', …` (add the onClick only; styles unchanged).

- [ ] **Step 4: Wire the mobile Search button** (~line 594)

Same: add `onClick={handleSearch}` to the mobile `Search {tab === …}` button.

- [ ] **Step 5: Show form errors under the search UI**

Immediately after `{isMobile ? SearchCardMobile : SearchPillDesktop}` (~line 689) add:

```jsx
            {formError && (
              <div style={{ marginTop:'10px', textAlign:'center' }}>
                <span style={{ display:'inline-block', background:'rgba(177,19,47,0.08)', border:'1px solid rgba(177,19,47,0.25)', color:'#b1132f', borderRadius:'20px', padding:'6px 16px', fontSize:'13px', fontWeight:600 }}>{formError}</span>
              </div>
            )}
```

- [ ] **Step 6: Render the results section**

Right after the HERO closing `</div>` (~line 692), before the CATEGORY BAR comment block, add:

```jsx
        {/* ═══════════════════════════════════════
            LIVE SEARCH RESULTS
        ═══════════════════════════════════════ */}
        <div ref={resultsRef} style={{ scrollMarginTop: '80px' }}>
          <TravelSearchResults state={searchState} onBook={handleBook} onFallbackClick={handleFallbackClick} />
        </div>
```

- [ ] **Step 7: Verify build + manual check**

Run: `npm run build` → success.
Run dev server, open /plan-trip: clicking Search with empty form shows the validation pill; with a filled form it shows skeletons then the error-state card (expected until secrets are set — the fallback CTA must render).

- [ ] **Step 8: Commit**

```bash
git add src/pages/PlanTripPage.jsx
git commit -m "feat: live flight/hotel search on Plan Trip page"
```

---

### Task 9: Live data for Popular Routes & Deals + click-through

**Files:**
- Modify: `src/pages/PlanTripPage.jsx`

- [ ] **Step 1: Extend imports**

Add to the `travelApi` import in `PlanTripPage.jsx`:

```jsx
import {
  searchFlights, searchHotels, originToIata, openAffiliate,
  aviasalesFallbackLink, hotellookFallbackLink,
  getPopularRoutes, getFeaturedHotels, fmtPrice, fmtDuration, AIRLINE_NAMES,
} from '../lib/travelApi';
```

- [ ] **Step 2: Load live routes/hotels** (inside the component, with the other state)

```jsx
  /* Live decorative sections (fall back to curated data while tables are empty) */
  const [liveRoutes, setLiveRoutes] = useState(null);
  const [liveHotels, setLiveHotels] = useState(null);
  useEffect(() => {
    getPopularRoutes().then(rows => { if (rows.length) setLiveRoutes(rows); }).catch(() => {});
    getFeaturedHotels().then(rows => { if (rows.length) setLiveHotels(rows); }).catch(() => {});
  }, []);

  const GRADS = ['#0b1829', '#180b0b', '#0b1810', '#1a120a', '#0a1518', '#0f1408'];
  const routeCards = liveRoutes
    ? liveRoutes.slice(0, 6).map((r, i) => ({
        from: r.origin_city, code: r.origin_code, cc: r.country_code,
        airline: AIRLINE_NAMES[r.airline_iata] || r.airline_iata || '—',
        duration: fmtDuration(r.duration_minutes), price: fmtPrice(r.price, r.currency),
        nonstop: r.transfers === 0, grad: GRADS[i % GRADS.length], deepLink: r.deep_link, live: true,
      }))
    : ROUTES;

  function handleRouteClick(r) {
    if (r.live && r.deepLink) {
      openAffiliate({ clickType: 'route_card', itemLabel: `${r.code}→DXB`, partnerUrl: r.deepLink, currency: null, searchParams: { origin: r.code } });
    } else {
      // curated fallback card: prefill the search form instead of inventing a link
      setTab('flights');
      setFrom(`${r.from} (${r.code})`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  const dealCards = liveHotels
    ? liveHotels.slice(0, 3).map(h => ({
        type: 'Hotel', title: h.name,
        sub: `${h.stars ? `${h.stars}-star` : 'Top'} hotel · 3 nights from`,
        price: fmtPrice(h.price_from, h.currency), orig: null,
        badge: h.stars >= 5 ? 'Luxury' : 'Great Value', bc: h.stars >= 5 ? '#A07830' : '#0D9488',
        tags: [h.stars ? `${h.stars}-star` : 'Hotel', h.location_label || 'Dubai'],
        rating: h.rating, rev: null, img: h.photo_url, expires: null, deepLink: h.deep_link, live: true,
      }))
    : DEALS;

  function handleDealClick(deal) {
    if (deal.live && deal.deepLink) {
      openAffiliate({ clickType: 'deal_card', itemLabel: deal.title, partnerUrl: deal.deepLink, searchParams: null });
    } else {
      setTab('hotels');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }
```

- [ ] **Step 3: Make `RouteCard` and `DealCard` click-aware and honest**

`RouteCard`: accept `onClick` — `function RouteCard({ r, onClick })` and add `onClick={() => onClick?.(r)}` to the root div. Remove the fabricated `Save {r.saves}` badge (delete that `<span>`; keep Nonstop). In the grid render: `{routeCards.map((r, i) => <RouteCard key={r.code || i} r={r} onClick={handleRouteClick} />)}`.

`DealCard`: accept `onClick` — `function DealCard({ deal, onClick })`.
- Countdown: render `{deal.expires != null && <CountdownTimer expires={deal.expires} />}`.
- Strikethrough orig: `{deal.orig && <span style={{…line-through…}}>{deal.orig}</span>}`.
- Rating row: `{deal.rating != null && (<div …><Ico.Star /><span …>{deal.rating}</span>{deal.rev && <span …>({deal.rev})</span>}</div>)}`.
- Book Now button: add `onClick={(e) => { e.stopPropagation(); onClick?.(deal); }}`.
- Grid render: `{dealCards.map((deal, i) => <DealCard key={deal.title || i} deal={deal} onClick={handleDealClick} />)}`.

- [ ] **Step 4: Update the Deals section subtitle to match reality**

In the Exclusive Deals `SectionHead`, change `sub="Hand-picked offers — refreshed daily"` to `sub={liveHotels ? 'Live hotel prices — refreshed daily' : 'Hand-picked offers — refreshed daily'}`.

- [ ] **Step 5: Verify build + manual check**

Run: `npm run build` → success. With empty tables the page must look identical to before (curated fallbacks); no console errors.

- [ ] **Step 6: Commit**

```bash
git add src/pages/PlanTripPage.jsx
git commit -m "feat: popular routes and deals sections read live cached prices"
```

---

### Task 10: Cron schedule SQL + operator runbook

**Files:**
- Create: `docs/TRAVEL_SETUP.md`

- [ ] **Step 1: Write the runbook** (complete content)

````markdown
# Travel Affiliate Setup — Operator Runbook

One-time setup to activate live flight/hotel data and affiliate commissions.

## 1. Get Travelpayouts credentials (free, ~5 minutes)

1. Sign up at https://www.travelpayouts.com (no traffic requirements, instant).
2. In the dashboard, add your website as a project → you get a **marker** (a number like `123456`) — it's shown in your profile/project settings.
3. Go to **Tools → API** and copy your **API token**.

## 2. Set the secrets

From the repo root (CLI is already linked to the project):

```bash
supabase secrets set TRAVELPAYOUTS_TOKEN=YOUR_TOKEN TRAVELPAYOUTS_MARKER=YOUR_MARKER CRON_SECRET=ANY_LONG_RANDOM_STRING
```

Add the marker to the frontend env too (it's public — it appears in every booking URL):

- `.env.local`: `VITE_TRAVELPAYOUTS_MARKER=YOUR_MARKER`
- Vercel → Project → Settings → Environment Variables: same key/value, then redeploy.

## 3. Apply the database + functions (if not already done during implementation)

```bash
supabase db push
supabase functions deploy travel-search refresh-prices
```

## 4. Schedule the nightly refresh

Supabase Dashboard → SQL Editor → run (replace the two placeholders):

```sql
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'refresh-travel-prices',
  '0 2 * * *',  -- 02:00 UTC nightly
  $$
  select net.http_post(
    url := 'https://YOUR_PROJECT_REF.supabase.co/functions/v1/refresh-prices',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', 'ANY_LONG_RANDOM_STRING'  -- same value as the CRON_SECRET secret
    ),
    body := '{}'::jsonb
  );
  $$
);
```

Your project ref is in `supabase/.temp/project-ref` or the dashboard URL.

## 5. Warm up immediately (don't wait for 2 AM)

```bash
curl -X POST "https://YOUR_PROJECT_REF.supabase.co/functions/v1/refresh-prices" -H "x-cron-secret: ANY_LONG_RANDOM_STRING"
```

Expected: `{"ok":true,"routes":{"updated":12,...},"hotels":{"updated":12}}` — then the
Top Flights and Deals sections on /plan-trip show live prices.

## 6. Verify the money path

1. Search a flight or hotel on /plan-trip and click **Book** — the partner page must open with `marker=YOUR_MARKER` in the URL.
2. Check `affiliate_clicks` in the Table Editor — a row per click.
3. Travelpayouts dashboard → Reports shows clicks within ~24h; commissions appear after partners confirm bookings (flights ~1.1–1.5%, hotels ~5–7%). Payouts monthly via PayPal/bank once you pass their minimum.
````

- [ ] **Step 2: Commit**

```bash
git add docs/TRAVEL_SETUP.md
git commit -m "docs: travel affiliate operator runbook (secrets, cron, verification)"
```

---

### Task 11: Final verification

- [ ] **Step 1:** `npm run build` — clean build, no warnings introduced by this work.
- [ ] **Step 2:** `deno test supabase/functions/_shared/` — green (or noted as skipped if Deno unavailable).
- [ ] **Step 3:** Manual pass on dev server: validation messages, loading skeletons, error fallback CTA opens a marker-tagged partner URL, decorative sections unchanged with empty tables.
- [ ] **Step 4:** `git log --oneline` — confirm one commit per task; working tree clean.
- [ ] **Step 5:** Tell the user exactly which runbook steps (secrets, cron SQL, warm-up curl) only they can do.

## Self-review notes

- Spec coverage: schema (T1), helpers/deep links (T2), travel-search incl. stale-serve (T3), refresh-prices + verify_jwt config (T4), deploy (T5), client API + click tracking + disclosure (T6–T8), live decorative sections + honesty cleanup of fake badges/timers (T9), runbook + cron + warm-up (T10). Out-of-scope items from the spec remain out.
- Multi-city: handled — `handleSearch` treats it as round trip (spec 9).
- Type consistency: offer shapes produced in T2 (`deepLink`, `priceFrom`, `airlineIata`…) match consumption in T7/T8; DB column names in T1 match T3/T4 writes and T9 reads.
