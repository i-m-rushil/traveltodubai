import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { getFeaturedArticles, getPublishedArticles } from '../lib/supabase';
import { normalizeArticles } from '../lib/normalize';
import { useIsMobile } from '../hooks/useIsMobile';

export default function HeroSlider() {
  const [slides, setSlides] = useState([]);
  const [current, setCurrent] = useState(0);
  const [prev, setPrev] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    async function load() {
      let { data } = await getFeaturedArticles(5);
      if (!data || data.length === 0) {
        const res = await getPublishedArticles({ limit: 5 });
        data = res.data;
      }
      setSlides(normalizeArticles(data));
    }
    load();
  }, []);

  const goTo = useCallback((index) => {
    if (isTransitioning || index === current || slides.length === 0) return;
    setIsTransitioning(true);
    setPrev(current);
    setCurrent(index);
    setTimeout(() => { setPrev(null); setIsTransitioning(false); }, 700);
  }, [isTransitioning, current, slides.length]);

  const next     = useCallback(() => goTo((current + 1) % Math.max(slides.length, 1)), [current, goTo, slides.length]);
  const goToPrev = useCallback(() => goTo((current - 1 + Math.max(slides.length, 1)) % Math.max(slides.length, 1)), [current, goTo, slides.length]);

  useEffect(() => {
    if (slides.length === 0) return;
    const timer = setInterval(next, 7000);
    return () => clearInterval(timer);
  }, [next, slides.length]);

  if (slides.length === 0) {
    return <div style={{ height: isMobile ? '380px' : '600px', background: '#0a0c14' }} />;
  }

  const slide = slides[current];

  return (
    <div style={{ position: 'relative', height: isMobile ? '380px' : '600px', overflow: 'hidden', background: '#0a0c14' }}>

      {/* Background images */}
      {slides.map((s, i) => (
        <div key={s.id} style={{
          position: 'absolute', inset: 0,
          opacity: i === current ? 1 : (i === prev ? 0 : 0),
          transition: 'opacity 0.8s ease',
          zIndex: i === current ? 1 : 0,
        }}>
          <img src={s.image} alt={s.title} loading={i === 0 ? 'eager' : 'lazy'} decoding="async"
            style={{
              width: '100%', height: '100%', objectFit: 'cover',
              transform: i === current ? 'scale(1.04)' : 'scale(1)',
              transition: 'transform 8s ease',
            }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(105deg, rgba(13,21,36,0.82) 0%, rgba(13,21,36,0.45) 55%, rgba(13,21,36,0.15) 100%)',
          }} />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(to top, rgba(13,21,36,0.95) 0%, transparent 50%)',
          }} />
        </div>
      ))}

      {/* Geometric accent line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
        background: 'linear-gradient(90deg, var(--brand) 0%, var(--gold) 50%, var(--brand) 100%)',
        zIndex: 5,
      }} />

      {/* Content */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: isMobile ? '0 0 28px 0' : '0 0 52px 0', zIndex: 5,
      }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '0 16px' : '0 40px' }}>
          <div style={{ maxWidth: isMobile ? '100%' : '800px' }}>

            {/* Category + location badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <span style={{
                background: 'var(--brand)', color: '#fff',
                fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '10px',
                letterSpacing: '2px', textTransform: 'uppercase',
                padding: '5px 14px', borderRadius: '20px',
              }}>
                {slide.category}
              </span>
              <span style={{
                fontFamily: 'var(--font-ui)', fontSize: '12px',
                color: 'var(--gold-light)', fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: '6px',
              }}>
                <MapPin size={12} />
                Dubai
              </span>
            </div>

            {/* Title */}
            <h1 style={{
              fontFamily: 'var(--font-headline)', fontWeight: 700,
              fontSize: 'clamp(26px, 3.6vw, 52px)', color: '#fff',
              lineHeight: 1.18, margin: '0 0 18px',
              textShadow: '0 2px 20px rgba(0,0,0,0.4)',
              letterSpacing: '-0.3px',
            }}>
              {slide.title}
            </h1>

            {/* Excerpt */}
            {slide.excerpt && (
              <p style={{
                fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: '15px',
                color: 'rgba(255,255,255,0.75)', lineHeight: 1.75,
                margin: '0 0 24px', maxWidth: '580px',
              }}>
                {slide.excerpt}
              </p>
            )}

            {/* Meta + CTA row */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '16px',
                padding: '8px 16px',
                background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)',
                borderRadius: '8px', border: '1px solid rgba(255,255,255,0.12)',
              }}>
                <MetaItem icon={<UserIco />} label={slide.author} />
                <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.2)' }} />
                <MetaItem icon={<CalIco />} label={slide.date} />
                {slide.readTime && <>
                  <div style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.2)' }} />
                  <MetaItem icon={<ClockIco />} label={slide.readTime} />
                </>}
              </div>

              <Link to={`/article/${slide.slug}`} style={{
                background: 'linear-gradient(135deg, var(--brand) 0%, var(--brand-dark) 100%)',
                color: '#fff', fontFamily: 'var(--font-ui)', fontWeight: 600,
                fontSize: '13px', letterSpacing: '0.5px',
                padding: '12px 26px', borderRadius: '8px',
                display: 'flex', alignItems: 'center', gap: '8px',
                boxShadow: '0 4px 18px rgba(177,19,47,0.4)',
                transition: 'all 0.25s', textDecoration: 'none',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 28px rgba(177,19,47,0.5)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(177,19,47,0.4)'; }}
              >
                Read Full Story <ArrIco />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Right panel: slide counter + thumbnails — desktop only */}
      {!isMobile && (
        <div style={{
          position: 'absolute', right: '40px', bottom: '52px',
          display: 'flex', flexDirection: 'column', alignItems: 'flex-end',
          gap: '12px', zIndex: 5,
        }}>
          <div style={{
            fontFamily: 'var(--font-headline)', fontStyle: 'italic',
            fontSize: '13px', color: 'rgba(255,255,255,0.45)', letterSpacing: '2px',
          }}>
            <span style={{ fontSize: '28px', fontWeight: 700, color: '#fff', fontStyle: 'normal' }}>
              {String(current + 1).padStart(2, '0')}
            </span>
            {' / ' + String(slides.length).padStart(2, '0')}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            {slides.map((s, i) => (
              <button key={i} onClick={() => goTo(i)} style={{
                width: '72px', height: '48px', overflow: 'hidden', borderRadius: '6px',
                border: i === current ? '2px solid var(--gold)' : '2px solid rgba(255,255,255,0.2)',
                cursor: 'pointer', padding: 0,
                opacity: i === current ? 1 : 0.55,
                transform: i === current ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.3s',
                boxShadow: i === current ? 'var(--shadow-gold)' : 'none',
              }}>
                <img src={s.image} alt="" loading="lazy" decoding="async" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Arrow controls */}
      {[
        { dir: 'prev', fn: goToPrev, side: 'left',  icon: <ChevL /> },
        { dir: 'next', fn: next,     side: 'right', icon: <ChevR /> },
      ].map(({ dir, fn, side, icon }) => (
        <button key={dir} onClick={fn} aria-label={dir} style={{
          position: 'absolute', [side]: isMobile ? '10px' : '20px', top: '50%',
          transform: 'translateY(-50%)',
          width: isMobile ? '40px' : '48px', height: isMobile ? '40px' : '48px', borderRadius: '50%',
          background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.25)',
          color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
          backdropFilter: 'blur(6px)', transition: 'all 0.2s', zIndex: 5, cursor: 'pointer',
        }}
          onMouseEnter={e => { e.currentTarget.style.background = 'var(--gold)'; e.currentTarget.style.borderColor = 'var(--gold)'; e.currentTarget.style.color = 'var(--midnight)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)'; e.currentTarget.style.color = '#fff'; }}
        >
          {icon}
        </button>
      ))}

      {/* Dot indicators */}
      <div style={{
        position: 'absolute', bottom: isMobile ? '12px' : '24px', left: '50%',
        transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 5,
      }}>
        {slides.map((_, i) => (
          <button key={i} onClick={() => goTo(i)} style={{
            width: i === current ? '28px' : '7px', height: '7px', borderRadius: '4px',
            background: i === current ? 'var(--gold)' : 'rgba(255,255,255,0.35)',
            transition: 'all 0.35s ease', cursor: 'pointer', padding: 0,
          }} />
        ))}
      </div>
    </div>
  );
}

function MetaItem({ icon, label }) {
  return (
    <span style={{
      fontFamily: 'var(--font-ui)', fontWeight: 400, fontSize: '12px',
      color: 'rgba(255,255,255,0.7)',
      display: 'flex', alignItems: 'center', gap: '5px',
    }}>
      {icon} {label}
    </span>
  );
}

function MapPin({ size = 14 }) { return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>; }
function UserIco() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
function CalIco() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>; }
function ClockIco() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>; }
function ArrIco() { return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>; }
function ChevL() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="15 18 9 12 15 6"/></svg>; }
function ChevR() { return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="9 18 15 12 9 6"/></svg>; }
