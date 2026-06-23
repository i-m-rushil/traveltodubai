// Shared static data used by the TopBar widgets AND the full
// /currency and /prayer-times pages, so there's a single source of truth.

export const currencyRates = [
  { code: 'USD', flag: '🇺🇸', name: 'US Dollar',          rate: 0.2723 },
  { code: 'EUR', flag: '🇪🇺', name: 'Euro',               rate: 0.2498 },
  { code: 'GBP', flag: '🇬🇧', name: 'British Pound',      rate: 0.2144 },
  { code: 'INR', flag: '🇮🇳', name: 'Indian Rupee',       rate: 22.71  },
  { code: 'PKR', flag: '🇵🇰', name: 'Pakistani Rupee',    rate: 75.85  },
  { code: 'SAR', flag: '🇸🇦', name: 'Saudi Riyal',        rate: 1.0213 },
  { code: 'EGP', flag: '🇪🇬', name: 'Egyptian Pound',     rate: 13.18  },
  { code: 'PHP', flag: '🇵🇭', name: 'Philippine Peso',    rate: 15.62  },
  { code: 'BDT', flag: '🇧🇩', name: 'Bangladeshi Taka',   rate: 29.84  },
  { code: 'KWD', flag: '🇰🇼', name: 'Kuwaiti Dinar',      rate: 0.0838 },
  { code: 'OMR', flag: '🇴🇲', name: 'Omani Rial',         rate: 0.1049 },
  { code: 'QAR', flag: '🇶🇦', name: 'Qatari Riyal',       rate: 0.9916 },
  { code: 'BHD', flag: '🇧🇭', name: 'Bahraini Dinar',     rate: 0.1025 },
  { code: 'CNY', flag: '🇨🇳', name: 'Chinese Yuan',       rate: 1.971  },
  { code: 'JPY', flag: '🇯🇵', name: 'Japanese Yen',       rate: 40.12  },
  { code: 'CAD', flag: '🇨🇦', name: 'Canadian Dollar',    rate: 0.3710 },
  { code: 'AUD', flag: '🇦🇺', name: 'Australian Dollar',  rate: 0.4160 },
  { code: 'CHF', flag: '🇨🇭', name: 'Swiss Franc',        rate: 0.2451 },
  { code: 'SGD', flag: '🇸🇬', name: 'Singapore Dollar',   rate: 0.3645 },
  { code: 'MYR', flag: '🇲🇾', name: 'Malaysian Ringgit',  rate: 1.2720 },
];

export function formatRate(rate) {
  return rate < 1 ? rate.toFixed(4) : rate < 10 ? rate.toFixed(2) : rate.toFixed(1);
}

// name + time only; the prayer icons live with each consumer.
// These are the static fallback shown if the live fetch fails.
export const prayerTimes = [
  { name: 'Fajr',    time: '4:07 AM'  },
  { name: 'Sunrise', time: '5:42 AM'  },
  { name: 'Dhuhr',   time: '12:28 PM' },
  { name: 'Asr',     time: '3:50 PM'  },
  { name: 'Maghrib', time: '7:13 PM'  },
  { name: 'Isha',    time: '8:43 PM'  },
];

// ── Live prayer times ──────────────────────────────────────────
// The UAE government authority (Awqaf) sets the official azan times but does
// not publish a public API. We use the Aladhan API with method=16 ("Dubai",
// 18.2°/18.2°) — the official UAE calculation method Awqaf uses — so these
// match the government azan schedule. Times are computed per-emirate from
// precise coordinates and cached per day in localStorage.

// Emirate coordinates (capital city of each emirate). Dubai is the default.
export const PRAYER_LOCATIONS = [
  { slug: 'dubai',          label: 'Dubai',          lat: 25.2048, lng: 55.2708 },
  { slug: 'abu-dhabi',      label: 'Abu Dhabi',      lat: 24.4539, lng: 54.3773 },
  { slug: 'sharjah',        label: 'Sharjah',        lat: 25.3463, lng: 55.4209 },
  { slug: 'ras-al-khaimah', label: 'Ras Al Khaimah', lat: 25.7895, lng: 55.9432 },
  { slug: 'fujairah',       label: 'Fujairah',       lat: 25.1288, lng: 56.3265 },
  { slug: 'ajman',          label: 'Ajman',          lat: 25.4052, lng: 55.5136 },
];

export const DUBAI_LOCATION = PRAYER_LOCATIONS[0];

const PRAYER_ORDER = ['Fajr', 'Sunrise', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'];

function to12h(hm) {
  const [h, m] = String(hm).trim().slice(0, 5).split(':').map(Number);
  if (Number.isNaN(h) || Number.isNaN(m)) return hm;
  const period = h >= 12 ? 'PM' : 'AM';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, '0')} ${period}`;
}

function dateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

// Safe localStorage access (no-ops in private mode / SSR).
function cacheGet(key) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : null; } catch { return null; }
}
function cacheSet(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch { /* ignore */ }
}

// Returns [{ name, time }] for the 6 entries we display.
// Serves from a same-day cache when available, otherwise fetches and caches.
export async function fetchPrayerTimes(location = DUBAI_LOCATION, date = new Date()) {
  const loc = location || DUBAI_LOCATION;
  const dk = dateKey(date);
  const cacheKey = `ttd_prayer_${loc.slug}_${dk}`;

  const cached = cacheGet(cacheKey);
  if (cached) return cached;

  const [dd, mm, yyyy] = [String(date.getDate()).padStart(2, '0'), String(date.getMonth() + 1).padStart(2, '0'), date.getFullYear()];
  const url = `https://api.aladhan.com/v1/timings/${dd}-${mm}-${yyyy}` +
    `?latitude=${loc.lat}&longitude=${loc.lng}&method=16`;

  const res = await fetch(url);
  if (!res.ok) throw new Error(`Prayer times request failed (${res.status})`);
  const json = await res.json();
  const t = json?.data?.timings;
  if (!t) throw new Error('Prayer times response missing timings');

  const times = PRAYER_ORDER.map(name => ({ name, time: to12h(t[name]) }));
  cacheSet(cacheKey, times);
  return times;
}
