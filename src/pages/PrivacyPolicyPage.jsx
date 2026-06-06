// === FILE: src/pages/PrivacyPolicyPage.jsx ===
import { useEffect } from 'react';
import StaticLayout from './StaticLayout';

const LAST_UPDATED = 'June 2026';
const COMPANY = 'Travel to Dubai FZ LLC';
const LOCATION = 'Dubai Media City, Dubai, UAE';
const CONTACT_EMAIL = 'hello@traveltodubai.ae';

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

const para = {
  fontFamily: 'var(--font-body)',
  fontSize: 15,
  lineHeight: 1.82,
  color: 'var(--text-mid)',
  marginBottom: 16,
};

const card = {
  background: '#fff',
  borderRadius: 10,
  padding: '24px 28px',
  border: '1px solid var(--border)',
  boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
};

const subHeading = {
  fontFamily: 'var(--font-headline)',
  fontWeight: 700,
  fontSize: 14,
  color: 'var(--text-dark)',
  marginBottom: 6,
  marginTop: 20,
};

const bullet = {
  display: 'flex',
  gap: 10,
  alignItems: 'flex-start',
  marginBottom: 8,
  fontFamily: 'var(--font-body)',
  fontSize: 15,
  lineHeight: 1.75,
  color: 'var(--text-mid)',
};

function Bullet({ children }) {
  return (
    <li style={bullet}>
      <span style={{ color: 'var(--brand)', fontWeight: 900, marginTop: 4, flexShrink: 0, fontSize: 12 }}>—</span>
      <span>{children}</span>
    </li>
  );
}

function Section({ title, children, mt = 44 }) {
  return (
    <section style={{ marginTop: mt }}>
      <h2 style={sectionHeading}>{title}</h2>
      <div style={card}>{children}</div>
    </section>
  );
}

export default function PrivacyPolicyPage() {
  useEffect(() => {
    document.title = 'Privacy Policy | Travel to Dubai';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', "Travel to Dubai's Privacy Policy — how we collect, use and protect your personal information.");
    window.scrollTo(0, 0);
  }, []);

  return (
    <StaticLayout
      title="Privacy Policy"
      subtitle={`Last updated: ${LAST_UPDATED}`}
    >

      {/* Meta notice bar */}
      <div style={{
        background: 'rgba(201,160,80,0.08)',
        border: '1px solid var(--gold-border)',
        borderRadius: 8,
        padding: '14px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        marginBottom: 8,
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        <p style={{ ...para, marginBottom: 0, fontSize: 13 }}>
          This policy applies to all visitors and users of traveltodubai.ae. By using our website, you agree to the practices described here. If you do not agree, please discontinue use of the site.
        </p>
      </div>

      {/* 1. Introduction */}
      <Section title="1. Introduction" mt={32}>
        <p style={para}>
          {COMPANY} ("we", "us", or "our"), a free-zone company registered in {LOCATION}, operates the website traveltodubai.ae (the "Site"). We are committed to protecting the privacy and personal information of everyone who visits and uses our Site.
        </p>
        <p style={para}>
          This Privacy Policy explains what information we collect when you visit our Site, how we use it, who we share it with, and the rights you have in relation to your personal data. It applies to all pages, features, forms, and newsletters operated under the traveltodubai.ae domain.
        </p>
        <p style={{ ...para, marginBottom: 0 }}>
          We recommend reading this policy in full. If you have questions about any section, please contact us at <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--brand)', fontWeight: 600 }}>{CONTACT_EMAIL}</a>.
        </p>
      </Section>

      {/* 2. What We Collect */}
      <Section title="2. What Information We Collect">
        <p style={para}>
          We collect different types of information depending on how you interact with the Site. This includes:
        </p>

        <div style={subHeading}>Personal Information</div>
        <p style={{ ...para, marginBottom: 8 }}>
          Information you provide directly to us when you fill out a contact form, subscribe to our newsletter, or submit editorial feedback. This may include:
        </p>
        <ul style={{ padding: 0, margin: '0 0 16px', listStyle: 'none' }}>
          <Bullet>Full name</Bullet>
          <Bullet>Email address</Bullet>
          <Bullet>The content of messages you send us through our contact form</Bullet>
          <Bullet>Your stated subject or reason for contact</Bullet>
        </ul>
        <p style={{ ...para }}>
          We do not collect payment information. All financial transactions for any affiliated booking services are handled by third-party providers with their own privacy policies.
        </p>

        <div style={subHeading}>Usage Data</div>
        <p style={para}>
          When you browse our Site, we automatically collect certain technical information, including your IP address (anonymised where possible), browser type and version, the pages you visit, the time and duration of your visit, referring URLs, and device type. This data is collected through our analytics systems and is used in aggregate form to understand how visitors use the Site.
        </p>

        <div style={subHeading}>Cookies and Similar Technologies</div>
        <p style={para}>
          We use cookies — small text files placed on your device — to remember your preferences, analyse traffic, and support certain site functionality. For full details, see Section 4 below.
        </p>

        <div style={{ ...subHeading, marginTop: 16 }}>Approximate Location</div>
        <p style={{ ...para, marginBottom: 0 }}>
          We may infer your general geographic location (country or region) from your IP address in order to display region-relevant content and understand our readership. We do not collect precise GPS or device location data.
        </p>
      </Section>

      {/* 3. How We Use Your Information */}
      <Section title="3. How We Use Your Information">
        <p style={para}>
          We use the information we collect for the following purposes:
        </p>
        <ul style={{ padding: 0, margin: '0 0 16px', listStyle: 'none' }}>
          <Bullet>To operate and improve the Site — understanding what content is useful, where navigation fails, and how to prioritise editorial resources.</Bullet>
          <Bullet>To respond to messages and enquiries submitted through our contact form.</Bullet>
          <Bullet>To send editorial newsletters to subscribers who have explicitly opted in — these contain travel guides, new articles, and seasonal tips related to Dubai travel.</Bullet>
          <Bullet>To personalise content where possible — for example, showing region-relevant travel information based on your inferred location.</Bullet>
          <Bullet>To conduct internal analytics and audience research to help us serve our readers better.</Bullet>
          <Bullet>To comply with applicable laws and respond to lawful requests from relevant authorities.</Bullet>
        </ul>
        <p style={{ ...para, marginBottom: 0 }}>
          We do not sell your personal data to third parties. We do not use your information to build advertising profiles for external ad networks.
        </p>
      </Section>

      {/* 4. Cookies */}
      <Section title="4. Cookies and Tracking Technologies">
        <p style={para}>
          Our Site uses the following categories of cookies:
        </p>

        {[
          {
            name: 'Strictly Necessary',
            desc: 'These cookies are required for the Site to function and cannot be switched off. They are typically set in response to actions you take such as setting your privacy preferences or filling in forms. No personal data is stored in these cookies beyond what is technically necessary.',
          },
          {
            name: 'Analytics / Performance',
            desc: 'These cookies allow us to measure visits and traffic sources so we can assess and improve site performance. All information is collected in aggregate and anonymised — we cannot identify individual visitors from this data. We use Google Analytics for this purpose (see Section 5).',
          },
          {
            name: 'Functional',
            desc: 'These cookies enable enhanced functionality, such as remembering your newsletter subscription preferences or display settings. Disabling them may affect the user experience.',
          },
          {
            name: 'Third-Party / Marketing',
            desc: 'Where we embed third-party content (social media widgets, video players, affiliate booking tools), those providers may set their own cookies subject to their own privacy policies. We do not control these cookies.',
          },
        ].map(({ name, desc }) => (
          <div key={name} style={{ marginBottom: 16 }}>
            <div style={{ ...subHeading, marginTop: 0, marginBottom: 4 }}>{name} Cookies</div>
            <p style={{ ...para, marginBottom: 0 }}>{desc}</p>
          </div>
        ))}

        <p style={{ ...para, marginTop: 12, marginBottom: 0 }}>
          You can control and delete cookies through your browser settings at any time. Note that disabling certain cookies may limit your ability to use some features of the Site. For more information, visit <a href="https://www.allaboutcookies.org" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand)', fontWeight: 600 }}>allaboutcookies.org</a>.
        </p>
      </Section>

      {/* 5. Third-Party Services */}
      <Section title="5. Third-Party Services">
        <p style={para}>
          We work with a small number of trusted third-party providers whose services are integrated into the Site. These providers have their own privacy policies and data practices:
        </p>

        {[
          {
            name: 'Google Analytics',
            desc: 'We use Google Analytics to understand how visitors use our Site. Google Analytics collects anonymised usage data such as pages viewed, session duration, and device type. We have enabled IP anonymisation. Google\'s privacy policy is available at policies.google.com/privacy.',
          },
          {
            name: 'Social Media Embeds',
            desc: 'Some articles and pages include embedded content from social media platforms (Instagram, YouTube, X/Twitter). When you interact with or view these embeds, those platforms may collect data about you subject to their own terms of service.',
          },
          {
            name: 'Affiliate and Booking Links',
            desc: 'We include affiliate links to accommodation, tour, and experience booking platforms. If you click these links and make a purchase, we may receive a small commission at no additional cost to you. Clicking affiliate links takes you to third-party sites governed by their own privacy policies.',
          },
          {
            name: 'Email Newsletter Provider',
            desc: 'We use a third-party email service provider to manage and send our subscriber newsletters. Your email address is stored securely with this provider and is not shared with other parties. You can unsubscribe from any newsletter at any time using the link included in every email.',
          },
        ].map(({ name, desc }) => (
          <div key={name} style={{ marginBottom: 16 }}>
            <div style={{ ...subHeading, marginTop: 0, marginBottom: 4 }}>{name}</div>
            <p style={{ ...para, marginBottom: 0 }}>{desc}</p>
          </div>
        ))}
      </Section>

      {/* 6. Data Retention */}
      <Section title="6. Data Retention">
        <p style={para}>
          We retain your personal data only for as long as is necessary to fulfil the purpose for which it was collected, or as required by applicable law:
        </p>
        <ul style={{ padding: 0, margin: '0 0 16px', listStyle: 'none' }}>
          <Bullet>Contact form submissions are retained for up to 24 months from the date of submission, after which they are securely deleted.</Bullet>
          <Bullet>Newsletter subscriber records are retained for as long as the subscription is active. Upon unsubscription, your email address is removed from our mailing list within 30 days.</Bullet>
          <Bullet>Anonymised analytics data is retained in aggregated form indefinitely as it cannot be used to identify individuals.</Bullet>
          <Bullet>Technical server logs containing IP addresses are retained for up to 90 days for security and diagnostic purposes, then automatically deleted.</Bullet>
        </ul>
        <p style={{ ...para, marginBottom: 0 }}>
          If you request deletion of your personal data, we will fulfil your request within 30 days subject to any legal obligations that require us to retain certain records.
        </p>
      </Section>

      {/* 7. Your Rights */}
      <Section title="7. Your Rights">
        <p style={para}>
          Depending on your location, you may have the following rights in relation to your personal data. We honour these rights for all users regardless of jurisdiction:
        </p>
        <ul style={{ padding: 0, margin: '0 0 16px', listStyle: 'none' }}>
          <Bullet><strong>Right of Access:</strong> You may request a copy of the personal data we hold about you.</Bullet>
          <Bullet><strong>Right to Correction:</strong> You may request that we correct inaccurate or incomplete personal data.</Bullet>
          <Bullet><strong>Right to Deletion:</strong> You may request that we delete your personal data, subject to our legal obligations to retain certain records.</Bullet>
          <Bullet><strong>Right to Restrict Processing:</strong> You may ask us to restrict how we use your data in certain circumstances.</Bullet>
          <Bullet><strong>Right to Data Portability:</strong> Where technically feasible, you may request your data in a structured, machine-readable format.</Bullet>
          <Bullet><strong>Right to Object:</strong> You may object to our processing of your personal data where we rely on legitimate interests as our legal basis.</Bullet>
          <Bullet><strong>Right to Opt Out of Marketing:</strong> You may unsubscribe from newsletters at any time via the unsubscribe link in any email, or by contacting us directly.</Bullet>
        </ul>
        <p style={{ ...para, marginBottom: 0 }}>
          To exercise any of these rights, please contact us at <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--brand)', fontWeight: 600 }}>{CONTACT_EMAIL}</a>. We will respond within 30 days. We may need to verify your identity before fulfilling a request.
        </p>
      </Section>

      {/* 8. Children's Privacy */}
      <Section title="8. Children's Privacy">
        <p style={para}>
          This Site is not directed at children under the age of 13. We do not knowingly collect personal data from children under 13. If you believe that a child under 13 has provided personal information to us, please contact us immediately at <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--brand)', fontWeight: 600 }}>{CONTACT_EMAIL}</a> and we will take prompt steps to delete that information.
        </p>
        <p style={{ ...para, marginBottom: 0 }}>
          We encourage parents and guardians to monitor their children's online activities and to familiarise themselves with the types of content available on travel websites.
        </p>
      </Section>

      {/* 9. Changes to This Policy */}
      <Section title="9. Changes to This Policy">
        <p style={para}>
          We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or for other operational reasons. When we make significant changes, we will update the "Last updated" date at the top of this page and, where appropriate, notify subscribers by email.
        </p>
        <p style={{ ...para, marginBottom: 0 }}>
          We encourage you to review this page periodically. Your continued use of the Site following any changes constitutes your acceptance of the updated Privacy Policy. If you do not agree with the revised policy, you should discontinue using the Site.
        </p>
      </Section>

      {/* 10. Contact Us */}
      <Section title="10. Contact Us">
        <p style={para}>
          If you have questions, concerns, or requests relating to this Privacy Policy or the way we handle your personal data, please contact us:
        </p>
        <div style={{
          background: 'var(--sand)',
          borderRadius: 8,
          padding: '18px 22px',
          display: 'inline-block',
          marginBottom: 16,
        }}>
          <address style={{
            fontFamily: 'var(--font-body)',
            fontStyle: 'normal',
            fontSize: 14,
            lineHeight: 1.9,
            color: 'var(--text-mid)',
          }}>
            <strong style={{ color: 'var(--text-dark)', display: 'block', marginBottom: 4 }}>{COMPANY}</strong>
            {LOCATION}<br />
            Email: <a href={`mailto:${CONTACT_EMAIL}`} style={{ color: 'var(--brand)', fontWeight: 600 }}>{CONTACT_EMAIL}</a>
          </address>
        </div>
        <p style={{ ...para, marginBottom: 0 }}>
          We aim to respond to all privacy-related enquiries within 30 days. If you are unsatisfied with our response, you have the right to raise a complaint with the relevant data protection authority in your jurisdiction.
        </p>
      </Section>

      {/* Footer note */}
      <div style={{
        marginTop: 44,
        paddingTop: 24,
        borderTop: '1px solid var(--border)',
        fontFamily: 'var(--font-ui)',
        fontSize: 12,
        color: 'var(--text-light)',
        textAlign: 'center',
      }}>
        &copy; {new Date().getFullYear()} {COMPANY}. All rights reserved. &middot; Last reviewed: {LAST_UPDATED}
      </div>
    </StaticLayout>
  );
}
