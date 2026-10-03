# CLAUDE.md

Monorepo van **Morgen**: twee apps, twee Netlify-projecten, één repo. Alle content is Nederlands.

| Map | Wat | Netlify-project (base dir) | Domein |
|---|---|---|---|
| `company/` | Statische marketingsite (Academy, Consultancy, Technology), geen build | `websitemorgencompany` (`company`) | morgencompany.com |
| `academy/` | React + Vite + Supabase: online cursussen, checkout (Mollie), klantportalen | `morgenacademy` (`academy`) | academy.morgencompany.com, plus morgenacademy.nl via de proxy onderaan `company/_redirects` |
| `docs/` | Specs, plannen, schrijfstijl. Niet publiek. | | |
| `scripts/smoke-live.sh` | Rookproef op de live sites | | |

Netlify bouwt een project alleen als er iets in zijn eigen map verandert. Deploy via GitHub (`main`).

# company/

## Kritieke architectuur: 7 bundle-bestanden

De site bestaat uit 7 onafhankelijke HTML-bestanden die **elk een volledige kopie van álle SPA-pagina's bevatten** (`<div class="page" id="page-...">` secties + gedeelde JS-bootstrap):

```
company/index.html            → home actief
company/academy/index.html    → academy (TRAIN) actief
company/technology/index.html company/consultancy/index.html company/about/index.html
company/projecten/index.html  company/inspiratie/index.html
```

**Elke inhoudelijke wijziging moet in alle 7 bestanden.** Client-side routing (`nav(page, anchor)`) wisselt alleen `.active` — er is geen page-load bij intern navigeren, dus een verouderde kopie blijft gewoon zichtbaar voor bezoekers die via een andere pagina binnenkomen. Dit is de grootste bron van bugs in deze repo.

Sync-aanpak die werkt: wijzig eerst het bestand waar de sectie "thuis" hoort (bijv. academy-content in `company/academy/index.html`), extraheer het blok en vervang het byte-identiek in de andere 6 (Python-script met regelgrenzen of marker-strings). Verifieer daarna:

```bash
# per bestand: div-balans, 8 pages, functie-consistentie
grep -c '<div class="page"' company/*.html company/*/index.html   # overal 8
diff <(blok uit A) <(blok uit B)                                  # byte-identiek
```

Let op: ook **JS-data en functies** driften (bijv. `const trainingData={...}`, `openTrainingPopup`, popup-markup `#tp-next`). Bij sync van een sectie met `onclick="openTrainingPopup('key')"`: check dat die key in `trainingData` van elk bestand bestaat.

Bewust verschillend per bestand (níet gelijktrekken): `<title>`, meta description, canonical URL, welke page default actief is, form `action` URL's, en pagina-specifieke IIFE's (`paint` in `company/index.html`, filter-`apply` in projecten).

**Ook per bestand verschillend: welke hero de `<h1>` is.** Elke bundel heeft precies één `<h1>`: de hero van de pagina die in dát bestand `class="page active"` heeft. Alle andere hero's zijn `<h2 class="h1">` (zelfde styling, andere semantiek). Zet dus bij een sync nooit de `active`-class of de `<h1>` van het ene bestand over het andere heen: dan tonen alle URL's zonder JS de homepage en wordt de H1 overal "GoedeMORGEN.". Controle:

```bash
# per bundel: 1 h1, en de actieve page hoort bij het bestand
grep -c '<h1' company/index.html company/*/index.html                    # overal 1
grep -o 'page active" id="page-[a-z-]*"' company/*/index.html    # academy->page-academy, projecten->page-assistenten, inspiratie->page-company
```

## Het Kompas (AI-chat adviseur)

- Widget: `company/docs/academy-chat/chat.js` + `chat.css`, mount op `#trainingwijzer-app` of `[data-kompas]` (multi-instance). Staat op homepage én academy-pagina.
- Backend: `company/netlify/functions/chat.mjs` (SSE-streaming, Claude Sonnet 5) met `lib/kb.mjs` (kennisbank), `lib/tool.mjs` (strict tool `presenteer_advies`), `lib/guards.mjs`, `lib/sse.mjs`, `lib/ratelimit.mjs`. Route: `/api/chat` (zie `company/_redirects`).
- **Onderhoudsregel**: het Kompas adviseert alléén wat in `kb.mjs` staat. Wijzigt het aanbod op de site (nieuwe training, hernoemde sectie), dan MOET `kb.mjs` mee, anders routeert de bot verkeerd.
- Routing is conversie-eerst: laagdrempeligste passende stap; CTA-labels matchen de bestemming (`offerCta`).
- Client-historie bevat alleen `{role, content:string}` — nooit tool-blokken of lege content (API-400).
- `company/docs/trainingwijzer/` = oude statische wizard, bewust als dormant fallback op schijf. Niet verwijderen; `main.js` nergens meer laden.
- Alles in `company/` wordt gepubliceerd. Interne bestanden (`/netlify/*`, `/scripts/*`, `package*.json`) worden in `company/_redirects` met een forced 404 afgeschermd. Nieuwe interne map in `company/`? Voeg daar een regel toe.

# academy/

- Vite/React SPA, npm. `npm run build` draait daarna `scripts/prerender.mjs` (puppeteer) voor de publieke routes. Nieuwe publieke pagina: `<Seo>` toevoegen én de route in de ROUTES-array van `academy/scripts/prerender.mjs`.
- Canonical domein: `academy.morgencompany.com`.
- Supabase-project `fiquwpfscmmeqlpkrjjp`. Edge functions en migraties staan in `academy/supabase/`. Supabase CLI vanuit `academy/` draaien. De cursusdata is door Karin ingericht: niet zomaar wijzigen.
- Env: `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_SUPABASE_PROJECT_ID`. Op Netlify in project `morgenacademy`, lokaal in `academy/.env`.
- Supabase pauzeert het gratis project na 7 dagen stilte, en dan valt het klantportaal om. `.github/workflows/supabase-keepalive.yml` pingt dagelijks (repo-secrets `SUPABASE_URL`, `SUPABASE_ANON_KEY`). Workflows moeten in de root-`.github/` staan: GitHub leest `academy/.github/` niet.
- Aanbod-sync: trainingsnamen in `academy/src/data/courses.ts` volgen `company/academy/index.html` en `company/netlify/functions/lib/kb.mjs`. Wijzig ze in dezelfde PR.

# Voor beide

## Commando's

```bash
npm --prefix company ci          # na een verse clone: nodig voor netlify dev (tests draaien ook zonder)
npm --prefix academy ci          # na een verse clone: nodig voor dev, test en build
npm --prefix company test        # node --test, moet groen voor merge
npm --prefix academy test        # vitest, moet groen voor merge
npx http-server company -c-1 -p 8899   # statische preview (of launch.json "static-site")
npm --prefix academy run dev     # academy op :8080 (of launch.json "academy-dev")
scripts/smoke-live.sh            # na elke deploy die domeinen/redirects raakt
cd company && netlify dev        # company met functions (vereist ANTHROPIC_API_KEY in company/.env)
```

## Huisstijl

- Font: alleen **Barlow** (900 voor display-koppen). Donker-first: achtergrond `#0C0818` met paarse blobs.
- Paars `#5B2D8E`/`#9B6FCF` als drager; geel-groen `#D8FE56` schaars als accent (CTA's, logo-punt).
- Glassmorphism cards, radius 20/28px. Logo: `MORGEN` + geel-groene punt.
- **Geen em-dashes** in copy (ook niet in systeem-prompts). "het Kompas" (niet "de").

## Werkwijze

- Feature-branches + PR naar `main`; **mergen alleen op expliciet verzoek van Harmen** ("mergee" / "je mag alles mergen").
- `company/.env` bevat `ANTHROPIC_API_KEY` — nooit tonen/loggen; alleen aanwezigheid checken. Zelfde voor `academy/.env`.
- Schrijfstijl-referentie voor site-copy: `docs/schrijfstijl.md`. Specs/plannen: `docs/superpowers/`.
- `/assistenten/*` redirect naar `/projecten/` — gebruik `/projecten/` in nieuwe hrefs; interne SPA-route heet nog `nav('assistenten')` met `pagePaths.assistenten = '/projecten/'`.
