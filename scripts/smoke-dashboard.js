// End-to-end smoke test of the dashboard data layer using the ANON key,
// exactly like the browser. Usage: node scripts/smoke-dashboard.js
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const env = {}
for (const line of readFileSync(resolve(process.cwd(), '.env.local'), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/)
  if (m) env[m[1]] = m[2].trim()
}

const url = env.VITE_SUPABASE_URL
const anon = env.VITE_SUPABASE_ANON_KEY

let failures = 0
function ok(label, cond, extra = '') {
  console.log(`${cond ? 'PASS' : 'FAIL'}  ${label}${extra ? ` — ${extra}` : ''}`)
  if (!cond) failures++
}

function client() {
  return createClient(url, anon, { auth: { persistSession: false, autoRefreshToken: false } })
}

// ── Publisher flow ────────────────────────────────────────────
const pub = client()
{
  const { data, error } = await pub.auth.signInWithPassword({ email: 'publisher@traveltodubai.com', password: 'Publisher@123' })
  ok('publisher sign-in', !error && !!data.session, error?.message)
}
const { data: pubProfile } = await pub.from('profiles').select('id, role, name').eq('email', 'publisher@traveltodubai.com').single()
ok('publisher profile role', pubProfile?.role === 'publisher', JSON.stringify(pubProfile))

const { data: cats } = await pub.from('article_categories').select('id, slug').limit(1)
ok('categories readable', (cats || []).length > 0)

// Create draft
const slug = `smoke-test-${Date.now()}`
const { data: created, error: createErr } = await pub.from('articles').insert({
  title: 'Smoke Test Post — safe to delete',
  slug,
  excerpt: 'Automated smoke test',
  content: '<p>Hello <strong>Dubai</strong></p><blockquote class="instagram-media" data-instgrm-permalink="https://www.instagram.com/p/TEST/"><a href="https://www.instagram.com/p/TEST/">IG</a></blockquote>',
  category_id: cats?.[0]?.id || null,
  author_id: pubProfile.id,
  status: 'draft',
  read_time: 1,
}).select('id, slug, status').single()
ok('publisher creates draft', !createErr && !!created?.id, createErr?.message)

// Publish it
const { error: pubErr } = await pub.from('articles').update({ status: 'published', published_at: new Date().toISOString() }).eq('id', created.id)
ok('publisher publishes own post', !pubErr, pubErr?.message)

// Tag attach (existing tag)
const { data: tag } = await pub.from('tags').select('id').eq('slug', 'luxury').single()
if (tag) {
  const { error: tagErr } = await pub.from('article_tags').insert({ article_id: created.id, tag_id: tag.id })
  ok('publisher attaches tag', !tagErr, tagErr?.message)
}

// Public visibility (anon, no session)
const anonClient = client()
{
  const { data } = await anonClient.from('articles').select('id, title').eq('slug', slug).eq('status', 'published').single()
  ok('published post publicly visible', !!data?.id)
}

// Storage upload (1x1 px PNG)
const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64')
const path = `smoke/${Date.now()}.png`
{
  const { error } = await pub.storage.from('media').upload(path, png, { contentType: 'image/png' })
  ok('publisher uploads image to media bucket', !error, error?.message)
  const { data: { publicUrl } } = pub.storage.from('media').getPublicUrl(path)
  const res = await fetch(publicUrl)
  ok('uploaded image publicly readable', res.ok, `status ${res.status}`)
}

// media table row
{
  const { error } = await pub.from('media').insert({
    uploaded_by: pubProfile.id, filename: 'smoke.png', storage_path: path,
    public_url: 'x', mime_type: 'image/png', size_bytes: png.length,
  })
  ok('media table insert', !error, error?.message)
}

// publisher_profiles update (profile page)
{
  const { error } = await pub.from('publisher_profiles').upsert({ id: pubProfile.id, phone: '+971500000000', website: 'https://example.com' }, { onConflict: 'id' })
  ok('publisher profile fields save', !error, error?.message)
}

// Publisher can read advertisers (new policy)
{
  const { error } = await pub.from('advertisers').select('id').limit(1)
  ok('publisher can read advertisers', !error, error?.message)
}

// ── Admin flow ────────────────────────────────────────────────
const adm = client()
{
  const { data, error } = await adm.auth.signInWithPassword({ email: 'admin@traveltodubai.com', password: 'Admin@123' })
  ok('admin sign-in', !error && !!data.session, error?.message)
}

// Admin sees drafts of others + can change status
{
  const { error } = await adm.from('articles').update({ status: 'draft' }).eq('id', created.id)
  ok('admin changes status of another author post', !error, error?.message)
}

// Dashboard RPC
{
  const { data, error } = await adm.rpc('get_dashboard_stats')
  ok('get_dashboard_stats RPC', !error && typeof data?.total_articles === 'number', error?.message || JSON.stringify(data)?.slice(0, 120))
}

// article_views readable by admin
{
  const { error } = await adm.from('article_views').select('viewed_at').limit(1)
  ok('admin reads article_views', !error, error?.message)
}

// Activity log insert + read
{
  const { error: insErr } = await adm.from('activity_log').insert({ user_id: null, action_type: 'article_updated', message: 'smoke test entry' })
  ok('activity_log insert', !insErr, insErr?.message)
  const { data, error } = await adm.from('activity_log').select('id, message').order('created_at', { ascending: false }).limit(1)
  ok('activity_log read', !error && data?.length > 0, error?.message)
}

// Advertiser CRUD
let advId
{
  const { data, error } = await adm.from('advertisers').insert({
    company: 'Smoke Test Co', contact_name: 'Tester', email: 'smoke@test.com',
    industry: 'Testing', package: 'Standard', monthly_budget: 1000, status: 'active', brand_color: '#0066CC',
  }).select('id').single()
  advId = data?.id
  ok('admin creates advertiser', !error && !!advId, error?.message)
  if (advId) {
    const { error: fErr } = await adm.from('advertiser_formats').insert({ advertiser_id: advId, format: 'Leaderboard Banner' })
    ok('advertiser format insert', !fErr, fErr?.message)
    const { error: cErr } = await adm.from('advertiser_creatives').insert({ advertiser_id: advId, format: 'Leaderboard Banner', image_url: 'https://example.com/x.png' })
    ok('advertiser creative insert', !cErr, cErr?.message)
    const { data: listed, error: lErr } = await adm.from('advertisers').select('*, formats:advertiser_formats(format), creatives:advertiser_creatives(id)').eq('id', advId).single()
    ok('advertiser nested list', !lErr && listed.formats.length === 1 && listed.creatives.length === 1, lErr?.message)
  }
}

// Publishers list for admin
{
  const { data, error } = await adm.from('profiles').select('id, name, publisher_profile:publisher_profiles(job_title, post_count)').eq('role', 'publisher')
  ok('admin lists publishers', !error && (data || []).length > 0, error?.message)
}

// ── Cleanup ───────────────────────────────────────────────────
{
  const { error } = await adm.from('articles').delete().eq('id', created.id)
  ok('admin deletes test post', !error, error?.message)
}
if (advId) {
  const { error } = await adm.from('advertisers').delete().eq('id', advId)
  ok('admin deletes test advertiser', !error, error?.message)
}
await adm.from('media').delete().eq('storage_path', path)
await adm.storage.from('media').remove([path])
await adm.from('activity_log').delete().eq('message', 'smoke test entry')
await adm.from('publisher_profiles').update({ phone: null, website: null }).eq('id', pubProfile.id)

console.log(failures === 0 ? '\nALL CHECKS PASSED' : `\n${failures} CHECK(S) FAILED`)
process.exit(failures === 0 ? 0 : 1)
