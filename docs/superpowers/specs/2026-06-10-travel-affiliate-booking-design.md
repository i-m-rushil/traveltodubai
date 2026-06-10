# Travel Affiliate Booking — Design Spec

**Date:** 2026-06-10
**Status:** Approved approach (Approach A), pending user review of this spec
**Goal:** Replace the mock flight/hotel search on the Plan Trip page with real data, monetized via Travelpayouts affiliate commissions, with all data cached and tracked in Supabase.

## 1. Product requirements

- Visitors search flights to Dubai and hotels in Dubai **on our site** with real prices.
- No visitor accounts. The entire funnel — search, browse, compare, choose — happens on traveltodubai; only the **payment step** happens on the partner site (Aviasales for flights, Hotellook for hotels), reached via a deep link carrying our affiliate marker. That link attribution is what earns commission (~1.3% flights, ~5–7% hotels).
- Decorative sections (Popular Routes, Deals, hotel cards) show **real cached prices**, refreshed nightly — not invented numbers.
- All price data, visitor searches, and Book clicks are stored in Supabase.
- The Travelpayouts API token is never exposed to the browser.

## 2. Provider

**Travelpayouts** (free, instant signup, no traffic requirements):

- Flights: Aviasales Data API `GET https://api.travelpayouts.com/aviasales/v3/prices_for_dates` — real prices cached from actual user searches (<48h fresh). Response rows include `price`, `airline` (IATA), `flight_number`, `departure_at`, `return_at`, `transfers`, `duration`, and a relative `link` to the prefilled Aviasales search.
- Hotels: Hotellook Data API `GET https://engine.hotellook.com/api/v2/cache.json?location=Dubai&checkIn=…&checkOut=…` — hotel name, stars, `priceFrom`, `priceAvg`, `hotelId`, coordinates.
- Airline logos: `https://pics.avs.io/{w}/{h}/{IATA}.png`. Hotel photos: `https://photo.hotellook.com/image_v2/limit/h{hotelId}_1/800/520.auto`.
- Deep links (commission attribution via `marker` query param):
  - Flight: `https://www.aviasales.com{link}&marker={MARKER}` (falls back to a constructed `/search/{ORIGIN}{DDMM}{DEST}{DDMM}{PAX}` URL when `link` is absent).
  - Hotel: `https://search.hotellook.com/hotels?hotelId={id}&checkIn={in}&checkOut={out}&adults={n}&currency={cur}&marker={MARKER}`.
- Upgrade path: when traffic qualifies, apply for the real-time Flights Search API; swap inside the `travel-search` Edge Function with no schema or UI changes.

Secrets (Supabase Edge Function secrets, never in the repo or browser):
`TRAVELPAYOUTS_TOKEN`, `TRAVELPAYOUTS_MARKER`, `CRON_SECRET`.

## 3. Architecture

```
PlanTripPage ──supabase.functions.invoke('travel-search')──▶ Edge Function
  ▲                                                            │ 1. fresh cache row? return it
  │                                                            │ 2. else call Travelpayouts
  │                                                            │ 3. upsert cache, log search
  └──────────────── JSON results ◀─────────────────────────────┘

pg_cron (02:00 UTC nightly) ──net.http_post──▶ Edge Function 'refresh-prices'
                                                │ fetch ~12 origins→DXB cheapest prices
                                                │ fetch top Dubai hotels for a rolling window
                                                ▼ upsert popular_routes / featured_hotels

"Book" click ──insert affiliate_clicks──▶ open partner URL (new tab) with marker
```

## 4. Database schema (new migration `20260610xxxxxx_travel_affiliate.sql`)

All tables in `public`. Currency stored per row. Prices stored as numeric.

- **`flight_price_cache`** — `id`, `origin` (IATA), `destination` (IATA, default DXB), `depart_date`, `return_date` (nullable = one-way), `currency`, `results` jsonb (array of normalized offers), `fetched_at`, `expires_at` (fetched_at + 30 min). Unique on `(origin, destination, depart_date, return_date, currency)`.
- **`hotel_price_cache`** — `id`, `location` text, `check_in`, `check_out`, `adults` int, `currency`, `results` jsonb, `fetched_at`, `expires_at`. Unique on `(location, check_in, check_out, adults, currency)`.
- **`popular_routes`** — `id`, `origin_code`, `origin_city`, `country_code`, `airline_iata`, `price`, `currency`, `departure_at`, `transfers` int, `duration_minutes` int, `deep_link` text, `updated_at`. Unique on `origin_code`.
- **`featured_hotels`** — `id`, `hotel_id` bigint unique, `name`, `stars` int, `rating` numeric, `price_from` numeric, `price_avg` numeric, `currency`, `photo_url`, `location_label`, `updated_at`.
- **`travel_searches`** — `id`, `search_type` (`flights`|`hotels`), `params` jsonb, `results_count` int, `cache_hit` boolean, `session_id` text, `created_at`. Insert-only analytics.
- **`affiliate_clicks`** — `id`, `click_type` (`flight_result`|`hotel_result`|`route_card`|`deal_card`), `item_label` text, `partner_url` text, `price` numeric, `currency`, `search_params` jsonb, `session_id` text, `referrer` text, `created_at`.

**RLS** (enabled on all six):
- `popular_routes`, `featured_hotels`: SELECT for `anon`/`authenticated`. No client writes.
- `flight_price_cache`, `hotel_price_cache`: no client policies at all (Edge Functions use service role, which bypasses RLS; clients receive results through the function, not the table).
- `affiliate_clicks`: INSERT for `anon`/`authenticated` (clicks are logged from the browser); SELECT for `authenticated` only (admin dashboard later).
- `travel_searches`: no client policies (rows are written by the `travel-search` function with the service role); SELECT for `authenticated` only.

Indexes on cache lookup keys and `affiliate_clicks(created_at)`.

## 5. Edge Functions (Deno, `supabase/functions/`)

### `travel-search` (`verify_jwt` default; called with anon key from the app)
`POST { type: 'flights', origin, departDate, returnDate?, currency? }` or
`POST { type: 'hotels', checkIn, checkOut, adults, currency? }` (location fixed to Dubai).

1. Validate params (IATA shape, dates ≥ today, checkOut > checkIn). 400 on bad input.
2. Look up the matching cache row; if `expires_at > now()`, return it (`cache_hit: true`).
3. Else call Travelpayouts, normalize to our offer shape (below), upsert cache row, return.
4. Log a `travel_searches` row either way (fire-and-forget).
5. On upstream failure: serve a stale cache row if one exists (flagged `stale: true`); else 502 with a friendly code — the UI then shows a fallback CTA that is itself an affiliate search link.

Normalized flight offer: `{ price, currency, airlineIata, airlineName, flightNumber, departureAt, returnAt, transfers, returnTransfers, durationMinutes, deepLink }` (deepLink already includes the marker).
Normalized hotel offer: `{ hotelId, name, stars, rating, priceFrom, priceAvg, currency, nights, photoUrl, deepLink }`.

### `refresh-prices` (`verify_jwt: false`; guarded by `x-cron-secret` header == `CRON_SECRET`)
- For each of 12 popular origins (LHR, JFK, CDG, BOM, SIN, YYZ, SYD, FRA, IST, DEL, RUH, CAI), fetch the cheapest DXB fare in the next 60 days; upsert `popular_routes`.
- Fetch Dubai hotels for a rolling check-in 30 days out, 3 nights, 2 adults; upsert top ~12 by value into `featured_hotels`.
- Partial failures: log and continue; a route that fails keeps yesterday's row (`updated_at` reveals staleness).

Scheduling: `pg_cron` + `pg_net` (`cron.schedule` calling `net.http_post` on the function URL with the secret header). SQL provided to run in the dashboard because it references the project URL and secret.

## 6. Frontend changes

### New `src/lib/travelApi.js`
`searchFlights(params)`, `searchHotels(params)` → `supabase.functions.invoke('travel-search', …)`;
`getPopularRoutes()`, `getFeaturedHotels()` → straight table SELECTs;
`trackAffiliateClick(payload)` → insert + `window.open(partnerUrl, '_blank', 'noopener')`;
`AIRLINE_NAMES` IATA map and logo/photo URL helpers. Currency defaults: flights USD, hotels AED — one exported constant.

### `PlanTripPage.jsx`
- Search button: validate (flights need origin + depart date; hotels need both dates), map the chosen origin label to IATA, call the API, smooth-scroll to a new **results section** rendered directly below the search pill in the existing design language (white cards, 16px radius, brand `#b1132f` CTA, gold accents).
- Flight result card: airline logo + name, route codes, times, duration, stops badge, price, **Book** button. Hotel result card: photo, name, stars, rating chip, price/night, total for stay, **Book**.
- States: loading skeletons (pulse), empty ("No cached fares for these dates — check live prices on Aviasales →" — itself an affiliate link), error (same fallback CTA), `stale` notice when serving stale cache.
- Book buttons call `trackAffiliateClick` then open the deep link. Route/deal cards do the same with their `deep_link`.
- `ROUTES` section reads `popular_routes` (fallback to the current hardcoded array while the table is empty). Deal/hotel cards read `featured_hotels` similarly. Fake countdown timers and fabricated "Save 30%" badges are removed from live-data cards.
- Small affiliate disclosure under the results header: "We may earn a commission when you book through links on this page, at no extra cost to you." (FTC + Travelpayouts ToS requirement.)

No router changes; everything stays on `/plan-trip`.

## 7. Operator runbook (user-executed, exact commands provided at implementation)

1. Sign up at travelpayouts.com → Tools → API: copy **token**; project **marker** is shown in the dashboard header.
2. `supabase secrets set TRAVELPAYOUTS_TOKEN=… TRAVELPAYOUTS_MARKER=… CRON_SECRET=…`
3. `supabase db push` (migration) → `supabase functions deploy travel-search refresh-prices`
4. Run the provided `cron.schedule` SQL in the dashboard SQL editor (enables `pg_cron`/`pg_net` extensions first).
5. One-time warm-up: `curl` the `refresh-prices` function once so Popular Routes/Deals go live immediately.

## 8. Testing

- Unit-ish: deep-link builders and param validation are pure functions in the Edge Function module — tested with `deno test` locally.
- Integration: `supabase functions serve` + curl with the real token (post-signup); verify cache hit on second call, stale-serve on simulated upstream failure (bad token env).
- UI: manual pass — search happy path, one-way vs round trip, hotels, empty/error states, click logging visible in `affiliate_clicks`, marker present in every opened URL.

## 9. Out of scope (explicit)

- Real-time flight search API (requires Travelpayouts approval — future swap inside `travel-search`).
- On-site payments / becoming a merchant of record.
- Multi-city flights (UI tab exists; shows the same round-trip results with a notice).
- Admin dashboard views over `affiliate_clicks`/`travel_searches` (data is collected now, UI later).
