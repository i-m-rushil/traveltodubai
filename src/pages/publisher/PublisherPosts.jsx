import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useIsMobile } from '../../hooks/useIsMobile'
import { mockPosts } from '../../data/dashboardData'

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
    published: { bg: 'rgba(16,185,129,0.1)', color: '#059669', border: '1px solid rgba(16,185,129,0.2)', label: 'Published' },
    draft: { bg: 'rgba(245,158,11,0.1)', color: '#d97706', border: '1px solid rgba(245,158,11,0.2)', label: 'Draft' },
    pending: { bg: 'rgba(59,130,246,0.1)', color: '#2563eb', border: '1px solid rgba(59,130,246,0.2)', label: 'Pending' },
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
        whiteSpace: 'nowrap',
      }}
    >
      {s.label}
    </span>
  )
}

// ─── Toast ─────────────────────────────────────────────────────────────────
function Toast({ message, onDone }) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000)
    return () => clearTimeout(t)
  }, [onDone])

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 28,
        right: 28,
        zIndex: 9999,
        background: '#059669',
        color: '#fff',
        fontFamily: 'var(--font-ui)',
        fontSize: 13,
        fontWeight: 600,
        padding: '12px 20px',
        borderRadius: 10,
        boxShadow: '0 4px 20px rgba(0,0,0,0.18)',
        display: 'flex',
        alignItems: 'center',
        gap: 8,
      }}
    >
      <CheckIcon size={16} />
      {message}
    </div>
  )
}

// ─── View Toggle Button ────────────────────────────────────────────────────
function ViewToggleBtn({ active, onClick, title, children }) {
  return (
    <button
      onClick={onClick}
      title={title}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 38,
        height: 38,
        background: active ? 'var(--brand)' : 'transparent',
        color: active ? '#fff' : 'var(--text-mid)',
        border: 'none',
        cursor: 'pointer',
        transition: 'all 0.12s',
      }}
    >
      {children}
    </button>
  )
}

// ─── Empty State ───────────────────────────────────────────────────────────
function EmptyState() {
  const navigate = useNavigate()
  return (
    <div
      style={{
        padding: '60px 24px',
        textAlign: 'center',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 12,
      }}
    >
      <div style={{ color: '#cbd5e1' }}>
        <DocumentIcon size={48} />
      </div>
      <h3
        style={{
          margin: 0,
          fontSize: 17,
          fontWeight: 700,
          color: 'var(--text-dark)',
          fontFamily: 'var(--font-ui)',
        }}
      >
        No posts found
      </h3>
      <p
        style={{
          margin: 0,
          fontSize: 13,
          color: 'var(--text-light)',
          fontFamily: 'var(--font-ui)',
          maxWidth: 320,
          lineHeight: 1.5,
        }}
      >
        No posts match your current filters. Adjust your search or filter, or write your first article.
      </p>
      <button
        onClick={() => navigate('/dashboard/compose')}
        style={{
          marginTop: 8,
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          background: 'var(--brand)',
          color: '#fff',
          borderRadius: 8,
          padding: '10px 20px',
          fontFamily: 'var(--font-ui)',
          fontWeight: 600,
          fontSize: 13,
          border: 'none',
          cursor: 'pointer',
          minHeight: 44,
        }}
      >
        <PlusIcon size={16} />
        Write your first post
      </button>
    </div>
  )
}

// ─── Table View ────────────────────────────────────────────────────────────
function TableView({ posts, confirmDelete, setConfirmDelete, onDelete, isMobile }) {
  const navigate = useNavigate()
  const [hoveredRow, setHoveredRow] = useState(null)

  return (
    <div style={{ overflowX: 'auto' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            {['', 'Post', 'Category', 'Status', 'Date', 'Views', 'Actions'].map((col) => (
              <th
                key={col}
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--text-light)',
                  letterSpacing: '1px',
                  textTransform: 'uppercase',
                  padding: '10px 16px',
                  borderBottom: '1px solid #e2e8f0',
                  background: '#f8fafc',
                  textAlign: 'left',
                  whiteSpace: 'nowrap',
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {posts.map((post) => (
            <TableRow
              key={post.id}
              post={post}
              confirmDelete={confirmDelete}
              setConfirmDelete={setConfirmDelete}
              onDelete={onDelete}
              isMobile={isMobile}
              navigate={navigate}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function TableRow({ post, confirmDelete, setConfirmDelete, onDelete, isMobile, navigate }) {
  const [hovered, setHovered] = useState(false)

  return (
    <>
      <tr
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{ background: hovered ? '#f8fafc' : '#fff', transition: 'background 0.1s' }}
      >
        {/* Checkbox */}
        <td style={{ padding: '14px 16px', verticalAlign: 'middle', width: 36, borderBottom: '1px solid #f1f5f9' }}>
          <input
            type="checkbox"
            style={{ accentColor: 'var(--brand)', cursor: 'pointer' }}
            onClick={(e) => e.stopPropagation()}
          />
        </td>

        {/* Thumbnail + Title + Excerpt */}
        <td
          style={{ padding: '14px 16px', verticalAlign: 'middle', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
          onClick={() => navigate(`/dashboard/compose/${post.id}`)}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: isMobile ? 180 : 260 }}>
            {post.image ? (
              <img
                src={post.image}
                alt={post.title}
                style={{ width: 60, height: 44, objectFit: 'cover', borderRadius: 8, flexShrink: 0 }}
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
            <div style={{ minWidth: 0 }}>
              <div
                style={{
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--text-dark)',
                  fontFamily: 'var(--font-ui)',
                  marginBottom: 3,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: isMobile ? 160 : 280,
                }}
              >
                {post.title}
              </div>
              {!isMobile && (
                <div
                  style={{
                    fontSize: 11,
                    color: 'var(--text-light)',
                    fontFamily: 'var(--font-ui)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    maxWidth: 280,
                  }}
                >
                  {(post.excerpt || '').slice(0, 72)}...
                </div>
              )}
            </div>
          </div>
        </td>

        {/* Category */}
        <td
          style={{ padding: '14px 16px', verticalAlign: 'middle', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap', cursor: 'pointer' }}
          onClick={() => navigate(`/dashboard/compose/${post.id}`)}
        >
          <span
            style={{
              fontSize: 12,
              color: 'var(--text-mid)',
              fontFamily: 'var(--font-ui)',
              background: '#f1f5f9',
              padding: '3px 9px',
              borderRadius: 20,
            }}
          >
            {post.category}
          </span>
        </td>

        {/* Status */}
        <td
          style={{ padding: '14px 16px', verticalAlign: 'middle', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}
          onClick={() => navigate(`/dashboard/compose/${post.id}`)}
        >
          <StatusBadge status={post.status} />
        </td>

        {/* Date */}
        <td
          style={{
            padding: '14px 16px',
            verticalAlign: 'middle',
            borderBottom: '1px solid #f1f5f9',
            fontSize: 12,
            color: 'var(--text-mid)',
            fontFamily: 'var(--font-ui)',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
          }}
          onClick={() => navigate(`/dashboard/compose/${post.id}`)}
        >
          {formatDate(post.date)}
        </td>

        {/* Views */}
        <td
          style={{
            padding: '14px 16px',
            verticalAlign: 'middle',
            borderBottom: '1px solid #f1f5f9',
            fontSize: 12,
            fontWeight: 600,
            color: 'var(--text-dark)',
            fontFamily: 'var(--font-ui)',
            whiteSpace: 'nowrap',
            cursor: 'pointer',
          }}
          onClick={() => navigate(`/dashboard/compose/${post.id}`)}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <EyeIcon size={12} />
            {post.views > 0 ? formatViews(post.views) : '—'}
          </span>
        </td>

        {/* Actions */}
        <td style={{ padding: '14px 16px', verticalAlign: 'middle', borderBottom: '1px solid #f1f5f9', whiteSpace: 'nowrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={() => navigate(`/dashboard/compose/${post.id}`)}
              title="Edit"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                background: 'rgba(59,130,246,0.08)',
                color: '#2563eb',
                border: '1px solid rgba(59,130,246,0.15)',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              <PencilIcon size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                setConfirmDelete(confirmDelete === post.id ? null : post.id)
              }}
              title="Delete"
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                background: 'rgba(239,68,68,0.08)',
                color: '#dc2626',
                border: '1px solid rgba(239,68,68,0.15)',
                borderRadius: 6,
                cursor: 'pointer',
              }}
            >
              <TrashIcon size={14} />
            </button>
          </div>
        </td>
      </tr>

      {/* Inline confirm-delete row */}
      {confirmDelete === post.id && (
        <tr>
          <td
            colSpan={7}
            style={{ padding: '0 16px 14px 16px', background: '#fff', borderBottom: '1px solid #f1f5f9' }}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: 'rgba(239,68,68,0.05)',
                border: '1px solid rgba(239,68,68,0.15)',
                borderRadius: 8,
                padding: '10px 14px',
                flexWrap: 'wrap',
              }}
            >
              <span
                style={{
                  flex: 1,
                  fontSize: 13,
                  color: '#dc2626',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 500,
                  minWidth: 200,
                }}
              >
                Are you sure you want to delete this post? This cannot be undone.
              </span>
              <button
                onClick={() => onDelete(post.id)}
                style={{
                  background: '#dc2626',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '7px 16px',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 600,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                Confirm
              </button>
              <button
                onClick={() => setConfirmDelete(null)}
                style={{
                  background: '#fff',
                  color: 'var(--text-dark)',
                  border: '1px solid #e2e8f0',
                  borderRadius: 6,
                  padding: '7px 16px',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 600,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
            </div>
          </td>
        </tr>
      )}
    </>
  )
}

// ─── Grid View ─────────────────────────────────────────────────────────────
function GridView({ posts, confirmDelete, setConfirmDelete, onDelete, isMobile }) {
  const navigate = useNavigate()

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: 20,
        padding: 20,
      }}
    >
      {posts.map((post) => (
        <div
          key={post.id}
          style={{
            background: '#fff',
            borderRadius: 12,
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 1px 4px rgba(0,0,0,0.06)',
          }}
        >
          {/* Image */}
          <div style={{ position: 'relative', height: 180, flexShrink: 0 }}>
            {post.image ? (
              <img
                src={post.image}
                alt={post.title}
                style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  background: '#f1f5f9',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#cbd5e1',
                }}
              >
                <DocumentIcon size={36} />
              </div>
            )}
            {/* Category badge overlay */}
            <div
              style={{
                position: 'absolute',
                top: 10,
                left: 10,
                background: 'rgba(15,23,42,0.72)',
                color: '#fff',
                fontSize: 10,
                fontWeight: 700,
                fontFamily: 'var(--font-ui)',
                padding: '3px 9px',
                borderRadius: 20,
                backdropFilter: 'blur(4px)',
                letterSpacing: '0.5px',
              }}
            >
              {post.category}
            </div>
          </div>

          {/* Content */}
          <div style={{ padding: '16px', flex: 1, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {/* Title */}
            <h3
              style={{
                margin: 0,
                fontSize: 14,
                fontWeight: 700,
                color: 'var(--text-dark)',
                fontFamily: 'var(--font-ui)',
                lineHeight: 1.4,
                display: '-webkit-box',
                WebkitLineClamp: 2,
                WebkitBoxOrient: 'vertical',
                overflow: 'hidden',
                cursor: 'pointer',
              }}
              onClick={() => navigate(`/dashboard/compose/${post.id}`)}
            >
              {post.title}
            </h3>

            {/* Status + meta row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 6 }}>
              <StatusBadge status={post.status} />
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4,
                  fontSize: 11,
                  color: 'var(--text-light)',
                  fontFamily: 'var(--font-ui)',
                }}
              >
                <EyeIcon size={11} />
                {post.views > 0 ? formatViews(post.views) : '—'}
              </span>
            </div>

            {/* Date */}
            <span
              style={{
                fontSize: 11,
                color: 'var(--text-light)',
                fontFamily: 'var(--font-ui)',
                marginTop: 'auto',
              }}
            >
              {formatDate(post.date)}
            </span>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8, paddingTop: 6, borderTop: '1px solid #f1f5f9' }}>
              <button
                onClick={() => navigate(`/dashboard/compose/${post.id}`)}
                style={{
                  flex: 1,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '7px',
                  background: 'rgba(59,130,246,0.08)',
                  color: '#2563eb',
                  border: '1px solid rgba(59,130,246,0.15)',
                  borderRadius: 8,
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 600,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                <PencilIcon size={13} />
                Edit
              </button>
              <button
                onClick={() => setConfirmDelete(confirmDelete === post.id ? null : post.id)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '7px 14px',
                  background: 'rgba(239,68,68,0.08)',
                  color: '#dc2626',
                  border: '1px solid rgba(239,68,68,0.15)',
                  borderRadius: 8,
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 600,
                  fontSize: 12,
                  cursor: 'pointer',
                }}
              >
                <TrashIcon size={13} />
              </button>
            </div>

            {/* Inline delete confirm */}
            {confirmDelete === post.id && (
              <div
                style={{
                  background: 'rgba(239,68,68,0.05)',
                  border: '1px solid rgba(239,68,68,0.15)',
                  borderRadius: 8,
                  padding: '10px 12px',
                }}
              >
                <p
                  style={{
                    margin: '0 0 10px',
                    fontSize: 12,
                    color: '#dc2626',
                    fontFamily: 'var(--font-ui)',
                    fontWeight: 500,
                    lineHeight: 1.4,
                  }}
                >
                  Are you sure? This cannot be undone.
                </p>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => onDelete(post.id)}
                    style={{
                      flex: 1,
                      background: '#dc2626',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 6,
                      padding: '7px',
                      fontFamily: 'var(--font-ui)',
                      fontWeight: 600,
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    Confirm
                  </button>
                  <button
                    onClick={() => setConfirmDelete(null)}
                    style={{
                      flex: 1,
                      background: '#fff',
                      color: 'var(--text-dark)',
                      border: '1px solid #e2e8f0',
                      borderRadius: 6,
                      padding: '7px',
                      fontFamily: 'var(--font-ui)',
                      fontWeight: 600,
                      fontSize: 12,
                      cursor: 'pointer',
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Main Component ────────────────────────────────────────────────────────
export default function PublisherPosts() {
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const [posts, setPosts] = useState(() => mockPosts.filter((p) => p.authorId === 1))
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')
  const [viewMode, setViewMode] = useState('table')
  const [confirmDelete, setConfirmDelete] = useState(null)
  const [toast, setToast] = useState(null)

  const filtered = posts.filter((p) => {
    const matchSearch =
      searchTerm.trim() === '' ||
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.excerpt || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchStatus = filterStatus === 'all' || p.status === filterStatus
    return matchSearch && matchStatus
  })

  function handleDelete(id) {
    setPosts((prev) => prev.filter((p) => p.id !== id))
    setConfirmDelete(null)
    setToast('Post deleted')
  }

  const tabCounts = {
    all: posts.length,
    published: posts.filter((p) => p.status === 'published').length,
    draft: posts.filter((p) => p.status === 'draft').length,
  }

  return (
    <div style={{ fontFamily: 'var(--font-ui)' }}>
      {toast && <Toast message={toast} onDone={() => setToast(null)} />}

      {/* ── Page Header ── */}
      <div
        style={{
          display: 'flex',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 14,
          marginBottom: 24,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 700,
              color: 'var(--text-dark)',
              fontFamily: 'var(--font-ui)',
            }}
          >
            My Posts
          </h1>
          <span
            style={{
              background: 'rgba(228,61,48,0.1)',
              color: 'var(--brand)',
              border: '1px solid rgba(228,61,48,0.2)',
              borderRadius: 20,
              padding: '3px 12px',
              fontSize: 12,
              fontWeight: 700,
              fontFamily: 'var(--font-ui)',
            }}
          >
            {posts.length}
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {/* View toggle */}
          <div
            style={{
              display: 'flex',
              background: '#fff',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              overflow: 'hidden',
            }}
          >
            <ViewToggleBtn active={viewMode === 'table'} onClick={() => setViewMode('table')} title="Table view">
              <ListIcon size={16} />
            </ViewToggleBtn>
            <ViewToggleBtn active={viewMode === 'grid'} onClick={() => setViewMode('grid')} title="Grid view">
              <GridIcon size={16} />
            </ViewToggleBtn>
          </div>

          {/* New Post */}
          <button
            onClick={() => navigate('/dashboard/compose')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: 'var(--brand)',
              color: '#fff',
              borderRadius: 8,
              padding: '9px 18px',
              fontFamily: 'var(--font-ui)',
              fontWeight: 600,
              fontSize: 13,
              border: 'none',
              cursor: 'pointer',
              minHeight: 44,
            }}
          >
            <PlusIcon size={16} />
            New Post
          </button>
        </div>
      </div>

      {/* ── Filter Tabs + Search + Content ── */}
      <div
        style={{
          background: '#fff',
          borderRadius: 12,
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
          overflow: 'hidden',
        }}
      >
        {/* Tabs row */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 16px',
            flexWrap: 'wrap',
            gap: 8,
            borderBottom: '1px solid #f1f5f9',
          }}
        >
          {/* Pill tabs */}
          <div style={{ display: 'flex', gap: 2 }}>
            {[
              { key: 'all', label: 'All' },
              { key: 'published', label: 'Published' },
              { key: 'draft', label: 'Drafts' },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setFilterStatus(tab.key)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '14px 14px',
                  background: 'none',
                  border: 'none',
                  borderBottom: filterStatus === tab.key ? '2px solid var(--brand)' : '2px solid transparent',
                  color: filterStatus === tab.key ? 'var(--brand)' : 'var(--text-mid)',
                  fontFamily: 'var(--font-ui)',
                  fontSize: 13,
                  fontWeight: filterStatus === tab.key ? 700 : 500,
                  cursor: 'pointer',
                  transition: 'all 0.12s',
                  marginBottom: -1,
                }}
              >
                {tab.label}
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    background: filterStatus === tab.key ? 'rgba(228,61,48,0.1)' : '#f1f5f9',
                    color: filterStatus === tab.key ? 'var(--brand)' : 'var(--text-light)',
                    padding: '1px 7px',
                    borderRadius: 20,
                    fontFamily: 'var(--font-ui)',
                  }}
                >
                  {tabCounts[tab.key]}
                </span>
              </button>
            ))}
          </div>

          {/* Search input */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              background: '#f8fafc',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              padding: '7px 12px',
              minWidth: isMobile ? '100%' : 240,
              margin: '8px 0',
            }}
          >
            <span style={{ color: '#94a3b8', flexShrink: 0 }}>
              <SearchIcon size={15} />
            </span>
            <input
              type="text"
              placeholder="Search posts..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                border: 'none',
                background: 'none',
                outline: 'none',
                fontFamily: 'var(--font-ui)',
                fontSize: 13,
                color: 'var(--text-dark)',
              }}
            />
          </div>
        </div>

        {/* Content */}
        {filtered.length === 0 ? (
          <EmptyState />
        ) : viewMode === 'table' ? (
          <TableView
            posts={filtered}
            confirmDelete={confirmDelete}
            setConfirmDelete={setConfirmDelete}
            onDelete={handleDelete}
            isMobile={isMobile}
          />
        ) : (
          <GridView
            posts={filtered}
            confirmDelete={confirmDelete}
            setConfirmDelete={setConfirmDelete}
            onDelete={handleDelete}
            isMobile={isMobile}
          />
        )}
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

function TrashIcon({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  )
}

function GridIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" />
      <rect x="14" y="3" width="7" height="7" />
      <rect x="3" y="14" width="7" height="7" />
      <rect x="14" y="14" width="7" height="7" />
    </svg>
  )
}

function ListIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="8" y1="6" x2="21" y2="6" />
      <line x1="8" y1="12" x2="21" y2="12" />
      <line x1="8" y1="18" x2="21" y2="18" />
      <line x1="3" y1="6" x2="3.01" y2="6" />
      <line x1="3" y1="12" x2="3.01" y2="12" />
      <line x1="3" y1="18" x2="3.01" y2="18" />
    </svg>
  )
}

function SearchIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  )
}

function PlusIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function EyeIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
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

function CheckIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}
