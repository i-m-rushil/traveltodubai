import { useState } from 'react';
import { Link } from 'react-router-dom';
import { recentArticles, popularArticles } from '../data/mockData';
import { getArticleUid } from '../data/articles';
import { useIsMobile } from '../hooks/useIsMobile';

export default function RecentSection({ title = 'Latest from Dubai', articles = recentArticles, viewAllLink = '/category/all' }) {
  const isMobile = useIsMobile();
  return (
    <section style={{ background: 'var(--sand)', padding: isMobile ? '40px 0' : '64px 0' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '0 16px' : '0 24px' }}>

        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '32px', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '4px', height: '28px', background: 'var(--brand)', borderRadius: '2px' }} />
            <h2 style={{
              fontFamily: 'var(--font-ui)',
              fontWeight: 700,
              fontSize: '18px',
              letterSpacing: '0.5px',
              color: 'var(--text-dark)',
              margin: 0,
            }}>
              {title}
            </h2>
          </div>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          <Link to={viewAllLink} style={{
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

        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 320px', gap: '32px', alignItems: 'start' }}>

          {/* Articles */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {articles.map((article, i) => (
              <ArticleCard key={article.id} article={article} featured={i === 0} />
            ))}

            <button style={{
              fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '13px',
              color: 'var(--text-dark)', border: '2px solid var(--border)',
              padding: '12px 28px', borderRadius: '8px',
              display: 'flex', alignItems: 'center', gap: '8px',
              margin: '8px auto 0', background: 'transparent',
              transition: 'all 0.2s', cursor: 'pointer',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.color = 'var(--brand)'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-dark)'; }}
            >
              Load More Articles
            </button>
          </div>

          {/* Sidebar — desktop only */}
          {!isMobile && <Sidebar />}
        </div>
      </div>
    </section>
  );
}

function ArticleCard({ article, featured }) {
  const [hovered, setHovered] = useState(false);
  const isMobile = useIsMobile();

  return (
    <article onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        background: '#fff',
        borderRadius: '12px',
        overflow: 'hidden',
        boxShadow: hovered ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        transition: 'all 0.3s',
        transform: hovered ? 'translateY(-3px)' : 'none',
        display: 'grid',
        gridTemplateColumns: (featured || isMobile) ? '1fr' : '220px 1fr',
        border: '1px solid var(--border)',
      }}
    >
      {/* Image */}
      <div style={{ position: 'relative', height: featured ? (isMobile ? '210px' : '280px') : '165px', overflow: 'hidden' }}>
        <img src={article.image} alt={article.title}
          style={{
            width: '100%', height: '100%', objectFit: 'cover',
            transform: hovered ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.6s ease',
          }}
        />
        <div style={{ position: 'absolute', top: '12px', left: '12px' }}>
          <span style={{
            background: article.categoryColor, color: '#fff',
            fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '10px',
            letterSpacing: '0.5px', padding: '4px 10px', borderRadius: '20px',
          }}>
            {article.category}
          </span>
        </div>
        {article.tag && (
          <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
            <span style={{
              background: article.tagColor, color: '#fff',
              fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '9px',
              letterSpacing: '1px', textTransform: 'uppercase',
              padding: '4px 8px', borderRadius: '4px',
            }}>
              {article.tag}
            </span>
          </div>
        )}
        {/* Gold shimmer border on hover */}
        {hovered && (
          <div style={{
            position: 'absolute', inset: 0,
            border: '2px solid var(--gold)',
            borderRadius: 0,
            opacity: 0.6,
            pointerEvents: 'none',
          }} />
        )}
      </div>

      {/* Content */}
      <div style={{ padding: featured ? '22px 24px 24px' : '16px 20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <User /> {article.author}
          </span>
          <span style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Cal /> {article.date}
          </span>
          <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Eye /> {article.views}
            </span>
            <span style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'var(--text-light)', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Msg /> {article.comments}
            </span>
          </div>
        </div>

        <h3 style={{
          fontFamily: 'var(--font-headline)',
          fontWeight: 700,
          fontSize: featured ? '22px' : '16px',
          color: hovered ? 'var(--brand)' : 'var(--text-dark)',
          lineHeight: 1.35, margin: '0 0 10px',
          transition: 'color 0.2s', cursor: 'pointer',
        }}>
          {article.title}
        </h3>

        <p style={{
          fontFamily: 'var(--font-body)', fontWeight: 300,
          fontSize: '13.5px', color: 'var(--text-mid)',
          lineHeight: 1.72, margin: '0 0 14px',
          display: '-webkit-box', WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical', overflow: 'hidden',
        }}>
          {article.excerpt}
        </p>

        <Link to={`/article/${getArticleUid(article.title)}`} style={{
          fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '11px',
          letterSpacing: '0.5px', color: 'var(--brand)',
          display: 'flex', alignItems: 'center', gap: '6px',
          transition: 'gap 0.2s', textDecoration: 'none',
        }}
          onMouseEnter={e => e.currentTarget.style.gap = '10px'}
          onMouseLeave={e => e.currentTarget.style.gap = '6px'}
        >
          Read Article <Arr />
        </Link>
      </div>
    </article>
  );
}

function Sidebar() {
  const [activeTab, setActiveTab] = useState('Popular');
  const tabs = ['Popular', 'Recent', 'Trending'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* Popular articles */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden', boxShadow: 'var(--shadow-sm)' }}>
        <div style={{ display: 'flex', borderBottom: '2px solid var(--border)' }}>
          {tabs.map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{
              flex: 1, fontFamily: 'var(--font-ui)', fontWeight: 600,
              fontSize: '11px', letterSpacing: '0.5px',
              padding: '12px 4px', cursor: 'pointer', background: 'transparent',
              color: activeTab === tab ? 'var(--brand)' : 'var(--text-light)',
              borderBottom: activeTab === tab ? '2px solid var(--brand)' : '2px solid transparent',
              marginBottom: '-2px', transition: 'all 0.2s',
            }}>
              {tab}
            </button>
          ))}
        </div>

        <div>
          {popularArticles.map((a, i) => (
            <Link key={a.id} to={`/article/${getArticleUid(a.title)}`} style={{
              display: 'flex', gap: '12px', padding: '12px 16px',
              borderBottom: i < popularArticles.length - 1 ? '1px solid var(--border)' : 'none',
              transition: 'background 0.15s', alignItems: 'flex-start',
              textDecoration: 'none',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--sand)'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <img src={a.image} alt="" style={{ width: '68px', height: '50px', objectFit: 'cover', borderRadius: '6px' }} />
                <span style={{
                  position: 'absolute', bottom: '-6px', right: '-6px',
                  background: 'var(--brand)', color: '#fff',
                  fontFamily: 'var(--font-ui)', fontWeight: 800,
                  fontSize: '9px', width: '18px', height: '18px',
                  borderRadius: '50%', display: 'flex',
                  alignItems: 'center', justifyContent: 'center',
                  border: '2px solid #fff',
                }}>
                  {i + 1}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontFamily: 'var(--font-ui)', fontWeight: 600,
                  fontSize: '12px', color: 'var(--text-dark)',
                  lineHeight: 1.4, marginBottom: '4px',
                  display: '-webkit-box', WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {a.title}
                </p>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', color: 'var(--text-light)' }}>{a.date}</span>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', color: 'var(--gold)', fontWeight: 700 }}>{a.views}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Social follow */}
      <div style={{ background: '#fff', borderRadius: '12px', border: '1px solid var(--border)', padding: '20px', boxShadow: 'var(--shadow-sm)' }}>
        <h4 style={{
          fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '13px',
          letterSpacing: '0.5px', color: 'var(--text-dark)',
          marginBottom: '14px', paddingBottom: '12px',
          borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', gap: '8px',
        }}>
          Follow Our Journey
        </h4>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          {[
            { label: 'Instagram', count: '284K', bg: 'linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)' },
            { label: 'TikTok', count: '519K', bg: '#000' },
            { label: 'YouTube', count: '128K', bg: '#FF0000' },
            { label: 'Facebook', count: '97K', bg: '#1877F2' },
          ].map(({ label, count, bg }) => (
            <a key={label} href="#" style={{
              background: bg, color: '#fff', borderRadius: '8px',
              padding: '10px', display: 'flex', flexDirection: 'column',
              alignItems: 'center', gap: '3px',
              transition: 'transform 0.2s, box-shadow 0.2s',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.2)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '14px' }}>{count}</span>
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', opacity: 0.85, letterSpacing: '0.5px' }}>{label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Newsletter */}
      <div style={{
        background: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' stroke='%23C9A050' stroke-width='0.3' opacity='0.15'%3E%3Cpath d='M20 0L40 20L20 40L0 20z'/%3E%3C/g%3E%3C/svg%3E"), linear-gradient(135deg, var(--midnight) 0%, var(--charcoal) 100%)`,
        borderRadius: '12px', padding: '24px',
      }}>
        <span style={{
          fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '10px',
          letterSpacing: '2px', color: 'var(--gold)',
          textTransform: 'uppercase', display: 'block', marginBottom: '8px',
        }}>
          ✈ Dubai Insider
        </span>
        <h4 style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '18px', color: '#fff', marginBottom: '8px' }}>
          Get Weekly Dubai Tips
        </h4>
        <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: '13px', color: 'rgba(255,255,255,0.6)', marginBottom: '16px', lineHeight: 1.6 }}>
          Deals, itineraries and insider tips straight to your inbox.
        </p>
        <input type="email" placeholder="Your email address"
          style={{
            width: '100%', padding: '10px 14px', fontFamily: 'var(--font-body)', fontSize: '13px',
            border: '1px solid rgba(201,160,80,0.25)', borderRadius: '7px',
            background: 'rgba(255,255,255,0.08)', color: '#fff', outline: 'none', marginBottom: '10px',
          }}
        />
        <button style={{
          width: '100%', background: 'var(--brand)', color: '#fff',
          fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '13px',
          padding: '11px', borderRadius: '7px', cursor: 'pointer',
          transition: 'background 0.2s',
        }}
          onMouseEnter={e => e.target.style.background = 'var(--brand-dark)'}
          onMouseLeave={e => e.target.style.background = 'var(--brand)'}
        >
          Subscribe Free ✈
        </button>
      </div>
    </div>
  );
}

function Arr() { return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>; }
function User() { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>; }
function Cal() { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>; }
function Eye() { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>; }
function Msg() { return <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>; }
