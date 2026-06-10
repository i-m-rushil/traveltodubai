import { useState } from 'react';
import { fmtPrice, fmtDuration, airlineLogo } from '../../lib/travelApi';

const skeletonCSS = `
  @keyframes ttdPulse { 0%,100% { opacity: 0.55; } 50% { opacity: 1; } }
  .ttd-skel { animation: ttdPulse 1.4s ease-in-out infinite; background: #eee; border-radius: 8px; }
  .ttd-result-card { transition: box-shadow 0.2s ease, transform 0.2s ease; }
  .ttd-result-card:hover { box-shadow: 0 2px 4px rgba(0,0,0,0.08), 0 14px 32px rgba(0,0,0,0.12); transform: translateY(-2px); }
  .ttd-sort-btn { transition: all 0.15s; }
  .ttd-sort-btn:hover { background: #f5f5f5 !important; color: #333 !important; }
`;

const fmtTime = (iso) => iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '—';
const fmtDay  = (iso) => iso ? new Date(iso).toLocaleDateString([], { day: 'numeric', month: 'short' }) : '';

function addMinutes(iso, minutes) {
  if (!iso || minutes == null) return null;
  return new Date(new Date(iso).getTime() + minutes * 60000).toISOString();
}

function StopsBadge({ transfers }) {
  const nonstop = transfers === 0;
  return (
    <span style={{
      background: nonstop ? 'rgba(13,148,136,0.08)' : '#f5f5f5',
      color: nonstop ? '#0D9488' : '#717171',
      fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '20px',
      border: `1px solid ${nonstop ? 'rgba(13,148,136,0.2)' : '#e5e5e5'}`,
      whiteSpace: 'nowrap',
    }}>
      {nonstop ? 'Nonstop' : `${transfers} stop${transfers > 1 ? 's' : ''}`}
    </span>
  );
}

function FlightCard({ offer, onBook, originCode }) {
  const arrivalAt = addMinutes(offer.departureAt, offer.durationMinutes);

  return (
    <div className="ttd-result-card" style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: '16px', padding: '20px 24px', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap' }}>

      {/* Airline */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '5px', width: '88px', flexShrink: 0 }}>
        <img src={airlineLogo(offer.airlineIata)} alt={offer.airlineName}
          style={{ width: '80px', height: '26px', objectFit: 'contain' }}
          onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        <div style={{ fontSize: '11px', color: '#555', fontWeight: 600, textAlign: 'center', lineHeight: 1.3 }}>{offer.airlineName}</div>
        <div style={{ fontSize: '10px', color: '#aaa' }}>{offer.airlineIata} {offer.flightNumber}</div>
      </div>

      {/* Route */}
      <div style={{ flex: '1 1 240px', display: 'flex', alignItems: 'center', gap: '0', minWidth: 0 }}>
        {/* Departure */}
        <div style={{ textAlign: 'center', minWidth: '64px' }}>
          <div style={{ fontWeight: 800, fontSize: '22px', color: '#222', letterSpacing: '-0.02em', lineHeight: 1 }}>{fmtTime(offer.departureAt)}</div>
          <div style={{ fontSize: '11px', color: '#717171', marginTop: '3px' }}>{fmtDay(offer.departureAt)}</div>
          <div style={{ fontSize: '11px', color: '#aaa', marginTop: '1px', fontWeight: 600 }}>{originCode || '—'}</div>
        </div>

        {/* Duration bar */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', padding: '0 14px' }}>
          <div style={{ fontSize: '11px', color: '#999', fontWeight: 500 }}>
            {offer.durationMinutes ? fmtDuration(offer.durationMinutes) : ''}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', width: '100%', gap: '3px' }}>
            <div style={{ flex: 1, height: '1.5px', background: '#ddd', position: 'relative' }}>
              {offer.transfers > 0 && (
                <div style={{ position: 'absolute', left: '50%', top: '50%', transform: 'translate(-50%, -50%)', width: '6px', height: '6px', borderRadius: '50%', background: '#bbb', border: '2px solid #fff', outline: '1px solid #ddd' }} />
              )}
            </div>
            <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
              <path d="M1 4.5h7M5 1.5l3 3-3 3" stroke="#bbb" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
          <StopsBadge transfers={offer.transfers} />
        </div>

        {/* Arrival */}
        <div style={{ textAlign: 'center', minWidth: '64px' }}>
          <div style={{ fontWeight: 800, fontSize: '22px', color: '#222', letterSpacing: '-0.02em', lineHeight: 1 }}>{arrivalAt ? fmtTime(arrivalAt) : '—'}</div>
          <div style={{ fontSize: '11px', color: '#717171', marginTop: '3px' }}>{arrivalAt ? fmtDay(arrivalAt) : ''}</div>
          <div style={{ fontSize: '11px', color: '#aaa', marginTop: '1px', fontWeight: 600 }}>DXB</div>
        </div>
      </div>

      {/* Return info (round trip) */}
      {offer.returnAt && (
        <div style={{ fontSize: '11px', color: '#717171', background: '#f7f7f7', borderRadius: '8px', padding: '5px 10px', whiteSpace: 'nowrap', flexShrink: 0 }}>
          Return {fmtDay(offer.returnAt)}
        </div>
      )}

      {/* Price + Book */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: 'auto', flexShrink: 0 }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '10px', color: '#aaa', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>from</div>
          <div style={{ fontWeight: 800, fontSize: '24px', color: '#222', letterSpacing: '-0.03em', lineHeight: 1 }}>{fmtPrice(offer.price, offer.currency)}</div>
          <div style={{ fontSize: '10px', color: '#aaa', marginTop: '2px' }}>per person</div>
        </div>
        <button onClick={() => onBook(offer)}
          style={{ padding: '13px 22px', background: 'linear-gradient(135deg, #b1132f, #8e0f26)', color: '#fff', border: 'none', borderRadius: '12px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(177,19,47,0.3)', whiteSpace: 'nowrap', letterSpacing: '0.2px', transition: 'all 0.15s' }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = '0 4px 14px rgba(177,19,47,0.45)'; }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(177,19,47,0.3)'; }}>
          Select →
        </button>
      </div>
    </div>
  );
}

function HotelCard({ offer, onBook }) {
  const perNight = offer.nights > 0 ? offer.priceFrom / offer.nights : offer.priceFrom;
  return (
    <div className="ttd-result-card" style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.05)', display: 'flex', flexDirection: 'column' }}>
      <div style={{ height: '150px', background: '#f0f0f0' }}>
        <img src={offer.photoUrl} alt={offer.name} loading="lazy" style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          onError={(e) => { e.currentTarget.style.display = 'none'; }} />
      </div>
      <div style={{ padding: '14px 16px 16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
          <div style={{ fontWeight: 700, fontSize: '14px', color: '#222', lineHeight: 1.3 }}>{offer.name}</div>
          {offer.stars ? <span style={{ color: '#C9A050', fontSize: '12px', whiteSpace: 'nowrap', flexShrink: 0 }}>{'★'.repeat(offer.stars)}</span> : null}
        </div>
        <div style={{ marginTop: 'auto', paddingTop: '12px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '8px' }}>
          <div>
            <div style={{ fontWeight: 800, fontSize: '18px', color: '#b1132f', letterSpacing: '-0.02em' }}>{fmtPrice(perNight, offer.currency)}<span style={{ fontSize: '12px', color: '#717171', fontWeight: 500 }}> / night</span></div>
            <div style={{ fontSize: '11px', color: '#717171', marginTop: '2px' }}>{fmtPrice(offer.priceFrom, offer.currency)} total · {offer.nights} night{offer.nights !== 1 ? 's' : ''}</div>
          </div>
          <button onClick={() => onBook(offer)} style={{ padding: '10px 18px', background: 'linear-gradient(135deg, #b1132f, #8e0f26)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '12px', cursor: 'pointer', whiteSpace: 'nowrap' }}>
            Book →
          </button>
        </div>
      </div>
    </div>
  );
}

function Skeletons({ type }) {
  if (type === 'hotels') {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
        {[...Array(6)].map((_, i) => (
          <div key={i} style={{ border: '1px solid #ebebeb', borderRadius: '16px', overflow: 'hidden' }}>
            <div className="ttd-skel" style={{ height: '150px', borderRadius: 0 }} />
            <div style={{ padding: '14px 16px' }}>
              <div className="ttd-skel" style={{ height: '14px', width: '70%', marginBottom: '10px' }} />
              <div className="ttd-skel" style={{ height: '20px', width: '40%' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {[...Array(5)].map((_, i) => (
        <div key={i} style={{ border: '1px solid #ebebeb', borderRadius: '16px', padding: '20px 24px', display: 'flex', gap: '20px', alignItems: 'center' }}>
          <div className="ttd-skel" style={{ height: '26px', width: '80px', flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', gap: '12px', alignItems: 'center' }}>
            <div className="ttd-skel" style={{ height: '28px', width: '52px' }} />
            <div className="ttd-skel" style={{ flex: 1, height: '2px' }} />
            <div className="ttd-skel" style={{ height: '28px', width: '52px' }} />
          </div>
          <div className="ttd-skel" style={{ height: '32px', width: '80px', marginLeft: 'auto', flexShrink: 0 }} />
          <div className="ttd-skel" style={{ height: '44px', width: '96px', borderRadius: '12px', flexShrink: 0 }} />
        </div>
      ))}
    </div>
  );
}

export default function TravelSearchResults({ state, onBook, onFallbackClick }) {
  const [sortBy, setSortBy] = useState('price');

  if (!state || state.status === 'idle') return null;
  const { status, type, offers = [], stale, meta } = state;
  const title = type === 'hotels' ? 'Hotels in Dubai' : `Flights to Dubai${meta?.originLabel ? ` from ${meta.originLabel}` : ''}`;

  const sorted = type === 'flights'
    ? [...offers].sort((a, b) => {
        if (sortBy === 'price')    return a.price - b.price;
        if (sortBy === 'duration') return (a.durationMinutes ?? 9999) - (b.durationMinutes ?? 9999);
        if (sortBy === 'depart')   return new Date(a.departureAt) - new Date(b.departureAt);
        return 0;
      })
    : offers;

  return (
    <div style={{ maxWidth: '1080px', margin: '0 auto', padding: '40px 24px 8px' }}>
      <style>{skeletonCSS}</style>

      <div style={{ marginBottom: '20px' }}>
        <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 800, fontSize: 'clamp(20px,3vw,26px)', color: '#222', letterSpacing: '-0.025em', margin: '0 0 4px' }}>{title}</h2>
        <p style={{ fontSize: '12px', color: '#999', margin: 0 }}>
          We may earn a commission when you book through links on this page, at no extra cost to you.
        </p>
      </div>

      {stale && status === 'success' && (
        <div style={{ background: 'rgba(201,160,80,0.08)', border: '1px solid rgba(201,160,80,0.3)', color: '#A07830', borderRadius: '10px', padding: '10px 14px', fontSize: '13px', marginBottom: '16px' }}>
          Live prices are temporarily unavailable — showing recently cached fares. Final prices are confirmed on the booking site.
        </div>
      )}

      {status === 'loading' && <Skeletons type={type} />}

      {status === 'success' && offers.length > 0 && (
        type === 'hotels' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '16px' }}>
            {sorted.map((o) => <HotelCard key={o.hotelId} offer={o} onBook={onBook} />)}
          </div>
        ) : (
          <>
            {/* Sort bar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '13px', color: '#555', fontWeight: 600 }}>
                {offers.length} flight{offers.length !== 1 ? 's' : ''} found
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginLeft: 'auto', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '12px', color: '#aaa' }}>Sort:</span>
                {[['price', 'Price'], ['duration', 'Duration'], ['depart', 'Departure']].map(([val, label]) => (
                  <button key={val} className="ttd-sort-btn" onClick={() => setSortBy(val)} style={{
                    padding: '5px 13px', borderRadius: '20px', border: '1.5px solid',
                    borderColor: sortBy === val ? '#222' : '#e2e2e2',
                    background: sortBy === val ? '#222' : '#fff',
                    color: sortBy === val ? '#fff' : '#717171',
                    fontSize: '12px', fontWeight: sortBy === val ? 700 : 500,
                    cursor: 'pointer',
                  }}>{label}</button>
                ))}
              </div>
            </div>

            {/* Flight list */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {sorted.map((o, i) => (
                <FlightCard
                  key={`${o.airlineIata}-${o.flightNumber}-${o.departureAt}-${i}`}
                  offer={o}
                  onBook={onBook}
                  originCode={meta?.originCode}
                />
              ))}
            </div>

            {/* See more */}
            <div style={{ marginTop: '24px', textAlign: 'center', paddingBottom: '8px' }}>
              <button onClick={onFallbackClick}
                style={{ padding: '12px 28px', background: '#fff', border: '1.5px solid #e2e2e2', color: '#555', borderRadius: '28px', fontWeight: 600, fontSize: '13px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '7px', transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = '#222'; e.currentTarget.style.color = '#222'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#e2e2e2'; e.currentTarget.style.color = '#555'; }}>
                See all available flights on Aviasales →
              </button>
            </div>
          </>
        )
      )}

      {(status === 'error' || (status === 'success' && offers.length === 0)) && (
        <div style={{ textAlign: 'center', border: '1px dashed #ddd', borderRadius: '16px', padding: '40px 24px' }}>
          <div style={{ fontWeight: 700, fontSize: '16px', color: '#222', marginBottom: '6px' }}>
            {status === 'error' ? "We couldn't load prices right now" : 'No cached fares for these dates yet'}
          </div>
          <div style={{ fontSize: '13px', color: '#717171', marginBottom: '18px' }}>
            {type === 'hotels' ? 'Check live hotel prices for your dates on our partner site.' : 'Check live prices for this route on our partner site.'}
          </div>
          <button onClick={onFallbackClick} style={{ padding: '12px 24px', background: 'linear-gradient(135deg, #b1132f, #8e0f26)', color: '#fff', border: 'none', borderRadius: '24px', fontWeight: 700, fontSize: '13px', cursor: 'pointer' }}>
            {type === 'hotels' ? 'Search hotels on Hotellook →' : 'Search flights on Aviasales →'}
          </button>
        </div>
      )}
    </div>
  );
}
