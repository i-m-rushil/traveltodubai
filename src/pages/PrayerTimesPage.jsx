import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '../hooks/useIsMobile';
import { prayerTimes as fallbackTimes, fetchPrayerTimes, PRAYER_LOCATIONS, DUBAI_LOCATION } from '../data/uaeInfo';

/* More ▸ Prayer Times — full-page UAE prayer schedule.
   Live from the Aladhan API using the official UAE method (Dubai, 18.2°),
   localized per emirate and cached per day. */
export default function PrayerTimesPage() {
  const isMobile = useIsMobile();
  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const [location, setLocation] = useState(DUBAI_LOCATION);
  const [times, setTimes] = useState(fallbackTimes);
  const [status, setStatus] = useState('loading'); // 'loading' | 'live' | 'fallback'

  useEffect(() => {
    document.title = 'Prayer Times – UAE | Travel to Dubai';
  }, []);

  useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    fetchPrayerTimes(location)
      .then(t => { if (!cancelled) { setTimes(t); setStatus('live'); } })
      .catch(() => { if (!cancelled) setStatus('fallback'); });
    return () => { cancelled = true; };
  }, [location]);

  return (
    <div style={{ background: 'var(--sand)', minHeight: '100vh' }}>

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" style={{ background: '#fff', borderBottom: '1px solid var(--border)', padding: '10px 0' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--text-mid)', flexWrap: 'wrap' }}>
          <Link to="/" style={{ color: 'var(--text-mid)', textDecoration: 'none' }}>Home</Link>
          <span style={{ color: 'var(--gray-mid)' }}>›</span>
          <span style={{ color: 'var(--text-mid)' }}>More</span>
          <span style={{ color: 'var(--gray-mid)' }}>›</span>
          <span style={{ color: 'var(--brand)', fontWeight: 600 }}>Prayer Times</span>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background: 'var(--midnight)', padding: isMobile ? '40px 20px' : '64px 20px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'var(--font-headline)', fontWeight: 900, fontSize: isMobile ? 30 : 44, color: '#fff', lineHeight: 1.1, marginBottom: 12 }}>
            {location.label} Prayer Times
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: isMobile ? 14 : 17, color: 'rgba(255,255,255,0.6)', lineHeight: 1.7 }}>
            {today} · {location.label}, UAE
          </p>
          <div style={{ marginTop: 14, display: 'inline-flex', alignItems: 'center', gap: 7, fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600, color: status === 'live' ? '#34d399' : 'rgba(255,255,255,0.5)' }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: status === 'live' ? '#34d399' : status === 'loading' ? 'var(--gold)' : 'rgba(255,255,255,0.4)', display: 'inline-block' }} />
            {status === 'live' ? 'Live · official UAE calculation method' : status === 'loading' ? 'Updating…' : 'Showing approximate times (offline)'}
          </div>
        </div>
      </section>

      {/* Emirate selector */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: isMobile ? '20px 16px 0' : '28px 20px 0' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {PRAYER_LOCATIONS.map(loc => {
            const active = loc.slug === location.slug;
            return (
              <button
                key={loc.slug}
                onClick={() => setLocation(loc)}
                style={{
                  fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600,
                  padding: '8px 16px', borderRadius: 20, cursor: 'pointer',
                  border: `1px solid ${active ? 'var(--brand)' : 'var(--border)'}`,
                  background: active ? 'var(--brand)' : '#fff',
                  color: active ? '#fff' : 'var(--text-mid)',
                  transition: 'all 0.18s',
                }}
                onMouseEnter={e => { if (!active) { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.color = 'var(--brand)'; } }}
                onMouseLeave={e => { if (!active) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-mid)'; } }}
              >
                {loc.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Prayer cards */}
      <div style={{ maxWidth: 720, margin: '0 auto', padding: isMobile ? '20px 16px 56px' : '28px 20px 72px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)', gap: 14, opacity: status === 'loading' ? 0.55 : 1, transition: 'opacity 0.2s' }}>
          {times.map(({ name, time }) => (
            <div key={name} style={{
              background: '#fff', borderRadius: 12, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)',
              padding: '22px 20px', textAlign: 'center',
            }}>
              <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13, color: 'var(--text-light)', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>
                {name}
              </div>
              <div style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: 24, color: 'var(--brand)' }}>
                {time}
              </div>
            </div>
          ))}
        </div>

        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-light)', marginTop: 18 }}>
          Calculated using the official UAE method (Dubai, 18.2°) so times align with the
          Awqaf azan schedule. Times may vary by a minute or two locally — verify with your
          nearest mosque.
        </p>
      </div>
    </div>
  );
}
