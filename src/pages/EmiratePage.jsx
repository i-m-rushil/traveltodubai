import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useIsMobile } from '../hooks/useIsMobile';
import { emirates } from '../data/mockData';
import { getPublishedArticles, getCategoryIdBySlug } from '../lib/supabase';
import { normalizeArticles } from '../lib/normalize';
import PlanTripPromo from '../components/PlanTripPromo';
import RecentSection from '../components/RecentSection';

/*
 * Per-emirate landing page. Sections render in the order requested:
 *   1. Plan your trip   2. Stay   3. Food & Drink   4. Things to do
 *
 * Each section shows posts that match BOTH the content category (stay /
 * eat-drink / experiences) AND this emirate — i.e. a post tagged "Things to
 * do" + "Abu Dhabi" shows under Abu Dhabi → Things to do. The emirate is set
 * per-post in the compose form; `emirate.label` matches the DB `emirate` enum.
 */
export default function EmiratePage() {
  const { slug } = useParams();
  const isMobile = useIsMobile();
  const emirate = emirates.find(e => e.slug === slug) || emirates[0];

  const [stay, setStay]               = useState([]);
  const [food, setFood]               = useState([]);
  const [experiences, setExperiences] = useState([]);

  useEffect(() => {
    const load = async (catSlug, setter) => {
      const catId = await getCategoryIdBySlug(catSlug);
      const { data } = await getPublishedArticles({ categoryId: catId, emirate: emirate.label, limit: 6 });
      setter(normalizeArticles(data));
    };
    load('stay',        setStay);
    load('eat-drink',   setFood);
    load('experiences', setExperiences);
  }, [slug, emirate.label]);

  useEffect(() => {
    document.title = `${emirate.label} – Travel Guide | Travel to Dubai`;
  }, [emirate.label]);

  return (
    <div style={{ background: 'var(--sand)' }}>

      {/* ── Breadcrumb ── */}
      <nav aria-label="Breadcrumb" style={{ background: '#fff', borderBottom: '1px solid var(--border)', padding: '10px 0' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', padding: '0 20px', display: 'flex', alignItems: 'center', gap: 7, fontSize: 13, color: 'var(--text-mid)', flexWrap: 'wrap' }}>
          <Link to="/" style={{ color: 'var(--text-mid)', textDecoration: 'none' }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--brand)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--text-mid)'}
          >Home</Link>
          <span style={{ color: 'var(--gray-mid)' }}>›</span>
          <span style={{ color: 'var(--text-mid)' }}>Other Emirates</span>
          <span style={{ color: 'var(--gray-mid)' }}>›</span>
          <span style={{ color: 'var(--brand)', fontWeight: 600 }}>{emirate.label}</span>
        </div>
      </nav>

      {/* ── Emirate Hero ── */}
      <section style={{
        position: 'relative', overflow: 'hidden',
        padding: isMobile ? '56px 20px' : '96px 20px',
        backgroundImage: `linear-gradient(160deg, rgba(10,16,26,0.86) 0%, rgba(15,24,40,0.72) 60%, rgba(10,16,26,0.84) 100%), url(${emirate.img.replace('w=480', 'w=1600')})`,
        backgroundSize: 'cover', backgroundPosition: 'center',
      }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', position: 'relative', zIndex: 2 }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(228,61,48,0.12)', border: '1px solid rgba(228,61,48,0.22)', borderRadius: 4, padding: '4px 13px', marginBottom: 22 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--brand)', display: 'inline-block' }} />
            <span style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--brand)' }}>
              Other Emirates
            </span>
          </div>

          <h1 style={{
            fontFamily: 'var(--font-headline)', fontWeight: 900,
            fontSize: isMobile ? 36 : 56,
            color: '#fff', lineHeight: 1.08, marginBottom: 14,
            letterSpacing: '-0.025em',
          }}>
            {emirate.label}
          </h1>

          <p style={{
            fontFamily: 'var(--font-body)', fontWeight: 300,
            fontSize: isMobile ? 15 : 18,
            color: 'rgba(255,255,255,0.62)', maxWidth: 600, lineHeight: 1.7,
          }}>
            Plan your trip, find places to stay, discover where to eat and drink,
            and explore the best things to do in {emirate.label}.
            {emirate.specialty && <> Don’t miss {emirate.specialty}.</>}
          </p>
        </div>
      </section>

      {/* 1. Plan your trip */}
      <PlanTripPromo />

      {/* 2. Stay */}
      <RecentSection title={`Stay in ${emirate.label}`}        articles={stay}        viewAllLink="/category/stay"        categorySlug="stay"        emirate={emirate.label} />

      {/* 3. Food & Drink */}
      <RecentSection title={`Food & Drink in ${emirate.label}`} articles={food}        viewAllLink="/category/eat-drink"   categorySlug="eat-drink"   emirate={emirate.label} />

      {/* 4. Things to do */}
      <RecentSection title={`Things to do in ${emirate.label}`} articles={experiences} viewAllLink="/category/experiences" categorySlug="experiences" emirate={emirate.label} />
    </div>
  );
}
