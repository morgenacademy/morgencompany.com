-- Keep-alive voor het gratis Supabase-plan.
--
-- Supabase pauzeert projecten op het gratis plan na zeven dagen zonder
-- activiteit. Zodra dat gebeurt valt het klantportaal om: elke RPC faalt en de
-- bezoeker ziet "Fout opgetreden. Probeer het later opnieuw."
--
-- Deze functie is het doelwit van een periodieke ping (zie
-- .github/workflows/supabase-keepalive.yml). Ze raakt bewust een echte tabel,
-- zodat de database ook echt werk doet en de ping als activiteit telt. Er komen
-- geen klantgegevens naar buiten: de functie draait als de aanroeper (security
-- invoker), dus RLS filtert alle rijen weg en de teller wordt enkel met nul
-- vergeleken.

create or replace function public.keepalive()
returns jsonb
language sql
security invoker
set search_path = public
as $$
  select jsonb_build_object(
    'ok', (select count(*) >= 0 from public.portal_companies),
    'at', now()
  );
$$;

comment on function public.keepalive() is
  'Lichte ping die het project actief houdt op het gratis Supabase-plan. Geeft geen klantgegevens terug.';

grant execute on function public.keepalive() to anon, authenticated;
