// === FILE: src/pages/AdvertiseWithUsPage.jsx ===
import { useState } from 'react';
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

const inputStyle = {
  width: '100%',
  padding: '11px 14px',
  border: '1px solid var(--border)',
  borderRadius: 7,
  fontFamily: 'var(--font-body)',
  fontSize: 14,
  outline: 'none',
  boxSizing: 'border-box',
  color: 'var(--text-dark)',
  background: '#fff',
};

const labelStyle = {
  display: 'block',
  fontFamily: 'var(--font-ui)',
  fontWeight: 600,
  fontSize: 13,
  color: 'var(--text-dark)',
  marginBottom: 6,
};

const audienceStats = [
  { value: '2.4M', label: 'Monthly Readers' },
  { value: '68%', label: 'Planning a Dubai trip in the next 12 months' },
  { value: '42%', label: 'Aged 25–44' },
  { value: '500K+', label: 'Social Media Followers' },
];

const adFormats = [
  {
    name: 'Sponsored Articles',
    from: 'AED 3,500',
    desc: 'Branded editorial content crafted by our writers. Ranks organically on Google and lives permanently on our site — long-term visibility for your brand.',
    icon: '✍️',
  },
  {
    name: 'Display Advertising',
    from: 'AED 1,200 / month',
    desc: 'Premium banner placements across our homepage, category pages, and within articles. High viewability, travel-intent audience.',
    icon: '🖥️',
  },
  {
    name: 'Newsletter Sponsorship',
    from: 'AED 2,000',
    desc: 'Dedicated placement in our weekly email sent to 80,000+ subscribers. High open rates from an actively engaged reader base.',
    icon: '📧',
  },
  {
    name: 'Social Media Packages',
    from: 'AED 4,500',
    desc: 'Instagram Reels, TikTok videos, and YouTube integrations produced by our in-house content team with authentic Dubai-based creators.',
    icon: '📱',
  },
];

const budgetRanges = [
  'Under AED 5,000',
  'AED 5,000–20,000',
  'AED 20,000+',
  "Let's Discuss",
];

export default function AdvertiseWithUsPage() {
  const [form, setForm] = useState({
    company: '',
    contact: '',
    email: '',
    phone: '',
    budget: '',
    message: '',
  });
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <StaticLayout
      title="Advertise With Us"
      subtitle="Reach 2.4 million engaged Dubai travelers every month. Tailored advertising solutions for every budget."
    >
      <meta
        name="description"
        content="Advertise on Travel to Dubai — reach 2.4 million engaged Dubai travelers with sponsored content, display ads and newsletter placements."
      />

      {/* Audience Stats */}
      <div style={{ marginTop: 44 }}>
        <h2 style={sectionHeading}>Our Audience</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: 14 }}>
          {audienceStats.map((s) => (
            <div
              key={s.label}
              style={{
                background: 'var(--midnight)',
                borderRadius: 10,
                padding: '22px 20px',
                textAlign: 'center',
              }}
            >
              <div style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: 30, color: 'var(--gold)', lineHeight: 1, marginBottom: 8 }}>
                {s.value}
              </div>
              <div style={{ fontFamily: 'var(--font-body)', fontSize: 13, color: 'rgba(255,255,255,0.72)', lineHeight: 1.5 }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Ad Formats */}
      <div style={{ marginTop: 44 }}>
        <h2 style={sectionHeading}>Advertising Formats</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {adFormats.map((fmt) => (
            <div key={fmt.name} style={{ ...card, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: 17, color: 'var(--text-dark)' }}>
                  {fmt.name}
                </div>
              </div>
              <div
                style={{
                  display: 'inline-block',
                  fontFamily: 'var(--font-ui)',
                  fontWeight: 700,
                  fontSize: 13,
                  color: 'var(--brand)',
                  background: '#fdf2f1',
                  border: '1px solid #f5c6c3',
                  borderRadius: 20,
                  padding: '4px 12px',
                  alignSelf: 'flex-start',
                }}
              >
                From {fmt.from}
              </div>
              <p style={{ ...para, marginBottom: 0, fontSize: 14 }}>{fmt.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Why Advertise */}
      <div style={{ marginTop: 44 }}>
        <h2 style={sectionHeading}>Why Advertise With Us</h2>
        <div style={card}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            {[
              {
                title: 'Trusted by 140+ Brands',
                desc: 'From boutique hotels and airline partners to luxury retailers and tour operators — brands across the travel ecosystem choose Travel to Dubai to connect with their ideal customers.',
              },
              {
                title: 'Travel-Intent Audience',
                desc: 'Our readers are actively planning or dreaming about a Dubai trip. That means your message reaches people in the right mindset, at the right moment, with money to spend.',
              },
              {
                title: 'Transparent Reporting',
                desc: 'Every campaign comes with a clear performance report including impressions, clicks, engagement metrics, and audience demographics. No black-box reporting.',
              },
            ].map((point) => (
              <div key={point.title} style={{ display: 'flex', gap: 16 }}>
                <div style={{ width: 4, minWidth: 4, borderRadius: 4, background: 'var(--gold)', alignSelf: 'stretch' }} />
                <div>
                  <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 15, color: 'var(--text-dark)', marginBottom: 6 }}>
                    {point.title}
                  </div>
                  <p style={{ ...para, marginBottom: 0, fontSize: 14 }}>{point.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Inquiry Form */}
      <div style={{ marginTop: 44 }}>
        <h2 style={sectionHeading}>Get in Touch</h2>

        {submitted ? (
          <div style={{ ...card, borderLeft: '4px solid #22c55e', background: '#f0fdf4' }}>
            <div style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: 18, color: '#15803d', marginBottom: 10 }}>
              Enquiry Received
            </div>
            <p style={{ ...para, marginBottom: 0, color: '#166534' }}>
              Thank you for getting in touch. A member of our advertising team will contact you within 1 business day to discuss your campaign.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={card}>
            <p style={{ ...para, marginBottom: 20 }}>
              Fill in the form below and our partnerships team will get back to you within 1 business day. Prefer email?{' '}
              <a href="mailto:advertise@traveltodubai.ae" style={{ color: 'var(--brand)', fontWeight: 600, textDecoration: 'none' }}>
                advertise@traveltodubai.ae
              </a>
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Company / Contact row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label htmlFor="company" style={labelStyle}>Company Name <span style={{ color: 'var(--brand)' }}>*</span></label>
                  <input
                    id="company"
                    name="company"
                    type="text"
                    required
                    value={form.company}
                    onChange={handleChange}
                    placeholder="Acme Tourism LLC"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label htmlFor="contact" style={labelStyle}>Contact Name <span style={{ color: 'var(--brand)' }}>*</span></label>
                  <input
                    id="contact"
                    name="contact"
                    type="text"
                    required
                    value={form.contact}
                    onChange={handleChange}
                    placeholder="Sarah Al-Maktoum"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Email / Phone row */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label htmlFor="adEmail" style={labelStyle}>Email <span style={{ color: 'var(--brand)' }}>*</span></label>
                  <input
                    id="adEmail"
                    name="email"
                    type="email"
                    required
                    value={form.email}
                    onChange={handleChange}
                    placeholder="sarah@acmetourism.ae"
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label htmlFor="phone" style={labelStyle}>
                    Phone <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>(optional)</span>
                  </label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="+971 50 XXX XXXX"
                    style={inputStyle}
                  />
                </div>
              </div>

              {/* Budget */}
              <div>
                <label htmlFor="budget" style={labelStyle}>Budget Range <span style={{ color: 'var(--brand)' }}>*</span></label>
                <select
                  id="budget"
                  name="budget"
                  required
                  value={form.budget}
                  onChange={handleChange}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="">Select your budget...</option>
                  {budgetRanges.map((b) => (
                    <option key={b} value={b}>{b}</option>
                  ))}
                </select>
              </div>

              {/* Message */}
              <div>
                <label htmlFor="adMessage" style={labelStyle}>
                  Tell Us About Your Campaign <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>(optional)</span>
                </label>
                <textarea
                  id="adMessage"
                  name="message"
                  rows={4}
                  value={form.message}
                  onChange={handleChange}
                  placeholder="Which formats interest you? What are your goals? Any specific dates or audience targets?"
                  style={{ ...inputStyle, resize: 'vertical' }}
                />
              </div>

              {/* Submit */}
              <div>
                <button
                  type="submit"
                  style={{
                    background: 'var(--brand)',
                    color: '#fff',
                    fontFamily: 'var(--font-ui)',
                    fontWeight: 700,
                    fontSize: 13,
                    padding: '12px 32px',
                    borderRadius: 6,
                    cursor: 'pointer',
                    border: 'none',
                    letterSpacing: '0.02em',
                  }}
                >
                  Send Enquiry
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </StaticLayout>
  );
}
