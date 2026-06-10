// Creates the dashboard auth users in Supabase (idempotent).
// Usage: node scripts/setup-auth-users.js
import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const env = {}
for (const line of readFileSync(resolve(process.cwd(), '.env.local'), 'utf8').split('\n')) {
  const m = line.match(/^([A-Z_]+)=(.*)$/)
  if (m) env[m[1]] = m[2].trim()
}

const url = env.VITE_SUPABASE_URL
const serviceKey = env.SUPABASE_SERVICE_KEY
if (!url || !serviceKey) {
  console.error('Missing VITE_SUPABASE_URL or SUPABASE_SERVICE_KEY in .env.local')
  process.exit(1)
}

const admin = createClient(url, serviceKey, { auth: { autoRefreshToken: false, persistSession: false } })

const USERS = [
  { email: 'admin@traveltodubai.com', password: 'Admin@123', name: 'Admin', role: 'admin' },
  { email: 'publisher@traveltodubai.com', password: 'Publisher@123', name: 'Sarah Mitchell', role: 'publisher' },
]

async function findUserByEmail(email) {
  let page = 1
  for (;;) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 })
    if (error) throw error
    const hit = data.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())
    if (hit) return hit
    if (data.users.length < 200) return null
    page++
  }
}

for (const u of USERS) {
  let user = await findUserByEmail(u.email)
  if (!user) {
    const { data, error } = await admin.auth.admin.createUser({
      email: u.email,
      password: u.password,
      email_confirm: true,
      user_metadata: { name: u.name, role: u.role },
    })
    if (error) throw error
    user = data.user
    console.log(`created auth user ${u.email} (${user.id})`)
  } else {
    const { error } = await admin.auth.admin.updateUserById(user.id, {
      password: u.password,
      email_confirm: true,
      user_metadata: { name: u.name, role: u.role },
    })
    if (error) throw error
    console.log(`auth user ${u.email} already exists (${user.id}) — password/metadata refreshed`)
  }

  const { error: pErr } = await admin.from('profiles').upsert(
    { id: user.id, email: u.email, name: u.name, role: u.role, status: 'active' },
    { onConflict: 'id' }
  )
  if (pErr) throw pErr
  console.log(`profile upserted: ${u.email} → role=${u.role}`)

  if (u.role === 'publisher' || u.role === 'admin') {
    const { error: ppErr } = await admin.from('publisher_profiles').upsert(
      { id: user.id, job_title: u.role === 'admin' ? 'Editor in Chief' : 'Senior Writer' },
      { onConflict: 'id' }
    )
    if (ppErr) throw ppErr
  }
}

console.log('done')
