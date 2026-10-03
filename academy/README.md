# Morgen Academy (academy/)

De online leeromgeving van Morgen: cursussen, checkout (Mollie) en klantportalen. Live op academy.morgencompany.com; links naar morgenacademy.nl blijven werken.

Gebouwd met Vite, TypeScript, React, shadcn-ui, Tailwind CSS en Supabase.

## Lokaal werken

```sh
git clone git@github.com:morgenacademy/morgencompany.com.git
cd morgencompany.com/academy
npm ci
npm run dev        # http://localhost:8080
npm test           # vitest
```

Zet de Supabase-waarden in `academy/.env` (`VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`). De echte waarden staan in de Netlify-omgeving van project `morgenacademy`. Supabase-commando's draai je vanuit deze map.

## Deploy

Netlify-project `morgenacademy` bouwt automatisch bij een merge naar `main`, maar alleen als er iets in `academy/` is veranderd. `npm run build` draait daarna `scripts/prerender.mjs` voor de publieke pagina's.

Meer afspraken (werkwijze, aanbod-sync met de website, keep-alive): zie `CLAUDE.md` in de root van de repo.
