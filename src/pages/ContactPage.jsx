// === FILE: src/pages/ContactPage.jsx ===
import { useState, useEffect } from 'react';
import StaticLayout from './StaticLayout';

const contactDepts = [
  { label: 'General Enquiries', email: 'hello@traveltodubai.ae' },
  { label: 'Editorial',         email: 'editorial@traveltodubai.ae' },
  { label: 'Advertising',       email: 'advertise@traveltodubai.ae' },
  { label: 'Press & Media',     email: 'press@traveltodubai.ae' },
];

const subjectOptions = [
  'General Inquiry',
  'Editorial Feedback',
  'Advertising',
  'Press',
  'Other',
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

const label = {
  fontFamily: 'var(--font-ui)',
  fontSize: 12,
  fontWeight: 600,
  color: 'var(--text-dark)',
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  display: 'block',
  marginBottom: 6,
};

const inputBase = {
  width: '100%',
  fontFamily: 'var(--font-body)',
  fontSize: 14,
  color: 'var(--text-dark)',
  background: '#fff',
  border: '1px solid var(--border)',
  borderRadius: 6,
  padding: '11px 14px',
  outline: 'none',
  transition: 'border-color 0.18s, box-shadow 0.18s',
  boxSizing: 'border-box',
};

function FieldGroup({ children, style }) {
  return <div style={{ marginBottom: 20, ...style }}>{children}</div>;
}

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: subjectOptions[0], message: '' });
  const [focused, setFocused] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    document.title = 'Contact Us | Travel to Dubai';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Get in touch with the Travel to Dubai team — for editorial, advertising, press and general inquiries.');
    window.scrollTo(0, 0);
  }, []);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitting(true);
    // Simulate async submission
    setTimeout(() => {
      setSubmitting(false);
      setSubmitted(true);
    }, 900);
  }

  const getFocusStyle = (field) => focused === field
    ? { borderColor: 'var(--brand)', boxShadow: '0 0 0 3px rgba(228,61,48,0.10)' }
    : {};

  return (
    <StaticLayout
      title="Contact Us"
      subtitle="Our Dubai-based team reads every message and responds within 2 business days"
    >
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 32,
        alignItems: 'start',
      }}>

        {/* ── Right column (form) — appears first on mobile via order ── */}
        <div style={{ order: 0 }}>
          <h2 style={{ ...sectionHeading, marginBottom: 20 }}>Send Us a Message</h2>

          {submitted ? (
            <div style={{
              background: '#fff',
              borderRadius: 10,
              padding: '36px 32px',
              border: '1px solid var(--border)',
              boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              textAlign: 'center',
            }}>
              <div style={{
                width: 56,
                height: 56,
                borderRadius: '50%',
                background: 'rgba(228,61,48,0.08)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 18px',
              }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <div style={{
                fontFamily: 'var(--font-headline)',
                fontWeight: 700,
                fontSize: 20,
                color: 'var(--text-dark)',
                marginBottom: 10,
              }}>
                Message Received
              </div>
              <p style={{
                fontFamily: 'var(--font-body)',
                fontSize: 15,
                lineHeight: 1.75,
                color: 'var(--text-mid)',
                marginBottom: 24,
              }}>
                Thank you for getting in touch. One of our team members will reply to <strong>{form.email}</strong> within 2 business days.
              </p>
              <button
                onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: subjectOptions[0], message: '' }); }}
                style={{
                  background: 'none',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  padding: '10px 22px',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 600,
                  fontSize: 13,
                  color: 'var(--text-mid)',
                  cursor: 'pointer',
                  letterSpacing: '0.04em',
                }}
              >
                Send Another Message
              </button>
            </div>
          ) : (
            <form
              onSubmit={handleSubmit}
              style={{
                background: '#fff',
                borderRadius: 10,
                padding: '28px 28px 24px',
                border: '1px solid var(--border)',
                boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
              }}
            >
              <FieldGroup>
                <label htmlFor="name" style={label}>Your Name</label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  onFocus={() => setFocused('name')}
                  onBlur={() => setFocused(null)}
                  placeholder="Jane Smith"
                  style={{ ...inputBase, ...getFocusStyle('name') }}
                />
              </FieldGroup>

              <FieldGroup>
                <label htmlFor="email" style={label}>Email Address</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  onFocus={() => setFocused('email')}
                  onBlur={() => setFocused(null)}
                  placeholder="jane@example.com"
                  style={{ ...inputBase, ...getFocusStyle('email') }}
                />
              </FieldGroup>

              <FieldGroup>
                <label htmlFor="subject" style={label}>Subject</label>
                <select
                  id="subject"
                  name="subject"
                  value={form.subject}
                  onChange={handleChange}
                  onFocus={() => setFocused('subject')}
                  onBlur={() => setFocused(null)}
                  style={{
                    ...inputBase,
                    ...getFocusStyle('subject'),
                    appearance: 'none',
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%239A8A72' strokeWidth='1.5' fill='none' strokeLinecap='round'/%3E%3C/svg%3E")`,
                    backgroundRepeat: 'no-repeat',
                    backgroundPosition: 'right 14px center',
                    paddingRight: 36,
                    cursor: 'pointer',
                  }}
                >
                  {subjectOptions.map(opt => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
              </FieldGroup>

              <FieldGroup>
                <label htmlFor="message" style={label}>Message</label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  value={form.message}
                  onChange={handleChange}
                  onFocus={() => setFocused('message')}
                  onBlur={() => setFocused(null)}
                  placeholder="Tell us what's on your mind..."
                  style={{
                    ...inputBase,
                    ...getFocusStyle('message'),
                    resize: 'vertical',
                    minHeight: 130,
                  }}
                />
              </FieldGroup>

              <button
                type="submit"
                disabled={submitting}
                style={{
                  width: '100%',
                  background: submitting ? 'var(--border)' : 'var(--brand)',
                  color: submitting ? 'var(--text-light)' : '#fff',
                  border: 'none',
                  borderRadius: 6,
                  padding: '13px 0',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 700,
                  fontSize: 14,
                  letterSpacing: '0.08em',
                  textTransform: 'uppercase',
                  cursor: submitting ? 'not-allowed' : 'pointer',
                  transition: 'background 0.2s, color 0.2s',
                }}
              >
                {submitting ? 'Sending…' : 'Send Message'}
              </button>
            </form>
          )}
        </div>

        {/* ── Left column (contact info) ── */}
        <div style={{ order: 1 }}>
          <h2 style={{ ...sectionHeading, marginBottom: 20 }}>Contact Information</h2>

          <div style={{
            background: '#fff',
            borderRadius: 10,
            padding: '24px 28px',
            border: '1px solid var(--border)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            marginBottom: 16,
          }}>
            {contactDepts.map(({ label: dept, email }, i) => (
              <div
                key={email}
                style={{
                  paddingBottom: i < contactDepts.length - 1 ? 16 : 0,
                  marginBottom: i < contactDepts.length - 1 ? 16 : 0,
                  borderBottom: i < contactDepts.length - 1 ? '1px solid var(--border)' : 'none',
                }}
              >
                <div style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--text-light)',
                  textTransform: 'uppercase',
                  letterSpacing: '0.1em',
                  marginBottom: 4,
                }}>
                  {dept}
                </div>
                <a
                  href={`mailto:${email}`}
                  style={{
                    fontFamily: 'var(--font-body)',
                    fontSize: 14,
                    fontWeight: 600,
                    color: 'var(--brand)',
                    textDecoration: 'none',
                  }}
                  onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                  onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
                >
                  {email}
                </a>
              </div>
            ))}
          </div>

          {/* Address card */}
          <div style={{
            background: '#fff',
            borderRadius: 10,
            padding: '24px 28px',
            border: '1px solid var(--border)',
            boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
            marginBottom: 16,
          }}>
            <div style={{
              fontFamily: 'var(--font-ui)',
              fontSize: 11,
              fontWeight: 700,
              color: 'var(--text-light)',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              marginBottom: 8,
            }}>
              Our Office
            </div>
            <address style={{
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              lineHeight: 1.8,
              color: 'var(--text-mid)',
              fontStyle: 'normal',
            }}>
              Travel to Dubai FZ LLC<br />
              Dubai Media City<br />
              Building 4, Office 302<br />
              Dubai, UAE
            </address>
          </div>

          {/* Response time */}
          <div style={{
            background: 'rgba(228,61,48,0.05)',
            borderRadius: 10,
            padding: '18px 22px',
            border: '1px solid rgba(228,61,48,0.15)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: 12,
          }}>
            <div style={{
              width: 32,
              height: 32,
              borderRadius: '50%',
              background: 'rgba(228,61,48,0.1)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              marginTop: 1,
            }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 13,
              lineHeight: 1.7,
              color: 'var(--text-mid)',
              margin: 0,
            }}>
              <strong style={{ color: 'var(--text-dark)' }}>Response time:</strong> We aim to respond to all enquiries within 2 business days. During peak periods this may extend slightly — we appreciate your patience.
            </p>
          </div>
        </div>
      </div>
    </StaticLayout>
  );
}
