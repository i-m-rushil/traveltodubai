import { fmtPrice, fmtDuration, airlineLogo } from '../../lib/travelApi';

const skeletonCSS = `
  @keyframes ttdPulse { 0%,100% { opacity: 0.55; } 50% { opacity: 1; } }
  .ttd-skel { animation: ttdPulse 1.4s ease-in-out infinite; background: #eee; border-radius: 8px; }
  .ttd-result-card { transition: box-shadow 0.2s ease, transform 0.2s ease; }
  .ttd-result-card:hover { box-shadow: 0 2px 4px rgba(0,0,0,0.08), 0 12px 28px rgba(0,0,0,0.12); transform: translateY(-2px); }
`;

const fmtTime = (iso) => iso ? new Date(iso).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
const fmtDay  = (iso) => iso ? new Date(iso).toLocaleDateString([], { day: 'numeric', month: 'short' }) : '';

function StopsBadge({ transfers }) {
  const nonstop = transfers === 0;
  return (
    <span style={{
      background: nonstop ? 'rgba(13,148,136,0.08)' : '#f5f5f5',
      color: nonstop ? '#0D9488' : '#717171',
      fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '20px',
      border: `1px solid ${nonstop ? 'rgba(13,148,136,0.2)' : '#e5e5e5'}`,
    }}>
      {nonstop ? 'Nonstop' : `${transfers} stop${transfers > 1 ? 's' : ''}`}
    </span>
  );
}

function FlightCard({ offer, onBook }) {
  return (
    <div className="ttd-result-card" style={{ background: '#fff', border: '1px solid #ebebeb', borderRadius: '16px', padding: '18px 20px', display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 200px', minWidth: 0 }}>
        <img src={airlineLogo(offer.airlineIata)} alt={offer.airlineName} style={{ width: '72px', height: '24px', objectFit: 'contain', flexShrink: 0 }}
          onError={(e) => { e.currentTarget.style.display = 'none'; }} />
        <div style={{ minWidth: 0 }}>
          <div style={{ fontWeight: 700, fontSize: '14px', color: '#222', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{offer.airlineName}</div>
          <div style={{ fontSize: '12px', color: '#717171' }}>{offer.airlineIata} {offer.flightNumber}</div>
        </div>
      </div>
      <div style={{ flex: '1 1 180px', textAlign: 'center' }}>
        <div style={{ fontWeight: 700, fontSize: '15px', color: '#222' }}>
          {fmtDay(offer.departureAt)} · {fmtTime(offer.departureAt)}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '4px' }}>
          {offer.durationMinutes != null && <span style={{ fontSize: '12px', color: '#717171' }}>{fmtDuration(offer.durationMinutes)}</span>}
          <StopsBadge transfers={offer.transfers} />
        </div>
        {offer.returnAt && (
          <div style={{ fontSize: '12px', color: '#717171', marginTop: '4px' }}>Return {fmtDay(offer.returnAt)}</div>
        )}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: '0 0 auto', marginLeft: 'auto' }}>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '10px', color: '#717171', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>from</div>
          <div style={{ fontWeight: 800, fontSize: '22px', color: '#222', letterSpacing: '-0.02em' }}>{fmtPrice(offer.price, offer.currency)}</div>
        </div>
        <button onClick={() => onBook(offer)} style={{ padding: '11px 22px', background: 'linear-gradient(135deg, #b1132f, #8e0f26)', color: '#fff', border: 'none', borderRadius: '10px', fontWeight: 700, fontSize: '13px', cursor: 'pointer', boxShadow: '0 2px 8px rgba(177,19,47,0.3)', whiteSpace: 'nowrap' }}>
          Book →
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
      {[...Array(4)].map((_, i) => (
        <div key={i} style={{ border: '1px solid #ebebeb', borderRadius: '16px', padding: '18px 20px', display: 'flex', gap: '16px', alignItems: 'center' }}>
          <div className="ttd-skel" style={{ height: '24px', width: '90px' }} />
          <div className="ttd-skel" style={{ height: '16px', flex: 1, maxWidth: '220px' }} />
          <div className="ttd-skel" style={{ height: '28px', width: '90px', marginLeft: 'auto' }} />
        </div>
      ))}
    </div>
  );
}

export default function TravelSearchResults({ state, onBook, onFallbackClick }) {
  if (!state || state.status === 'idle') return null;
  const { status, type, offers = [], stale, meta } = state;
  const title = type === 'hotels' ? 'Hotels in Dubai' : `Flights to Dubai${meta?.originLabel ? ` from ${meta.originLabel}` : ''}`;

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
            {offers.map((o) => <HotelCard key={o.hotelId} offer={o} onBook={onBook} />)}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {offers.map((o, i) => <FlightCard key={`${o.airlineIata}-${o.flightNumber}-${o.departureAt}-${i}`} offer={o} onBook={onBook} />)}
          </div>
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
