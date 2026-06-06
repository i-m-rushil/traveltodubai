// === FILE: src/pages/WorkWithUsPage.jsx ===
import StaticLayout from './StaticLayout';

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

const reasons = [
  {
    stat: '2.4M',
    label: 'Monthly Readers',
    desc: 'Your byline reaches one of the largest English-language Dubai travel audiences in the region.',
  },
  {
    stat: '120+',
    label: 'Local Expert Contributors',
    desc: 'Collaborate with guides, hospitality professionals, and cultural experts who live and breathe Dubai.',
  },
  {
    stat: '100%',
    label: 'Creative Freedom',
    desc: "We encourage writers to pitch their own ideas. Your best angles become our best stories — we don't do cookie-cutter content.",
  },
];

const positions = [
  {
    title: 'Senior Travel Writer',
    type: 'Full-time',
    location: 'Dubai',
    reqs: [
      '3+ years of professional travel writing experience',
      'Existing portfolio of Dubai or UAE-focused content',
      'Fluent written English with a distinctive editorial voice',
      'Ability to produce 4–6 long-form articles per month',
    ],
  },
  {
    title: 'Social Media Manager',
    type: 'Full-time',
    location: 'Dubai',
    reqs: [
      '2+ years managing brand social accounts (Instagram, TikTok)',
      'Proven track record of audience growth and engagement',
      'Data-driven approach to content scheduling and performance',
      'On-the-ground Dubai knowledge strongly preferred',
    ],
  },
  {
    title: 'SEO Content Strategist',
    type: 'Remote / Hybrid',
    location: 'UAE or Remote',
    reqs: [
      '2+ years in SEO content strategy or editorial planning',
      'Proficiency with keyword research tools (Ahrefs, SEMrush, etc.)',
      'Experience managing content calendars at scale',
      'Ability to brief writers and track content performance',
    ],
  },
];

const traits = [
  'An original perspective — no generic top-10 lists without a fresh angle',
  'On-the-ground experience — we value writers who\'ve actually been there',
  'An accuracy-first mindset — we fact-check everything, and so should you',
  'The ability to write for a global audience — accessible yet authoritative',
];

export default function WorkWithUsPage() {
  return (
    <StaticLayout
      title="Work With Us"
      subtitle="Join Dubai's fastest-growing travel media brand. We're always looking for talented writers, photographers, and digital creators."
    >
      <meta
        name="description"
        content="Career opportunities and freelance writing positions at Travel to Dubai — join our editorial team."
      />

      {/* Why Work With Us */}
      <div style={{ marginTop: 44 }}>
        <h2 style={sectionHeading}>Why Work With Us</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {reasons.map((r) => (
            <div key={r.label} style={{ ...card, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <div style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: 32, color: 'var(--brand)', lineHeight: 1 }}>
                {r.stat}
              </div>
              <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 14, color: 'var(--text-dark)' }}>
                {r.label}
              </div>
              <p style={{ ...para, marginBottom: 0, fontSize: 14 }}>{r.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Open Positions */}
      <div style={{ marginTop: 44 }}>
        <h2 style={sectionHeading}>Open Positions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {positions.map((pos) => (
            <div key={pos.title} style={card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10, marginBottom: 14 }}>
                <div>
                  <div style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: 18, color: 'var(--text-dark)', marginBottom: 6 }}>
                    {pos.title}
                  </div>
                  <div style={{ display: 'flex', gap: 10 }}>
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, color: 'var(--brand)', background: '#fdf2f1', border: '1px solid #f5c6c3', borderRadius: 20, padding: '3px 12px' }}>
                      {pos.type}
                    </span>
                    <span style={{ fontFamily: 'var(--font-ui)', fontSize: 12, fontWeight: 600, color: 'var(--text-mid)', background: 'var(--sand)', border: '1px solid var(--border)', borderRadius: 20, padding: '3px 12px' }}>
                      {pos.location}
                    </span>
                  </div>
                </div>
                <a
                  href="mailto:careers@traveltodubai.ae"
                  style={{
                    display: 'inline-block',
                    background: 'var(--brand)',
                    color: '#fff',
                    fontFamily: 'var(--font-ui)',
                    fontWeight: 700,
                    fontSize: 13,
                    padding: '10px 22px',
                    borderRadius: 6,
                    textDecoration: 'none',
                    whiteSpace: 'nowrap',
                  }}
                >
                  Apply Now
                </a>
              </div>
              <ul style={{ paddingLeft: 20, margin: 0 }}>
                {pos.reqs.map((req) => (
                  <li key={req} style={{ fontFamily: 'var(--font-body)', fontSize: 14, lineHeight: 1.75, color: 'var(--text-mid)', marginBottom: 6 }}>
                    {req}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Freelance & Contributors */}
      <div style={{ marginTop: 44 }}>
        <h2 style={sectionHeading}>Freelance & Contributors</h2>
        <div style={card}>
          <p style={para}>
            We welcome pitches from freelance journalists, travel bloggers, and specialist contributors. If you have a story idea that fits our audience — travellers planning a trip to Dubai, or those hungry for insider knowledge — we want to hear from you.
          </p>
          <p style={para}>
            To pitch an article, email{' '}
            <a href="mailto:editorial@traveltodubai.ae" style={{ color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>
              editorial@traveltodubai.ae
            </a>{' '}
            with the subject line "Pitch:" followed by your article title. Please include:
          </p>
          <ul style={{ paddingLeft: 20, margin: '0 0 16px 0' }}>
            {[
              'A short bio (2–3 sentences) and link to your published work',
              'Two writing samples relevant to travel or Dubai',
              'Your proposed article idea and the angle you would take',
              'An estimated word count and any unique access you have (local contacts, on-the-ground knowledge, etc.)',
            ].map((item) => (
              <li key={item} style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.82, color: 'var(--text-mid)', marginBottom: 8 }}>
                {item}
              </li>
            ))}
          </ul>
          <p style={{ ...para, marginBottom: 0 }}>
            We aim to respond to all pitches within 7 business days. Volume means we cannot guarantee a personal reply to every submission, but we read them all.
          </p>
        </div>
      </div>

      {/* What We Look For */}
      <div style={{ marginTop: 44 }}>
        <h2 style={sectionHeading}>What We Look For</h2>
        <div style={card}>
          <p style={{ ...para, marginBottom: 16 }}>
            Whether you're applying for a staff role or submitting a freelance pitch, these are the qualities that set successful candidates apart:
          </p>
          <ul style={{ paddingLeft: 20, margin: 0 }}>
            {traits.map((trait) => (
              <li key={trait} style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.82, color: 'var(--text-mid)', marginBottom: 10 }}>
                {trait}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* CTA */}
      <div style={{ marginTop: 44 }}>
        <div
          style={{
            ...card,
            background: 'var(--midnight)',
            border: 'none',
            textAlign: 'center',
            padding: '36px 28px',
          }}
        >
          <div style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: 22, color: '#fff', marginBottom: 10 }}>
            Ready to join the team?
          </div>
          <p style={{ ...para, color: 'rgba(255,255,255,0.72)', marginBottom: 22 }}>
            Send your CV and portfolio to our careers team. We look forward to hearing from you.
          </p>
          <a
            href="mailto:careers@traveltodubai.ae"
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
            careers@traveltodubai.ae
          </a>
        </div>
      </div>
    </StaticLayout>
  );
}
