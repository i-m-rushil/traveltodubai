-- =============================================================
-- Travel to Dubai — Complete Supabase Database Schema
-- Migration: 20260606000001_initial_schema.sql
-- =============================================================

-- ─────────────────────────────────────────────────────────────
-- EXTENSIONS
-- ─────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";       -- full-text search on article titles

-- ─────────────────────────────────────────────────────────────
-- ENUMS
-- ─────────────────────────────────────────────────────────────
CREATE TYPE user_role         AS ENUM ('admin', 'publisher', 'reader');
CREATE TYPE user_status       AS ENUM ('active', 'suspended', 'pending');
CREATE TYPE article_status    AS ENUM ('published', 'draft', 'pending', 'archived');
CREATE TYPE advertiser_status AS ENUM ('active', 'inactive', 'paused', 'expired');
CREATE TYPE ad_package        AS ENUM ('Premium', 'Standard', 'Basic');
CREATE TYPE ad_format         AS ENUM (
  'Leaderboard Banner',
  'Sidebar Rectangle',
  'Article Inline',
  'Mobile Banner',
  'Sponsored Card',
  'Newsletter Banner'
);
CREATE TYPE complaint_type    AS ENUM ('inaccurate', 'offensive', 'spam', 'copyright', 'other');
CREATE TYPE contact_status    AS ENUM ('new', 'read', 'replied', 'archived');
CREATE TYPE application_status AS ENUM ('new', 'reviewed', 'shortlisted', 'rejected');
CREATE TYPE action_type AS ENUM (
  'article_published',
  'article_updated',
  'article_deleted',
  'user_created',
  'user_updated',
  'user_suspended',
  'advertiser_created',
  'advertiser_updated',
  'comment_approved',
  'comment_deleted',
  'login',
  'logout'
);
CREATE TYPE emirate AS ENUM (
  'Dubai',
  'Abu Dhabi',
  'Sharjah',
  'Ras Al Khaimah',
  'Fujairah',
  'Ajman',
  'Umm Al Quwain'
);

-- ─────────────────────────────────────────────────────────────
-- PROFILES  (extends auth.users 1-to-1)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name        TEXT NOT NULL,
  email       TEXT NOT NULL UNIQUE,
  role        user_role    NOT NULL DEFAULT 'reader',
  status      user_status  NOT NULL DEFAULT 'active',
  avatar_url  TEXT,
  bio         TEXT,
  joined_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Additional fields for publisher accounts
CREATE TABLE publisher_profiles (
  id               UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  job_title        TEXT,                          -- 'Senior Editor', 'Travel Writer', etc.
  post_count       INTEGER NOT NULL DEFAULT 0,
  specializations  TEXT[]  NOT NULL DEFAULT '{}', -- ['Travel', 'Food', 'Culture']
  social_twitter   TEXT,
  social_instagram TEXT,
  social_linkedin  TEXT
);

-- ─────────────────────────────────────────────────────────────
-- NAVIGATION  (mirrors navLinks in mockData.js)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE nav_categories (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  label      TEXT    NOT NULL,
  slug       TEXT    NOT NULL UNIQUE,
  grid_cols  INTEGER NOT NULL DEFAULT 3,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active  BOOLEAN NOT NULL DEFAULT true
);

CREATE TABLE nav_sub_categories (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  nav_category_id  UUID NOT NULL REFERENCES nav_categories(id) ON DELETE CASCADE,
  label            TEXT NOT NULL,
  slug             TEXT NOT NULL,
  specialty        TEXT,           -- 'Burj Khalifa', 'Ferrari World', etc.
  image_url        TEXT,
  sort_order       INTEGER NOT NULL DEFAULT 0,
  UNIQUE (nav_category_id, slug)
);

-- ─────────────────────────────────────────────────────────────
-- ARTICLE CATEGORIES  (mirrors CATEGORIES array in CategoryPage)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE article_categories (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug        TEXT NOT NULL UNIQUE,
  label       TEXT NOT NULL,
  color       TEXT NOT NULL DEFAULT '#e43d30',
  description TEXT,
  hero_image  TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true
);

-- Sub-categories within an article category (the SubCatStrip items)
CREATE TABLE article_sub_categories (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_category_id UUID NOT NULL REFERENCES article_categories(id) ON DELETE CASCADE,
  label               TEXT NOT NULL,
  slug                TEXT NOT NULL,
  specialty           TEXT,
  image_url           TEXT,
  sort_order          INTEGER NOT NULL DEFAULT 0,
  UNIQUE (article_category_id, slug)
);

-- ─────────────────────────────────────────────────────────────
-- TAGS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE tags (
  id   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE
);

-- ─────────────────────────────────────────────────────────────
-- ARTICLES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE articles (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title             TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  excerpt           TEXT,
  content           TEXT,                  -- rich HTML / markdown body
  featured_image    TEXT,
  category_id       UUID REFERENCES article_categories(id) ON DELETE SET NULL,
  sub_category_id   UUID REFERENCES article_sub_categories(id) ON DELETE SET NULL,
  author_id         UUID REFERENCES profiles(id) ON DELETE SET NULL,
  status            article_status NOT NULL DEFAULT 'draft',
  is_featured       BOOLEAN NOT NULL DEFAULT false,
  tag_label         TEXT,                  -- editorial badge: 'EXCLUSIVE', 'TRENDING', etc.
  views             INTEGER NOT NULL DEFAULT 0,
  comments_count    INTEGER NOT NULL DEFAULT 0,
  read_time         INTEGER NOT NULL DEFAULT 3,  -- minutes
  -- SEO
  meta_title        TEXT,
  meta_description  TEXT,
  seo_score         INTEGER CHECK (seo_score BETWEEN 0 AND 100),
  -- Dates
  published_at      TIMESTAMPTZ,
  scheduled_at      TIMESTAMPTZ,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE article_tags (
  article_id UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  tag_id     UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (article_id, tag_id)
);

-- ─────────────────────────────────────────────────────────────
-- ARTICLE ANALYTICS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE article_views (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id  UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  viewer_ip   INET,
  session_id  TEXT,
  referrer    TEXT,
  user_agent  TEXT,
  viewed_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE article_analytics (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id        UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  date              DATE NOT NULL,
  views             INTEGER NOT NULL DEFAULT 0,
  unique_visitors   INTEGER NOT NULL DEFAULT 0,
  avg_time_on_page  NUMERIC(6,2),          -- seconds
  UNIQUE (article_id, date)
);

-- ─────────────────────────────────────────────────────────────
-- COMMENTS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE comments (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id   UUID NOT NULL REFERENCES articles(id) ON DELETE CASCADE,
  user_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  -- guest fields when not authenticated
  guest_name   TEXT,
  guest_email  TEXT,
  content      TEXT NOT NULL,
  is_approved  BOOLEAN NOT NULL DEFAULT false,
  parent_id    UUID REFERENCES comments(id) ON DELETE CASCADE,  -- reply threading
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- ADVERTISERS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE advertisers (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company        TEXT NOT NULL,
  contact_name   TEXT NOT NULL,
  email          TEXT NOT NULL,
  phone          TEXT,
  website        TEXT,
  industry       TEXT,
  package        ad_package        NOT NULL DEFAULT 'Basic',
  monthly_budget NUMERIC(12,2),
  status         advertiser_status NOT NULL DEFAULT 'active',
  brand_color    TEXT,
  notes          TEXT,
  start_date     DATE,
  end_date       DATE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE advertiser_formats (
  advertiser_id UUID      NOT NULL REFERENCES advertisers(id) ON DELETE CASCADE,
  format        ad_format NOT NULL,
  PRIMARY KEY (advertiser_id, format)
);

CREATE TABLE advertiser_creatives (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  advertiser_id UUID      NOT NULL REFERENCES advertisers(id) ON DELETE CASCADE,
  format        ad_format NOT NULL,
  image_url     TEXT      NOT NULL,
  click_url     TEXT,
  alt_text      TEXT,
  is_active     BOOLEAN   NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- EXPERIENCES  (Dubai experiences/activities listing)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE experiences (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title        TEXT NOT NULL,
  subtitle     TEXT,
  description  TEXT,
  image_url    TEXT,
  price        NUMERIC(10,2),
  price_label  TEXT,                   -- 'Free', 'From AED 500', etc.
  duration     TEXT,                   -- '2 hours', 'Full day'
  rating       NUMERIC(3,1) CHECK (rating BETWEEN 0 AND 5),
  reviews_count INTEGER NOT NULL DEFAULT 0,
  category     TEXT NOT NULL,          -- 'adventure', 'culture', 'dining', etc.
  emirate      emirate NOT NULL DEFAULT 'Dubai',
  booking_url  TEXT,
  is_active    BOOLEAN NOT NULL DEFAULT true,
  sort_order   INTEGER NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- EVENTS  (weekly / recurring events)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE events (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title       TEXT NOT NULL,
  category    TEXT NOT NULL,           -- 'Brunch', 'Nightlife', 'Market', etc.
  day_of_week TEXT,                    -- 'Friday', 'Saturday', 'Daily'
  start_time  TIME,
  end_time    TIME,
  location    TEXT,
  description TEXT,
  price       NUMERIC(10,2),
  price_label TEXT,
  emirate     emirate NOT NULL DEFAULT 'Dubai',
  image_url   TEXT,
  booking_url TEXT,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- HERO SLIDES  (homepage hero carousel)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE hero_slides (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  article_id  UUID REFERENCES articles(id) ON DELETE SET NULL,
  title       TEXT NOT NULL,
  excerpt     TEXT,
  image_url   TEXT NOT NULL,
  badge       TEXT,                    -- 'EXCLUSIVE', 'BREAKING', etc.
  category    TEXT,
  link_url    TEXT,
  sort_order  INTEGER NOT NULL DEFAULT 0,
  is_active   BOOLEAN NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- BREAKING NEWS TICKER
-- ─────────────────────────────────────────────────────────────
CREATE TABLE ticker_items (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message    TEXT    NOT NULL,
  link_url   TEXT,
  sort_order INTEGER NOT NULL DEFAULT 0,
  is_active  BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- PRAYER TIMES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE prayer_times (
  id       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  emirate  emirate NOT NULL,
  date     DATE    NOT NULL,
  fajr     TIME    NOT NULL,
  sunrise  TIME    NOT NULL,
  dhuhr    TIME    NOT NULL,
  asr      TIME    NOT NULL,
  maghrib  TIME    NOT NULL,
  isha     TIME    NOT NULL,
  UNIQUE (emirate, date)
);

-- ─────────────────────────────────────────────────────────────
-- MEDIA LIBRARY
-- ─────────────────────────────────────────────────────────────
CREATE TABLE media (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  uploaded_by  UUID REFERENCES profiles(id) ON DELETE SET NULL,
  filename     TEXT NOT NULL,
  storage_path TEXT NOT NULL UNIQUE,   -- Supabase Storage path
  public_url   TEXT NOT NULL,
  mime_type    TEXT NOT NULL,
  size_bytes   BIGINT NOT NULL,
  alt_text     TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- NEWSLETTER SUBSCRIBERS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE newsletter_subscribers (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email          TEXT NOT NULL UNIQUE,
  status         TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
  source         TEXT,                 -- 'homepage', 'footer', 'article', etc.
  subscribed_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  unsubscribed_at TIMESTAMPTZ
);

-- ─────────────────────────────────────────────────────────────
-- CONTACT SUBMISSIONS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE contact_submissions (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       TEXT NOT NULL,
  email      TEXT NOT NULL,
  subject    TEXT NOT NULL,
  message    TEXT NOT NULL,
  status     contact_status NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- WORK APPLICATIONS  (careers page)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE work_applications (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           TEXT NOT NULL,
  email          TEXT NOT NULL,
  role_applied   TEXT NOT NULL,
  cover_letter   TEXT,
  portfolio_url  TEXT,
  cv_url         TEXT,                 -- Supabase Storage path to uploaded CV
  status         application_status NOT NULL DEFAULT 'new',
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- AD INQUIRIES
-- ─────────────────────────────────────────────────────────────
CREATE TABLE ad_inquiries (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  company       TEXT NOT NULL,
  contact_name  TEXT NOT NULL,
  email         TEXT NOT NULL,
  phone         TEXT,
  budget_range  TEXT,                  -- 'Under AED 5k', 'AED 5k-20k', etc.
  goals         TEXT,
  message       TEXT,
  status        contact_status NOT NULL DEFAULT 'new',
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- COMPLAINTS
-- ─────────────────────────────────────────────────────────────
CREATE TABLE complaints (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name           TEXT NOT NULL,
  email          TEXT NOT NULL,
  article_id     UUID REFERENCES articles(id) ON DELETE SET NULL,
  complaint_type complaint_type NOT NULL,
  description    TEXT NOT NULL,
  status         contact_status NOT NULL DEFAULT 'new',
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- DAILY TRAFFIC  (dashboard analytics)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE daily_traffic (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date             DATE NOT NULL UNIQUE,
  total_views      INTEGER NOT NULL DEFAULT 0,
  unique_visitors  INTEGER NOT NULL DEFAULT 0,
  bounce_rate      NUMERIC(5,2),        -- percentage 0-100
  -- Traffic source percentages
  source_organic   NUMERIC(5,2),
  source_social    NUMERIC(5,2),
  source_direct    NUMERIC(5,2),
  source_referral  NUMERIC(5,2),
  source_email     NUMERIC(5,2)
);

-- ─────────────────────────────────────────────────────────────
-- ACTIVITY LOG  (admin audit trail)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE activity_log (
  id           UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id      UUID REFERENCES profiles(id) ON DELETE SET NULL,
  action_type  action_type NOT NULL,
  entity_type  TEXT,                   -- 'article', 'user', 'advertiser', etc.
  entity_id    UUID,
  message      TEXT NOT NULL,
  metadata     JSONB,                  -- extra context (old/new values, etc.)
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─────────────────────────────────────────────────────────────
-- SITE SETTINGS  (key-value config store)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE site_settings (
  key         TEXT PRIMARY KEY,
  value       JSONB NOT NULL,
  description TEXT,
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_by  UUID REFERENCES profiles(id) ON DELETE SET NULL
);


-- =============================================================
-- INDEXES
-- =============================================================

-- Articles
CREATE INDEX idx_articles_status       ON articles (status);
CREATE INDEX idx_articles_category     ON articles (category_id);
CREATE INDEX idx_articles_author       ON articles (author_id);
CREATE INDEX idx_articles_published_at ON articles (published_at DESC NULLS LAST);
CREATE INDEX idx_articles_is_featured  ON articles (is_featured) WHERE is_featured = true;
CREATE INDEX idx_articles_slug         ON articles (slug);
CREATE INDEX idx_articles_search       ON articles USING gin (to_tsvector('english', coalesce(title, '') || ' ' || coalesce(excerpt, '')));

-- Comments
CREATE INDEX idx_comments_article   ON comments (article_id);
CREATE INDEX idx_comments_parent    ON comments (parent_id);
CREATE INDEX idx_comments_approved  ON comments (is_approved);

-- Article views
CREATE INDEX idx_article_views_article  ON article_views (article_id);
CREATE INDEX idx_article_views_date     ON article_views (viewed_at);

-- Activity log
CREATE INDEX idx_activity_log_user       ON activity_log (user_id);
CREATE INDEX idx_activity_log_created_at ON activity_log (created_at DESC);
CREATE INDEX idx_activity_log_entity     ON activity_log (entity_type, entity_id);

-- Prayer times
CREATE INDEX idx_prayer_times_emirate_date ON prayer_times (emirate, date);

-- Hero slides
CREATE INDEX idx_hero_slides_sort ON hero_slides (sort_order) WHERE is_active = true;

-- Advertiser creatives
CREATE INDEX idx_creatives_advertiser ON advertiser_creatives (advertiser_id);
CREATE INDEX idx_creatives_active     ON advertiser_creatives (is_active);

-- Media
CREATE INDEX idx_media_uploaded_by ON media (uploaded_by);


-- =============================================================
-- FUNCTIONS & TRIGGERS
-- =============================================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at         BEFORE UPDATE ON profiles            FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_articles_updated_at         BEFORE UPDATE ON articles            FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_comments_updated_at         BEFORE UPDATE ON comments            FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_advertisers_updated_at      BEFORE UPDATE ON advertisers         FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER trg_site_settings_updated_at    BEFORE UPDATE ON site_settings       FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- Keep publisher_profiles.post_count in sync
CREATE OR REPLACE FUNCTION sync_publisher_post_count()
RETURNS TRIGGER AS $$
BEGIN
  IF (TG_OP = 'INSERT' AND NEW.status = 'published') OR
     (TG_OP = 'UPDATE' AND NEW.status = 'published' AND OLD.status <> 'published') THEN
    UPDATE publisher_profiles SET post_count = post_count + 1 WHERE id = NEW.author_id;
  ELSIF (TG_OP = 'UPDATE' AND OLD.status = 'published' AND NEW.status <> 'published') THEN
    UPDATE publisher_profiles SET post_count = GREATEST(0, post_count - 1) WHERE id = OLD.author_id;
  ELSIF (TG_OP = 'DELETE' AND OLD.status = 'published') THEN
    UPDATE publisher_profiles SET post_count = GREATEST(0, post_count - 1) WHERE id = OLD.author_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_post_count
  AFTER INSERT OR UPDATE OR DELETE ON articles
  FOR EACH ROW EXECUTE FUNCTION sync_publisher_post_count();

-- Keep articles.comments_count in sync
CREATE OR REPLACE FUNCTION sync_comment_count()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.is_approved THEN
    UPDATE articles SET comments_count = comments_count + 1 WHERE id = NEW.article_id;
  ELSIF TG_OP = 'UPDATE' THEN
    IF NEW.is_approved AND NOT OLD.is_approved THEN
      UPDATE articles SET comments_count = comments_count + 1 WHERE id = NEW.article_id;
    ELSIF NOT NEW.is_approved AND OLD.is_approved THEN
      UPDATE articles SET comments_count = GREATEST(0, comments_count - 1) WHERE id = NEW.article_id;
    END IF;
  ELSIF TG_OP = 'DELETE' AND OLD.is_approved THEN
    UPDATE articles SET comments_count = GREATEST(0, comments_count - 1) WHERE id = OLD.article_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_sync_comment_count
  AFTER INSERT OR UPDATE OR DELETE ON comments
  FOR EACH ROW EXECUTE FUNCTION sync_comment_count();

-- Auto-create profile row when a new auth.users row is inserted
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'reader')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER trg_on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();


-- =============================================================
-- ROW LEVEL SECURITY
-- =============================================================

ALTER TABLE profiles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE publisher_profiles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE articles              ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_tags          ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_views         ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_analytics     ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments              ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertisers           ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertiser_formats    ENABLE ROW LEVEL SECURITY;
ALTER TABLE advertiser_creatives  ENABLE ROW LEVEL SECURITY;
ALTER TABLE hero_slides           ENABLE ROW LEVEL SECURITY;
ALTER TABLE ticker_items          ENABLE ROW LEVEL SECURITY;
ALTER TABLE prayer_times          ENABLE ROW LEVEL SECURITY;
ALTER TABLE experiences           ENABLE ROW LEVEL SECURITY;
ALTER TABLE events                ENABLE ROW LEVEL SECURITY;
ALTER TABLE media                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions   ENABLE ROW LEVEL SECURITY;
ALTER TABLE work_applications     ENABLE ROW LEVEL SECURITY;
ALTER TABLE ad_inquiries          ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints            ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_traffic         ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_log          ENABLE ROW LEVEL SECURITY;
ALTER TABLE site_settings         ENABLE ROW LEVEL SECURITY;
ALTER TABLE nav_categories        ENABLE ROW LEVEL SECURITY;
ALTER TABLE nav_sub_categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE article_sub_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags                  ENABLE ROW LEVEL SECURITY;

-- Helper: current user's role
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ── PROFILES ──────────────────────────────────────────────────
CREATE POLICY "profiles: public read"
  ON profiles FOR SELECT USING (true);

CREATE POLICY "profiles: own update"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "profiles: admin all"
  ON profiles FOR ALL
  USING (current_user_role() = 'admin');

-- ── PUBLISHER PROFILES ────────────────────────────────────────
CREATE POLICY "publisher_profiles: public read"
  ON publisher_profiles FOR SELECT USING (true);

CREATE POLICY "publisher_profiles: own update"
  ON publisher_profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "publisher_profiles: admin all"
  ON publisher_profiles FOR ALL
  USING (current_user_role() = 'admin');

-- ── ARTICLES ──────────────────────────────────────────────────
CREATE POLICY "articles: published readable by all"
  ON articles FOR SELECT
  USING (status = 'published');

CREATE POLICY "articles: publisher sees own"
  ON articles FOR SELECT
  USING (author_id = auth.uid());

CREATE POLICY "articles: publisher insert"
  ON articles FOR INSERT
  WITH CHECK (
    current_user_role() IN ('publisher', 'admin')
    AND author_id = auth.uid()
  );

CREATE POLICY "articles: publisher update own"
  ON articles FOR UPDATE
  USING (
    author_id = auth.uid()
    AND current_user_role() IN ('publisher', 'admin')
  );

CREATE POLICY "articles: admin all"
  ON articles FOR ALL
  USING (current_user_role() = 'admin');

-- ── ARTICLE TAGS ──────────────────────────────────────────────
CREATE POLICY "article_tags: public read"
  ON article_tags FOR SELECT USING (true);

CREATE POLICY "article_tags: publisher/admin write"
  ON article_tags FOR ALL
  USING (current_user_role() IN ('publisher', 'admin'));

-- ── TAGS ──────────────────────────────────────────────────────
CREATE POLICY "tags: public read"
  ON tags FOR SELECT USING (true);

CREATE POLICY "tags: admin write"
  ON tags FOR ALL
  USING (current_user_role() = 'admin');

-- ── ARTICLE VIEWS ─────────────────────────────────────────────
CREATE POLICY "article_views: anyone can insert"
  ON article_views FOR INSERT WITH CHECK (true);

CREATE POLICY "article_views: admin/publisher read"
  ON article_views FOR SELECT
  USING (current_user_role() IN ('admin', 'publisher'));

-- ── ARTICLE ANALYTICS ─────────────────────────────────────────
CREATE POLICY "article_analytics: admin/publisher read"
  ON article_analytics FOR SELECT
  USING (current_user_role() IN ('admin', 'publisher'));

CREATE POLICY "article_analytics: admin write"
  ON article_analytics FOR ALL
  USING (current_user_role() = 'admin');

-- ── COMMENTS ──────────────────────────────────────────────────
CREATE POLICY "comments: public read approved"
  ON comments FOR SELECT
  USING (is_approved = true);

CREATE POLICY "comments: anyone can insert"
  ON comments FOR INSERT WITH CHECK (true);

CREATE POLICY "comments: own delete"
  ON comments FOR DELETE
  USING (user_id = auth.uid());

CREATE POLICY "comments: admin all"
  ON comments FOR ALL
  USING (current_user_role() = 'admin');

-- ── ADVERTISERS ───────────────────────────────────────────────
CREATE POLICY "advertisers: admin all"
  ON advertisers FOR ALL
  USING (current_user_role() = 'admin');

-- ── ADVERTISER FORMATS & CREATIVES ───────────────────────────
CREATE POLICY "advertiser_formats: admin all"
  ON advertiser_formats FOR ALL
  USING (current_user_role() = 'admin');

CREATE POLICY "advertiser_creatives: public read active"
  ON advertiser_creatives FOR SELECT
  USING (is_active = true);

CREATE POLICY "advertiser_creatives: admin all"
  ON advertiser_creatives FOR ALL
  USING (current_user_role() = 'admin');

-- ── NAVIGATION & CATEGORIES ───────────────────────────────────
CREATE POLICY "nav_categories: public read"
  ON nav_categories FOR SELECT USING (true);

CREATE POLICY "nav_categories: admin write"
  ON nav_categories FOR ALL
  USING (current_user_role() = 'admin');

CREATE POLICY "nav_sub_categories: public read"
  ON nav_sub_categories FOR SELECT USING (true);

CREATE POLICY "nav_sub_categories: admin write"
  ON nav_sub_categories FOR ALL
  USING (current_user_role() = 'admin');

CREATE POLICY "article_categories: public read"
  ON article_categories FOR SELECT USING (true);

CREATE POLICY "article_categories: admin write"
  ON article_categories FOR ALL
  USING (current_user_role() = 'admin');

CREATE POLICY "article_sub_categories: public read"
  ON article_sub_categories FOR SELECT USING (true);

CREATE POLICY "article_sub_categories: admin write"
  ON article_sub_categories FOR ALL
  USING (current_user_role() = 'admin');

-- ── HERO, TICKER, PRAYER ──────────────────────────────────────
CREATE POLICY "hero_slides: public read active"
  ON hero_slides FOR SELECT USING (is_active = true);

CREATE POLICY "hero_slides: admin all"
  ON hero_slides FOR ALL
  USING (current_user_role() = 'admin');

CREATE POLICY "ticker_items: public read active"
  ON ticker_items FOR SELECT USING (is_active = true);

CREATE POLICY "ticker_items: admin all"
  ON ticker_items FOR ALL
  USING (current_user_role() = 'admin');

CREATE POLICY "prayer_times: public read"
  ON prayer_times FOR SELECT USING (true);

CREATE POLICY "prayer_times: admin write"
  ON prayer_times FOR ALL
  USING (current_user_role() = 'admin');

-- ── EXPERIENCES & EVENTS ──────────────────────────────────────
CREATE POLICY "experiences: public read active"
  ON experiences FOR SELECT USING (is_active = true);

CREATE POLICY "experiences: admin all"
  ON experiences FOR ALL
  USING (current_user_role() = 'admin');

CREATE POLICY "events: public read active"
  ON events FOR SELECT USING (is_active = true);

CREATE POLICY "events: admin all"
  ON events FOR ALL
  USING (current_user_role() = 'admin');

-- ── MEDIA ─────────────────────────────────────────────────────
CREATE POLICY "media: publisher/admin can see own"
  ON media FOR SELECT
  USING (
    current_user_role() = 'admin'
    OR uploaded_by = auth.uid()
  );

CREATE POLICY "media: publisher insert"
  ON media FOR INSERT
  WITH CHECK (current_user_role() IN ('publisher', 'admin'));

CREATE POLICY "media: admin all"
  ON media FOR ALL
  USING (current_user_role() = 'admin');

-- ── FORMS (contact, complaints, applications, newsletter) ─────
CREATE POLICY "newsletter_subscribers: anyone insert"
  ON newsletter_subscribers FOR INSERT WITH CHECK (true);

CREATE POLICY "newsletter_subscribers: admin all"
  ON newsletter_subscribers FOR ALL
  USING (current_user_role() = 'admin');

CREATE POLICY "contact_submissions: anyone insert"
  ON contact_submissions FOR INSERT WITH CHECK (true);

CREATE POLICY "contact_submissions: admin read"
  ON contact_submissions FOR SELECT
  USING (current_user_role() = 'admin');

CREATE POLICY "work_applications: anyone insert"
  ON work_applications FOR INSERT WITH CHECK (true);

CREATE POLICY "work_applications: admin all"
  ON work_applications FOR ALL
  USING (current_user_role() = 'admin');

CREATE POLICY "ad_inquiries: anyone insert"
  ON ad_inquiries FOR INSERT WITH CHECK (true);

CREATE POLICY "ad_inquiries: admin all"
  ON ad_inquiries FOR ALL
  USING (current_user_role() = 'admin');

CREATE POLICY "complaints: anyone insert"
  ON complaints FOR INSERT WITH CHECK (true);

CREATE POLICY "complaints: admin all"
  ON complaints FOR ALL
  USING (current_user_role() = 'admin');

-- ── ANALYTICS & LOGS ──────────────────────────────────────────
CREATE POLICY "daily_traffic: admin read"
  ON daily_traffic FOR SELECT
  USING (current_user_role() = 'admin');

CREATE POLICY "daily_traffic: admin write"
  ON daily_traffic FOR ALL
  USING (current_user_role() = 'admin');

CREATE POLICY "activity_log: admin read"
  ON activity_log FOR SELECT
  USING (current_user_role() = 'admin');

CREATE POLICY "activity_log: publisher own"
  ON activity_log FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "activity_log: system insert"
  ON activity_log FOR INSERT WITH CHECK (true);

-- ── SITE SETTINGS ─────────────────────────────────────────────
CREATE POLICY "site_settings: public read"
  ON site_settings FOR SELECT USING (true);

CREATE POLICY "site_settings: admin write"
  ON site_settings FOR ALL
  USING (current_user_role() = 'admin');


-- =============================================================
-- SEED DATA
-- =============================================================

-- ── Navigation Categories ────────────────────────────────────
INSERT INTO nav_categories (label, slug, grid_cols, sort_order) VALUES
  ('Dubai',           'dubai',            3, 1),
  ('Stay',            'stay',             3, 2),
  ('Eat & Drink',     'eat-drink',        3, 3),
  ('Experiences',     'experiences',      3, 4),
  ('Nightlife',       'nightlife',        3, 5),
  ('Other Emirates',  'other-emirates',   3, 6),
  ('Prayer Time',     'prayer-time',      3, 7);

-- Dubai sub-categories
INSERT INTO nav_sub_categories (nav_category_id, label, slug, specialty, image_url, sort_order)
SELECT nc.id, v.label, v.slug, v.specialty, v.image_url, v.sort_order
FROM nav_categories nc,
(VALUES
  ('Downtown Dubai', 'downtown-dubai', 'Burj Khalifa', 'https://images.unsplash.com/flagged/photo-1559717865-a99cac1c95d8?w=320&q=70&auto=format&fit=crop', 1),
  ('Dubai Marina',   'dubai-marina',   'Skyline Views', 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=320&q=70&auto=format&fit=crop', 2),
  ('Old Dubai',      'old-dubai',      'Al Fahidi Fort', 'https://images.unsplash.com/photo-1548625149-fc4a29cf7092?w=320&q=70&auto=format&fit=crop', 3)
) AS v(label, slug, specialty, image_url, sort_order)
WHERE nc.slug = 'dubai';

-- Other Emirates sub-categories
INSERT INTO nav_sub_categories (nav_category_id, label, slug, specialty, image_url, sort_order)
SELECT nc.id, v.label, v.slug, v.specialty, v.image_url, v.sort_order
FROM nav_categories nc,
(VALUES
  ('Abu Dhabi',      'abu-dhabi',      'Ferrari World',      'https://images.unsplash.com/photo-1578152882785-df9744e359e5?w=320&q=70&auto=format&fit=crop', 1),
  ('Sharjah',        'sharjah',        'Blue Souk',          'https://images.unsplash.com/photo-1643085439638-e8490dbaedae?w=320&q=70&auto=format&fit=crop', 2),
  ('Ras Al Khaimah', 'ras-al-khaimah', 'Jebel Jais',         'https://images.unsplash.com/photo-1701711995517-c992ace5fe93?w=320&q=70&auto=format&fit=crop', 3),
  ('Fujairah',       'fujairah',       'Al Bidyah Mosque',   'https://images.unsplash.com/photo-1679035929964-51d0f41d1614?w=320&q=70&auto=format&fit=crop', 4),
  ('Ajman',          'ajman',          'Ajman Fort',         'https://images.unsplash.com/photo-1557678493-c54624d611fc?w=320&q=70&auto=format&fit=crop', 5),
  ('Umm Al Quwain',  'umm-al-quwain',  'Dream Land',         'https://images.unsplash.com/photo-1664900314549-877760f81e78?w=320&q=70&auto=format&fit=crop', 6)
) AS v(label, slug, specialty, image_url, sort_order)
WHERE nc.slug = 'other-emirates';

-- Prayer Time sub-categories (one per emirate)
INSERT INTO nav_sub_categories (nav_category_id, label, slug, specialty, image_url, sort_order)
SELECT nc.id, v.label, v.slug, v.specialty, v.image_url, v.sort_order
FROM nav_categories nc,
(VALUES
  ('Dubai',          'dubai',          'Burj Khalifa',       'https://images.unsplash.com/flagged/photo-1559717865-a99cac1c95d8?w=320&q=70&auto=format&fit=crop', 1),
  ('Abu Dhabi',      'abu-dhabi',      'Sheikh Zayed Mosque','https://images.unsplash.com/photo-1578152882785-df9744e359e5?w=320&q=70&auto=format&fit=crop', 2),
  ('Sharjah',        'sharjah',        'Al Noor Mosque',     'https://images.unsplash.com/photo-1643085439638-e8490dbaedae?w=320&q=70&auto=format&fit=crop', 3),
  ('Ras Al Khaimah', 'ras-al-khaimah', 'Jebel Jais',         'https://images.unsplash.com/photo-1701711995517-c992ace5fe93?w=320&q=70&auto=format&fit=crop', 4),
  ('Fujairah',       'fujairah',       'Al Bidyah Mosque',   'https://images.unsplash.com/photo-1679035929964-51d0f41d1614?w=320&q=70&auto=format&fit=crop', 5),
  ('Ajman',          'ajman',          'Ajman Fort',         'https://images.unsplash.com/photo-1557678493-c54624d611fc?w=320&q=70&auto=format&fit=crop', 6)
) AS v(label, slug, specialty, image_url, sort_order)
WHERE nc.slug = 'prayer-time';

-- ── Article Categories ───────────────────────────────────────
INSERT INTO article_categories (slug, label, color, description, sort_order) VALUES
  ('travel',       'Travel',           '#e43d30', 'Guides, tips, and stories for the modern traveller.',                    1),
  ('stay',         'Stay',             '#C9A050', 'Hotels, resorts, and unique accommodation experiences in the UAE.',       2),
  ('eat-drink',    'Food & Dining',    '#2ecc71', 'Restaurants, cafes, street food, and culinary culture.',                 3),
  ('lifestyle',    'Lifestyle',        '#3498db', 'Fashion, wellness, and the Dubai way of life.',                          4),
  ('culture',      'Culture',          '#9b59b6', 'Art, heritage, festivals, and the soul of the Emirates.',                5),
  ('beaches',      'Beaches',          '#1abc9c', 'The best beaches, beach clubs, and waterfront spots.',                   6),
  ('shopping',     'Shopping',         '#e67e22', 'Malls, souks, luxury retail, and shopping guides.',                     7),
  ('nightlife',    'Nightlife',        '#c0392b', 'Clubs, bars, rooftop venues, and evening entertainment.',                8),
  ('wellness',     'Wellness',         '#27ae60', 'Spas, fitness, yoga, and holistic health in Dubai.',                    9),
  ('family',       'Family',           '#f39c12', 'Kid-friendly attractions, theme parks, and family experiences.',         10),
  ('experiences',  'Experiences',      '#16a085', 'Adventure, tours, desert safaris, and one-of-a-kind activities.',        11);

-- ── Tags ─────────────────────────────────────────────────────
INSERT INTO tags (name, slug) VALUES
  ('Desert Safari',    'desert-safari'),
  ('Luxury',           'luxury'),
  ('Budget Travel',    'budget-travel'),
  ('Family Friendly',  'family-friendly'),
  ('Halal Food',       'halal-food'),
  ('Hidden Gems',      'hidden-gems'),
  ('Weekend Getaway',  'weekend-getaway'),
  ('Rooftop',          'rooftop'),
  ('Beach',            'beach'),
  ('Shopping',         'shopping'),
  ('Architecture',     'architecture'),
  ('Nightlife',        'nightlife'),
  ('Culture',          'culture'),
  ('Adventure',        'adventure'),
  ('Wellness',         'wellness');

-- ── Breaking News Ticker ─────────────────────────────────────
INSERT INTO ticker_items (message, sort_order, is_active) VALUES
  ('Dubai International Airport records 90 million passengers in 2025',          1, true),
  ('New metro line extension to connect Dubai Marina to Palm Jumeirah by 2027',   2, true),
  ('Sheikh Mohammed launches Dubai 2040 Urban Master Plan phase 2',               3, true),
  ('Abu Dhabi opens world''s largest solar farm — Al Dhafra Solar PV Plant',      4, true),
  ('Dubai ranked world''s most visited city for third consecutive year',           5, true),
  ('Expo City Dubai announces permanent mixed-use development plan',               6, true),
  ('UAE Golden Visa extended to include social media influencers',                 7, true),
  ('Dubai Summer Surprises 2025 kicks off with record retail discounts',          8, true);

-- ── Site Settings ────────────────────────────────────────────
INSERT INTO site_settings (key, value, description) VALUES
  ('site_name',           '"Travel to Dubai"',                    'Site display name'),
  ('site_tagline',        '"Your Ultimate Guide to the Emirates"','Tagline shown in hero'),
  ('articles_per_page',   '12',                                   'Pagination limit'),
  ('comments_enabled',    'true',                                  'Toggle comments globally'),
  ('comment_moderation',  'true',                                  'Require approval before comments are public'),
  ('hero_autoplay_ms',    '5000',                                  'Hero carousel autoplay interval in ms'),
  ('contact_email',       '"hello@traveltodubai.com"',            'Public contact email'),
  ('social_instagram',    '"@traveltodubai"',                     'Instagram handle'),
  ('social_twitter',      '"@traveltodubai"',                     'Twitter/X handle'),
  ('prayer_api_source',   '"manual"',                             'Source for prayer times: manual | api');
