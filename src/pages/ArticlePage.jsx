import { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useIsMobile } from '../hooks/useIsMobile';
import { getArticleBySlug, getRelatedArticles } from '../lib/supabase';
import { normalizeArticle, normalizeArticles } from '../lib/normalize';

/* ─── Reading progress bar ─── */
function ReadingProgressBar() {
  const [pct, setPct] = useState(0);
  useEffect(() => {
    const update = () => {
      const scrolled = window.scrollY;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      setPct(total > 0 ? Math.min(100, (scrolled / total) * 100) : 0);
    };
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, height: 3, zIndex: 9999, background: 'rgba(0,0,0,0.06)' }}>
      <div style={{ height: '100%', width: `${pct}%`, background: 'var(--brand)', transition: 'width 0.08s linear', borderRadius: '0 2px 2px 0' }} />
    </div>
  );
}

/* ─── Share button ─── */
function ShareBtn({ label, bg, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        padding: '6px 13px', background: hov ? bg : 'transparent',
        color: hov ? '#fff' : 'var(--text-mid)',
        border: `1px solid ${hov ? bg : 'var(--border)'}`,
        borderRadius: 4, fontSize: 11, fontWeight: 700,
        cursor: 'pointer', fontFamily: 'var(--font-ui)',
        letterSpacing: '0.04em', transition: 'all 0.18s', whiteSpace: 'nowrap',
      }}
    >
      {label}
    </button>
  );
}

/* ─── Inline ad banner ─── */
function InlineAd({ src, headline, sub, cta = 'Learn More →' }) {
  return (
    <div style={{ margin: '48px 0' }}>
      <div style={{
        fontSize: 9, fontWeight: 600, color: 'var(--gray-mid)',
        letterSpacing: '0.14em', textTransform: 'uppercase',
        textAlign: 'center', marginBottom: 8, fontFamily: 'var(--font-ui)',
      }}>
        Advertisement
      </div>
      <a href="#" style={{ display: 'block', textDecoration: 'none', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', position: 'relative' }}>
        <img
          src={src} alt="" aria-hidden="true"
          style={{ width: '100%', height: 140, objectFit: 'cover', display: 'block' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(90deg, rgba(13,21,36,0.9) 0%, rgba(13,21,36,0.58) 55%, rgba(13,21,36,0.08) 100%)',
          display: 'flex', alignItems: 'center',
          padding: '0 28px', gap: 24,
        }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: 18, color: '#fff', marginBottom: 5 }}>
              {headline}
            </div>
            <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.7)', fontWeight: 300 }}>
              {sub}
            </div>
          </div>
          <div style={{
            background: 'var(--brand)', color: '#fff',
            fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 12,
            padding: '10px 22px', borderRadius: 5, flexShrink: 0,
            letterSpacing: '0.04em', whiteSpace: 'nowrap',
          }}>
            {cta}
          </div>
        </div>
      </a>
    </div>
  );
}

/* ─── Article body ─── */
function ArticleBody({ article }) {
  if (!article.content) {
    return (
      <p style={{ fontFamily: 'var(--font-body)', fontSize: 17, color: 'var(--text-mid)', lineHeight: 1.88 }}>
        Article content is not available.
      </p>
    );
  }
  return (
    <div
      className="article-content"
      dangerouslySetInnerHTML={{ __html: article.content }}
    />
  );
}

/* ─── Related article card ─── */
function RelatedCard({ article }) {
  const [hov, setHov] = useState(false);
  return (
    <Link
      to={`/article/${article.slug}`}
      style={{ textDecoration: 'none', display: 'block' }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <article style={{
        background: '#fff', borderRadius: 8, overflow: 'hidden',
        boxShadow: hov ? 'var(--shadow-md)' : 'var(--shadow-sm)',
        transform: hov ? 'translateY(-4px)' : 'translateY(0)',
        transition: 'all 0.3s',
      }}>
        <div style={{ height: 165, overflow: 'hidden' }}>
          <img
            src={article.image} alt={article.title} loading="lazy"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', transform: hov ? 'scale(1.06)' : 'scale(1)', transition: 'transform 0.45s' }}
          />
        </div>
        <div style={{ padding: '16px 18px 20px' }}>
          <div style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: article.categoryColor || 'var(--brand)', marginBottom: 8 }}>
            {article.category}
          </div>
          <h4 style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: 14, lineHeight: 1.45, color: 'var(--text-dark)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
            {article.title}
          </h4>
          {article.date && (
            <p style={{ fontSize: 11, color: 'var(--text-light)', marginTop: 8 }}>{article.date}</p>
          )}
        </div>
      </article>
    </Link>
  );
}

/* ─── Main export ─── */
export default function ArticlePage() {
  const { slug }  = useParams();
  const isMobile  = useIsMobile();
  const [article, setArticle]   = useState(null);
  const [related, setRelated]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [copied, setCopied]     = useState(false);
  const bodyRef = useRef(null);

  useEffect(() => {
    setArticle(null);
    setRelated([]);
    setLoading(true);

    async function load() {
      const { data, error } = await getArticleBySlug(slug);
      if (error || !data) { setLoading(false); return; }
      const norm = normalizeArticle(data);
      setArticle(norm);
      setLoading(false);

      if (data.category_id) {
        const { data: rel } = await getRelatedArticles(data.category_id, data.id, 3);
        setRelated(normalizeArticles(rel));
      }
    }
    load();
  }, [slug]);

  /* Load Instagram embed script when article contains Instagram embeds */
  useEffect(() => {
    if (!article?.content?.includes('instagram-media')) return;
    if (window.instgrm) {
      window.instgrm.Embeds.process();
    } else {
      const s = document.createElement('script');
      s.src = 'https://www.instagram.com/embed.js';
      s.async = true;
      document.body.appendChild(s);
    }
  }, [article]);

  /* Scroll to top + SEO when article loads */
  useEffect(() => {
    window.scrollTo(0, 0);
    if (!article) return;

    document.title = `${article.title} | Travel to Dubai`;

    const setMeta = (key, content, prop = false) => {
      const sel = prop ? `meta[property="${key}"]` : `meta[name="${key}"]`;
      let tag = document.querySelector(sel);
      if (!tag) {
        tag = document.createElement('meta');
        prop ? tag.setAttribute('property', key) : (tag.name = key);
        document.head.appendChild(tag);
      }
      tag.setAttribute('content', content || '');
    };

    setMeta('description', article.excerpt || '');
    setMeta('og:title',       article.title,            true);
    setMeta('og:description', article.excerpt || '',    true);
    setMeta('og:image',       article.image  || '',     true);
    setMeta('og:type',        'article',                true);
    setMeta('og:url',         window.location.href,     true);
    setMeta('twitter:card',   'summary_large_image');
    setMeta('twitter:title',  article.title);
    setMeta('twitter:description', article.excerpt || '');
    setMeta('twitter:image',  article.image  || '');

    if (article.author) {
      let ld = document.getElementById('article-ld');
      if (!ld) { ld = document.createElement('script'); ld.type = 'application/ld+json'; ld.id = 'article-ld'; document.head.appendChild(ld); }
      ld.textContent = JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: article.title,
        description: article.excerpt,
        image: article.image,
        author: { '@type': 'Person', name: article.author },
        datePublished: article.date,
        publisher: { '@type': 'Organization', name: 'Travel to Dubai', logo: { '@type': 'ImageObject', url: '/Travel-to-Dubai-Logo.svg' } },
      });
    }

    return () => {
      document.title = 'Travel to Dubai | Top Attractions, Activities & Travel Guide';
      document.getElementById('article-ld')?.remove();
    };
  }, [article]);

  const handleCopy = () => {
    navigator.clipboard?.writeText(window.location.href).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* Loading state */
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', background: 'var(--sand)', minHeight: '60vh', color: 'var(--text-light)', fontFamily: 'var(--font-body)' }}>
        Loading article…
      </div>
    );
  }

  /* 404 state */
  if (!article) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px', fontFamily: 'var(--font-body)', background: 'var(--sand)', minHeight: '60vh' }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>🗺️</div>
        <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 900, fontSize: 28, color: 'var(--text-dark)', marginBottom: 12 }}>Article Not Found</h2>
        <p style={{ color: 'var(--text-mid)', marginBottom: 28 }}>This article may have moved or been removed.</p>
        <Link to="/category/all" style={{ background: 'var(--brand)', color: '#fff', padding: '12px 28px', borderRadius: 5, fontWeight: 700, fontSize: 14, letterSpacing: '0.06em', textTransform: 'uppercase', fontFamily: 'var(--font-ui)' }}>
          ← Browse All Articles
        </Link>
      </div>
    );
  }

  const initial = article.author ? article.author[0].toUpperCase() : 'A';

  return (
    <div style={{ background: 'var(--sand)' }}>
      <ReadingProgressBar />

      {/* ── Breadcrumb ── */}
      <nav aria-label="Breadcrumb" style={{ background: '#fff', borderBottom: '1px solid var(--border)', padding: '10px 0' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, fontSize: 13, color: 'var(--text-mid)', flexWrap: 'wrap' }}>
          <Link to="/" style={{ color: 'var(--text-mid)', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--brand)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-mid)'}
          >Home</Link>
          <span style={{ color: 'var(--gray-mid)' }}>›</span>
          <Link to="/category/all" style={{ color: 'var(--text-mid)', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--brand)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-mid)'}
          >{article.category}</Link>
          <span style={{ color: 'var(--gray-mid)' }}>›</span>
          <span style={{ color: 'var(--brand)', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: isMobile ? 140 : 420 }}>
            {article.title}
          </span>
        </div>
      </nav>

      {/* ── Hero Image with Content Overlay ── */}
      <div style={{ position: 'relative', overflow: 'hidden', background: 'var(--midnight)' }}>
        <img
          src={article.image}
          alt={article.title}
          style={{
            width: '100%',
            height: isMobile ? 480 : 640,
            objectFit: 'cover', display: 'block',
            opacity: 0.72,
          }}
        />
        {/* Heavy gradient overlay — content reads clearly at the bottom */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to top, rgba(13,21,36,0.97) 0%, rgba(13,21,36,0.7) 38%, rgba(13,21,36,0.15) 100%)',
        }} />

        {/* Overlay content */}
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'flex-end' }}>
          <div style={{ width: '100%' }}>
            <div style={{ maxWidth: 900, margin: '0 auto', padding: isMobile ? '0 18px 44px' : '0 24px 64px' }}>

              {/* Category pill + meta */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18, flexWrap: 'wrap' }}>
                <span style={{
                  background: article.categoryColor || 'var(--brand)',
                  color: '#fff', padding: '4px 12px', borderRadius: 3,
                  fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase',
                }}>
                  {article.category}
                </span>
                {article.date && (
                  <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-ui)' }}>{article.date}</span>
                )}
                {article.readTime && (
                  <>
                    <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>|</span>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-ui)' }}>{article.readTime}</span>
                  </>
                )}
                {article.views && (
                  <>
                    <span style={{ color: 'rgba(255,255,255,0.25)', fontSize: 12 }}>|</span>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', fontFamily: 'var(--font-ui)' }}>👁 {article.views}</span>
                  </>
                )}
              </div>

              {/* H1 Title */}
              <h1 style={{
                fontFamily: 'var(--font-headline)', fontWeight: 900,
                fontSize: isMobile ? 26 : 50,
                lineHeight: 1.1, color: '#fff',
                letterSpacing: '-0.025em', marginBottom: 18,
                textShadow: '0 2px 24px rgba(0,0,0,0.5)',
              }}>
                {article.title}
              </h1>

              {/* Lead / excerpt */}
              {article.excerpt && (
                <p style={{
                  fontFamily: 'var(--font-body)', fontWeight: 300,
                  fontSize: isMobile ? 15 : 18,
                  lineHeight: 1.72, color: 'rgba(255,255,255,0.78)',
                  margin: 0, maxWidth: 680,
                  borderLeft: '3px solid var(--brand)', paddingLeft: 18,
                }}>
                  {article.excerpt}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Author + Share row ── */}
      <div style={{ background: '#fff', borderBottom: '1px solid var(--border)' }}>
        <div style={{ maxWidth: 900, margin: '0 auto', padding: isMobile ? '18px 18px' : '22px 24px' }}>
          <div style={{
            display: 'flex', alignItems: isMobile ? 'flex-start' : 'center',
            justifyContent: 'space-between',
            gap: 16, flexDirection: isMobile ? 'column' : 'row',
          }}>
            {/* Author */}
            {article.author && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{
                  width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
                  background: 'var(--midnight)', color: '#fff',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontFamily: 'var(--font-headline)', fontWeight: 900, fontSize: 18,
                  overflow: 'hidden',
                }}>
                  {article.authorAvatar
                    ? <img src={article.authorAvatar} alt={article.author} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : initial}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-body)', fontWeight: 700, fontSize: 14, color: 'var(--text-dark)' }}>
                    {article.author}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--text-light)' }}>Staff Writer · Travel to Dubai</div>
                </div>
              </div>
            )}

            {/* Share buttons */}
            <div style={{ display: 'flex', gap: 7, alignItems: 'center', flexWrap: 'wrap' }}>
              <span style={{ fontSize: 11, color: 'var(--text-light)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase', marginRight: 2 }}>Share</span>
              <ShareBtn label="Twitter"  bg="#1da1f2" onClick={() => {}} />
              <ShareBtn label="Facebook" bg="#1877f2" onClick={() => {}} />
              <ShareBtn label="LinkedIn" bg="#0a66c2" onClick={() => {}} />
              <ShareBtn label={copied ? '✓ Copied!' : 'Copy Link'} bg="var(--midnight)" onClick={handleCopy} />
            </div>
          </div>
        </div>
      </div>

      {/* ── Article Body ── */}
      <div style={{ background: '#fff' }}>
        <div
          ref={bodyRef}
          style={{ maxWidth: 740, margin: '0 auto', padding: isMobile ? '36px 18px 56px' : '60px 20px 80px' }}
        >
          <ArticleBody article={article} />

          <InlineAd
            src="https://images.unsplash.com/photo-1534447677768-be436bb09401?w=900&h=200&q=85&fit=crop"
            headline="Discover Old Dubai's Hidden Lanes"
            sub="Private guided walking tours through historic Deira & Al Fahidi from AED 149"
            cta="Book a Tour →"
          />

          {/* Tags */}
          <div style={{ marginTop: 52, paddingTop: 32, borderTop: '1px solid var(--border)', display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-mid)', textTransform: 'uppercase', letterSpacing: '0.1em', marginRight: 4 }}>
              Tags:
            </span>
            {['Dubai Travel', article.category, 'UAE Guide', 'Middle East'].map(tag => (
              <span key={tag} style={{
                padding: '5px 15px', border: '1px solid var(--border-dark)',
                borderRadius: 20, fontSize: 12, color: 'var(--text-mid)',
                cursor: 'pointer', fontWeight: 500, transition: 'all 0.18s',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.color = 'var(--brand)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-dark)'; e.currentTarget.style.color = 'var(--text-mid)'; }}
              >
                {tag}
              </span>
            ))}
          </div>

          {/* Share row at bottom */}
          <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border)', display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-mid)', marginRight: 4 }}>Share this article:</span>
            <ShareBtn label="Twitter"  bg="#1da1f2" onClick={() => {}} />
            <ShareBtn label="Facebook" bg="#1877f2" onClick={() => {}} />
            <ShareBtn label="LinkedIn" bg="#0a66c2" onClick={() => {}} />
            <ShareBtn label={copied ? '✓ Copied!' : 'Copy Link'} bg="var(--midnight)" onClick={handleCopy} />
          </div>
        </div>
      </div>

      {/* ── Author Bio ── */}
      {article.author && (
        <div style={{ background: 'var(--sand)', padding: isMobile ? '32px 16px 40px' : '48px 20px 56px' }}>
          <div style={{ maxWidth: 740, margin: '0 auto' }}>
            <div style={{
              background: 'var(--midnight)', borderRadius: 10,
              padding: isMobile ? '24px 20px' : '32px 36px',
              display: 'flex', gap: 24, alignItems: 'flex-start',
              flexDirection: isMobile ? 'column' : 'row',
            }}>
              <div style={{
                width: 64, height: 64, borderRadius: '50%', flexShrink: 0,
                background: 'var(--brand)', color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'var(--font-headline)', fontWeight: 900, fontSize: 26,
                overflow: 'hidden',
              }}>
                {article.authorAvatar
                  ? <img src={article.authorAvatar} alt={article.author} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  : initial}
              </div>
              <div>
                <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--brand)', marginBottom: 6 }}>
                  About the Author
                </div>
                <div style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: 18, color: '#fff', marginBottom: 10 }}>
                  {article.author}
                </div>
                <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 14, color: 'rgba(255,255,255,0.55)', lineHeight: 1.75, margin: 0 }}>
                  A senior travel correspondent at Travel to Dubai, {article.author.split(' ')[0]} has spent over eight years exploring the UAE's neighbourhoods, desert landscapes, and rich cultural heritage. Their writing combines rigorous on-the-ground reporting with practical guidance for visitors of every travel style and budget.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Related Articles ── */}
      {related.length > 0 && (
        <div style={{ background: 'var(--sand)', padding: isMobile ? '8px 16px 56px' : '8px 20px 80px' }}>
          <div style={{ maxWidth: 1200, margin: '0 auto' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
              <div style={{ width: 3, height: 22, background: 'var(--brand)', borderRadius: 2 }} />
              <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: 22, color: 'var(--text-dark)' }}>
                You Might Also Like
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)', gap: 20 }}>
              {related.map(a => <RelatedCard key={a.slug} article={a} />)}
            </div>
          </div>
        </div>
      )}

      {/* ── Back to Top + Browse ── */}
      <div style={{ background: '#fff', borderTop: '1px solid var(--border)', padding: '20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <Link to="/category/all" style={{
          display: 'inline-flex', alignItems: 'center', gap: 6,
          color: 'var(--brand)', fontWeight: 700, fontSize: 13,
          fontFamily: 'var(--font-ui)', textDecoration: 'none',
          letterSpacing: '0.04em',
        }}
          onMouseEnter={e => e.currentTarget.style.opacity = '0.75'}
          onMouseLeave={e => e.currentTarget.style.opacity = '1'}
        >
          ← Browse All Articles
        </Link>
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          style={{
            background: 'none', border: '1px solid var(--border)', padding: '9px 22px',
            borderRadius: 4, fontFamily: 'var(--font-ui)', fontSize: 12,
            fontWeight: 700, color: 'var(--text-mid)', cursor: 'pointer',
            letterSpacing: '0.06em', textTransform: 'uppercase', transition: 'all 0.2s',
          }}
          onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.color = 'var(--brand)'; }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--text-mid)'; }}
        >
          ↑ Back to Top
        </button>
      </div>
    </div>
  );
}
