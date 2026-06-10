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
