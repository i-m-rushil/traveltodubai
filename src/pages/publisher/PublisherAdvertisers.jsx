import { useState, useEffect } from 'react'
import { listAdvertisers } from '../../lib/supabase'
import { AdvertiserModal, advertiserFromDb } from '../admin/AdminAdvertisers'
import { useIsMobile } from '../../hooks/useIsMobile'

const PKG_COLOR = { Premium: '#C9A050', Standard: '#3b82f6', Basic: '#64748b' }

export default function PublisherAdvertisers() {
  const isMobile = useIsMobile()
  const [advertisers, setAdvertisers] = useState([])
  const [loading, setLoading] = useState(true)
  const [selected, setSelected] = useState(null)
  const [search, setSearch] = useState('')
  const [lightbox, setLightbox] = useState(null)

  useEffect(() => {
    listAdvertisers().then(({ data }) => {
      setAdvertisers((data || []).map(advertiserFromDb))
      setLoading(false)
    })
  }, [])

  const filtered = advertisers.filter(a =>
    a.company.toLowerCase().includes(search.toLowerCase()) ||
    a.contact.toLowerCase().includes(search.toLowerCase()) ||
    a.industry.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div style={{ fontFamily: 'var(--font-ui)' }}>

      {/* Page header */}
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: '#0f172a' }}>Advertisers</h2>
        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#64748b' }}>View active advertising partners and their creative assets</p>
      </div>

      {/* Info banner */}
      <div style={{
        background: 'rgba(59,130,246,0.06)', border: '1px solid rgba(59,130,246,0.2)',
        borderRadius: 10, padding: '12px 16px', marginBottom: 20,
        display: 'flex', alignItems: 'center', gap: 10,
      }}>
        <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
        <span style={{ fontSize: 12, color: '#1e40af' }}>
          These are your site's advertising partners. Click any card to view their details and creative assets.
        </span>
      </div>

      {/* Search */}
      <div style={{ background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0', padding: '14px 18px', marginBottom: 20 }}>
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search advertisers by company, contact or industry..."
          style={{
            width: '100%', boxSizing: 'border-box', padding: '9px 14px',
            fontFamily: 'var(--font-ui)', fontSize: 13,
            border: '1px solid #e2e8f0', borderRadius: 8,
            outline: 'none', color: '#0f172a',
          }}
        />
      </div>

      {/* Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
        {filtered.map(adv => (
          <div
            key={adv.id}
            onClick={() => setSelected(adv)}
            style={{
              background: '#fff', borderRadius: 12, border: '1px solid #e2e8f0',
              padding: '20px', cursor: 'pointer', transition: 'all 0.18s',
              display: 'flex', flexDirection: 'column', gap: 14,
            }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 8px 28px rgba(0,0,0,0.1)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'none'; }}
          >
            {/* Top */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{
                width: 48, height: 48, borderRadius: 12,
                background: adv.color + '22', border: `2px solid ${adv.color}33`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 15, fontWeight: 800, color: adv.color, fontFamily: 'var(--font-ui)', flexShrink: 0,
              }}>
                {adv.avatar}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 700, fontSize: 14, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{adv.company}</div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{adv.industry}</div>
              </div>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontWeight: 600, color: adv.status === 'active' ? '#10b981' : '#94a3b8', flexShrink: 0 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: adv.status === 'active' ? '#10b981' : '#cbd5e1', display: 'inline-block' }} />
                {adv.status === 'active' ? 'Active' : 'Inactive'}
              </span>
            </div>

            {/* Contact */}
            <div style={{ fontSize: 12, color: '#64748b' }}>
              <div style={{ marginBottom: 2 }}><span style={{ color: '#94a3b8' }}>Contact: </span>{adv.contact}</div>
              <div style={{ color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{adv.email}</div>
            </div>

            {/* Creatives preview */}
            {adv.creatives.length > 0 && (
              <div style={{ display: 'flex', gap: 6 }}>
                {adv.creatives.slice(0, 3).map((url, i) => (
                  <div key={i} style={{ flex: 1, borderRadius: 6, overflow: 'hidden', paddingBottom: '40%', position: 'relative', background: '#f1f5f9' }}>
                    <img src={url} alt="" loading="lazy" decoding="async" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
                {adv.creatives.length > 3 && (
                  <div style={{ width: 40, borderRadius: 6, background: '#f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700, color: '#64748b' }}>
                    +{adv.creatives.length - 3}
                  </div>
                )}
              </div>
            )}

            {/* Footer */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
              <span style={{
                padding: '3px 10px', borderRadius: 20,
                background: PKG_COLOR[adv.package] + '18', color: PKG_COLOR[adv.package],
                fontSize: 11, fontWeight: 700, letterSpacing: '0.3px',
              }}>
                {adv.package}
              </span>
              <span style={{ fontSize: 12, color: '#94a3b8' }}>
                {adv.creatives.length} creative{adv.creatives.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>
        ))}
        {filtered.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 0', color: '#94a3b8', fontSize: 14 }}>
            {loading ? 'Loading advertisers…' : advertisers.length === 0 ? 'No advertising partners yet.' : 'No advertisers match your search.'}
          </div>
        )}
      </div>

      {/* Detail modal (read-only) */}
      {selected && (
        <AdvertiserModal
          adv={selected}
          onClose={() => setSelected(null)}
          onImageClick={url => setLightbox(url)}
          isAdmin={false}
        />
      )}

      {/* Lightbox */}
      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, zIndex: 10000,
            background: 'rgba(0,0,0,0.92)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out',
          }}
        >
          <img src={lightbox} alt="Creative" loading="lazy" decoding="async" style={{ maxWidth: '90vw', maxHeight: '90vh', objectFit: 'contain', borderRadius: 8 }} />
        </div>
      )}
    </div>
  )
}
