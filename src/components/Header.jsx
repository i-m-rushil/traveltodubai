import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { navLinks } from '../data/mockData';
import { useIsMobile } from '../hooks/useIsMobile';

export default function Header() {
  const [scrolled, setScrolled]     = useState(false);
  const [activeMenu, setActiveMenu] = useState(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen]     = useState(false);
  const isMobile = useIsMobile();
  const closeTimer = useRef(null);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close mega menu and mobile drawer on any route change
  useEffect(() => {
    clearTimeout(closeTimer.current);
    setActiveMenu(null);
    setMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => { if (!isMobile) setMenuOpen(false); }, [isMobile]);
  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  function openMenu(label) {
    clearTimeout(closeTimer.current);
    setActiveMenu(label);
  }
  function scheduleClose() {
    closeTimer.current = setTimeout(() => setActiveMenu(null), 140);
  }
  function cancelClose() {
    clearTimeout(closeTimer.current);
  }

  const activeLink = activeMenu ? navLinks.find(l => l.label === activeMenu) : null;

  return (
    <>
      <header style={{
        background: scrolled ? 'rgba(250,246,237,0.96)' : '#fff',
        backdropFilter: scrolled ? 'blur(12px)' : 'none',
        borderBottom: '2px solid var(--brand)',
        position: 'sticky', top: 0, zIndex: 100,
        boxShadow: scrolled ? '0 4px 24px rgba(26,21,16,0.1)' : '0 1px 0 var(--border)',
        transition: 'box-shadow 0.3s, background 0.3s',
      }}>

        {/* ── Main bar ── */}
        <div style={{
          maxWidth: '1280px', margin: '0 auto',
          padding: isMobile ? '0 16px' : '0 24px',
          display: 'flex', alignItems: 'center',
          justifyContent: 'space-between',
          height: isMobile ? '60px' : '72px',
          gap: '32px',
        }}>

          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
            <img src="/Travel-to-Dubai-Logo.svg" alt="Travel to Dubai"
              style={{ height: isMobile ? '46px' : '80px', width: 'auto', display: 'block' }} />
          </Link>

          {/* Desktop nav */}
          {!isMobile && (
            <nav style={{ display: 'flex', alignItems: 'center', gap: '2px', flex: 1, justifyContent: 'center' }}>
              {navLinks.map(link => (
                <div key={link.label}
                  onMouseEnter={() => openMenu(link.label)}
                  onMouseLeave={scheduleClose}
                >
                  <Link to={`/category/${link.slug}`} onClick={() => setActiveMenu(null)} style={{
                    fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '13px',
                    letterSpacing: '0.3px',
                    color: activeMenu === link.label ? 'var(--brand)' : 'var(--text-dark)',
                    padding: '8px 14px',
                    display: 'flex', alignItems: 'center', gap: '4px',
                    borderRadius: '4px',
                    background: activeMenu === link.label ? 'rgba(228,61,48,0.06)' : 'transparent',
                    transition: 'all 0.2s', whiteSpace: 'nowrap', textDecoration: 'none',
                  }}>
                    {link.label}
                    <ChevDown active={activeMenu === link.label} />
                  </Link>
                </div>
              ))}
            </nav>
          )}

          {/* Desktop actions */}
          {!isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0 }}>
              <button onClick={() => setSearchOpen(s => !s)} aria-label="Search" style={{
                width: '38px', height: '38px', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-mid)', background: searchOpen ? 'var(--sand)' : 'transparent',
                transition: 'all 0.2s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--sand)'}
                onMouseLeave={e => !searchOpen && (e.currentTarget.style.background = 'transparent')}
              >
                <SearchIco />
              </button>
              <a href="#" style={{
                background: 'var(--brand)', color: '#fff',
                fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '12px',
                letterSpacing: '0.5px', padding: '9px 20px', borderRadius: '6px',
                display: 'flex', alignItems: 'center', gap: '6px',
                whiteSpace: 'nowrap', transition: 'all 0.2s', textDecoration: 'none',
                boxShadow: '0 2px 8px rgba(177,19,47,0.25)',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand-dark)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'var(--brand)'; e.currentTarget.style.transform = 'none'; }}
              >
                Plan Trip ✈
              </a>
            </div>
          )}

          {/* Mobile actions */}
          {isMobile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <button onClick={() => setSearchOpen(s => !s)} aria-label="Search" style={{
                width: '40px', height: '40px', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-mid)', background: 'transparent',
              }}>
                <SearchIco />
              </button>
              <button onClick={() => setMenuOpen(s => !s)} aria-label="Toggle menu" style={{
                width: '40px', height: '40px', borderRadius: '8px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--text-dark)', background: 'transparent',
              }}>
                {menuOpen ? <CloseIco /> : <HamburgerIco />}
              </button>
            </div>
          )}
        </div>

        {/* Search bar */}
        {searchOpen && (
          <div style={{ background: 'var(--midnight)', padding: '14px 24px', borderTop: '1px solid rgba(201,160,80,0.15)' }}>
            <div style={{ maxWidth: '640px', margin: '0 auto', display: 'flex', gap: '8px' }}>
              <input autoFocus type="text" placeholder="Search Dubai attractions, guides, events..."
                style={{
                  flex: 1, padding: '11px 18px',
                  fontFamily: 'var(--font-body)', fontSize: '14px',
                  border: '1px solid rgba(201,160,80,0.3)', borderRadius: '6px',
                  background: 'rgba(255,255,255,0.07)', color: '#fff', outline: 'none',
                }}
              />
              <button style={{
                background: 'var(--brand)', color: '#fff',
                fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '13px',
                padding: '11px 22px', borderRadius: '6px', cursor: 'pointer',
              }}>Search</button>
              <button onClick={() => setSearchOpen(false)} style={{
                width: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'rgba(255,255,255,0.5)', borderRadius: '6px',
              }}><CloseIco /></button>
            </div>
          </div>
        )}

        {/* ── Mega Menu ── */}
        {!isMobile && activeLink && activeLink.sub.length > 0 && (
          <div
            onMouseEnter={cancelClose}
            onMouseLeave={scheduleClose}
            style={{
              position: 'absolute', top: '100%', left: 0, right: 0,
              background: '#fff',
              borderTop: '3px solid var(--brand)',
              boxShadow: '0 20px 60px rgba(0,0,0,0.18)',
              zIndex: 200,
              animation: 'megaIn 0.18s ease',
            }}
          >
            <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '24px 24px 28px' }}>

              {/* Category header row */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{ width: 3, height: 20, background: 'var(--brand)', borderRadius: 2, display: 'inline-block', flexShrink: 0 }} />
                  <span style={{ fontFamily: 'var(--font-ui)', fontSize: 16, fontWeight: 700, color: 'var(--text-dark)', letterSpacing: '-0.01em' }}>
                    {activeMenu}
                  </span>
                </div>
                <Link
                  to={`/category/${activeLink.slug}`}
                  onClick={() => setActiveMenu(null)}
                  style={{
                    fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600,
                    color: 'var(--brand)', textDecoration: 'none',
                    display: 'flex', alignItems: 'center', gap: 4,
                    padding: '6px 12px', borderRadius: 6,
                    border: '1px solid rgba(228,61,48,0.2)',
                    transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(228,61,48,0.06)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; }}
                >
                  View all <ArrowRight />
                </Link>
              </div>

              {/* Items grid */}
              <div style={{
                display: 'grid',
                gridTemplateColumns: `repeat(${activeLink.cols || 4}, 1fr)`,
                gap: '14px',
              }}>
                {activeLink.sub.map(item => (
                  <MegaItem
                    key={item.label}
                    item={item}
                    to={`/category/${activeLink.slug}`}
                    onClose={() => setActiveMenu(null)}
                  />
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Mega menu backdrop */}
      {!isMobile && activeMenu && (
        <div
          onClick={() => setActiveMenu(null)}
          style={{
            position: 'fixed', inset: 0, top: '75px',
            zIndex: 99, background: 'rgba(0,0,0,0.32)',
          }}
        />
      )}

      {/* Mobile overlay */}
      {isMobile && menuOpen && (
        <div onClick={() => setMenuOpen(false)} style={{
          position: 'fixed', inset: 0, zIndex: 999,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(3px)',
        }} />
      )}

      {/* Mobile drawer */}
      {isMobile && (
        <div style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: '82%', maxWidth: '320px',
          background: '#fff', zIndex: 1000,
          transform: menuOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4,0,0.2,1)',
          display: 'flex', flexDirection: 'column',
          boxShadow: '-8px 0 40px rgba(0,0,0,0.25)',
        }}>
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 18px', borderBottom: '2px solid var(--brand)', flexShrink: 0,
          }}>
            <img src="/Travel-to-Dubai-Logo.svg" alt="Travel to Dubai" style={{ height: '44px', width: 'auto' }} />
            <button onClick={() => setMenuOpen(false)} style={{
              width: '36px', height: '36px', borderRadius: '8px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'var(--text-mid)', background: 'var(--sand)',
            }}><CloseIco /></button>
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {navLinks.map(link => (
              <MobileNavItem key={link.label} link={link} onClose={() => setMenuOpen(false)} />
            ))}
          </div>
          <div style={{ padding: '20px', borderTop: '1px solid var(--border)', flexShrink: 0 }}>
            <a href="#" style={{
              display: 'block', textAlign: 'center',
              background: 'var(--brand)', color: '#fff',
              fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '14px',
              padding: '13px', borderRadius: '8px', textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(177,19,47,0.3)',
            }}>
              Plan My Dubai Trip ✈
            </a>
          </div>
        </div>
      )}

      <style>{`
        @keyframes megaIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* Hidden preloader — fetches all mega menu images on page load so they're cached when the menu opens */}
      <div aria-hidden="true" style={{ display: 'none' }}>
        {navLinks.flatMap(link => link.sub).map(item => (
          <img key={item.img} src={item.img} alt="" />
        ))}
      </div>
    </>
  );
}

// ── Mega menu image card ────────────────────────────────────────────────────
function MegaItem({ item, to, onClose }) {
  const [hovered, setHovered] = useState(false);
  return (
    <Link
      to={to}
      onClick={onClose}
      style={{ textDecoration: 'none', display: 'block' }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Image */}
      <div style={{
        borderRadius: '14px', overflow: 'hidden',
        paddingBottom: '66%', position: 'relative',
        background: '#e8ecf0', marginBottom: '9px',
        boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.18)' : '0 2px 8px rgba(0,0,0,0.08)',
        transition: 'box-shadow 0.3s',
      }}>
        <img
          src={item.img}
          alt={item.label}
          loading="eager"
          decoding="async"
          style={{
            position: 'absolute', inset: 0,
            width: '100%', height: '100%',
            objectFit: 'cover',
            transform: hovered ? 'scale(1.07)' : 'scale(1)',
            transition: 'transform 0.4s ease',
          }}
        />
        {/* Bottom gradient for specialty badge readability */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '50%',
          background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%)',
        }} />
        {/* Specialty landmark badge */}
        {item.specialty && (
          <div style={{
            position: 'absolute', bottom: 7, left: 7, right: 7,
            display: 'flex', alignItems: 'center', gap: 4,
          }}>
            <svg width="7" height="7" viewBox="0 0 8 8" style={{ flexShrink: 0 }}>
              <circle cx="4" cy="4" r="4" fill="var(--gold)" />
            </svg>
            <span style={{
              fontFamily: 'var(--font-ui)', fontSize: '10px', fontWeight: 600,
              color: '#fff', letterSpacing: '0.2px',
              whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
              textShadow: '0 1px 3px rgba(0,0,0,0.4)',
            }}>
              {item.specialty}
            </span>
          </div>
        )}
        {/* Brand accent line on hover */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '3px',
          background: 'var(--brand)',
          transform: hovered ? 'scaleX(1)' : 'scaleX(0)',
          transition: 'transform 0.25s ease',
          transformOrigin: 'left',
        }} />
      </div>
      {/* Label */}
      <div style={{
        fontFamily: 'var(--font-ui)', fontSize: '12px', fontWeight: 600,
        color: hovered ? 'var(--brand)' : 'var(--text-dark)',
        textAlign: 'center', lineHeight: 1.4, letterSpacing: '0.1px',
        transition: 'color 0.18s',
      }}>
        {item.label}
      </div>
    </Link>
  );
}

// ── Mobile nav item ─────────────────────────────────────────────────────────
function MobileNavItem({ link, onClose }) {
  const [open, setOpen] = useState(false);
  const hasSub = link.sub && link.sub.length > 0;

  if (!hasSub) {
    return (
      <div style={{ borderBottom: '1px solid var(--border)' }}>
        <Link to={`/category/${link.slug}`} onClick={onClose} style={{
          display: 'flex', alignItems: 'center',
          padding: '14px 20px', fontFamily: 'var(--font-ui)', fontWeight: 600,
          fontSize: '14px', color: 'var(--brand)', textDecoration: 'none',
        }}>
          {link.label}
          <span style={{ marginLeft: 'auto', fontSize: '10px', color: 'var(--text-light)' }}>→</span>
        </Link>
      </div>
    );
  }

  return (
    <div style={{ borderBottom: '1px solid var(--border)' }}>
      <button onClick={() => setOpen(s => !s)} style={{
        width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '14px 20px', fontFamily: 'var(--font-ui)', fontWeight: 600,
        fontSize: '14px', color: 'var(--text-dark)', background: 'transparent', textAlign: 'left',
      }}>
        {link.label}
        <span style={{ display: 'inline-flex', transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: 'var(--text-light)' }}>
          <ChevDown />
        </span>
      </button>
      {open && (
        <div style={{ background: 'var(--sand)' }}>
          {link.sub.map((item, i) => (
            <Link key={item.label} to={`/category/${link.slug}`} onClick={onClose} style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              padding: '11px 20px 11px 32px',
              fontFamily: 'var(--font-ui)', fontSize: '13px', color: 'var(--text-mid)',
              borderBottom: i < link.sub.length - 1 ? '1px solid rgba(0,0,0,0.06)' : 'none',
              textDecoration: 'none',
            }}>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--gold)', flexShrink: 0 }} />
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Icons ────────────────────────────────────────────────────────────────────
function ChevDown({ active }) {
  return (
    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
      style={{ transform: active ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}
function ArrowRight() {
  return <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="9 18 15 12 9 6"/></svg>;
}
function SearchIco() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>;
}
function CloseIco() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>;
}
function HamburgerIco() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>;
}
