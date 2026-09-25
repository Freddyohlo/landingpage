/*
# Restrict portfolio_projects writes to the owner

## Problem
The initial migration granted the `anon` role full INSERT/UPDATE/DELETE on
`portfolio_projects`. This portfolio has no sign-in screen, so its anon key is
shipped inside the browser bundle: any visitor could add, alter or delete rows
in the public showcase.

## Change
- SELECT stays public: the showcase is meant to be readable by everyone.
- Every write policy for `anon` is dropped. With no policy granting writes, only
  the `service_role` key can mutate rows, because it bypasses RLS. That key is
  used from the Supabase dashboard or a trusted server script, never in the
  browser.

## Managing projects after this migration
Add or edit rows from the Supabase dashboard (Table Editor), or from a script
authenticated with the service_role key. If an admin login is added later,
re-grant writes to `authenticated` only.
*/

ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;

-- Anon keeps read-only access.
DROP POLICY IF EXISTS "Public can read portfolio projects" ON public.portfolio_projects;
CREATE POLICY "Public can read portfolio projects"
  ON public.portfolio_projects FOR SELECT
  TO anon, authenticated
  USING (true);

-- Remove the permissive write policies.
DROP POLICY IF EXISTS "Public can add portfolio projects" ON public.portfolio_projects;
DROP POLICY IF EXISTS "Public can update portfolio projects" ON public.portfolio_projects;
DROP POLICY IF EXISTS "Public can delete portfolio projects" ON public.portfolio_projects;
