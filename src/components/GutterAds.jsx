import { useState, useEffect, useRef } from 'react';

const AD_WIDTH = 130;
const TOP_OFFSET = 100;
const MIN_VIEWPORT = 1620; // only show when gutters are wide enough

export default function GutterAds() {
  const [show, setShow] = useState(false);
  const [adTop, setAdTop] = useState(TOP_OFFSET);
  const adRef = useRef(null);

  useEffect(() => {
    const checkWidth = () => setShow(window.innerWidth >= MIN_VIEWPORT);
    checkWidth();
    window.addEventListener('resize', checkWidth, { passive: true });
    return () => window.removeEventListener('resize', checkWidth);
  }, []);

  useEffect(() => {
    if (!show) return;

    const handleScroll = () => {
      const footer = document.querySelector('footer');
      if (!footer || !adRef.current) return;

      const adHeight = adRef.current.offsetHeight;
      const footerTop = footer.getBoundingClientRect().top;
      const gap = 24;
      const maxTop = footerTop - adHeight - gap;

      setAdTop(maxTop < TOP_OFFSET ? maxTop : TOP_OFFSET);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [show]);

  if (!show) return null;

  const sideStyle = {
    position: 'fixed',
    top: `${adTop}px`,
    width: `${AD_WIDTH}px`,
    zIndex: 40,
    transition: 'top 0.2s ease',
  };

  return (
    <>
      {/* Left gutter */}
      <div ref={adRef} style={{
        ...sideStyle,
        left: `calc((100vw - 1280px) / 2 - ${AD_WIDTH + 16}px)`,
      }}>
        <AdCard />
      </div>

      {/* Right gutter */}
      <div style={{
        ...sideStyle,
        right: `calc((100vw - 1280px) / 2 - ${AD_WIDTH + 16}px)`,
      }}>
        <AdCard />
      </div>
    </>
  );
}

function AdCard() {
  const [hovered, setHovered] = useState(false);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
        <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.15)' }} />
        <span style={{
          fontFamily: 'Georgia, serif', fontSize: '7.5px', fontWeight: 600,
          letterSpacing: '2px', textTransform: 'uppercase', color: 'rgba(0,0,0,0.35)',
        }}>Ad</span>
        <div style={{ flex: 1, height: '1px', background: 'rgba(0,0,0,0.15)' }} />
      </div>
      <a href="#"
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
        style={{
          display: 'block', borderRadius: '8px', overflow: 'hidden', lineHeight: 0,
          boxShadow: hovered ? '0 8px 24px rgba(0,0,0,0.16)' : '0 2px 10px rgba(0,0,0,0.09)',
          border: '1px solid rgba(0,0,0,0.08)',
          transform: hovered ? 'translateY(-2px)' : 'translateY(0)',
          transition: 'all 0.2s ease',
        }}
      >
        <img
          src="/11459335.webp"
          alt="Advertisement"
          style={{ width: '100%', height: 'auto', display: 'block' }}
        />
      </a>
    </div>
  );
}
