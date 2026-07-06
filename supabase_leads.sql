-- =============================================================
--  BridgeRoo — leads table + Row Level Security
--  Run this in: Supabase Dashboard → SQL Editor → New query → Run
-- =============================================================

-- 1) The table
create table if not exists public.leads (
  id          uuid primary key default gen_random_uuid(),
  created_at  timestamptz not null default now(),
  name        text,
  company     text,
  email       text not null,
  product     text,
  quantity    text,
  timeline    text,
  message     text
);

-- 2) Turn ON Row Level Security (locks the table by default)
alter table public.leads enable row level security;

-- 3) Allow the public/anon key to INSERT only.
--    There is deliberately NO select/update/delete policy,
--    so the anon key can write leads but can NEVER read them back.
drop policy if exists "anon can insert leads" on public.leads;
create policy "anon can insert leads"
  on public.leads
  for insert
  to anon
  with check (true);

-- (Optional) also allow logged-in users to insert, e.g. if you add auth later
drop policy if exists "authenticated can insert leads" on public.leads;
create policy "authenticated can insert leads"
  on public.leads
  for insert
  to authenticated
  with check (true);

-- 4) You (the project owner) can always read leads from the
--    Supabase Table Editor / SQL Editor, because the service role
--    and dashboard bypass RLS. No public read policy is needed.

-- Done. Your form can now insert; nobody can read via the anon key.
