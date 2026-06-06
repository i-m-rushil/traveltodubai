export default function AdBanner() {
  return (
    <div style={{
      background: 'var(--sand)',
      padding: '20px 0',
    }}>
      <div style={{
        maxWidth: '1280px',
        margin: '0 auto',
        padding: '0 24px',
      }}>
        {/* Label */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '8px',
        }}>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
          <span style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '9px',
            fontWeight: 600,
            letterSpacing: '2px',
            textTransform: 'uppercase',
            color: 'var(--text-light)',
          }}>
            Advertisement
          </span>
          <div style={{ flex: 1, height: '1px', background: 'var(--border)' }} />
        </div>

        {/* Banner container */}
        <div style={{
          borderRadius: '10px',
          overflow: 'hidden',
          border: '1px solid var(--border)',
          boxShadow: '0 2px 12px rgba(0,0,0,0.07)',
          lineHeight: 0,
          cursor: 'pointer',
          transition: 'box-shadow 0.2s, transform 0.2s',
        }}
          onMouseEnter={e => {
            e.currentTarget.style.boxShadow = '0 6px 24px rgba(0,0,0,0.13)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.boxShadow = '0 2px 12px rgba(0,0,0,0.07)';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <img
            src="/16945254-1778843998252.gif"
            alt="Advertisement"
            style={{
              width: '100%',
              height: 'auto',
              display: 'block',
              objectFit: 'cover',
            }}
          />
        </div>
      </div>
    </div>
  );
}
