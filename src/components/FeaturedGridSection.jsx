import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useIsMobile } from '../hooks/useIsMobile';
import { getPublishedArticles } from '../lib/supabase';
import { normalizeArticles } from '../lib/normalize';

export default function FeaturedGridSection() {
  const isMobile = useIsMobile();
  const [articles, setArticles] = useState([]);

  useEffect(() => {
    getPublishedArticles({ limit: 4 }).then(({ data }) => {
      setArticles(normalizeArticles(data));
    });
  }, []);

  if (articles.length < 4) {
    return (
      <section style={{ background: 'var(--sand)', padding: isMobile ? '40px 0' : '64px 0', minHeight: 200 }} />
    );
  }

  return (
    <section style={{ background: 'var(--sand)', padding: isMobile ? '40px 0' : '64px 0' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '0 16px' : '0 24px' }}>

        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '4px', height: '28px', background: 'var(--brand)', borderRadius: '2px' }} />
            <div>
              <span style={{
                fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '10px',
                letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--brand)',
                display: 'block', marginBottom: '2px',
              }}>
                Hand-picked
              </span>
              <h2 style={{
                fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '22px',
                color: 'var(--text-dark)', margin: 0, letterSpacing: '-0.2px',
              }}>
                Things to know
              </h2>
            </div>
          </div>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          <Link to="/category/all" style={{
            fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '12px',
            color: 'var(--brand)', display: 'flex', alignItems: 'center', gap: '5px',
            padding: '6px 14px', border: '1px solid var(--brand)', borderRadius: '6px',
            transition: 'all 0.2s', textDecoration: 'none',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--brand)'; }}
          >
            View All <Arr />
          </Link>
        </div>

        {/* Magazine grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1.08fr 1fr',
          gridTemplateRows: isMobile ? 'auto' : '620px',
          gap: '4px',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-lg)',
        }}>
          {/* Left — big featured card */}
          <div style={{ height: isMobile ? '300px' : '100%' }}>
            <BigCard article={articles[0]} />
          </div>

          {/* Right — 1 top + 2 bottom (bottom row gets a bit more height) */}
          <div style={{ display: 'grid', gridTemplateRows: isMobile ? 'auto' : '1fr 1.15fr', gap: '4px' }}>
            <div style={{ height: isMobile ? '220px' : '100%' }}>
              <SmallCard article={articles[1]} wide />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', height: isMobile ? '220px' : '100%' }}>
              <SmallCard article={articles[2]} />
              <SmallCard article={articles[3]} />
            </div>
          </div>
        </div>

      </div>
    </section>
  );
}

function BigCard({ article }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/article/${article.slug}`)}
      style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer', height: '100%' }}
    >
      {/* Image */}
      <img
        src={article.image}
        alt={article.title}
        style={{
          width: '100%', height: '100%', objectFit: 'cover', display: 'block',
          transform: hovered ? 'scale(1.06)' : 'scale(1)',
          transition: 'transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94)',
        }}
      />

      {/* Gradient overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: hovered
          ? 'linear-gradient(to top, rgba(13,21,36,0.97) 0%, rgba(13,21,36,0.55) 45%, rgba(13,21,36,0.1) 100%)'
          : 'linear-gradient(to top, rgba(13,21,36,0.92) 0%, rgba(13,21,36,0.38) 50%, rgba(13,21,36,0.05) 100%)',
        transition: 'background 0.4s ease',
      }} />

      {/* Top: category badge */}
      <div style={{ position: 'absolute', top: '18px', left: '18px' }}>
        <CategoryPill color={article.categoryColor} label={article.category} />
      </div>

      {/* Bottom: content */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '28px 28px 32px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '12px' }}>
          <BoltIcon />
          <span style={{
            fontFamily: 'var(--font-ui)', fontWeight: 500, fontSize: '12px',
            color: 'rgba(255,255,255,0.65)', letterSpacing: '0.3px',
          }}>
            {article.date}
          </span>
        </div>

        <h3 style={{
          fontFamily: 'var(--font-headline)', fontWeight: 700,
          fontSize: 'clamp(20px, 2.2vw, 28px)',
          color: '#fff', lineHeight: 1.25,
          margin: '0 0 14px',
          letterSpacing: '-0.3px',
          textShadow: '0 2px 16px rgba(0,0,0,0.4)',
        }}>
          {article.title}
        </h3>

        {/* Excerpt — slides up on hover */}
        <div style={{
          overflow: 'hidden',
          maxHeight: hovered ? '80px' : '0',
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateY(0)' : 'translateY(10px)',
          transition: 'max-height 0.4s ease, opacity 0.35s ease, transform 0.35s ease',
          marginBottom: hovered ? '16px' : '0',
        }}>
          <p style={{
            fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: '14px',
            color: 'rgba(255,255,255,0.72)', lineHeight: 1.68, margin: 0,
          }}>
            {article.excerpt}
          </p>
        </div>

        {/* Read more link */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          opacity: hovered ? 1 : 0,
          transform: hovered ? 'translateY(0)' : 'translateY(8px)',
          transition: 'opacity 0.3s 0.05s ease, transform 0.3s 0.05s ease',
        }}>
          <span style={{
            fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '12px',
            letterSpacing: '1px', textTransform: 'uppercase', color: 'var(--gold)',
            display: 'flex', alignItems: 'center', gap: '6px',
          }}>
            Read Story <Arr color="var(--gold)" />
          </span>
          <div style={{ flex: 1, height: '1px', background: 'rgba(201,160,80,0.35)' }} />
        </div>
      </div>
    </article>
  );
}

function SmallCard({ article, wide }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/article/${article.slug}`)}
      style={{ position: 'relative', overflow: 'hidden', cursor: 'pointer', height: '100%' }}
    >
      {/* Image */}
      <img
        src={article.image}
        alt={article.title}
        style={{
          width: '100%', height: '100%', objectFit: 'cover', display: 'block',
          transform: hovered ? 'scale(1.07)' : 'scale(1)',
          transition: 'transform 0.6s cubic-bezier(0.25,0.46,0.45,0.94)',
        }}
      />

      {/* Gradient overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: hovered
          ? 'linear-gradient(to top, rgba(13,21,36,0.95) 0%, rgba(13,21,36,0.45) 55%, rgba(13,21,36,0.08) 100%)'
          : 'linear-gradient(to top, rgba(13,21,36,0.88) 0%, rgba(13,21,36,0.25) 55%, rgba(13,21,36,0.02) 100%)',
        transition: 'background 0.35s ease',
      }} />

      {/* Category badge */}
      <div style={{ position: 'absolute', top: '14px', left: '14px' }}>
        <CategoryPill color={article.categoryColor} label={article.category} />
      </div>

      {/* Content */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: wide ? '20px 22px 24px' : '14px 16px 20px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '8px' }}>
          <BoltIcon />
          <span style={{
            fontFamily: 'var(--font-ui)', fontWeight: 500, fontSize: '11px',
            color: 'rgba(255,255,255,0.6)', letterSpacing: '0.2px',
          }}>
            {article.date}
          </span>
        </div>

        <h3 style={{
          fontFamily: 'var(--font-headline)', fontWeight: 700,
          fontSize: wide ? '18px' : '15px',
          color: hovered ? '#fff' : 'rgba(255,255,255,0.95)',
          lineHeight: 1.3,
          margin: 0,
          display: '-webkit-box',
          WebkitLineClamp: wide ? 2 : 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
          textShadow: '0 1px 8px rgba(0,0,0,0.35)',
          transition: 'color 0.25s',
        }}>
          {article.title}
        </h3>

        {/* Excerpt for wide card on hover */}
        {wide && article.excerpt && (
          <div style={{
            overflow: 'hidden',
            maxHeight: hovered ? '56px' : '0',
            opacity: hovered ? 1 : 0,
            transform: hovered ? 'translateY(0)' : 'translateY(6px)',
            transition: 'max-height 0.35s ease, opacity 0.3s ease, transform 0.3s ease',
            marginTop: hovered ? '8px' : '0',
          }}>
            <p style={{
              fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: '12.5px',
              color: 'rgba(255,255,255,0.65)', lineHeight: 1.6, margin: 0,
              display: '-webkit-box', WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {article.excerpt}
            </p>
          </div>
        )}

        {/* Gold underline on hover */}
        <div style={{
          marginTop: hovered ? '10px' : '6px',
          height: '2px',
          width: hovered ? '40px' : '20px',
          background: 'var(--gold)',
          borderRadius: '1px',
          transition: 'width 0.3s ease, margin-top 0.3s ease',
          opacity: hovered ? 1 : 0.5,
        }} />
      </div>
    </article>
  );
}

function CategoryPill({ color, label }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: '5px',
      background: 'rgba(0,0,0,0.45)',
      backdropFilter: 'blur(8px)',
      border: `1px solid ${color}55`,
      color: '#fff',
      fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '10px',
      letterSpacing: '0.8px', textTransform: 'uppercase',
      padding: '4px 10px', borderRadius: '20px',
    }}>
      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: color, flexShrink: 0 }} />
      {label}
    </span>
  );
}

function BoltIcon() {
  return (
    <svg width="11" height="11" viewBox="0 0 24 24" fill="var(--gold)" xmlns="http://www.w3.org/2000/svg">
      <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

function Arr({ color = 'currentColor' }) {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5">
      <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
    </svg>
  );
}
