insert into storage.buckets (id, name, public, file_size_limit)
values ('portal-slides', 'portal-slides', false, 524288000)
on conflict (id) do nothing;

create policy "Authenticated users can view portal slides"
on storage.objects
for select
to authenticated
using (bucket_id = 'portal-slides');

create policy "Admin can upload portal slides"
on storage.objects
for insert
to authenticated
with check (bucket_id = 'portal-slides' and public.has_role(auth.uid(), 'admin'));

create policy "Admin can update portal slides"
on storage.objects
for update
to authenticated
using (bucket_id = 'portal-slides' and public.has_role(auth.uid(), 'admin'));

create policy "Admin can delete portal slides"
on storage.objects
for delete
to authenticated
using (bucket_id = 'portal-slides' and public.has_role(auth.uid(), 'admin'));
