import { useState, useEffect } from 'react'
import { useIsMobile } from '../../hooks/useIsMobile'
import {
  getDashboardStats, getDailyViews, getTotalArticleViews,
  getActivityLog, dashArticleCounts,
} from '../../lib/supabase'

// ─── Helpers ───────────────────────────────────────────────────────────────
function fmt(n) {
  return typeof n === 'number' ? n.toLocaleString() : n
}

function activityDotColor(type) {
  if (type === 'article_published') return '#10b981'
  if (type === 'article_updated') return '#8b5cf6'
  if (type === 'article_deleted') return '#ef4444'
  if (type === 'user_created') return '#3b82f6'
  if (type === 'advertiser_created' || type === 'advertiser_updated') return '#f59e0b'
  return '#9aa3ad'
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins} min ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? 's' : ''} ago`
  const days = Math.floor(hrs / 24)
  if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const SOURCE_COLORS = { Organic: '#10b981', Social: '#3b82f6', Direct: '#f59e0b', Referral: '#8b5cf6' }

// ─── SVG Line Chart ────────────────────────────────────────────────────────
function WeeklyTrafficChart({ data, labels }) {
  const W = 700
  const H = 200
  const PAD = { top: 16, right: 16, bottom: 36, left: 48 }
  const chartW = W - PAD.left - PAD.right
  const chartH = H - PAD.top - PAD.bottom

  const maxVal = Math.max(...data, 1)
  const minVal = 0

  function xPos(i) {
    return PAD.left + (i / (data.length - 1)) * chartW
  }
  function yPos(v) {
    return PAD.top + chartH - ((v - minVal) / (maxVal - minVal)) * chartH
  }

  const linePath = data.map((v, i) => `${i === 0 ? 'M' : 'L'} ${xPos(i)} ${yPos(v)}`).join(' ')
  const areaPath =
    `M ${xPos(0)} ${PAD.top + chartH} ` +
    data.map((v, i) => `L ${xPos(i)} ${yPos(v)}`).join(' ') +
    ` L ${xPos(data.length - 1)} ${PAD.top + chartH} Z`

  const gridLines = 5
  const yStep = maxVal / gridLines

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      style={{ width: '100%', height: 'auto', display: 'block', overflow: 'visible' }}
      aria-label="Weekly traffic chart"
    >
      <defs>
        <linearGradient id="ttd-area-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--brand)" stopOpacity="0.18" />
          <stop offset="100%" stopColor="var(--brand)" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Grid lines + Y labels */}
      {Array.from({ length: gridLines + 1 }).map((_, i) => {
        const val = Math.round(yStep * (gridLines - i))
        const y = PAD.top + (i / gridLines) * chartH
        return (
          <g key={i}>
            <line
              x1={PAD.left}
              y1={y}
              x2={PAD.left + chartW}
              y2={y}
              stroke="rgba(0,0,0,0.06)"
              strokeWidth={1}
            />
            <text
              x={PAD.left - 8}
              y={y + 4}
              textAnchor="end"
              fill="#9aa3ad"
              fontSize={10}
              fontFamily="var(--font-ui)"
            >
              {val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}
            </text>
          </g>
        )
      })}

      {/* Area fill */}
      <path d={areaPath} fill="url(#ttd-area-grad)" />

      {/* Line */}
      <path
        d={linePath}
        fill="none"
        stroke="var(--brand)"
        strokeWidth={2.5}
        strokeLinejoin="round"
        strokeLinecap="round"
      />

      {/* Dots */}
      {data.map((v, i) => (
        <circle
          key={i}
          cx={xPos(i)}
          cy={yPos(v)}
          r={4}
          fill="#fff"
          stroke="var(--brand)"
          strokeWidth={2}
        />
      ))}

      {/* X labels */}
      {labels.map((label, i) => (
        <text
          key={i}
          x={xPos(i)}
          y={H - 8}
          textAnchor="middle"
          fill="#9aa3ad"
          fontSize={10}
          fontFamily="var(--font-ui)"
        >
          {label}
        </text>
      ))}
    </svg>
  )
}

// ─── Traffic Sources Bar List ──────────────────────────────────────────────
function TrafficSources({ sources }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {sources.map((src) => (
        <div key={src.label}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: 6,
              fontFamily: 'var(--font-ui)',
            }}
          >
            <span style={{ fontSize: 12, color: 'var(--text-dark)', fontWeight: 500 }}>
              {src.label}
            </span>
            <span style={{ fontSize: 12, color: 'var(--text-mid)', fontWeight: 600 }}>
              {src.pct}%
            </span>
          </div>
          <div
            style={{
              height: 6,
              borderRadius: 3,
              background: '#f1f5f9',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${src.pct}%`,
                borderRadius: 3,
                background: src.color,
                transition: 'width 0.8s ease',
              }}
            />
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Admin Dashboard ───────────────────────────────────────────────────────
export default function AdminDashboard() {
  const isMobile = useIsMobile()

  const [stats, setStats] = useState(null)
  const [counts, setCounts] = useState({ all: 0, published: 0, draft: 0, pending: 0 })
  const [totalViews, setTotalViews] = useState(0)
  const [daily, setDaily] = useState({ days: [], sources: [] })
  const [activity, setActivity] = useState([])

  useEffect(() => {
    getDashboardStats().then(({ data }) => { if (data) setStats(data) })
    dashArticleCounts().then(setCounts)
    getTotalArticleViews().then(({ data }) => setTotalViews(data))
    getDailyViews(7).then(({ data }) => { if (data) setDaily(data) })
    getActivityLog({ limit: 5 }).then(({ data }) => setActivity(data || []))
  }, [])

  const weeklyViews = daily.days.map(d => d.views)
  const weekLabels = daily.days.map(d => d.label)
  const weekTotal = weeklyViews.reduce((a, b) => a + b, 0)
  const sources = daily.sources.map(s => ({ ...s, color: SOURCE_COLORS[s.label] || '#9aa3ad' }))
  const topPosts = stats?.top_articles || []

  const today = new Date()
  const weekStart = new Date(today)
  weekStart.setDate(today.getDate() - 6)
  const dateRange = `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} – ${today.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`

  return (
    <div style={{ fontFamily: 'var(--font-ui)' }}>
      {/* Page title */}
      <h1
        style={{
          margin: '0 0 24px',
          fontSize: 22,
          fontWeight: 700,
          color: 'var(--text-dark)',
          fontFamily: 'var(--font-ui)',
        }}
      >
        Dashboard
      </h1>

      {/* ── ROW 1: Stat Cards ─────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: 16,
          marginBottom: 24,
        }}
      >
        {/* Total Views */}
        <StatCard
          label="Total Views"
          value={fmt(totalViews)}
          sub="All time"
          iconBg="rgba(228,61,48,0.1)"
          icon={<TrendUpIcon color="#e43d30" />}
        />
        {/* Last 30 Days */}
        <StatCard
          label="Last 30 Days"
          value={fmt(stats?.total_views_30d ?? 0)}
          sub={
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 3,
                background: 'rgba(16,185,129,0.1)',
                color: '#059669',
                borderRadius: 20,
                padding: '1px 8px',
                fontSize: 10,
                fontWeight: 600,
              }}
            >
              article views
            </span>
          }
          iconBg="rgba(16,185,129,0.1)"
          icon={<CalendarIcon color="#059669" />}
        />
        {/* Publishers */}
        <StatCard
          label="Publishers"
          value={fmt(stats?.total_publishers ?? 0)}
          sub={`${fmt(stats?.total_subscribers ?? 0)} newsletter subscribers`}
          iconBg="rgba(59,130,246,0.1)"
          icon={<UsersIcon color="#3b82f6" />}
        />
        {/* Total Posts */}
        <StatCard
          label="Total Posts"
          value={fmt(counts.all)}
          sub={`${counts.published} Published · ${counts.draft + counts.pending} Drafts`}
          iconBg="rgba(139,92,246,0.1)"
          icon={<DocumentIcon color="#8b5cf6" />}
        />
      </div>

      {/* ── ROW 2: Charts ─────────────────────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '65fr 35fr',
          gap: 16,
          marginBottom: 24,
        }}
      >
        {/* Weekly Traffic Chart */}
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
              alignItems: 'flex-start',
              marginBottom: 16,
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <div>
              <div
                style={{
                  fontSize: 14,
                  fontWeight: 700,
                  color: 'var(--text-dark)',
                  fontFamily: 'var(--font-ui)',
                }}
              >
                Weekly Traffic
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: 'var(--text-light)',
                  fontFamily: 'var(--font-ui)',
                  marginTop: 2,
                }}
              >
                {dateRange}
              </div>
            </div>
            <div
              style={{
                fontSize: 11,
                color: 'var(--text-mid)',
                fontFamily: 'var(--font-ui)',
                textAlign: 'right',
              }}
            >
              <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--brand)' }}>
                {fmt(weekTotal)}
              </span>
              <span style={{ marginLeft: 4 }}>total views</span>
            </div>
          </div>
          {weeklyViews.length > 1 ? (
            <WeeklyTrafficChart data={weeklyViews} labels={weekLabels} />
          ) : (
            <div style={{ padding: '40px 0', textAlign: 'center', fontSize: 12, color: 'var(--text-light)', fontFamily: 'var(--font-ui)' }}>
              Loading traffic…
            </div>
          )}
        </div>

        {/* Traffic Sources */}
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
              marginBottom: 20,
            }}
          >
            Traffic Sources
          </div>
          <TrafficSources sources={sources} />
          <div
            style={{
              marginTop: 20,
              paddingTop: 16,
              borderTop: '1px solid #f1f5f9',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            {sources.map((src) => (
              <div
                key={src.label}
                style={{ display: 'flex', alignItems: 'center', gap: 8 }}
              >
                <span
                  style={{
                    display: 'inline-block',
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: src.color,
                    flexShrink: 0,
                  }}
                />
                <span
                  style={{
                    fontSize: 11,
                    color: 'var(--text-mid)',
                    fontFamily: 'var(--font-ui)',
                    flex: 1,
                  }}
                >
                  {src.label}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: 'var(--text-dark)',
                    fontFamily: 'var(--font-ui)',
                  }}
                >
                  {src.pct}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── ROW 3: Activity + Top Posts ───────────────────────────────── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
          gap: 16,
        }}
      >
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
            Recent Activity
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {activity.length === 0 && (
              <div style={{ padding: '20px 0', fontSize: 12, color: 'var(--text-light)', fontFamily: 'var(--font-ui)' }}>
                No activity yet — publish, edit or manage content and it will show up here.
              </div>
            )}
            {activity.map((item, idx) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: '10px 0',
                  borderBottom: idx < activity.length - 1 ? '1px solid #f1f5f9' : 'none',
                  alignItems: 'flex-start',
                }}
              >
                {/* Dot */}
                <div
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    background: activityDotColor(item.action_type),
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
                  <div
                    style={{
                      display: 'flex',
                      gap: 8,
                      marginTop: 3,
                      alignItems: 'center',
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11,
                        color: 'var(--text-mid)',
                        fontFamily: 'var(--font-ui)',
                        fontWeight: 600,
                      }}
                    >
                      {item.user?.name || 'System'}
                    </span>
                    <span
                      style={{
                        fontSize: 10,
                        color: 'var(--text-light)',
                        fontFamily: 'var(--font-ui)',
                      }}
                    >
                      {timeAgo(item.created_at)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Posts */}
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
              marginBottom: 0,
            }}
          >
            Top Posts
          </div>

          {/* Table header */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 80px 60px',
              fontFamily: 'var(--font-ui)',
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--text-light)',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              padding: '10px 0',
              borderBottom: '1px solid #e2e8f0',
              marginTop: 12,
            }}
          >
            <span>Title</span>
            <span style={{ textAlign: 'right' }}>Views</span>
            <span style={{ textAlign: 'right' }}>Comments</span>
          </div>

          {/* Table rows */}
          {topPosts.length === 0 && (
            <div style={{ padding: '20px 0', fontSize: 12, color: 'var(--text-light)', fontFamily: 'var(--font-ui)' }}>
              No published posts yet.
            </div>
          )}
          {topPosts.map((post, idx) => (
            <div
              key={post.id || idx}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 80px 60px',
                padding: '12px 0',
                borderBottom: idx < topPosts.length - 1 ? '1px solid #f1f5f9' : 'none',
                alignItems: 'center',
                verticalAlign: 'middle',
              }}
            >
              <a
                href={`/article/${post.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 12,
                  color: 'var(--text-dark)',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 500,
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  whiteSpace: 'nowrap',
                  paddingRight: 8,
                  textDecoration: 'none',
                }}
                title={post.title}
              >
                {post.title}
              </a>
              <span
                style={{
                  fontSize: 12,
                  color: 'var(--text-dark)',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 600,
                  textAlign: 'right',
                }}
              >
                {fmt(post.views || 0)}
              </span>
              <span
                style={{
                  fontSize: 11,
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 700,
                  textAlign: 'right',
                  color: '#059669',
                }}
              >
                {fmt(post.comments_count || 0)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
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

// ─── SVG Icon Components ───────────────────────────────────────────────────

function TrendUpIcon({ color = 'currentColor' }) {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
      <polyline points="17 6 23 6 23 12" />
    </svg>
  )
}

function CalendarIcon({ color = 'currentColor' }) {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  )
}

function UsersIcon({ color = 'currentColor' }) {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  )
}

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
