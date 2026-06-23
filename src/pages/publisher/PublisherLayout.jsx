import { useState, useEffect, useRef } from 'react'
import { useNavigate, Link, useLocation, Outlet, useParams } from 'react-router-dom'
import { useIsMobile } from '../../hooks/useIsMobile'
import { getSession, signOut } from '../../lib/supabase'

// ─── Page title helper ─────────────────────────────────────────────────────
function getPageTitle(pathname) {
  if (pathname === '/dashboard' || pathname === '/dashboard/') return 'Overview'
  if (pathname.startsWith('/dashboard/posts')) return 'My Posts'
  if (pathname.startsWith('/dashboard/compose')) return 'New Post'
  if (pathname.startsWith('/dashboard/advertisers')) return 'Advertisers'
  if (pathname.startsWith('/dashboard/profile')) return 'Profile'
  return 'Dashboard'
}

// ─── Nav items config ──────────────────────────────────────────────────────
const NAV_ITEMS = [
  { path: '/dashboard', label: 'Overview', exact: true, Icon: HomeIcon, cta: false },
  { path: '/dashboard/posts', label: 'My Posts', exact: false, Icon: DocumentIcon, cta: false },
  { path: '/dashboard/advertisers', label: 'Advertisers', exact: false, Icon: MegaphoneIcon, cta: false },
  { path: '/dashboard/profile', label: 'Profile', exact: false, Icon: UserIcon, cta: false },
]

// ─── Sidebar ───────────────────────────────────────────────────────────────
function Sidebar({ auth, onLogout, open, onClose, isMobile }) {
  const location = useLocation()

  function isActive(item) {
    if (item.exact) return location.pathname === item.path || location.pathname === item.path + '/'
    return location.pathname.startsWith(item.path)
  }

  const sidebarStyle = {
    width: 240,
    minWidth: 240,
    background: '#0f172a',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    fontFamily: 'var(--font-ui)',
    flexShrink: 0,
    ...(isMobile
      ? {
          position: 'fixed',
          top: 0,
          left: 0,
          zIndex: 1000,
          transform: open ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease',
          boxShadow: open ? '4px 0 32px rgba(0,0,0,0.4)' : 'none',
        }
      : {}),
  }

  return (
    <>
      {isMobile && open && (
        <div
          onClick={onClose}
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 999,
            background: 'rgba(0,0,0,0.5)',
          }}
        />
      )}

      <aside style={sidebarStyle}>
        {/* Logo area */}
        <div
          style={{
            padding: '24px 16px 18px',
            borderBottom: '1px solid rgba(255,255,255,0.06)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          {isMobile && (
            <button
              onClick={onClose}
              style={{
                display: 'flex',
                alignSelf: 'flex-end',
                marginBottom: 12,
                background: 'none',
                border: 'none',
                color: 'rgba(255,255,255,0.5)',
                cursor: 'pointer',
                padding: 4,
              }}
              aria-label="Close sidebar"
            >
              <CloseIcon />
            </button>
          )}
          <img
            src="/Travel-to-Dubai-Logo.svg"
            alt="Travel to Dubai"
            loading="lazy"
            decoding="async"
            style={{ filter: 'brightness(0) invert(1)', display: 'block', height: 100, width: 'auto' }}
          />
          <span
            style={{
              display: 'block',
              marginTop: 8,
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: '1.5px',
              textTransform: 'uppercase',
              color: 'var(--gold)',
              fontFamily: 'var(--font-ui)',
              textAlign: 'center',
            }}
          >
            Publisher CRM
          </span>
        </div>

        {/* Nav divider label */}
        <div
          style={{
            padding: '20px 20px 8px',
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: '1.5px',
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.3)',
            fontFamily: 'var(--font-ui)',
          }}
        >
          Navigation
        </div>

        {/* Nav items */}
        <nav style={{ flex: 1, padding: '0 0 8px' }}>
          {NAV_ITEMS.map(({ path, label, Icon, cta, exact }) => {
            const active = isActive({ path, exact: exact })
            if (cta) {
              return (
                <Link
                  key={path}
                  to={path}
                  onClick={isMobile ? onClose : undefined}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '11px 20px',
                    color: active ? 'var(--brand)' : 'var(--brand)',
                    textDecoration: 'none',
                    background: active
                      ? 'rgba(228,61,48,0.22)'
                      : 'rgba(228,61,48,0.15)',
                    borderLeft: active ? '3px solid var(--brand)' : '3px solid transparent',
                    transition: 'all 0.15s',
                    fontFamily: 'var(--font-ui)',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: 'pointer',
                    margin: '4px 12px',
                    borderRadius: 8,
                  }}
                >
                  <Icon />
                  {label}
                </Link>
              )
            }
            return (
              <Link
                key={path}
                to={path}
                onClick={isMobile ? onClose : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '11px 20px',
                  color: active ? '#fff' : 'rgba(255,255,255,0.6)',
                  textDecoration: 'none',
                  borderLeft: active ? '3px solid var(--brand)' : '3px solid transparent',
                  background: active ? 'rgba(228,61,48,0.08)' : 'transparent',
                  transition: 'all 0.15s',
                  fontFamily: 'var(--font-ui)',
                  fontSize: 13,
                  fontWeight: active ? 600 : 400,
                  cursor: 'pointer',
                }}
              >
                <Icon />
                {label}
              </Link>
            )
          })}
        </nav>

        {/* Bottom user card + logout */}
        <div
          style={{
            marginTop: 'auto',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            padding: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              marginBottom: 12,
            }}
          >
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                background: 'var(--gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 700,
                color: '#fff',
                fontFamily: 'var(--font-ui)',
                flexShrink: 0,
              }}
            >
              {auth
                ? auth.name
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .slice(0, 2)
                : 'PB'}
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: '#fff',
                  fontFamily: 'var(--font-ui)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {auth?.name || 'Publisher'}
              </div>
              <div
                style={{
                  fontSize: 10,
                  color: 'rgba(255,255,255,0.45)',
                  fontFamily: 'var(--font-ui)',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {auth?.email || ''}
              </div>
            </div>
          </div>

          <button
            onClick={onLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              width: '100%',
              height: 40,
              background: 'rgba(255,255,255,0.06)',
              border: '1px solid rgba(255,255,255,0.1)',
              borderRadius: 8,
              color: 'rgba(255,255,255,0.7)',
              cursor: 'pointer',
              fontFamily: 'var(--font-ui)',
              fontSize: 13,
              fontWeight: 500,
              transition: 'all 0.15s',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.1)'
              e.currentTarget.style.color = '#fff'
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
              e.currentTarget.style.color = 'rgba(255,255,255,0.7)'
            }}
          >
            <LogoutIcon />
            Logout
          </button>
        </div>
      </aside>
    </>
  )
}

// ─── Top Bar ───────────────────────────────────────────────────────────────
function TopBar({ auth, pageTitle, onHamburger, isMobile }) {
  return (
    <header
      style={{
        height: 56,
        background: '#fff',
        borderBottom: '1px solid #e2e8f0',
        padding: '0 28px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexShrink: 0,
        gap: 12,
        fontFamily: 'var(--font-ui)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        {isMobile && (
          <button
            onClick={onHamburger}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 36,
              height: 36,
              background: 'none',
              border: '1px solid #e2e8f0',
              borderRadius: 8,
              color: 'var(--text-dark)',
              cursor: 'pointer',
            }}
            aria-label="Open menu"
          >
            <MenuIcon />
          </button>
        )}
        <h1
          style={{
            margin: 0,
            fontSize: 16,
            fontWeight: 600,
            color: 'var(--text-dark)',
            fontFamily: 'var(--font-ui)',
          }}
        >
          {pageTitle}
        </h1>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: 36,
            height: 36,
            background: 'none',
            border: '1px solid #e2e8f0',
            borderRadius: 8,
            color: 'var(--text-mid)',
            cursor: 'pointer',
            position: 'relative',
          }}
          aria-label="Notifications"
        >
          <BellIcon />
          <span
            style={{
              position: 'absolute',
              top: 8,
              right: 8,
              width: 7,
              height: 7,
              borderRadius: '50%',
              background: 'var(--brand)',
              border: '1.5px solid #fff',
            }}
          />
        </button>

        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: '50%',
            background: 'var(--gold)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 13,
            fontWeight: 700,
            color: '#fff',
            fontFamily: 'var(--font-ui)',
            cursor: 'default',
            flexShrink: 0,
          }}
        >
          {auth
            ? auth.name
                .split(' ')
                .map((n) => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 2)
            : 'PB'}
        </div>
      </div>
    </header>
  )
}

// ─── Publisher Layout ──────────────────────────────────────────────────────
export default function PublisherLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const isMobile = useIsMobile()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [auth, setAuth] = useState(null)

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('ttd_auth') || 'null')
    if (!stored || stored.role !== 'publisher') {
      navigate('/login')
      return
    }
    // The dashboard talks to Supabase, so a live session is required too
    getSession().then(session => {
      if (!session) {
        localStorage.removeItem('ttd_auth')
        navigate('/login')
        return
      }
      setAuth(stored)
    })
  }, [navigate])

  function handleLogout() {
    signOut()
    localStorage.removeItem('ttd_auth')
    navigate('/login')
  }

  const pageTitle = getPageTitle(location.pathname)

  useEffect(() => {
    if (isMobile) setSidebarOpen(false)
  }, [location.pathname, isMobile])

  return (
    <div
      style={{
        display: 'flex',
        height: '100vh',
        overflow: 'hidden',
        fontFamily: 'var(--font-ui)',
      }}
    >
      {!isMobile && (
        <Sidebar
          auth={auth}
          onLogout={handleLogout}
          open={true}
          onClose={() => setSidebarOpen(false)}
          isMobile={false}
        />
      )}
      {isMobile && (
        <Sidebar
          auth={auth}
          onLogout={handleLogout}
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          isMobile={true}
        />
      )}

      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          minWidth: 0,
        }}
      >
        <TopBar
          auth={auth}
          pageTitle={pageTitle}
          onHamburger={() => setSidebarOpen(true)}
          isMobile={isMobile}
        />
        <main
          style={{
            flex: 1,
            overflowY: 'auto',
            background: '#f1f5f9',
            padding: isMobile ? '16px' : '28px',
          }}
        >
          <Outlet />
        </main>
      </div>
    </div>
  )
}

// ─── SVG Icon Components ───────────────────────────────────────────────────

function MegaphoneIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11l19-9-9 19-2-8-8-2z"/>
    </svg>
  )
}

function HomeIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 9.5L12 3l9 6.5V20a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V9.5z" />
      <polyline points="9 21 9 12 15 12 15 21" />
    </svg>
  )
}

function DocumentIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
      <polyline points="10 9 9 9 8 9" />
    </svg>
  )
}

function PencilIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

function UserIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  )
}

function BellIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  )
}

function LogoutIcon() {
  return (
    <svg
      width={16}
      height={16}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  )
}

function MenuIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  )
}

function CloseIcon() {
  return (
    <svg
      width={18}
      height={18}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  )
}
