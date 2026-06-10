-- The publisher dashboard has a read-only advertiser directory,
-- so publishers need SELECT on advertisers + formats + creatives.
DROP POLICY IF EXISTS "advertisers: publisher read" ON advertisers;
CREATE POLICY "advertisers: publisher read"
  ON advertisers FOR SELECT
  USING (current_user_role() = 'publisher');

DROP POLICY IF EXISTS "advertiser_formats: publisher read" ON advertiser_formats;
CREATE POLICY "advertiser_formats: publisher read"
  ON advertiser_formats FOR SELECT
  USING (current_user_role() = 'publisher');

DROP POLICY IF EXISTS "advertiser_creatives: publisher read" ON advertiser_creatives;
CREATE POLICY "advertiser_creatives: publisher read"
  ON advertiser_creatives FOR SELECT
  USING (current_user_role() = 'publisher');
