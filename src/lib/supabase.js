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

export async function getPublishedArticles({ categoryId, emirate, area, limit = 12, offset = 0 } = {}) {
  let q = articlesQuery()
    .eq('status', 'published')
    .order('published_at', { ascending: false })
    .range(offset, offset + limit - 1);

  if (categoryId) {
    q = q.eq('category_id', categoryId);
  }
  if (emirate) {
    q = q.eq('emirate', emirate);
  }
  if (area) {
    q = q.eq('area', area);
  }
  return await q;
}

export async function getCategoryIdBySlug(slug) {
  if (!slug || slug === 'all') return null;
  const { data } = await supabase
    .from('article_categories')
    .select('id')
    .eq('slug', slug)
    .single();
  return data?.id || null;
}

export async function getAllCategories() {
  return supabase
    .from('article_categories')
    .select('id, slug, label, color')
    .order('label');
}

export async function getArticleCount(categoryId, { area } = {}) {
  let q = supabase
    .from('articles')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'published');
  if (categoryId) q = q.eq('category_id', categoryId);
  if (area) q = q.eq('area', area);
  const { count } = await q;
  return count || 0;
}

export async function getMostViewedArticles(limit = 5, { categoryId, emirate } = {}) {
  let q = supabase
    .from('articles')
    .select(`
      id, title, slug, views, published_at,
      category:article_categories(slug, label, color),
      author:profiles(name)
    `)
    .eq('status', 'published')
    .order('views', { ascending: false })
    .limit(limit);
  if (categoryId) q = q.eq('category_id', categoryId);
  if (emirate) q = q.eq('emirate', emirate);
  return q;
}

export async function getRelatedArticles(categoryId, excludeId, limit = 3) {
  return supabase
    .from('articles')
    .select(`
      id, title, slug, excerpt, featured_image, published_at, read_time,
      category:article_categories(id, slug, label, color),
      author:profiles(name)
    `)
    .eq('status', 'published')
    .eq('category_id', categoryId)
    .neq('id', excludeId)
    .order('published_at', { ascending: false })
    .limit(limit);
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

// ══════════════════════════════════════════════════════════════
// Dashboard (admin / publisher) — all calls below require a
// signed-in Supabase session; RLS enforces role permissions.
// ══════════════════════════════════════════════════════════════

// ── Auth + profile ────────────────────────────────────────────

export async function signInWithProfile(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) return { error };
  const { data: profile, error: pErr } = await supabase
    .from('profiles')
    .select('id, name, email, role, status, avatar_url, bio')
    .eq('id', data.user.id)
    .single();
  if (pErr) return { error: pErr };
  return { data: { session: data.session, profile } };
}

export async function getMyProfile() {
  const session = await getSession();
  if (!session) return null;
  const { data } = await supabase
    .from('profiles')
    .select('*, publisher_profile:publisher_profiles(*)')
    .eq('id', session.user.id)
    .single();
  return data;
}

export async function updateMyProfile(fields) {
  const session = await getSession();
  if (!session) return { error: new Error('Not signed in') };
  const { bio, name, avatar_url, ...publisherFields } = fields;
  const profilePatch = {};
  if (name !== undefined) profilePatch.name = name;
  if (bio !== undefined) profilePatch.bio = bio;
  if (avatar_url !== undefined) profilePatch.avatar_url = avatar_url;
  if (Object.keys(profilePatch).length) {
    const { error } = await supabase.from('profiles').update(profilePatch).eq('id', session.user.id);
    if (error) return { error };
  }
  if (Object.keys(publisherFields).length) {
    const { error } = await supabase
      .from('publisher_profiles')
      .upsert({ id: session.user.id, ...publisherFields }, { onConflict: 'id' });
    if (error) return { error };
  }
  return { data: true };
}

export async function updateMyPassword(newPassword) {
  return supabase.auth.updateUser({ password: newPassword });
}

// ── Activity log ──────────────────────────────────────────────

export async function logActivity({ actionType, entityType, entityId, message }) {
  const session = await getSession();
  return supabase.from('activity_log').insert({
    user_id: session?.user?.id || null,
    action_type: actionType,
    entity_type: entityType || null,
    entity_id: entityId || null,
    message,
  });
}

export async function getActivityLog({ limit = 10, userId } = {}) {
  let q = supabase
    .from('activity_log')
    .select('id, action_type, entity_type, message, created_at, user:profiles(name)')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (userId) q = q.eq('user_id', userId);
  return q;
}

// ── Articles (dashboard CRUD) ─────────────────────────────────

export async function dashListArticles({ status, search, authorId, limit = 20, offset = 0 } = {}) {
  let q = supabase
    .from('articles')
    .select(`
      id, title, slug, excerpt, featured_image, status, is_featured,
      views, comments_count, published_at, created_at, updated_at,
      category:article_categories(id, slug, label, color),
      author:profiles(id, name, avatar_url)
    `, { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(offset, offset + limit - 1);
  if (status && status !== 'all') q = q.eq('status', status);
  if (authorId) q = q.eq('author_id', authorId);
  if (search) q = q.ilike('title', `%${search}%`);
  return q;
}

export async function dashArticleCounts(authorId) {
  const base = (status) => {
    let q = supabase.from('articles').select('id', { count: 'exact', head: true });
    if (authorId) q = q.eq('author_id', authorId);
    if (status) q = q.eq('status', status);
    return q;
  };
  const [all, published, draft, pending] = await Promise.all([
    base(), base('published'), base('draft'), base('pending'),
  ]);
  return {
    all: all.count || 0,
    published: published.count || 0,
    draft: draft.count || 0,
    pending: pending.count || 0,
  };
}

export async function getArticleForEdit(id) {
  return supabase
    .from('articles')
    .select(`
      *,
      category:article_categories(id, slug, label),
      tags:article_tags(tag:tags(id, name, slug))
    `)
    .eq('id', id)
    .single();
}

function estimateReadTime(html) {
  const words = String(html || '').replace(/<[^>]*>/g, ' ').trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / 200));
}

export async function saveArticle({ id, title, slug, excerpt, content, featuredImage, categoryId, emirate, area, status, metaTitle, metaDescription, seoScore, isFeatured, tagLabel }) {
  const session = await getSession();
  if (!session) return { error: new Error('Not signed in — please log in again.') };

  const row = {
    title:            title?.trim() || 'Untitled',
    slug:             slug?.trim(),
    excerpt:          excerpt || null,
    content:          content || '',
    featured_image:   featuredImage || null,
    category_id:      categoryId || null,
    emirate:          emirate || null,
    area:             area || null,
    status:           status || 'draft',
    meta_title:       metaTitle || null,
    meta_description: metaDescription || null,
    seo_score:        seoScore ?? null,
    read_time:        estimateReadTime(content),
  };
  if (isFeatured !== undefined) row.is_featured = isFeatured;
  if (tagLabel !== undefined) row.tag_label = tagLabel || null;

  if (id) {
    if (status === 'published') {
      const { data: existing } = await supabase.from('articles').select('published_at').eq('id', id).single();
      if (!existing?.published_at) row.published_at = new Date().toISOString();
    }
    const { data, error } = await supabase.from('articles').update(row).eq('id', id).select('id, slug, status').single();
    return { data, error };
  }

  row.author_id = session.user.id;
  if (status === 'published') row.published_at = new Date().toISOString();
  const { data, error } = await supabase.from('articles').insert(row).select('id, slug, status').single();
  // Slug collision → retry once with a suffix
  if (error && error.code === '23505') {
    row.slug = `${row.slug}-${Math.random().toString(36).slice(2, 6)}`;
    return supabase.from('articles').insert(row).select('id, slug, status').single();
  }
  return { data, error };
}

export async function setArticleTags(articleId, tagNames = []) {
  const clean = [...new Set(tagNames.map(t => t.trim()).filter(Boolean))];
  await supabase.from('article_tags').delete().eq('article_id', articleId);
  if (!clean.length) return { data: [] };

  const slugs = clean.map(n => n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''));
  const { data: existing } = await supabase.from('tags').select('id, slug').in('slug', slugs);
  const found = new Map((existing || []).map(t => [t.slug, t.id]));

  const missing = clean.filter((_, i) => !found.has(slugs[i]));
  if (missing.length) {
    // Creating tags is admin-only under RLS — publishers just attach existing ones
    const { data: created } = await supabase
      .from('tags')
      .upsert(missing.map(n => ({
        name: n,
        slug: n.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''),
      })), { onConflict: 'slug' })
      .select('id, slug');
    (created || []).forEach(t => found.set(t.slug, t.id));
  }

  const links = slugs.filter(s => found.has(s)).map(s => ({ article_id: articleId, tag_id: found.get(s) }));
  if (!links.length) return { data: [] };
  return supabase.from('article_tags').upsert(links, { onConflict: 'article_id,tag_id' });
}

export async function updateArticleStatus(id, status) {
  const patch = { status };
  if (status === 'published') {
    const { data: existing } = await supabase.from('articles').select('published_at').eq('id', id).single();
    if (!existing?.published_at) patch.published_at = new Date().toISOString();
  }
  return supabase.from('articles').update(patch).eq('id', id).select('id, status').single();
}

export async function deleteArticle(id) {
  return supabase.from('articles').delete().eq('id', id);
}

export async function toggleArticleFeatured(id, isFeatured) {
  return supabase.from('articles').update({ is_featured: isFeatured }).eq('id', id);
}

// ── Media upload (Supabase Storage 'media' bucket) ────────────

export async function uploadImage(file, folder = 'posts') {
  const session = await getSession();
  if (!session) return { error: new Error('Not signed in — please log in again.') };
  const ext = (file.name.split('.').pop() || 'jpg').toLowerCase();
  const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error } = await supabase.storage.from('media').upload(path, file, {
    cacheControl: '31536000',
    contentType: file.type || undefined,
  });
  if (error) return { error };
  const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(path);
  await supabase.from('media').insert({
    uploaded_by: session.user.id,
    filename: file.name,
    storage_path: path,
    public_url: publicUrl,
    mime_type: file.type || null,
    size_bytes: file.size || null,
  });
  return { data: { url: publicUrl, path } };
}

// ── Dashboard stats ───────────────────────────────────────────

export async function getDashboardStats() {
  return supabase.rpc('get_dashboard_stats');
}

export async function getDailyViews(days = 7) {
  const since = new Date();
  since.setDate(since.getDate() - (days - 1));
  since.setHours(0, 0, 0, 0);
  const { data, error } = await supabase
    .from('article_views')
    .select('viewed_at, session_id, referrer')
    .gte('viewed_at', since.toISOString())
    .limit(50000);
  if (error) return { data: null, error };

  const buckets = [];
  for (let i = 0; i < days; i++) {
    const d = new Date(since);
    d.setDate(since.getDate() + i);
    buckets.push({ key: d.toISOString().slice(0, 10), date: d, views: 0, sessions: new Set() });
  }
  const byKey = new Map(buckets.map(b => [b.key, b]));
  const sourceCounts = { Organic: 0, Social: 0, Direct: 0, Referral: 0 };
  for (const v of data || []) {
    const b = byKey.get(String(v.viewed_at).slice(0, 10));
    if (b) { b.views++; if (v.session_id) b.sessions.add(v.session_id); }
    const ref = (v.referrer || '').toLowerCase();
    if (!ref) sourceCounts.Direct++;
    else if (/google\.|bing\.|duckduckgo|yahoo\./.test(ref)) sourceCounts.Organic++;
    else if (/facebook|instagram|twitter|t\.co|tiktok|linkedin|youtube|reddit|pinterest/.test(ref)) sourceCounts.Social++;
    else sourceCounts.Referral++;
  }
  const totalRefs = Object.values(sourceCounts).reduce((a, b) => a + b, 0);
  const sources = Object.entries(sourceCounts).map(([label, n]) => ({
    label,
    pct: totalRefs ? Math.round((n / totalRefs) * 100) : 0,
  }));

  return {
    data: {
      days: buckets.map(b => ({
        date: b.key,
        label: b.date.toLocaleDateString('en-GB', { weekday: 'short' }),
        views: b.views,
        visitors: b.sessions.size,
      })),
      sources,
    },
    error: null,
  };
}

export async function getTotalArticleViews() {
  const { data, error } = await supabase
    .from('articles')
    .select('views')
    .limit(10000);
  if (error) return { data: 0, error };
  return { data: (data || []).reduce((s, a) => s + (a.views || 0), 0), error: null };
}

export async function getPublisherStats(authorId) {
  const { data, error } = await supabase
    .from('articles')
    .select('id, status, views')
    .eq('author_id', authorId)
    .limit(5000);
  if (error) return { data: null, error };
  const posts = data || [];
  return {
    data: {
      total: posts.length,
      published: posts.filter(p => p.status === 'published').length,
      drafts: posts.filter(p => p.status === 'draft').length,
      views: posts.reduce((s, p) => s + (p.views || 0), 0),
    },
    error: null,
  };
}

// ── Publishers (admin) ────────────────────────────────────────

export async function listPublishers() {
  return supabase
    .from('profiles')
    .select('id, name, email, role, status, avatar_url, joined_at, publisher_profile:publisher_profiles(job_title, post_count)')
    .eq('role', 'publisher')
    .order('joined_at', { ascending: true });
}

// Creates the auth user with a throwaway client so the admin session is untouched,
// then promotes the profile (allowed by the admin RLS policy).
export async function createPublisher({ name, email, password, jobTitle, status = 'active' }) {
  const temp = createClient(supabaseUrl, supabaseAnon, {
    auth: { persistSession: false, autoRefreshToken: false, storageKey: 'ttd-temp-signup' },
  });
  const { data, error } = await temp.auth.signUp({
    email,
    password,
    options: { data: { name } },
  });
  if (error) return { error };
  const userId = data.user?.id;
  if (!userId) return { error: new Error('Sign-up did not return a user.') };

  const { error: pErr } = await supabase
    .from('profiles')
    .update({ name, role: 'publisher', status })
    .eq('id', userId);
  if (pErr) return { error: pErr };
  await supabase.from('publisher_profiles').upsert({ id: userId, job_title: jobTitle || 'Writer' }, { onConflict: 'id' });
  return { data: { id: userId, emailConfirmationPending: !data.session } };
}

export async function updatePublisher(id, { name, status, jobTitle }) {
  const patch = {};
  if (name !== undefined) patch.name = name;
  if (status !== undefined) patch.status = status;
  if (Object.keys(patch).length) {
    const { error } = await supabase.from('profiles').update(patch).eq('id', id);
    if (error) return { error };
  }
  if (jobTitle !== undefined) {
    const { error } = await supabase.from('publisher_profiles').upsert({ id, job_title: jobTitle }, { onConflict: 'id' });
    if (error) return { error };
  }
  return { data: true };
}

export async function deletePublisher(id) {
  return supabase.from('profiles').delete().eq('id', id);
}

// ── Advertisers (admin) ───────────────────────────────────────

export async function listAdvertisers() {
  return supabase
    .from('advertisers')
    .select(`
      *,
      formats:advertiser_formats(format),
      creatives:advertiser_creatives(id, format, image_url, click_url, alt_text, is_active)
    `)
    .order('created_at', { ascending: false });
}

export async function saveAdvertiser({ id, formats = [], creatives = [], ...fields }) {
  let advertiserId = id;
  if (id) {
    const { error } = await supabase.from('advertisers').update(fields).eq('id', id);
    if (error) return { error };
  } else {
    const { data, error } = await supabase.from('advertisers').insert(fields).select('id').single();
    if (error) return { error };
    advertiserId = data.id;
  }

  await supabase.from('advertiser_formats').delete().eq('advertiser_id', advertiserId);
  if (formats.length) {
    const { error } = await supabase
      .from('advertiser_formats')
      .insert(formats.map(format => ({ advertiser_id: advertiserId, format })));
    if (error) return { error };
  }

  await supabase.from('advertiser_creatives').delete().eq('advertiser_id', advertiserId);
  const validCreatives = creatives.filter(c => c.image_url);
  if (validCreatives.length) {
    const { error } = await supabase.from('advertiser_creatives').insert(
      validCreatives.map(c => ({
        advertiser_id: advertiserId,
        format: c.format || formats[0] || 'Leaderboard Banner',
        image_url: c.image_url,
        click_url: c.click_url || null,
        alt_text: c.alt_text || null,
        is_active: c.is_active !== false,
      }))
    );
    if (error) return { error };
  }
  return { data: { id: advertiserId } };
}

export async function deleteAdvertiser(id) {
  return supabase.from('advertisers').delete().eq('id', id);
}
