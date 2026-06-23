import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useIsMobile } from '../../hooks/useIsMobile'
import { getSession, dashListArticles, getPublisherStats } from '../../lib/supabase'

// ─── Helpers ───────────────────────────────────────────────────────────────
function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

function formatViews(n) {
  if (n >= 1000) return (n / 1000).toFixed(1) + 'k'
  return String(n)
}

// ─── Status Badge ──────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const map = {
    published: {
      bg: 'rgba(16,185,129,0.1)',
      color: '#059669',
      border: '1px solid rgba(16,185,129,0.2)',
      label: 'Published',
    },
    draft: {
      bg: 'rgba(245,158,11,0.1)',
      color: '#d97706',
      border: '1px solid rgba(245,158,11,0.2)',
      label: 'Draft',
    },
    pending: {
      bg: 'rgba(59,130,246,0.1)',
      color: '#2563eb',
      border: '1px solid rgba(59,130,246,0.2)',
      label: 'Pending',
    },
  }
  const s = map[status] || map.pending
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 10px',
        borderRadius: 20,
        fontFamily: 'var(--font-ui)',
        fontSize: 11,
        fontWeight: 600,
        background: s.bg,
        color: s.color,
        border: s.border,
      }}
    >
      {s.label}
    </span>
  )
}

// ─── Stat Card ─────────────────────────────────────────────────────────────
function StatCard({ label, value, icon }) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        flex: 1,
        minWidth: 0,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: 'var(--text-light)',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          fontFamily: 'var(--font-ui)',
          display: 'flex',
          alignItems: 'center',
          gap: 6,
        }}
      >
        {icon}
        {label}
      </div>
      <div
        style={{
          fontSize: 28,
          fontWeight: 700,
          color: 'var(--brand)',
          fontFamily: 'var(--font-ui)',
          lineHeight: 1,
        }}
      >
        {value}
      </div>
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function PublisherHome() {
  const isMobile = useIsMobile()
  const auth = JSON.parse(localStorage.getItem('ttd_auth') || '{}')

  const [myStats, setMyStats] = useState({ total: 0, published: 0, drafts: 0, views: 0 })
  const [recentPosts, setRecentPosts] = useState([])

  useEffect(() => {
    (async () => {
      const session = await getSession()
      if (!session) return
      const uid = session.user.id
      const [{ data: statsData }, { data: recent }] = await Promise.all([
        getPublisherStats(uid),
        dashListArticles({ authorId: uid, limit: 5 }),
      ])
      if (statsData) setMyStats(statsData)
      setRecentPosts(recent || [])
    })()
  }, [])

  const stats = [
    { label: 'My Posts', value: myStats.total, icon: <DocumentIcon size={14} /> },
    { label: 'Published', value: myStats.published, icon: <CheckCircleIcon size={14} /> },
    { label: 'Drafts', value: myStats.drafts, icon: <DraftIcon size={14} /> },
    { label: 'Total Views', value: formatViews(myStats.views), icon: <EyeIcon size={14} /> },
  ]

  const tips = [
    'Aim for 800+ words for better SEO',
    'Include a compelling featured image',
    'Write a 150–160 char meta description',
    'Use relevant keywords naturally',
  ]

  return (
    <div style={{ fontFamily: 'var(--font-ui)' }}>

      {/* ── Page Header ── */}
      <div style={{ marginBottom: 28 }}>
        <h1
          style={{
            margin: 0,
            fontSize: 24,
            fontWeight: 700,
            color: 'var(--text-dark)',
            fontFamily: 'var(--font-ui)',
          }}
        >
          Welcome back, {auth.name || 'Publisher'} 👋
        </h1>
        <p
          style={{
            margin: '6px 0 0',
            fontSize: 14,
            color: 'var(--text-mid)',
            fontFamily: 'var(--font-ui)',
          }}
        >
          Here's what's happening with your content today.
        </p>
      </div>

      {/* ── Stat Cards ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)',
          gap: 16,
          marginBottom: 28,
        }}
      >
        {stats.map((s) => (
          <StatCard key={s.label} label={s.label} value={s.value} icon={s.icon} />
        ))}
      </div>

      {/* ── Two-column layout (desktop) ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 320px',
          gap: 20,
          alignItems: 'start',
        }}
      >

        {/* ── Left column ── */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Quick Actions */}
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              padding: '20px 24px',
            }}
          >
            <h2
              style={{
                margin: '0 0 16px',
                fontSize: 15,
                fontWeight: 700,
                color: 'var(--text-dark)',
                fontFamily: 'var(--font-ui)',
              }}
            >
              Quick Actions
            </h2>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: 14,
              }}
            >
              <Link
                to="/dashboard/compose"
                style={{ textDecoration: 'none' }}
              >
                <div
                  style={{
                    background: 'var(--brand)',
                    borderRadius: 12,
                    padding: '24px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 12,
                    cursor: 'pointer',
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  <div style={{ color: '#fff' }}>
                    <PencilIcon size={32} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: '#fff',
                        fontFamily: 'var(--font-ui)',
                        marginBottom: 4,
                      }}
                    >
                      Write New Post
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: 'rgba(255,255,255,0.75)',
                        fontFamily: 'var(--font-ui)',
                      }}
                    >
                      Start a new article
                    </div>
                  </div>
                </div>
              </Link>

              <Link
                to="/dashboard/posts"
                style={{ textDecoration: 'none' }}
              >
                <div
                  style={{
                    background: 'var(--midnight)',
                    borderRadius: 12,
                    padding: '24px 20px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'flex-start',
                    gap: 12,
                    cursor: 'pointer',
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.9')}
                  onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
                >
                  <div style={{ color: '#fff' }}>
                    <DocumentIcon size={32} />
                  </div>
                  <div>
                    <div
                      style={{
                        fontSize: 15,
                        fontWeight: 700,
                        color: '#fff',
                        fontFamily: 'var(--font-ui)',
                        marginBottom: 4,
                      }}
                    >
                      View My Posts
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        color: 'rgba(255,255,255,0.75)',
                        fontFamily: 'var(--font-ui)',
                      }}
                    >
                      Manage your content
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          </div>

          {/* Recent Posts */}
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              border: '1px solid #e2e8f0',
              boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                padding: '18px 24px',
                borderBottom: '1px solid #f1f5f9',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 15,
                  fontWeight: 700,
                  color: 'var(--text-dark)',
                  fontFamily: 'var(--font-ui)',
                }}
              >
                Recent Posts
              </h2>
              <Link
                to="/dashboard/posts"
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: 'var(--brand)',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-ui)',
                }}
              >
                View all
              </Link>
            </div>

            {recentPosts.length === 0 ? (
              <div
                style={{
                  padding: '40px 24px',
                  textAlign: 'center',
                  color: 'var(--text-light)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: 14,
                }}
              >
                No posts yet. Start writing!
              </div>
            ) : (
              <div>
                {recentPosts.map((post, i) => (
                  <Link
                    key={post.id}
                    to={`/dashboard/compose/${post.id}`}
                    style={{ textDecoration: 'none' }}
                  >
                    <RecentPostRow post={post} isLast={i === recentPosts.length - 1} />
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ── Right column — Writing Tips ── */}
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            padding: '20px 24px',
          }}
        >
          <h2
            style={{
              margin: '0 0 4px',
              fontSize: 15,
              fontWeight: 700,
              color: 'var(--text-dark)',
              fontFamily: 'var(--font-ui)',
            }}
          >
            Content Tips
          </h2>
          <p
            style={{
              margin: '0 0 18px',
              fontSize: 12,
              color: 'var(--text-light)',
              fontFamily: 'var(--font-ui)',
            }}
          >
            Best practices for great articles
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {tips.map((tip, i) => (
              <div
                key={i}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 10,
                }}
              >
                <span style={{ flexShrink: 0, marginTop: 1 }}>
                  <CheckIcon />
                </span>
                <span
                  style={{
                    fontSize: 13,
                    color: 'var(--text-mid)',
                    fontFamily: 'var(--font-ui)',
                    lineHeight: 1.5,
                  }}
                >
                  {tip}
                </span>
              </div>
            ))}
          </div>

          {/* Divider + quick stats */}
          <div
            style={{
              marginTop: 24,
              paddingTop: 20,
              borderTop: '1px solid #f1f5f9',
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--text-light)',
                letterSpacing: '1px',
                textTransform: 'uppercase',
                fontFamily: 'var(--font-ui)',
                marginBottom: 14,
              }}
            >
              Your Stats
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { label: 'Avg views / post', value: myStats.published ? formatViews(Math.round(myStats.views / myStats.published)) : '0' },
                { label: 'Published rate', value: myStats.total ? Math.round((myStats.published / myStats.total) * 100) + '%' : '0%' },
              ].map((row) => (
                <div
                  key={row.label}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      color: 'var(--text-mid)',
                      fontFamily: 'var(--font-ui)',
                    }}
                  >
                    {row.label}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      color: 'var(--text-dark)',
                      fontFamily: 'var(--font-ui)',
                    }}
                  >
                    {row.value}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Recent Post Row ───────────────────────────────────────────────────────
function RecentPostRow({ post, isLast }) {
  const [hovered, setHovered] = useState(false)

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 14,
        padding: '14px 24px',
        borderBottom: isLast ? 'none' : '1px solid #f1f5f9',
        background: hovered ? '#f8fafc' : '#fff',
        transition: 'background 0.12s',
        cursor: 'pointer',
      }}
    >
      {/* Thumbnail */}
      {post.featured_image ? (
        <img
          src={post.featured_image}
          alt={post.title}
          loading="lazy"
          decoding="async"
          style={{
            width: 60,
            height: 44,
            objectFit: 'cover',
            borderRadius: 8,
            flexShrink: 0,
          }}
        />
      ) : (
        <div
          style={{
            width: 60,
            height: 44,
            borderRadius: 8,
            background: '#f1f5f9',
            flexShrink: 0,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#cbd5e1',
          }}
        >
          <DocumentIcon size={18} />
        </div>
      )}

      {/* Title + meta */}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 600,
            color: 'var(--text-dark)',
            fontFamily: 'var(--font-ui)',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            marginBottom: 4,
          }}
        >
          {post.title}
        </div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
          }}
        >
          <StatusBadge status={post.status} />
          <span
            style={{
              fontSize: 11,
              color: 'var(--text-light)',
              fontFamily: 'var(--font-ui)',
            }}
          >
            {formatDate(post.published_at || post.created_at)}
          </span>
          {post.views > 0 && (
            <span
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 3,
                fontSize: 11,
                color: 'var(--text-light)',
                fontFamily: 'var(--font-ui)',
              }}
            >
              <EyeIcon size={11} />
              {formatViews(post.views)}
            </span>
          )}
        </div>
      </div>

      {/* Arrow */}
      <div style={{ color: '#cbd5e1', flexShrink: 0 }}>
        <ChevronRightIcon />
      </div>
    </div>
  )
}

// ─── SVG Icons ─────────────────────────────────────────────────────────────
function PencilIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function DocumentIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}

function EyeIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function CheckCircleIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

function DraftIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function ChevronRightIcon() {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  )
}
