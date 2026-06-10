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
