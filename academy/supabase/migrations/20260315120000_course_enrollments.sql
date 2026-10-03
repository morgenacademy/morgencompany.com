-- Course enrollments: tracks which users have access to which courses
create table if not exists public.course_enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  course_id text not null,
  enrolled_at timestamptz not null default now(),
  payment_id uuid references public.payments(id),
  constraint course_enrollments_unique unique (user_id, course_id)
);

-- Enable RLS
alter table public.course_enrollments enable row level security;

-- Users can read their own enrollments
create policy "Users can view own enrollments"
  on public.course_enrollments for select
  using (auth.uid() = user_id);

-- Only service role can insert/update (via webhook)
create policy "Service role can manage enrollments"
  on public.course_enrollments for all
  using (auth.jwt() ->> 'role' = 'service_role');
