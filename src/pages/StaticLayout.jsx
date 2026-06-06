import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '../hooks/useIsMobile';

export default function StaticLayout({ title, subtitle, seoDesc, children }) {
  const isMobile = useIsMobile();

  useEffect(() => {
    document.title = `${title} | Travel to Dubai`;
    let m = document.querySelector('meta[name="description"]');
    if (!m) { m = document.createElement('meta'); m.name = 'description'; document.head.appendChild(m); }
    m.content = seoDesc || subtitle || '';
    return () => { document.title = 'Travel to Dubai | Top Attractions, Activities & Travel Guide'; };
  }, [title]);

  return (
    <div style={{ background: 'var(--sand)', minHeight: '70vh' }}>
      {/* Hero banner */}
      <div style={{
        background: 'linear-gradient(135deg, var(--midnight) 0%, #252d34 100%)',
        padding: isMobile ? '40px 20px 36px' : '60px 24px 56px',
        textAlign: 'center',
        borderBottom: '1px solid rgba(201,160,80,0.12)',
        position: 'relative', overflow: 'hidden',
      }}>
        {/* Decorative ring */}
        <div style={{
          position: 'absolute', top: -80, right: -80,
          width: 320, height: 320, borderRadius: '50%',
          border: '1px solid rgba(201,160,80,0.07)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', bottom: -120, left: -60,
          width: 280, height: 280, borderRadius: '50%',
          border: '1px solid rgba(228,61,48,0.06)',
          pointerEvents: 'none',
        }} />

        <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginBottom: 20 }}>
            <Link to="/" style={{ color: 'rgba(255,255,255,0.38)', fontSize: 12, textDecoration: 'none', fontFamily: 'var(--font-ui)', transition: 'color 0.2s' }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--gold)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.38)'}
            >Home</Link>
            <span style={{ color: 'rgba(255,255,255,0.2)', fontFamily: 'var(--font-ui)' }}>›</span>
            <span style={{ color: 'var(--gold)', fontSize: 12, fontFamily: 'var(--font-ui)', fontWeight: 600 }}>{title}</span>
          </div>

          {/* Brand accent */}
          <div style={{ width: 36, height: 3, background: 'var(--brand)', borderRadius: 2, margin: '0 auto 20px' }} />

          <h1 style={{
            fontFamily: 'var(--font-headline)', fontWeight: 900,
            fontSize: isMobile ? 28 : 46,
            color: '#fff', margin: '0 0 14px',
            letterSpacing: '-0.02em', lineHeight: 1.1,
          }}>
            {title}
          </h1>
          {subtitle && (
            <p style={{
              fontFamily: 'var(--font-body)', fontWeight: 300,
              fontSize: isMobile ? 14 : 16,
              color: 'rgba(255,255,255,0.52)',
              lineHeight: 1.72, maxWidth: 540, margin: '0 auto',
            }}>
              {subtitle}
            </p>
          )}
        </div>
      </div>

      {/* Page content */}
      <div style={{ maxWidth: 900, margin: '0 auto', padding: isMobile ? '32px 20px 64px' : '52px 24px 88px' }}>
        {children}
      </div>
    </div>
  );
}
