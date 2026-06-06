import { breakingNewsTicker } from '../data/mockData';

export default function BreakingNews() {
  const text = breakingNewsTicker.join('      ');

  return (
    <>
      <div style={{
        background: 'var(--sand-mid)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'stretch',
        overflow: 'hidden',
        height: '44px',
      }}>
        {/* Label */}
        <div style={{
          background: 'var(--brand)',
          color: '#fff',
          fontFamily: 'var(--font-ui)',
          fontWeight: 700,
          fontSize: '11px',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          padding: '0 20px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          whiteSpace: 'nowrap',
          flexShrink: 0,
          position: 'relative',
          zIndex: 2,
        }}>
          <span style={{ fontSize: '14px' }}>✈</span>
          Latest
          {/* Arrow shape */}
          <div style={{
            position: 'absolute', right: '-11px', top: 0, bottom: 0,
            width: 0,
            borderTop: '22px solid transparent',
            borderBottom: '22px solid transparent',
            borderLeft: '11px solid var(--brand)',
          }} />
        </div>

        {/* Scrolling ticker */}
        <div style={{ flex: 1, overflow: 'hidden', position: 'relative' }}>
          {/* Left gradient fade */}
          <div style={{
            position: 'absolute', left: 0, top: 0, bottom: 0, width: '40px',
            background: 'linear-gradient(to right, var(--sand-mid), transparent)',
            zIndex: 2,
          }} />
          <div style={{
            display: 'flex',
            alignItems: 'center',
            height: '100%',
            animation: 'ticker 60s linear infinite',
            whiteSpace: 'nowrap',
            willChange: 'transform',
          }}>
            {[text, text].map((t, i) => (
              <span key={i} style={{
                fontFamily: 'var(--font-ui)',
                fontWeight: 500,
                fontSize: '13px',
                color: 'var(--text-dark)',
                paddingRight: '100px',
                cursor: 'pointer',
              }}>
                {t}
              </span>
            ))}
          </div>
          {/* Right gradient fade */}
          <div style={{
            position: 'absolute', right: 0, top: 0, bottom: 0, width: '40px',
            background: 'linear-gradient(to left, var(--sand-mid), transparent)',
            zIndex: 2,
          }} />
        </div>

      </div>

      <style>{`
        @keyframes ticker {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }
      `}</style>
    </>
  );
}
