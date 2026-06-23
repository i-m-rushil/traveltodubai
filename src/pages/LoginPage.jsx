import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useIsMobile } from '../hooks/useIsMobile';
import { signInWithProfile } from '../lib/supabase';

export default function LoginPage() {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [focused, setFocused] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Sign In | Travel to Dubai';
    return () => { document.title = 'Travel to Dubai | Top Attractions, Activities & Travel Guide'; };
  }, []);

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    if (error) setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const { data, error: authError } = await signInWithProfile(form.email.trim(), form.password);
    setLoading(false);
    if (authError || !data?.profile) {
      setError('Invalid email or password. Please try again.');
      return;
    }
    const { profile } = data;
    if (profile.role !== 'admin' && profile.role !== 'publisher') {
      setError('This account does not have dashboard access.');
      return;
    }
    localStorage.setItem('ttd_auth', JSON.stringify({
      role: profile.role,
      name: profile.name,
      email: profile.email,
      id: profile.id,
    }));
    navigate(profile.role === 'admin' ? '/admin' : '/dashboard');
  }

  const field = (name, label, type = 'text', placeholder = '') => {
    const isFocused = focused === name;
    return (
      <div style={{ marginBottom: 22 }}>
        <label style={{
          display: 'block', fontFamily: 'var(--font-ui)', fontWeight: 600,
          fontSize: 12, color: 'var(--text-dark)', marginBottom: 7, letterSpacing: '0.3px',
        }}>
          {label}
        </label>
        <div style={{ position: 'relative' }}>
          <input
            name={name}
            type={type === 'password' ? (showPw ? 'text' : 'password') : type}
            placeholder={placeholder}
            value={form[name]}
            onChange={handleChange}
            onFocus={() => setFocused(name)}
            onBlur={() => setFocused(null)}
            required
            style={{
              width: '100%', boxSizing: 'border-box',
              padding: type === 'password' ? '14px 48px 14px 16px' : '14px 16px',
              fontFamily: 'var(--font-body)', fontSize: 14,
              color: 'var(--text-dark)',
              background: isFocused ? '#fff' : '#fafafa',
              border: `1.5px solid ${isFocused ? 'var(--brand)' : 'var(--border)'}`,
              borderRadius: 10, outline: 'none',
              transition: 'border-color 0.18s, background 0.18s, box-shadow 0.18s',
              boxShadow: isFocused ? '0 0 0 3px rgba(228,61,48,0.1)' : 'none',
            }}
          />
          {type === 'password' && (
            <button type="button" onClick={() => setShowPw(s => !s)} style={{
              position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer',
              color: 'var(--text-light)', padding: 0, display: 'flex', alignItems: 'center',
            }}>
              {showPw ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden', background: '#fff' }}>

      {/* ── Left: Image panel ── */}
      {!isMobile && (
        <div style={{ flex: '0 0 52%', position: 'relative', overflow: 'hidden' }}>
          <img
            src="https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=1400&q=90&fit=crop"
            alt="Dubai skyline"
            loading="lazy"
            decoding="async"
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
          />
          <div style={{
            position: 'absolute', inset: 0,
            background: 'linear-gradient(160deg, rgba(13,21,36,0.55) 0%, rgba(13,21,36,0.3) 50%, rgba(201,160,80,0.18) 100%)',
          }} />
          <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: '40px 48px' }}>
            <Link to="/" style={{ display: 'inline-block' }}>
              <img src="/Travel-to-Dubai-Logo.svg" alt="Travel to Dubai" loading="lazy" decoding="async"
                style={{ height: 64, width: 'auto', filter: 'brightness(0) invert(1)' }} />
            </Link>
            <div>
              <div style={{ width: 40, height: 3, background: 'var(--brand)', borderRadius: 2, marginBottom: 20 }} />
              <h2 style={{
                fontFamily: 'var(--font-headline)', fontWeight: 900, fontSize: 42,
                color: '#fff', lineHeight: 1.15, margin: '0 0 14px', letterSpacing: '-0.02em',
                textShadow: '0 2px 24px rgba(0,0,0,0.4)',
              }}>
                Discover<br />the Heart of Dubai
              </h2>
              <p style={{
                fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 15,
                color: 'rgba(255,255,255,0.68)', lineHeight: 1.7, maxWidth: 340, margin: 0,
              }}>
                Save your favourite spots, get personalised itineraries and unlock exclusive travel deals.
              </p>
              <div style={{ display: 'flex', gap: 16, marginTop: 32, flexWrap: 'wrap' }}>
                {['200K+ Travellers', 'Expert Guides', 'Updated Daily'].map(b => (
                  <div key={b} style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    background: 'rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255,255,255,0.15)',
                    borderRadius: 30, padding: '6px 14px',
                  }}>
                    <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--gold)', flexShrink: 0 }} />
                    <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 11, color: '#fff', whiteSpace: 'nowrap' }}>{b}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Right: Form panel ── */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', background: '#fff' }}>
        {isMobile && (
          <div style={{ padding: '24px 28px 0', borderBottom: '1px solid var(--border)' }}>
            <Link to="/"><img src="/Travel-to-Dubai-Logo.svg" alt="Travel to Dubai" loading="lazy" decoding="async" style={{ height: 48, width: 'auto' }} /></Link>
          </div>
        )}

        <div style={{
          flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: isMobile ? '32px 24px 48px' : '40px 64px',
        }}>
          <div style={{ width: '100%', maxWidth: 400 }}>

            {/* Back link */}
            <Link to="/" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontFamily: 'var(--font-ui)', fontWeight: 500, fontSize: 12,
              color: 'var(--text-light)', textDecoration: 'none', marginBottom: 40,
              transition: 'color 0.15s',
            }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--brand)'}
              onMouseLeave={e => e.currentTarget.style.color = 'var(--text-light)'}
            >
              <BackArrow /> Back to site
            </Link>

            {/* Heading */}
            <div style={{ marginBottom: 36 }}>
              <div style={{ width: 32, height: 3, background: 'var(--brand)', borderRadius: 2, marginBottom: 16 }} />
              <h1 style={{
                fontFamily: 'var(--font-headline)', fontWeight: 900, fontSize: 32,
                color: 'var(--text-dark)', margin: '0 0 8px', letterSpacing: '-0.02em',
              }}>
                Welcome back
              </h1>
              <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: 14, color: 'var(--text-mid)', margin: 0 }}>
                Sign in to your Travel to Dubai account.
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit}>
              {field('email', 'Email Address', 'email', 'you@example.com')}
              {field('password', 'Password', 'password', '••••••••')}

              <div style={{ textAlign: 'right', marginTop: -10, marginBottom: 28 }}>
                <a href="#" style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 12, color: 'var(--brand)', textDecoration: 'none' }}>
                  Forgot password?
                </a>
              </div>

              {error && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  background: 'rgba(228,61,48,0.07)', border: '1px solid rgba(228,61,48,0.25)',
                  borderRadius: 8, padding: '10px 14px', marginBottom: 20,
                }}>
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, color: 'var(--brand)', fontWeight: 500 }}>{error}</span>
                </div>
              )}

              <button type="submit" disabled={loading} style={{
                width: '100%', padding: '15px',
                fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 14,
                color: '#fff', background: 'var(--brand)',
                opacity: loading ? 0.7 : 1,
                border: 'none', borderRadius: 10, cursor: loading ? 'default' : 'pointer',
                boxShadow: '0 4px 18px rgba(228,61,48,0.35)',
                transition: 'background 0.18s, box-shadow 0.18s, transform 0.15s',
                letterSpacing: '0.3px',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-dark)'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 6px 22px rgba(228,61,48,0.45)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--brand)'; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 18px rgba(228,61,48,0.35)'; }}
              >
                {loading ? 'Signing in…' : 'Sign In →'}
              </button>
            </form>

            {/* Terms note */}
            <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-light)', textAlign: 'center', marginTop: 32, lineHeight: 1.6 }}>
              By signing in you agree to our{' '}
              <Link to="/terms" style={{ color: 'var(--text-mid)', textDecoration: 'underline' }}>Terms</Link>
              {' '}and{' '}
              <Link to="/privacy-policy" style={{ color: 'var(--text-mid)', textDecoration: 'underline' }}>Privacy Policy</Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BackArrow() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>;
}
function EyeIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>;
}
function EyeOffIcon() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>;
}
