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
