import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { analysisArticles, mostViewedAnalysis, tipsArticles } from '../data/mockData';
import { getArticleUid } from '../data/articles';
import { useIsMobile } from '../hooks/useIsMobile';

export default function AnalysisSection() {
  const isMobile = useIsMobile();
  return (
    <section style={{ background: 'var(--sand)', padding: isMobile ? '40px 0' : '64px 0' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '0 16px' : '0 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px', gap: '16px' }}>
          <div style={{ width: '4px', height: '28px', background: 'var(--brand)', borderRadius: '2px', flexShrink: 0 }} />
          <div>
            <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--brand)', display: 'block', marginBottom: '2px' }}>
              In-Depth
            </span>
            <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '22px', color: 'var(--text-dark)', margin: 0 }}>
              Dubai Travel Guides
            </h2>
          </div>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          <Link to="/category/travel" style={{
            fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '12px',
            color: 'var(--brand)', display: 'flex', alignItems: 'center', gap: '5px',
            padding: '6px 14px', border: '1px solid var(--brand)', borderRadius: '6px',
            transition: 'all 0.2s', textDecoration: 'none',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--brand)'; }}
          >
            All Guides <ArrRight size={11} />
          </Link>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 320px', gap: '32px', alignItems: 'start' }}>
          {/* Articles grid */}
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '20px' }}>
              {analysisArticles.map(article => (
                <GuideCard key={article.id} article={article} />
              ))}
            </div>
            <button style={{
              fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '12px',
              color: 'var(--text-dark)', border: '2px solid var(--border)',
              padding: '11px 28px', borderRadius: '8px',
              display: 'flex', alignItems: 'center', gap: '8px',
              margin: '24px auto 0', background: '#fff', transition: 'all 0.2s', cursor: 'pointer',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.color = 'var(--brand)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-dark)'; }}
            >
              Load More Guides
            </button>
          </div>

          {/* Sidebar — desktop only */}
          {!isMobile && <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Most Viewed */}
            <div style={{ background: '#fff', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', border: '1px solid var(--border)' }}>
              <div style={{
                background: 'var(--midnight)', padding: '16px 20px',
                display: 'flex', alignItems: 'center', gap: '10px',
              }}>
                <TrendingIcon />
                <h4 style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '12px', letterSpacing: '1.5px', textTransform: 'uppercase', color: '#fff', margin: 0 }}>
                  Most Viewed
                </h4>
              </div>
              {mostViewedAnalysis.map((item, i) => (
                <Link key={item.id} to={`/article/${getArticleUid(item.title)}`} style={{
                  display: 'flex', gap: '14px', padding: '13px 18px',
                  borderBottom: i < mostViewedAnalysis.length - 1 ? '1px solid var(--border)' : 'none',
                  alignItems: 'flex-start', transition: 'background 0.15s',
                  textDecoration: 'none',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'var(--sand)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <span style={{
                    fontFamily: 'var(--font-ui)', fontWeight: 900, fontSize: '22px',
                    color: i < 2 ? 'var(--brand)' : 'var(--border)',
                    lineHeight: 1, flexShrink: 0, minWidth: '26px',
                  }}>
                    {i + 1}
                  </span>
                  <div>
                    <p style={{
                      fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '12.5px',
                      color: 'var(--text-dark)', lineHeight: 1.4, marginBottom: '5px',
                    }}>
                      {item.title}
                    </p>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', color: 'var(--text-light)' }}>{item.date}</span>
                      <span style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', color: 'var(--gold-dark)', fontWeight: 700 }}>{item.views}</span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Travel Tips */}
            <div style={{ background: '#fff', borderRadius: '12px', boxShadow: 'var(--shadow-sm)', overflow: 'hidden', border: '1px solid var(--border)' }}>
              <div style={{ borderBottom: '3px solid var(--gold)', padding: '14px 18px', background: 'linear-gradient(to right, #fffbf0, #fff)' }}>
                <h4 style={{
                  fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '12px',
                  letterSpacing: '1.5px', textTransform: 'uppercase', color: 'var(--text-dark)', margin: 0,
                  display: 'flex', alignItems: 'center', gap: '7px',
                }}>
                  <span style={{ color: 'var(--gold)' }}>✦</span> Dubai Travel Tips
                </h4>
              </div>
              <div style={{ padding: '6px 0' }}>
                {tipsArticles.map((tip, i) => (
                  <a key={i} href="#" style={{
                    display: 'flex', gap: '12px', padding: '11px 18px',
                    borderBottom: i < tipsArticles.length - 1 ? '1px solid var(--border)' : 'none',
                    alignItems: 'flex-start', transition: 'background 0.15s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'var(--sand)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                  >
                    <span style={{ width: '5px', height: '5px', background: 'var(--gold)', borderRadius: '50%', flexShrink: 0, marginTop: '6px' }} />
                    <span style={{ fontFamily: 'var(--font-body)', fontSize: '13px', color: 'var(--text-dark)', lineHeight: 1.5 }}>
                      {tip}
                    </span>
                  </a>
                ))}
              </div>
            </div>

          </div>}
        </div>
      </div>
    </section>
  );
}

function GuideCard({ article }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  const catColors = {
    'City Guide': '#e43d30',
    'Luxury': '#C9A050',
    'Adventure': '#059669',
    'Cultural': '#7c3aed',
    'Food': '#ea580c',
    'Budget': '#0891b2',
  };
  const color = catColors[article.category] || 'var(--brand)';

  return (
    <article onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/article/${getArticleUid(article.title)}`)}
      style={{
        background: '#fff', borderRadius: '10px', overflow: 'hidden',
        boxShadow: hovered ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        border: '1px solid var(--border)',
        transition: 'all 0.3s', transform: hovered ? 'translateY(-3px)' : 'none', cursor: 'pointer',
      }}
    >
      <div style={{ position: 'relative', height: '160px', overflow: 'hidden' }}>
        <img src={article.image} alt={article.title}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transform: hovered ? 'scale(1.06)' : 'scale(1)',
            transition: 'transform 0.5s ease',
          }}
        />
        <div style={{ position: 'absolute', bottom: '10px', left: '10px' }}>
          <span style={{
            background: color, color: '#fff',
            fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '9px',
            letterSpacing: '1px', textTransform: 'uppercase', padding: '3px 8px', borderRadius: '4px',
          }}>
            {article.category}
          </span>
        </div>
        {/* Gold shimmer border on hover */}
        {hovered && (
          <div style={{
            position: 'absolute', inset: 0,
            border: '2px solid rgba(201,160,80,0.5)',
            pointerEvents: 'none', borderRadius: 0,
          }} />
        )}
      </div>
      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px', alignItems: 'center' }}>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', color: 'var(--text-light)' }}>
            {article.author} · {article.date}
          </span>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', color, fontWeight: 700, marginLeft: 'auto' }}>
            {article.readTime}
          </span>
        </div>
        <h3 style={{
          fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '15px',
          color: hovered ? color : 'var(--text-dark)',
          lineHeight: 1.4, margin: '0 0 8px', transition: 'color 0.2s',
          display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {article.title}
        </h3>
        <p style={{
          fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: '12.5px',
          color: 'var(--text-mid)', lineHeight: 1.65,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {article.excerpt}
        </p>
      </div>
    </article>
  );
}

function ArrRight({ size = 14 }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>;
}
function TrendingIcon() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: 'var(--gold)' }}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>;
}
