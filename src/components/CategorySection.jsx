import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { categoryArticles } from '../data/mockData';
import { useIsMobile } from '../hooks/useIsMobile';

const TABS = ['Lifestyle', 'Shopping', 'Food & Dining', 'Nightlife'];

export default function CategorySection() {
  const isMobile = useIsMobile();
  const [activeTab, setActiveTab] = useState('Lifestyle');

  return (
    <section style={{ background: 'var(--sand-mid)', padding: isMobile ? '40px 0' : '64px 0' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '0 16px' : '0 24px' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '28px', gap: '16px', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '4px', height: '28px', background: 'var(--gold)', borderRadius: '2px' }} />
            <div>
              <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: '2px' }}>
                Dubai Living
              </span>
              <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '22px', color: 'var(--text-dark)', margin: 0 }}>
                Lifestyle & Culture
              </h2>
            </div>
          </div>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {TABS.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{
                fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '11px',
                letterSpacing: '0.3px', padding: '6px 14px', borderRadius: '6px',
                cursor: 'pointer', transition: 'all 0.2s',
                background: activeTab === tab ? 'var(--brand)' : 'transparent',
                color: activeTab === tab ? '#fff' : 'var(--text-light)',
                border: `1px solid ${activeTab === tab ? 'var(--brand)' : 'var(--border)'}`,
              }}
                onMouseEnter={e => { if (activeTab !== tab) { e.currentTarget.style.borderColor = 'var(--text-dark)'; e.currentTarget.style.color = 'var(--text-dark)'; } }}
                onMouseLeave={e => { if (activeTab !== tab) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-light)'; } }}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        {/* Featured hero article + side list */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: isMobile ? '16px' : '24px', marginBottom: isMobile ? '16px' : '24px' }}>
          {categoryArticles.length > 0 && <FeaturedCard article={categoryArticles[0]} />}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {categoryArticles.slice(1, 4).map(a => <ListCard key={a.id} article={a} />)}
          </div>
        </div>

        {/* 3-col grid row */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: isMobile ? '16px' : '20px' }}>
          {categoryArticles.slice(4, 7).map(a => <GridCard key={a.id} article={a} />)}
        </div>
      </div>
    </section>
  );
}

function FeaturedCard({ article }) {
  const [hovered, setHovered] = useState(false);
  return (
    <article onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff', borderRadius: '12px', overflow: 'hidden',
        boxShadow: hovered ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        transition: 'all 0.3s', cursor: 'pointer',
        transform: hovered ? 'translateY(-4px)' : 'none',
        border: '1px solid var(--border)',
      }}
    >
      <div style={{ position: 'relative', height: '240px', overflow: 'hidden' }}>
        <img src={article.image} alt={article.title}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transform: hovered ? 'scale(1.06)' : 'scale(1)',
            transition: 'transform 0.6s ease',
          }}
        />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,21,36,0.7) 0%, transparent 55%)' }} />
        <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
          <span style={{
            background: article.categoryColor || 'var(--gold)', color: '#fff',
            fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '9px',
            letterSpacing: '1.5px', textTransform: 'uppercase',
            padding: '4px 10px', borderRadius: '20px',
          }}>
            {article.tag}
          </span>
        </div>
        <div style={{ position: 'absolute', bottom: '14px', left: '16px', right: '16px' }}>
          <h3 style={{
            fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '18px',
            color: '#fff', lineHeight: 1.3, margin: 0,
          }}>
            {article.title}
          </h3>
        </div>
      </div>
      <div style={{ padding: '16px 20px' }}>
        <p style={{
          fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: '13.5px',
          color: 'var(--text-mid)', lineHeight: 1.7,
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
          marginBottom: '12px',
        }}>
          {article.excerpt}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--text-light)' }}>
            {article.author} · {article.date}
          </span>
          <Link to={`/article/${article.uid || 'unknown'}`} style={{
            fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '11px',
            color: 'var(--brand)', display: 'flex', alignItems: 'center', gap: '4px',
            textDecoration: 'none',
          }}>
            Read <Arr />
          </Link>
        </div>
      </div>
    </article>
  );
}

function ListCard({ article }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link to={`/article/${article.uid || 'unknown'}`} onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        display: 'grid', gridTemplateColumns: '100px 1fr', gap: '14px',
        background: '#fff', borderRadius: '10px', overflow: 'hidden',
        border: '1px solid var(--border)', padding: '12px',
        boxShadow: hovered ? 'var(--shadow-sm)' : 'none',
        transition: 'all 0.2s', transform: hovered ? 'translateX(3px)' : 'none',
        textDecoration: 'none',
      }}
    >
      <div style={{ position: 'relative', height: '72px', borderRadius: '6px', overflow: 'hidden', flexShrink: 0 }}>
        <img src={article.image} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
      </div>
      <div>
        <span style={{
          fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '9px',
          letterSpacing: '1px', textTransform: 'uppercase',
          color: article.categoryColor || 'var(--gold)',
          display: 'block', marginBottom: '4px',
        }}>
          {article.tag}
        </span>
        <p style={{
          fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '13px',
          color: hovered ? 'var(--brand)' : 'var(--text-dark)',
          lineHeight: 1.35, transition: 'color 0.2s',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {article.title}
        </p>
        <span style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', color: 'var(--text-light)', marginTop: '4px', display: 'block' }}>
          {article.date}
        </span>
      </div>
    </Link>
  );
}

function GridCard({ article }) {
  const [hovered, setHovered] = useState(false);
  const navigate = useNavigate();
  return (
    <article onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      onClick={() => navigate(`/article/${article.uid || 'unknown'}`)}
      style={{
        background: '#fff', borderRadius: '10px', overflow: 'hidden',
        border: '1px solid var(--border)',
        boxShadow: hovered ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        transform: hovered ? 'translateY(-3px)' : 'none',
        transition: 'all 0.3s', cursor: 'pointer',
      }}
    >
      <div style={{ position: 'relative', height: '160px', overflow: 'hidden' }}>
        <img src={article.image} alt={article.title}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transform: hovered ? 'scale(1.07)' : 'scale(1)',
            transition: 'transform 0.5s ease',
          }}
        />
        <div style={{ position: 'absolute', top: '10px', left: '10px' }}>
          <span style={{
            background: article.categoryColor || 'var(--gold)', color: '#fff',
            fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '9px',
            letterSpacing: '1px', textTransform: 'uppercase',
            padding: '3px 8px', borderRadius: '12px',
          }}>
            {article.tag}
          </span>
        </div>
      </div>
      <div style={{ padding: '14px 16px' }}>
        <h3 style={{
          fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '15px',
          color: hovered ? 'var(--brand)' : 'var(--text-dark)',
          lineHeight: 1.35, marginBottom: '8px', transition: 'color 0.2s',
          display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {article.title}
        </h3>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', color: 'var(--text-light)' }}>{article.date}</span>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', color: 'var(--text-light)' }}>{article.views}</span>
        </div>
      </div>
    </article>
  );
}

function Arr() { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>; }
