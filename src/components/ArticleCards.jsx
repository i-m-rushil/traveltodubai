import { useState } from 'react';
import { Link } from 'react-router-dom';

/* ─── Featured card (hero-size) ─── */
export function FeaturedCard({ article, isMobile }) {
  const [hov, setHov] = useState(false);
  return (
    <Link to={`/article/${article.slug}`} style={{ textDecoration: 'none', display: 'block' }}>
      <article
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        style={{
          background: '#fff',
          borderRadius: 10,
          overflow: 'hidden',
          boxShadow: hov ? 'var(--shadow-lg)' : 'var(--shadow-sm)',
          transition: 'box-shadow 0.3s',
          display: isMobile ? 'block' : 'grid',
          gridTemplateColumns: '1fr 1fr',
          minHeight: isMobile ? 'auto' : 340,
        }}
      >
        {/* Image */}
        <div style={{ position: 'relative', overflow: 'hidden', height: isMobile ? 220 : '100%', minHeight: isMobile ? 220 : 340 }}>
          <img
            src={article.image}
            alt={article.title}
            loading="lazy"
            decoding="async"
            style={{
              width: '100%', height: '100%', objectFit: 'cover', display: 'block',
              transform: hov ? 'scale(1.05)' : 'scale(1)',
              transition: 'transform 0.55s cubic-bezier(0.25,0.46,0.45,0.94)',
            }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(29,37,44,0.3) 0%, transparent 60%)' }} />
          {article.tag && (
            <span style={{
              position: 'absolute', top: 16, left: 16,
              background: article.tagColor || article.categoryColor || 'var(--brand)',
              color: '#fff', padding: '4px 11px', borderRadius: 3,
              fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              {article.tag}
            </span>
          )}
          <span style={{
            position: 'absolute', bottom: 16, left: 16,
            background: 'rgba(29,37,44,0.75)', backdropFilter: 'blur(6px)',
            color: '#fff', padding: '5px 11px', borderRadius: 4,
            fontSize: 11, fontWeight: 500, letterSpacing: '0.04em',
          }}>
            ✦ Featured
          </span>
        </div>

        {/* Content */}
        <div style={{ padding: isMobile ? '24px 20px 28px' : '36px 40px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
            <span style={{
              background: article.categoryColor || 'var(--brand)',
              color: '#fff', padding: '4px 12px', borderRadius: 3,
              fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
            }}>
              {article.category}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-light)' }}>{article.date}</span>
          </div>

          <h2 style={{
            fontFamily: 'var(--font-headline)', fontWeight: 800,
            fontSize: isMobile ? 20 : 26,
            lineHeight: 1.28, color: 'var(--text-dark)',
            marginBottom: 14, letterSpacing: '-0.01em',
          }}>
            {article.title}
          </h2>

          {article.excerpt && (
            <p style={{
              fontSize: 14, color: 'var(--text-mid)', lineHeight: 1.75, marginBottom: 22,
              display: '-webkit-box', WebkitLineClamp: 3,
              WebkitBoxOrient: 'vertical', overflow: 'hidden',
            }}>
              {article.excerpt}
            </p>
          )}

          <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: 12, color: 'var(--text-light)', flexWrap: 'wrap' }}>
            {article.author && <span style={{ fontWeight: 600, color: 'var(--text-mid)' }}>{article.author}</span>}
            {article.readTime && <><span>·</span><span>{article.readTime}</span></>}
            {article.views && <><span>·</span><span>👁 {article.views}</span></>}
          </div>

          <div style={{ marginTop: 24 }}>
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              color: 'var(--brand)', fontWeight: 700, fontSize: 13,
              borderBottom: '2px solid var(--brand)', paddingBottom: 2,
              transition: 'gap 0.2s',
            }}>
              Read Article →
            </span>
          </div>
        </div>
      </article>
    </Link>
  );
}

/* ─── Standard article card ─── */
export function ArticleCard({ article, hovered, onHover }) {
  return (
    <Link
      to={`/article/${article.slug}`}
      style={{ textDecoration: 'none', display: 'flex' }}
      onMouseEnter={() => onHover(article.slug)}
      onMouseLeave={() => onHover(null)}
    >
      <article style={{
        background: '#fff', borderRadius: 8, overflow: 'hidden',
        boxShadow: hovered ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        transition: 'box-shadow 0.3s, transform 0.3s',
        transform: hovered ? 'translateY(-4px)' : 'translateY(0)',
        display: 'flex', flexDirection: 'column', width: '100%',
      }}>
        {/* Thumb */}
        <div style={{ position: 'relative', overflow: 'hidden', paddingTop: '56.25%' }}>
          <img
            src={article.image}
            alt={article.title}
            loading="lazy"
            decoding="async"
            style={{
              position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
              transform: hovered ? 'scale(1.06)' : 'scale(1)',
              transition: 'transform 0.45s ease',
            }}
          />
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.35) 0%, transparent 50%)' }} />
          <span style={{
            position: 'absolute', top: 12, left: 12,
            background: article.categoryColor || 'var(--brand)',
            color: '#fff', padding: '3px 9px', borderRadius: 3,
            fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase',
          }}>
            {article.category}
          </span>
        </div>

        {/* Body */}
        <div style={{ padding: '18px 20px 22px', display: 'flex', flexDirection: 'column', flex: 1 }}>
          <h3 style={{
            fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: 15,
            lineHeight: 1.45, color: 'var(--text-dark)',
            display: '-webkit-box', WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical', overflow: 'hidden',
            marginBottom: 12, flex: 1,
          }}>
            {article.title}
          </h3>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 11, color: 'var(--text-light)', marginTop: 'auto', flexWrap: 'wrap' }}>
            {article.author && <span style={{ fontWeight: 600, color: 'var(--text-mid)' }}>{article.author}</span>}
            {article.date && <><span>·</span><span>{article.date}</span></>}
            {article.readTime && <><span>·</span><span>{article.readTime}</span></>}
          </div>
        </div>
      </article>
    </Link>
  );
}
