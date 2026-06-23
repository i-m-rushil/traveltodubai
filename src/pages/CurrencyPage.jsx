import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useIsMobile } from '../hooks/useIsMobile';
import { currencyRates, formatRate } from '../data/uaeInfo';

/* More ▸ Currency — full-page AED converter / rate table. */
export default function CurrencyPage() {
  const isMobile = useIsMobile();
  const [amount, setAmount] = useState(100);

  useEffect(() => {
    document.title = 'Currency – AED Exchange Rates | Travel to Dubai';
  }, []);

  return (
    <div style={{ background: 'var(--sand)', minHeight: '100vh' }}>

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" style={{ background: '#fff', borderBottom: '1px solid var(--border)', padding: '10px 0' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--text-mid)', flexWrap: 'wrap' }}>
          <Link to="/" style={{ color: 'var(--text-mid)', textDecoration: 'none' }}>Home</Link>
          <span style={{ color: 'var(--gray-mid)' }}>›</span>
          <span style={{ color: 'var(--text-mid)' }}>More</span>
          <span style={{ color: 'var(--gray-mid)' }}>›</span>
          <span style={{ color: 'var(--brand)', fontWeight: 600 }}>Currency</span>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ background: 'var(--midnight)', padding: isMobile ? '40px 20px' : '64px 20px' }}>
        <div style={{ maxWidth: 880, margin: '0 auto' }}>
          <h1 style={{ fontFamily: 'var(--font-headline)', fontWeight: 900, fontSize: isMobile ? 30 : 44, color: '#fff', lineHeight: 1.1, marginBottom: 12 }}>
            UAE Dirham (AED) Exchange Rates
          </h1>
          <p style={{ fontFamily: 'var(--font-body)', fontWeight: 300, fontSize: isMobile ? 14 : 17, color: 'rgba(255,255,255,0.6)', maxWidth: 560, lineHeight: 1.7 }}>
            Convert UAE Dirham to major world currencies. Rates are indicative and for travel planning only.
          </p>
        </div>
      </section>

      {/* Converter + table */}
      <div style={{ maxWidth: 880, margin: '0 auto', padding: isMobile ? '28px 16px 56px' : '40px 20px 72px' }}>

        {/* Amount input */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', padding: isMobile ? '18px' : '22px 26px', marginBottom: 24, display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <label style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13, color: 'var(--text-dark)' }}>Amount in AED</label>
          <input
            type="number" min="0" value={amount}
            onChange={e => setAmount(Math.max(0, Number(e.target.value)))}
            style={{ flex: 1, minWidth: 120, padding: '11px 14px', borderRadius: 8, border: '1px solid var(--border)', fontFamily: 'var(--font-ui)', fontSize: 15, fontWeight: 700, color: 'var(--brand)', outline: 'none' }}
          />
        </div>

        {/* Rate table */}
        <div style={{ background: '#fff', borderRadius: 12, border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)', overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 12, padding: '12px 20px', background: 'var(--midnight)', fontFamily: 'var(--font-ui)', fontSize: 11, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.7)' }}>
            <span>Currency</span>
            <span style={{ textAlign: 'right' }}>1 AED =</span>
            <span style={{ textAlign: 'right', minWidth: isMobile ? 80 : 120 }}>{amount} AED</span>
          </div>
          {currencyRates.map(({ code, flag, name, rate }, i) => (
            <div key={code} style={{
              display: 'grid', gridTemplateColumns: '1fr auto auto', gap: 12, alignItems: 'center',
              padding: '12px 20px', borderBottom: i < currencyRates.length - 1 ? '1px solid var(--border)' : 'none',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                <span style={{ fontSize: 20, lineHeight: 1 }}>{flag}</span>
                <div>
                  <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: 13, color: 'var(--text-dark)' }}>{code}</div>
                  <div style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-light)' }}>{name}</div>
                </div>
              </div>
              <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: 13, color: 'var(--text-mid)', textAlign: 'right' }}>
                {formatRate(rate)}
              </div>
              <div style={{ fontFamily: 'var(--font-ui)', fontWeight: 800, fontSize: 14, color: 'var(--brand)', textAlign: 'right', minWidth: isMobile ? 80 : 120 }}>
                {(rate * amount).toLocaleString(undefined, { maximumFractionDigits: 2 })}
              </div>
            </div>
          ))}
        </div>

        <p style={{ fontFamily: 'var(--font-ui)', fontSize: 11, color: 'var(--text-light)', marginTop: 14 }}>
          Rates updated daily and are indicative. For travel use only — confirm with your bank or exchange.
        </p>
      </div>
    </div>
  );
}
