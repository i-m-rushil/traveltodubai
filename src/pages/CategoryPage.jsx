import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useIsMobile } from '../hooks/useIsMobile';
import {
  allArticles, CATEGORIES, filterBySlug,
  POPULAR_TAGS, CATEGORY_DESCRIPTIONS,
} from '../data/articles';
import { popularArticles, navLinks } from '../data/mockData';

/* ─── Featured card (hero-size) ─── */
function FeaturedCard({ article, isMobile }) {
  const [hov, setHov] = useState(false);
  return (
    <Link to={`/article/${article.uid}`} style={{ textDecoration: 'none', display: 'block' }}>
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
function ArticleCard({ article, hovered, onHover }) {
  return (
    <Link
      to={`/article/${article.uid}`}
      style={{ textDecoration: 'none', display: 'flex' }}
      onMouseEnter={() => onHover(article.uid)}
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

/* ─── Sidebar: Popular ─── */
function PopularSidebar() {
  const [hovId, setHovId] = useState(null);
  return (
    <div style={{ background: '#fff', borderRadius: 10, padding: '24px', marginBottom: 24, boxShadow: 'var(--shadow-sm)' }}>
      <SidebarHeading accent="var(--brand)">Popular This Week</SidebarHeading>
      {popularArticles.map((a, i) => (
        <div
          key={a.id}
          onMouseEnter={() => setHovId(a.id)}
          onMouseLeave={() => setHovId(null)}
          style={{
            display: 'flex', gap: 14, alignItems: 'flex-start',
            marginBottom: 16, paddingBottom: 16,
            borderBottom: i < popularArticles.length - 1 ? '1px solid var(--border)' : 'none',
          }}
        >
          {/* Rank badge */}
          <div style={{
            minWidth: 28, height: 28, borderRadius: '50%', flexShrink: 0,
            background: i === 0 ? 'var(--brand)' : 'var(--sand-mid)',
            color: i === 0 ? '#fff' : 'var(--text-mid)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 12, fontWeight: 900,
          }}>
            {i + 1}
          </div>
          <div>
            <p style={{
              fontFamily: 'var(--font-body)', fontSize: 13, fontWeight: 600,
              color: hovId === a.id ? 'var(--brand)' : 'var(--text-dark)',
              lineHeight: 1.5, marginBottom: 4,
              display: '-webkit-box', WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical', overflow: 'hidden',
              transition: 'color 0.2s', cursor: 'pointer',
            }}>
              {a.title}
            </p>
            <span style={{ fontSize: 11, color: 'var(--text-light)' }}>
              {a.views} views · {a.date}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ─── Sidebar: Tag cloud ─── */
function TagCloud() {
  const [hovTag, setHovTag] = useState(null);
  return (
    <div style={{ background: '#fff', borderRadius: 10, padding: '24px', marginBottom: 24, boxShadow: 'var(--shadow-sm)' }}>
      <SidebarHeading accent="var(--gold)">Explore Topics</SidebarHeading>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {POPULAR_TAGS.map(tag => (
          <span
            key={tag}
            onMouseEnter={() => setHovTag(tag)}
            onMouseLeave={() => setHovTag(null)}
            style={{
              padding: '5px 13px',
              border: `1px solid ${hovTag === tag ? 'var(--brand)' : 'var(--border)'}`,
              borderRadius: 20, fontSize: 12, fontWeight: 500,
              color: hovTag === tag ? 'var(--brand)' : 'var(--text-mid)',
              cursor: 'pointer', transition: 'all 0.18s',
              background: hovTag === tag ? 'var(--brand-glow)' : 'transparent',
            }}
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

/* ─── Sidebar: Newsletter ─── */
function NewsletterBox() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  return (
    <div style={{ background: 'var(--midnight)', borderRadius: 10, padding: '28px 24px', boxShadow: 'var(--shadow-md)' }}>
      <div style={{
        fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase',
        color: 'var(--brand)', marginBottom: 12,
      }}>
        ✦ Newsletter
      </div>
      <h3 style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: 18, color: '#fff', lineHeight: 1.3, marginBottom: 10 }}>
        Dubai in Your Inbox
      </h3>
      <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', lineHeight: 1.65, marginBottom: 22 }}>
        Weekly guides, hidden gems and exclusive deals — delivered every Friday.
      </p>
      {sent ? (
        <div style={{ background: 'rgba(228,61,48,0.12)', border: '1px solid rgba(228,61,48,0.25)', borderRadius: 5, padding: '13px 16px', color: 'var(--brand)', fontSize: 13, fontWeight: 700, textAlign: 'center' }}>
          ✓ You're subscribed!
        </div>
      ) : (
        <form onSubmit={e => { e.preventDefault(); setSent(true); }}>
          <input
            type="email" value={email} onChange={e => setEmail(e.target.value)}
            placeholder="Your email address" required
            style={{
              width: '100%', padding: '11px 14px', boxSizing: 'border-box',
              background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 5, color: '#fff', fontFamily: 'var(--font-body)', fontSize: 13,
              marginBottom: 10, outline: 'none',
            }}
          />
          <button
            type="submit"
            style={{
              width: '100%', padding: '12px', background: 'var(--brand)', color: '#fff',
              border: 'none', borderRadius: 5, fontFamily: 'var(--font-ui)',
              fontWeight: 700, fontSize: 12, cursor: 'pointer',
              letterSpacing: '0.08em', textTransform: 'uppercase',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--brand-dark)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--brand)'}
          >
            Subscribe Free
          </button>
        </form>
      )}
    </div>
  );
}

/* ─── Reusable sidebar heading ─── */
function SidebarHeading({ children, accent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
      <div style={{ width: 3, height: 18, background: accent, borderRadius: 2, flexShrink: 0 }} />
      <h3 style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: 15, color: 'var(--text-dark)' }}>
        {children}
      </h3>
    </div>
  );
}

/* ─── Sub-category card (shown in the hero strip) ─── */
function SubCatCard({ item, slug }) {
  const [hov, setHov] = useState(false);
  return (
    <Link
      to={`/category/${slug}`}
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

/* ─── Sub-category scrollable strip with left/right buttons ─── */
function SubCatStrip({ navLink, slug }) {
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
  }, [navLink]);

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
          Browse by sub-category
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
          {navLink.sub.map(item => (
            <SubCatCard key={item.label} item={item} slug={slug} />
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

/* ─── Main export ─── */
export default function CategoryPage() {
  const { slug } = useParams();
  const isMobile = useIsMobile();
  const activeSlug = slug || 'all';
  const [visibleCount, setVisibleCount] = useState(10);
  const [hoveredId, setHoveredId] = useState(null);

  useEffect(() => {
    setVisibleCount(10);
  }, [slug]);

  /* Update document title + meta */
  useEffect(() => {
    const cat = CATEGORIES.find(c => c.slug === activeSlug) || CATEGORIES[0];
    document.title = `${cat.label} – Dubai Travel Articles | Travel to Dubai`;

    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) { metaDesc = document.createElement('meta'); metaDesc.name = 'description'; document.head.appendChild(metaDesc); }
    metaDesc.content = CATEGORY_DESCRIPTIONS[activeSlug] || CATEGORY_DESCRIPTIONS.all;
  }, [activeSlug]);

  const articles      = filterBySlug(activeSlug);
  const featured      = articles[0];
  const rest          = articles.slice(1, visibleCount);
  const activeNavLink = navLinks.find(l => l.slug === activeSlug);
  const activeCat     = CATEGORIES.find(c => c.slug === activeSlug)
    || (activeNavLink ? { label: activeNavLink.label, slug: activeSlug, color: '#e43d30' } : CATEGORIES[0]);

  return (
    <div style={{ background: 'var(--sand)', minHeight: '100vh' }}>

      {/* ── Breadcrumb ── */}
      <nav aria-label="Breadcrumb" style={{ background: '#fff', borderBottom: '1px solid var(--border)', padding: '10px 0' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--text-mid)', flexWrap: 'wrap' }}>
          <Link to="/" style={{ color: 'var(--text-mid)', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--brand)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-mid)'}
          >Home</Link>
          <span style={{ color: 'var(--gray-mid)' }}>›</span>
          <span style={{ color: 'var(--brand)', fontWeight: 600 }}>{activeCat.label}</span>
        </div>
      </nav>

      {/* ── Category Hero ── */}
      <section style={{
        padding: isMobile ? '44px 20px 0' : '64px 20px 0',
        position: 'relative', overflow: 'hidden',
        backgroundImage: 'url(https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1600&q=85&auto=format&fit=crop)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 40%',
        backgroundRepeat: 'no-repeat',
        backgroundAttachment: 'fixed',
      }}>
        {/* Dark overlay */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(160deg, rgba(10,16,26,0.93) 0%, rgba(15,24,40,0.82) 60%, rgba(10,16,26,0.90) 100%)',
          zIndex: 0,
        }} />
        {/* Decorative glows layered on top of overlay */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: '50%', height: '100%', backgroundImage: 'radial-gradient(ellipse at 90% 40%, rgba(228,61,48,0.12) 0%, transparent 65%)', pointerEvents: 'none', zIndex: 1 }} />
        <div style={{ position: 'absolute', bottom: 0, left: 0, width: '30%', height: '80%', backgroundImage: 'radial-gradient(ellipse at 10% 80%, rgba(201,160,80,0.08) 0%, transparent 60%)', pointerEvents: 'none', zIndex: 1 }} />
        {/* Geometric rings */}
        <div style={{ position: 'absolute', top: -60, right: -60, width: 240, height: 240, borderRadius: '50%', border: '1px solid rgba(201,160,80,0.12)', pointerEvents: 'none', zIndex: 1 }} />
        <div style={{ position: 'absolute', top: -100, right: -100, width: 360, height: 360, borderRadius: '50%', border: '1px solid rgba(201,160,80,0.06)', pointerEvents: 'none', zIndex: 1 }} />

        <div style={{ maxWidth: 1240, margin: '0 auto', position: 'relative', zIndex: 2 }}>
          {/* Article count badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(228,61,48,0.12)', border: '1px solid rgba(228,61,48,0.22)', borderRadius: 4, padding: '4px 13px', marginBottom: 22 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand)', display: 'inline-block' }} />
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--brand)' }}>
              {articles.length} Articles
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-headline)', fontWeight: 900,
            fontSize: isMobile ? 34 : 54,
            color: '#fff', lineHeight: 1.08, marginBottom: 14,
            letterSpacing: '-0.025em', maxWidth: 700,
          }}>
            {activeCat.label}
          </h1>

          <p style={{
            fontFamily: 'var(--font-body)', fontWeight: 300,
            fontSize: isMobile ? 15 : 17,
            color: 'rgba(255,255,255,0.55)', maxWidth: 560,
            lineHeight: 1.8, marginBottom: activeNavLink ? 28 : 48,
          }}>
            {CATEGORY_DESCRIPTIONS[activeSlug] || CATEGORY_DESCRIPTIONS.all}
          </p>

          {/* Sub-category strip */}
          {activeNavLink && activeNavLink.sub?.length > 0 && (
            <SubCatStrip navLink={activeNavLink} slug={activeSlug} />
          )}

        </div>
      </section>

      {/* ── Main Content ── */}
      <div style={{
        maxWidth: 1240, margin: '0 auto',
        padding: isMobile ? '28px 16px 48px' : '48px 20px 72px',
        display: isMobile ? 'block' : 'grid',
        gridTemplateColumns: '1fr 300px',
        gap: 32, alignItems: 'start',
      }}>

        {/* Articles column */}
        <div>
          {/* Featured */}
          {featured && (
            <div style={{ marginBottom: 24 }}>
              <FeaturedCard article={featured} isMobile={isMobile} />
            </div>
          )}

          {/* Article grid */}
          {rest.length > 0 && (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 20, marginBottom: 36 }}>
              {rest.map(a => (
                <ArticleCard
                  key={a.uid}
                  article={a}
                  hovered={hoveredId === a.uid}
                  onHover={setHoveredId}
                />
              ))}
            </div>
          )}

          {articles.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-mid)', fontFamily: 'var(--font-body)' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>
              <h3 style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-dark)', marginBottom: 8 }}>No articles found</h3>
              <p style={{ fontSize: 14 }}>Try a different category filter.</p>
            </div>
          )}

          {/* Load More */}
          {visibleCount < articles.length && (
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <button
                onClick={() => setVisibleCount(v => v + 9)}
                style={{
                  padding: '13px 40px', background: 'var(--brand)', color: '#fff',
                  border: 'none', borderRadius: 5, fontFamily: 'var(--font-ui)',
                  fontWeight: 700, fontSize: 12, cursor: 'pointer',
                  letterSpacing: '0.08em', textTransform: 'uppercase',
                  transition: 'background 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--brand-dark)'}
                onMouseLeave={e => e.currentTarget.style.background = 'var(--brand)'}
              >
                Load More Articles
              </button>
              <p style={{ marginTop: 12, fontSize: 12, color: 'var(--text-light)' }}>
                Showing {Math.min(visibleCount, articles.length)} of {articles.length} articles
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        {!isMobile ? (
          <aside style={{ position: 'sticky', top: 88 }}>
            <PopularSidebar />
            <TagCloud />
            <NewsletterBox />
          </aside>
        ) : (
          <div style={{ marginTop: 44 }}>
            <PopularSidebar />
            <TagCloud />
            <NewsletterBox />
          </div>
        )}
      </div>
    </div>
  );
}
