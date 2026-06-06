import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link, useLocation, Outlet, useParams } from 'react-router-dom'
import { useIsMobile } from '../../hooks/useIsMobile'
import { mockPosts, mockTrafficData, mockActivity } from '../../data/dashboardData'

// ─── Helpers ───────────────────────────────────────────────────────────────
function fmt(n) {
  return typeof n === 'number' ? n.toLocaleString() : n
}

function activityDotColor(type) {
  if (type === 'published') return '#10b981'
  if (type === 'draft') return '#f59e0b'
  if (type === 'added') return '#3b82f6'
  if (type === 'edited') return '#8b5cf6'
  if (type === 'deleted') return '#ef4444'
  return '#9aa3ad'
}

// ─── Status Badge ──────────────────────────────────────────────────────────
function StatusBadge({ status }) {
  const styles = {
    published: {
      background: 'rgba(16,185,129,0.1)',
      color: '#059669',
      border: '1px solid rgba(16,185,129,0.2)',
    },
    draft: {
      background: 'rgba(245,158,11,0.1)',
      color: '#d97706',
      border: '1px solid rgba(245,158,11,0.2)',
    },
    pending: {
      background: 'rgba(59,130,246,0.1)',
      color: '#2563eb',
      border: '1px solid rgba(59,130,246,0.2)',
    },
  }
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
        ...(styles[status] || styles.draft),
      }}
    >
      {status}
    </span>
  )
}

// ─── Stat Card ─────────────────────────────────────────────────────────────
function StatCard({ label, value, sub, iconBg, icon }) {
  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 12,
        border: '1px solid #e2e8f0',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        padding: '20px 24px',
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            color: 'var(--text-mid)',
            letterSpacing: '1px',
            textTransform: 'uppercase',
            fontFamily: 'var(--font-ui)',
            marginBottom: 8,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: 28,
            fontWeight: 800,
            color: 'var(--brand)',
            fontFamily: 'var(--font-ui)',
            lineHeight: 1,
            marginBottom: 6,
          }}
        >
          {value}
        </div>
        <div
          style={{
            fontSize: 11,
            color: 'var(--text-light)',
            fontFamily: 'var(--font-ui)',
          }}
        >
          {sub}
        </div>
      </div>
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          background: iconBg,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {icon}
      </div>
    </div>
  )
}

// ─── Publisher Dashboard ───────────────────────────────────────────────────
export default function PublisherDashboard() {
  const isMobile = useIsMobile()
  const navigate = useNavigate()
  const [auth, setAuth] = useState(null)

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('ttd_auth') || 'null')
    if (stored) setAuth(stored)
  }, [])

  // Filter posts to only those by this publisher (by email match on author field or all if not matched)
  const myPosts = auth
    ? mockPosts.filter((p) => p.author === auth.name)
    : mockPosts

  const publishedCount = myPosts.filter((p) => p.status === 'published').length
  const draftCount = myPosts.filter((p) => p.status === 'draft').length
  const totalViews = myPosts.reduce((acc, p) => acc + (p.views || 0), 0)

  // My activity — filter by author name
  const myActivity = auth
    ? mockActivity.filter((a) => a.author === auth.name).slice(0, 5)
    : mockActivity.slice(0, 5)

  const recentPosts = myPosts.slice(0, 5)

  return (
    <div style={{ fontFamily: 'var(--font-ui)' }}>
      {/* Page title + greeting */}
      <div style={{ marginBottom: 24 }}>
        <h1
          style={{
            margin: '0 0 4px',
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--text-dark)',
            fontFamily: 'var(--font-ui)',
          }}
        >
          Overview
        </h1>
        <p
          style={{
            margin: 0,
            fontSize: 13,
            color: 'var(--text-mid)',
            fontFamily: 'var(--font-ui)',
          }}
        >
          Welcome back{auth?.name ? `, ${auth.name.split(' ')[0]}` : ''}. Here is your content summary.
        </p>
      </div>

      {/* ── ROW 1: Stat Cards ─────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: 16,
          marginBottom: 24,
        }}
      >
        <StatCard
          label="My Posts"
          value={myPosts.length}
          sub="Total written"
          iconBg="rgba(228,61,48,0.1)"
          icon={<DocumentIcon color="#e43d30" />}
        />
        <StatCard
          label="Published"
          value={publishedCount}
          sub="Live on site"
          iconBg="rgba(16,185,129,0.1)"
          icon={<CheckIcon color="#059669" />}
        />
        <StatCard
          label="Drafts"
          value={draftCount}
          sub="In progress"
          iconBg="rgba(245,158,11,0.1)"
          icon={<PencilIcon color="#d97706" />}
        />
        <StatCard
          label="Total Views"
          value={fmt(totalViews)}
          sub="Across all my posts"
          iconBg="rgba(59,130,246,0.1)"
          icon={<EyeIcon color="#3b82f6" />}
        />
      </div>

      {/* ── ROW 2: Quick actions banner ───────────────────────────────── */}
      <div
        style={{
          background: 'linear-gradient(135deg, var(--brand) 0%, #c0392b 100%)',
          borderRadius: 12,
          padding: '20px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 24,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
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
            Ready to write something new?
          </div>
          <div
            style={{
              fontSize: 12,
              color: 'rgba(255,255,255,0.75)',
              fontFamily: 'var(--font-ui)',
            }}
          >
            Start a new post and share your Dubai expertise with readers.
          </div>
        </div>
        <Link
          to="/dashboard/compose"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            background: '#fff',
            color: 'var(--brand)',
            borderRadius: 8,
            padding: '10px 20px',
            fontFamily: 'var(--font-ui)',
            fontWeight: 700,
            fontSize: 13,
            textDecoration: 'none',
            whiteSpace: 'nowrap',
          }}
        >
          <PencilIcon color="var(--brand)" size={16} />
          New Post
        </Link>
      </div>

      {/* ── ROW 3: Recent Posts + Activity ────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: 16,
        }}
      >
        {/* Recent Posts */}
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            padding: '20px 24px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 12,
            }}
          >
            <div
              style={{
                fontSize: 14,
                fontWeight: 700,
                color: 'var(--text-dark)',
                fontFamily: 'var(--font-ui)',
              }}
            >
              My Recent Posts
            </div>
            <Link
              to="/dashboard/posts"
              style={{
                fontSize: 11,
                color: 'var(--brand)',
                fontFamily: 'var(--font-ui)',
                fontWeight: 600,
                textDecoration: 'none',
              }}
            >
              View all
            </Link>
          </div>

          {recentPosts.length === 0 ? (
            <div
              style={{
                padding: '24px 0',
                textAlign: 'center',
                color: 'var(--text-light)',
                fontFamily: 'var(--font-ui)',
                fontSize: 12,
              }}
            >
              No posts yet. Start writing!
            </div>
          ) : (
            recentPosts.map((post, idx) => (
              <div
                key={post.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '12px 0',
                  borderBottom: idx < recentPosts.length - 1 ? '1px solid #f1f5f9' : 'none',
                }}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--text-dark)',
                      fontFamily: 'var(--font-ui)',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      marginBottom: 4,
                    }}
                    title={post.title}
                  >
                    {post.title}
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <StatusBadge status={post.status} />
                    <span
                      style={{
                        fontSize: 10,
                        color: 'var(--text-light)',
                        fontFamily: 'var(--font-ui)',
                      }}
                    >
                      {post.date}
                    </span>
                    {post.views > 0 && (
                      <span
                        style={{
                          fontSize: 10,
                          color: 'var(--text-mid)',
                          fontFamily: 'var(--font-ui)',
                        }}
                      >
                        {fmt(post.views)} views
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Recent Activity */}
        <div
          style={{
            background: '#fff',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
            padding: '20px 24px',
          }}
        >
          <div
            style={{
              fontSize: 14,
              fontWeight: 700,
              color: 'var(--text-dark)',
              fontFamily: 'var(--font-ui)',
              marginBottom: 16,
            }}
          >
            My Activity
          </div>
          {myActivity.length === 0 ? (
            <div
              style={{
                padding: '24px 0',
                textAlign: 'center',
                color: 'var(--text-light)',
                fontFamily: 'var(--font-ui)',
                fontSize: 12,
              }}
            >
              No recent activity.
            </div>
          ) : (
            myActivity.map((item, idx) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: '10px 0',
                  borderBottom: idx < myActivity.length - 1 ? '1px solid #f1f5f9' : 'none',
                  alignItems: 'flex-start',
                }}
              >
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: activityDotColor(item.type),
                    flexShrink: 0,
                    marginTop: 5,
                  }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    style={{
                      fontSize: 12,
                      color: 'var(--text-dark)',
                      fontFamily: 'var(--font-ui)',
                      fontWeight: 500,
                      lineHeight: 1.4,
                    }}
                  >
                    {item.message}
                  </div>
                  <div style={{ marginTop: 3 }}>
                    <span
                      style={{
                        fontSize: 10,
                        color: 'var(--text-light)',
                        fontFamily: 'var(--font-ui)',
                      }}
                    >
                      {item.time}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// ─── SVG Icon Components ───────────────────────────────────────────────────

function DocumentIcon({ color = 'currentColor' }) {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}

function CheckIcon({ color = 'currentColor' }) {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

function PencilIcon({ color = 'currentColor', size = 20 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function EyeIcon({ color = 'currentColor' }) {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}
