-- =============================================================
-- Add an optional emirate to each article.
--   NULL  → Dubai / main site (default)
--   set   → also surfaces on that emirate's page, under its category
-- The `emirate` ENUM already exists (see initial schema).
-- =============================================================

ALTER TABLE articles ADD COLUMN IF NOT EXISTS emirate emirate;

-- Most reads filter "emirate = X"; index only the tagged rows.
CREATE INDEX IF NOT EXISTS idx_articles_emirate
  ON articles (emirate)
  WHERE emirate IS NOT NULL;
