export default function SkylineSection() {
  return (
    <div style={{ position: 'relative', background: 'var(--sand)', overflow: 'hidden' }}>
      {/* Gradient sky */}
      <div style={{
        height: '220px',
        background: 'linear-gradient(to bottom, #0d1524 0%, #1a2a4a 30%, #c47a3a 65%, #e8a55a 80%, #f2c97a 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Stars */}
        {[
          [8,12],[15,6],[22,18],[30,8],[38,14],[45,5],[52,20],[60,10],[67,4],[74,16],
          [82,9],[88,13],[94,7],[100,19],[107,3],[113,11],[120,17],[127,6],[134,14],[140,8],
          [148,12],[155,4],[162,18],[170,9],[177,5],[184,15],[191,7],[198,13],[205,3],[212,17],
        ].map(([x, y], i) => (
          <div key={i} style={{
            position: 'absolute', left: `${x * 0.7}%`, top: `${y}%`,
            width: i % 3 === 0 ? '2px' : '1.5px', height: i % 3 === 0 ? '2px' : '1.5px',
            background: '#fff', borderRadius: '50%',
            opacity: y < 12 ? 0.9 : 0.5,
          }} />
        ))}

        {/* Moon */}
        <div style={{
          position: 'absolute', top: '10%', right: '8%',
          width: '28px', height: '28px',
          background: '#fff9e6',
          borderRadius: '50%',
          boxShadow: '0 0 20px 4px rgba(255,249,230,0.4)',
          opacity: 0.95,
        }} />
        <div style={{
          position: 'absolute', top: '10%', right: '7.2%',
          width: '22px', height: '22px',
          background: '#1a2a4a',
          borderRadius: '50%',
          marginTop: '2px',
        }} />

        {/* Horizon glow */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: '80px',
          background: 'linear-gradient(to top, rgba(232,165,90,0.6), transparent)',
        }} />
      </div>

      {/* Skyline SVG */}
      <svg
        viewBox="0 0 1440 260"
        xmlns="http://www.w3.org/2000/svg"
        style={{ display: 'block', width: '100%', marginTop: '-210px', position: 'relative', zIndex: 2 }}
        preserveAspectRatio="xMidYMax meet"
      >
        <defs>
          <linearGradient id="buildingGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#252d34" />
            <stop offset="100%" stopColor="#1d252c" />
          </linearGradient>
          <linearGradient id="glassGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="rgba(201,160,80,0.08)" />
            <stop offset="50%" stopColor="rgba(201,160,80,0.18)" />
            <stop offset="100%" stopColor="rgba(201,160,80,0.05)" />
          </linearGradient>
          <linearGradient id="skyGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="transparent" />
            <stop offset="100%" stopColor="#1d252c" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
            <feMerge><feMergeNode in="coloredBlur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
        </defs>

        {/* Ground */}
        <rect x="0" y="240" width="1440" height="20" fill="url(#buildingGrad)" />

        {/* ── Far background buildings (lighter, smaller) ── */}
        <rect x="0" y="200" width="80" height="42" fill="#1a2535" opacity="0.7"/>
        <rect x="10" y="185" width="60" height="15" fill="#1a2535" opacity="0.7"/>
        <rect x="90" y="210" width="55" height="32" fill="#1a2535" opacity="0.6"/>
        <rect x="155" y="205" width="40" height="37" fill="#1a2535" opacity="0.6"/>
        <rect x="200" y="215" width="35" height="27" fill="#1a2535" opacity="0.5"/>

        <rect x="1200" y="200" width="80" height="42" fill="#1a2535" opacity="0.7"/>
        <rect x="1290" y="210" width="60" height="32" fill="#1a2535" opacity="0.6"/>
        <rect x="1360" y="205" width="80" height="37" fill="#1a2535" opacity="0.6"/>

        {/* ── Left cluster ── */}
        {/* Low wide base building */}
        <rect x="30" y="195" width="90" height="47" fill="url(#buildingGrad)"/>
        <rect x="30" y="195" width="90" height="47" fill="url(#glassGrad)"/>
        {/* Windows left cluster */}
        {[0,1,2,3,4].map(r => [0,1,2,3].map(c => (
          <rect key={`${r}-${c}`} x={38 + c*20} y={200 + r*8} width="10" height="5"
            fill={Math.random() > 0.4 ? 'rgba(201,160,80,0.35)' : 'rgba(201,160,80,0.08)'} rx="1"/>
        )))}

        {/* Medium tower left */}
        <rect x="135" y="165" width="40" height="77" fill="url(#buildingGrad)"/>
        <polygon points="135,165 155,148 175,165" fill="url(#buildingGrad)"/>
        <rect x="135" y="165" width="40" height="77" fill="url(#glassGrad)"/>
        {[0,1,2,3,4,5,6].map(r => [0,1].map(c => (
          <rect key={`${r}-${c}`} x={140 + c*16} y={170 + r*10} width="10" height="6"
            fill="rgba(201,160,80,0.25)" rx="1"/>
        )))}

        {/* Skinny tower */}
        <rect x="185" y="150" width="22" height="92" fill="url(#buildingGrad)"/>
        <rect x="190" y="140" width="12" height="12" fill="url(#buildingGrad)"/>
        <polygon points="190,140 196,128 202,140" fill="url(#buildingGrad)"/>
        <circle cx="196" cy="127" r="2" fill="#e43d30" filter="url(#glow)"/>

        {/* ── Center-left cluster ── */}
        {/* Wide glass tower */}
        <rect x="250" y="130" width="55" height="112" fill="url(#buildingGrad)"/>
        <rect x="250" y="130" width="55" height="112" fill="url(#glassGrad)"/>
        {/* Horizontal bands */}
        {[0,1,2,3,4,5,6,7,8].map(i => (
          <rect key={i} x="250" y={135 + i*13} width="55" height="1" fill="rgba(201,160,80,0.12)"/>
        ))}
        {[0,1,2].map(c => [0,1,2,3,4,5,6].map(r => (
          <rect key={`${c}-${r}`} x={256 + c*16} y={138 + r*13} width="10" height="8"
            fill={c === 1 ? 'rgba(201,160,80,0.3)' : 'rgba(201,160,80,0.15)'} rx="1"/>
        )))}

        {/* Stepped tower */}
        <rect x="315" y="175" width="35" height="67" fill="url(#buildingGrad)"/>
        <rect x="320" y="155" width="25" height="22" fill="url(#buildingGrad)"/>
        <rect x="326" y="140" width="13" height="17" fill="url(#buildingGrad)"/>
        <polygon points="326,140 332,130 339,140" fill="url(#buildingGrad)"/>

        {/* ── BURJ KHALIFA (center hero) ── */}
        {/* Podium */}
        <rect x="650" y="215" width="140" height="27" fill="url(#buildingGrad)"/>
        <rect x="665" y="200" width="110" height="17" fill="url(#buildingGrad)"/>
        {/* Main tower body - stepped tiers */}
        <rect x="690" y="100" width="60" height="102" fill="url(#buildingGrad)"/>
        <rect x="695" y="100" width="60" height="102" fill="url(#glassGrad)" opacity="0.6"/>
        <rect x="700" y="65" width="40" height="37" fill="url(#buildingGrad)"/>
        <rect x="705" y="42" width="30" height="25" fill="url(#buildingGrad)"/>
        <rect x="710" y="25" width="20" height="19" fill="url(#buildingGrad)"/>
        <rect x="714" y="12" width="12" height="15" fill="url(#buildingGrad)"/>
        <rect x="717" y="4" width="6" height="10" fill="url(#buildingGrad)"/>
        {/* Spire */}
        <line x1="720" y1="0" x2="720" y2="12" stroke="#C9A050" strokeWidth="2"/>
        <circle cx="720" cy="1" r="2" fill="#e43d30" filter="url(#glow)" opacity="0.9"/>
        {/* Burj windows */}
        {[0,1,2,3,4,5,6,7].map(r => [0,1,2].map(c => (
          <rect key={`${r}-${c}`} x={695 + c*18} y={108 + r*12} width="12" height="8"
            fill={r % 3 === 0 ? 'rgba(201,160,80,0.4)' : 'rgba(201,160,80,0.18)'} rx="1"/>
        )))}
        {/* Tier windows */}
        {[0,1,2].map(r => (
          <rect key={r} x={707} y={70 + r*10} width="26" height="7"
            fill="rgba(201,160,80,0.22)" rx="1"/>
        ))}
        {/* Y-shape setbacks */}
        <polygon points="690,100 665,100 680,115 690,115" fill="url(#buildingGrad)" opacity="0.8"/>
        <polygon points="750,100 775,100 760,115 750,115" fill="url(#buildingGrad)" opacity="0.8"/>

        {/* ── Right of Burj ── */}
        {/* Twisted tower */}
        <rect x="800" y="145" width="48" height="97" fill="url(#buildingGrad)"/>
        <polygon points="800,145 824,130 848,145" fill="url(#buildingGrad)"/>
        <rect x="800" y="145" width="48" height="97" fill="url(#glassGrad)"/>
        {[0,1,2,3,4,5].map(r => (
          <rect key={r} x={805} y={150 + r*14} width="38" height="9"
            fill="rgba(201,160,80,0.18)" rx="1"/>
        ))}

        {/* Two towers (Cayan-inspired) */}
        <rect x="865" y="155" width="30" height="87" fill="url(#buildingGrad)"/>
        <rect x="865" y="155" width="30" height="87" fill="url(#glassGrad)"/>
        <polygon points="865,155 880,138 895,155" fill="url(#buildingGrad)"/>
        <rect x="905" y="160" width="30" height="82" fill="url(#buildingGrad)"/>
        <polygon points="905,160 920,143 935,160" fill="url(#buildingGrad)"/>

        {/* Emirates Towers inspired */}
        <rect x="955" y="135" width="38" height="107" fill="url(#buildingGrad)"/>
        <polygon points="955,135 974,112 993,135" fill="url(#buildingGrad)"/>
        <rect x="955" y="135" width="38" height="107" fill="url(#glassGrad)"/>
        <rect x="1005" y="148" width="35" height="94" fill="url(#buildingGrad)"/>
        <polygon points="1005,148 1022,126 1040,148" fill="url(#buildingGrad)"/>
        {/* Windows Emirates */}
        {[0,1,2,3,4,5,6].map(r => [0,1].map(c => (
          <rect key={`${r}-${c}`} x={960 + c*15} y={142 + r*13} width="10" height="8"
            fill="rgba(201,160,80,0.28)" rx="1"/>
        )))}

        {/* ── Far right buildings ── */}
        <rect x="1055" y="175" width="50" height="67" fill="url(#buildingGrad)"/>
        <rect x="1055" y="175" width="50" height="67" fill="url(#glassGrad)"/>
        <rect x="1115" y="185" width="38" height="57" fill="url(#buildingGrad)"/>
        <rect x="1162" y="178" width="28" height="64" fill="url(#buildingGrad)"/>
        <polygon points="1162,178 1176,162 1190,178" fill="url(#buildingGrad)"/>
        <rect x="1200" y="188" width="45" height="54" fill="url(#buildingGrad)"/>
        <rect x="1255" y="195" width="40" height="47" fill="url(#buildingGrad)"/>
        <rect x="1305" y="200" width="55" height="42" fill="url(#buildingGrad)"/>
        <rect x="1370" y="190" width="70" height="52" fill="url(#buildingGrad)"/>

        {/* Water reflection strip */}
        <rect x="0" y="240" width="1440" height="20" fill="url(#buildingGrad)" opacity="0.5"/>

        {/* Foreground ground fill */}
        <rect x="0" y="245" width="1440" height="15" fill="#1d252c"/>
      </svg>

      {/* Ground fill below SVG */}
      <div style={{ background: '#1d252c', height: '4px', marginTop: '-4px', position: 'relative', zIndex: 3 }} />

      {/* Overlay text */}
      <div style={{
        position: 'absolute', bottom: '28px', left: '50%', transform: 'translateX(-50%)',
        textAlign: 'center', zIndex: 10, whiteSpace: 'nowrap',
      }}>
        <p style={{
          fontFamily: 'var(--font-ui)', fontWeight: 300, fontSize: '11px',
          letterSpacing: '4px', textTransform: 'uppercase',
          color: 'rgba(201,160,80,0.6)',
        }}>
          Dubai, United Arab Emirates
        </p>
      </div>
    </div>
  );
}
