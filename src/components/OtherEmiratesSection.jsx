import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '../hooks/useIsMobile';
import { emirates as EMIRATES } from '../data/mockData';

export default function OtherEmiratesSection() {
  const isMobile = useIsMobile();

  return (
    <section style={{ background: 'var(--sand)', padding: isMobile ? '40px 0' : '64px 0' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '0 16px' : '0 24px' }}>

        {/* Section header — matches RecentSection */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '4px', height: '28px', background: 'var(--brand)', borderRadius: '2px' }} />
            <h2 style={{
              fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '18px',
              letterSpacing: '0.5px', color: 'var(--text-dark)', margin: 0,
            }}>
              Other Emirates
            </h2>
          </div>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          <Link to="/other-emirates" style={{
            fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '12px',
            letterSpacing: '0.5px', color: 'var(--brand)',
            display: 'flex', alignItems: 'center', gap: '4px',
            padding: '6px 14px', border: '1px solid var(--brand)',
            borderRadius: '6px', transition: 'all 0.2s', textDecoration: 'none',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--brand)'; }}
          >
            View All <Arr />
          </Link>
        </div>

        {/* Emirates grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(3, 1fr)',
          gap: isMobile ? '12px' : '20px',
        }}>
          {EMIRATES.map(em => (
            <EmirateCard key={em.slug} emirate={em} />
          ))}
        </div>
      </div>
    </section>
  );
}

function EmirateCard({ emirate }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link to={`/emirate/${emirate.slug}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative', display: 'block', overflow: 'hidden',
        borderRadius: '14px', paddingBottom: '60%',
        boxShadow: hovered ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        transition: 'box-shadow 0.3s, transform 0.3s',
        transform: hovered ? 'translateY(-3px)' : 'none',
        textDecoration: 'none', background: '#e8ecf0',
      }}
    >
      <img src={emirate.img} alt={emirate.label} loading="lazy" decoding="async"
        style={{
          position: 'absolute', inset: 0, width: '100%', height: '100%',
          objectFit: 'cover', transform: hovered ? 'scale(1.06)' : 'scale(1)',
          transition: 'transform 0.5s ease',
        }}
      />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.1) 55%, transparent 100%)',
      }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '18px 20px' }}>
        <div style={{
          fontFamily: 'var(--font-headline)', fontWeight: 700,
          fontSize: '19px', color: '#fff', lineHeight: 1.2,
        }}>
          {emirate.label}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 5 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', flexShrink: 0 }} />
          <span style={{
            fontFamily: 'var(--font-ui)', fontSize: '12px', fontWeight: 600,
            color: 'rgba(255,255,255,0.85)', letterSpacing: '0.2px',
          }}>
            {emirate.specialty}
          </span>
        </div>
      </div>
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px',
        background: 'var(--brand)',
        transform: hovered ? 'scaleX(1)' : 'scaleX(0)',
        transformOrigin: 'left', transition: 'transform 0.25s ease',
      }} />
    </Link>
  );
}

function Arr() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>; }
