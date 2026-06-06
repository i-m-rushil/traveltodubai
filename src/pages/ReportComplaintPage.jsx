// === FILE: src/pages/ReportComplaintPage.jsx ===
import { useState } from 'react';
import StaticLayout from './StaticLayout';

const complaintTypes = [
  'Inaccurate Information',
  'Outdated Content',
  'Offensive Content',
  'Copyright Issue',
  'Privacy Concern',
  'Technical Bug',
  'Other',
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

export default function ReportComplaintPage() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    type: '',
    url: '',
    description: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [refNum, setRefNum] = useState('');

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const ref = Date.now().toString().slice(-8);
    setRefNum(ref);
    setSubmitted(true);
  };

  return (
    <StaticLayout
      title="Report a Complaint"
      subtitle="We take feedback seriously. Help us improve by reporting inaccurate content, technical issues or editorial concerns."
    >
      <meta
        name="description"
        content="Report inaccurate content, technical issues or editorial concerns to the Travel to Dubai team."
      />

      {/* Notice box */}
      <div
        style={{
          marginTop: 44,
          background: 'var(--sand)',
          borderLeft: '4px solid var(--gold)',
          borderRadius: 8,
          padding: '18px 22px',
        }}
      >
        <p style={{ ...para, marginBottom: 0, color: 'var(--text-dark)' }}>
          <strong>Please note:</strong> We aim to review all complaints within 48 hours and respond to all valid concerns within 5 business days. Your feedback directly improves the quality of our content.
        </p>
      </div>

      {/* Types of complaints */}
      <div style={{ marginTop: 44 }}>
        <h2 style={sectionHeading}>What We Handle</h2>
        <div style={card}>
          <p style={para}>We accept complaints relating to the following areas:</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {[
              'Inaccurate Information',
              'Outdated Content',
              'Offensive Content',
              'Copyright Issues',
              'Privacy Concerns',
              'Broken Links',
              'Technical Bugs',
            ].map((tag) => (
              <span
                key={tag}
                style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: 13,
                  fontWeight: 600,
                  color: 'var(--text-dark)',
                  background: 'var(--sand)',
                  border: '1px solid var(--border)',
                  borderRadius: 20,
                  padding: '5px 14px',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Complaint Form */}
      <div style={{ marginTop: 44 }}>
        <h2 style={sectionHeading}>Submit a Complaint</h2>

        {submitted ? (
          <div
            style={{
              ...card,
              borderLeft: '4px solid #22c55e',
              background: '#f0fdf4',
            }}
          >
            <div style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: 18, color: '#15803d', marginBottom: 10 }}>
              Complaint Received
            </div>
            <p style={{ ...para, marginBottom: 0, color: '#166534' }}>
              Thank you for your report. We've received your complaint and will review it within 48 hours.{' '}
              <strong>Reference #{refNum}</strong> — please keep this for your records.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={card}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              {/* Name */}
              <div>
                <label htmlFor="name" style={labelStyle}>Your Name <span style={{ color: 'var(--brand)' }}>*</span></label>
                <input
                  id="name"
                  name="name"
                  type="text"
                  required
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Jane Smith"
                  style={inputStyle}
                />
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" style={labelStyle}>Your Email <span style={{ color: 'var(--brand)' }}>*</span></label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  placeholder="jane@example.com"
                  style={inputStyle}
                />
              </div>

              {/* Type */}
              <div>
                <label htmlFor="type" style={labelStyle}>Complaint Type <span style={{ color: 'var(--brand)' }}>*</span></label>
                <select
                  id="type"
                  name="type"
                  required
                  value={form.type}
                  onChange={handleChange}
                  style={{ ...inputStyle, cursor: 'pointer' }}
                >
                  <option value="">Select a type...</option>
                  {complaintTypes.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>

              {/* URL */}
              <div>
                <label htmlFor="url" style={labelStyle}>URL of Page in Question <span style={{ color: 'var(--text-light)', fontWeight: 400 }}>(optional)</span></label>
                <input
                  id="url"
                  name="url"
                  type="text"
                  value={form.url}
                  onChange={handleChange}
                  placeholder="https://traveltodubai.ae/article/..."
                  style={inputStyle}
                />
              </div>

              {/* Description */}
              <div>
                <label htmlFor="description" style={labelStyle}>Describe Your Complaint <span style={{ color: 'var(--brand)' }}>*</span></label>
                <textarea
                  id="description"
                  name="description"
                  rows={4}
                  required
                  value={form.description}
                  onChange={handleChange}
                  placeholder="Please describe the issue in as much detail as possible..."
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
                  Submit Complaint
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </StaticLayout>
  );
}
