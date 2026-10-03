create or replace function public.admin_grant_course_access(
  _email text,
  _course_id text
)
returns table (
  user_id uuid,
  user_email text,
  course_id text,
  created boolean
)
language plpgsql
security definer
set search_path = public
as $$
#variable_conflict use_column
declare
  target_user_id uuid;
  normalized_email text;
  inserted_count integer;
begin
  if auth.uid() is null or not public.has_role(auth.uid(), 'admin') then
    raise exception 'Not authorized';
  end if;

  normalized_email := lower(trim(_email));

  if normalized_email = '' then
    raise exception 'Email is verplicht';
  end if;

  if trim(_course_id) = '' then
    raise exception 'Cursus is verplicht';
  end if;

  select id
  into target_user_id
  from auth.users
  where lower(email) = normalized_email
  limit 1;

  if target_user_id is null then
    raise exception 'Geen gebruiker gevonden met dit e-mailadres';
  end if;

  insert into public.course_enrollments (user_id, course_id)
  values (target_user_id, trim(_course_id))
  on conflict (user_id, course_id) do nothing;

  get diagnostics inserted_count = row_count;

  return query
  select
    target_user_id,
    normalized_email,
    trim(_course_id),
    inserted_count > 0;
end;
$$;

grant execute on function public.admin_grant_course_access(text, text) to authenticated;
