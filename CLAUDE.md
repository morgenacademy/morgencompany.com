# CLAUDE.md

Statische marketingsite van **Morgen** (morgencompany.com): Academy (trainingen), Consultancy (implementatie), Technology (maatwerk). Geen build-stap; deploy via Netlify vanaf GitHub (`main`). Alle content is Nederlands.

## Kritieke architectuur: 7 bundle-bestanden

De site bestaat uit 7 onafhankelijke HTML-bestanden die **elk een volledige kopie van álle SPA-pagina's bevatten** (`<div class="page" id="page-...">` secties + gedeelde JS-bootstrap):

```
index.html            → home actief
academy/index.html    → academy (TRAIN) actief
technology/index.html consultancy/index.html about/index.html
projecten/index.html  inspiratie/index.html
```

**Elke inhoudelijke wijziging moet in alle 7 bestanden.** Client-side routing (`nav(page, anchor)`) wisselt alleen `.active` — er is geen page-load bij intern navigeren, dus een verouderde kopie blijft gewoon zichtbaar voor bezoekers die via een andere pagina binnenkomen. Dit is de grootste bron van bugs in deze repo.

Sync-aanpak die werkt: wijzig eerst het bestand waar de sectie "thuis" hoort (bijv. academy-content in `academy/index.html`), extraheer het blok en vervang het byte-identiek in de andere 6 (Python-script met regelgrenzen of marker-strings). Verifieer daarna:

```bash
# per bestand: div-balans, 8 pages, functie-consistentie
grep -c '<div class="page"' *.html */index.html          # overal 8
diff <(blok uit A) <(blok uit B)                          # byte-identiek
```

Let op: ook **JS-data en functies** driften (bijv. `const trainingData={...}`, `openTrainingPopup`, popup-markup `#tp-next`). Bij sync van een sectie met `onclick="openTrainingPopup('key')"`: check dat die key in `trainingData` van elk bestand bestaat.

Bewust verschillend per bestand (níet gelijktrekken): `<title>`, meta description, canonical URL, welke page default actief is, form `action` URL's, en pagina-specifieke IIFE's (`paint` in index.html, filter-`apply` in projecten).

**Ook per bestand verschillend: welke hero de `<h1>` is.** Elke bundel heeft precies één `<h1>`: de hero van de pagina die in dát bestand `class="page active"` heeft. Alle andere hero's zijn `<h2 class="h1">` (zelfde styling, andere semantiek). Zet dus bij een sync nooit de `active`-class of de `<h1>` van het ene bestand over het andere heen: dan tonen alle URL's zonder JS de homepage en wordt de H1 overal "GoedeMORGEN.". Controle:

```bash
# per bundel: 1 h1, en de actieve page hoort bij het bestand
grep -c '<h1' index.html */index.html                    # overal 1
grep -o 'page active" id="page-[a-z-]*"' */index.html    # academy->page-academy, projecten->page-assistenten, inspiratie->page-company
```

## Het Kompas (AI-chat adviseur)

- Widget: `docs/academy-chat/chat.js` + `chat.css`, mount op `#trainingwijzer-app` of `[data-kompas]` (multi-instance). Staat op homepage én academy-pagina.
- Backend: `netlify/functions/chat.mjs` (SSE-streaming, Claude Sonnet 5) met `lib/kb.mjs` (kennisbank), `lib/tool.mjs` (strict tool `presenteer_advies`), `lib/guards.mjs`, `lib/sse.mjs`, `lib/ratelimit.mjs`. Route: `/api/chat` (zie `_redirects`).
- **Onderhoudsregel**: het Kompas adviseert alléén wat in `kb.mjs` staat. Wijzigt het aanbod op de site (nieuwe training, hernoemde sectie), dan MOET `kb.mjs` mee, anders routeert de bot verkeerd.
- Routing is conversie-eerst: laagdrempeligste passende stap; CTA-labels matchen de bestemming (`offerCta`).
- Client-historie bevat alleen `{role, content:string}` — nooit tool-blokken of lege content (API-400).
- `docs/trainingwijzer/` = oude statische wizard, bewust als dormant fallback op schijf. Niet verwijderen; `main.js` nergens meer laden.

## Commando's

```bash
npm test          # node --test op netlify/functions/lib/**/*.test.mjs (moet groen voor merge)
npx http-server -c-1 -p 8899   # statische preview (of via .claude/launch.json "static-site")
netlify dev       # met functions (vereist ANTHROPIC_API_KEY in .env)
```

## Huisstijl

- Font: alleen **Barlow** (900 voor display-koppen). Donker-first: achtergrond `#0C0818` met paarse blobs.
- Paars `#5B2D8E`/`#9B6FCF` als drager; geel-groen `#D8FE56` schaars als accent (CTA's, logo-punt).
- Glassmorphism cards, radius 20/28px. Logo: `MORGEN` + geel-groene punt.
- **Geen em-dashes** in copy (ook niet in systeem-prompts). "het Kompas" (niet "de").

## Werkwijze

- Feature-branches + PR naar `main`; **mergen alleen op expliciet verzoek van Harmen** ("mergee" / "je mag alles mergen").
- `.env` bevat `ANTHROPIC_API_KEY` — nooit tonen/loggen; alleen aanwezigheid checken.
- Schrijfstijl-referentie voor site-copy: `docs/schrijfstijl.md`. Specs/plannen: `docs/superpowers/`.
- `/assistenten/*` redirect naar `/projecten/` — gebruik `/projecten/` in nieuwe hrefs; interne SPA-route heet nog `nav('assistenten')` met `pagePaths.assistenten = '/projecten/'`.
