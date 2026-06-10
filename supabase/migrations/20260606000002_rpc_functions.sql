-- ─────────────────────────────────────────────────────────────
-- RPC: increment article views counter atomically
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION increment_article_views(p_article_id UUID)
RETURNS void AS $$
  UPDATE articles SET views = views + 1 WHERE id = p_article_id;
$$ LANGUAGE sql SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────
-- RPC: search articles (full-text)
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION search_articles(p_query TEXT, p_limit INT DEFAULT 20)
RETURNS TABLE (
  id             UUID,
  title          TEXT,
  slug           TEXT,
  excerpt        TEXT,
  featured_image TEXT,
  published_at   TIMESTAMPTZ,
  rank           REAL
) AS $$
  SELECT
    a.id,
    a.title,
    a.slug,
    a.excerpt,
    a.featured_image,
    a.published_at,
    ts_rank(to_tsvector('english', coalesce(a.title,'') || ' ' || coalesce(a.excerpt,'')),
            plainto_tsquery('english', p_query)) AS rank
  FROM articles a
  WHERE
    a.status = 'published'
    AND to_tsvector('english', coalesce(a.title,'') || ' ' || coalesce(a.excerpt,''))
        @@ plainto_tsquery('english', p_query)
  ORDER BY rank DESC
  LIMIT p_limit;
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- ─────────────────────────────────────────────────────────────
-- RPC: dashboard stats for admin
-- ─────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION get_dashboard_stats()
RETURNS JSON AS $$
DECLARE
  result JSON;
BEGIN
  SELECT json_build_object(
    'total_articles',      (SELECT count(*) FROM articles WHERE status = 'published'),
    'draft_articles',      (SELECT count(*) FROM articles WHERE status = 'draft'),
    'pending_articles',    (SELECT count(*) FROM articles WHERE status = 'pending'),
    'total_publishers',    (SELECT count(*) FROM profiles WHERE role = 'publisher'),
    'total_advertisers',   (SELECT count(*) FROM advertisers WHERE status = 'active'),
    'total_subscribers',   (SELECT count(*) FROM newsletter_subscribers WHERE status = 'active'),
    'pending_comments',    (SELECT count(*) FROM comments WHERE is_approved = false),
    'new_contacts',        (SELECT count(*) FROM contact_submissions WHERE status = 'new'),
    'total_views_30d',     (SELECT coalesce(sum(total_views), 0) FROM daily_traffic WHERE date >= current_date - 30),
    'top_articles',        (
      SELECT json_agg(row_to_json(t))
      FROM (
        SELECT id, title, slug, views, comments_count
        FROM articles WHERE status = 'published'
        ORDER BY views DESC LIMIT 5
      ) t
    )
  ) INTO result;
  RETURN result;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
