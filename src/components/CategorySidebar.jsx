import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { POPULAR_TAGS } from '../data/articles';
import { DUBAI_AREAS } from '../data/areas';
import { getCategoryIdBySlug, getMostViewedArticles } from '../lib/supabase';
import { normalizeArticles } from '../lib/normalize';

/* ─── Reusable sidebar heading ─── */
export function SidebarHeading({ children, accent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
      <div style={{ width: 3, height: 18, background: accent, borderRadius: 2, flexShrink: 0 }} />
      <h3 style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: 15, color: 'var(--text-dark)' }}>
        {children}
      </h3>
    </div>
  );
}

/*
 * Sidebar: Popular This Week.
 * Scope the list with either `categorySlug` (a content category) or
 * `emirates` (an array of emirate labels) — both are optional.
 */
export function PopularSidebar({ categorySlug, emirates }) {
  const [hovId, setHovId] = useState(null);
  const [popular, setPopular] = useState([]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const categoryId = categorySlug && categorySlug !== 'all'
        ? await getCategoryIdBySlug(categorySlug)
        : null;
      const { data } = await getMostViewedArticles(5, { categoryId, emirates });
      if (!cancelled) setPopular(normalizeArticles(data));
    })();
    return () => { cancelled = true; };
  }, [categorySlug, emirates]);

  return (
    <div style={{ background: '#fff', borderRadius: 10, padding: '24px', marginBottom: 24, boxShadow: 'var(--shadow-sm)' }}>
      <SidebarHeading accent="var(--brand)">Popular This Week</SidebarHeading>
      {popular.map((a, i) => (
        <Link
          key={a.id}
          to={`/article/${a.slug}`}
          onMouseEnter={() => setHovId(a.id)}
          onMouseLeave={() => setHovId(null)}
          style={{
            display: 'flex', gap: 14, alignItems: 'flex-start',
            marginBottom: 16, paddingBottom: 16, textDecoration: 'none',
            borderBottom: i < popular.length - 1 ? '1px solid var(--border)' : 'none',
          }}
        >
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
              {a.views} · {a.date}
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
}

/* ─── Sidebar: Tag cloud ─── */
export function TagCloud() {
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

/* ─── Sidebar: Filter by Dubai area ─── */
export function AreaFilter({ selected, onSelect }) {
  const [hov, setHov] = useState(null);
  return (
    <div style={{ background: '#fff', borderRadius: 10, padding: '24px', marginBottom: 24, boxShadow: 'var(--shadow-sm)' }}>
      <SidebarHeading accent="var(--brand)">Filter by Area</SidebarHeading>

      {selected && (
        <button
          onClick={() => onSelect(null)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 14,
            padding: '5px 12px', borderRadius: 20, cursor: 'pointer',
            border: '1px solid var(--brand)', background: 'var(--brand)', color: '#fff',
            fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600,
          }}
        >
          {selected} <span style={{ fontSize: 13, lineHeight: 1 }}>✕</span>
        </button>
      )}

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {DUBAI_AREAS.map(a => {
          const active = a === selected;
          return (
            <button
              key={a}
              onClick={() => onSelect(active ? null : a)}
              onMouseEnter={() => setHov(a)}
              onMouseLeave={() => setHov(null)}
              style={{
                padding: '5px 13px', borderRadius: 20, cursor: 'pointer',
                border: `1px solid ${active || hov === a ? 'var(--brand)' : 'var(--border)'}`,
                background: active ? 'var(--brand)' : hov === a ? 'var(--brand-glow)' : 'transparent',
                color: active ? '#fff' : hov === a ? 'var(--brand)' : 'var(--text-mid)',
                fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 500,
                transition: 'all 0.16s',
              }}
            >
              {a}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Sidebar: Newsletter ─── */
export function NewsletterBox() {
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
