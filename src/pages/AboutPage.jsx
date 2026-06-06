// === FILE: src/pages/AboutPage.jsx ===
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import StaticLayout from './StaticLayout';

const stats = [
  { value: '2.4M', label: 'Monthly Readers' },
  { value: '500+', label: 'Guides Published' },
  { value: '120+', label: 'Local Experts' },
  { value: '8',    label: 'Countries Reached' },
];

const teamMembers = [
  {
    name: 'Layla Al-Rashid',
    role: 'Editor-in-Chief',
    bio: 'A Dubai native and former Gulf News correspondent, Layla has spent 14 years writing about the city she grew up in — from its colonial-era creek to its glass-and-steel skyline.',
  },
  {
    name: 'Marcus Pemberton',
    role: 'Senior Travel Editor',
    bio: 'Marcus relocated from London to Dubai in 2014 and has since visited every neighbourhood, souk, and hidden café the emirate has to offer, contributing to The Guardian and Condé Nast Traveller before joining us.',
  },
  {
    name: 'Priya Nambiar',
    role: 'Head of Research & Fact-Checking',
    bio: 'Priya leads our editorial verification process, personally confirming opening hours, entry prices, and policy details before any guide goes live — a standard she holds to relentlessly.',
  },
];

const sectionHeading = {
  fontFamily: 'var(--font-headline)',
  fontWeight: 700,
  fontSize: 20,
  color: 'var(--text-dark)',
  marginBottom: 12,
  display: 'flex',
  alignItems: 'center',
  paddingLeft: 12,
  borderLeft: '3px solid var(--brand)',
};

const card = {
  background: '#fff',
  borderRadius: 10,
  padding: '24px 28px',
  border: '1px solid var(--border)',
  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
};

const para = {
  fontFamily: 'var(--font-body)',
  fontSize: 15,
  lineHeight: 1.82,
  color: 'var(--text-mid)',
  marginBottom: 16,
};

export default function AboutPage() {
  useEffect(() => {
    document.title = 'About Us | Travel to Dubai';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Learn about Travel to Dubai — who we are, our editorial team, and our mission to be the world\'s best Dubai travel guide.');
    window.scrollTo(0, 0);
  }, []);

  return (
    <StaticLayout
      title="About Travel to Dubai"
      subtitle="Who we are, what we stand for, and the people behind the guides"
    >
      {/* Who We Are */}
      <section>
        <h2 style={sectionHeading}>Who We Are</h2>
        <div style={card}>
          <p style={para}>
            Travel to Dubai was founded in 2019 by a small team of journalists, photographers, and long-term Dubai residents who were frustrated by the state of online travel content about the emirate. Most of what existed was either outdated hotel-sponsored listicles or generic copy lifted from tourism board press releases. We wanted something different: honest, deeply researched, and actually useful.
          </p>
          <p style={{ ...para, marginBottom: 0 }}>
            Today we are a team of local writers, senior travel editors, and specialist contributors based in Dubai — people who live here, eat here, commute here, and know the city in all its complexity. Our readers are first-time visitors, frequent stopover travellers, long-term expats, and everyone in between. What they share is a desire for accurate information they can trust before booking, packing, and arriving.
          </p>
        </div>
      </section>

      {/* Stats Row */}
      <section style={{ marginTop: 44 }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
          gap: 16,
        }}>
          {stats.map(({ value, label }) => (
            <div
              key={label}
              style={{
                ...card,
                textAlign: 'center',
                padding: '28px 20px',
              }}
            >
              <div style={{
                fontFamily: 'var(--font-headline)',
                fontWeight: 800,
                fontSize: 36,
                color: 'var(--brand)',
                lineHeight: 1.1,
                marginBottom: 6,
              }}>
                {value}
              </div>
              <div style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 12,
                fontWeight: 600,
                color: 'var(--text-light)',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
              }}>
                {label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Mission */}
      <section style={{ marginTop: 48 }}>
        <h2 style={sectionHeading}>Our Mission</h2>
        <div style={card}>
          <p style={para}>
            Our mission is straightforward: to be the most trusted, honest, and useful Dubai travel guide online. Not the biggest. Not the most-sponsored. The most trusted.
          </p>
          <p style={{ ...para, marginBottom: 0 }}>
            Dubai is a city of extraordinary contrasts — staggering wealth alongside visible inequality, ancient trading traditions alongside world-record-breaking modernity, genuine hospitality alongside complex social codes that visitors need to understand. We don't smooth over these contrasts. We explain them. Because travellers who understand the city they're visiting have a better time, make better choices, and leave with a more honest picture of a genuinely remarkable place.
          </p>
        </div>
      </section>

      {/* Editorial Values */}
      <section style={{ marginTop: 48 }}>
        <h2 style={sectionHeading}>Editorial Values</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {[
            {
              title: 'Personally Verified',
              text: 'We only publish what we have personally visited, tested, or confirmed from primary sources. If we haven\'t been there, we say so. If something has changed, we update it.',
            },
            {
              title: 'No Sponsored Puff',
              text: 'We do not accept payment for editorial coverage. Hotels, restaurants, and attractions cannot buy a positive review here. Our recommendations reflect real visits and honest opinions, full stop.',
            },
            {
              title: 'Always Up to Date',
              text: 'Dubai moves fast. Prices change, venues close, policies shift. Every guide carries a last-verified date, and our team reviews high-traffic pages on a rolling quarterly schedule.',
            },
          ].map(({ title, text }) => (
            <div key={title} style={{ ...card }}>
              <div style={{
                fontFamily: 'var(--font-headline)',
                fontWeight: 700,
                fontSize: 15,
                color: 'var(--text-dark)',
                marginBottom: 10,
              }}>
                {title}
              </div>
              <p style={{ ...para, marginBottom: 0 }}>{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Team */}
      <section style={{ marginTop: 48 }}>
        <h2 style={sectionHeading}>The Team</h2>
        <div style={{ ...card, marginBottom: 20 }}>
          <p style={{ ...para, marginBottom: 0 }}>
            Our editorial operation comprises <strong>6 full-time editors</strong>, <strong>25 specialist contributors</strong>, and <strong>8 photographers</strong> covering everything from luxury resort openings to the changing street-food landscape of Deira. Many of our contributors have lived in Dubai for a decade or more; some were born here. All of them care deeply about getting it right.
          </p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
          {teamMembers.map(({ name, role, bio }) => (
            <div key={name} style={{ ...card }}>
              <div style={{
                width: 48,
                height: 48,
                borderRadius: '50%',
                background: 'var(--midnight)',
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontFamily: 'var(--font-headline)',
                fontWeight: 800,
                fontSize: 20,
                marginBottom: 14,
              }}>
                {name[0]}
              </div>
              <div style={{
                fontFamily: 'var(--font-headline)',
                fontWeight: 700,
                fontSize: 16,
                color: 'var(--text-dark)',
                marginBottom: 2,
              }}>
                {name}
              </div>
              <div style={{
                fontFamily: 'var(--font-ui)',
                fontSize: 11,
                fontWeight: 600,
                color: 'var(--brand)',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: 12,
              }}>
                {role}
              </div>
              <p style={{ ...para, marginBottom: 0, fontSize: 14 }}>{bio}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Contact CTA */}
      <section style={{ marginTop: 48 }}>
        <div style={{
          ...card,
          background: 'var(--midnight)',
          border: 'none',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
          flexWrap: 'wrap',
        }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-headline)',
              fontWeight: 700,
              fontSize: 18,
              color: '#fff',
              marginBottom: 6,
            }}>
              Get in Touch
            </div>
            <p style={{ ...para, color: 'rgba(255,255,255,0.6)', marginBottom: 0, fontSize: 14 }}>
              Have a question, a tip, or want to contribute? We'd love to hear from you.
            </p>
          </div>
          <Link
            to="/contact"
            style={{
              background: 'var(--brand)',
              color: '#fff',
              padding: '12px 28px',
              borderRadius: 6,
              fontFamily: 'var(--font-ui)',
              fontWeight: 700,
              fontSize: 13,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              flexShrink: 0,
              display: 'inline-block',
            }}
          >
            Contact Us
          </Link>
        </div>
      </section>
    </StaticLayout>
  );
}
