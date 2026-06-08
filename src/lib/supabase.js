import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnon = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnon) {
  throw new Error('Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in .env.local');
}

export const supabase = createClient(supabaseUrl, supabaseAnon);

// ── Auth helpers ──────────────────────────────────────────────

export async function signIn(email, password) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

// ── Article queries ───────────────────────────────────────────

export function articlesQuery() {
  return supabase
    .from('articles')
    .select(`
      id, title, slug, excerpt, featured_image,
      status, is_featured, tag_label, views, comments_count, read_time,
      published_at,
      category:article_categories(id, slug, label, color),
      author:profiles(id, name, avatar_url)
    `);
}

export async function getPublishedArticles({ categorySlug, limit = 12, offset = 0 } = {}) {
  let q = articlesQuery()
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (categorySlug && categorySlug !== 'all') {
    q = q.eq('article_categories.slug', categorySlug);
  }
  return q;
}

export async function getArticleBySlug(slug) {
  return supabase
    .from('articles')
    .select(`
      *,
      category:article_categories(id, slug, label, color),
      author:profiles(id, name, avatar_url, bio),
      tags:article_tags(tag:tags(id, name, slug))
    `)
    .eq('slug', slug)
    .eq('status', 'published')
    .single();
}

export async function getFeaturedArticles(limit = 5) {
  return supabase
    .from('articles')
    .select(`
      id, title, slug, excerpt, featured_image,
      tag_label, published_at, read_time,
      category:article_categories(slug, label, color),
      author:profiles(name)
    `)
    .eq('status', 'published')
    .eq('is_featured', true)
    .order('published_at', { ascending: false })
    .limit(limit);
}

// ── Hero slides ───────────────────────────────────────────────

export async function getHeroSlides() {
  return supabase
    .from('hero_slides')
    .select('*')
    .eq('is_active', true)
    .order('sort_order');
}

// ── Ticker ────────────────────────────────────────────────────

export async function getTickerItems() {
  return supabase
    .from('ticker_items')
    .select('id, message, link_url')
    .eq('is_active', true)
    .order('sort_order');
}

// ── Prayer times ──────────────────────────────────────────────

export async function getPrayerTimes(emirate, date) {
  return supabase
    .from('prayer_times')
    .select('*')
    .eq('emirate', emirate)
    .eq('date', date)
    .single();
}

// ── Comments ──────────────────────────────────────────────────

export async function getApprovedComments(articleId) {
  return supabase
    .from('comments')
    .select(`
      id, content, created_at, guest_name,
      user:profiles(name, avatar_url),
      replies:comments!parent_id(
        id, content, created_at, guest_name,
        user:profiles(name, avatar_url)
      )
    `)
    .eq('article_id', articleId)
    .eq('is_approved', true)
    .is('parent_id', null)
    .order('created_at', { ascending: false });
}

export async function postComment({ articleId, userId, guestName, guestEmail, content, parentId }) {
  return supabase.from('comments').insert({
    article_id: articleId,
    user_id:    userId    || null,
    guest_name: guestName || null,
    guest_email: guestEmail || null,
    content,
    parent_id:  parentId  || null,
  });
}

// ── Article view tracking ─────────────────────────────────────

export async function recordView(articleId, sessionId) {
  await supabase.from('article_views').insert({
    article_id: articleId,
    session_id: sessionId,
    referrer:   document.referrer || null,
  });
  // Increment denormalised counter
  await supabase.rpc('increment_article_views', { p_article_id: articleId });
}

// ── Newsletter ────────────────────────────────────────────────

export async function subscribeNewsletter(email, source = 'homepage') {
  return supabase.from('newsletter_subscribers').upsert(
    { email, source, status: 'active' },
    { onConflict: 'email' }
  );
}

// ── Forms ─────────────────────────────────────────────────────

export async function submitContact(payload) {
  return supabase.from('contact_submissions').insert(payload);
}

export async function submitComplaint(payload) {
  return supabase.from('complaints').insert(payload);
}

export async function submitAdInquiry(payload) {
  return supabase.from('ad_inquiries').insert(payload);
}

export async function submitApplication(payload) {
  return supabase.from('work_applications').insert(payload);
}
