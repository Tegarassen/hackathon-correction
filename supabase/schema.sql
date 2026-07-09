-- Spoon Hackathon Review Hub
-- Run this file in Supabase SQL Editor before using the GitHub Pages app.
-- Spoon mentors use the internal mentor form link, so their selected mentor name is used for attribution.

create extension if not exists pgcrypto;

do $$
begin
  if not exists (select 1 from pg_type where typname = 'review_status') then
    create type public.review_status as enum ('correct', 'partial', 'incorrect');
  end if;
  if not exists (select 1 from pg_type where typname = 'correction_work_state') then
    create type public.correction_work_state as enum ('in_progress', 'completed');
  end if;
end $$;

create table if not exists public.group_corrections (
  id uuid primary key default gen_random_uuid(),
  group_id integer not null,
  group_name text not null,
  question_position integer not null check (question_position > 0),
  mentor_name text not null,
  work_state public.correction_work_state not null default 'in_progress',
  status public.review_status,
  correction text not null default '',
  group_remark text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (group_id, question_position)
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
  unique (group_id, participant_name, question_position)
);

create table if not exists public.ai_reports (
  id uuid primary key default gen_random_uuid(),
  report_key text not null unique,
  report_type text not null check (report_type in ('group', 'question', 'person')),
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

-- Migration helpers for projects that previously used one correction per mentor.
alter table public.group_corrections
  add column if not exists work_state public.correction_work_state not null default 'in_progress';

alter table public.group_corrections
  alter column status drop not null;

do $$
begin
  delete from public.group_corrections
  where ctid in (
    select ctid
    from (
      select ctid, row_number() over (
        partition by group_id, question_position
        order by updated_at desc, created_at desc
      ) as rn
      from public.group_corrections
    ) ranked
    where rn > 1
  );

  alter table public.group_corrections
    drop constraint if exists group_corrections_group_id_question_position_mentor_name_key;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'group_corrections_group_id_question_position_key'
      and conrelid = 'public.group_corrections'::regclass
  ) then
    alter table public.group_corrections
      add constraint group_corrections_group_id_question_position_key unique (group_id, question_position);
  end if;
exception when duplicate_object or duplicate_table then null;
end $$;

do $$
begin
  delete from public.individual_remarks
  where ctid in (
    select ctid
    from (
      select ctid, row_number() over (
        partition by group_id, participant_name, question_position
        order by updated_at desc, created_at desc
      ) as rn
      from public.individual_remarks
    ) ranked
    where rn > 1
  );

  alter table public.individual_remarks
    drop constraint if exists individual_remarks_group_id_participant_name_question_position_mentor_name_key;

  if not exists (
    select 1
    from pg_constraint
    where conname = 'individual_remarks_group_id_participant_name_question_position_key'
      and conrelid = 'public.individual_remarks'::regclass
  ) then
    alter table public.individual_remarks
      add constraint individual_remarks_group_id_participant_name_question_position_key unique (group_id, participant_name, question_position);
  end if;
exception when duplicate_object or duplicate_table then null;
end $$;

alter table public.ai_reports
  drop constraint if exists ai_reports_report_type_check;

alter table public.ai_reports
  add constraint ai_reports_report_type_check
  check (report_type in ('group', 'question', 'person'));

create table if not exists public.admin_users (
  user_id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  created_at timestamptz not null default now()
);

insert into public.admin_users (user_id, email)
select id, email
from auth.users
where lower(email) = 'tega@spoon.hackathon'
on conflict (user_id) do update
set email = excluded.email;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where user_id = auth.uid()
  );
$$;

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
alter table public.admin_users enable row level security;

grant usage on schema public to anon, authenticated;
grant select, insert, update, delete on public.group_corrections to anon, authenticated;
grant select, insert, update, delete on public.individual_remarks to anon, authenticated;
grant select, insert, update, delete on public.ai_reports to authenticated;
grant select on public.change_history to authenticated;
grant select on public.admin_users to authenticated;

drop policy if exists "admins can read admin users" on public.admin_users;
create policy "admins can read admin users"
on public.admin_users for select
to authenticated
using (public.is_admin());

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
drop policy if exists "admin delete group corrections" on public.group_corrections;
create policy "admin delete group corrections"
on public.group_corrections for delete
to authenticated
using (public.is_admin());

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
drop policy if exists "admin read ai reports" on public.ai_reports;
create policy "admin read ai reports"
on public.ai_reports for select
to authenticated
using (public.is_admin());

drop policy if exists "public upsert ai reports" on public.ai_reports;
drop policy if exists "admin upsert ai reports" on public.ai_reports;
create policy "admin upsert ai reports"
on public.ai_reports for all
to authenticated
using (public.is_admin())
with check (public.is_admin());

drop policy if exists "public read change history" on public.change_history;
drop policy if exists "admin read change history" on public.change_history;
create policy "admin read change history"
on public.change_history for select
to authenticated
using (public.is_admin());

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
