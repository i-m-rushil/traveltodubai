// === FILE: src/pages/TermsPage.jsx ===
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

const para = {
  fontFamily: 'var(--font-body)',
  fontSize: 15,
  lineHeight: 1.82,
  color: 'var(--text-mid)',
  marginBottom: 16,
  marginTop: 0,
};

const card = {
  background: '#fff',
  borderRadius: 10,
  padding: '24px 28px',
  border: '1px solid var(--border)',
};

function Section({ num, title, children }) {
  return (
    <div style={{ marginTop: 44 }}>
      <h2 style={sectionHeading}>
        {num}. {title}
      </h2>
      <div style={card}>{children}</div>
    </div>
  );
}

export default function TermsPage() {
  return (
    <StaticLayout
      title="Terms & Conditions"
      subtitle="Please read these terms carefully before using Travel to Dubai."
    >
      <meta
        name="description"
        content="Terms and Conditions for use of the Travel to Dubai website — intellectual property, disclaimers and governing law."
      />

      <p style={{ ...para, marginTop: 32, fontStyle: 'italic', color: 'var(--text-light)' }}>
        Last updated: June 2026
      </p>

      <Section num={1} title="Acceptance of Terms">
        <p style={para}>
          By accessing or using the Travel to Dubai website (traveltodubai.ae), you agree to be bound by these Terms and Conditions and all applicable laws and regulations. If you do not agree with any part of these terms, you must not use our website.
        </p>
        <p style={{ ...para, marginBottom: 0 }}>
          These Terms constitute a legally binding agreement between you and Travel to Dubai FZ LLC ("we", "us" or "our"). We reserve the right to update or modify these Terms at any time without prior notice. Your continued use of the website following any changes constitutes your acceptance of the revised Terms.
        </p>
      </Section>

      <Section num={2} title="Use of the Website">
        <p style={para}>You may use this website for lawful, personal, and non-commercial purposes. You agree that you will not:</p>
        <ul style={{ paddingLeft: 20, margin: '0 0 16px 0' }}>
          {[
            'Reproduce, copy, or redistribute any content from this website without our written permission',
            'Use automated tools (scrapers, bots, crawlers) to extract content in bulk',
            'Attempt to gain unauthorised access to any part of our systems or infrastructure',
            'Upload or transmit any content that is unlawful, harmful, defamatory, or infringes on third-party rights',
            'Use the website in any way that could damage, disable, or impair its proper functioning',
            'Misrepresent your identity or affiliation when interacting with the website or our team',
          ].map((item) => (
            <li key={item} style={{ fontFamily: 'var(--font-body)', fontSize: 15, lineHeight: 1.82, color: 'var(--text-mid)', marginBottom: 8 }}>
              {item}
            </li>
          ))}
        </ul>
        <p style={{ ...para, marginBottom: 0 }}>
          We reserve the right to terminate or restrict access to any user who violates these conditions.
        </p>
      </Section>

      <Section num={3} title="Intellectual Property">
        <p style={para}>
          All content published on Travel to Dubai — including but not limited to articles, guides, itineraries, photographs, graphics, videos, and the compilation of such materials — is owned by or licensed to Travel to Dubai FZ LLC and is protected by applicable intellectual property laws.
        </p>
        <p style={{ ...para, marginBottom: 0 }}>
          You may share links to our content and quote brief excerpts (up to 100 words) provided that clear attribution is given and a hyperlink to the original article is included. Any other use, including republication, translation, or commercial use, requires prior written consent from Travel to Dubai FZ LLC.
        </p>
      </Section>

      <Section num={4} title="User-Generated Content">
        <p style={para}>
          Where Travel to Dubai permits users to submit comments, reviews, or other content, you grant us a non-exclusive, royalty-free, perpetual licence to use, display, and distribute that content in connection with our services.
        </p>
        <p style={{ ...para, marginBottom: 0 }}>
          You agree that any content you submit will not be defamatory, abusive, unlawful, or in violation of any third-party rights. We reserve the right to remove any user-generated content at our discretion and without notice. We do not endorse or assume responsibility for user-submitted content.
        </p>
      </Section>

      <Section num={5} title="Disclaimer of Warranties">
        <p style={para}>
          The information on this website is provided in good faith for general informational and inspirational purposes only. While we strive for accuracy, travel conditions, visa requirements, pricing, opening hours, and regulations change frequently.
        </p>
        <p style={{ ...para, marginBottom: 0 }}>
          <strong>We strongly advise you to independently verify all information before making any travel, accommodation, visa, or financial decisions.</strong> Travel to Dubai FZ LLC makes no warranties, express or implied, as to the accuracy, completeness, or fitness for any particular purpose of the content on this website.
        </p>
      </Section>

      <Section num={6} title="Limitation of Liability">
        <p style={para}>
          To the maximum extent permitted by applicable law, Travel to Dubai FZ LLC shall not be liable for any direct, indirect, incidental, consequential, or punitive damages arising from your use of, or inability to use, this website or any of its content.
        </p>
        <p style={{ ...para, marginBottom: 0 }}>
          This includes, without limitation, any errors or omissions in content, loss of data, loss of profit, or damages resulting from reliance on information published on this website. Your use of the website is entirely at your own risk.
        </p>
      </Section>

      <Section num={7} title="Third-Party Links and Affiliate Partnerships">
        <p style={para}>
          This website contains links to third-party websites including hotels, tour operators, airlines, and booking platforms. These links are provided for convenience and do not constitute an endorsement of the linked site or its content.
        </p>
        <p style={{ ...para, marginBottom: 0 }}>
          <strong>Affiliate disclosure:</strong> Travel to Dubai participates in affiliate marketing programmes. This means we may earn a commission when you make a booking or purchase through certain links on this website, at no additional cost to you. We only recommend services we genuinely believe will benefit our readers, and affiliate relationships do not influence our editorial content.
        </p>
      </Section>

      <Section num={8} title="Privacy Policy">
        <p style={{ ...para, marginBottom: 0 }}>
          Your privacy matters to us. Our Privacy Policy, which is incorporated into these Terms by reference, explains how we collect, use, and protect your personal data. Please review our{' '}
          <a href="/privacy-policy" style={{ color: 'var(--brand)', textDecoration: 'none', fontWeight: 600 }}>
            Privacy Policy
          </a>{' '}
          before using the website.
        </p>
      </Section>

      <Section num={9} title="Governing Law">
        <p style={{ ...para, marginBottom: 0 }}>
          These Terms and Conditions shall be governed by and construed in accordance with the laws of the Emirate of Dubai and the federal laws of the United Arab Emirates. Any disputes arising under or in connection with these Terms shall be subject to the exclusive jurisdiction of the courts of Dubai, UAE.
        </p>
      </Section>

      <Section num={10} title="Changes to These Terms">
        <p style={{ ...para, marginBottom: 0 }}>
          We may revise these Terms at any time by updating this page. The date at the top of this page will reflect when changes were last made. We encourage you to review these Terms periodically. Material changes will be communicated via a notice on our homepage or by email where appropriate.
        </p>
      </Section>

      <Section num={11} title="Contact Information">
        <p style={para}>
          If you have any questions about these Terms and Conditions, please contact us:
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[
            ['Company', 'Travel to Dubai FZ LLC'],
            ['Email', 'legal@traveltodubai.ae'],
            ['Address', 'Dubai, United Arab Emirates'],
          ].map(([label, value]) => (
            <div key={label} style={{ display: 'flex', gap: 16 }}>
              <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13, color: 'var(--text-dark)', minWidth: 80 }}>{label}</span>
              <span style={{ fontFamily: 'var(--font-body)', fontSize: 15, color: 'var(--text-mid)' }}>{value}</span>
            </div>
          ))}
        </div>
      </Section>
    </StaticLayout>
  );
}
