import { useState, useEffect, useRef } from 'react'
import { useIsMobile } from '../../hooks/useIsMobile'
import { getMyProfile, updateMyProfile, updateMyPassword, signIn, uploadImage } from '../../lib/supabase'

const NOTIF_KEY = 'ttd_notif_prefs'

export default function ProfilePage() {
  const isMobile = useIsMobile()
  const auth = JSON.parse(localStorage.getItem('ttd_auth') || '{}')

  const [profile, setProfile] = useState({
    name: auth.name || '',
    displayName: '',
    email: auth.email || '',
    phone: '',
    bio: '',
    website: '',
    twitter: '',
    instagram: '',
    role: auth.role || '',
    avatarUrl: '',
    joinedAt: null,
    postCount: 0,
    status: 'active',
  })
  const [passwords, setPasswords] = useState({ current: '', newPw: '', confirm: '' })
  const [profileSaved, setProfileSaved] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [pwSaved, setPwSaved] = useState(false)
  const [pwError, setPwError] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [profileSaving, setProfileSaving] = useState(false)
  const [pwSaving, setPwSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const photoInputRef = useRef(null)

  const [notifications, setNotifications] = useState(() => {
    try {
      return { postApproved: true, weeklyReport: true, comments: false, pushUrgent: true, ...JSON.parse(localStorage.getItem(NOTIF_KEY) || '{}') }
    } catch {
      return { postApproved: true, weeklyReport: true, comments: false, pushUrgent: true }
    }
  })

  useEffect(() => {
    localStorage.setItem(NOTIF_KEY, JSON.stringify(notifications))
  }, [notifications])

  useEffect(() => {
    getMyProfile().then(p => {
      if (!p) return
      const pp = p.publisher_profile || {}
      setProfile(prev => ({
        ...prev,
        name: p.name || '',
        email: p.email || '',
        bio: p.bio || '',
        role: p.role || prev.role,
        avatarUrl: p.avatar_url || '',
        joinedAt: p.joined_at,
        status: p.status || 'active',
        displayName: pp.display_name || '',
        phone: pp.phone || '',
        website: pp.website || '',
        twitter: pp.social_twitter || '',
        instagram: pp.social_instagram || '',
        postCount: pp.post_count || 0,
      }))
    })
  }, [])

  function getInitials(name) {
    if (!name) return '?'
    const parts = name.trim().split(/\s+/)
    if (parts.length === 1) return parts[0][0].toUpperCase()
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase()
  }

  async function handleProfileSave(e) {
    e.preventDefault()
    setProfileSaving(true)
    setProfileError('')
    const { error } = await updateMyProfile({
      name: profile.name,
      bio: profile.bio,
      display_name: profile.displayName || null,
      phone: profile.phone || null,
      website: profile.website || null,
      social_twitter: profile.twitter || null,
      social_instagram: profile.instagram || null,
    })
    setProfileSaving(false)
    if (error) {
      setProfileError(error.message || 'Could not save your profile.')
      return
    }
    localStorage.setItem('ttd_auth', JSON.stringify({ ...auth, name: profile.name }))
    setProfileSaved(true)
    setTimeout(() => setProfileSaved(false), 3000)
  }

  async function handlePhotoUpload(e) {
    const file = e.target.files?.[0]
    if (!file) return
    setUploadingPhoto(true)
    const { data, error } = await uploadImage(file, 'avatars')
    if (!error && data?.url) {
      const { error: saveErr } = await updateMyProfile({ avatar_url: data.url })
      if (!saveErr) setProfile(p => ({ ...p, avatarUrl: data.url }))
    } else if (error) {
      setProfileError(error.message || 'Photo upload failed.')
    }
    setUploadingPhoto(false)
    e.target.value = ''
  }

  async function handlePasswordUpdate(e) {
    e.preventDefault()
    setPwError('')
    if (!passwords.current) { setPwError('Please enter your current password.'); return }
    if (passwords.newPw.length < 8) { setPwError('New password must be at least 8 characters.'); return }
    if (passwords.newPw !== passwords.confirm) { setPwError('Passwords do not match.'); return }
    setPwSaving(true)
    // Re-authenticate to verify the current password before changing it
    const { error: authErr } = await signIn(profile.email, passwords.current)
    if (authErr) {
      setPwSaving(false)
      setPwError('Current password is incorrect.')
      return
    }
    const { error } = await updateMyPassword(passwords.newPw)
    setPwSaving(false)
    if (error) {
      setPwError(error.message || 'Could not update password.')
      return
    }
    setPwSaved(true)
    setPasswords({ current: '', newPw: '', confirm: '' })
    setTimeout(() => setPwSaved(false), 3000)
  }

  const cardStyle = {
    background: '#fff',
    borderRadius: 12,
    border: '1px solid #e2e8f0',
    boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
    padding: '20px 24px',
    marginBottom: 20
  }
  const labelStyle = {
    display: 'block',
    fontFamily: 'var(--font-ui)',
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--text-light)',
    letterSpacing: '0.8px',
    textTransform: 'uppercase',
    marginBottom: 6
  }
  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    borderRadius: 8,
    border: '1px solid #e2e8f0',
    fontFamily: 'var(--font-ui)',
    fontSize: 13,
    outline: 'none',
    boxSizing: 'border-box',
    color: 'var(--text-dark)',
    background: '#fff'
  }
  const inputDisabledStyle = {
    ...inputStyle,
    background: '#f8fafc',
    color: 'var(--text-mid)',
    cursor: 'not-allowed'
  }
  const sectionHeadStyle = {
    fontFamily: 'var(--font-ui)',
    fontSize: 15,
    fontWeight: 700,
    color: 'var(--text-dark)',
    marginBottom: 18,
    marginTop: 0
  }
  const fieldGroupStyle = {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
    gap: '0 20px'
  }
  const fieldWrapStyle = { marginBottom: 16 }

  return (
    <div style={{ minHeight: '100vh', background: '#f1f5f9', fontFamily: 'var(--font-ui)' }}>
      <div style={{ maxWidth: 1100, margin: '0 auto', padding: isMobile ? '20px 14px' : '32px 32px' }}>

        {/* PAGE HEADER */}
        <div style={{ marginBottom: 28 }}>
          <h1 style={{ fontFamily: 'var(--font-ui)', fontSize: 24, fontWeight: 800, color: 'var(--text-dark)', margin: 0, marginBottom: 4 }}>Profile Settings</h1>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-mid)', margin: 0 }}>Manage your personal information and account settings.</p>
        </div>

        <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', flexDirection: isMobile ? 'column' : 'row' }}>

          {/* LEFT COLUMN */}
          <div style={{ flex: 1, minWidth: 0 }}>

            {/* CARD 1 — Profile Info */}
            <div style={cardStyle}>
              <p style={sectionHeadStyle}>Personal Information</p>

              {/* Avatar */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.name} loading="lazy" decoding="async" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                ) : (
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: 28, fontWeight: 700, color: '#fff', userSelect: 'none' }}>{getInitials(profile.name)}</span>
                  </div>
                )}
                <div>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 600, color: 'var(--text-dark)', marginBottom: 6 }}>{profile.name || 'Your Name'}</div>
                  <input ref={photoInputRef} type="file" accept="image/*" onChange={handlePhotoUpload} style={{ display: 'none' }} />
                  <button type="button" onClick={() => photoInputRef.current?.click()} disabled={uploadingPhoto} style={{ background: '#fff', color: 'var(--text-dark)', border: '1px solid #e2e8f0', borderRadius: 8, padding: '7px 14px', fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 12, cursor: uploadingPhoto ? 'wait' : 'pointer', display: 'flex', alignItems: 'center', gap: 6 }}>
                    <CameraIcon /> {uploadingPhoto ? 'Uploading…' : 'Change Photo'}
                  </button>
                </div>
              </div>

              <form onSubmit={handleProfileSave}>
                <div style={fieldGroupStyle}>
                  <div style={fieldWrapStyle}>
                    <label style={labelStyle}>Full Name</label>
                    <input style={inputStyle} value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} placeholder="Your full name" />
                  </div>
                  <div style={fieldWrapStyle}>
                    <label style={labelStyle}>Display Name / Handle</label>
                    <input style={inputStyle} value={profile.displayName} onChange={e => setProfile(p => ({ ...p, displayName: e.target.value }))} placeholder="@handle" />
                  </div>
                  <div style={fieldWrapStyle}>
                    <label style={labelStyle}>Email</label>
                    <input style={inputDisabledStyle} type="email" value={profile.email} disabled readOnly placeholder="you@example.com" />
                  </div>
                  <div style={fieldWrapStyle}>
                    <label style={labelStyle}>Phone</label>
                    <input style={inputStyle} type="tel" value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+971 50 000 0000" />
                  </div>
                </div>

                <div style={{ ...fieldWrapStyle, gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Bio</label>
                  <textarea
                    value={profile.bio}
                    onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))}
                    rows={3}
                    placeholder="Tell readers about yourself..."
                    style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.6 }}
                  />
                </div>

                <div style={{ ...fieldWrapStyle, gridColumn: '1 / -1' }}>
                  <label style={labelStyle}>Role</label>
                  <input style={inputDisabledStyle} value={profile.role === 'admin' ? 'Admin' : 'Publisher'} disabled readOnly />
                </div>

                {profileError && (
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--brand)', background: 'rgba(228,61,48,0.07)', border: '1px solid rgba(228,61,48,0.15)', borderRadius: 8, padding: '9px 14px', marginBottom: 14 }}>
                    {profileError}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={profileSaving}
                  style={{ width: '100%', background: profileSaved ? '#10b981' : 'var(--brand)', color: '#fff', border: 'none', borderRadius: 8, padding: '11px 18px', fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 13, cursor: profileSaving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 44, transition: 'background 0.3s', opacity: profileSaving ? 0.8 : 1 }}
                >
                  {profileSaved ? <><CheckIcon size={15} color="#fff" /> Saved!</> : profileSaving ? 'Saving...' : <><SaveIcon /> Save Changes</>}
                </button>
              </form>
            </div>

            {/* CARD 2 — Social Links */}
            <div style={cardStyle}>
              <p style={sectionHeadStyle}>Social & Web Presence</p>
              <div style={fieldWrapStyle}>
                <label style={labelStyle}>Website URL</label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
                  <span style={{ padding: '10px 12px', background: '#f8fafc', borderRight: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', color: 'var(--text-light)' }}><GlobeIcon /></span>
                  <input style={{ flex: 1, border: 'none', outline: 'none', padding: '10px 12px', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-dark)' }} type="url" value={profile.website} onChange={e => setProfile(p => ({ ...p, website: e.target.value }))} placeholder="https://yoursite.com" />
                </div>
              </div>
              <div style={fieldWrapStyle}>
                <label style={labelStyle}>Twitter / X Handle</label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
                  <span style={{ padding: '10px 12px', background: '#f8fafc', borderRight: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', color: 'var(--text-light)' }}><TwitterIcon /></span>
                  <span style={{ padding: '10px 0 10px 12px', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-light)' }}>@</span>
                  <input style={{ flex: 1, border: 'none', outline: 'none', padding: '10px 8px', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-dark)' }} value={profile.twitter} onChange={e => setProfile(p => ({ ...p, twitter: e.target.value }))} placeholder="yourhandle" />
                </div>
              </div>
              <div style={fieldWrapStyle}>
                <label style={labelStyle}>Instagram Handle</label>
                <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
                  <span style={{ padding: '10px 12px', background: '#f8fafc', borderRight: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', color: 'var(--text-light)' }}><InstagramIcon /></span>
                  <span style={{ padding: '10px 0 10px 12px', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-light)' }}>@</span>
                  <input style={{ flex: 1, border: 'none', outline: 'none', padding: '10px 8px', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-dark)' }} value={profile.instagram} onChange={e => setProfile(p => ({ ...p, instagram: e.target.value }))} placeholder="yourhandle" />
                </div>
              </div>
            </div>

            {/* CARD 3 — Change Password */}
            <div style={cardStyle}>
              <p style={sectionHeadStyle}>Change Password</p>
              <form onSubmit={handlePasswordUpdate}>
                {[
                  { label: 'Current Password', key: 'current', show: showCurrent, toggleShow: () => setShowCurrent(p => !p) },
                  { label: 'New Password', key: 'newPw', show: showNew, toggleShow: () => setShowNew(p => !p) },
                  { label: 'Confirm New Password', key: 'confirm', show: showConfirm, toggleShow: () => setShowConfirm(p => !p) }
                ].map(field => (
                  <div key={field.key} style={{ ...fieldWrapStyle }}>
                    <label style={labelStyle}>{field.label}</label>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #e2e8f0', borderRadius: 8, overflow: 'hidden' }}>
                      <input
                        type={field.show ? 'text' : 'password'}
                        value={passwords[field.key]}
                        onChange={e => setPasswords(p => ({ ...p, [field.key]: e.target.value }))}
                        style={{ flex: 1, border: 'none', outline: 'none', padding: '10px 14px', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-dark)' }}
                        placeholder="••••••••"
                      />
                      <button type="button" onClick={field.toggleShow} style={{ padding: '0 12px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-light)', display: 'flex', alignItems: 'center' }}>
                        {field.show ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>
                ))}

                {pwError && (
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--brand)', background: 'rgba(228,61,48,0.07)', border: '1px solid rgba(228,61,48,0.15)', borderRadius: 8, padding: '9px 14px', marginBottom: 14 }}>
                    {pwError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={pwSaving}
                  style={{ width: '100%', background: pwSaved ? '#10b981' : 'var(--brand)', color: '#fff', border: 'none', borderRadius: 8, padding: '11px 18px', fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 13, cursor: pwSaving ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 44, transition: 'background 0.3s', opacity: pwSaving ? 0.8 : 1 }}
                >
                  {pwSaved ? <><CheckIcon size={15} color="#fff" /> Password Updated!</> : pwSaving ? 'Updating...' : 'Update Password'}
                </button>
              </form>
            </div>
          </div>

          {/* RIGHT COLUMN */}
          <div style={{ width: isMobile ? '100%' : 300, flexShrink: 0 }}>
            <div style={{ position: isMobile ? 'static' : 'sticky', top: 28 }}>

              {/* Account Info Card */}
              <div style={{ ...cardStyle, textAlign: 'center' }}>
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt={profile.name} loading="lazy" decoding="async" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 14px', display: 'block' }} />
                ) : (
                  <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: 28, fontWeight: 700, color: '#fff', userSelect: 'none' }}>{getInitials(profile.name)}</span>
                  </div>
                )}
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: 16, fontWeight: 700, color: 'var(--text-dark)', marginBottom: 6 }}>{profile.name || '—'}</div>
                <div style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 10px', borderRadius: 20, fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 600, background: 'rgba(59,130,246,0.1)', color: '#2563eb', border: '1px solid rgba(59,130,246,0.2)', marginBottom: 14 }}>
                  {profile.role === 'admin' ? 'Admin' : 'Publisher'}
                </div>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-mid)', marginBottom: 16 }}>{profile.email}</div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: 14 }}>
                  {[
                    { label: 'Member Since', value: profile.joinedAt ? new Date(profile.joinedAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '—' },
                    { label: 'Posts Published', value: String(profile.postCount) }
                  ].map(item => (
                    <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-ui)', fontSize: 12, marginBottom: 8 }}>
                      <span style={{ color: 'var(--text-light)' }}>{item.label}</span>
                      <span style={{ color: 'var(--text-dark)', fontWeight: 600 }}>{item.value}</span>
                    </div>
                  ))}
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontFamily: 'var(--font-ui)', fontSize: 12 }}>
                    <span style={{ color: 'var(--text-light)' }}>Status</span>
                    {(() => {
                      const s = {
                        active:    { bg: 'rgba(16,185,129,0.1)', fg: '#059669', bd: 'rgba(16,185,129,0.2)', label: 'Active' },
                        suspended: { bg: 'rgba(239,68,68,0.1)',  fg: '#dc2626', bd: 'rgba(239,68,68,0.2)',  label: 'Suspended' },
                        pending:   { bg: 'rgba(245,158,11,0.1)', fg: '#d97706', bd: 'rgba(245,158,11,0.2)', label: 'Pending' },
                      }[profile.status] || { bg: 'rgba(148,163,184,0.12)', fg: '#64748b', bd: 'rgba(148,163,184,0.25)', label: profile.status || '—' }
                      return (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '2px 8px', borderRadius: 20, background: s.bg, color: s.fg, border: `1px solid ${s.bd}`, fontSize: 11, fontWeight: 600 }}>{s.label}</span>
                      )
                    })()}
                  </div>
                </div>
              </div>

              {/* Notifications Card */}
              <div style={cardStyle}>
                <p style={{ ...sectionHeadStyle, fontSize: 14 }}>Notifications</p>
                {[
                  { key: 'postApproved', label: 'Email me when my post is approved' },
                  { key: 'weeklyReport', label: 'Email me weekly performance report' },
                  { key: 'comments', label: 'Email me when someone comments' },
                  { key: 'pushUrgent', label: 'Push notifications for urgent updates' }
                ].map(n => (
                  <label key={n.key} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, cursor: 'pointer', fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-mid)' }}>
                    <input
                      type="checkbox"
                      checked={notifications[n.key]}
                      onChange={() => setNotifications(prev => ({ ...prev, [n.key]: !prev[n.key] }))}
                      style={{ width: 15, height: 15, cursor: 'pointer', accentColor: 'var(--brand)' }}
                    />
                    {n.label}
                  </label>
                ))}
              </div>

              {/* Danger Zone Card */}
              <div style={{ ...cardStyle, border: '1px solid rgba(239,68,68,0.3)', borderRadius: 10, padding: 20 }}>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 14, fontWeight: 700, color: '#dc2626', margin: '0 0 10px' }}>Danger Zone</p>
                <p style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--text-mid)', margin: '0 0 14px', lineHeight: 1.5 }}>
                  Once you request account deletion, all your data will be permanently removed. This action cannot be undone.
                </p>
                <button style={{ background: 'rgba(239,68,68,0.1)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.15)', borderRadius: 8, padding: '7px 14px', fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 13, cursor: 'pointer', width: '100%' }}>
                  Request Account Deletion
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// ── SVG ICONS ─────────────────────────────────────────────────────────────────

function CameraIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
      <circle cx="12" cy="13" r="4"/>
    </svg>
  )
}

function GlobeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="2" y1="12" x2="22" y2="12"/>
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
    </svg>
  )
}

function TwitterIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
    </svg>
  )
}

function InstagramIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

function CheckIcon({ size = 16, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12"/>
    </svg>
  )
}

function SaveIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
      <polyline points="17 21 17 13 7 13 7 21"/>
      <polyline points="7 3 7 8 15 8"/>
    </svg>
  )
}
