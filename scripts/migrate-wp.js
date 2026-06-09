/**
 * WordPress XML → Supabase Migration
 *
 * Parses traveltodubai.WordPress.2026-06-09.xml and imports:
 *   - Authors  → auth.users + profiles (role: publisher)
 *   - Articles → articles table (with featured images, categories, SEO meta)
 *
 * Usage:
 *   node scripts/migrate-wp.js            (real run)
 *   DRY_RUN=true node scripts/migrate-wp.js  (preview only)
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync }  from 'fs';
import { resolve }       from 'path';
import { randomBytes }   from 'crypto';

// ── Load .env.local ──────────────────────────────────────────────────────────
try {
  const lines = readFileSync(resolve(process.cwd(), '.env.local'), 'utf-8').split('\n');
  for (const line of lines) {
    const m = line.match(/^([^#=\s]+)\s*=\s*(.*)$/);
    if (m) {
      const key = m[1].trim();
      const val = m[2].trim().replace(/^["']|["']$/g, '');
      if (!process.env[key]) process.env[key] = val;
    }
  }
} catch {}

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_KEY;
const DRY_RUN      = process.env.DRY_RUN === 'true';
const XML_FILE     = process.argv[2] || 'traveltodubai.WordPress.2026-06-09.xml';

if (!SUPABASE_URL) throw new Error('Missing VITE_SUPABASE_URL in .env.local');
if (!SUPABASE_KEY) throw new Error('Missing SUPABASE_SERVICE_KEY in .env.local');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// ── WP category nicename → Supabase article_categories.slug ─────────────────
// Full mapping derived from actual export (50 unique WP categories)
const CAT_MAP = {
  // ── Travel / General ──────────────────────────────────────────
  'travel':              'travel',
  'flights':             'travel',
  'visas':               'travel',
  'news':                'travel',
  'trending':            'travel',
  'budget-friendly':     'travel',
  'dubai-budget-friendly': 'travel',
  'uncategorized':       'travel',

  // ── Experiences / Attractions / Activities ────────────────────
  'activities':          'experiences',
  'attractions':         'experiences',
  'things-to-do':        'experiences',
  'dubai-attractions':   'experiences',
  'abu-dhabi-attractions': 'experiences',
  'sharjah-attractions': 'experiences',
  'themeparks':          'experiences',
  'experiences':         'experiences',
  'adventure':           'experiences',
  'desert-safari':       'experiences',

  // ── Food & Dining ─────────────────────────────────────────────
  'restaurants':              'eat-drink',
  'restaurants-dubai':        'eat-drink',
  'restaurants-abudhabi':     'eat-drink',
  'restaurants-sharjah':      'eat-drink',
  'restaurants-ajman':        'eat-drink',
  'restaurants-rak':          'eat-drink',
  'restaurants-fujairah':     'eat-drink',
  'restaurants-umm-al-quwain':'eat-drink',
  'cafe':                     'eat-drink',
  'dubai-cafe':               'eat-drink',
  'food':                     'eat-drink',
  'dining':                   'eat-drink',
  'brunch':                   'eat-drink',

  // ── Stay / Hotels ─────────────────────────────────────────────
  'hotels':              'stay',
  'hotels-dubai':        'stay',
  'hotels-abu-dhabi':    'stay',
  'hotels-sharjah':      'stay',
  'hotels-ajman':        'stay',
  'hotels-rak':          'stay',
  'hotels-fujairah':     'stay',
  'hotels-umm-al-quwain':'stay',
  'staycation':          'stay',
  'staycations-in-dubai':'stay',
  'accommodation':       'stay',
  'resorts':             'stay',

  // ── Lifestyle / Events ────────────────────────────────────────
  'events':              'lifestyle',
  'dubai-events':        'lifestyle',
  'abu-dhabi-events':    'lifestyle',
  'sharjah-events':      'lifestyle',
  'offers':              'lifestyle',
  'dubai-offers':        'lifestyle',
  'lifestyle':           'lifestyle',
  'fashion':             'lifestyle',
  'festivals':           'lifestyle',

  // ── Culture ───────────────────────────────────────────────────
  'ramadan':             'culture',
  'culture':             'culture',
  'heritage':            'culture',
  'arts':                'culture',
  'history':             'culture',
  'museums':             'culture',

  // ── Shopping ─────────────────────────────────────────────────
  'shopping':            'shopping',
  'malls':               'shopping',
  'souks':               'shopping',

  // ── Nightlife ─────────────────────────────────────────────────
  'nightclubs':          'nightlife',
  'dubai-nightclubs':    'nightlife',
  'club':                'nightlife',
  'bars':                'nightlife',
  'dubai-bars':          'nightlife',
  'sports-bar':          'nightlife',
  'dubai-sports-bar':    'nightlife',
  'ladies-night':        'nightlife',
  'nightlife':           'nightlife',
  'rooftop-bars':        'nightlife',

  // ── Beaches ───────────────────────────────────────────────────
  'beaches':             'beaches',
  'beach':               'beaches',
  'water-sports':        'beaches',
  'dubai-beach':         'beaches',

  // ── Wellness ──────────────────────────────────────────────────
  'wellness':            'wellness',
  'spa':                 'wellness',
  'fitness':             'wellness',
  'health':              'wellness',

  // ── Family ───────────────────────────────────────────────────
  'family':              'family',
  'kids':                'family',
  'family-activities':   'family',
};

// ── XML Helpers ──────────────────────────────────────────────────────────────

// Extract CDATA (or plain text) from a single tag
function cdata(xml, tag) {
  const escaped = tag.replace(/:/g, '\\:');
  // CDATA form
  let m = xml.match(new RegExp(`<${escaped}(?:\\s[^>]*)?>(<!\\[CDATA\\[([\\s\\S]*?)\\]\\]>)<\\/${escaped}>`));
  if (m) return m[2].trim();
  // Plain text form
  m = xml.match(new RegExp(`<${escaped}(?:\\s[^>]*)?>((?!<!\\[CDATA\\[)[^<]*)<\\/${escaped}>`));
  return m ? m[1].trim() : '';
}

// Get postmeta value by key name
function postmeta(itemXml, key) {
  const blocks = [...itemXml.matchAll(/<wp:postmeta>([\s\S]*?)<\/wp:postmeta>/g)];
  for (const b of blocks) {
    if (cdata(b[1], 'wp:meta_key') === key) return cdata(b[1], 'wp:meta_value');
  }
  return '';
}

function stripHtml(html = '') {
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"').replace(/&#[0-9]+;/g, '')
    .replace(/\s+/g, ' ').trim();
}

function readTime(html = '') {
  return Math.max(1, Math.round(stripHtml(html).split(/\s+/).filter(Boolean).length / 200));
}

// ── Parse XML Sections ───────────────────────────────────────────────────────

function parseAuthors(xml) {
  const map = {};
  for (const m of xml.matchAll(/<wp:author>([\s\S]*?)<\/wp:author>/g)) {
    const b     = m[1];
    const login = cdata(b, 'wp:author_login');
    if (!login) continue;
    map[login] = {
      wpId:        cdata(b, 'wp:author_id'),
      login,
      email:       cdata(b, 'wp:author_email'),
      displayName: cdata(b, 'wp:author_display_name') || login,
      firstName:   cdata(b, 'wp:author_first_name'),
      lastName:    cdata(b, 'wp:author_last_name'),
    };
  }
  return map;
}

function parseAttachments(xml) {
  const map = {};  // post_id → attachment_url
  const items = xml.split(/(?=\t<item>|\n\t\t<item>)/);
  for (const item of items) {
    if (cdata(item, 'wp:post_type') !== 'attachment') continue;
    const id  = cdata(item, 'wp:post_id');
    const url = cdata(item, 'wp:attachment_url');
    if (id && url) map[id] = url;
  }
  return map;
}

function parsePosts(xml) {
  const posts = [];
  // Split on item boundaries
  const parts = xml.split(/(?=<item>)/);
  for (const part of parts) {
    if (!part.includes('<item>')) continue;
    const item = part;

    const postType = cdata(item, 'wp:post_type');
    if (postType !== 'post') continue;

    const wpStatus = cdata(item, 'wp:status');
    if (wpStatus !== 'publish' && wpStatus !== 'draft') continue;

    // Categories (domain="category" only)
    const categories = [];
    for (const cm of item.matchAll(/<category domain="category" nicename="([^"]+)"><!\[CDATA\[(.*?)\]\]><\/category>/g)) {
      categories.push({ nicename: cm[1].toLowerCase(), name: cm[2] });
    }

    // Content — match until ]]></content:encoded>
    let content = '';
    const cm = item.match(/<content:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/content:encoded>/);
    if (cm) content = cm[1];

    // Excerpt
    let excerpt = '';
    const em = item.match(/<excerpt:encoded><!\[CDATA\[([\s\S]*?)\]\]><\/excerpt:encoded>/);
    if (em) excerpt = stripHtml(em[1]).slice(0, 500);

    const seoScore = parseInt(postmeta(item, 'rank_math_seo_score'), 10);

    posts.push({
      title:       cdata(item, 'title'),
      slug:        cdata(item, 'wp:post_name'),
      authorLogin: cdata(item, 'dc:creator'),
      content,
      excerpt:     excerpt || null,
      postDate:    cdata(item, 'wp:post_date'),
      wpStatus,
      categories,
      thumbnailId: postmeta(item, '_thumbnail_id'),
      metaTitle:   postmeta(item, 'rank_math_title') || null,
      metaDesc:    postmeta(item, 'rank_math_description') || null,
      seoScore:    (!isNaN(seoScore) && seoScore >= 0 && seoScore <= 100) ? seoScore : null,
    });
  }
  return posts;
}

// ── Author → Supabase Profile ────────────────────────────────────────────────
async function upsertProfile(author, dryRun) {
  const email = author.email || `wp-${author.wpId}@migration.internal`;
  const name  = author.displayName
    || `${author.firstName} ${author.lastName}`.trim()
    || author.login;

  if (dryRun) {
    console.log(`  [DRY] author: ${name} <${email}>`);
    return null;
  }

  // Idempotent — reuse if already exists
  const { data: existing } = await supabase
    .from('profiles').select('id').eq('email', email).maybeSingle();
  if (existing) {
    console.log(`  ↩  exists: ${name}`);
    return existing.id;
  }

  // Create the auth user
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password:      randomBytes(24).toString('hex'),
    email_confirm: true,
    user_metadata: { name },
  });
  if (error) { console.warn(`  ⚠ ${name}: ${error.message}`); return null; }

  const userId = data.user.id;

  // Manually create the profile row (trigger may not be attached on manually-applied schema)
  const { error: profErr } = await supabase.from('profiles').upsert({
    id:    userId,
    name,
    email,
    role:  'publisher',
  }, { onConflict: 'id' });
  if (profErr) console.warn(`  ⚠ profile row for "${name}": ${profErr.message}`);

  console.log(`  ✓  ${name}`);
  return userId;
}

// ── Main ─────────────────────────────────────────────────────────────────────
async function main() {
  console.log('\n=== WordPress XML → Supabase Migration ===');
  if (DRY_RUN) console.log('(DRY RUN — no writes)\n');

  // 1. Read XML
  console.log(`Reading ${XML_FILE}…`);
  const xml = readFileSync(resolve(process.cwd(), XML_FILE), 'utf-8');
  console.log(`  Size: ${(xml.length / 1024 / 1024).toFixed(2)} MB`);

  // 2. Parse
  console.log('Parsing…');
  const wpAuthors   = parseAuthors(xml);
  const attachments = parseAttachments(xml);
  const wpPosts     = parsePosts(xml);

  const published = wpPosts.filter(p => p.wpStatus === 'publish').length;
  const drafts    = wpPosts.filter(p => p.wpStatus === 'draft').length;
  console.log(`  Authors     : ${Object.keys(wpAuthors).length}`);
  console.log(`  Attachments : ${Object.keys(attachments).length}`);
  console.log(`  Posts       : ${wpPosts.length} (${published} published, ${drafts} drafts)`);

  // 3. Supabase categories
  console.log('\nLoading Supabase categories…');
  const { data: cats, error: catErr } = await supabase.from('article_categories').select('id, slug');
  if (catErr) {
    console.error('Could not load article_categories:', catErr.message);
    console.error('Make sure you have applied the Supabase schema first!');
    process.exit(1);
  }
  const catMap = Object.fromEntries(cats.map(c => [c.slug, c.id]));
  console.log(`  Found: ${Object.keys(catMap).join(', ')}`);

  // 4. Existing slugs (dedup)
  const { data: existingSlugs } = await supabase.from('articles').select('slug');
  const usedSlugs = new Set((existingSlugs || []).map(r => r.slug));

  // 5. Authors
  console.log('\n=== Authors ===');
  const profileMap = {};  // login → supabase uuid
  for (const [login, author] of Object.entries(wpAuthors)) {
    const id = await upsertProfile(author, DRY_RUN);
    if (id) profileMap[login] = id;
  }
  console.log(`  ${Object.keys(profileMap).length} author profiles ready`);

  // 6. Articles
  console.log('\n=== Articles ===');
  let ok = 0, skip = 0, fail = 0;

  for (const post of wpPosts) {
    if (!post.title || !post.slug) { skip++; continue; }

    // Deduplicate slug
    let slug = post.slug;
    if (usedSlugs.has(slug)) slug = `${slug}-${post.thumbnailId || Math.random().toString(36).slice(2, 6)}`;
    usedSlugs.add(slug);

    // Resolve category
    let catId = null;
    for (const c of post.categories) {
      const mapped = CAT_MAP[c.nicename];
      if (mapped && catMap[mapped]) { catId = catMap[mapped]; break; }
    }
    if (!catId) catId = catMap['travel'] || null;

    const article = {
      title:            post.title,
      slug,
      excerpt:          post.excerpt,
      content:          post.content || null,
      featured_image:   post.thumbnailId ? (attachments[post.thumbnailId] || null) : null,
      category_id:      catId,
      author_id:        profileMap[post.authorLogin] || null,
      status:           post.wpStatus === 'publish' ? 'published' : 'draft',
      published_at:     post.wpStatus === 'publish' ? (post.postDate || null) : null,
      read_time:        readTime(post.content),
      meta_title:       post.metaTitle,
      meta_description: post.metaDesc,
      seo_score:        post.seoScore,
    };

    if (DRY_RUN) {
      const img = article.featured_image ? '[img]' : '[no-img]';
      const auth = article.author_id ? '[author]' : '[no-author]';
      console.log(`  [DRY] ${img} ${auth} "${post.title.slice(0, 65)}"`);
      ok++;
      continue;
    }

    // Upsert on slug — inserts new articles, updates existing ones (adds author_id, etc.)
    const { error } = await supabase
      .from('articles')
      .upsert(article, { onConflict: 'slug' });
    if (error) {
      console.error(`  ✗ "${post.title.slice(0, 65)}" — ${error.message}`);
      fail++;
    } else {
      const img = article.featured_image ? '🖼 ' : '   ';
      console.log(`  ✓ ${img}"${post.title.slice(0, 65)}"`);
      ok++;
    }
  }

  // 7. Summary
  console.log('\n══════════════════════════════════');
  console.log(`  Inserted : ${ok}`);
  console.log(`  Skipped  : ${skip}`);
  console.log(`  Failed   : ${fail}`);
  console.log(`  Authors  : ${Object.keys(profileMap).length}`);
  console.log('══════════════════════════════════');
  if (!DRY_RUN && fail === 0) {
    console.log('\n✓ Migration complete!');
    console.log('  Supabase → Table Editor → articles   (view posts)');
    console.log('  Supabase → Table Editor → profiles   (view authors)');
  }
}

main().catch(err => {
  console.error('\n✗ Fatal:', err.message);
  process.exit(1);
});
