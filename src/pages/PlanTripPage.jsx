import { useState, useEffect, useRef } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';
import TravelSearchResults from '../components/travel/TravelSearchResults';
import {
  searchFlights, searchHotels, searchAirports, originToIata, openAffiliate,
  aviasalesFallbackLink, hotellookFallbackLink,
  getPopularRoutes, getFeaturedHotels, fmtPrice, fmtDuration, AIRLINE_NAMES,
} from '../lib/travelApi';

/* ─────────────────────────────────────────────
   DESIGN SYSTEM
   Style: Swiss Modernism 2.0 × Trust & Authority
   Grid: 8px base unit | Radius: 12–16px cards, 56px pill
   Colors: White bg · #222 text · #b1132f brand CTA · #C9A050 gold accent
   Typography: Poppins 300–800
   Shadow: subtle 2-layer system
───────────────────────────────────────────── */

const CSS = `
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(14px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmerGold {
    0%   { background-position: -200% center; }
    100% { background-position:  200% center; }
  }
  @keyframes countFlip {
    from { opacity: 0; transform: translateY(-6px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  .pill-field { transition: background 0.15s ease; cursor: pointer; }
  .pill-field:hover { background: rgba(0,0,0,0.04) !important; }
  .dest-img { transition: transform 0.48s cubic-bezier(0.4,0,0.2,1); }
  .dest-card:hover .dest-img { transform: scale(1.06); }
  .dest-card:hover { box-shadow: 0 2px 4px rgba(0,0,0,0.1), 0 14px 32px rgba(0,0,0,0.14) !important; transform: translateY(-3px); }
  .dest-card { transition: box-shadow 0.25s ease, transform 0.25s ease; }
  .route-card { transition: box-shadow 0.22s ease, transform 0.22s ease; }
  .route-card:hover { box-shadow: 0 2px 4px rgba(0,0,0,0.1), 0 12px 28px rgba(0,0,0,0.12) !important; transform: translateY(-3px); }
  .deal-card { transition: box-shadow 0.22s ease, transform 0.22s ease; }
  .deal-card:hover { box-shadow: 0 2px 4px rgba(0,0,0,0.1), 0 12px 28px rgba(0,0,0,0.12) !important; transform: translateY(-3px); }
  .cat-chip { transition: all 0.18s ease; }
  .cat-chip:hover { background: #f0f0f0 !important; }
  .pill-section-first:hover { border-radius: 56px 0 0 56px; }
  .pill-section-last:hover { border-radius: 0 0 0 0; }
  ::-webkit-scrollbar { height: 0; width: 4px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: #ddd; border-radius: 4px; }
`;

/* ─── Inline SVG Icons (no emoji as structural elements) ─── */
const Icon = ({ path, size = 18, stroke = 'currentColor', fill = 'none', sw = 2 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={fill} stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <path d={path} />
  </svg>
);

const Ico = {
  Search:  () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>,
  Pin:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/><circle cx="12" cy="9" r="2.5"/></svg>,
  Cal:     () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>,
  Person:  () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>,
  Plane:   ({ s = 20 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="currentColor"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 4c-2 0-2.5 0-3.5 1L12 9 3.8 6.2a.5.5 0 0 0-.5.3l1.7 8.7c.2.9.8 1.7 1.7 2l4.6 1.3 1.4 1.4c.2.2.5.3.8.3h.7c.4 0 .8-.3.9-.7l.7-2.1z"/></svg>,
  Bed:     ({ s = 20 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 7v13"/><path d="M21 7v13"/><path d="M2 17h20"/><path d="M2 11h20"/><path d="M5 11V7a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4"/><path d="M13 11V7a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v4"/></svg>,
  Box:     ({ s = 20 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>,
  Star:    () => <svg width="13" height="13" viewBox="0 0 24 24" fill="#C9A050"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>,
  Arrow:   ({ s = 16 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>,
  Shield:  () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Tag:     () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/></svg>,
  Headset: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/></svg>,
  Check:   () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>,
  Clock:   ({ s = 12 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>,
  Swap:    () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M7 16V4m0 0L3 8m4-4 4 4"/><path d="M17 8v12m0 0 4-4m-4 4-4-4"/></svg>,
  Minus:   () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  Plus:    () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>,
  ChevDown:() => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="6 9 12 15 18 9"/></svg>,
  Close:   () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>,
};

/* ─── Data ─── */
const DESTINATIONS = [
  { name: 'Burj Khalifa',   tag: 'Iconic',     rating: 4.9, reviews: '28.4k', price: 'AED 120', unit: 'tour',   img: 'https://images.unsplash.com/photo-1582672060674-bc2bd808a8b5?auto=format&fit=crop&w=600&q=80' },
  { name: 'Palm Jumeirah',  tag: 'Island',      rating: 4.8, reviews: '19.2k', price: 'AED 850', unit: 'night',  img: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=600&q=80' },
  { name: 'Desert Safari',  tag: 'Adventure',   rating: 4.9, reviews: '42.1k', price: 'AED 280', unit: 'person', img: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=600&q=80' },
  { name: 'Dubai Marina',   tag: 'Waterfront',  rating: 4.7, reviews: '15.8k', price: 'AED 650', unit: 'night',  img: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?auto=format&fit=crop&w=600&q=80' },
  { name: 'Old Dubai',      tag: 'Heritage',    rating: 4.8, reviews: '22.3k', price: 'AED 95',  unit: 'tour',   img: 'https://images.unsplash.com/photo-1533395427226-788cee25cc7b?auto=format&fit=crop&w=600&q=80' },
  { name: 'JBR Beach',      tag: 'Beach',       rating: 4.6, reviews: '11.7k', price: 'Free',    unit: 'entry',  img: 'https://images.unsplash.com/photo-1565967511849-76a60a516170?auto=format&fit=crop&w=600&q=80' },
  { name: 'DIFC',           tag: 'Finance',     rating: 4.7, reviews: '8.4k',  price: 'AED 150', unit: 'tour',   img: 'https://images.unsplash.com/photo-1580674684081-7617fbf3d745?auto=format&fit=crop&w=600&q=80' },
  { name: 'Dubai Mall',     tag: 'Shopping',    rating: 4.8, reviews: '31.5k', price: 'Free',    unit: 'entry',  img: 'https://images.unsplash.com/photo-1555636222-cae831e670b3?auto=format&fit=crop&w=600&q=80' },
];

const ROUTES = [
  { from: 'London',    code: 'LHR', cc: 'GB', airline: 'Emirates',        duration: '7h 20m', price: '£389',    saves: '30%', nonstop: true,  grad: '#0b1829' },
  { from: 'New York',  code: 'JFK', cc: 'US', airline: 'Emirates',        duration: '12h 45m', price: '$620',   saves: '18%', nonstop: false, grad: '#180b0b' },
  { from: 'Paris',     code: 'CDG', cc: 'FR', airline: 'Air France',      duration: '6h 50m', price: '€480',    saves: '22%', nonstop: true,  grad: '#0b1810' },
  { from: 'Mumbai',    code: 'BOM', cc: 'IN', airline: 'IndiGo',          duration: '3h 15m', price: '₹12,500', saves: '25%', nonstop: true,  grad: '#1a120a' },
  { from: 'Singapore', code: 'SIN', cc: 'SG', airline: 'Singapore Air',   duration: '7h 05m', price: 'S$680',   saves: '15%', nonstop: true,  grad: '#0a1518' },
  { from: 'Toronto',   code: 'YYZ', cc: 'CA', airline: 'Emirates',        duration: '13h 30m', price: 'C$820', saves: '20%', nonstop: false, grad: '#0f1408' },
];

const PACKAGES = [
  { title: 'Dubai Gold & Desert', sub: '5 Days · Hotel + Flights + Desert Safari', price: 'AED 5,499', orig: 'AED 7,800', badge: 'Best Value', img: 'https://images.unsplash.com/photo-1509316785289-025f5b846b35?auto=format&fit=crop&w=900&q=80', big: true },
  { title: 'Burj Al Arab Luxury', sub: '3 Nights · Deluxe Suite + Breakfast',        price: 'AED 3,200', orig: 'AED 4,100', badge: 'Luxury',     img: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=600&q=80', big: false },
  { title: 'Explorer City Break',  sub: '4 Days · Mall + Marina + Old Town',           price: 'AED 2,800', orig: 'AED 3,900', badge: 'Popular',    img: 'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=600&q=80', big: false },
];

const TRUST = [
  { Icon: Ico.Tag,     title: 'Best Price Guarantee', desc: 'We match any lower price you find — guaranteed, with no questions asked.' },
  { Icon: Ico.Shield,  title: 'Secure Booking',       desc: 'All payments are fully encrypted and protected by bank-grade security.' },
  { Icon: Ico.Check,   title: 'Instant Confirmation', desc: 'Your booking is confirmed in seconds with immediate email receipt.' },
  { Icon: Ico.Headset, title: '24/7 Dubai Experts',   desc: 'Specialist advisors who live and breathe Dubai, available around the clock.' },
];

const SEASONS = [
  { m: 'Jan', t: 24, l: 'cool' }, { m: 'Feb', t: 25, l: 'cool' }, { m: 'Mar', t: 29, l: 'warm' },
  { m: 'Apr', t: 34, l: 'warm' }, { m: 'May', t: 39, l: 'hot'  }, { m: 'Jun', t: 42, l: 'hot'  },
  { m: 'Jul', t: 43, l: 'hot'  }, { m: 'Aug', t: 43, l: 'hot'  }, { m: 'Sep', t: 39, l: 'hot'  },
  { m: 'Oct', t: 35, l: 'warm' }, { m: 'Nov', t: 30, l: 'cool' }, { m: 'Dec', t: 26, l: 'cool' },
];

const DEALS = [
  { type: 'Flight',  title: 'London → Dubai',     sub: 'Emirates · Economy · Nonstop', price: '£389', orig: '£549', badge: 'Hot Deal',   bc: '#b1132f', tags: ['Nonstop', '7h 20m'],               rating: 4.8, rev: '12.4k', img: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=600&q=80', expires: 47*3600+13*60+22 },
  { type: 'Hotel',   title: 'Burj Al Arab',        sub: '2 nights · Deluxe Suite',      price: 'AED 3,200', orig: 'AED 4,100', badge: 'Luxury',    bc: '#A07830', tags: ['Breakfast incl.', '5 Star'],    rating: 4.9, rev: '8.2k',  img: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80', expires: 5*3600+48*60+7 },
  { type: 'Package', title: 'Dubai Explorer Pack', sub: '5 Days · All Inclusive',       price: 'AED 5,499', orig: 'AED 7,800', badge: 'Best Value', bc: '#0D9488', tags: ['Desert Safari', 'Flights incl.'], rating: 4.7, rev: '5.6k',  img: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=600&q=80', expires: 6*3600+22*60+55 },
];

/* ─── Countdown Timer ─── */
function CountdownTimer({ expires }) {
  const [s, setS] = useState(expires);
  useEffect(() => {
    const id = setInterval(() => setS(x => Math.max(0, x - 1)), 1000);
    return () => clearInterval(id);
  }, []);
  const d  = Math.floor(s / 86400);
  const hh = String(Math.floor((s % 86400) / 3600)).padStart(2, '0');
  const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
  const ss = String(s % 60).padStart(2, '0');
  const urgent = s < 3600;
  const c = urgent ? '#b1132f' : '#A07830';
  return (
    <span style={{ display:'inline-flex', alignItems:'center', gap:'4px', fontFamily:'var(--font-ui)', fontWeight:700, fontSize:'11px', color: c, letterSpacing:'0.4px' }}>
      <Ico.Clock s={11} />
      {d >= 1 ? `${d}d ${hh}h remaining` : `${hh}:${mm}:${ss} left`}
    </span>
  );
}

/* ─── Counter (reusable +/- control) ─── */
function Counter({ label, sub, val, set, min = 0, max = 9 }) {
  return (
    <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid #f0f0f0' }}>
      <div>
        <div style={{ fontWeight:600, fontSize:'14px', color:'#222' }}>{label}</div>
        {sub && <div style={{ fontSize:'12px', color:'#717171', marginTop:'1px' }}>{sub}</div>}
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
        <button onClick={() => val > min && set(val-1)} disabled={val<=min} style={{ width:'32px', height:'32px', borderRadius:'50%', border:'1.5px solid', borderColor: val<=min ? '#e2e2e2' : '#717171', background:'#fff', color: val<=min ? '#ccc' : '#222', display:'flex', alignItems:'center', justifyContent:'center', cursor: val<=min ? 'not-allowed' : 'pointer', transition:'all 0.15s' }}>
          <Ico.Minus />
        </button>
        <span style={{ fontWeight:700, fontSize:'15px', minWidth:'20px', textAlign:'center', color:'#222' }}>{val}</span>
        <button onClick={() => val < max && set(val+1)} disabled={val>=max} style={{ width:'32px', height:'32px', borderRadius:'50%', border:'1.5px solid', borderColor: val>=max ? '#e2e2e2' : '#717171', background:'#fff', color: val>=max ? '#ccc' : '#222', display:'flex', alignItems:'center', justifyContent:'center', cursor: val>=max ? 'not-allowed' : 'pointer', transition:'all 0.15s' }}>
          <Ico.Plus />
        </button>
      </div>
    </div>
  );
}

/* ─── Floating Dropdown Shell ─── */
function DropShell({ onClose, children, wide }) {
  const ref = useRef(null);
  useEffect(() => {
    const fn = e => { if (ref.current && !ref.current.contains(e.target)) onClose(); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [onClose]);
  return (
    <div ref={ref} style={{ position:'absolute', top:'calc(100% + 12px)', left:0, zIndex:300, background:'#fff', borderRadius:'20px', boxShadow:'0 8px 32px rgba(0,0,0,0.16)', border:'1px solid #e8e8e8', padding:'24px', minWidth: wide ? '340px' : '280px', animation:'fadeSlideUp 0.2s ease' }}>
      {children}
    </div>
  );
}

/* ─── Airport / City Autocomplete ─── */
const POPULAR_ORIGINS = [
  { name:'London', code:'LHR', country_name:'United Kingdom' },
  { name:'New York', code:'JFK', country_name:'United States' },
  { name:'Paris', code:'CDG', country_name:'France' },
  { name:'Mumbai', code:'BOM', country_name:'India' },
  { name:'Singapore', code:'SIN', country_name:'Singapore' },
  { name:'Toronto', code:'YYZ', country_name:'Canada' },
  { name:'Sydney', code:'SYD', country_name:'Australia' },
];

const POPULAR_DESTINATIONS = [
  { name:'Dubai International', code:'DXB', country_name:'United Arab Emirates' },
  { name:'Dubai World Central', code:'DWC', country_name:'United Arab Emirates' },
];

function AirportAutocomplete({ value, onSelect, placeholder, compact, defaultSuggestions }) {
  const [q, setQ] = useState(value || '');
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showDrop, setShowDrop] = useState(false);
  const timerRef = useRef(null);
  const inputRef = useRef(null);
  const wrapRef = useRef(null);

  useEffect(() => { if (!compact) inputRef.current?.focus(); }, [compact]);

  useEffect(() => {
    if (!compact) return;
    const fn = e => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setShowDrop(false); };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, [compact]);

  function handleChange(e) {
    const val = e.target.value;
    setQ(val);
    if (compact) onSelect(val);
    clearTimeout(timerRef.current);
    if (val.length < 2) { setSuggestions([]); setLoading(false); return; }
    setLoading(true);
    timerRef.current = setTimeout(async () => {
      const res = await searchAirports(val);
      setSuggestions(res);
      setLoading(false);
    }, 300);
  }

  function pick(item) {
    const label = `${item.name} (${item.code})`;
    setQ(label);
    setSuggestions([]);
    setShowDrop(false);
    onSelect(label);
  }

  const popList = defaultSuggestions || POPULAR_ORIGINS;
  const items = q.length >= 2 ? suggestions : popList;
  const isPopular = q.length < 2;

  const List = (
    <div style={{ maxHeight:'260px', overflowY:'auto' }}>
      {isPopular && <div style={{ fontWeight:700, fontSize:'12px', color:'#999', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'10px' }}>{defaultSuggestions ? 'Suggested' : 'Popular origins'}</div>}
      {loading && <div style={{ fontSize:'13px', color:'#999', textAlign:'center', padding:'10px' }}>Searching...</div>}
      {!loading && items.map((item, i) => (
        <button key={i}
          onMouseDown={e => e.preventDefault()}
          onClick={() => pick(item)}
          style={{ display:'flex', alignItems:'center', gap:'10px', width:'100%', padding:'9px 8px', background:'transparent', border:'none', cursor:'pointer', borderRadius:'8px', transition:'background 0.12s', textAlign:'left' }}
          onMouseEnter={e => e.currentTarget.style.background='#f5f5f5'}
          onMouseLeave={e => e.currentTarget.style.background='transparent'}>
          <div style={{ width:'32px', height:'32px', borderRadius:'50%', background:'#f0f0f0', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <Ico.Plane s={14} />
          </div>
          <div>
            <div style={{ fontSize:'14px', color:'#222', fontWeight:500 }}>{item.name}</div>
            <div style={{ fontSize:'11px', color:'#717171' }}>{item.country_name} · {item.code}</div>
          </div>
        </button>
      ))}
      {!loading && !isPopular && suggestions.length === 0 && (
        <div style={{ fontSize:'13px', color:'#999', textAlign:'center', padding:'8px' }}>No results found</div>
      )}
    </div>
  );

  if (!compact) {
    return (
      <div>
        <input ref={inputRef} value={q} onChange={handleChange}
          placeholder={placeholder || 'Search city or airport...'}
          style={{ width:'100%', height:'40px', border:'1.5px solid #e2e2e2', borderRadius:'10px', padding:'0 12px', fontSize:'14px', fontFamily:'inherit', color:'#222', background:'#f8f8f8', outline:'none', boxSizing:'border-box', marginBottom:'14px' }}
          onFocus={e => e.target.style.borderColor='#222'}
          onBlur={e => e.target.style.borderColor='#e2e2e2'} />
        {List}
      </div>
    );
  }

  return (
    <div ref={wrapRef} style={{ position:'relative' }}>
      <input ref={inputRef} type="text" value={q} onChange={handleChange}
        onFocus={e => { e.target.style.borderColor='#222'; setShowDrop(true); }}
        onBlur={e => e.target.style.borderColor='#e2e2e2'}
        placeholder={placeholder || 'City or airport'}
        style={{ width:'100%', height:'46px', border:'1.5px solid #e2e2e2', borderRadius:'10px', padding:'0 14px', fontSize:'14px', fontFamily:'inherit', color:'#222', background:'#fff', outline:'none', boxSizing:'border-box' }} />
      {showDrop && (
        <div style={{ position:'absolute', top:'calc(100% + 6px)', left:0, right:0, background:'#fff', borderRadius:'14px', boxShadow:'0 6px 24px rgba(0,0,0,0.15)', border:'1px solid #e8e8e8', padding:'14px', zIndex:200, animation:'fadeSlideUp 0.15s ease' }}>
          {List}
        </div>
      )}
    </div>
  );
}

/* ─── Section Header ─── */
function SectionHead({ title, sub, action, dark }) {
  return (
    <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:'28px', flexWrap:'wrap', gap:'10px' }}>
      <div>
        <h2 style={{ fontFamily:'var(--font-headline)', fontWeight:800, fontSize:'clamp(20px,3vw,28px)', color: dark ? '#fff' : '#222', letterSpacing:'-0.025em', margin:'0 0 6px' }}>{title}</h2>
        {sub && <p style={{ fontSize:'14px', color: dark ? 'rgba(255,255,255,0.5)' : '#717171', margin:0 }}>{sub}</p>}
      </div>
      {action && (
        <button onClick={action.fn} style={{ display:'flex', alignItems:'center', gap:'5px', fontSize:'14px', fontWeight:600, color: dark ? '#C9A050' : '#b1132f', background:'transparent', border:'none', cursor:'pointer', padding:'4px 0', textDecoration:'underline', textUnderlineOffset:'3px' }}>
          {action.label} <Ico.Arrow s={13} />
        </button>
      )}
    </div>
  );
}

/* ─── Destination Card ─── */
function DestCard({ d }) {
  return (
    <div className="dest-card" style={{ flexShrink:0, width:'280px', borderRadius:'20px', overflow:'hidden', cursor:'pointer', position:'relative', height:'340px', boxShadow:'0 2px 16px rgba(0,0,0,0.12)', transition:'transform 0.22s, box-shadow 0.22s' }}
      onMouseEnter={e => { e.currentTarget.style.transform='translateY(-4px)'; e.currentTarget.style.boxShadow='0 8px 32px rgba(0,0,0,0.2)'; }}
      onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 2px 16px rgba(0,0,0,0.12)'; }}>
      <img src={d.img} alt={d.name} style={{ width:'100%', height:'100%', objectFit:'cover', position:'absolute', inset:0 }} loading="lazy" decoding="async" />
      <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0.22) 55%, transparent 100%)' }} />
      <div style={{ position:'absolute', top:'14px', left:'14px', background:'rgba(255,255,255,0.18)', backdropFilter:'blur(10px)', WebkitBackdropFilter:'blur(10px)', borderRadius:'20px', padding:'4px 12px', border:'1px solid rgba(255,255,255,0.25)' }}>
        <span style={{ fontSize:'11px', fontWeight:700, color:'#fff', letterSpacing:'0.4px' }}>{d.tag}</span>
      </div>
      <div style={{ position:'absolute', bottom:0, left:0, right:0, padding:'20px 18px' }}>
        <div style={{ fontWeight:700, fontSize:'17px', color:'#fff', marginBottom:'5px', letterSpacing:'-0.01em' }}>{d.name}</div>
        <div style={{ display:'flex', alignItems:'center', gap:'4px', marginBottom:'8px' }}>
          <Ico.Star s={12} /><span style={{ fontSize:'12px', fontWeight:600, color:'#fff' }}>{d.rating}</span>
          <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.65)' }}>· {d.reviews} reviews</span>
        </div>
        <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.8)' }}>
          from <span style={{ fontWeight:700, color:'#fff' }}>{d.price}</span> / {d.unit}
        </div>
      </div>
    </div>
  );
}

/* ─── Route Card ─── */
function RouteCard({ r, onClick }) {
  return (
    <div className="route-card" onClick={() => onClick?.(r)} style={{ background:'#fff', borderRadius:'16px', border:'1px solid #ebebeb', padding:'20px', boxShadow:'0 1px 3px rgba(0,0,0,0.06)', cursor:'pointer', position:'relative', overflow:'hidden' }}>
      {/* country badge */}
      <div style={{ position:'absolute', top:'16px', right:'16px', background:'#f5f5f5', borderRadius:'6px', padding:'3px 8px', fontFamily:'var(--font-ui)', fontWeight:800, fontSize:'10px', color:'#717171', letterSpacing:'1px' }}>{r.cc}</div>

      <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'14px' }}>
        <div style={{ width:'36px', height:'36px', borderRadius:'50%', background: r.grad || '#f0f0f0', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <span style={{ color:'rgba(255,255,255,0.85)', fontSize:'14px' }}><Ico.Plane s={16} /></span>
        </div>
        <div>
          <div style={{ fontWeight:700, fontSize:'13px', color:'#222' }}>{r.from} → Dubai</div>
          <div style={{ fontSize:'11px', color:'#717171', marginTop:'1px' }}>{r.airline}</div>
        </div>
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:'8px', marginBottom:'14px' }}>
        <div style={{ flex:1, height:'1px', background:'#ebebeb', position:'relative' }}>
          <div style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)', background:'#fff', padding:'0 6px', fontSize:'11px', color:'#717171', whiteSpace:'nowrap' }}>{r.duration}</div>
        </div>
      </div>

      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between' }}>
        <div>
          <div style={{ fontSize:'10px', color:'#717171', fontWeight:600, textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'2px' }}>from</div>
          <div style={{ fontWeight:800, fontSize:'20px', color:'#222', letterSpacing:'-0.02em' }}>{r.price}</div>
        </div>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:'4px' }}>
          {r.nonstop && (
            <span style={{ background:'rgba(13,148,136,0.08)', color:'#0D9488', fontSize:'10px', fontWeight:700, padding:'3px 8px', borderRadius:'20px', border:'1px solid rgba(13,148,136,0.2)' }}>Nonstop</span>
          )}
          {r.saves && <span style={{ background:'rgba(201,160,80,0.1)', color:'#A07830', fontSize:'10px', fontWeight:700, padding:'3px 8px', borderRadius:'20px', border:'1px solid rgba(201,160,80,0.25)' }}>Save {r.saves}</span>}
        </div>
      </div>
    </div>
  );
}

/* ─── Deal Card ─── */
function DealCard({ deal, onClick }) {
  return (
    <div className="deal-card" style={{ background:'#fff', borderRadius:'18px', overflow:'hidden', boxShadow:'0 1px 3px rgba(0,0,0,0.07), 0 6px 16px rgba(0,0,0,0.05)', cursor:'pointer' }}>
      <div style={{ height:'140px', background:'#111', padding:'18px', display:'flex', flexDirection:'column', position:'relative', overflow:'hidden' }}>
        <img src={deal.img} alt={deal.title} loading="lazy" decoding="async" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
        <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.3) 100%)' }} />
        <div style={{ position:'relative', display:'flex', alignItems:'center', gap:'8px' }}>
          <span style={{ background: deal.bc, color:'#fff', fontWeight:800, fontSize:'9px', letterSpacing:'1.2px', textTransform:'uppercase', padding:'4px 10px', borderRadius:'4px' }}>{deal.badge}</span>
          {deal.expires != null && <CountdownTimer expires={deal.expires} />}
        </div>
        <div style={{ position:'relative', marginTop:'auto' }}>
          <div style={{ fontWeight:800, fontSize:'19px', color:'#fff', letterSpacing:'-0.02em', marginBottom:'2px' }}>{deal.title}</div>
          <div style={{ fontSize:'12px', color:'rgba(255,255,255,0.6)' }}>{deal.sub}</div>
        </div>
      </div>
      <div style={{ padding:'16px 18px 20px' }}>
        <div style={{ display:'flex', gap:'6px', marginBottom:'14px', flexWrap:'wrap' }}>
          {deal.tags.map(t => <span key={t} style={{ background:'#f5f5f5', borderRadius:'20px', padding:'4px 10px', fontSize:'11px', fontWeight:600, color:'#555' }}>{t}</span>)}
        </div>
        <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'space-between', marginBottom:'14px' }}>
          <div>
            <div style={{ display:'flex', alignItems:'baseline', gap:'7px' }}>
              <span style={{ fontWeight:800, fontSize:'22px', color:'#b1132f', letterSpacing:'-0.02em' }}>{deal.price}</span>
              {deal.orig && <span style={{ fontSize:'13px', color:'#aaa', textDecoration:'line-through' }}>{deal.orig}</span>}
            </div>
            {deal.rating != null && (
              <div style={{ display:'flex', alignItems:'center', gap:'3px', marginTop:'3px' }}>
                <Ico.Star /><span style={{ fontSize:'12px', fontWeight:700, color:'#222' }}>{deal.rating}</span>
                {deal.rev && <span style={{ fontSize:'12px', color:'#717171' }}>({deal.rev})</span>}
              </div>
            )}
          </div>
        </div>
        <button onClick={(e) => { e.stopPropagation(); onClick?.(deal); }} style={{ width:'100%', padding:'12px', background:'#b1132f', border:'none', color:'#fff', fontWeight:700, fontSize:'13px', borderRadius:'10px', cursor:'pointer', letterSpacing:'0.3px', transition:'background 0.18s' }}
          onMouseEnter={e => e.currentTarget.style.background = '#8e0f26'}
          onMouseLeave={e => e.currentTarget.style.background = '#b1132f'}>
          Book Now
        </button>
      </div>
    </div>
  );
}

/* ─── Season Guide ─── */
function SeasonGuide({ isMobile }) {
  const cur = new Date().getMonth();
  const LEV = { cool:'#0D9488', warm:'#C9A050', hot:'#E07030' };
  return (
    <div style={{ maxWidth:'1080px', margin:'0 auto', padding: isMobile ? '48px 16px' : '64px 24px' }}>
      <SectionHead title="Best Time to Visit Dubai" sub="Temperature & pricing guide across all 12 months" />
      <div style={{ background:'#fff', borderRadius:'20px', border:'1px solid #ebebeb', boxShadow:'0 1px 3px rgba(0,0,0,0.06)', padding: isMobile ? '16px 12px 20px' : '24px 28px 28px' }}>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(12,1fr)', gap: isMobile ? '4px' : '8px', marginBottom:'20px' }}>
          {SEASONS.map((s, i) => {
            const barH = Math.round(((s.t - 20) / 26) * 56) + 8;
            const isCur = i === cur;
            return (
              <div key={s.m} style={{ textAlign:'center', padding: isMobile ? '6px 2px' : '8px 4px', borderRadius:'10px', background: isCur ? 'rgba(201,160,80,0.08)' : 'transparent', border:`1.5px solid ${isCur ? 'rgba(201,160,80,0.3)' : 'transparent'}` }}>
                <div style={{ fontSize: isMobile ? '8px' : '11px', fontWeight:700, color: isCur ? '#A07830' : '#aaa', marginBottom:'8px' }}>{s.m}</div>
                <div style={{ height:'64px', display:'flex', alignItems:'flex-end', justifyContent:'center', marginBottom:'6px' }}>
                  <div style={{ width: isMobile ? '12px' : '18px', height:`${barH}px`, borderRadius:'4px 4px 2px 2px', background:`linear-gradient(to top, ${LEV[s.l]}, ${s.l==='hot'?'#ffaa70':s.l==='warm'?'#f0cc70':'#2DD4BF'})` }} />
                </div>
                <div style={{ fontSize: isMobile ? '9px' : '12px', fontWeight:700, color:'#222' }}>{s.t}°</div>
              </div>
            );
          })}
        </div>
        <div style={{ display:'flex', gap:'20px', flexWrap:'wrap', paddingTop:'16px', borderTop:'1px solid #f0f0f0' }}>
          {[['cool','#0D9488','Nov–Feb · Best weather'], ['warm','#C9A050','Mar–Apr · Good value'], ['hot','#E07030','May–Oct · Budget fares']].map(([k, c, label]) => (
            <div key={k} style={{ display:'flex', alignItems:'center', gap:'7px' }}>
              <div style={{ width:'10px', height:'10px', borderRadius:'2px', background: c, flexShrink:0 }} />
              <span style={{ fontSize:'12px', color:'#717171' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
export default function PlanTripPage() {
  const isMobile = useIsMobile();
  const destSliderRef = useRef(null);
  const scrollDest = dir => destSliderRef.current?.scrollBy({ left: dir * 310, behavior: 'smooth' });

  /* Tab state */
  const [tab, setTab]           = useState('flights');
  const [activeSec, setActiveSec] = useState(null); /* which pill section is open */

  /* Live search */
  const [searchState, setSearchState] = useState({ status: 'idle' });
  const [formError, setFormError] = useState('');
  const resultsRef = useRef(null);

  /* Flight form */
  const [from, setFrom]         = useState('');
  const [to, setTo]             = useState('');
  const [tripType, setTripType] = useState('round');
  const [depart, setDepart]     = useState('');
  const [ret, setRet]           = useState('');
  const [adults, setAdults]     = useState(1);
  const [kids, setKids]         = useState(0);
  const [infants, setInfants]   = useState(0);
  const [cls, setCls]           = useState('Economy');

  /* Hotel form */
  const [hotelDest, setHotelDest] = useState('');
  const [checkIn, setCheckIn]     = useState('');
  const [checkOut, setCheckOut]   = useState('');
  const [rooms, setRooms]         = useState(1);
  const [hGuests, setHGuests]     = useState(2);

  const today  = new Date().toISOString().split('T')[0];
  const pax    = adults + kids + infants;
  const paxLbl = `${pax} Traveler${pax !== 1 ? 's' : ''} · ${cls}`;
  const hLbl   = `${rooms} Room${rooms !== 1 ? 's' : ''}, ${hGuests} Guest${hGuests !== 1 ? 's' : ''}`;

  function closeSec() { setActiveSec(null); }
  function toggleSec(id) { setActiveSec(s => s === id ? null : id); }
  function swapCities() { const t = from; setFrom(to); setTo(t); }

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

  /* Pill field base style */
  const PF = (id, isFirst, isLast) => ({
    display:'flex', flexDirection:'column', justifyContent:'center',
    padding: isMobile ? '12px 14px' : '14px 20px',
    flex: isFirst || isLast ? '1.4' : '1',
    minWidth: isMobile ? '0' : isFirst ? '180px' : '130px',
    position:'relative', cursor:'pointer',
    borderRadius: isFirst ? '56px 0 0 56px' : isLast ? '0 56px 56px 0' : '0',
    background: activeSec === id ? '#f0f0f0' : 'transparent',
    transition:'background 0.15s',
  });

  const PLabel = { fontSize:'11px', fontWeight:700, color:'#222', marginBottom:'2px', whiteSpace:'nowrap', letterSpacing:'0.1px' };
  const PVal   = { fontSize:'13px', color:'#717171', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' };

  /* ── Search Pill (Desktop) ── */
  const SearchPillDesktop = (
    <div style={{ background:'#fff', borderRadius:'56px', boxShadow: activeSec ? '0 0 0 2px #222, 0 8px 32px rgba(0,0,0,0.18)' : '0 2px 4px rgba(0,0,0,0.08), 0 8px 24px rgba(0,0,0,0.1)', display:'flex', alignItems:'stretch', position:'relative', transition:'box-shadow 0.2s' }}>

      {/* FROM */}
      <div className="pill-field" style={PF('from', true, false)} onClick={() => toggleSec('from')}>
        <div style={PLabel}>{tab === 'hotels' ? 'Where' : 'From'}</div>
        <div style={{ ...PVal, color: tab==='hotels' ? (hotelDest ? '#222' : '#aaa') : (from ? '#222' : '#aaa') }}>
          {tab === 'hotels' ? (hotelDest || 'Search destinations') : (from || 'City or airport')}
        </div>
        {activeSec === 'from' && (
          <DropShell onClose={closeSec} wide>
            <AirportAutocomplete
              value={tab === 'hotels' ? hotelDest : from}
              onSelect={val => { (tab === 'hotels' ? setHotelDest : setFrom)(val); closeSec(); }}
            />
          </DropShell>
        )}
      </div>

      {/* Divider + swap */}
      <div style={{ width:'1px', background:'#e2e2e2', alignSelf:'center', height:'32px', position:'relative', flexShrink:0 }}>
        {tab === 'flights' && (
          <button onClick={swapCities} title="Swap" style={{ position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)', width:'28px', height:'28px', borderRadius:'50%', background:'#fff', border:'1.5px solid #e2e2e2', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', zIndex:10, color:'#717171', transition:'all 0.2s' }}
            onMouseEnter={e => { e.currentTarget.style.background='#f0f0f0'; e.currentTarget.style.transform='translate(-50%,-50%) rotate(180deg)'; }}
            onMouseLeave={e => { e.currentTarget.style.background='#fff'; e.currentTarget.style.transform='translate(-50%,-50%)'; }}>
            <Ico.Swap />
          </button>
        )}
      </div>

      {/* TO (flights only) or DATE (hotels) */}
      {tab === 'flights' ? (
        <div className="pill-field" style={PF('to', false, false)} onClick={() => toggleSec('to')}>
          <div style={PLabel}>To</div>
          <div style={{ ...PVal, color: to ? '#222' : '#aaa' }}>{to || 'Dubai, UAE — DXB'}</div>
          {activeSec === 'to' && (
            <DropShell onClose={closeSec}>
              <AirportAutocomplete
                value={to}
                onSelect={val => { setTo(val); closeSec(); }}
                placeholder="Search destination..."
                defaultSuggestions={POPULAR_DESTINATIONS}
              />
            </DropShell>
          )}
        </div>
      ) : (
        <div className="pill-field" style={PF('checkin', false, false)} onClick={() => toggleSec('checkin')}>
          <div style={PLabel}>Check in</div>
          <input type="date" value={tab==='hotels' ? checkIn : depart} min={today}
            onChange={e => tab==='hotels' ? setCheckIn(e.target.value) : setDepart(e.target.value)}
            style={{ border:'none', background:'transparent', fontFamily:'inherit', fontSize:'13px', color: (tab==='hotels' ? checkIn : depart) ? '#222' : '#aaa', cursor:'pointer', outline:'none', width:'100%', padding:0 }} />
        </div>
      )}

      <div style={{ width:'1px', background:'#e2e2e2', alignSelf:'center', height:'32px', flexShrink:0 }} />

      {/* DATE(S) */}
      {tab === 'flights' ? (<>
        <div className="pill-field" style={PF('depart', false, false)} onClick={() => toggleSec('depart')}>
          <div style={PLabel}>Depart</div>
          <input type="date" value={depart} min={today} onChange={e => setDepart(e.target.value)}
            style={{ border:'none', background:'transparent', fontFamily:'inherit', fontSize:'13px', color: depart ? '#222' : '#aaa', cursor:'pointer', outline:'none', padding:0 }} />
        </div>
        {tripType === 'round' && <>
          <div style={{ width:'1px', background:'#e2e2e2', alignSelf:'center', height:'32px', flexShrink:0 }} />
          <div className="pill-field" style={PF('return', false, false)} onClick={() => toggleSec('return')}>
            <div style={PLabel}>Return</div>
            <input type="date" value={ret} min={depart||today} onChange={e => setRet(e.target.value)}
              style={{ border:'none', background:'transparent', fontFamily:'inherit', fontSize:'13px', color: ret ? '#222' : '#aaa', cursor:'pointer', outline:'none', padding:0 }} />
          </div>
        </>}
      </>) : (
        <div className="pill-field" style={PF('checkout', false, false)} onClick={() => toggleSec('checkout')}>
          <div style={PLabel}>Check out</div>
          <input type="date" value={checkOut} min={checkIn||today} onChange={e => setCheckOut(e.target.value)}
            style={{ border:'none', background:'transparent', fontFamily:'inherit', fontSize:'13px', color: checkOut ? '#222' : '#aaa', cursor:'pointer', outline:'none', width:'100%', padding:0 }} />
        </div>
      )}

      <div style={{ width:'1px', background:'#e2e2e2', alignSelf:'center', height:'32px', flexShrink:0 }} />

      {/* TRAVELERS / GUESTS */}
      <div className="pill-field" style={PF('pax', false, false)} onClick={() => toggleSec('pax')}>
        <div style={PLabel}>{tab === 'hotels' ? 'Guests' : 'Travelers'}</div>
        <div style={{ ...PVal, color:'#222', display:'flex', alignItems:'center', gap:'4px' }}>
          {tab === 'hotels' ? hLbl : paxLbl}
          <span style={{ color:'#717171' }}><Ico.ChevDown /></span>
        </div>
        {activeSec === 'pax' && (
          <DropShell onClose={closeSec} wide>
            {tab === 'hotels' ? (<>
              <Counter label="Rooms"  val={rooms}   set={setRooms}  min={1} max={10} />
              <Counter label="Guests" val={hGuests}  set={setHGuests} min={1} max={20} />
            </>) : (<>
              <Counter label="Adults"   sub="Age 13+"    val={adults}  set={setAdults}  min={1} max={9} />
              <Counter label="Children" sub="Age 2–12"   val={kids}    set={setKids}    min={0} max={8} />
              <Counter label="Infants"  sub="Under 2"    val={infants} set={setInfants} min={0} max={4} />
              {tab === 'flights' && (
                <div style={{ marginTop:'16px' }}>
                  <div style={{ fontSize:'11px', fontWeight:700, color:'#717171', letterSpacing:'0.5px', textTransform:'uppercase', marginBottom:'10px' }}>Cabin class</div>
                  <div style={{ display:'flex', gap:'6px' }}>
                    {['Economy', 'Business', 'First'].map(c => (
                      <button key={c} onClick={() => setCls(c)} style={{ flex:1, padding:'8px 4px', borderRadius:'8px', border:'1.5px solid', borderColor: cls===c ? '#222' : '#e2e2e2', background: cls===c ? '#222' : '#fff', color: cls===c ? '#fff' : '#222', fontSize:'12px', fontWeight:600, cursor:'pointer', transition:'all 0.15s' }}>{c}</button>
                    ))}
                  </div>
                </div>
              )}
            </>)}
            <button onClick={closeSec} style={{ marginTop:'16px', width:'100%', padding:'11px', background:'#222', color:'#fff', fontWeight:700, fontSize:'13px', borderRadius:'10px', border:'none', cursor:'pointer' }}>Done</button>
          </DropShell>
        )}
      </div>

      {/* SEARCH BUTTON */}
      <div style={{ padding:'8px', flexShrink:0, display:'flex', alignItems:'center' }}>
        <button onClick={handleSearch} style={{ height:'48px', padding:'0 24px', background:'linear-gradient(135deg, #b1132f, #8e0f26)', color:'#fff', border:'none', borderRadius:'48px', cursor:'pointer', display:'flex', alignItems:'center', gap:'8px', fontWeight:700, fontSize:'14px', letterSpacing:'0.2px', boxShadow:'0 2px 8px rgba(177,19,47,0.4)', transition:'all 0.2s', whiteSpace:'nowrap' }}
          onMouseEnter={e => { e.currentTarget.style.transform='scale(1.03)'; e.currentTarget.style.boxShadow='0 4px 16px rgba(177,19,47,0.5)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 2px 8px rgba(177,19,47,0.4)'; }}>
          <Ico.Search />
          Search
        </button>
      </div>
    </div>
  );

  /* ── Mobile Search Card ── */
  const SearchCardMobile = (
    <div style={{ background:'#fff', borderRadius:'20px', boxShadow:'0 4px 24px rgba(0,0,0,0.18)', overflow:'hidden' }}>
      {/* Trip type toggles */}
      {tab === 'flights' && (
        <div style={{ padding:'12px 12px 0' }}>
          <div style={{ display:'flex', background:'#f4f4f4', borderRadius:'10px', padding:'3px' }}>
            {[['one','One Way'],['round','Round Trip'],['multi','Multi-City']].map(([v,l]) => (
              <button key={v} onClick={() => setTripType(v)} style={{ flex:1, padding:'8px 4px', background: tripType===v ? '#fff' : 'transparent', border:'none', borderRadius:'7px', color: tripType===v ? '#b1132f' : '#717171', fontWeight: tripType===v ? 600 : 500, fontSize:'12px', cursor:'pointer', boxShadow: tripType===v ? '0 1px 4px rgba(0,0,0,0.1)' : 'none', transition:'all 0.15s' }}>{l}</button>
            ))}
          </div>
        </div>
      )}
      <div style={{ padding:'16px' }}>
        {tab === 'flights' ? (<>
          <div style={{ marginBottom:'10px' }}>
            <div style={{ fontSize:'11px', fontWeight:700, color:'#717171', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'5px' }}>From</div>
            <AirportAutocomplete value={from} onSelect={setFrom} placeholder="City or airport" compact />
          </div>
          <div style={{ marginBottom:'10px' }}>
            <div style={{ fontSize:'11px', fontWeight:700, color:'#717171', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'5px' }}>To</div>
            <AirportAutocomplete value={to} onSelect={setTo} placeholder="Dubai, UAE — DXB" compact defaultSuggestions={POPULAR_DESTINATIONS} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'10px' }}>
            <div>
              <div style={{ fontSize:'11px', fontWeight:700, color:'#717171', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'5px' }}>Depart</div>
              <input type="date" value={depart} min={today} onChange={e => setDepart(e.target.value)} style={{ width:'100%', height:'46px', border:'1.5px solid #e2e2e2', borderRadius:'10px', padding:'0 10px', fontSize:'13px', fontFamily:'inherit', color:'#222', background:'#fff', outline:'none', boxSizing:'border-box' }} />
            </div>
            {tripType === 'round' && <div>
              <div style={{ fontSize:'11px', fontWeight:700, color:'#717171', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'5px' }}>Return</div>
              <input type="date" value={ret} min={depart||today} onChange={e => setRet(e.target.value)} style={{ width:'100%', height:'46px', border:'1.5px solid #e2e2e2', borderRadius:'10px', padding:'0 10px', fontSize:'13px', fontFamily:'inherit', color:'#222', background:'#fff', outline:'none', boxSizing:'border-box' }} />
            </div>}
          </div>
        </>) : tab === 'hotels' ? (<>
          <div style={{ marginBottom:'10px' }}>
            <div style={{ fontSize:'11px', fontWeight:700, color:'#717171', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'5px' }}>Where</div>
            <input type="text" value={hotelDest} onChange={e => setHotelDest(e.target.value)} placeholder="Search destinations" style={{ width:'100%', height:'46px', border:'1.5px solid #e2e2e2', borderRadius:'10px', padding:'0 14px', fontSize:'14px', fontFamily:'inherit', color:'#222', background:'#fff', outline:'none', boxSizing:'border-box' }} onFocus={e => e.target.style.borderColor='#222'} onBlur={e => e.target.style.borderColor='#e2e2e2'} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'10px' }}>
            <div>
              <div style={{ fontSize:'11px', fontWeight:700, color:'#717171', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'5px' }}>Check in</div>
              <input type="date" value={checkIn} min={today} onChange={e => setCheckIn(e.target.value)} style={{ width:'100%', height:'46px', border:'1.5px solid #e2e2e2', borderRadius:'10px', padding:'0 10px', fontSize:'13px', fontFamily:'inherit', color:'#222', background:'#fff', outline:'none', boxSizing:'border-box' }} />
            </div>
            <div>
              <div style={{ fontSize:'11px', fontWeight:700, color:'#717171', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'5px' }}>Check out</div>
              <input type="date" value={checkOut} min={checkIn||today} onChange={e => setCheckOut(e.target.value)} style={{ width:'100%', height:'46px', border:'1.5px solid #e2e2e2', borderRadius:'10px', padding:'0 10px', fontSize:'13px', fontFamily:'inherit', color:'#222', background:'#fff', outline:'none', boxSizing:'border-box' }} />
            </div>
          </div>
        </>) : (<>
          <div style={{ marginBottom:'10px' }}>
            <div style={{ fontSize:'11px', fontWeight:700, color:'#717171', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'5px' }}>Destination</div>
            <input type="text" defaultValue="Dubai, UAE" style={{ width:'100%', height:'46px', border:'1.5px solid #e2e2e2', borderRadius:'10px', padding:'0 14px', fontSize:'14px', fontFamily:'inherit', color:'#222', background:'#fff', outline:'none', boxSizing:'border-box' }} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', marginBottom:'10px' }}>
            <div>
              <div style={{ fontSize:'11px', fontWeight:700, color:'#717171', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'5px' }}>Travel date</div>
              <input type="date" min={today} style={{ width:'100%', height:'46px', border:'1.5px solid #e2e2e2', borderRadius:'10px', padding:'0 10px', fontSize:'13px', fontFamily:'inherit', color:'#222', background:'#fff', outline:'none', boxSizing:'border-box' }} />
            </div>
            <div>
              <div style={{ fontSize:'11px', fontWeight:700, color:'#717171', textTransform:'uppercase', letterSpacing:'0.5px', marginBottom:'5px' }}>Duration</div>
              <select style={{ width:'100%', height:'46px', border:'1.5px solid #e2e2e2', borderRadius:'10px', padding:'0 10px', fontSize:'13px', fontFamily:'inherit', color:'#222', background:'#fff', outline:'none', boxSizing:'border-box' }}>
                {['3 Nights','5 Nights','7 Nights','10 Nights'].map(d=><option key={d}>{d}</option>)}
              </select>
            </div>
          </div>
        </>)}
        <button onClick={handleSearch} style={{ width:'100%', height:'50px', background:'linear-gradient(135deg, #b1132f, #8e0f26)', color:'#fff', border:'none', borderRadius:'12px', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:'8px', fontWeight:700, fontSize:'15px', boxShadow:'0 2px 10px rgba(177,19,47,0.35)' }}>
          <Ico.Search />
          Search {tab === 'flights' ? 'Flights' : tab === 'hotels' ? 'Hotels' : 'Packages'}
        </button>
      </div>
    </div>
  );

  /* ─── TABS (above the pill) ─── */
  const TABS = [
    { id:'flights',  label:'Flights',  Icon: () => <Ico.Plane s={15} /> },
    { id:'hotels',   label:'Hotels',   Icon: () => <Ico.Bed s={15} />   },
    { id:'packages', label:'Packages', Icon: () => <Ico.Box s={15} />   },
  ];

  /* ─── CATEGORY CHIPS (below hero) ─── */
  const [activeCat, setActiveCat] = useState('all');
  const CATS = [
    { id:'all',       label:'All stays',  Icon: ({s=20}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9.5L12 3l9 6.5V20a1 1 0 01-1 1H4a1 1 0 01-1-1V9.5z"/><polyline points="9,21 9,12 15,12 15,21"/></svg> },
    { id:'luxury',    label:'Luxury',     Icon: ({s=20}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M2 17l3-8 4 5 3-8 3 8 4-5 3 8H2z"/><line x1="2" y1="21" x2="22" y2="21"/></svg> },
    { id:'desert',    label:'Desert',     Icon: ({s=20}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="3"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="12" x2="12" y2="14"/><line x1="4.5" y1="4.5" x2="6" y2="6"/><line x1="18" y1="4.5" x2="16.5" y2="6"/><line x1="2" y1="8" x2="4" y2="8"/><line x1="20" y1="8" x2="22" y2="8"/><path d="M2 21c2-3.5 5-4.5 7.5-3s5.5 2.5 8-.5 4.5-2 4.5 0"/></svg> },
    { id:'beach',     label:'Beach',      Icon: ({s=20}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M4 12a8 8 0 0116 0"/><line x1="12" y1="12" x2="12" y2="21"/><line x1="9" y1="21" x2="15" y2="21"/><path d="M3 18c2.5-2 5-2.5 7 0s4.5 2 7 0"/></svg> },
    { id:'culture',   label:'Cultural',   Icon: ({s=20}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="22" x2="6" y2="11"/><line x1="18" y1="22" x2="18" y2="11"/><path d="M12 3C8.69 3 6 6 6 9h12c0-3-2.69-6-6-6z"/><line x1="4" y1="11" x2="20" y2="11"/><line x1="10" y1="22" x2="10" y2="15"/><line x1="14" y1="22" x2="14" y2="15"/></svg> },
    { id:'modern',    label:'Modern',     Icon: ({s=20}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="8" y="2" width="8" height="20"/><rect x="2" y="9" width="6" height="13"/><rect x="16" y="6" width="6" height="16"/><line x1="1" y1="22" x2="23" y2="22"/><line x1="10" y1="7" x2="14" y2="7"/><line x1="10" y1="12" x2="14" y2="12"/></svg> },
    { id:'adventure', label:'Adventure',  Icon: ({s=20}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="9"/><polygon points="12,7 14,12 12,9.5 10,12" fill="currentColor" stroke="none"/><polygon points="12,17 10,12 12,14.5 14,12" fill="currentColor" stroke="none" opacity="0.4"/><line x1="12" y1="2" x2="12" y2="4"/><line x1="12" y1="20" x2="12" y2="22"/><line x1="2" y1="12" x2="4" y2="12"/><line x1="20" y1="12" x2="22" y2="12"/></svg> },
    { id:'family',    label:'Family',     Icon: ({s=20}) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="5" r="2.5"/><path d="M4 22v-5a4 4 0 018 0v5"/><circle cx="17" cy="6" r="2"/><path d="M13.5 22v-4a3.5 3.5 0 017 0v4"/></svg> },
  ];

  return (
    <>
      <style>{CSS}</style>
      <div style={{ background:'#fff', minHeight:'100vh', fontFamily:'var(--font-body)' }}>

        {/* ═══════════════════════════════════════
            HERO — Dubai food photography + skyline
        ═══════════════════════════════════════ */}
        <div style={{
          position:'relative',
          backgroundImage:'url(https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1920&q=80)',
          backgroundSize:'cover',
          backgroundPosition:'center center',
          backgroundRepeat:'no-repeat',
          minHeight: isMobile ? '100svh' : '90vh',
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          padding: isMobile ? '80px 16px 60px' : '80px 24px 80px',
          overflow:'hidden',
        }}>
          {/* White overlay — lightens the city photo for dark text readability */}
          <div aria-hidden style={{ position:'absolute', inset:0, background:'linear-gradient(to bottom, rgba(255,255,255,0.72) 0%, rgba(255,255,255,0.60) 55%, rgba(255,255,255,0.70) 100%)', pointerEvents:'none' }} />

          {/* Hero content */}
          <div style={{ position:'relative', zIndex:2, textAlign:'center', maxWidth:'720px', marginBottom:'40px', animation:'fadeSlideUp 0.8s ease both' }}>
            <div style={{ display:'inline-flex', alignItems:'center', gap:'8px', background:'rgba(177,19,47,0.08)', border:'1px solid rgba(177,19,47,0.25)', borderRadius:'20px', padding:'5px 16px', marginBottom:'24px' }}>
              <span style={{ fontSize:'11px', fontWeight:700, color:'#b1132f', letterSpacing:'1.2px', textTransform:'uppercase' }}>Your Gateway to Dubai</span>
            </div>
            <h1 style={{ fontFamily:'var(--font-headline)', fontWeight:800, fontSize: isMobile ? '36px' : '60px', color:'#1a1a1a', lineHeight:1.08, letterSpacing:'-0.03em', margin:'0 0 16px' }}>
              Find your perfect<br />
              <span style={{ color:'#b1132f' }}>Dubai experience</span>
            </h1>
            <p style={{ fontSize: isMobile ? '16px' : '18px', color:'#555', margin:0, fontWeight:400 }}>
              Flights, hotels &amp; packages — curated for every traveller
            </p>
          </div>

          {/* Booking tabs + search */}
          <div style={{ position:'relative', zIndex:2, width:'100%', maxWidth:'980px', animation:'fadeSlideUp 0.9s 0.12s ease both' }}>
            {/* Tab switcher */}
            <div style={{ display:'flex', justifyContent: isMobile ? 'center' : 'flex-start', gap:'4px', marginBottom:'16px' }}>
              {TABS.map(({ id, label, Icon }) => (
                <button key={id} onClick={() => { setTab(id); setActiveSec(null); }} style={{
                  display:'flex', alignItems:'center', gap:'6px',
                  padding:'8px 18px', borderRadius:'24px',
                  background: tab===id ? '#b1132f' : 'rgba(255,255,255,0.75)',
                  color: tab===id ? '#fff' : '#333',
                  border: tab===id ? 'none' : '1px solid rgba(0,0,0,0.12)',
                  cursor:'pointer',
                  fontWeight: tab===id ? 700 : 500, fontSize:'13px',
                  backdropFilter:'blur(8px)',
                  boxShadow: tab===id ? '0 2px 10px rgba(177,19,47,0.35)' : '0 1px 4px rgba(0,0,0,0.08)',
                  transition:'all 0.2s',
                }}>
                  <Icon />{label}
                </button>
              ))}
            </div>

            {/* Round-trip toggle for flights */}
            {tab === 'flights' && !isMobile && (
              <div style={{ display:'inline-flex', background:'rgba(255,255,255,0.6)', backdropFilter:'blur(8px)', border:'1px solid rgba(0,0,0,0.1)', borderRadius:'10px', padding:'3px', marginBottom:'12px' }}>
                {[['one','One Way'],['round','Round Trip'],['multi','Multi-City']].map(([v,l]) => (
                  <button key={v} onClick={() => setTripType(v)} style={{ padding:'6px 18px', borderRadius:'7px', border:'none', background: tripType===v ? '#fff' : 'transparent', color: tripType===v ? '#b1132f' : '#555', fontWeight: tripType===v ? 600 : 500, fontSize:'12px', cursor:'pointer', boxShadow: tripType===v ? '0 1px 5px rgba(0,0,0,0.12)' : 'none', transition:'all 0.15s', whiteSpace:'nowrap' }}>{l}</button>
                ))}
              </div>
            )}

            {isMobile ? SearchCardMobile : SearchPillDesktop}
            {formError && (
              <div style={{ marginTop:'10px', textAlign:'center' }}>
                <span style={{ display:'inline-block', background:'rgba(177,19,47,0.08)', border:'1px solid rgba(177,19,47,0.25)', color:'#b1132f', borderRadius:'20px', padding:'6px 16px', fontSize:'13px', fontWeight:600 }}>{formError}</span>
              </div>
            )}
          </div>

        </div>

        {/* ═══════════════════════════════════════
            LIVE SEARCH RESULTS
        ═══════════════════════════════════════ */}
        <div ref={resultsRef} style={{ scrollMarginTop: '80px' }}>
          <TravelSearchResults state={searchState} onBook={handleBook} onFallbackClick={handleFallbackClick} />
        </div>

        {/* ═══════════════════════════════════════
            CATEGORY BAR
        ═══════════════════════════════════════ */}
        <div style={{ borderBottom:'1px solid #ebebeb', background:'#fff', position:'sticky', top:0, zIndex:50, boxShadow:'0 1px 4px rgba(0,0,0,0.05)' }}>
          <div style={{ maxWidth:'1080px', margin:'0 auto', padding:'0 24px', overflowX:'auto', display:'flex', gap:'0', justifyContent: isMobile ? 'flex-start' : 'center', scrollbarWidth:'none' }}>
            {CATS.map(cat => (
              <button key={cat.id} className="cat-chip" onClick={() => setActiveCat(cat.id)} style={{
                display:'flex', flexDirection:'column', alignItems:'center', gap:'6px',
                padding:'14px 20px', background:'transparent', border:'none', cursor:'pointer',
                borderBottom:`2px solid ${activeCat===cat.id ? '#b1132f' : 'transparent'}`,
                color: activeCat===cat.id ? '#b1132f' : '#717171',
                whiteSpace:'nowrap', flexShrink:0, transition:'all 0.18s',
              }}>
                <cat.Icon s={20} />
                <span style={{ fontSize:'11px', fontWeight: activeCat===cat.id ? 700 : 500 }}>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════
            EXPLORE DUBAI — full-width slider
        ═══════════════════════════════════════ */}
        <div style={{ padding: isMobile ? '48px 0 48px' : '64px 0 64px' }}>
          {/* Header — centered title, arrows on the right */}
          <div style={{ position:'relative', textAlign:'center', marginBottom:'48px', padding: isMobile ? '0 16px' : '0 80px' }}>
            <h2 style={{ fontFamily:'var(--font-headline)', fontWeight:800, fontSize:'clamp(20px,3vw,28px)', color:'#222', letterSpacing:'-0.025em', margin:'0 0 6px' }}>Explore Dubai</h2>
            <p style={{ fontSize:'14px', color:'#717171', margin:0 }}>Most-loved spots from the iconic to the hidden</p>
            {!isMobile && (
              <div style={{ position:'absolute', right:'24px', top:'50%', transform:'translateY(-50%)', display:'flex', gap:'8px' }}>
                {[-1, 1].map(dir => (
                  <button key={dir} onClick={() => scrollDest(dir)}
                    style={{ width:'42px', height:'42px', borderRadius:'50%', border:'1px solid #ddd', background:'#fff', display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', boxShadow:'0 1px 4px rgba(0,0,0,0.08)', transition:'all 0.15s' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor='#222'; e.currentTarget.style.background='#f7f7f7'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor='#ddd'; e.currentTarget.style.background='#fff'; }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      {dir === -1 ? <polyline points="15,18 9,12 15,6" /> : <polyline points="9,18 15,12 9,6" />}
                    </svg>
                  </button>
                ))}
              </div>
            )}
          </div>
          {/* Full-width scrollable track — starts from screen edge */}
          <div ref={destSliderRef} style={{ display:'flex', gap:'16px', overflowX:'auto', paddingLeft: isMobile ? '16px' : '24px', paddingRight: isMobile ? '16px' : '24px', paddingBottom:'8px', scrollbarWidth:'none', WebkitOverflowScrolling:'touch' }}>
            {DESTINATIONS.map((d, i) => <DestCard key={i} d={d} />)}
            <div style={{ flexShrink:0, width:'4px' }} />
          </div>
        </div>

        {/* ═══════════════════════════════════════
            TOP ROUTES TO DUBAI
        ═══════════════════════════════════════ */}
        <div style={{ background:'#f7f7f7', padding: isMobile ? '48px 16px' : '64px 24px' }}>
          <div style={{ maxWidth:'1080px', margin:'0 auto' }}>
            <SectionHead title="Top Flights to Dubai" sub="Competitive fares from cities around the world" action={{ label:'All routes', fn:()=>{} }} />
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap:'14px' }}>
              {routeCards.map((r, i) => <RouteCard key={r.code || i} r={r} onClick={handleRouteClick} />)}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════
            DUBAI PACKAGES — editorial layout
        ═══════════════════════════════════════ */}
        <div style={{ maxWidth:'1080px', margin:'0 auto', padding: isMobile ? '48px 16px' : '64px 24px' }}>
          <SectionHead title="Dubai Packages" sub="Everything included — flights, hotels &amp; experiences" action={{ label:'View all', fn:()=>{} }} />
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gridTemplateRows:'auto auto', gap:'16px' }}>
            {/* Big card */}
            <div style={{ gridRow: isMobile ? 'auto' : '1 / 3', borderRadius:'20px', overflow:'hidden', background:'#111', cursor:'pointer', position:'relative', minHeight:'320px', display:'flex', flexDirection:'column', justifyContent:'flex-end', transition:'all 0.25s' }}
              onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 32px rgba(0,0,0,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
              <img src={PACKAGES[0].img} alt={PACKAGES[0].title} loading="lazy" decoding="async" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
              <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.75) 0%, rgba(0,0,0,0.15) 60%, transparent 100%)' }} />
              <div style={{ position:'relative', padding:'28px' }}>
                <span style={{ display:'inline-block', background:'rgba(201,160,80,0.9)', color:'#1a0f05', fontSize:'10px', fontWeight:800, letterSpacing:'1px', textTransform:'uppercase', padding:'4px 10px', borderRadius:'4px', marginBottom:'10px' }}>{PACKAGES[0].badge}</span>
                <div style={{ fontWeight:800, fontSize:'22px', color:'#fff', letterSpacing:'-0.02em', marginBottom:'5px' }}>{PACKAGES[0].title}</div>
                <div style={{ fontSize:'13px', color:'rgba(255,255,255,0.65)', marginBottom:'14px' }}>{PACKAGES[0].sub}</div>
                <div style={{ display:'flex', alignItems:'baseline', gap:'8px' }}>
                  <span style={{ fontWeight:800, fontSize:'24px', color:'#fff' }}>{PACKAGES[0].price}</span>
                  <span style={{ fontSize:'13px', color:'rgba(255,255,255,0.5)', textDecoration:'line-through' }}>{PACKAGES[0].orig}</span>
                </div>
              </div>
            </div>
            {/* Smaller cards */}
            {PACKAGES.slice(1).map((p, i) => (
              <div key={i} style={{ borderRadius:'20px', overflow:'hidden', background:'#111', cursor:'pointer', minHeight:'148px', display:'flex', flexDirection:'column', justifyContent:'flex-end', position:'relative', transition:'all 0.25s' }}
                onMouseEnter={e => { e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.boxShadow='0 8px 24px rgba(0,0,0,0.2)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='none'; }}>
                <img src={p.img} alt={p.title} loading="lazy" decoding="async" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
                <div style={{ position:'absolute', inset:0, background:'linear-gradient(to top, rgba(0,0,0,0.68) 0%, transparent 100%)' }} />
                <div style={{ position:'relative', padding:'20px' }}>
                  <span style={{ display:'inline-block', background:'rgba(255,255,255,0.2)', color:'#fff', fontSize:'9px', fontWeight:800, letterSpacing:'1px', textTransform:'uppercase', padding:'3px 8px', borderRadius:'4px', marginBottom:'7px' }}>{p.badge}</span>
                  <div style={{ fontWeight:700, fontSize:'16px', color:'#fff', letterSpacing:'-0.01em', marginBottom:'3px' }}>{p.title}</div>
                  <div style={{ fontSize:'11px', color:'rgba(255,255,255,0.55)', marginBottom:'8px' }}>{p.sub}</div>
                  <div style={{ display:'flex', alignItems:'baseline', gap:'6px' }}>
                    <span style={{ fontWeight:800, fontSize:'18px', color:'#fff' }}>{p.price}</span>
                    <span style={{ fontSize:'12px', color:'rgba(255,255,255,0.45)', textDecoration:'line-through' }}>{p.orig}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════
            STATS DIVIDER
        ═══════════════════════════════════════ */}
        <div style={{ borderTop:'1px solid #ebebeb', borderBottom:'1px solid #ebebeb', background:'#fff', padding: isMobile ? '32px 16px' : '40px 24px' }}>
          <div style={{ maxWidth:'1080px', margin:'0 auto', display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap:'24px' }}>
            {[['2,000,000+','Happy travellers booked'],['500+','Curated Dubai hotels'],['200+','Global airline partners'],['4.9 / 5','Average rating from guests']].map(([n,l]) => (
              <div key={l} style={{ textAlign:'center' }}>
                <div style={{ fontWeight:800, fontSize:'26px', color:'#222', letterSpacing:'-0.03em', marginBottom:'4px' }}>{n}</div>
                <div style={{ fontSize:'13px', color:'#717171' }}>{l}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════
            SEASON GUIDE
        ═══════════════════════════════════════ */}
        <div style={{ background:'#f7f7f7' }}>
          <SeasonGuide isMobile={isMobile} />
        </div>

        {/* ═══════════════════════════════════════
            WHY BOOK WITH US
        ═══════════════════════════════════════ */}
        <div style={{ maxWidth:'1080px', margin:'0 auto', padding: isMobile ? '48px 16px' : '64px 24px' }}>
          <SectionHead title="Why book with Travel to Dubai" sub="Built around a single promise — your perfect Dubai trip" />
          <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4,1fr)', gap:'16px' }}>
            {TRUST.map(({ Icon, title, desc }) => (
              <div key={title} style={{ background:'#fff', border:'1px solid #ebebeb', borderRadius:'18px', padding:'24px 20px', transition:'all 0.22s', cursor:'default' }}
                onMouseEnter={e => { e.currentTarget.style.boxShadow='0 4px 20px rgba(0,0,0,0.09)'; e.currentTarget.style.transform='translateY(-3px)'; e.currentTarget.style.borderColor='#d0d0d0'; }}
                onMouseLeave={e => { e.currentTarget.style.boxShadow='none'; e.currentTarget.style.transform='none'; e.currentTarget.style.borderColor='#ebebeb'; }}>
                <div style={{ color:'#b1132f', marginBottom:'14px', opacity:0.9 }}><Icon /></div>
                <div style={{ fontWeight:700, fontSize:'14px', color:'#222', marginBottom:'7px' }}>{title}</div>
                <div style={{ fontSize:'13px', color:'#717171', lineHeight:1.65 }}>{desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* ═══════════════════════════════════════
            EXCLUSIVE DEALS
        ═══════════════════════════════════════ */}
        <div style={{ background:'#f7f7f7', padding: isMobile ? '48px 16px 64px' : '64px 24px 80px' }}>
          <div style={{ maxWidth:'1080px', margin:'0 auto' }}>
            <SectionHead title="Exclusive Dubai Deals" sub={liveHotels ? 'Live hotel prices — refreshed daily' : 'Hand-picked offers — refreshed daily'} action={{ label:'View all deals', fn:()=>{} }} />
            <div style={{ display:'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3,1fr)', gap:'18px' }}>
              {dealCards.map((deal, i) => <DealCard key={deal.title || i} deal={deal} onClick={handleDealClick} />)}
            </div>
          </div>
        </div>

        {/* ═══════════════════════════════════════
            BOTTOM CTA STRIP
        ═══════════════════════════════════════ */}
        <div style={{ position:'relative', padding: isMobile ? '48px 16px' : '80px 24px', textAlign:'center', overflow:'hidden' }}>
          <img src="https://images.unsplash.com/photo-1578895101408-1a36b834405b?auto=format&fit=crop&w=1920&q=80" alt="" aria-hidden loading="lazy" decoding="async" style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover' }} />
          <div aria-hidden style={{ position:'absolute', inset:0, background:'linear-gradient(135deg, rgba(10,6,18,0.82) 0%, rgba(20,10,10,0.75) 100%)' }} />
          <div style={{ position:'relative', maxWidth:'560px', margin:'0 auto' }}>
            <div style={{ fontWeight:800, fontSize: isMobile ? '24px' : '32px', color:'#fff', letterSpacing:'-0.025em', marginBottom:'12px', lineHeight:1.2 }}>
              Start planning your<br />Dubai trip today
            </div>
            <p style={{ fontSize:'15px', color:'rgba(255,255,255,0.5)', marginBottom:'28px', lineHeight:1.6 }}>
              Thousands of travellers book their dream Dubai escape with us every month.
            </p>
            <button style={{ height:'52px', padding:'0 36px', background:'linear-gradient(135deg, #b1132f, #8e0f26)', color:'#fff', border:'none', borderRadius:'52px', cursor:'pointer', fontWeight:700, fontSize:'15px', boxShadow:'0 2px 12px rgba(177,19,47,0.45)', transition:'all 0.2s', letterSpacing:'0.2px' }}
              onMouseEnter={e => { e.currentTarget.style.transform='scale(1.03)'; e.currentTarget.style.boxShadow='0 4px 20px rgba(177,19,47,0.55)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform='none'; e.currentTarget.style.boxShadow='0 2px 12px rgba(177,19,47,0.45)'; }}>
              Search flights to Dubai
            </button>
          </div>
        </div>

      </div>
    </>
  );
}
