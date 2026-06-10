# Travel Affiliate Setup — Operator Runbook

One-time setup to activate live flight/hotel data and affiliate commissions.
Project ref: `hhlxkybchqwughptyyft` (already linked; migration and both Edge Functions are already deployed).

## 1. Get Travelpayouts credentials (free, ~5 minutes)

1. Sign up at https://www.travelpayouts.com (no traffic requirements, instant).
2. In the dashboard, add your website as a project → you get a **marker** (a number like `123456`) — it's shown in your profile/project settings.
3. Go to **Tools → API** and copy your **API token**.

## 2. Set the secrets

From the repo root:

```bash
supabase secrets set TRAVELPAYOUTS_TOKEN=YOUR_TOKEN TRAVELPAYOUTS_MARKER=YOUR_MARKER CRON_SECRET=ANY_LONG_RANDOM_STRING
```

Add the marker to the frontend env too (it's public — it appears in every booking URL):

- `.env.local`: `VITE_TRAVELPAYOUTS_MARKER=YOUR_MARKER`
- Vercel → Project → Settings → Environment Variables: same key/value, then redeploy.

## 3. Schedule the nightly refresh

Supabase Dashboard → SQL Editor → run (replace `ANY_LONG_RANDOM_STRING` with the same value you used for `CRON_SECRET`):

```sql
create extension if not exists pg_cron;
create extension if not exists pg_net;

select cron.schedule(
  'refresh-travel-prices',
  '0 2 * * *',  -- 02:00 UTC nightly
  $$
  select net.http_post(
    url := 'https://hhlxkybchqwughptyyft.supabase.co/functions/v1/refresh-prices',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-cron-secret', 'ANY_LONG_RANDOM_STRING'
    ),
    body := '{}'::jsonb
  );
  $$
);
```

## 4. Warm up immediately (don't wait for 2 AM)

```bash
curl -X POST "https://hhlxkybchqwughptyyft.supabase.co/functions/v1/refresh-prices" -H "x-cron-secret: ANY_LONG_RANDOM_STRING"
```

Expected: `{"ok":true,"routes":{"updated":12,...},"hotels":{"updated":12}}` — then the
Top Flights and Deals sections on /plan-trip show live prices.

## 5. Verify the money path

1. Search a flight or hotel on /plan-trip and click **Book** — the partner page must open with `marker=YOUR_MARKER` in the URL.
2. Check `affiliate_clicks` in the Table Editor — a row per click.
3. Travelpayouts dashboard → Reports shows clicks within ~24h; commissions appear after partners confirm bookings (flights ~1.1–1.5%, hotels ~5–7%). Payouts monthly via PayPal/bank once you pass their minimum.

## Troubleshooting

- Search shows "We couldn't load prices right now" → secrets not set yet, or token invalid. Check: Dashboard → Edge Functions → travel-search → Logs.
- Popular Routes / Deals still show curated numbers → `popular_routes` / `featured_hotels` tables are empty; run the warm-up curl (step 4).
- `{"error":"unauthorized"}` from refresh-prices → the `x-cron-secret` header doesn't match the `CRON_SECRET` secret.
