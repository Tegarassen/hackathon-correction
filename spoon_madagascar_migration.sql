-- Spoon Madagascar migration
-- Additive only: does not modify existing tables, is_admin(), or set_updated_at().
-- Run this file in the Supabase SQL Editor after supabase/schema.sql has already been applied.

create extension if not exists pgcrypto;

create table if not exists public.spoon_madagascar_juries (
  name text primary key,
  office text not null,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.spoon_madagascar_assignments (
  group_id integer primary key,
  group_name text not null,
  topic_key text not null check (topic_key in ('cyclone_ready_mada', 'food_wise_madagascar', 'water_power_watch_mada')),
  topic_title text not null,
  topic_subtitle text not null default '',
  topic_brief text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.spoon_madagascar_reviews (
  id uuid primary key default gen_random_uuid(),
  group_id integer not null,
  group_name text not null,
  jury_name text not null,
  scores jsonb not null default '{}'::jsonb,
  total_score numeric not null default 0,
  group_note text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (group_id, jury_name)
);

insert into public.spoon_madagascar_juries (name, office, active)
values
  ('Jhonny Raherison', 'Tana', true),
  ('Tojonirina Rarivoarison (Tojo)', 'Tana', true),
  ('Gianna Ramasombazaha', 'Tana', true),
  ('Joël Randrianarivelo', 'Tana', true),
  ('Kintana Andriambololona', 'Fina', true),
  ('Tovonirina Andrianarivelo (Tovo)', 'Fina', true),
  ('Ya''sin Figuelia', 'Diego', true),
  ('Hermeland Botrahaly', 'Diego', true)
on conflict (name) do update
set office = excluded.office,
    active = excluded.active;

drop trigger if exists spoon_madagascar_assignments_updated_at on public.spoon_madagascar_assignments;
create trigger spoon_madagascar_assignments_updated_at
before update on public.spoon_madagascar_assignments
for each row execute function public.set_updated_at();

drop trigger if exists spoon_madagascar_reviews_updated_at on public.spoon_madagascar_reviews;
create trigger spoon_madagascar_reviews_updated_at
before update on public.spoon_madagascar_reviews
for each row execute function public.set_updated_at();

alter table public.spoon_madagascar_juries enable row level security;
alter table public.spoon_madagascar_assignments enable row level security;
alter table public.spoon_madagascar_reviews enable row level security;

grant usage on schema public to anon, authenticated;
grant select on public.spoon_madagascar_juries to anon, authenticated;
grant insert, update, delete on public.spoon_madagascar_juries to authenticated;
grant select on public.spoon_madagascar_assignments to anon, authenticated;
grant insert, update, delete on public.spoon_madagascar_assignments to authenticated;
grant select, insert, update, delete on public.spoon_madagascar_reviews to anon, authenticated;

drop policy if exists "public read spoon madagascar juries" on public.spoon_madagascar_juries;
create policy "public read spoon madagascar juries"
on public.spoon_madagascar_juries for select
to anon, authenticated
using (active = true);

drop policy if exists "admin manage spoon madagascar juries" on public.spoon_madagascar_juries;
create policy "admin manage spoon madagascar juries"
on public.spoon_madagascar_juries for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public read spoon madagascar assignments" on public.spoon_madagascar_assignments;
create policy "public read spoon madagascar assignments"
on public.spoon_madagascar_assignments for select
to anon, authenticated
using (true);

drop policy if exists "admin manage spoon madagascar assignments" on public.spoon_madagascar_assignments;
create policy "admin manage spoon madagascar assignments"
on public.spoon_madagascar_assignments for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public read spoon madagascar reviews" on public.spoon_madagascar_reviews;
create policy "public read spoon madagascar reviews"
on public.spoon_madagascar_reviews for select
to anon, authenticated
using (true);

drop policy if exists "public insert spoon madagascar reviews" on public.spoon_madagascar_reviews;
create policy "public insert spoon madagascar reviews"
on public.spoon_madagascar_reviews for insert
to anon, authenticated
with check (
  exists (
    select 1
    from public.spoon_madagascar_juries
    where spoon_madagascar_juries.name = jury_name
      and spoon_madagascar_juries.active = true
  )
);

drop policy if exists "public update spoon madagascar reviews" on public.spoon_madagascar_reviews;
create policy "public update spoon madagascar reviews"
on public.spoon_madagascar_reviews for update
to anon, authenticated
using (true)
with check (
  exists (
    select 1
    from public.spoon_madagascar_juries
    where spoon_madagascar_juries.name = jury_name
      and spoon_madagascar_juries.active = true
  )
);

drop policy if exists "admin delete spoon madagascar reviews" on public.spoon_madagascar_reviews;
create policy "admin delete spoon madagascar reviews"
on public.spoon_madagascar_reviews for delete
to authenticated
using (public.is_admin());

-- Realtime: safe to re-run, mirrors the pattern already used in schema.sql.
do $$
begin
  alter publication supabase_realtime add table public.spoon_madagascar_juries;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.spoon_madagascar_assignments;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.spoon_madagascar_reviews;
exception when duplicate_object then null;
end $$;
