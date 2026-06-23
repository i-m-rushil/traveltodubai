-- =============================================================
-- Add an optional area / location to each article (e.g. a Dubai
-- neighbourhood like "Business Bay", "Downtown Dubai").
--   NULL → not tied to a specific area
-- Used by the category page's "Filter by Area" sidebar.
-- =============================================================

ALTER TABLE articles ADD COLUMN IF NOT EXISTS area TEXT;

-- Reads filter "area = X"; index only the tagged rows.
CREATE INDEX IF NOT EXISTS idx_articles_area
  ON articles (area)
  WHERE area IS NOT NULL;
