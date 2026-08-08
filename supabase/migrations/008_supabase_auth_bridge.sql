-- Bridges native Supabase Auth (auth.users) to public.users.
-- Runs in parallel with the Clerk webhook during the phased auth migration:
-- both write-paths are idempotent (ON CONFLICT DO NOTHING), so neither clobbers the other.
-- Clerk users keep their TEXT Clerk ID as `id`; native Supabase users get their auth.users UUID as `id`.

CREATE OR REPLACE FUNCTION handle_new_supabase_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
BEGIN
  INSERT INTO public.users (id, username, email)
  VALUES (
    NEW.id::text,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.raw_user_meta_data ->> 'name', split_part(NEW.email, '@', 1)),
    NEW.email
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_supabase_user();

REVOKE ALL ON FUNCTION handle_new_supabase_user() FROM PUBLIC, anon, authenticated;
