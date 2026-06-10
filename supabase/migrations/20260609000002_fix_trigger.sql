-- Fix handle_new_user trigger — add exception handler so auth user creation
-- never fails even if the profiles insert hits a constraint edge case.
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'reader'::user_role
  )
  ON CONFLICT (id) DO UPDATE SET
    name  = EXCLUDED.name,
    email = EXCLUDED.email;
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Never block auth user creation — profile can be backfilled later
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
