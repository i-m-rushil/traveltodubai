import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '../hooks/useIsMobile';
import OtherEmiratesSection from '../components/OtherEmiratesSection';

/*
 * "Other Emirates" landing page — reached from the More ▸ Other Emirates menu.
 * Shows the grid of emirates; each card links to its own /emirate/:slug page.
 */
export default function OtherEmiratesPage() {
  const isMobile = useIsMobile();

  useEffect(() => {
    document.title = 'Other Emirates – Beyond Dubai | Travel to Dubai';
  }, []);

  return (
    <div style={{ background: 'var(--sand)' }}>

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" style={{ background: '#fff', borderBottom: '1px solid var(--border)', padding: '10px 0' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--text-mid)', flexWrap: 'wrap' }}>
          <Link to="/" style={{ color: 'var(--text-mid)', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--brand)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-mid)'}
          >Home</Link>
          <span style={{ color: 'var(--gray-mid)' }}>›</span>
          <span style={{ color: 'var(--text-mid)' }}>More</span>
          <span style={{ color: 'var(--gray-mid)' }}>›</span>
          <span style={{ color: 'var(--brand)', fontWeight: 600 }}>Other Emirates</span>
        </div>
      </nav>

      {/* Hero */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        padding: isMobile ? '56px 20px' : '88px 20px',
        backgroundImage: 'linear-gradient(160deg, rgba(10,16,26,0.86) 0%, rgba(15,24,40,0.72) 60%, rgba(10,16,26,0.84) 100%), url(https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600&q=80&auto=format&fit=crop)',
        backgroundSize: 'cover', backgroundPosition: 'center',
      }}>
        <div style={{ maxWidth: 1240, margin: '0 auto' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(228,61,48,0.12)', border: '1px solid rgba(228,61,48,0.22)', borderRadius: 4, padding: '4px 13px', marginBottom: 22 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand)', display: 'inline-block' }} />
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--brand)' }}>
              Beyond Dubai
            </span>
          </div>
          <h1 style={{
            fontFamily: 'var(--font-headline)', fontWeight: 900,
            fontSize: isMobile ? 36 : 56,
            color: '#fff', lineHeight: 1.08, marginBottom: 14, letterSpacing: '-0.025em',
          }}>
            Other Emirates
          </h1>
          <p style={{
            fontFamily: 'var(--font-body)', fontWeight: 300,
            fontSize: isMobile ? 15 : 18,
            color: 'rgba(255,255,255,0.62)', maxWidth: 600, lineHeight: 1.7,
          }}>
            Explore the rest of the UAE — pick an emirate to plan your trip, find places
            to stay, discover where to eat, and see the best things to do.
          </p>
        </div>
      </section>

      {/* Emirate cards grid */}
      <OtherEmiratesSection />
    </div>
  );
}
