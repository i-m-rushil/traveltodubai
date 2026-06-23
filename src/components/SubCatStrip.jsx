import { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';

/* ─── Sub-category card (shown in the hero strip) ─── */
function SubCatCard({ item, to }) {
  const [hov, setHov] = useState(false);
  return (
    <Link
      to={to}
      style={{ textDecoration: 'none', flexShrink: 0, width: 148, display: 'block' }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <div style={{
        borderRadius: 12, overflow: 'hidden',
        border: hov ? '2px solid var(--brand)' : '2px solid rgba(255,255,255,0.1)',
        transform: hov ? 'translateY(-3px)' : 'none',
        transition: 'border-color 0.2s, transform 0.25s, box-shadow 0.25s',
        boxShadow: hov ? '0 8px 24px rgba(228,61,48,0.25)' : '0 2px 8px rgba(0,0,0,0.3)',
      }}>
        {/* Image */}
        <div style={{ position: 'relative', paddingBottom: '68%' }}>
          <img
            src={item.img}
            alt={item.label}
            loading="lazy"
            decoding="async"
            style={{
              position: 'absolute', inset: 0,
              width: '100%', height: '100%', objectFit: 'cover',
              transform: hov ? 'scale(1.08)' : 'scale(1)',
              transition: 'transform 0.4s ease',
            }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(0,0,0,0.72) 0%, transparent 55%)',
          }} />
          {item.specialty && (
            <div style={{
              position: 'absolute', bottom: 7, left: 8, right: 8,
              display: 'flex', alignItems: 'center', gap: 4,
            }}>
              <svg width="6" height="6" viewBox="0 0 8 8" style={{ flexShrink: 0 }}>
                <circle cx="4" cy="4" r="4" fill="var(--gold)" />
              </svg>
              <span style={{
                fontFamily: 'var(--font-ui)', fontSize: '9px', fontWeight: 600,
                color: 'rgba(255,255,255,0.9)', letterSpacing: '0.2px',
                whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                textShadow: '0 1px 3px rgba(0,0,0,0.5)',
              }}>
                {item.specialty}
              </span>
            </div>
          )}
        </div>
        {/* Label */}
        <div style={{
          padding: '9px 10px',
          fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700,
          color: hov ? 'var(--brand)' : 'rgba(255,255,255,0.9)',
          textAlign: 'center', letterSpacing: '0.1px',
          background: 'rgba(10,18,30,0.85)',
          transition: 'color 0.18s',
        }}>
          {item.label}
        </div>
      </div>
    </Link>
  );
}

/*
 * Scrollable hero strip of sub-category cards with left/right buttons.
 *   items   – array of { label, specialty?, img }
 *   linkFor – (item) => destination URL for that card
 *   heading – small uppercase label above the strip
 */
export default function SubCatStrip({ items, linkFor, heading = 'Browse by sub-category' }) {
  const scrollRef = useRef(null);
  const [canLeft, setCanLeft]   = useState(false);
  const [canRight, setCanRight] = useState(false);

  const sync = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 2);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  };

  useEffect(() => {
    sync();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener('scroll', sync, { passive: true });
    window.addEventListener('resize', sync);
    return () => {
      el.removeEventListener('scroll', sync);
      window.removeEventListener('resize', sync);
    };
  }, [items]);

  const slide = (dir) => {
    scrollRef.current?.scrollBy({ left: dir * 340, behavior: 'smooth' });
  };

  const btnStyle = (side) => ({
    position: 'absolute', [side]: -18, top: '50%',
    transform: 'translateY(-60%)',
    zIndex: 10, width: 36, height: 36, borderRadius: '50%',
    background: 'rgba(30,20,20,0.7)', backdropFilter: 'blur(8px)',
    border: '1px solid rgba(255,255,255,0.18)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: '#fff',
    boxShadow: '0 4px 14px rgba(0,0,0,0.45)',
    transition: 'background 0.2s, border-color 0.2s',
  });

  if (!items?.length) return null;

  return (
    <div style={{ marginBottom: 36 }}>
      {/* Label */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <span style={{ width: 3, height: 16, background: 'var(--brand)', borderRadius: 2, display: 'inline-block' }} />
        <span style={{
          fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700,
          letterSpacing: '0.12em', textTransform: 'uppercase',
          color: 'rgba(255,255,255,0.45)',
        }}>
          {heading}
        </span>
      </div>

      {/* Scroll area */}
      <div style={{ position: 'relative' }}>

        {/* Left button */}
        {canLeft && (
          <button
            onClick={() => slide(-1)}
            style={btnStyle('left')}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand)'; e.currentTarget.style.borderColor = 'var(--brand)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(30,20,20,0.7)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; }}
            aria-label="Scroll left"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
        )}

        {/* Cards row */}
        <div
          ref={scrollRef}
          style={{
            display: 'flex', gap: 12,
            overflowX: 'auto', scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch',
            paddingBottom: 4,
          }}
        >
          {items.map(item => (
            <SubCatCard key={item.label} item={item} to={linkFor(item)} />
          ))}
        </div>

        {/* Right button */}
        {canRight && (
          <button
            onClick={() => slide(1)}
            style={btnStyle('right')}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand)'; e.currentTarget.style.borderColor = 'var(--brand)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(30,20,20,0.7)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.18)'; }}
            aria-label="Scroll right"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="9 18 15 12 9 6" />
            </svg>
          </button>
        )}
      </div>
    </div>
  );
}
