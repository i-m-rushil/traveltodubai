<div align="center">

# 🌇 Travel to Dubai

### A modern travel & news magazine for Dubai and the UAE — with a built-in CMS and a live flight & hotel booking engine.

[![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-Postgres-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com/)
[![React Router](https://img.shields.io/badge/React_Router-7-CA4245?style=for-the-badge&logo=reactrouter&logoColor=white)](https://reactrouter.com/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/)

</div>

---

## ✨ Overview

**Travel to Dubai** is a full-stack content platform that blends an editorial travel magazine with a monetizable booking experience. It ships with a public-facing site, a **role-based content management system** (admin + publisher portals), and an **affiliate-powered flight & hotel search** built on the Travelpayouts network.

The frontend is a **React 19 SPA** styled entirely with inline styles and CSS variables — no UI framework, no global state library, just clean React hooks. The backend is **Supabase Postgres** with row-level security, database triggers, RPCs, and **Deno Edge Functions** that proxy and cache travel pricing data.

---

## 🚀 Features

### 🏠 Public Site
- **Dynamic homepage** — hero slider, breaking-news ticker, featured grid, and category rows (Stay, Food & Drink, Things to Do, Insights) all served live from Supabase
- **Article pages** with reading-progress bar, related posts, comments, and view tracking
- **Category & Emirate browsing** with area filters across all 7 emirates
- **Utility pages** — prayer times (live via the Aladhan API), currency rates, and curated UAE info

### ✈️ Flight & Hotel Booking
- **Live search** for flights and hotels through Travelpayouts, proxied via a Supabase Edge Function
- **Smart caching** (30-minute TTL) with **stale-serve fallback** if the upstream API is down
- **Airport autocomplete**, affiliate deep-links, and full click-tracking for commission attribution
- **Curated sections** — popular routes and featured hotels refreshed nightly via a scheduled cron job

### 🛠️ Content Management System
- **Two roles, two portals** — `admin` and `publisher`, each with its own dashboard, enforced by Postgres RLS
- **Rich article editor** with live SEO scoring, auto-save drafts, image upload, Instagram embeds, and emirate/area tagging
- **Admin tools** — manage publishers, moderate all posts, and run an advertiser CRM with creatives & ad formats
- **Analytics dashboard** — traffic charts, referrer source breakdown, top posts, and an activity log

---

## 🧱 Tech Stack

| Layer        | Technology                                                        |
|--------------|-------------------------------------------------------------------|
| **Frontend** | React 19, React Router 7, Vite 8                                  |
| **Styling**  | Inline styles + CSS custom properties (no framework)             |
| **Backend**  | Supabase — Postgres, Auth, Storage, Row-Level Security           |
| **Functions**| Supabase Edge Functions (Deno / TypeScript)                      |
| **Affiliate**| Travelpayouts (Aviasales flights, Hotellook hotels)             |
| **Hosting**  | Vercel (SPA rewrites)                                            |

---

## 🗂️ Project Structure

```
traveltodubai/
├── src/
│   ├── components/        # Public UI: Header, HeroSlider, sections, ads, travel results
│   ├── pages/
│   │   ├── admin/         # Admin portal: dashboard, publishers, posts, advertisers
│   │   ├── publisher/     # Publisher portal: home, posts, compose editor, profile
│   │   └── *.jsx          # Public pages: Category, Article, PlanTrip, Emirate, static pages
│   ├── lib/
│   │   ├── supabase.js    # Single data-access layer (auth, articles, CMS, stats)
│   │   ├── travelApi.js   # Flight/hotel search, autocomplete, affiliate tracking
│   │   └── normalize.js   # Maps DB rows → consistent UI shapes
│   ├── data/             # Static data: UAE areas, currency rates, prayer locations
│   ├── hooks/            # useIsMobile and friends
│   └── App.jsx           # Routing for public site, admin, and publisher trees
├── supabase/
│   ├── migrations/        # Full schema, RLS policies, triggers, RPCs
│   └── functions/         # Edge Functions: travel-search, refresh-prices
└── docs/                 # Setup runbook + affiliate design specs
```

---

## ⚡ Getting Started

### Prerequisites
- **Node.js** 18+
- A **Supabase** project
- *(Optional)* a **Travelpayouts** account to enable live booking data

### 1. Install

```bash
git clone https://github.com/i-m-rushil/traveltodubai.git
cd traveltodubai
npm install
```

### 2. Configure environment

Create a `.env.local` file in the project root:

```env
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
VITE_TRAVELPAYOUTS_MARKER=your-affiliate-marker   # optional
```

> ⚠️ `.env.local` is git-ignored — never commit your keys.

### 3. Set up the database

Apply the migrations in `supabase/migrations/` to your Supabase project (via the Supabase CLI or SQL editor), then deploy the Edge Functions in `supabase/functions/`.

### 4. Run

```bash
npm run dev       # start the dev server
npm run build     # production build
npm run preview   # preview the production build
npm run lint      # run ESLint
```

The app runs at **http://localhost:5173**.

---

## 💰 Enabling Live Booking Data

The flight & hotel search works out of the box once Travelpayouts is configured. See the full operator runbook in **[`docs/TRAVEL_SETUP.md`](docs/TRAVEL_SETUP.md)** — it covers setting Supabase secrets, scheduling the nightly price refresh, and verifying the affiliate commission path.

---

## 🔐 Roles & Permissions

| Role          | Capabilities                                                                 |
|---------------|------------------------------------------------------------------------------|
| **Admin**     | Full control — manage publishers, all posts, advertisers, and site settings |
| **Publisher** | Create and edit their own articles; read-only advertiser directory          |
| **Reader**    | Browse published content, comment, and submit forms                          |

All access is enforced server-side by **Supabase Row-Level Security** — the client-side route guards are convenience only.

---

## 📦 Deployment

Optimized for **Vercel**. The included `vercel.json` rewrites all routes to `index.html` for SPA routing. Add the same `VITE_*` environment variables in your Vercel project settings and deploy.

---

<div align="center">

Built with ❤️ for travelers exploring the UAE.

</div>
