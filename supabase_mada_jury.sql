-- Mada Jury feature — new tables only.
-- This migration is additive: it does NOT touch group_corrections, individual_remarks,
-- mentors, ai_reports, change_history, admin_users, newbie_photos, or any of their
-- policies/triggers/storage buckets from the original schema.sql.
-- Run this file in the Supabase SQL Editor after the original schema.sql has been applied.
-- Requires: pgcrypto extension (already enabled by schema.sql) and public.set_updated_at()
-- (already defined by schema.sql — not redefined here).

create table if not exists public.jury_members (
  name text primary key,
  office text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.jury_group_topics (
  group_id integer primary key,
  topic_id integer not null check (topic_id > 0),
  jury_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.jury_scores (
  id uuid primary key default gen_random_uuid(),
  group_id integer not null,
  criterion_key text not null,
  criterion_label text not null default '',
  score numeric not null check (score >= 0),
  max_score numeric not null default 10,
  jury_name text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (group_id, criterion_key)
);

create table if not exists public.jury_remarks (
  id uuid primary key default gen_random_uuid(),
  group_id integer not null,
  jury_name text not null,
  remark text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (group_id, jury_name)
);

-- Seed the 8 jury members grouped by their home office.
-- (Home office is only a display default — any jury member can pick any of the 3
-- offices in the app and score every group in that office.)
insert into public.jury_members (name, office, active) values
  ('Jhonny Raherison', 'Tana', true),
  ('Tojonirina Rarivoarison (Tojo)', 'Tana', true),
  ('Gianna Ramasombazaha', 'Tana', true),
  ('Joël Randrianarivelo', 'Tana', true),
  ('Kintana Andriambololona', 'Fina', true),
  ('Tovonirina Andrianarivelo (Tovo)', 'Fina', true),
  ('Ya''sin Figuelia', 'Diego', true),
  ('Hermeland Botrahaly', 'Diego', true)
on conflict (name) do update set office = excluded.office, active = excluded.active;

-- updated_at triggers, reusing the existing public.set_updated_at() function.
drop trigger if exists set_updated_at on public.jury_group_topics;
create trigger set_updated_at
  before update on public.jury_group_topics
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.jury_scores;
create trigger set_updated_at
  before update on public.jury_scores
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.jury_remarks;
create trigger set_updated_at
  before update on public.jury_remarks
  for each row execute function public.set_updated_at();

-- Row Level Security: permissive public read/write, matching the spirit of the
-- existing group_corrections/individual_remarks policies. Jury members are not
-- Supabase-authenticated (they just pick their name in the UI), so there is no
-- admin-only gate — anon + authenticated can select/insert/update on all 4 tables.

alter table public.jury_members enable row level security;
alter table public.jury_group_topics enable row level security;
alter table public.jury_scores enable row level security;
alter table public.jury_remarks enable row level security;

drop policy if exists "jury_members_select" on public.jury_members;
create policy "jury_members_select" on public.jury_members for select using (true);
drop policy if exists "jury_members_insert" on public.jury_members;
create policy "jury_members_insert" on public.jury_members for insert with check (true);
drop policy if exists "jury_members_update" on public.jury_members;
create policy "jury_members_update" on public.jury_members for update using (true) with check (true);

drop policy if exists "jury_group_topics_select" on public.jury_group_topics;
create policy "jury_group_topics_select" on public.jury_group_topics for select using (true);
drop policy if exists "jury_group_topics_insert" on public.jury_group_topics;
create policy "jury_group_topics_insert" on public.jury_group_topics for insert with check (true);
drop policy if exists "jury_group_topics_update" on public.jury_group_topics;
create policy "jury_group_topics_update" on public.jury_group_topics for update using (true) with check (true);

drop policy if exists "jury_scores_select" on public.jury_scores;
create policy "jury_scores_select" on public.jury_scores for select using (true);
drop policy if exists "jury_scores_insert" on public.jury_scores;
create policy "jury_scores_insert" on public.jury_scores for insert with check (true);
drop policy if exists "jury_scores_update" on public.jury_scores;
create policy "jury_scores_update" on public.jury_scores for update using (true) with check (true);

drop policy if exists "jury_remarks_select" on public.jury_remarks;
create policy "jury_remarks_select" on public.jury_remarks for select using (true);
drop policy if exists "jury_remarks_insert" on public.jury_remarks;
create policy "jury_remarks_insert" on public.jury_remarks for insert with check (true);
drop policy if exists "jury_remarks_update" on public.jury_remarks;
create policy "jury_remarks_update" on public.jury_remarks for update using (true) with check (true);

-- Register the 3 realtime-relevant tables (jury_members rarely changes, but the
-- other 3 back the live jury UI) on the supabase_realtime publication, using the
-- same safe pattern as schema.sql so this migration can be re-run without erroring
-- if the tables are already published.
do $$
begin
  alter publication supabase_realtime add table public.jury_group_topics;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.jury_scores;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.jury_remarks;
exception when duplicate_object then null;
end $$;
