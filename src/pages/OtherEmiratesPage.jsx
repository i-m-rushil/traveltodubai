import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '../hooks/useIsMobile';
import { emirates } from '../data/mockData';
import { getPublishedArticles, getArticleCount } from '../lib/supabase';
import { normalizeArticles } from '../lib/normalize';
import { FeaturedCard, ArticleCard } from '../components/ArticleCards';
import { PopularSidebar, TagCloud, NewsletterBox } from '../components/CategorySidebar';
import SubCatStrip from '../components/SubCatStrip';

const PAGE_SIZE = 9;

// The emirate labels (matching the DB `emirate` enum) that make up "Other
// Emirates" — used to scope both the posts grid and the Popular sidebar.
// Module-level so the array reference stays stable across renders.
const OTHER_EMIRATE_LABELS = emirates.map(e => e.label);

/*
 * "Other Emirates" landing page — reached from the More ▸ Other Emirates menu.
 * Mirrors the category-page layout: the emirates appear as sub-category cards
 * in the hero strip, and the body lists posts from across the other emirates
 * with a "Popular This Week" sidebar.
 */
export default function OtherEmiratesPage() {
  const isMobile = useIsMobile();
  const [articles, setArticles]     = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading]       = useState(true);
  const [hoveredId, setHoveredId]   = useState(null);

  useEffect(() => {
    document.title = 'Other Emirates – Beyond Dubai | Travel to Dubai';
  }, []);

  useEffect(() => {
    setArticles([]);
    setLoading(true);

    async function load() {
      const [count, { data }] = await Promise.all([
        getArticleCount(null, { emirates: OTHER_EMIRATE_LABELS }),
        getPublishedArticles({ emirates: OTHER_EMIRATE_LABELS, limit: PAGE_SIZE }),
      ]);
      setTotalCount(count);
      setArticles(normalizeArticles(data));
      setLoading(false);
    }
    load();
  }, []);

  const loadMore = async () => {
    const { data } = await getPublishedArticles({ emirates: OTHER_EMIRATE_LABELS, limit: PAGE_SIZE, offset: articles.length });
    setArticles(prev => [...prev, ...normalizeArticles(data)]);
  };

  const featured = articles[0];
  const rest     = articles.slice(1);

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
          <span style={{ color: 'var(--text-mid)' }}>More</span>
          <span style={{ color: 'var(--gray-mid)' }}>›</span>
          <span style={{ color: 'var(--brand)', fontWeight: 600 }}>Other Emirates</span>
        </div>
      </nav>

      {/* ── Hero ── */}
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
          {/* Badge */}
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(228,61,48,0.12)', border: '1px solid rgba(228,61,48,0.22)', borderRadius: 4, padding: '4px 13px', marginBottom: 22 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand)', display: 'inline-block' }} />
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--brand)' }}>
              Beyond Dubai
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-headline)', fontWeight: 900,
            fontSize: isMobile ? 34 : 54,
            color: '#fff', lineHeight: 1.08, marginBottom: 14,
            letterSpacing: '-0.025em', maxWidth: 700,
          }}>
            Other Emirates
          </h1>

          <p style={{
            fontFamily: 'var(--font-body)', fontWeight: 300,
            fontSize: isMobile ? 15 : 17,
            color: 'rgba(255,255,255,0.55)', maxWidth: 560,
            lineHeight: 1.8, marginBottom: 28,
          }}>
            Explore the rest of the UAE — pick an emirate to plan your trip, find places
            to stay, discover where to eat, and see the best things to do.
          </p>

          {/* Emirates as sub-category strip */}
          <SubCatStrip
            items={emirates}
            linkFor={em => `/emirate/${em.slug}`}
            heading="Browse by emirate"
          />
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
                  key={a.slug}
                  article={a}
                  hovered={hoveredId === a.slug}
                  onHover={setHoveredId}
                />
              ))}
            </div>
          )}

          {!loading && articles.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-mid)', fontFamily: 'var(--font-body)' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🏜️</div>
              <h3 style={{ fontWeight: 700, fontSize: 18, color: 'var(--text-dark)', marginBottom: 8 }}>No articles yet</h3>
              <p style={{ fontSize: 14 }}>Pick an emirate above to explore guides, stays and things to do.</p>
            </div>
          )}

          {loading && articles.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-light)', fontFamily: 'var(--font-body)' }}>
              Loading articles…
            </div>
          )}

          {/* Load More */}
          {articles.length < totalCount && !loading && (
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <button
                onClick={loadMore}
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
                Showing {articles.length} of {totalCount.toLocaleString()} articles
              </p>
            </div>
          )}
        </div>

        {/* Sidebar */}
        {!isMobile ? (
          <aside style={{ position: 'sticky', top: 88 }}>
            <PopularSidebar emirates={OTHER_EMIRATE_LABELS} />
            <TagCloud />
            <NewsletterBox />
          </aside>
        ) : (
          <div style={{ marginTop: 44 }}>
            <PopularSidebar emirates={OTHER_EMIRATE_LABELS} />
            <TagCloud />
            <NewsletterBox />
          </div>
        )}
      </div>
    </div>
  );
}
