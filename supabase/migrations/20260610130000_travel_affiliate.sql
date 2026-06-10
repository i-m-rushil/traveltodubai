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
