create table if not exists public.workshop_participants (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  email text not null,
  company text not null,
  workshop_title text not null,
  created_by uuid default auth.uid() references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint workshop_participants_name_check
    check (char_length(trim(name)) between 1 and 160),
  constraint workshop_participants_email_check
    check (
      char_length(trim(email)) between 3 and 255
      and position('@' in email) > 1
    ),
  constraint workshop_participants_company_check
    check (char_length(trim(company)) between 1 and 160),
  constraint workshop_participants_workshop_title_check
    check (char_length(trim(workshop_title)) between 1 and 200)
);

create index if not exists idx_workshop_participants_created_at
on public.workshop_participants(created_at desc);

create index if not exists idx_workshop_participants_email
on public.workshop_participants(lower(email));

create index if not exists idx_workshop_participants_company
on public.workshop_participants(company);

alter table public.workshop_participants enable row level security;

drop policy if exists "Admins can manage workshop participants" on public.workshop_participants;
create policy "Admins can manage workshop participants"
on public.workshop_participants
for all
to authenticated
using (public.has_role(auth.uid(), 'admin'))
with check (public.has_role(auth.uid(), 'admin'));

create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_workshop_participants_updated_at on public.workshop_participants;
create trigger set_workshop_participants_updated_at
before update on public.workshop_participants
for each row
execute function public.set_updated_at();
