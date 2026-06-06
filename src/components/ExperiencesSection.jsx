import { useState } from 'react';
import { experiences } from '../data/mockData';
import { useIsMobile } from '../hooks/useIsMobile';

export default function ExperiencesSection() {
  const isMobile = useIsMobile();
  return (
    <>
      <section style={{
        background: 'var(--sand)',
        padding: isMobile ? '40px 0' : '64px 0',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Subtle geometric background pattern */}
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg stroke='%23C9A050' stroke-width='0.5' opacity='0.07'%3E%3Cpath d='M30 0L60 30L30 60L0 30z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '60px 60px',
        }} />

        <div style={{ maxWidth: '1280px', margin: '0 auto', padding: isMobile ? '0 16px' : '0 24px', position: 'relative' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <span style={{
              fontFamily: 'var(--font-ui)',
              fontWeight: 600,
              fontSize: '11px',
              letterSpacing: '3px',
              textTransform: 'uppercase',
              color: 'var(--gold)',
              display: 'block',
              marginBottom: '10px',
            }}>
              ✦ Curated for You
            </span>
            <h2 style={{
              fontFamily: 'var(--font-headline)',
              fontWeight: 700,
              fontSize: 'clamp(28px, 3vw, 42px)',
              color: 'var(--text-dark)',
              margin: '0 0 14px',
              letterSpacing: '-0.3px',
            }}>
              Signature Dubai Experiences
            </h2>
            <p style={{
              fontFamily: 'var(--font-body)',
              fontWeight: 300,
              fontSize: '15px',
              color: 'var(--text-mid)',
              maxWidth: '520px',
              margin: '0 auto',
              lineHeight: 1.7,
            }}>
              Hand-picked by our Dubai experts — these are the moments that will define your journey.
            </p>
          </div>

          {/* Cards grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
            gap: isMobile ? '12px' : '20px',
          }}>
            {experiences.map((exp, i) => (
              <ExperienceCard key={exp.id} exp={exp} index={i} isMobile={isMobile} />
            ))}
          </div>
        </div>
      </section>

    </>
  );
}

function ExperienceCard({ exp, index, isMobile }) {
  const [hovered, setHovered] = useState(false);

  return (
    <article
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: 'relative',
        borderRadius: '12px',
        overflow: 'hidden',
        height: isMobile ? '280px' : '420px',
        cursor: 'pointer',
        transform: hovered ? 'translateY(-6px) scale(1.01)' : 'none',
        transition: 'transform 0.35s cubic-bezier(0.34,1.56,0.64,1)',
        boxShadow: hovered
          ? '0 20px 60px rgba(0,0,0,0.5), 0 0 0 2px var(--gold)'
          : '0 8px 32px rgba(0,0,0,0.4)',
        animationDelay: `${index * 0.08}s`,
      }}
    >
      {/* Background image */}
      <img src={exp.image} alt={exp.title}
        style={{
          width: '100%', height: '100%', objectFit: 'cover',
          transform: hovered ? 'scale(1.08)' : 'scale(1)',
          transition: 'transform 0.6s ease',
        }}
      />

      {/* Gradient overlay */}
      <div style={{
        position: 'absolute', inset: 0,
        background: hovered
          ? 'linear-gradient(to top, rgba(13,21,36,0.97) 0%, rgba(13,21,36,0.5) 55%, rgba(13,21,36,0.2) 100%)'
          : 'linear-gradient(to top, rgba(13,21,36,0.9) 0%, rgba(13,21,36,0.3) 60%, transparent 100%)',
        transition: 'background 0.4s ease',
      }} />

      {/* Tag */}
      <div style={{ position: 'absolute', top: '14px', left: '14px' }}>
        <span style={{
          background: exp.tagColor,
          color: '#fff',
          fontFamily: 'var(--font-ui)',
          fontWeight: 700,
          fontSize: '9px',
          letterSpacing: '1.5px',
          textTransform: 'uppercase',
          padding: '4px 10px',
          borderRadius: '20px',
        }}>
          {exp.tag}
        </span>
      </div>

      {/* Rating */}
      <div style={{ position: 'absolute', top: '14px', right: '14px' }}>
        <div style={{
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(201,160,80,0.3)',
          borderRadius: '20px',
          padding: '4px 10px',
          display: 'flex', alignItems: 'center', gap: '4px',
        }}>
          <span style={{ color: 'var(--gold)', fontSize: '11px' }}>★</span>
          <span style={{
            fontFamily: 'var(--font-ui)',
            fontWeight: 700,
            fontSize: '11px',
            color: '#fff',
          }}>
            {exp.rating}
          </span>
        </div>
      </div>

      {/* Content */}
      <div style={{
        position: 'absolute', bottom: 0, left: 0, right: 0,
        padding: '20px',
      }}>
        <p style={{
          fontFamily: 'var(--font-ui)',
          fontWeight: 500,
          fontSize: '11px',
          color: 'var(--gold)',
          letterSpacing: '1px',
          textTransform: 'uppercase',
          marginBottom: '6px',
          opacity: hovered ? 1 : 0.8,
          transition: 'opacity 0.3s',
        }}>
          {exp.subtitle}
        </p>
        <h3 style={{
          fontFamily: 'var(--font-headline)',
          fontWeight: 700,
          fontSize: isMobile ? '15px' : '18px',
          color: '#fff',
          lineHeight: 1.3,
          margin: '0 0 10px',
        }}>
          {exp.title}
        </h3>

        {/* Description: only on hover */}
        <div style={{
          overflow: 'hidden',
          maxHeight: hovered ? '80px' : '0',
          opacity: hovered ? 1 : 0,
          transition: 'max-height 0.4s ease, opacity 0.3s ease',
        }}>
          <p style={{
            fontFamily: 'var(--font-body)',
            fontWeight: 300,
            fontSize: '12.5px',
            color: 'rgba(255,255,255,0.7)',
            lineHeight: 1.65,
            marginBottom: '12px',
          }}>
            {exp.description}
          </p>
        </div>

        {/* Price + duration + CTA */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingTop: hovered ? '12px' : '0',
          borderTop: hovered ? '1px solid rgba(201,160,80,0.2)' : '1px solid transparent',
          transition: 'all 0.3s',
        }}>
          <div>
            <div style={{
              fontFamily: 'var(--font-ui)',
              fontWeight: 700,
              fontSize: '14px',
              color: 'var(--gold)',
            }}>
              {exp.price}
            </div>
            <div style={{
              fontFamily: 'var(--font-ui)',
              fontSize: '11px',
              color: 'rgba(255,255,255,0.5)',
            }}>
              {exp.duration}
            </div>
          </div>
          <a href="#" style={{
            background: hovered ? 'var(--brand)' : 'rgba(255,255,255,0.15)',
            color: '#fff',
            fontFamily: 'var(--font-ui)',
            fontWeight: 600,
            fontSize: '11px',
            letterSpacing: '0.5px',
            padding: '8px 16px',
            borderRadius: '6px',
            display: 'flex', alignItems: 'center', gap: '6px',
            transition: 'background 0.25s',
            backdropFilter: 'blur(4px)',
          }}>
            Book Now
          </a>
        </div>
      </div>
    </article>
  );
}
