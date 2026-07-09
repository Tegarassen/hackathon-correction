create type public.app_role as enum ('admin', 'mentor');
create type public.review_status as enum ('correct', 'partial', 'incorrect');

create table public.profiles (id uuid primary key references auth.users(id) on delete cascade, display_name text not null, role public.app_role not null default 'mentor', created_at timestamptz not null default now());
create table public.events (id bigint generated always as identity primary key, name text not null, active boolean not null default true);
create table public.groups (id bigint generated always as identity primary key, event_id bigint not null references public.events on delete cascade, name text not null);
create table public.participants (id bigint generated always as identity primary key, group_id bigint not null references public.groups on delete cascade, given_name text not null, surname text not null);
create table public.questions (id bigint generated always as identity primary key, event_id bigint not null references public.events on delete cascade, position integer not null, title text not null, prompt text not null default '', unique(event_id, position));
create table public.assignments (mentor_id uuid not null references public.profiles on delete cascade, group_id bigint not null references public.groups on delete cascade, primary key(mentor_id, group_id));

-- One correction per mentor, group and question.
create table public.group_corrections (
  id bigint generated always as identity primary key, group_id bigint not null references public.groups on delete cascade,
  question_id bigint not null references public.questions on delete cascade, mentor_name text not null,
  status public.review_status not null, correction text not null default '', group_remark text not null default '', updated_at timestamptz not null default now(),
  unique(group_id, question_id, mentor_name)
);
-- A separate personal remark for each participant.
create table public.individual_remarks (
  id bigint generated always as identity primary key, participant_id bigint not null references public.participants on delete cascade,
  question_id bigint not null references public.questions on delete cascade, mentor_name text not null,
  remark text not null, updated_at timestamptz not null default now(), unique(participant_id, question_id, mentor_name)
);
create table public.ai_reports (
  id bigint generated always as identity primary key, event_id bigint not null references public.events on delete cascade,
  group_id bigint references public.groups on delete cascade, participant_id bigint references public.participants on delete cascade,
  content text not null, generated_at timestamptz not null default now(), generated_by uuid references public.profiles
);

alter table public.profiles enable row level security; alter table public.events enable row level security; alter table public.groups enable row level security;
alter table public.participants enable row level security; alter table public.questions enable row level security; alter table public.assignments enable row level security;
alter table public.group_corrections enable row level security; alter table public.individual_remarks enable row level security; alter table public.ai_reports enable row level security;

create function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$ select exists(select 1 from profiles where id=auth.uid() and role='admin'); $$;
create policy "profiles read" on public.profiles for select to authenticated using (id=auth.uid() or public.is_admin());
create policy "admin profiles" on public.profiles for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public event read" on public.events for select to anon, authenticated using (true); create policy "public question read" on public.questions for select to anon, authenticated using (true);
create policy "public group read" on public.groups for select to anon, authenticated using (true);
create policy "public participant read" on public.participants for select to anon, authenticated using (true);
create policy "assignment read" on public.assignments for select to authenticated using (mentor_id=auth.uid() or public.is_admin());
create policy "admin setup" on public.events for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin groups" on public.groups for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin participants" on public.participants for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin questions" on public.questions for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin assignments" on public.assignments for all to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "public corrections read" on public.group_corrections for select to anon, authenticated using (true);
create policy "public corrections insert" on public.group_corrections for insert to anon, authenticated with check (mentor_name in ('Chevish','Mehreen','Pratish','Vinasha','Diraj','Ayush','Ijaaz','Kevan','Keshav','Tega','Ashutosh','Semarchy'));
create policy "public corrections update" on public.group_corrections for update to anon, authenticated using (true) with check (mentor_name in ('Chevish','Mehreen','Pratish','Vinasha','Diraj','Ayush','Ijaaz','Kevan','Keshav','Tega','Ashutosh','Semarchy'));
create policy "public remarks read" on public.individual_remarks for select to anon, authenticated using (true);
create policy "public remarks insert" on public.individual_remarks for insert to anon, authenticated with check (mentor_name in ('Chevish','Mehreen','Pratish','Vinasha','Diraj','Ayush','Ijaaz','Kevan','Keshav','Tega','Ashutosh','Semarchy'));
create policy "public remarks update" on public.individual_remarks for update to anon, authenticated using (true) with check (mentor_name in ('Chevish','Mehreen','Pratish','Vinasha','Diraj','Ayush','Ijaaz','Kevan','Keshav','Tega','Ashutosh','Semarchy'));
create policy "admin reports" on public.ai_reports for all to authenticated using (public.is_admin()) with check (public.is_admin());
