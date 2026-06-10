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
