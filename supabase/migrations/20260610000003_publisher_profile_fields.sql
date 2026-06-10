-- Fields shown on the dashboard Profile page that had no column yet
ALTER TABLE publisher_profiles ADD COLUMN IF NOT EXISTS display_name TEXT;
ALTER TABLE publisher_profiles ADD COLUMN IF NOT EXISTS phone TEXT;
ALTER TABLE publisher_profiles ADD COLUMN IF NOT EXISTS website TEXT;

-- Publishers/admins need to be able to create their own publisher_profiles row
-- (it is only auto-created for WordPress-imported authors)
DROP POLICY IF EXISTS "publisher_profiles: own insert" ON publisher_profiles;
CREATE POLICY "publisher_profiles: own insert"
  ON publisher_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);
