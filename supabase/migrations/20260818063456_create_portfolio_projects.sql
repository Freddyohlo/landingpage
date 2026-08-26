/*
# Create portfolio projects table

1. New Tables
- `portfolio_projects` stores public programming projects shown on Freddy's portfolio.
- `id` is the generated identifier.
- `title` stores the project name.
- `description` stores the project summary.
- `tech_stack` stores technologies as a text array.
- `project_url` stores an optional public link.
- `featured` controls the featured badge.
- `created_at` stores creation time.

2. Security
- Row Level Security is enabled.
- This portfolio has no sign-in screen and is intentionally single-tenant/public, so anon and authenticated visitors can read and manage the project showcase.

3. Important notes
- The app can display the built-in showcase projects even if the database has no rows yet.
- New projects added from the page are saved for future visits.
*/

CREATE TABLE IF NOT EXISTS public.portfolio_projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  tech_stack text[] NOT NULL DEFAULT '{}',
  project_url text,
  featured boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.portfolio_projects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read portfolio projects" ON public.portfolio_projects;
CREATE POLICY "Public can read portfolio projects"
  ON public.portfolio_projects FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS "Public can add portfolio projects" ON public.portfolio_projects;
CREATE POLICY "Public can add portfolio projects"
  ON public.portfolio_projects FOR INSERT
  TO anon, authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update portfolio projects" ON public.portfolio_projects;
CREATE POLICY "Public can update portfolio projects"
  ON public.portfolio_projects FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "Public can delete portfolio projects" ON public.portfolio_projects;
CREATE POLICY "Public can delete portfolio projects"
  ON public.portfolio_projects FOR DELETE
  TO anon, authenticated
  USING (true);

CREATE INDEX IF NOT EXISTS portfolio_projects_created_at_idx
  ON public.portfolio_projects (created_at DESC);