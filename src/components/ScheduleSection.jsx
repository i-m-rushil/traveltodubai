import { useState } from 'react';
import { scheduleEvents } from '../data/mockData';

export default function ScheduleSection() {
  const [activeCategory, setActiveCategory] = useState('All Activities');
  const { categories, days, times, events } = scheduleEvents;

  const catColors = {
    Desert: '#C9A050',
    Culture: '#e43d30',
    Water: '#0891b2',
    Dining: '#7c3aed',
    Shopping: '#059669',
    'All Activities': 'var(--gold)',
  };

  const filtered = activeCategory === 'All Activities'
    ? events
    : events.filter(e => e.category === activeCategory);

  const getEvent = (day, time) => filtered.find(e => e.day === day && e.time === time);

  return (
    <section style={{
      background: 'var(--midnight)',
      padding: '56px 0',
      position: 'relative',
      overflow: 'hidden',
    }}>
      {/* Subtle diamond pattern */}
      <div style={{
        position: 'absolute', inset: 0, opacity: 0.04,
        backgroundImage: `url("data:image/svg+xml,%3Csvg width='48' height='48' viewBox='0 0 48 48' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M24 0L48 24L24 48L0 24z' fill='none' stroke='%23C9A050' stroke-width='1'/%3E%3C/svg%3E")`,
        backgroundSize: '48px 48px',
      }} />

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0 24px', position: 'relative' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '28px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <div style={{ width: '28px', height: '3px', background: 'var(--gold)', borderRadius: '2px' }} />
              <div style={{ width: '20px', height: '3px', background: 'var(--brand)', borderRadius: '2px' }} />
            </div>
            <div>
              <span style={{ fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '10px', letterSpacing: '2.5px', textTransform: 'uppercase', color: 'var(--gold)', display: 'block', marginBottom: '2px' }}>
                ✦ What's On
              </span>
              <h2 style={{ fontFamily: 'var(--font-headline)', fontWeight: 700, fontSize: '22px', color: '#fff', margin: 0, letterSpacing: '-0.2px' }}>
                Dubai Activities Calendar
              </h2>
            </div>
          </div>

          {/* Category filter */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {categories.map(cat => {
              const active = activeCategory === cat;
              const color = catColors[cat] || 'rgba(255,255,255,0.5)';
              return (
                <button key={cat} onClick={() => setActiveCategory(cat)} style={{
                  fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '11px',
                  letterSpacing: '0.5px', padding: '6px 14px', borderRadius: '20px',
                  cursor: 'pointer', transition: 'all 0.2s',
                  background: active ? color : 'rgba(255,255,255,0.07)',
                  color: active ? '#fff' : 'rgba(255,255,255,0.55)',
                  border: `1px solid ${active ? color : 'rgba(255,255,255,0.1)'}`,
                }}
                  onMouseEnter={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.12)'; e.currentTarget.style.color = '#fff'; } }}
                  onMouseLeave={e => { if (!active) { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; } }}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        {/* Table */}
        <div style={{ overflowX: 'auto', borderRadius: '10px', border: '1px solid rgba(201,160,80,0.12)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: '700px' }}>
            <thead>
              <tr>
                <th style={{
                  background: 'rgba(201,160,80,0.08)', padding: '14px 16px',
                  fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '11px',
                  letterSpacing: '1.5px', textTransform: 'uppercase',
                  color: 'rgba(255,255,255,0.35)', textAlign: 'left',
                  borderBottom: '1px solid rgba(201,160,80,0.12)',
                  borderRight: '1px solid rgba(201,160,80,0.08)', width: '90px',
                }}>
                  Time
                </th>
                {days.map(day => (
                  <th key={day} style={{
                    background: 'rgba(201,160,80,0.08)', padding: '14px 16px',
                    fontFamily: 'var(--font-ui)', fontWeight: 700, fontSize: '12px',
                    letterSpacing: '1px', textTransform: 'uppercase',
                    color: '#fff', textAlign: 'center',
                    borderBottom: '1px solid rgba(201,160,80,0.12)',
                    borderRight: '1px solid rgba(201,160,80,0.08)',
                  }}>
                    {day}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {times.map((time, ti) => (
                <tr key={time} style={{ background: ti % 2 === 0 ? 'rgba(255,255,255,0.015)' : 'transparent' }}>
                  <td style={{
                    padding: '10px 16px', fontFamily: 'var(--font-ui)', fontWeight: 600,
                    fontSize: '11px', color: 'rgba(255,255,255,0.35)',
                    borderRight: '1px solid rgba(201,160,80,0.07)',
                    borderBottom: '1px solid rgba(201,160,80,0.05)', whiteSpace: 'nowrap',
                  }}>
                    {time}
                  </td>
                  {days.map(day => {
                    const ev = getEvent(day, time);
                    return (
                      <td key={day} style={{
                        padding: '6px', verticalAlign: 'top',
                        borderRight: '1px solid rgba(201,160,80,0.07)',
                        borderBottom: '1px solid rgba(201,160,80,0.05)',
                      }}>
                        {ev ? <EventCell event={ev} /> : <div style={{ height: '52px' }} />}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legend */}
        <div style={{ display: 'flex', gap: '20px', marginTop: '18px', flexWrap: 'wrap' }}>
          {Object.entries(catColors).filter(([k]) => k !== 'All Activities').map(([cat, color]) => (
            <div key={cat} style={{ display: 'flex', alignItems: 'center', gap: '7px' }}>
              <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, flexShrink: 0 }} />
              <span style={{ fontFamily: 'var(--font-ui)', fontSize: '11px', color: 'rgba(255,255,255,0.45)', letterSpacing: '0.3px' }}>{cat}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function EventCell({ event }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}
      style={{
        background: hovered ? event.color : `${event.color}20`,
        border: `1px solid ${event.color}44`,
        borderLeft: `3px solid ${event.color}`,
        borderRadius: '5px',
        padding: '8px 10px',
        cursor: 'pointer',
        transition: 'all 0.2s',
        minHeight: '52px',
      }}
    >
      <p style={{
        fontFamily: 'var(--font-ui)', fontWeight: 600, fontSize: '11px',
        color: '#fff', marginBottom: '3px', lineHeight: 1.35, letterSpacing: '0.2px',
      }}>
        {event.title}
      </p>
      <p style={{
        fontFamily: 'var(--font-ui)', fontSize: '10px',
        color: hovered ? 'rgba(255,255,255,0.85)' : 'rgba(255,255,255,0.45)',
        lineHeight: 1.3,
        display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden',
        transition: 'color 0.2s',
      }}>
        {event.location}
      </p>
      {hovered && (
        <p style={{ fontFamily: 'var(--font-ui)', fontSize: '10px', color: 'rgba(255,255,255,0.7)', marginTop: '3px' }}>
          {event.duration}
        </p>
      )}
    </div>
  );
}
