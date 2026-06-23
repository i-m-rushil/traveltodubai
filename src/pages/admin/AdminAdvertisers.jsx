import { useState, useEffect } from 'react'
import { listAdvertisers, saveAdvertiser, deleteAdvertiser, logActivity } from '../../lib/supabase'
import { useIsMobile } from '../../hooks/useIsMobile'

const PKG_COLOR = { Premium: '#C9A050', Standard: '#3b82f6', Basic: '#64748b' }

// Mirrors the advertiser_status enum in the database.
export const STATUS_META = {
  active:   { label: 'Active',   color: '#10b981', dot: '#10b981' },
  inactive: { label: 'Inactive', color: '#94a3b8', dot: '#cbd5e1' },
  paused:   { label: 'Paused',   color: '#d97706', dot: '#f59e0b' },
  expired:  { label: 'Expired',  color: '#dc2626', dot: '#ef4444' },
}
const statusMeta = (s) => STATUS_META[s] || STATUS_META.inactive
const BRAND_COLORS = [
  '#0066CC', '#CC0000', '#00897B', '#E65100',
  '#7B1FA2', '#455A64', '#C62828', '#00838F',
]

// Must match the ad_format enum in the database
export const AD_FORMATS = [
  'Leaderboard Banner', 'Sidebar Rectangle', 'Article Inline',
  'Mobile Banner', 'Sponsored Card', 'Newsletter Banner',
]

function makeAvatar(company) {
  return (company || '??').split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
}

export function advertiserFromDb(a) {
  return {
    id: a.id,
    company: a.company,
    contact: a.contact_name,
    email: a.email,
    phone: a.phone || '',
    website: a.website || '',
    industry: a.industry || '',
    package: a.package,
    budget: a.monthly_budget || 0,
    status: a.status,
    color: a.brand_color || '#0066CC',
    startDate: a.start_date || '',
    notes: a.notes || '',
    formats: (a.formats || []).map(f => f.format),
    creatives: (a.creatives || []).map(c => c.image_url),
    avatar: makeAvatar(a.company),
  }
}

export default function AdminAdvertisers() {
  const isMobile = useIsMobile()
  const [advertisers, setAdvertisers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [lightbox, setLightbox] = useState(null)
  const [formOpen, setFormOpen] = useState(false)
  const [editTarget, setEditTarget] = useState(null)

  async function load() {
    const { data } = await listAdvertisers()
    setAdvertisers((data || []).map(advertiserFromDb))
    setLoading(false)
  }

  useEffect(() => { load() }, [])

  const filtered = advertisers.filter(a => {
    const q = search.toLowerCase()
    const matchSearch = a.company.toLowerCase().includes(q) ||
      a.contact.toLowerCase().includes(q) ||
      a.industry.toLowerCase().includes(q)
    const matchFilter =
      filter === 'all' ||
      (filter === 'active' && a.status === 'active') ||
      (filter === 'inactive' && a.status === 'inactive') ||
      (filter === 'premium' && a.package === 'Premium')
    return matchSearch && matchFilter
  })

  const totalBudget = advertisers.filter(a => a.status === 'active').reduce((s, a) => s + a.budget, 0)
  const activeCount = advertisers.filter(a => a.status === 'active').length
  const premiumCount = advertisers.filter(a => a.package === 'Premium').length

  function openAdd() { setEditTarget(null); setFormOpen(true) }

  function openEdit(adv) {
    setEditTarget(adv)
    setSelected(null)
    setFormOpen(true)
  }

  async function handleSave(data) {
    const { data: saved, error } = await saveAdvertiser({
      id: editTarget?.id,
      company: data.company.trim(),
      contact_name: data.contact.trim(),
      email: data.email.trim(),
      phone: data.phone || null,
      website: data.website || null,
      industry: data.industry.trim(),
      package: data.package,
      monthly_budget: Number(data.budget) || 0,
      status: data.status,
      brand_color: data.color,
      start_date: data.startDate || null,
      notes: data.notes || null,
      formats: data.formats,
      creatives: data.creatives.map(url => ({ image_url: url, format: data.formats[0] || 'Leaderboard Banner' })),
    })
    if (error) {
      window.alert(`Could not save advertiser: ${error.message}`)
      return
    }
    logActivity({
      actionType: editTarget ? 'advertiser_updated' : 'advertiser_created',
      entityType: 'advertiser',
      entityId: saved?.id,
      message: `Admin ${editTarget ? 'updated' : 'added'} advertiser ${data.company.trim()}`,
    })
    await load()
    setFormOpen(false)
  }

  async function handleDelete(adv) {
    if (!window.confirm(`Delete advertiser "${adv.company}"? This cannot be undone.`)) return
    const { error } = await deleteAdvertiser(adv.id)
    if (error) {
      window.alert(`Could not delete advertiser: ${error.message}`)
      return
    }
    setSelected(null)
    setAdvertisers(prev => prev.filter(a => a.id !== adv.id))
    logActivity({
      actionType: 'advertiser_updated',
      entityType: 'advertiser',
      entityId: adv.id,
      message: `Admin removed advertiser ${adv.company}`,
    })
  }

  return (
    <div style={{ fontFamily: 'var(--font-ui)' }}>

      {/* Page header */}
      <div style={{ marginBottom: 24, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Advertisers</h2>
          <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>Manage ad partners, packages and creative assets</p>
        </div>
        <button onClick={openAdd} style={{
          display: 'flex', alignItems: 'center', gap: 8,
          background: 'var(--brand)', color: '#fff',
          border: 'none', borderRadius: 8, padding: '10px 18px',
          fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 13, cursor: 'pointer',
          boxShadow: '0 2px 8px rgba(228,61,48,0.3)', transition: 'all 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#c0302a'}
          onMouseLeave={e => e.currentTarget.style.background = 'var(--brand)'}
        >
          <PlusIcon /> Add Advertiser
        </button>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : 'repeat(4, 1fr)', gap: 14, marginBottom: 24 }}>
        {[
          { label: 'Total Advertisers', value: advertisers.length, icon: <MegaphoneIcon />, color: '#3b82f6' },
          { label: 'Active', value: activeCount, icon: <CheckIcon />, color: '#10b981' },
          { label: 'Premium Partners', value: premiumCount, icon: <StarIcon />, color: '#C9A050' },
          { label: 'Monthly Revenue', value: `AED ${totalBudget.toLocaleString()}`, icon: <CoinIcon />, color: '#8b5cf6' },
        ].map(s => (
          <div key={s.label} style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: s.color + '18', display: 'flex', alignItems: 'center', justifyContent: 'center', color: s.color, flexShrink: 0 }}>{s.icon}</div>
            <div>
              <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, letterSpacing: '0.3px', textTransform: 'uppercase' }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: '#0f172a', marginTop: 2 }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '14px 18px', marginBottom: 20, display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search advertisers..."
          style={{ flex: 1, minWidth: 180, padding: '9px 14px', fontFamily: 'var(--font-ui)', fontSize: 13, border: '1px solid #e2e8f0', borderRadius: 8, outline: 'none', color: '#0f172a' }} />
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {['all', 'active', 'inactive', 'premium'].map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '7px 14px', borderRadius: 7,
              border: `1px solid ${filter === f ? 'var(--brand)' : '#e2e8f0'}`,
              background: filter === f ? 'var(--brand)' : '#fff',
              color: filter === f ? '#fff' : '#64748b',
              fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 12,
              cursor: 'pointer', textTransform: 'capitalize', transition: 'all 0.15s',
            }}>{f}</button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {filtered.map(adv => (
          <AdvertiserCard key={adv.id} adv={adv} onClick={() => setSelected(adv)} />
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', color: '#94a3b8', fontSize: 14 }}>
            {loading ? 'Loading advertisers…' : advertisers.length === 0 ? 'No advertisers yet — click "Add Advertiser" to create the first one.' : 'No advertisers match your filter.'}
          </div>
        )}
      </div>

      {/* Detail modal */}
      {selected && (
        <AdvertiserModal
          adv={selected}
          onClose={() => setSelected(null)}
          onImageClick={url => setLightbox(url)}
          isAdmin
          onEdit={openEdit}
          onDelete={handleDelete}
        />
      )}

      {/* Form modal */}
      {formOpen && (
        <AdvertiserForm
          initial={editTarget}
          onSave={handleSave}
          onClose={() => setFormOpen(false)}
        />
      )}

      {/* Lightbox */}
      {lightbox && (
        <div onClick={() => setLightbox(null)} style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0,0,0,0.92)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'zoom-out',
        }}>
          <img src={lightbox} alt="Creative" style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 8 }} />
        </div>
      )}
    </div>
  )
}

// ─── Form modal ───────────────────────────────────────────────────────────────
function AdvertiserForm({ initial, onSave, onClose }) {
  const isMobile = useIsMobile()
  const EMPTY = {
    company: '', contact: '', email: '', phone: '', website: '',
    industry: '', package: 'Standard', budget: '', status: 'active',
    color: '#0066CC', startDate: '', notes: '', formats: [], creatives: [],
  }
  const [form, setForm] = useState(initial ? {
    company: initial.company,
    contact: initial.contact,
    email: initial.email,
    phone: initial.phone || '',
    website: initial.website || '',
    industry: initial.industry,
    package: initial.package,
    budget: initial.budget,
    status: initial.status,
    color: initial.color || '#0066CC',
    startDate: initial.startDate || '',
    notes: initial.notes || '',
    formats: [...(initial.formats || [])],
    creatives: [...(initial.creatives || [])],
  } : EMPTY)

  const [newCreative, setNewCreative] = useState('')
  const [errors, setErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)

  function set(key, val) { setForm(f => ({ ...f, [key]: val })); setErrors(e => ({ ...e, [key]: '' })) }

  function toggleFormat(f) {
    setForm(prev => ({
      ...prev,
      formats: prev.formats.includes(f) ? prev.formats.filter(x => x !== f) : [...prev.formats, f],
    }))
  }

  function addCreative() {
    const v = newCreative.trim()
    if (v) { setForm(f => ({ ...f, creatives: [...f.creatives, v] })); setNewCreative('') }
  }
  function removeCreative(i) { setForm(f => ({ ...f, creatives: f.creatives.filter((_, idx) => idx !== i) })) }

  function validate() {
    const e = {}
    if (!form.company.trim()) e.company = 'Company name is required'
    if (!form.contact.trim()) e.contact = 'Contact name is required'
    if (!form.email.trim()) e.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email'
    if (!form.industry.trim()) e.industry = 'Industry is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!validate()) return
    setSubmitting(true)
    await onSave({ ...form, budget: Number(form.budget) || 0 })
    setSubmitting(false)
  }

  const inputStyle = (err) => ({
    width: '100%', boxSizing: 'border-box', padding: '10px 12px',
    fontFamily: 'var(--font-ui)', fontSize: 13,
    border: `1.5px solid ${err ? '#ef4444' : '#e2e8f0'}`, borderRadius: 8,
    outline: 'none', color: '#0f172a', background: '#fff', transition: 'border-color 0.15s',
  })
  const labelStyle = { display: 'block', fontSize: 11, fontWeight: 700, color: '#64748b', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.4px' }

  return (
    <div
      onClick={e => e.target === e.currentTarget && onClose()}
      style={{
        position: 'fixed', inset: 0, zIndex: 9500,
        background: 'rgba(15,23,42,0.7)', backdropFilter: 'blur(4px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: isMobile ? '12px' : '24px',
      }}
    >
      <div style={{
        background: '#fff', borderRadius: 16, width: '100%', maxWidth: 620,
        maxHeight: '92vh', overflowY: 'auto',
        boxShadow: '0 32px 80px rgba(0,0,0,0.3)',
      }}>

        {/* Form header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexShrink: 0,
          position: 'sticky', top: 0, background: '#fff', zIndex: 1, borderRadius: '16px 16px 0 0',
        }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#0f172a' }}>
              {initial ? 'Edit Advertiser' : 'Add Advertiser'}
            </h3>
            <p style={{ margin: '3px 0 0', fontSize: 12, color: '#94a3b8' }}>
              {initial ? `Editing ${initial.company}` : 'Fill in the details to add a new ad partner'}
            </p>
          </div>
          <button onClick={onClose} style={{
            width: 34, height: 34, borderRadius: 8, background: '#f1f5f9',
            border: '1px solid #e2e8f0', color: '#64748b', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}><CloseIcon /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px' }}>

          {/* Company Info */}
          <FormSection title="Company Information">
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
              <div>
                <label style={labelStyle}>Company Name *</label>
                <input value={form.company} onChange={e => set('company', e.target.value)}
                  placeholder="e.g. Emaar Properties" style={inputStyle(errors.company)}
                  onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                  onBlur={e => e.target.style.borderColor = errors.company ? '#ef4444' : '#e2e8f0'}
                />
                {errors.company && <ErrMsg>{errors.company}</ErrMsg>}
              </div>
              <div>
                <label style={labelStyle}>Industry *</label>
                <input value={form.industry} onChange={e => set('industry', e.target.value)}
                  placeholder="e.g. Real Estate" style={inputStyle(errors.industry)}
                  onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                  onBlur={e => e.target.style.borderColor = errors.industry ? '#ef4444' : '#e2e8f0'}
                />
                {errors.industry && <ErrMsg>{errors.industry}</ErrMsg>}
              </div>
              <div>
                <label style={labelStyle}>Website</label>
                <input value={form.website} onChange={e => set('website', e.target.value)}
                  placeholder="www.example.com" style={inputStyle(false)}
                  onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
              <div>
                <label style={labelStyle}>Brand Color</label>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 2 }}>
                  {BRAND_COLORS.map(c => (
                    <button key={c} type="button" onClick={() => set('color', c)} style={{
                      width: 28, height: 28, borderRadius: '50%', background: c, border: 'none',
                      cursor: 'pointer', outline: form.color === c ? `3px solid ${c}` : '3px solid transparent',
                      outlineOffset: 2, transition: 'outline 0.15s',
                    }} />
                  ))}
                </div>
              </div>
            </div>
          </FormSection>

          {/* Contact */}
          <FormSection title="Contact Details">
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 14 }}>
              <div>
                <label style={labelStyle}>Contact Person *</label>
                <input value={form.contact} onChange={e => set('contact', e.target.value)}
                  placeholder="Full name" style={inputStyle(errors.contact)}
                  onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                  onBlur={e => e.target.style.borderColor = errors.contact ? '#ef4444' : '#e2e8f0'}
                />
                {errors.contact && <ErrMsg>{errors.contact}</ErrMsg>}
              </div>
              <div>
                <label style={labelStyle}>Email Address *</label>
                <input type="email" value={form.email} onChange={e => set('email', e.target.value)}
                  placeholder="contact@company.com" style={inputStyle(errors.email)}
                  onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                  onBlur={e => e.target.style.borderColor = errors.email ? '#ef4444' : '#e2e8f0'}
                />
                {errors.email && <ErrMsg>{errors.email}</ErrMsg>}
              </div>
              <div>
                <label style={labelStyle}>Phone</label>
                <input value={form.phone} onChange={e => set('phone', e.target.value)}
                  placeholder="+971 4 000 0000" style={inputStyle(false)}
                  onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
            </div>
          </FormSection>

          {/* Campaign */}
          <FormSection title="Campaign Details">
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(4, 1fr)', gap: 14 }}>
              <div>
                <label style={labelStyle}>Package</label>
                <select value={form.package} onChange={e => set('package', e.target.value)}
                  style={{ ...inputStyle(false), background: '#fff', cursor: 'pointer' }}>
                  <option>Premium</option>
                  <option>Standard</option>
                  <option>Basic</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Budget (AED/mo)</label>
                <input type="number" min="0" value={form.budget} onChange={e => set('budget', e.target.value)}
                  placeholder="0" style={inputStyle(false)}
                  onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
              <div>
                <label style={labelStyle}>Status</label>
                <select value={form.status} onChange={e => set('status', e.target.value)}
                  style={{ ...inputStyle(false), background: '#fff', cursor: 'pointer' }}>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="paused">Paused</option>
                  <option value="expired">Expired</option>
                </select>
              </div>
              <div>
                <label style={labelStyle}>Start Date</label>
                <input type="date" value={form.startDate} onChange={e => set('startDate', e.target.value)}
                  style={inputStyle(false)}
                  onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                  onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                />
              </div>
            </div>
          </FormSection>

          {/* Ad Formats */}
          <FormSection title="Ad Formats">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {AD_FORMATS.map(f => {
                const on = form.formats.includes(f)
                return (
                  <button key={f} type="button" onClick={() => toggleFormat(f)} style={{
                    padding: '6px 12px', borderRadius: 6,
                    background: on ? 'rgba(228,61,48,0.08)' : '#f1f5f9',
                    border: `1px solid ${on ? 'var(--brand)' : '#e2e8f0'}`,
                    fontSize: 12, color: on ? 'var(--brand)' : '#475569',
                    fontWeight: on ? 600 : 500,
                    fontFamily: 'var(--font-ui)', cursor: 'pointer', transition: 'all 0.15s',
                  }}>
                    {on ? '✓ ' : ''}{f}
                  </button>
                )
              })}
            </div>
          </FormSection>

          {/* Notes */}
          <FormSection title="Notes">
            <textarea value={form.notes} onChange={e => set('notes', e.target.value)}
              placeholder="Internal notes about this advertiser..."
              rows={3}
              style={{
                ...inputStyle(false), resize: 'vertical', lineHeight: 1.6,
                fontFamily: 'var(--font-ui)',
              }}
              onFocus={e => e.target.style.borderColor = 'var(--brand)'}
              onBlur={e => e.target.style.borderColor = '#e2e8f0'}
            />
          </FormSection>

          {/* Creative Image URLs */}
          <FormSection title="Creative Image URLs">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
              {form.creatives.map((url, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <div style={{ width: 40, height: 28, borderRadius: 4, overflow: 'hidden', flexShrink: 0, background: '#f1f5f9' }}>
                    <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  <span style={{ flex: 1, fontSize: 11, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{url}</span>
                  <button type="button" onClick={() => removeCreative(i)} style={{
                    flexShrink: 0, background: 'none', border: 'none', color: '#ef4444',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', padding: 4,
                  }}><CloseIcon /></button>
                </div>
              ))}
              {form.creatives.length === 0 && (
                <p style={{ fontSize: 12, color: '#94a3b8', margin: 0 }}>No creative images added yet.</p>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <input value={newCreative} onChange={e => setNewCreative(e.target.value)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addCreative() } }}
                placeholder="https://images.unsplash.com/..."
                style={{ ...inputStyle(false), flex: 1 }}
                onFocus={e => e.target.style.borderColor = 'var(--brand)'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
              <button type="button" onClick={addCreative} style={{
                padding: '10px 16px', borderRadius: 8, background: '#f1f5f9',
                border: '1px solid #e2e8f0', color: '#475569',
                fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 12, cursor: 'pointer',
                whiteSpace: 'nowrap', transition: 'all 0.15s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0' }}
                onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9' }}
              >+ Add</button>
            </div>
          </FormSection>

          {/* Footer buttons */}
          <div style={{ display: 'flex', gap: 10, paddingTop: 8, borderTop: '1px solid #e2e8f0', marginTop: 4 }}>
            <button type="button" onClick={onClose} style={{
              flex: 1, padding: '11px', borderRadius: 8,
              background: '#f1f5f9', color: '#64748b',
              border: '1px solid #e2e8f0',
              fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 13, cursor: 'pointer',
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#e2e8f0'}
              onMouseLeave={e => e.currentTarget.style.background = '#f1f5f9'}
            >Cancel</button>
            <button type="submit" disabled={submitting} style={{
              flex: 2, padding: '11px', borderRadius: 8,
              background: 'var(--brand)', color: '#fff', border: 'none',
              fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13,
              cursor: submitting ? 'wait' : 'pointer', opacity: submitting ? 0.7 : 1,
              boxShadow: '0 2px 8px rgba(228,61,48,0.3)', transition: 'all 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = '#c0302a'}
              onMouseLeave={e => e.currentTarget.style.background = 'var(--brand)'}
            >
              {submitting ? 'Saving…' : initial ? 'Save Changes' : 'Add Advertiser'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Advertiser card ──────────────────────────────────────────────────────────
function AdvertiserCard({ adv, onClick }) {
  return (
    <div onClick={onClick} style={{
      background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
      padding: '20px', cursor: 'pointer', transition: 'all 0.18s',
      display: 'flex', flexDirection: 'column', gap: 14,
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{
          width: 48, height: 48, borderRadius: 12,
          background: (adv.color || '#666') + '22', border: `2px solid ${(adv.color || '#666')}33`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 15, fontWeight: 800, color: adv.color || '#666', fontFamily: 'var(--font-ui)', flexShrink: 0,
        }}>{adv.avatar}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{adv.company}</div>
          <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{adv.industry}</div>
        </div>
        <StatusDot status={adv.status} />
      </div>
      <div style={{ fontSize: 12, color: '#64748b' }}>
        <div style={{ marginBottom: 2 }}><span style={{ color: '#94a3b8' }}>Contact: </span>{adv.contact}</div>
        <div style={{ color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{adv.email}</div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
        <span style={{
          padding: '3px 10px', borderRadius: 20,
          background: (PKG_COLOR[adv.package] || '#888') + '18',
          color: PKG_COLOR[adv.package] || '#888',
          fontSize: 11, fontWeight: 700, letterSpacing: '0.3px',
        }}>{adv.package}</span>
        <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>
          AED {Number(adv.budget).toLocaleString()}<span style={{ fontSize: 10, fontWeight: 400, color: '#94a3b8' }}>/mo</span>
        </span>
      </div>
    </div>
  )
}

// ─── Shared detail modal (used by publisher too) ──────────────────────────────
export function AdvertiserModal({ adv, onClose, onImageClick, isAdmin, onEdit, onDelete }) {
  const isMobile = useIsMobile()
  return (
    <div onClick={e => e.target === e.currentTarget && onClose()} style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      background: 'rgba(15,23,42,0.65)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: isMobile ? '16px' : '24px',
    }}>
      <div style={{
        background: '#fff', borderRadius: 16,
        width: '100%', maxWidth: 820,
        maxHeight: '90vh', overflowY: 'auto',
        boxShadow: '0 32px 80px rgba(0,0,0,0.3)',
        display: 'flex', flexDirection: 'column',
      }}>

        {/* Header */}
        <div style={{
          padding: '22px 24px', borderBottom: '1px solid #e2e8f0',
          display: 'flex', alignItems: 'center', gap: 14, flexShrink: 0,
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          borderRadius: '16px 16px 0 0',
        }}>
          <div style={{
            width: 56, height: 56, borderRadius: 14,
            background: (adv.color || '#666') + '30',
            border: `2px solid ${(adv.color || '#666')}60`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 18, fontWeight: 800, color: adv.color || '#fff', fontFamily: 'var(--font-ui)', flexShrink: 0,
          }}>{adv.avatar}</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#fff' }}>{adv.company}</div>
            <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', marginTop: 3 }}>{adv.industry}</div>
            <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
              <span style={{ padding: '2px 10px', borderRadius: 20, background: (PKG_COLOR[adv.package] || '#888') + '30', color: PKG_COLOR[adv.package] || '#888', fontSize: 11, fontWeight: 700 }}>{adv.package}</span>
              <span style={{
                padding: '2px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700,
                background: statusMeta(adv.status).color + '33',
                color: statusMeta(adv.status).color,
              }}>{statusMeta(adv.status).label}</span>
            </div>
          </div>
          <button onClick={onClose} style={{
            width: 36, height: 36, borderRadius: 8,
            background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.7)', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}><CloseIcon /></button>
        </div>

        {/* Body */}
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', flex: 1 }}>

          {/* Left */}
          <div style={{ padding: '24px', borderRight: isMobile ? 'none' : '1px solid #e2e8f0', borderBottom: isMobile ? '1px solid #e2e8f0' : 'none' }}>
            <SectionTitle>Contact Information</SectionTitle>
            <DetailRow icon={<PersonIcon />} label="Contact" value={adv.contact} />
            <DetailRow icon={<MailIcon />} label="Email" value={adv.email} />
            {adv.phone && <DetailRow icon={<PhoneIcon />} label="Phone" value={adv.phone} />}
            {adv.website && <DetailRow icon={<GlobeIcon />} label="Website" value={adv.website} />}

            <SectionTitle style={{ marginTop: 20 }}>Campaign Details</SectionTitle>
            <DetailRow icon={<CoinIcon />} label="Budget" value={`AED ${Number(adv.budget).toLocaleString()}/mo`} />
            {adv.startDate && <DetailRow icon={<CalIcon />} label="Since" value={adv.startDate} />}

            {adv.formats && adv.formats.length > 0 && (
              <div style={{ marginTop: 14 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', letterSpacing: '0.3px', textTransform: 'uppercase', marginBottom: 8 }}>Ad Formats</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {adv.formats.map(f => (
                    <span key={f} style={{ padding: '4px 10px', borderRadius: 6, background: '#f1f5f9', border: '1px solid #e2e8f0', fontSize: 11, color: '#475569', fontWeight: 500 }}>{f}</span>
                  ))}
                </div>
              </div>
            )}

            {adv.notes && (
              <div style={{ marginTop: 18, padding: '12px 14px', background: '#fefce8', border: '1px solid #fde68a', borderRadius: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: '#92400e', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.3px' }}>Notes</div>
                <div style={{ fontSize: 12, color: '#78350f', lineHeight: 1.6 }}>{adv.notes}</div>
              </div>
            )}

            {isAdmin && onEdit && (
              <div style={{ display: 'flex', gap: 8, marginTop: 20 }}>
                <button onClick={() => onEdit(adv)} style={{
                  flex: 1, padding: '10px', borderRadius: 8,
                  background: 'var(--brand)', color: '#fff', border: 'none',
                  fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 12, cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = '#c0302a'}
                  onMouseLeave={e => e.currentTarget.style.background = 'var(--brand)'}
                >Edit Advertiser</button>
                {onDelete && (
                  <button onClick={() => onDelete(adv)} style={{
                    flex: 1, padding: '10px', borderRadius: 8,
                    background: 'rgba(239,68,68,0.08)', color: '#dc2626', border: '1px solid rgba(239,68,68,0.2)',
                    fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 12, cursor: 'pointer',
                  }}>Delete</button>
                )}
              </div>
            )}
          </div>

          {/* Right: creatives */}
          <div style={{ padding: '24px' }}>
            <SectionTitle>Creative Assets <span style={{ fontWeight: 400, color: '#94a3b8' }}>({(adv.creatives || []).length})</span></SectionTitle>
            {(adv.creatives || []).length === 0 ? (
              <div style={{ padding: '32px 0', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>No creative images uploaded.</div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: adv.creatives.length === 1 ? '1fr' : '1fr 1fr', gap: 10 }}>
                {adv.creatives.map((url, i) => (
                  <div key={i} onClick={() => onImageClick && onImageClick(url)} style={{
                    borderRadius: 10, overflow: 'hidden', cursor: 'zoom-in',
                    border: '1px solid #e2e8f0', position: 'relative',
                    paddingBottom: adv.creatives.length === 1 ? '42%' : '62%', background: '#f8fafc',
                  }}>
                    <img src={url} alt={`Creative ${i + 1}`} style={{
                      position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover',
                      transition: 'transform 0.3s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
                      onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
                    />
                    <div style={{
                      position: 'absolute', bottom: 6, right: 6,
                      background: 'rgba(0,0,0,0.55)', borderRadius: 4, padding: '2px 7px',
                      fontSize: 10, fontWeight: 600, color: '#fff', fontFamily: 'var(--font-ui)',
                    }}>Creative {i + 1}</div>
                  </div>
                ))}
              </div>
            )}
            <p style={{ fontSize: 11, color: '#94a3b8', marginTop: 12, lineHeight: 1.6 }}>
              Click any image to view full size.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Shared helpers ───────────────────────────────────────────────────────────
function FormSection({ title, children }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 14, paddingBottom: 8, borderBottom: '1px solid #f1f5f9' }}>
        {title}
      </div>
      {children}
    </div>
  )
}
function SectionTitle({ children, style }) {
  return <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 12, ...style }}>{children}</div>
}
function DetailRow({ icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 10 }}>
      <span style={{ color: '#94a3b8', flexShrink: 0, display: 'flex', marginTop: 1 }}>{icon}</span>
      <span style={{ fontSize: 12, color: '#64748b', flexShrink: 0, minWidth: 70 }}>{label}</span>
      <span style={{ fontSize: 13, fontWeight: 600, color: '#0f172a', wordBreak: 'break-all' }}>{value}</span>
    </div>
  )
}
function ErrMsg({ children }) {
  return <div style={{ fontSize: 11, color: '#ef4444', marginTop: 4 }}>{children}</div>
}
function StatusDot({ status }) {
  const m = statusMeta(status)
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: m.color, flexShrink: 0 }}>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: m.dot, display: 'inline-block' }} />
      {m.label}
    </span>
  )
}

// ─── Icons ────────────────────────────────────────────────────────────────────
const ico = (d, size = 16) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">{d}</svg>
function MegaphoneIcon() { return ico(<><path d="M3 11l19-9-9 19-2-8-8-2z"/></>, 18) }
function CheckIcon()     { return ico(<><polyline points="20 6 9 17 4 12"/></>, 18) }
function StarIcon()      { return ico(<><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></>, 18) }
function CoinIcon()      { return ico(<><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></>, 18) }
function PlusIcon()      { return ico(<><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></>, 14) }
function CloseIcon()     { return ico(<><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></>, 16) }
function PersonIcon()    { return ico(<><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></>, 14) }
function MailIcon()      { return ico(<><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></>, 14) }
function PhoneIcon()     { return ico(<><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 13a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.77 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 17z"/></>, 14) }
function GlobeIcon()     { return ico(<><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></>, 14) }
function CalIcon()       { return ico(<><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></>, 14) }
