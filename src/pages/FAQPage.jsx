// === FILE: src/pages/FAQPage.jsx ===
import { useState, useEffect } from 'react';
import StaticLayout from './StaticLayout';

const faqs = [
  {
    q: 'Do I need a visa to visit Dubai?',
    a: 'It depends on your nationality. Citizens of over 50 countries — including the UK, USA, EU member states, Australia, Canada, and most of the GCC — receive a visa on arrival or visa-free entry, typically valid for 30 to 90 days. For other nationalities, a UAE e-visa can be applied for online through the ICP (Federal Authority for Identity, Citizenship, Customs & Port Security) portal or through a licensed travel agent, often processed within 2–5 business days. We strongly recommend checking the latest requirements directly with the UAE embassy or official government portals at least two weeks before travel, as entry policies can change. Dubai also offers a range of specialist visa types including the Digital Nomad Visa and Green Visa for longer stays.',
  },
  {
    q: 'What is the best time to visit Dubai?',
    a: 'The ideal window for most visitors is October through April. During these months, daytime temperatures sit comfortably between 22°C and 32°C, humidity is low, and the city\'s full outdoor calendar — beaches, desert excursions, rooftop terraces, and walking tours — is in full swing. Major events including the Dubai Shopping Festival, Dubai Food Festival, and the Dubai World Cup all fall in this period. June through August is the opposite extreme: temperatures regularly hit 43–48°C with punishing humidity, and most outdoor activities are impractical by day. However, summer also brings hotel rates 40–60% lower than peak, quieter malls and attractions, and some genuinely good indoor deals. If budget is a priority and you don\'t mind the heat, summer can be a smart choice — just plan your mornings and evenings outdoors and retreat inside during peak heat hours.',
  },
  {
    q: 'What should I wear in Dubai?',
    a: 'Dubai is considerably more relaxed on dress than many assume. The day-to-day standard for tourists is smart casual: t-shirts, jeans, sundresses, and shorts are all perfectly acceptable in most of the city. That said, there are specific contexts where modesty is expected. In mosques and religious sites, both men and women should cover shoulders and knees; women will also need to cover their hair. In malls, markets, and public areas, very revealing clothing (think crop tops, very short shorts, or see-through garments) is frowned upon and can attract unwanted attention. Swimwear is entirely appropriate at beaches, hotel pools, and beach clubs — just cover up when leaving those areas. During Ramadan, it\'s respectful to dress more conservatively throughout the day regardless of location.',
  },
  {
    q: 'Is Dubai safe for tourists?',
    a: 'Dubai is consistently ranked among the safest cities in the world for tourists. Violent crime rates are exceptionally low, petty theft is rare, and solo travellers — including solo women — regularly report feeling comfortable and secure in both busy and quieter areas at any hour. The city is well-lit, well-patrolled, and operates under a strong rule of law where violations are taken seriously. Emergency services are responsive and the police are generally approachable and helpful with tourists. Standard urban travel awareness still applies: look after your valuables, take licensed taxis rather than unmarked vehicles, and be aware that certain behaviours legal elsewhere — like public intoxication, some public displays of affection, or photographing certain government buildings — are not permitted and can result in fines or worse. Overall, safety is one of Dubai\'s strongest attributes as a destination.',
  },
  {
    q: 'What currency is used in Dubai?',
    a: 'The currency of Dubai — and the UAE as a whole — is the UAE Dirham (AED), also written as Dhs. The dirham has been pegged to the US Dollar at approximately AED 3.67 per USD since 1997, making it very stable. Dubai is a highly cashless city and credit and debit cards (Visa, Mastercard, Amex) are accepted virtually everywhere — hotels, taxis, supermarkets, souks, and most street restaurants. However, having some cash on hand is useful for smaller purchases, tips, and in the traditional gold and spice souks where haggling often works better in cash. ATMs are widespread throughout the city and generally reliable. The best exchange rates are usually found at licensed exchange bureaux (like UAE Exchange or Al Ansari) rather than airport desks, which carry a premium. Inform your bank before travelling to avoid your card being flagged for overseas use.',
  },
  {
    q: 'Can tourists drink alcohol in Dubai?',
    a: 'Yes — with some important context. Alcohol is legal and freely available in Dubai, but only in licensed venues. These include hotel bars and restaurants, standalone licensed restaurants, nightclubs, and a small number of licensed bars in designated leisure zones. You will not find alcohol served in most local restaurants, cafés, shopping mall food courts, or any public space. Off-licences (bottle shops) exist but require a residency permit to purchase from in most cases. For tourists, the practical rule is simple: if you\'re in a hotel or a venue that serves food and appears to have a bar, you can almost certainly order alcohol there. Dubai\'s hotel bar scene is actually excellent, with internationally experienced bartenders and a full range of wine, spirits, and craft beer. Public intoxication is illegal and can result in arrest, so enjoy responsibly.',
  },
  {
    q: 'How do I get around Dubai?',
    a: 'Dubai offers a range of transport options to suit every budget and itinerary. The Dubai Metro (Red and Green lines) is the most cost-effective way to travel between major tourist areas — it connects the airport to Downtown, the Mall of the Emirates, Dubai Marina, and JBR. A rechargeable Nol card (AED 25, with AED 19 in pre-loaded credit) works across the metro, tram, RTA buses, and water taxis. For areas the metro doesn\'t reach, Careem and Uber are both widely used, affordable, and professionally run. Traditional metered yellow taxis are also reliable, honest, and readily available via the RTA app or street hails. Dubai\'s water taxi (abra) network is not just atmospheric — it\'s genuinely useful for crossing the creek between Deira and Bur Dubai. Rental cars are worth considering if you plan to explore beyond the city limits, including road trips to Abu Dhabi, Hatta, or the Northern Emirates.',
  },
  {
    q: 'What language is spoken in Dubai?',
    a: 'Arabic is the official language of the UAE and of Dubai specifically. However, English is the de facto working language of the city and is universally spoken across business, hospitality, retail, and daily urban life. All road signs, menus, attraction signage, and official government communications are in both Arabic and English. Taxi drivers, hotel staff, shopkeepers, and most residents you\'ll encounter will speak English comfortably. Given that less than 15% of Dubai\'s population is Emirati, the city is home to an enormous multilingual community — Hindi, Urdu, Tagalog, Malayalam, and Mandarin are all widely spoken in different residential and commercial pockets. As a tourist, you will have absolutely no difficulty navigating Dubai in English alone.',
  },
  {
    q: 'How much does a trip to Dubai typically cost?',
    a: 'Dubai can be done on a wide range of budgets, but accommodation is by far the biggest variable. On a budget (staying in a hostel or a modest 3-star hotel in Deira), daily costs of AED 280–320 (roughly USD 75–85) are achievable covering accommodation, public transport, eating at local restaurants, and entry to a few attractions. Mid-range travellers staying in a 4-star hotel in a central area and mixing restaurants with casual dining should expect AED 700–900 per day (USD 190–245). For a luxury experience — five-star hotel, fine dining, private excursions — AED 1,800 and upward per day is realistic, with no real ceiling if you\'re staying at the Burj Al Arab or booking private desert experiences. Flights are the other major cost and vary enormously by origin. Many major airlines fly direct to Dubai International Airport (DXB), often with competitive pricing, especially for European and Asian departures.',
  },
  {
    q: 'Are there things I should avoid doing in Dubai?',
    a: 'Yes — and being aware of these will save you significant trouble. Public displays of affection beyond brief hand-holding are frowned upon and can result in fines or arrest in serious cases. Photographing people — especially Emirati women, private individuals, or government and military buildings — without consent is a punishable offence and should be avoided entirely. Swearing or making obscene gestures in public is illegal and has resulted in tourist arrests and deportations. During Ramadan, eating, drinking, or smoking in public during daylight hours is prohibited (non-Muslims are generally given grace if discreet, but respect is expected). Importing certain medications or over-the-counter drugs that are legal elsewhere — including some pain medications and sleep aids — requires prior approval; check the UAE\'s Ministry of Health list before you travel. Finally, social media posts that are considered defamatory, sexually explicit, or critical of the UAE government or ruling family are taken very seriously and have resulted in prosecution of both residents and visitors.',
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

function FAQItem({ faq, index }) {
  const [open, setOpen] = useState(false);
  const [hov, setHov] = useState(false);

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: 10,
        border: `1px solid ${open ? 'var(--brand)' : 'var(--border)'}`,
        boxShadow: open ? '0 2px 12px rgba(228,61,48,0.08)' : '0 1px 4px rgba(0,0,0,0.05)',
        overflow: 'hidden',
        transition: 'border-color 0.2s, box-shadow 0.2s',
      }}
    >
      <button
        onClick={() => setOpen(o => !o)}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        aria-expanded={open}
        style={{
          width: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          padding: '20px 24px',
          background: open ? 'rgba(228,61,48,0.03)' : hov ? 'rgba(0,0,0,0.015)' : '#fff',
          border: 'none',
          cursor: 'pointer',
          textAlign: 'left',
          transition: 'background 0.18s',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <span style={{
            fontFamily: 'var(--font-ui)',
            fontWeight: 800,
            fontSize: 11,
            color: open ? 'var(--brand)' : 'var(--text-light)',
            minWidth: 22,
            letterSpacing: '0.04em',
            transition: 'color 0.18s',
          }}>
            {String(index + 1).padStart(2, '0')}
          </span>
          <span style={{
            fontFamily: 'var(--font-headline)',
            fontWeight: 600,
            fontSize: 15,
            color: open ? 'var(--brand)' : 'var(--text-dark)',
            lineHeight: 1.4,
            transition: 'color 0.18s',
          }}>
            {faq.q}
          </span>
        </div>
        <span style={{
          flexShrink: 0,
          width: 28,
          height: 28,
          borderRadius: '50%',
          background: open ? 'var(--brand)' : 'var(--border)',
          color: open ? '#fff' : 'var(--text-mid)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 18,
          fontWeight: 300,
          transition: 'background 0.2s, color 0.2s',
          lineHeight: 1,
        }}>
          {open ? '−' : '+'}
        </span>
      </button>

      {open && (
        <div style={{
          padding: '4px 24px 24px 60px',
          borderTop: '1px solid var(--border)',
        }}>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontSize: 15,
            lineHeight: 1.82,
            color: 'var(--text-mid)',
            marginTop: 16,
            marginBottom: 0,
          }}>
            {faq.a}
          </p>
        </div>
      )}
    </div>
  );
}

export default function FAQPage() {
  useEffect(() => {
    document.title = 'Frequently Asked Questions | Travel to Dubai';
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute('content', 'Got questions about visiting Dubai? Our comprehensive FAQ covers visas, costs, safety, dress code, alcohol, transport and more.');
    window.scrollTo(0, 0);
  }, []);

  return (
    <StaticLayout
      title="Frequently Asked Questions"
      subtitle="Everything you need to know before your trip to Dubai — answered honestly"
    >
      <section>
        <h2 style={sectionHeading}>Common Questions About Visiting Dubai</h2>
        <p style={{
          fontFamily: 'var(--font-body)',
          fontSize: 15,
          lineHeight: 1.82,
          color: 'var(--text-mid)',
          marginBottom: 28,
        }}>
          Our editorial team answers the questions we receive most often — covering visas, safety, costs, culture, and practicalities. All answers are reviewed and updated regularly to reflect current conditions on the ground.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {faqs.map((faq, i) => (
            <FAQItem key={i} faq={faq} index={i} />
          ))}
        </div>
      </section>

      {/* Still have questions CTA */}
      <section style={{ marginTop: 48 }}>
        <div style={{
          background: '#fff',
          borderRadius: 10,
          padding: '28px 32px',
          border: '1px solid var(--border)',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)',
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
              fontSize: 17,
              color: 'var(--text-dark)',
              marginBottom: 6,
            }}>
              Still have a question?
            </div>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontSize: 14,
              lineHeight: 1.7,
              color: 'var(--text-mid)',
              marginBottom: 0,
            }}>
              We read every message. Send us your question and one of our Dubai-based editors will respond within 2 business days.
            </p>
          </div>
          <a
            href="/contact"
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
            Ask Us
          </a>
        </div>
      </section>
    </StaticLayout>
  );
}
