-- Spoon Hackathon Review Hub
-- Run this file in Supabase SQL Editor before using the GitHub Pages app.
-- Mentors use a public link, so their selected mentor name is used for attribution.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'review_status') then
    create type public.review_status as enum ('correct', 'partial', 'incorrect');
  end if;
end $$;

create table if not exists public.group_corrections (
  id uuid primary key default gen_random_uuid(),
  group_id integer not null,
  group_name text not null,
  question_position integer not null check (question_position > 0),
  mentor_name text not null,
  status public.review_status not null,
  correction text not null default '',
  group_remark text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (group_id, question_position, mentor_name)
);

create table if not exists public.individual_remarks (
  id uuid primary key default gen_random_uuid(),
  group_id integer not null,
  group_name text not null,
  participant_name text not null,
  question_position integer not null check (question_position > 0),
  mentor_name text not null,
  remark text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (group_id, participant_name, question_position, mentor_name)
);

create table if not exists public.ai_reports (
  id uuid primary key default gen_random_uuid(),
  report_key text not null unique,
  report_type text not null check (report_type in ('group', 'person')),
  group_id integer,
  group_name text,
  participant_name text,
  content text not null,
  generated_at timestamptz not null default now()
);

create table if not exists public.change_history (
  id bigint generated always as identity primary key,
  table_name text not null,
  record_id uuid,
  group_id integer,
  group_name text,
  question_position integer,
  participant_name text,
  mentor_name text,
  action text not null,
  old_data jsonb,
  new_data jsonb,
  changed_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists group_corrections_updated_at on public.group_corrections;
create trigger group_corrections_updated_at
before update on public.group_corrections
for each row execute function public.set_updated_at();

drop trigger if exists individual_remarks_updated_at on public.individual_remarks;
create trigger individual_remarks_updated_at
before update on public.individual_remarks
for each row execute function public.set_updated_at();

create or replace function public.log_group_correction_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.change_history (
    table_name,
    record_id,
    group_id,
    group_name,
    question_position,
    mentor_name,
    action,
    old_data,
    new_data
  )
  values (
    'group_corrections',
    coalesce(new.id, old.id),
    coalesce(new.group_id, old.group_id),
    coalesce(new.group_name, old.group_name),
    coalesce(new.question_position, old.question_position),
    coalesce(new.mentor_name, old.mentor_name),
    tg_op,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end
  );

  return coalesce(new, old);
end;
$$;

drop trigger if exists group_corrections_history on public.group_corrections;
create trigger group_corrections_history
after insert or update or delete on public.group_corrections
for each row execute function public.log_group_correction_change();

create or replace function public.log_individual_remark_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.change_history (
    table_name,
    record_id,
    group_id,
    group_name,
    question_position,
    participant_name,
    mentor_name,
    action,
    old_data,
    new_data
  )
  values (
    'individual_remarks',
    coalesce(new.id, old.id),
    coalesce(new.group_id, old.group_id),
    coalesce(new.group_name, old.group_name),
    coalesce(new.question_position, old.question_position),
    coalesce(new.participant_name, old.participant_name),
    coalesce(new.mentor_name, old.mentor_name),
    tg_op,
    case when tg_op in ('UPDATE', 'DELETE') then to_jsonb(old) else null end,
    case when tg_op in ('INSERT', 'UPDATE') then to_jsonb(new) else null end
  );

  return coalesce(new, old);
end;
$$;

drop trigger if exists individual_remarks_history on public.individual_remarks;
create trigger individual_remarks_history
after insert or update or delete on public.individual_remarks
for each row execute function public.log_individual_remark_change();

alter table public.group_corrections enable row level security;
alter table public.individual_remarks enable row level security;
alter table public.ai_reports enable row level security;
alter table public.change_history enable row level security;

drop policy if exists "public read group corrections" on public.group_corrections;
create policy "public read group corrections"
on public.group_corrections for select
to anon, authenticated
using (true);

drop policy if exists "public insert group corrections" on public.group_corrections;
create policy "public insert group corrections"
on public.group_corrections for insert
to anon, authenticated
with check (mentor_name in ('Chevish','Mehreen','Pratish','Vinasha','Diraj','Ayush','Ijaaz','Kevan','Keshav','Tega','Ashutosh','Semarchy'));

drop policy if exists "public update group corrections" on public.group_corrections;
create policy "public update group corrections"
on public.group_corrections for update
to anon, authenticated
using (true)
with check (mentor_name in ('Chevish','Mehreen','Pratish','Vinasha','Diraj','Ayush','Ijaaz','Kevan','Keshav','Tega','Ashutosh','Semarchy'));

drop policy if exists "public delete group corrections" on public.group_corrections;
create policy "public delete group corrections"
on public.group_corrections for delete
to anon, authenticated
using (true);

drop policy if exists "public read individual remarks" on public.individual_remarks;
create policy "public read individual remarks"
on public.individual_remarks for select
to anon, authenticated
using (true);

drop policy if exists "public insert individual remarks" on public.individual_remarks;
create policy "public insert individual remarks"
on public.individual_remarks for insert
to anon, authenticated
with check (mentor_name in ('Chevish','Mehreen','Pratish','Vinasha','Diraj','Ayush','Ijaaz','Kevan','Keshav','Tega','Ashutosh','Semarchy'));

drop policy if exists "public update individual remarks" on public.individual_remarks;
create policy "public update individual remarks"
on public.individual_remarks for update
to anon, authenticated
using (true)
with check (mentor_name in ('Chevish','Mehreen','Pratish','Vinasha','Diraj','Ayush','Ijaaz','Kevan','Keshav','Tega','Ashutosh','Semarchy'));

drop policy if exists "public delete individual remarks" on public.individual_remarks;
create policy "public delete individual remarks"
on public.individual_remarks for delete
to anon, authenticated
using (true);

drop policy if exists "public read ai reports" on public.ai_reports;
create policy "public read ai reports"
on public.ai_reports for select
to anon, authenticated
using (true);

drop policy if exists "public upsert ai reports" on public.ai_reports;
create policy "public upsert ai reports"
on public.ai_reports for all
to anon, authenticated
using (true)
with check (true);

drop policy if exists "public read change history" on public.change_history;
create policy "public read change history"
on public.change_history for select
to anon, authenticated
using (true);

-- Realtime: if this table is already in the publication, Supabase may raise a
-- duplicate_object error. These blocks keep the schema safe to re-run.
do $$
begin
  alter publication supabase_realtime add table public.group_corrections;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.individual_remarks;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.ai_reports;
exception when duplicate_object then null;
end $$;
