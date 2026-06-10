-- Fix PostgREST access: grant schema + table permissions to all Supabase roles
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;
GRANT ALL   ON ALL TABLES    IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL   ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role;
GRANT ALL   ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role;

-- Ensure future tables get the same grants automatically
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON TABLES    TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;

-- Reload PostgREST schema cache
NOTIFY pgrst, 'reload schema';
