import { useState, useEffect } from 'react';
import { useIsMobile } from '../hooks/useIsMobile';

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&display=swap');
  @keyframes nl-backdrop { from { opacity:0; } to { opacity:1; } }
  @keyframes nl-enter {
    from { opacity:0; transform: translateY(24px) scale(0.97); }
    to   { opacity:1; transform: translateY(0) scale(1); }
  }
  @keyframes nl-success { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes nl-check   { from { stroke-dashoffset:1; } to { stroke-dashoffset:0; } }
`;

const CG = "'Cormorant Garamond', Georgia, serif";

export default function NewsletterPopup() {
  const [visible, setVisible]   = useState(false);
  const [email, setEmail]       = useState('');
  const [focused, setFocused]   = useState(false);
  const [btnHover, setBtnHover] = useState(false);
  const [done, setDone]         = useState(false);
  const isMobile = useIsMobile();

  useEffect(() => {
    const s = document.createElement('style');
    s.id = 'nl-styles';
    s.textContent = STYLES;
    document.head.appendChild(s);
    return () => document.getElementById('nl-styles')?.remove();
  }, []);

  useEffect(() => {
    if (localStorage.getItem('ttd_nl_seen')) return;
    const t = setTimeout(() => setVisible(true), 4000);
    return () => clearTimeout(t);
  }, []);

  const dismiss = () => {
    setVisible(false);
    localStorage.setItem('ttd_nl_seen', '1');
  };

  const submit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setDone(true);
    setTimeout(dismiss, 3000);
  };

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={dismiss}
        style={{
          position: 'fixed', inset: 0, zIndex: 9998,
          background: 'rgba(29,37,44,0.55)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          animation: 'nl-backdrop 0.3s ease forwards',
        }}
      />

      {/* Center shell */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: isMobile ? '16px' : '24px',
        pointerEvents: 'none',
      }}>

        {/* Card */}
        <div style={{
          width: '100%',
          maxWidth: isMobile ? '420px' : '860px',
          background: '#fff',
          borderRadius: isMobile ? '20px' : '24px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          boxShadow: '0 32px 80px rgba(29,37,44,0.22), 0 0 0 1px rgba(29,37,44,0.06)',
          animation: 'nl-enter 0.42s cubic-bezier(0.16,1,0.3,1) forwards',
          pointerEvents: 'auto',
          maxHeight: 'calc(100dvh - 32px)',
          overflowY: 'auto',
          position: 'relative',
        }}>

          {/* Close button */}
          <button
            onClick={dismiss}
            aria-label="Close"
            style={{
              position: 'absolute', top: '14px', right: '14px', zIndex: 10,
              width: '32px', height: '32px',
              background: 'rgba(29,37,44,0.07)',
              border: '1px solid rgba(29,37,44,0.1)',
              borderRadius: '50%',
              color: 'var(--text-mid)',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.18s',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'var(--brand)';
              e.currentTarget.style.borderColor = 'var(--brand)';
              e.currentTarget.style.color = '#fff';
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(29,37,44,0.07)';
              e.currentTarget.style.borderColor = 'rgba(29,37,44,0.1)';
              e.currentTarget.style.color = 'var(--text-mid)';
            }}
          >
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
              stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
              <line x1="1" y1="1" x2="9" y2="9" /><line x1="9" y1="1" x2="1" y2="9" />
            </svg>
          </button>

          {/* ════ LEFT — Image ════ */}
          <div style={{
            flex: isMobile ? 'none' : '0 0 46%',
            position: 'relative',
            minHeight: isMobile ? '220px' : '0',
            overflow: 'hidden',
            borderRadius: isMobile ? '0' : '0',
          }}>
            <img
              src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=800&q=85&fit=crop"
              alt="Dubai skyline"
              loading="lazy"
              decoding="async"
              style={{
                width: '100%', height: '100%',
                objectFit: 'cover',
                display: 'block',
                minHeight: isMobile ? '220px' : '100%',
              }}
            />
            {/* Subtle bottom fade on mobile so it blends into white */}
            {isMobile && (
              <div style={{
                position: 'absolute', bottom: 0, left: 0, right: 0,
                height: '60px',
                background: 'linear-gradient(to top, #fff, transparent)',
                pointerEvents: 'none',
              }} />
            )}
            {/* Brand badge on image */}
            <div style={{
              position: 'absolute', top: '16px', left: '16px',
              background: 'var(--brand)',
              color: '#fff',
              fontFamily: 'var(--font-ui)', fontWeight: 700,
              fontSize: '9px', letterSpacing: '2.5px',
              textTransform: 'uppercase',
              padding: '5px 11px',
              borderRadius: '20px',
              display: 'flex', alignItems: 'center', gap: '5px',
            }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.2"
                strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 2L11 13M22 2L15 22l-4-9-9-4 19-7z" />
              </svg>
              Dubai Insider
            </div>
          </div>

          {/* ════ RIGHT — Form ════ */}
          <div style={{
            flex: 1,
            padding: isMobile ? '24px 24px 32px' : '52px 44px 48px',
            background: '#fff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}>

            {!done ? (
              <>
                {/* Headline */}
                <h2 style={{
                  fontFamily: CG,
                  fontWeight: 700,
                  fontSize: isMobile ? '26px' : '34px',
                  lineHeight: 1.15,
                  color: 'var(--text-dark)',
                  letterSpacing: '-0.3px',
                  marginBottom: '14px',
                  paddingRight: isMobile ? '32px' : '36px',
                }}>
                  Discover the best of{' '}
                  <span style={{ color: 'var(--brand)' }}>Dubai</span>{' '}
                  with us
                </h2>

                {/* Body */}
                <p style={{
                  fontFamily: 'var(--font-body)', fontWeight: 400,
                  fontSize: '13.5px', color: 'var(--text-mid)',
                  lineHeight: 1.75,
                  marginBottom: isMobile ? '22px' : '28px',
                  maxWidth: '340px',
                }}>
                  Sign up for the{' '}
                  <span style={{
                    color: 'var(--brand)', fontWeight: 600,
                  }}>Travel to Dubai</span>{' '}
                  newsletter to get exclusive travel tips, stunning city guides and special offers tailored for your next adventure.
                </p>

                {/* Mobile social proof */}
                {isMobile && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '8px',
                    marginBottom: '18px',
                  }}>
                    <div style={{ display: 'flex', gap: '-4px' }}>
                      {['#e43d30','#C9A050','#0891b2'].map((c, i) => (
                        <div key={i} style={{
                          width: '22px', height: '22px', borderRadius: '50%',
                          background: c, border: '2px solid #fff',
                          marginLeft: i > 0 ? '-6px' : '0',
                          flexShrink: 0,
                        }} />
                      ))}
                    </div>
                    <span style={{
                      fontFamily: 'var(--font-ui)', fontSize: '11.5px',
                      color: 'var(--text-light)', fontWeight: 500,
                    }}>
                      84,000+ subscribers
                    </span>
                  </div>
                )}

                {/* Form */}
                <form onSubmit={submit} style={{ width: '100%' }}>

                  {/* Label */}
                  <label style={{
                    fontFamily: 'var(--font-ui)', fontWeight: 600,
                    fontSize: '12px', color: 'var(--text-dark)',
                    display: 'block', marginBottom: '7px',
                    letterSpacing: '0.2px',
                  }}>
                    Email address
                  </label>

                  {/* Input */}
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    onFocus={() => setFocused(true)}
                    onBlur={() => setFocused(false)}
                    placeholder="123@xyz.com"
                    required
                    style={{
                      width: '100%',
                      padding: '12px 14px',
                      fontFamily: 'var(--font-body)',
                      fontSize: '14px',
                      color: 'var(--text-dark)',
                      background: '#fff',
                      border: `1.5px solid ${focused ? 'var(--brand)' : 'var(--border)'}`,
                      borderRadius: '10px',
                      outline: 'none',
                      transition: 'border-color 0.2s, box-shadow 0.2s',
                      boxShadow: focused ? '0 0 0 3px rgba(177,19,47,0.1)' : 'none',
                      marginBottom: '12px',
                      display: 'block',
                    }}
                  />

                  {/* Button */}
                  <button
                    type="submit"
                    onMouseEnter={() => setBtnHover(true)}
                    onMouseLeave={() => setBtnHover(false)}
                    style={{
                      width: '100%',
                      padding: '13px 20px',
                      background: btnHover ? 'var(--brand-dark)' : 'var(--brand)',
                      color: '#fff',
                      fontFamily: 'var(--font-ui)', fontWeight: 700,
                      fontSize: '13.5px', letterSpacing: '0.2px',
                      border: 'none', borderRadius: '10px',
                      cursor: 'pointer',
                      transition: 'background 0.18s, box-shadow 0.18s, transform 0.18s',
                      transform: btnHover ? 'translateY(-1px)' : 'translateY(0)',
                      boxShadow: btnHover
                        ? '0 8px 24px rgba(177,19,47,0.35)'
                        : '0 2px 10px rgba(177,19,47,0.2)',
                    }}
                  >
                    Subscribe to weekly newsletter
                  </button>
                </form>

                {/* Footer */}
                <p style={{
                  fontFamily: 'var(--font-ui)', fontSize: '11px',
                  color: 'var(--text-light)',
                  marginTop: '12px',
                }}>
                  No spam. Unsubscribe any time.
                </p>

                {/* Desktop stats */}
                {!isMobile && (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '20px',
                    marginTop: '24px', paddingTop: '20px',
                    borderTop: '1px solid var(--border)',
                  }}>
                    {/* Avatar stack */}
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {['#b1132f','#C9A050','#0891b2','#059669'].map((c, i) => (
                        <div key={i} style={{
                          width: '26px', height: '26px', borderRadius: '50%',
                          background: c, border: '2px solid #fff',
                          marginLeft: i > 0 ? '-8px' : '0',
                          flexShrink: 0,
                        }} />
                      ))}
                    </div>
                    <p style={{
                      fontFamily: 'var(--font-ui)', fontSize: '12px',
                      color: 'var(--text-mid)', lineHeight: 1.5,
                    }}>
                      <strong style={{ color: 'var(--text-dark)', fontWeight: 700 }}>
                        84,000+
                      </strong>{' '}
                      Dubai travellers already get<br />our weekly insider tips.
                    </p>
                  </div>
                )}
              </>
            ) : (
              /* Success state */
              <div style={{
                display: 'flex', flexDirection: 'column',
                alignItems: 'center', justifyContent: 'center',
                minHeight: isMobile ? '180px' : '300px',
                textAlign: 'center',
                animation: 'nl-success 0.45s cubic-bezier(0.16,1,0.3,1) forwards',
              }}>
                {/* Check circle */}
                <div style={{
                  width: '64px', height: '64px', borderRadius: '50%',
                  background: 'rgba(177,19,47,0.08)',
                  border: '1.5px solid rgba(177,19,47,0.25)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  marginBottom: '18px',
                }}>
                  <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                    <path d="M6 14L11 20L22 8"
                      stroke="var(--brand)" strokeWidth="2.5"
                      strokeLinecap="round" strokeLinejoin="round"
                      pathLength="1" strokeDasharray="1" strokeDashoffset="1"
                      style={{ animation: 'nl-check 0.5s 0.1s cubic-bezier(0.16,1,0.3,1) forwards' }}
                    />
                  </svg>
                </div>

                <h3 style={{
                  fontFamily: CG, fontWeight: 700,
                  fontSize: isMobile ? '24px' : '30px',
                  color: 'var(--text-dark)', lineHeight: 1.2,
                  marginBottom: '10px', letterSpacing: '-0.2px',
                }}>
                  You're in!<br />
                  <span style={{ color: 'var(--brand)' }}>Welcome aboard.</span>
                </h3>

                <p style={{
                  fontFamily: 'var(--font-body)', fontSize: '13px',
                  color: 'var(--text-mid)', lineHeight: 1.75,
                  maxWidth: '260px',
                }}>
                  Your first issue arrives this Friday — the best of Dubai, straight to your inbox.
                </p>
              </div>
            )}
          </div>

        </div>
      </div>
    </>
  );
}
