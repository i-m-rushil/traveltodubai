import { Link } from 'react-router-dom';
import { useIsMobile } from '../hooks/useIsMobile';

const year = new Date().getFullYear();

const LINK_MAP = {
  'Our Story':        '/about',
  'Editorial Team':   '/about',
  'Press & Media':    '/press',
  'Partnerships':     '/advertise',
  'Advertise With Us':'/advertise',
  'Work With Us':     '/work-with-us',
  'FAQs':             '/faq',
  'Contact Us':       '/contact',
  'Help Center':      '/faq',
  'Privacy Policy':   '/privacy-policy',
  'Terms of Service': '/terms',
  'Report Complaint': '/report-complaint',
};

const BOTTOM_MAP = {
  'Privacy Policy':   '/privacy-policy',
  'Terms of Service': '/terms',
};

const columns = [
  {
    heading: 'About Us',
    links: ['Our Story', 'Editorial Team', 'Press & Media', 'Partnerships', 'Advertise With Us', 'Work With Us'],
  },
  {
    heading: 'Destinations',
    links: ['Downtown Dubai', 'Old Dubai', 'Dubai Marina', 'Palm Jumeirah', 'Dubai Hills', 'Deira'],
  },
  {
    heading: 'Travel Info',
    links: ['Visa Guide', 'Best Time to Visit', 'Getting Around', 'Currency & Costs', 'Health & Safety', 'FAQs'],
  },
  {
    heading: 'Support',
    links: ['Contact Us', 'Help Center', 'Privacy Policy', 'Terms of Service', 'Cookie Settings', 'Sitemap'],
  },
];

const socials = [
  { label: 'Instagram', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="2" width="20" height="20" rx="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg> },
  { label: 'TikTok', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.34 6.34 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.65a8.17 8.17 0 004.79 1.52V6.73a4.85 4.85 0 01-1.02-.04z"/></svg> },
  { label: 'YouTube', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58A2.78 2.78 0 0 0 3.41 19.6C5.12 20 12 20 12 20s6.88 0 8.59-.46a2.78 2.78 0 0 0 1.95-1.95A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z"/><polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="var(--midnight)"/></svg> },
  { label: 'Facebook', icon: <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg> },
];

function FooterLink({ label }) {
  const to = LINK_MAP[label];
  const linkStyle = {
    fontFamily: 'var(--font-ui)', fontSize: '12.5px',
    color: 'rgba(255,255,255,0.45)', transition: 'color 0.15s',
    display: 'flex', alignItems: 'center', gap: '6px',
    textDecoration: 'none',
  };
  const dot = <span style={{ width: '3px', height: '3px', background: 'rgba(201,160,80,0.4)', borderRadius: '50%', flexShrink: 0 }} />;
  const hover = {
    onMouseEnter: e => e.currentTarget.style.color = 'rgba(255,255,255,0.85)',
    onMouseLeave: e => e.currentTarget.style.color = 'rgba(255,255,255,0.45)',
  };

  if (to) {
    return (
      <Link to={to} style={linkStyle} {...hover}>
        {dot}{label}
      </Link>
    );
  }
  return (
    <a href="#" style={linkStyle} {...hover}>
      {dot}{label}
    </a>
  );
}

export default function Footer() {
  const isMobile = useIsMobile();
  return (
    <footer style={{ background: 'var(--midnight)', color: '#fff', marginTop: 'auto', borderTop: '1px solid rgba(201,160,80,0.15)' }}>
      {/* Main content */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '40px 16px 32px' : '48px 24px 40px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr repeat(4, auto)', gap: isMobile ? '24px' : '48px', alignItems: 'start' }}>

          {/* Brand column */}
          <div style={{ gridColumn: isMobile ? '1 / -1' : 'auto' }}>
            <div style={{ marginBottom: '18px' }}>
              <img
                src="/Travel-to-Dubai-Logo.svg"
                alt="Travel to Dubai"
                style={{ height: '72px', width: 'auto', display: 'block', filter: 'brightness(0) invert(1)' }}
              />
            </div>

            <p style={{
              fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: '13.5px',
              color: 'rgba(255,255,255,0.5)', lineHeight: 1.75, marginBottom: '24px', maxWidth: '260px',
            }}>
              Your trusted guide to everything Dubai — from iconic landmarks to hidden gems, events and luxury experiences.
            </p>

            {/* Social buttons */}
            <div style={{ display: 'flex', gap: '8px' }}>
              {socials.map(({ label, icon }) => (
                <a key={label} href="#" aria-label={label} style={{
                  width: '36px', height: '36px',
                  background: 'rgba(255,255,255,0.07)',
                  border: '1px solid rgba(255,255,255,0.1)',
                  borderRadius: '8px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: 'rgba(255,255,255,0.5)',
                  transition: 'all 0.2s',
                }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'var(--brand)'; e.currentTarget.style.borderColor = 'var(--brand)'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.color = 'rgba(255,255,255,0.5)'; }}
                >
                  {icon}
                </a>
              ))}
            </div>

            {/* Awards/trust badge */}
            <div style={{
              marginTop: '24px', padding: '12px 14px',
              background: 'rgba(201,160,80,0.08)',
              border: '1px solid rgba(201,160,80,0.15)',
              borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '10px',
            }}>
              <span style={{ fontSize: '18px' }}>🏆</span>
              <div>
                <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '10px', color: 'var(--gold)', letterSpacing: '0.5px' }}>
                  Best Dubai Travel Blog
                </div>
                <div style={{ fontFamily: 'var(--font-ui)', fontSize: '9px', color: 'rgba(255,255,255,0.4)', letterSpacing: '0.5px' }}>
                  UAE Digital Media Awards 2025
                </div>
              </div>
            </div>
          </div>

          {/* Link columns */}
          {columns.map(col => (
            <div key={col.heading}>
              <h5 style={{
                fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '11px',
                letterSpacing: '2px', textTransform: 'uppercase',
                color: 'var(--gold)', marginBottom: '14px', paddingBottom: '10px',
                borderBottom: '1px solid rgba(201,160,80,0.15)',
              }}>
                {col.heading}
              </h5>
              <ul style={{ display: 'flex', flexDirection: 'column', gap: '9px' }}>
                {col.links.map(link => (
                  <li key={link}>
                    <FooterLink label={link} />
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter bar */}
        <div style={{
          marginTop: isMobile ? '32px' : '48px', paddingTop: '32px',
          borderTop: '1px solid rgba(201,160,80,0.1)',
          display: 'flex', alignItems: isMobile ? 'stretch' : 'center',
          flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? '16px' : '24px', flexWrap: 'wrap',
        }}>
          <div style={{ flex: 1, minWidth: '220px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
              <span style={{ fontSize: '16px' }}>✈</span>
              <p style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '13px', letterSpacing: '0.5px', color: '#fff' }}>
                Dubai Weekly Insider
              </p>
            </div>
            <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: '12.5px', color: 'rgba(255,255,255,0.4)' }}>
              Deals, events and hidden gems every Sunday morning.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '8px', flex: 1, maxWidth: '460px' }}>
            <input placeholder="Your email address" type="email"
              style={{
                flex: 1, padding: '11px 16px',
                fontFamily: 'var(--font-body)', fontSize: '13px',
                border: '1px solid rgba(201,160,80,0.2)', borderRadius: '7px',
                background: 'rgba(255,255,255,0.06)', color: '#fff', outline: 'none',
              }}
            />
            <button style={{
              background: 'var(--brand)', color: '#fff',
              fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '12px',
              letterSpacing: '0.5px', padding: '11px 22px', borderRadius: '7px',
              cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background 0.2s',
            }}
              onMouseEnter={e => e.target.style.background = 'var(--brand-dark)'}
              onMouseLeave={e => e.target.style.background = 'var(--brand)'}
            >
              Subscribe ✈
            </button>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div style={{ borderTop: '1px solid rgba(255,255,255,0.05)', background: 'rgba(0,0,0,0.25)' }}>
        <div style={{
          maxWidth: '1280px', margin: '0 auto', padding: '14px 24px',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexWrap: 'wrap', gap: '10px',
        }}>
          <p style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'rgba(255,255,255,0.3)' }}>
            © {year} Travel to Dubai. All rights reserved. Made with ✈ in the UAE.
          </p>
          <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
            {['Privacy Policy', 'Terms of Service', 'Cookie Settings', 'Accessibility'].map(item => {
              const to = BOTTOM_MAP[item];
              const s = { fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'rgba(255,255,255,0.3)', transition: 'color 0.15s', textDecoration: 'none' };
              const hover = {
                onMouseEnter: e => e.target.style.color = 'rgba(255,255,255,0.7)',
                onMouseLeave: e => e.target.style.color = 'rgba(255,255,255,0.3)',
              };
              return to
                ? <Link key={item} to={to} style={s} {...hover}>{item}</Link>
                : <a key={item} href="#" style={s} {...hover}>{item}</a>;
            })}
          </div>
        </div>
      </div>
    </footer>
  );
}
