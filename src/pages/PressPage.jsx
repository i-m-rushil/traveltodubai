// === FILE: src/pages/PressPage.jsx ===
import StaticLayout from './StaticLayout';

const coverage = [
  {
    pub: 'Arabian Business',
    date: 'May 2026',
    headline: 'Travel to Dubai Named UAE\'s Most Trusted Online Travel Publisher',
  },
  {
    pub: 'Khaleej Times',
    date: 'March 2026',
    headline: 'How a Local Startup Became Dubai\'s Go-To Travel Guide',
  },
  {
    pub: 'Gulf News',
    date: 'January 2026',
    headline: 'The Digital Guides Changing How Tourists Experience the UAE',
  },
  {
    pub: 'Condé Nast Traveller',
    date: 'October 2025',
    headline: '20 Travel Websites Worth Bookmarking in 2025',
  },
];

const sectionHeading = {
  fontFamily: 'var(--font-headline)',
  fontWeight: 700,
  fontSize: 20,
  color: 'var(--text-dark)',
  marginBottom: 14,
  paddingLeft: 14,
  borderLeft: '3px solid var(--brand)',
};

const card = {
  background: '#fff',
  borderRadius: 10,
  padding: '24px 28px',
  border: '1px solid var(--border)',
};

const para = {
  fontFamily: 'var(--font-body)',
  fontSize: 15,
  lineHeight: 1.82,
  color: 'var(--text-mid)',
  marginBottom: 16,
  marginTop: 0,
};

export default function PressPage() {
  return (
    <StaticLayout
      title="Press & Media"
      subtitle="Media resources, press coverage and brand assets for journalists and publishers."
    >
      {/* SEO */}
      <meta
        name="description"
        content="Press resources for Travel to Dubai — media kit, brand assets, press contact and recent coverage."
      />

      {/* Contact card */}
      <div style={{ marginTop: 44 }}>
        <h2 style={sectionHeading}>Contact the Press Team</h2>
        <div style={{ ...card, display: 'flex', flexDirection: 'column', gap: 10 }}>
          <p style={{ ...para, marginBottom: 6 }}>
            For interview requests, press enquiries, or editorial partnerships, reach us directly:
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13, color: 'var(--text-dark)', minWidth: 80 }}>Email</span>
              <a href="mailto:press@traveltodubai.ae" style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--brand)', textDecoration: 'none' }}>
                press@traveltodubai.ae
              </a>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13, color: 'var(--text-dark)', minWidth: 80 }}>Phone</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-mid)' }}>+971 4 XXX XXXX</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13, color: 'var(--text-dark)', minWidth: 80 }}>Response</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-mid)' }}>Within 1 business day</span>
            </div>
          </div>
        </div>
      </div>

      {/* Media Kit */}
      <div style={{ marginTop: 44 }}>
        <h2 style={sectionHeading}>Download Media Kit</h2>
        <div style={card}>
          <p style={para}>
            Our press kit includes background on the Travel to Dubai brand, audience data, editorial guidelines, key milestones, and high-resolution brand assets — everything you need to write accurately about us.
          </p>
          <a
            href="#"
            style={{
              display: 'inline-block',
              background: 'var(--brand)',
              color: '#fff',
              fontFamily: 'var(--font-ui)',
              fontWeight: 700,
              fontSize: 14,
              padding: '14px 36px',
              borderRadius: 8,
              textDecoration: 'none',
              letterSpacing: '0.02em',
            }}
          >
            Download Press Kit (PDF)
          </a>
        </div>
      </div>

      {/* Brand Assets */}
      <div style={{ marginTop: 44 }}>
        <h2 style={sectionHeading}>Brand Assets</h2>
        <div style={card}>
          <p style={para}>
            All brand assets are available for use by accredited journalists and media partners in accordance with our brand guidelines. Unauthorised commercial use is not permitted.
          </p>
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            {[
              'Logo files — SVG, PNG (transparent, white and full-colour variants)',
              'Brand colours — Hex, RGB and CMYK values provided in the press kit',
              'Photography — A curated library of editorial photography is available on request',
              'Executive headshots — Available on request for editorial use',
            ].map((item) => (
              <li key={item} style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.82, color: 'var(--text-mid)', marginBottom: 8 }}>
                {item}
              </li>
            ))}
          </ul>
          <p style={{ ...para, marginTop: 14, marginBottom: 0 }}>
            To request high-resolution assets, email <a href="mailto:press@traveltodubai.ae" style={{ color: 'var(--brand)' }}>press@traveltodubai.ae</a> with your publication name and intended use.
          </p>
        </div>
      </div>

      {/* Recent Coverage */}
      <div style={{ marginTop: 44 }}>
        <h2 style={sectionHeading}>Recent Coverage</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          {coverage.map((item) => (
            <div key={item.headline} style={{ ...card, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 20 }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 12, color: 'var(--brand)', textTransform: 'uppercase', letterSpacing: '0.07em', marginBottom: 6 }}>
                  {item.pub}
                </div>
                <div style={{ fontFamily: 'var(--font-headline)', fontWeight: 600, fontSize: 16, color: 'var(--text-dark)', lineHeight: 1.45 }}>
                  {item.headline}
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-ui)', fontSize: 13, color: 'var(--text-light)', whiteSpace: 'nowrap', paddingTop: 2 }}>
                {item.date}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Spokesperson */}
      <div style={{ marginTop: 44 }}>
        <h2 style={sectionHeading}>Spokesperson</h2>
        <div style={card}>
          <p style={para}>
            Our Editorial Director is available for media interviews, expert commentary, and on-the-record quotes on topics relating to Dubai tourism, travel trends across the Gulf region, and digital travel publishing. We welcome requests for comment on breaking travel news and industry reports.
          </p>
          <p style={{ ...para, marginBottom: 0 }}>
            To arrange an interview or request a quote, please contact us at{' '}
            <a href="mailto:press@traveltodubai.ae" style={{ color: 'var(--brand)' }}>press@traveltodubai.ae</a>{' '}
            with the subject line "Spokesperson Request" and your publication deadline.
          </p>
        </div>
      </div>
    </StaticLayout>
  );
}
