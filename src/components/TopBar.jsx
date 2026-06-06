import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '../hooks/useIsMobile';

const CURRENCY_RATES = [
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

const PRAYER_TIMES = [
  { name: 'Fajr',    time: '4:07 AM',  icon: <FajrIcon /> },
  { name: 'Sunrise', time: '5:42 AM',  icon: <SunriseIcon /> },
  { name: 'Dhuhr',   time: '12:28 PM', icon: <DhuhrIcon /> },
  { name: 'Asr',     time: '3:50 PM',  icon: <AsrIcon /> },
  { name: 'Maghrib', time: '7:13 PM',  icon: <MaghribIcon /> },
  { name: 'Isha',    time: '8:43 PM',  icon: <IshaIcon /> },
];

/* ── Prayer time SVG icons — clean minimal strokes ── */

// Fajr: crescent moon (pre-dawn)
function FajrIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#C9A050" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  );
}

// Sunrise: horizon line + half-circle sun + 3 rays above
function SunriseIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#e59c20" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 12a5 5 0 0 0-10 0"/>
      <line x1="12" y1="2"  x2="12" y2="4"/>
      <line x1="4.22" y1="6.22" x2="5.64" y2="7.64"/>
      <line x1="19.78" y1="6.22" x2="18.36" y2="7.64"/>
      <line x1="2"  y1="12" x2="4"  y2="12"/>
      <line x1="20" y1="12" x2="22" y2="12"/>
      <line x1="2"  y1="17" x2="22" y2="17"/>
      <polyline points="10 21 12 17 14 21"/>
    </svg>
  );
}

// Dhuhr: full sun with 8 rays (noon)
function DhuhrIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#f0b429" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4"/>
      <line x1="12" y1="2"  x2="12" y2="4"/>
      <line x1="12" y1="20" x2="12" y2="22"/>
      <line x1="2"  y1="12" x2="4"  y2="12"/>
      <line x1="20" y1="12" x2="22" y2="12"/>
      <line x1="4.93" y1="4.93" x2="6.34" y2="6.34"/>
      <line x1="17.66" y1="17.66" x2="19.07" y2="19.07"/>
      <line x1="19.07" y1="4.93" x2="17.66" y2="6.34"/>
      <line x1="6.34" y1="17.66" x2="4.93" y2="19.07"/>
    </svg>
  );
}

// Asr: sun above horizon, longer shadow below (afternoon)
function AsrIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#e08c10" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="10" r="4"/>
      <line x1="12" y1="2"  x2="12" y2="4"/>
      <line x1="4.93" y1="4.93" x2="6.34" y2="6.34"/>
      <line x1="19.07" y1="4.93" x2="17.66" y2="6.34"/>
      <line x1="2"  y1="10" x2="4"  y2="10"/>
      <line x1="20" y1="10" x2="22" y2="10"/>
      <line x1="3"  y1="19" x2="21" y2="19"/>
    </svg>
  );
}

// Maghrib: sun touching/below horizon line (sunset)
function MaghribIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#d96b2b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 17a5 5 0 0 0-10 0"/>
      <line x1="12" y1="9"  x2="12" y2="7"/>
      <line x1="6.34" y1="11.34" x2="4.93" y2="9.93"/>
      <line x1="17.66" y1="11.34" x2="19.07" y2="9.93"/>
      <line x1="2"  y1="17" x2="22" y2="17"/>
    </svg>
  );
}

// Isha: crescent + single 4-pointed star (night)
function IshaIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#a78bca" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
      <line x1="19" y1="3" x2="19" y2="5"/>
      <line x1="18" y1="4" x2="20" y2="4"/>
    </svg>
  );
}

/* ── Shared chevron ── */
function Chevron({ open }) {
  return (
    <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"
      style={{ transition: 'transform 0.22s', transform: open ? 'rotate(180deg)' : 'rotate(0deg)', flexShrink: 0 }}
    >
      <polyline points="6 9 12 15 18 9"/>
    </svg>
  );
}

/* ── Currency widget (click-toggle) ── */
function CurrencyWidget() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    if (!open) return;
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(s => !s)} style={{
        fontFamily: 'var(--font-ui)', fontSize: '12px', fontWeight: 600,
        color: open ? 'var(--gold)' : '#fff', letterSpacing: '0.3px',
        display: 'flex', alignItems: 'center', gap: 5,
        whiteSpace: 'nowrap', background: 'transparent', padding: 0,
        cursor: 'pointer', transition: 'color 0.18s',
        border: 'none',
      }}>
        <CurrencyIcon />
        1 AED = 0.27 USD
        <Chevron open={open} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 12px)', left: '50%',
          transform: 'translateX(-50%)',
          background: '#fff', borderRadius: 10,
          boxShadow: '0 16px 48px rgba(0,0,0,0.22)',
          border: '1px solid var(--border)',
          zIndex: 2000, minWidth: 256,
          overflow: 'hidden',
        }}>
          <div style={{ padding: '12px 16px 10px', borderBottom: '1px solid var(--border)', background: 'var(--midnight)' }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: 11, color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              AED Exchange Rates
            </div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>
              1 AED equals — rates are indicative
            </div>
          </div>

          <div style={{ maxHeight: 280, overflowY: 'auto', padding: '6px 8px' }}>
            {CURRENCY_RATES.map(({ code, flag, name, rate }) => (
              <div key={code} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '6px 8px', borderRadius: 6, transition: 'background 0.12s', cursor: 'default',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--sand)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
                  <span style={{ fontSize: 15, lineHeight: 1 }}>{flag}</span>
                  <div>
                    <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 12, color: 'var(--text-dark)', lineHeight: 1.2 }}>{code}</div>
                    <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'var(--text-light)', lineHeight: 1.2 }}>{name}</div>
                  </div>
                </div>
                <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: 12, color: 'var(--brand)' }}>
                  {rate < 1 ? rate.toFixed(4) : rate < 10 ? rate.toFixed(2) : rate.toFixed(1)}
                </div>
              </div>
            ))}
          </div>

          <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border)', background: 'var(--sand)' }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 9, color: 'var(--text-light)' }}>
              Rates updated daily. For travel use only.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Prayer times widget (click-toggle) ── */
function PrayerTimesWidget() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const today = new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

  useEffect(() => {
    if (!open) return;
    function handler(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen(s => !s)} style={{
        fontFamily: 'var(--font-ui)', fontSize: '12px', fontWeight: 600,
        color: open ? 'var(--gold)' : '#fff', letterSpacing: '0.3px',
        display: 'flex', alignItems: 'center', gap: 5,
        whiteSpace: 'nowrap', background: 'transparent', padding: 0,
        cursor: 'pointer', transition: 'color 0.18s',
        border: 'none',
      }}>
        <MosqueIcon />
        Prayer Times
        <Chevron open={open} />
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: 'calc(100% + 12px)', left: '50%',
          transform: 'translateX(-50%)',
          background: '#fff', borderRadius: 10,
          boxShadow: '0 16px 48px rgba(0,0,0,0.22)',
          border: '1px solid var(--border)',
          zIndex: 2000, minWidth: 220,
          overflow: 'hidden',
        }}>
          <div style={{ padding: '12px 16px 10px', borderBottom: '1px solid var(--border)', background: 'var(--midnight)' }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: 11, color: '#fff', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
              Dubai Prayer Times
            </div>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 3 }}>
              {today} · Dubai, UAE
            </div>
          </div>

          <div style={{ padding: '6px 0' }}>
            {PRAYER_TIMES.map(({ name, time, icon }) => (
              <div key={name} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '9px 16px', transition: 'background 0.12s', cursor: 'default',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--sand)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  {icon}
                  <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 13, color: 'var(--text-dark)' }}>{name}</span>
                </div>
                <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13, color: 'var(--brand)' }}>{time}</span>
              </div>
            ))}
          </div>

          <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border)', background: 'var(--sand)' }}>
            <div style={{ fontFamily: 'var(--font-ui)', fontSize: 9, color: 'var(--text-light)' }}>
              Times are approximate for Dubai. Verify locally.
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── TopBar ── */
export default function TopBar() {
  const isMobile = useIsMobile();
  const [dubaiTime, setDubaiTime] = useState('');
  const [temp] = useState('36°C');

  useEffect(() => {
    const update = () => {
      const t = new Date().toLocaleTimeString('en-US', {
        timeZone: 'Asia/Dubai', hour: '2-digit', minute: '2-digit', hour12: true,
      });
      setDubaiTime(t);
    };
    update();
    const id = setInterval(update, 30000);
    return () => clearInterval(id);
  }, []);

  if (isMobile) return null;

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div style={{ background: 'var(--brand)', borderBottom: '1px solid rgba(201,160,80,0.3)' }}>
      <div style={{
        maxWidth: '1280px', margin: '0 auto', padding: '0 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        height: '46px', gap: '16px',
      }}>

        {/* Left: Date */}
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', color: '#fff', letterSpacing: '0.3px', whiteSpace: 'nowrap' }}>
          {today}
        </span>

        {/* Center: Quick info */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', fontWeight: 500, color: '#fff', letterSpacing: '0.3px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5 }}>
            <SunIcon /> Dubai {temp}
          </span>

          <span style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', fontWeight: 500, color: '#fff', letterSpacing: '0.3px', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 5 }}>
            <ClockIcon /> UAE Time: {dubaiTime}
          </span>

          <CurrencyWidget />

          <PrayerTimesWidget />

          <a href="#" style={{ fontFamily: 'var(--font-ui)', fontSize: '12px', fontWeight: 500, color: '#fff', letterSpacing: '0.3px', whiteSpace: 'nowrap', transition: 'color 0.2s', display: 'flex', alignItems: 'center', gap: 5 }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
            onMouseLeave={e => e.currentTarget.style.color = '#fff'}
          >
            <PlaneIcon /> DXB Airport Live
          </a>
        </div>

        {/* Right: Social + Subscribe */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {[
            { label: 'Instagram', icon: <IgIcon /> },
            { label: 'TikTok',    icon: <TkIcon /> },
            { label: 'YouTube',   icon: <YtIcon /> },
          ].map(({ label, icon }) => (
            <a key={label} href="#" aria-label={label} style={{ color: '#fff', display: 'flex', alignItems: 'center', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
              onMouseLeave={e => e.currentTarget.style.color = '#fff'}
            >
              {icon}
            </a>
          ))}
          <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.12)' }} />
          <Link to="/login" style={{
            background: 'linear-gradient(135deg, var(--gold) 0%, var(--gold-dark) 100%)',
            color: 'var(--midnight)', fontFamily: 'var(--font-ui)', fontWeight: 700,
            fontSize: '11px', letterSpacing: '1px', textTransform: 'uppercase',
            padding: '5px 14px', borderRadius: '3px', whiteSpace: 'nowrap', transition: 'opacity 0.2s',
            textDecoration: 'none',
          }}
            onMouseEnter={e => e.currentTarget.style.opacity = '0.85'}
            onMouseLeave={e => e.currentTarget.style.opacity = '1'}
          >
            Login
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ── Generic SVG icons ── */
function SunIcon()      { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>; }
function ClockIcon()    { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function CurrencyIcon() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>; }
function MosqueIcon()   {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {/* main dome */}
      <path d="M4 12 Q4 6 12 6 Q20 6 20 12"/>
      {/* left minaret */}
      <rect x="2" y="10" width="3" height="9" rx="0.5"/>
      <path d="M2 10 Q3.5 7 5 10"/>
      {/* right minaret */}
      <rect x="19" y="10" width="3" height="9" rx="0.5"/>
      <path d="M19 10 Q20.5 7 22 10"/>
      {/* base / floor */}
      <line x1="2" y1="19" x2="22" y2="19"/>
      {/* door */}
      <path d="M10 19 L10 15 Q12 13 14 15 L14 19"/>
      {/* small finial on dome */}
      <line x1="12" y1="6" x2="12" y2="4"/>
      <circle cx="12" cy="3.5" r="0.7" fill="currentColor"/>
    </svg>
  );
}
function PlaneIcon()    { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.8 19.2 16 11l3.5-3.5C21 6 21 4 19 4c-2 0-2.5 0-3.5 1L12 9 3.8 6.2A.5.5 0 0 0 3 6.5l1.7 8.7c.2.9.8 1.7 1.7 2l4.6 1.3 1.4 1.4c.2.2.5.3.8.3h.7c.4 0 .8-.3.9-.7l.7-2.1z"/></svg>; }
function IgIcon()       { return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>; }
function TkIcon()       { return <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.79 1.52V6.76a4.85 4.85 0 0 1-1.02-.07z"/></svg>; }
function YtIcon()       { return <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="#1d252c"/></svg>; }
