create extension if not exists pgcrypto;

create table if not exists public.portal_companies (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  password_hash text not null,
  logo_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.portal_trainings (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.portal_companies(id) on delete cascade,
  title text not null,
  description text,
  training_date date,
  training_dates date[],
  slide_storage_path text,
  slide_filename text,
  resources jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.portal_feedback (
  id uuid primary key default gen_random_uuid(),
  training_id uuid not null references public.portal_trainings(id) on delete cascade,
  company_id uuid not null references public.portal_companies(id) on delete cascade,
  respondent_name text,
  respondent_function text,
  rating_overall integer not null,
  rating_relevance integer,
  takeaways text[],
  rating_applicability integer,
  rating_tempo text,
  feedback_liked text,
  feedback_improve text,
  feedback_other text,
  created_at timestamptz not null default now()
);

create index if not exists idx_portal_trainings_company_id
on public.portal_trainings(company_id);

create index if not exists idx_portal_feedback_training_id
on public.portal_feedback(training_id);

create index if not exists idx_portal_feedback_company_id
on public.portal_feedback(company_id);

alter table public.portal_companies enable row level security;
alter table public.portal_trainings enable row level security;
alter table public.portal_feedback enable row level security;

drop policy if exists "Admins can manage portal companies" on public.portal_companies;
create policy "Admins can manage portal companies"
on public.portal_companies
for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins can manage portal trainings" on public.portal_trainings;
create policy "Admins can manage portal trainings"
on public.portal_trainings
for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins can view portal feedback" on public.portal_feedback;
create policy "Admins can view portal feedback"
on public.portal_feedback
for select
to authenticated
using (public.has_role(auth.uid(), 'admin'));

drop policy if exists "Admins can delete portal feedback" on public.portal_feedback;
create policy "Admins can delete portal feedback"
on public.portal_feedback
for delete
to authenticated
using (public.has_role(auth.uid(), 'admin'));

create or replace function public.portal_set_password(
  _company_id uuid,
  _password text
)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not public.has_role(auth.uid(), 'admin') then
    raise exception 'Not authorized';
  end if;

  if trim(coalesce(_password, '')) = '' then
    raise exception 'Password is verplicht';
  end if;

  update public.portal_companies
  set password_hash = crypt(_password, gen_salt('bf'))
  where id = _company_id;

  if not found then
    raise exception 'Company not found';
  end if;
end;
$$;

create or replace function public.portal_verify_password(
  _slug text,
  _password text
)
returns table (
  success boolean,
  company_id uuid,
  company_name text,
  logo_url text
)
language plpgsql
security definer
set search_path = public
as $$
declare
  company_row public.portal_companies%rowtype;
begin
  select *
  into company_row
  from public.portal_companies
  where slug = trim(_slug)
    and is_active = true
  limit 1;

  if company_row.id is null then
    return query select false, null::uuid, null::text, null::text;
    return;
  end if;

  if company_row.password_hash = '' or not (company_row.password_hash = crypt(_password, company_row.password_hash)) then
    return query select false, null::uuid, null::text, null::text;
    return;
  end if;

  return query
  select true, company_row.id, company_row.name, company_row.logo_url;
end;
$$;

create or replace function public.portal_get_trainings(
  _company_id uuid
)
returns setof public.portal_trainings
language sql
security definer
set search_path = public
as $$
  select *
  from public.portal_trainings
  where company_id = _company_id
    and is_active = true
  order by coalesce(training_date, created_at::date) desc, created_at desc
$$;

create or replace function public.portal_submit_feedback(
  _training_id uuid,
  _company_id uuid,
  _rating_overall integer,
  _respondent_name text default null,
  _respondent_function text default null,
  _rating_relevance integer default null,
  _takeaways text[] default null,
  _rating_applicability integer default null,
  _rating_tempo text default null,
  _feedback_liked text default null,
  _feedback_improve text default null,
  _feedback_other text default null
)
returns table (
  success boolean,
  feedback_id uuid
)
language plpgsql
security definer
set search_path = public
as $$
declare
  inserted_id uuid;
begin
  if not exists (
    select 1
    from public.portal_trainings
    where id = _training_id
      and company_id = _company_id
      and is_active = true
  ) then
    raise exception 'Training not found';
  end if;

  insert into public.portal_feedback (
    training_id,
    company_id,
    respondent_name,
    respondent_function,
    rating_overall,
    rating_relevance,
    takeaways,
    rating_applicability,
    rating_tempo,
    feedback_liked,
    feedback_improve,
    feedback_other
  )
  values (
    _training_id,
    _company_id,
    nullif(trim(coalesce(_respondent_name, '')), ''),
    nullif(trim(coalesce(_respondent_function, '')), ''),
    _rating_overall,
    _rating_relevance,
    _takeaways,
    _rating_applicability,
    nullif(trim(coalesce(_rating_tempo, '')), ''),
    nullif(trim(coalesce(_feedback_liked, '')), ''),
    nullif(trim(coalesce(_feedback_improve, '')), ''),
    nullif(trim(coalesce(_feedback_other, '')), '')
  )
  returning id into inserted_id;

  return query select true, inserted_id;
end;
$$;

grant execute on function public.portal_set_password(uuid, text) to authenticated;
grant execute on function public.portal_verify_password(text, text) to anon, authenticated;
grant execute on function public.portal_get_trainings(uuid) to anon, authenticated;
grant execute on function public.portal_submit_feedback(uuid, uuid, integer, text, text, integer, text[], integer, text, text, text, text) to anon, authenticated;
