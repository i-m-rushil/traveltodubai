import { Link } from 'react-router-dom';
import { useIsMobile } from '../hooks/useIsMobile';

export default function PlanTripPromo() {
  const isMobile = useIsMobile();

  return (
    <section style={{ background: '#fff', padding: isMobile ? '40px 0' : '64px 0' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '0 16px' : '0 24px' }}>
        <div style={{
          position: 'relative', overflow: 'hidden', borderRadius: '16px',
          background: `linear-gradient(120deg, rgba(29,37,44,0.94) 0%, rgba(29,37,44,0.78) 55%, rgba(29,37,44,0.35) 100%), url("https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1280&q=70&auto=format&fit=crop")`,
          backgroundSize: 'cover', backgroundPosition: 'center',
          boxShadow: 'var(--shadow-lg)',
          padding: isMobile ? '36px 24px' : '56px 64px',
        }}>
          <span style={{
            fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '11px',
            letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--gold)',
            display: 'block', marginBottom: '12px',
          }}>
            ✈ Plan Your Trip
          </span>

          <h2 style={{
            fontFamily: 'var(--font-headline)', fontWeight: 800,
            fontSize: isMobile ? '26px' : '38px', color: '#fff',
            lineHeight: 1.15, margin: '0 0 14px', maxWidth: '620px',
          }}>
            Book flights &amp; hotels to Dubai — all in one place
          </h2>

          <p style={{
            fontFamily: 'var(--font-body)', fontWeight: 300,
            fontSize: isMobile ? '14px' : '16px', color: 'rgba(255,255,255,0.78)',
            lineHeight: 1.65, margin: '0 0 28px', maxWidth: '540px',
          }}>
            Compare live fares and the best hotel deals, get visa and travel tips,
            and build your perfect Dubai itinerary.
          </p>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '12px' }}>
            <Link to="/plan-trip" style={{
              background: 'var(--brand)', color: '#fff',
              fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '13px',
              letterSpacing: '0.5px', padding: '13px 26px', borderRadius: '8px',
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              textDecoration: 'none', transition: 'all 0.2s',
              boxShadow: '0 4px 16px rgba(177,19,47,0.35)',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-dark)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'var(--brand)'; e.currentTarget.style.transform = 'none'; }}
            >
              Search Flights ✈
            </Link>
            <Link to="/plan-trip" style={{
              background: 'rgba(255,255,255,0.12)', color: '#fff',
              fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '13px',
              letterSpacing: '0.5px', padding: '13px 26px', borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.3)',
              display: 'inline-flex', alignItems: 'center', gap: '8px',
              textDecoration: 'none', transition: 'all 0.2s', backdropFilter: 'blur(4px)',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.22)'; }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; }}
            >
              Find Hotels 🏨
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
