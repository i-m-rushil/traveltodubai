import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link, useLocation } from 'react-router-dom'
import { mockPosts, mockPublishers } from '../../data/dashboardData'

const AVATAR_COLORS = [
  '#e43d30', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
]

function getPublisherColor(authorId) {
  return AVATAR_COLORS[(authorId - 1) % AVATAR_COLORS.length]
}

function getInitials(name) {
  return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function formatViews(n) {
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, '') + 'k'
  return n.toString()
}

const STATUS_OPTIONS = ['published', 'draft', 'pending']

function StatusBadge({ status }) {
  const styles = {
    published: {
      background: 'rgba(16,185,129,0.1)', color: '#059669',
      border: '1px solid rgba(16,185,129,0.2)',
    },
    draft: {
      background: 'rgba(245,158,11,0.1)', color: '#d97706',
      border: '1px solid rgba(245,158,11,0.2)',
    },
    pending: {
      background: 'rgba(59,130,246,0.1)', color: '#2563eb',
      border: '1px solid rgba(59,130,246,0.2)',
    },
  }
  const s = styles[status] || styles.draft
  const labels = { published: 'Published', draft: 'Draft', pending: 'Pending Review' }
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 10px', borderRadius: 20,
      fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600,
      ...s,
    }}>
      <span style={{ width: 5, height: 5, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
      {labels[status] || status}
    </span>
  )
}

function CategoryBadge({ category }) {
  return (
    <span style={{
      background: 'rgba(59,130,246,0.08)', color: '#2563eb',
      border: '1px solid rgba(59,130,246,0.15)',
      borderRadius: 20, padding: '2px 10px',
      fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-ui)',
      whiteSpace: 'nowrap',
    }}>
      {category}
    </span>
  )
}

export default function AdminPosts() {
  const [posts, setPosts] = useState(mockPosts)
  const [filter, setFilter] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')
  const [openStatusMenu, setOpenStatusMenu] = useState(null)
  const [hoveredRow, setHoveredRow] = useState(null)
  const [hoveredBtn, setHoveredBtn] = useState(null)
  const [hoveredTab, setHoveredTab] = useState(null)
  const menuRef = useRef(null)

  // Close status dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpenStatusMenu(null)
      }
    }
    if (openStatusMenu !== null) {
      document.addEventListener('mousedown', handleClick)
    }
    return () => document.removeEventListener('mousedown', handleClick)
  }, [openStatusMenu])

  function handleStatusChange(postId, newStatus) {
    setPosts(prev => prev.map(p => p.id === postId ? { ...p, status: newStatus } : p))
    setOpenStatusMenu(null)
  }

  function handleDelete(postId) {
    if (window.confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
      setPosts(prev => prev.filter(p => p.id !== postId))
    }
  }

  const filtered = posts.filter(p => {
    const matchFilter = filter === 'all' || p.status === filter
    const s = searchTerm.toLowerCase()
    const matchSearch = !s || p.title.toLowerCase().includes(s) || p.author.toLowerCase().includes(s)
    return matchFilter && matchSearch
  })

  const counts = {
    all: posts.length,
    published: posts.filter(p => p.status === 'published').length,
    draft: posts.filter(p => p.status === 'draft' || p.status === 'pending').length,
  }

  const tabs = [
    { key: 'all', label: 'All', count: counts.all },
    { key: 'published', label: 'Published', count: counts.published },
    { key: 'draft', label: 'Drafts', count: counts.draft },
  ]

  const tabActiveStyle = {
    background: 'var(--brand)', color: '#fff',
    border: '1px solid var(--brand)',
    borderRadius: 8, padding: '7px 16px',
    fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 13,
    cursor: 'pointer',
  }
  const tabInactiveStyle = {
    background: '#fff', color: 'var(--text-mid)',
    border: '1px solid #e2e8f0',
    borderRadius: 8, padding: '7px 16px',
    fontFamily: 'var(--font-ui)', fontWeight: 500, fontSize: 13,
    cursor: 'pointer',
  }

  return (
    <div style={{ fontFamily: 'var(--font-ui)', padding: '28px 32px', minHeight: '100vh', background: '#f1f5f9' }}>

      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--text-dark)', fontFamily: 'var(--font-ui)' }}>
            All Posts
          </h1>
          <span style={{
            background: 'rgba(228,61,48,0.1)', color: 'var(--brand)',
            border: '1px solid rgba(228,61,48,0.2)',
            borderRadius: 20, padding: '2px 12px',
            fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-ui)',
          }}>
            {posts.length} posts
          </span>
        </div>

        {/* Filter Tabs */}
        <div style={{ display: 'flex', gap: 8 }}>
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              onMouseEnter={() => setHoveredTab(tab.key)}
              onMouseLeave={() => setHoveredTab(null)}
              style={{
                ...(filter === tab.key ? tabActiveStyle : {
                  ...tabInactiveStyle,
                  background: hoveredTab === tab.key ? '#f8fafc' : '#fff',
                }),
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {tab.label}
              <span style={{
                background: filter === tab.key ? 'rgba(255,255,255,0.25)' : '#f1f5f9',
                color: filter === tab.key ? '#fff' : 'var(--text-mid)',
                borderRadius: 10, padding: '1px 7px', fontSize: 11, fontWeight: 700,
              }}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10,
        display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px',
        marginBottom: 20, maxWidth: 400,
      }}>
        <SearchIcon color="var(--text-light)" />
        <input
          type="text"
          placeholder="Search by title or author..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{
            border: 'none', outline: 'none', padding: '11px 0',
            fontFamily: 'var(--font-ui)', fontSize: 14,
            color: 'var(--text-dark)', background: 'transparent', width: '100%',
          }}
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
          >
            <XSmallIcon color="var(--text-light)" />
          </button>
        )}
      </div>

      {/* Table Card */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>

        {filtered.length === 0 ? (
          /* Empty State */
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px' }}>
            <div style={{ color: '#cbd5e1', marginBottom: 16 }}>
              <EmptySearchIcon />
            </div>
            <p style={{ margin: '0 0 6px', fontFamily: 'var(--font-ui)', fontSize: 16, fontWeight: 600, color: 'var(--text-dark)' }}>
              No posts found
            </p>
            <p style={{ margin: 0, fontFamily: 'var(--font-ui)', fontSize: 14, color: 'var(--text-light)' }}>
              {searchTerm ? `No posts match "${searchTerm}"` : 'No posts in this category yet.'}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 860 }}>
              <thead>
                <tr>
                  {['Post', 'Author', 'Category', 'Status', 'Date', 'Views', 'Actions'].map(col => (
                    <th key={col} style={{
                      fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700,
                      color: 'var(--text-light)', letterSpacing: '1px', textTransform: 'uppercase',
                      padding: '10px 16px', borderBottom: '1px solid #e2e8f0',
                      background: '#f8fafc', textAlign: col === 'Views' ? 'center' : 'left',
                      whiteSpace: 'nowrap',
                    }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(post => (
                  <tr
                    key={post.id}
                    onMouseEnter={() => setHoveredRow(post.id)}
                    onMouseLeave={() => setHoveredRow(null)}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      verticalAlign: 'middle',
                      background: hoveredRow === post.id ? '#f8fafc' : '#fff',
                      transition: 'background 0.1s',
                    }}
                  >
                    {/* Post column */}
                    <td style={{ padding: '14px 16px', maxWidth: 320 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <img
                          src={post.image}
                          alt={post.title}
                          style={{
                            width: 48, height: 48, borderRadius: 8,
                            objectFit: 'cover', flexShrink: 0,
                            border: '1px solid #e2e8f0',
                          }}
                          onError={e => { e.target.style.background = '#f1f5f9'; e.target.src = '' }}
                        />
                        <div style={{ minWidth: 0 }}>
                          <div style={{
                            fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 14,
                            color: 'var(--text-dark)', whiteSpace: 'nowrap',
                            overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 240,
                          }}>
                            {post.title}
                          </div>
                          <div style={{
                            fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-light)',
                            marginTop: 3, whiteSpace: 'nowrap', overflow: 'hidden',
                            textOverflow: 'ellipsis', maxWidth: 240,
                          }}>
                            {post.excerpt.slice(0, 80)}{post.excerpt.length > 80 ? '...' : ''}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Author */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          width: 28, height: 28, borderRadius: '50%',
                          background: getPublisherColor(post.authorId),
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontWeight: 700, fontSize: 10,
                          fontFamily: 'var(--font-ui)', flexShrink: 0,
                        }}>
                          {getInitials(post.author)}
                        </div>
                        <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-mid)', fontWeight: 500 }}>
                          {post.author}
                        </span>
                      </div>
                    </td>

                    {/* Category */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <CategoryBadge category={post.category} />
                    </td>

                    {/* Status */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <StatusBadge status={post.status} />
                    </td>

                    {/* Date */}
                    <td style={{ padding: '14px 16px', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-mid)', whiteSpace: 'nowrap' }}>
                      {formatDate(post.date)}
                    </td>

                    {/* Views */}
                    <td style={{ padding: '14px 16px', textAlign: 'center', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 5 }}>
                        <EyeIcon color="var(--text-light)" />
                        <span style={{ fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: 600, color: 'var(--text-dark)' }}>
                          {formatViews(post.views)}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, position: 'relative' }}>

                        {/* Status Toggle Dropdown */}
                        <div style={{ position: 'relative' }} ref={openStatusMenu === post.id ? menuRef : null}>
                          <button
                            onClick={() => setOpenStatusMenu(prev => prev === post.id ? null : post.id)}
                            onMouseEnter={() => setHoveredBtn(`status-${post.id}`)}
                            onMouseLeave={() => setHoveredBtn(null)}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 5,
                              background: hoveredBtn === `status-${post.id}` ? '#f1f5f9' : '#fff',
                              border: '1px solid #e2e8f0', borderRadius: 7,
                              padding: '5px 10px', cursor: 'pointer',
                              fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600,
                              color: 'var(--text-mid)',
                              transition: 'background 0.1s',
                            }}
                          >
                            Status <ChevronDownIcon />
                          </button>

                          {openStatusMenu === post.id && (
                            <div style={{
                              position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 100,
                              background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10,
                              boxShadow: '0 8px 24px rgba(0,0,0,0.12)', minWidth: 160, overflow: 'hidden',
                            }}>
                              {STATUS_OPTIONS.map(opt => (
                                <button
                                  key={opt}
                                  onClick={() => handleStatusChange(post.id, opt)}
                                  style={{
                                    display: 'flex', alignItems: 'center', gap: 10,
                                    width: '100%', padding: '10px 14px',
                                    background: post.status === opt ? '#f8fafc' : 'transparent',
                                    border: 'none', cursor: 'pointer',
                                    fontFamily: 'var(--font-ui)', fontSize: 13, fontWeight: post.status === opt ? 600 : 400,
                                    color: post.status === opt ? 'var(--text-dark)' : 'var(--text-mid)',
                                    textAlign: 'left',
                                  }}
                                >
                                  {post.status === opt && (
                                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand)', display: 'inline-block' }} />
                                  )}
                                  {!post.status === opt && <span style={{ width: 6 }} />}
                                  {opt === 'published' ? 'Published' : opt === 'draft' ? 'Draft' : 'Pending Review'}
                                </button>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Delete */}
                        <button
                          title="Delete post"
                          onClick={() => handleDelete(post.id)}
                          onMouseEnter={() => setHoveredBtn(`del-${post.id}`)}
                          onMouseLeave={() => setHoveredBtn(null)}
                          style={{
                            width: 32, height: 32, borderRadius: 7,
                            background: hoveredBtn === `del-${post.id}` ? 'rgba(239,68,68,0.18)' : 'rgba(239,68,68,0.1)',
                            color: '#dc2626',
                            border: '1px solid rgba(239,68,68,0.15)',
                            cursor: 'pointer', display: 'inline-flex',
                            alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                          }}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

/* ── Icon Components ─────────────────────────────────────────────────────── */

function EyeIcon({ color = 'currentColor' }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function TrashIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

function SearchIcon({ color = 'currentColor' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function XSmallIcon({ color = 'currentColor' }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}

function EmptySearchIcon() {
  return (
    <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
      <line x1="8" y1="11" x2="14" y2="11" />
    </svg>
  )
}
