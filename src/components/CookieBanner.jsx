import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '../hooks/useIsMobile';

export default function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    if (!localStorage.getItem('cookie_consent')) {
      const t = setTimeout(() => setVisible(true), 4000);
      return () => clearTimeout(t);
    }
  }, []);

  function accept() {
    localStorage.setItem('cookie_consent', 'accepted');
    setVisible(false);
  }

  function decline() {
    localStorage.setItem('cookie_consent', 'declined');
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0,
      zIndex: 9999,
      transform: visible ? 'translateY(0)' : 'translateY(100%)',
      transition: 'transform 0.4s cubic-bezier(0.4,0,0.2,1)',
      background: 'var(--midnight)',
      borderTop: '2px solid var(--brand)',
      boxShadow: '0 -8px 40px rgba(0,0,0,0.35)',
    }}>
      <div style={{
        maxWidth: '1280px', margin: '0 auto',
        padding: isMobile ? '28px 18px 32px' : '32px 40px',
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        alignItems: isMobile ? 'stretch' : 'center',
        gap: isMobile ? '20px' : '40px',
      }}>

        {/* Icon + Text */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, flex: 1 }}>
          <span style={{ fontSize: 36, flexShrink: 0, marginTop: 2 }}>🍪</span>
          <div>
            <p style={{
              fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 17,
              color: '#fff', margin: '0 0 8px',
            }}>
              We use cookies
            </p>
            <p style={{
              fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 14,
              color: 'rgba(255,255,255,0.52)', lineHeight: 1.7, margin: 0,
            }}>
              We use cookies to personalise content, analyse our traffic, and improve your experience. By clicking{' '}
              <strong style={{ color: 'rgba(255,255,255,0.8)', fontWeight: 600 }}>Accept All</strong>, you consent to our use of cookies.{' '}
              <Link to="/privacy-policy" style={{ color: 'var(--gold)', textDecoration: 'underline', fontWeight: 500 }}>
                Learn more
              </Link>
            </p>
          </div>
        </div>

        {/* Actions */}
        <div style={{
          display: 'flex', gap: 10,
          flexShrink: 0,
          flexDirection: isMobile ? 'column' : 'row',
        }}>
          <button onClick={decline} style={{
            fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 13,
            color: 'rgba(255,255,255,0.55)',
            background: 'transparent',
            border: '1px solid rgba(255,255,255,0.15)',
            borderRadius: 7, padding: '13px 28px',
            cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.4)'; e.currentTarget.style.color = '#fff'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; }}
          >
            Decline
          </button>

          <button onClick={accept} style={{
            fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13,
            color: '#fff',
            background: 'var(--brand)',
            border: '1px solid transparent',
            borderRadius: 7, padding: '13px 36px',
            cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
            boxShadow: '0 2px 12px rgba(228,61,48,0.35)',
          }}
            onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-dark)'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(228,61,48,0.5)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'var(--brand)'; e.currentTarget.style.boxShadow = '0 2px 12px rgba(228,61,48,0.35)'; }}
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}
