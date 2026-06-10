import { useState, useEffect } from 'react'
import { listPublishers, createPublisher, updatePublisher, deletePublisher, logActivity } from '../../lib/supabase'

const AVATAR_COLORS = [
  '#e43d30', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6',
  '#ec4899', '#14b8a6', '#f97316', '#6366f1', '#84cc16',
]

function getAvatarColor(id) {
  const s = String(id || '')
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return AVATAR_COLORS[h % AVATAR_COLORS.length]
}

function getInitials(name) {
  return (name || '?').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
}

function formatDate(dateStr) {
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
}

const ROLES = [
  'Senior Editor',
  'Travel Writer',
  'Lifestyle Editor',
  'Content Writer',
  'Culture Writer',
]

const emptyForm = {
  name: '',
  email: '',
  role: 'Travel Writer',
  status: 'active',
  password: '',
  newPassword: '',
}

// DB stores active/suspended/pending; the UI shows Active/Inactive
const toUiStatus = (s) => (s === 'active' ? 'active' : 'inactive')
const toDbStatus = (s) => (s === 'active' ? 'active' : 'suspended')

export default function AdminPublishers() {
  const [publishers, setPublishers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formError, setFormError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [modalMode, setModalMode] = useState(null) // 'add' | 'edit' | null
  const [selectedPublisher, setSelectedPublisher] = useState(null)
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [formData, setFormData] = useState(emptyForm)
  const [hoveredRow, setHoveredRow] = useState(null)
  const [hoveredBtn, setHoveredBtn] = useState(null)

  async function load() {
    const { data } = await listPublishers()
    setPublishers((data || []).map(p => ({
      id: p.id,
      name: p.name,
      email: p.email,
      avatar: getInitials(p.name),
      avatarUrl: p.avatar_url,
      role: p.publisher_profile?.job_title || 'Writer',
      posts: p.publisher_profile?.post_count || 0,
      status: toUiStatus(p.status),
      joined: p.joined_at,
    })))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = publishers.filter(p => {
    const s = searchTerm.toLowerCase()
    return p.name.toLowerCase().includes(s) || p.email.toLowerCase().includes(s)
  })

  function openAdd() {
    setFormData(emptyForm)
    setFormError('')
    setShowResetPassword(false)
    setSelectedPublisher(null)
    setModalMode('add')
  }

  function openEdit(pub) {
    setFormData({
      name: pub.name,
      email: pub.email,
      role: pub.role,
      status: pub.status,
      password: '',
      newPassword: '',
    })
    setFormError('')
    setShowResetPassword(false)
    setSelectedPublisher(pub)
    setModalMode('edit')
  }

  function closeModal() {
    setModalMode(null)
    setSelectedPublisher(null)
    setShowResetPassword(false)
    setFormError('')
  }

  async function handleSave() {
    if (!formData.name.trim() || !formData.email.trim()) return
    setSaving(true)
    setFormError('')
    if (modalMode === 'add') {
      const { data, error } = await createPublisher({
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password || 'Publisher@123',
        jobTitle: formData.role,
        status: toDbStatus(formData.status),
      })
      if (error) {
        setSaving(false)
        setFormError(error.message || 'Could not create publisher.')
        return
      }
      logActivity({
        actionType: 'user_created',
        entityType: 'profile',
        entityId: data.id,
        message: `Admin added publisher ${formData.name.trim()}`,
      })
      if (data.emailConfirmationPending) {
        window.alert('Publisher created. They need to confirm their email address before they can sign in.')
      }
    } else if (modalMode === 'edit' && selectedPublisher) {
      const { error } = await updatePublisher(selectedPublisher.id, {
        name: formData.name.trim(),
        status: toDbStatus(formData.status),
        jobTitle: formData.role,
      })
      if (error) {
        setSaving(false)
        setFormError(error.message || 'Could not save changes.')
        return
      }
      logActivity({
        actionType: 'user_updated',
        entityType: 'profile',
        entityId: selectedPublisher.id,
        message: `Admin updated publisher ${formData.name.trim()}`,
      })
    }
    await load()
    setSaving(false)
    closeModal()
  }

  async function handleDelete(id) {
    const pub = publishers.find(p => p.id === id)
    const { error } = await deletePublisher(id)
    if (error) {
      window.alert(`Could not delete publisher: ${error.message}`)
      setDeleteTarget(null)
      return
    }
    setPublishers(prev => prev.filter(p => p.id !== id))
    setDeleteTarget(null)
    logActivity({
      actionType: 'user_suspended',
      entityType: 'profile',
      entityId: id,
      message: `Admin removed publisher ${pub?.name || ''}`,
    })
  }

  function handleField(key, val) {
    setFormData(prev => ({ ...prev, [key]: val }))
  }

  const overlayStyle = {
    position: 'fixed', inset: 0,
    background: 'rgba(0,0,0,0.5)',
    zIndex: 1000,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    padding: 16,
  }

  const modalStyle = {
    background: '#fff',
    borderRadius: 16,
    padding: 32,
    width: '100%',
    maxWidth: 480,
    boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
    fontFamily: 'var(--font-ui)',
  }

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    fontFamily: 'var(--font-ui)',
    fontSize: 14,
    color: 'var(--text-dark)',
    outline: 'none',
    boxSizing: 'border-box',
    background: '#fff',
  }

  const labelStyle = {
    display: 'block',
    fontFamily: 'var(--font-ui)',
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--text-mid)',
    marginBottom: 6,
    letterSpacing: '0.3px',
  }

  const actionBtnBase = {
    width: 32,
    height: 32,
    borderRadius: 7,
    border: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  }

  return (
    <div style={{ fontFamily: 'var(--font-ui)', padding: '28px 32px', minHeight: '100vh', background: '#f1f5f9' }}>

      {/* Page Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--text-dark)', fontFamily: 'var(--font-ui)' }}>
            Publishers
          </h1>
          <span style={{
            background: 'rgba(228,61,48,0.1)', color: 'var(--brand)',
            border: '1px solid rgba(228,61,48,0.2)',
            borderRadius: 20, padding: '2px 12px',
            fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-ui)',
          }}>
            {publishers.length} publishers
          </span>
        </div>
        <button
          onClick={openAdd}
          onMouseEnter={() => setHoveredBtn('add')}
          onMouseLeave={() => setHoveredBtn(null)}
          style={{
            background: hoveredBtn === 'add' ? '#c73428' : 'var(--brand)',
            color: '#fff', borderRadius: 8, padding: '9px 18px',
            fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 13,
            border: 'none', cursor: 'pointer', minHeight: 44,
            display: 'flex', alignItems: 'center', gap: 7,
            transition: 'background 0.15s',
          }}
        >
          <PlusIcon /> Add Publisher
        </button>
      </div>

      {/* Search Bar */}
      <div style={{
        background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10,
        display: 'flex', alignItems: 'center', gap: 10, padding: '0 14px',
        marginBottom: 20, maxWidth: 380,
      }}>
        <SearchIcon color="var(--text-light)" />
        <input
          type="text"
          placeholder="Search by name or email..."
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
            <XIcon color="var(--text-light)" />
          </button>
        )}
      </div>

      {/* Table Card */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.08)', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 720 }}>
            <thead>
              <tr>
                {['Publisher', 'Role', 'Posts', 'Status', 'Joined', 'Actions'].map(col => (
                  <th key={col} style={{
                    fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 700,
                    color: 'var(--text-light)', letterSpacing: '1px', textTransform: 'uppercase',
                    padding: '10px 16px', borderBottom: '1px solid #e2e8f0',
                    background: '#f8fafc', textAlign: col === 'Posts' ? 'center' : 'left',
                  }}>
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-light)', fontFamily: 'var(--font-ui)', fontSize: 14 }}>
                    Loading publishers…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-light)', fontFamily: 'var(--font-ui)', fontSize: 14 }}>
                    No publishers found.
                  </td>
                </tr>
              ) : filtered.map(pub => (
                <tr
                  key={pub.id}
                  onMouseEnter={() => setHoveredRow(pub.id)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{ borderBottom: '1px solid #f1f5f9', verticalAlign: 'middle', background: hoveredRow === pub.id ? '#f8fafc' : '#fff', transition: 'background 0.1s' }}
                >
                  {/* Publisher column */}
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      {pub.avatarUrl ? (
                        <img src={pub.avatarUrl} alt={pub.name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                      ) : (
                        <div style={{
                          width: 36, height: 36, borderRadius: '50%',
                          background: getAvatarColor(pub.id),
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontWeight: 700, fontSize: 13, fontFamily: 'var(--font-ui)',
                          flexShrink: 0,
                        }}>
                          {pub.avatar}
                        </div>
                      )}
                      <div>
                        <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 14, color: 'var(--text-dark)' }}>
                          {pub.name}
                        </div>
                        <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-light)', marginTop: 2 }}>
                          {pub.email}
                        </div>
                      </div>
                    </div>
                  </td>

                  {/* Role */}
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-mid)' }}>
                    {pub.role}
                  </td>

                  {/* Posts */}
                  <td style={{ padding: '14px 16px', textAlign: 'center', fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600, color: 'var(--text-dark)' }}>
                    {pub.posts}
                  </td>

                  {/* Status */}
                  <td style={{ padding: '14px 16px' }}>
                    {pub.status === 'active' ? (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '3px 10px', borderRadius: 20,
                        fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600,
                        background: 'rgba(16,185,129,0.1)', color: '#059669',
                        border: '1px solid rgba(16,185,129,0.2)',
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#059669', display: 'inline-block' }} />
                        Active
                      </span>
                    ) : (
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5,
                        padding: '3px 10px', borderRadius: 20,
                        fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600,
                        background: 'rgba(245,158,11,0.1)', color: '#d97706',
                        border: '1px solid rgba(245,158,11,0.2)',
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#d97706', display: 'inline-block' }} />
                        Inactive
                      </span>
                    )}
                  </td>

                  {/* Joined */}
                  <td style={{ padding: '14px 16px', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-mid)' }}>
                    {formatDate(pub.joined)}
                  </td>

                  {/* Actions */}
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      {/* Edit */}
                      <button
                        title="Edit publisher"
                        onClick={() => openEdit(pub)}
                        onMouseEnter={() => setHoveredBtn(`edit-${pub.id}`)}
                        onMouseLeave={() => setHoveredBtn(null)}
                        style={{
                          ...actionBtnBase,
                          background: hoveredBtn === `edit-${pub.id}` ? 'rgba(59,130,246,0.15)' : 'rgba(59,130,246,0.08)',
                          color: '#2563eb',
                        }}
                      >
                        <PencilIcon />
                      </button>

                      {/* Reset Password */}
                      <button
                        title="Reset password"
                        onClick={() => { openEdit(pub); setShowResetPassword(true) }}
                        onMouseEnter={() => setHoveredBtn(`key-${pub.id}`)}
                        onMouseLeave={() => setHoveredBtn(null)}
                        style={{
                          ...actionBtnBase,
                          background: hoveredBtn === `key-${pub.id}` ? 'rgba(245,158,11,0.18)' : 'rgba(245,158,11,0.1)',
                          color: '#d97706',
                        }}
                      >
                        <KeyIcon />
                      </button>

                      {/* Delete */}
                      {deleteTarget === pub.id ? (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <button
                            onClick={() => handleDelete(pub.id)}
                            style={{
                              ...actionBtnBase,
                              width: 'auto', padding: '0 10px',
                              background: '#dc2626', color: '#fff', fontSize: 11, fontWeight: 700, fontFamily: 'var(--font-ui)',
                            }}
                          >
                            Confirm
                          </button>
                          <button
                            onClick={() => setDeleteTarget(null)}
                            style={{
                              ...actionBtnBase,
                              background: '#f1f5f9', color: 'var(--text-mid)', fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-ui)',
                              width: 'auto', padding: '0 10px',
                            }}
                          >
                            Cancel
                          </button>
                        </span>
                      ) : (
                        <button
                          title="Delete publisher"
                          onClick={() => setDeleteTarget(pub.id)}
                          onMouseEnter={() => setHoveredBtn(`del-${pub.id}`)}
                          onMouseLeave={() => setHoveredBtn(null)}
                          style={{
                            ...actionBtnBase,
                            background: hoveredBtn === `del-${pub.id}` ? 'rgba(239,68,68,0.18)' : 'rgba(239,68,68,0.1)',
                            color: '#dc2626',
                            border: '1px solid rgba(239,68,68,0.15)',
                          }}
                        >
                          <TrashIcon />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {modalMode !== null && (
        <div style={overlayStyle} onClick={e => { if (e.target === e.currentTarget) closeModal() }}>
          <div style={modalStyle}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: 'var(--text-dark)', fontFamily: 'var(--font-ui)' }}>
                {modalMode === 'add' ? 'Add Publisher' : 'Edit Publisher'}
              </h2>
              <button
                onClick={closeModal}
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, display: 'flex', alignItems: 'center', color: 'var(--text-light)' }}
              >
                <XIcon size={20} />
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Full Name */}
              <div>
                <label style={labelStyle}>Full Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={e => handleField('name', e.target.value)}
                  placeholder="e.g. Ahmed Al Mansoori"
                  style={inputStyle}
                />
              </div>

              {/* Email */}
              <div>
                <label style={labelStyle}>Email Address</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={e => handleField('email', e.target.value)}
                  placeholder="publisher@traveltodubai.com"
                  disabled={modalMode === 'edit'}
                  style={{ ...inputStyle, background: modalMode === 'edit' ? '#f8fafc' : '#fff', cursor: modalMode === 'edit' ? 'not-allowed' : 'text' }}
                />
                {modalMode === 'edit' && (
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-light)', marginTop: 5 }}>
                    The email is the publisher's login and can't be changed here.
                  </div>
                )}
              </div>

              {/* Role */}
              <div>
                <label style={labelStyle}>Role</label>
                <select
                  value={formData.role}
                  onChange={e => handleField('role', e.target.value)}
                  style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                >
                  {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </div>

              {/* Status */}
              <div>
                <label style={labelStyle}>Status</label>
                <select
                  value={formData.status}
                  onChange={e => handleField('status', e.target.value)}
                  style={{ ...inputStyle, appearance: 'none', cursor: 'pointer' }}
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              {/* Password (add only) */}
              {modalMode === 'add' && (
                <div>
                  <label style={labelStyle}>Password</label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={e => handleField('password', e.target.value)}
                    placeholder="Leave blank for default: Publisher@123"
                    style={inputStyle}
                  />
                </div>
              )}

              {/* Reset Password (edit only, when triggered) */}
              {modalMode === 'edit' && (
                <div>
                  {!showResetPassword ? (
                    <button
                      type="button"
                      onClick={() => setShowResetPassword(true)}
                      style={{
                        background: 'rgba(245,158,11,0.1)', color: '#d97706',
                        border: '1px solid rgba(245,158,11,0.2)',
                        borderRadius: 8, padding: '8px 14px',
                        fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 13,
                        cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 7,
                      }}
                    >
                      <KeyIcon size={15} /> Reset Password
                    </button>
                  ) : (
                    <div style={{
                      background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)',
                      borderRadius: 8, padding: '10px 14px',
                      fontFamily: 'var(--font-ui)', fontSize: 12, color: '#92600a', lineHeight: 1.5,
                    }}>
                      For security, password resets are handled by the publisher themselves — ask them
                      to use "Forgot password" on the sign-in page, or reset it from the Supabase Auth dashboard.
                    </div>
                  )}
                </div>
              )}
            </div>

            {formError && (
              <div style={{
                marginTop: 16, padding: '10px 14px',
                background: 'rgba(228,61,48,0.07)', border: '1px solid rgba(228,61,48,0.25)',
                borderRadius: 8, fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--brand)',
              }}>
                {formError}
              </div>
            )}

            {/* Modal Actions */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
              <button
                onClick={closeModal}
                style={{
                  background: '#fff', color: 'var(--text-dark)',
                  border: '1px solid #e2e8f0', borderRadius: 8,
                  padding: '9px 18px', fontFamily: 'var(--font-ui)',
                  fontWeight: 600, fontSize: 13, cursor: 'pointer', minHeight: 44,
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                style={{
                  background: 'var(--brand)', color: '#fff',
                  border: 'none', borderRadius: 8,
                  padding: '9px 18px', fontFamily: 'var(--font-ui)',
                  fontWeight: 600, fontSize: 13, cursor: saving ? 'wait' : 'pointer', minHeight: 44,
                  opacity: saving ? 0.7 : 1,
                }}
              >
                {saving ? 'Saving…' : modalMode === 'add' ? 'Add Publisher' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/* ── Icon Components ─────────────────────────────────────────────────────── */

function PlusIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
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

function KeyIcon({ size = 14 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="7.5" cy="15.5" r="5.5" />
      <path d="M21 2l-9.6 9.6" />
      <path d="M15.5 7.5l3 3" />
      <path d="M17.5 5.5l3 3" />
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

function XIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
