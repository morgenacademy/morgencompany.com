# Bundle-splitsing: van 7 volledige kopieën naar echte pagina's

Startpunt voor een aparte sessie. Dit is bewust géén quick fix: het raakt de routing van de hele site.

## Prompt om mee te beginnen

> Lees `docs/bundle-splitsing.md` en `CLAUDE.md`. We gaan de 7-bundle-architectuur splitsen: elke URL mag alleen nog zijn eigen pagina bevatten in plaats van alle negen. Begin met een plan en een risico-inventarisatie, bouw niets voordat we de aanpak hebben gekozen. Meet eerst de huidige situatie zelf na, want de cijfers hieronder zijn van 2026-07-25.

## Wat het probleem is

Elke pagina bestaat als een compleet HTML-bestand met **alle** pagina's erin als `<div class="page">`-blokken. Er zijn zeven van die bundles:

```
index.html            -> geserveerd op /organisatie/ (rewrite in _redirects)
academy/index.html    -> /academy/
consultancy/index.html
technology/index.html
projecten/index.html
inspiratie/index.html
about/index.html
```

De wereld-homepage staat los: `wereld/index.html`, via een rewrite geserveerd op `/`.

Gemeten op 2026-07-25:

| Wat | Nu |
|---|---|
| HTML per URL | 223 tot 226 KB |
| Pagina-blokken per bestand | 9 |
| Zichtbare tekst per URL | ~47.800 tekens |
| Aandeel dat bij de eigen pagina hoort | ongeveer een achtste |

Kosten: elke bezoeker downloadt ~224 KB in plaats van ~40 KB (raakt Core Web Vitals, vooral mobiel), en elke inhoudelijke wijziging moet met de hand in zeven bestanden identiek blijven. Dat laatste is volgens CLAUDE.md de grootste bugbron in deze repo, en het is in de praktijk al een paar keer misgegaan.

## Wat al gefixt is (niet opnieuw doen)

Op 2026-07-25 is het ergste symptoom weg: alle zeven bundles hadden statisch `page-home` actief, waardoor elke URL zonder JavaScript de homepage toonde en de H1 overal "GoedeMORGEN." was. Nu staat per bundel de eigen pagina op `active` en is die hero de enige echte `<h1>`. De zichtbare inhoud verschilt dus per URL. Wat resteert is de duplicatie in de HTML zelf.

## Waarom het niet triviaal is

De instant-navigatie hángt op deze opzet: `nav(page, anchor)` wisselt alleen de `.active`-class, zonder page-load. Haal je de andere pagina's weg, dan moet elke interne klik iets anders doen. Drie routes:

1. **Build-stap die per pagina genereert.** Eén bron (bijvoorbeeld partials of een template) waaruit zeven bestanden rollen met alleen hun eigen inhoud. Interne links worden echte page-loads, eventueel met prefetch zodat het snel blijft voelen. Lost duplicatie én de handmatige sync op. Vraagt wel een build-stap in de Netlify-config, die er nu niet is.
2. **Fetch-gebaseerd inladen.** Elke pagina bevat alleen zichzelf; bij een interne klik haalt de client de andere pagina op en injecteert die. Houdt het SPA-gevoel, maar je bouwt in feite een mini-router met alle edge cases (history, anchors, focus, formulieren, meta-updates).
3. **Hybride.** Alleen de zware pagina's uit de bundles halen en de rest laten staan. Minste werk, halve winst, en de sync-regel blijft bestaan.

Mijn advies is route 1, maar de keuze is aan Harmen: het verandert hoe de site aanvoelt bij intern klikken.

## Wat niet mag breken

- **Routing en rewrites.** `_redirects` heeft `/ -> /wereld/index.html 200` en `/organisatie/* -> /index.html 200`. Ook `/assistenten/*` verwijst naar `/projecten/`. De interne SPA-route heet nog `nav('assistenten')` met `pagePaths.assistenten = '/projecten/'`.
- **Deeplinks van buiten.** De wereld linkt naar `/projecten/#case-pinkroccade`, `#case-solosolis`, `#case-tilburg`, `#case-onview`, `#case-mkb-boost`, `#case-avans-processen` en naar `/inspiratie/#cp-keynote`, `#cp-verdieping`, `#cp-artikelen`, `#cp-boek`, plus `/academy/#ac-trainingen` en `#ac-verdiepen` en `/consultancy/#co-aanpak` en `/technology/#te-aanpak`. Die id's staan op de `<article class="project-card">` en op de depth-panels, zodat je op de bovenkant van de kaart landt.
- **SEO-metadata.** Per URL een eigen `<title>`, description en self-canonical. Nu doet `routeMeta` in de JS dat bij intern navigeren; na splitsing kan dat grotendeels statisch. Let op: `routeMeta` was uit elkaar gelopen en is op 2026-07-25 gelijkgetrokken. Zie `docs/seo-teksten.md` voor de vastgestelde teksten.
- **Precies één `<h1>` per pagina**, en dat moet de eigen hero zijn. Zie de regel in CLAUDE.md.
- **Het Kompas.** De chat-widget mount op `#trainingwijzer-app` en `[data-kompas]` en initialiseert zichzelf bij het laden van `docs/academy-chat/chat.js`. Bij fetch-gebaseerd inladen wordt die mount niet automatisch geïnitialiseerd: `initKompas` is niet geëxporteerd.
- **Formulieren.** Netlify-forms met per bestand eigen `action`-URL's.
- **Pagina-specifieke IIFE's**, zoals `paint` in index.html en de filter-`apply` in projecten.

## Verificatie na de ombouw

```bash
# grootte per URL: doel is een fractie van de 224 KB van nu
for f in index.html */index.html; do echo "$(wc -c <"$f") $f"; done

# precies 1 h1 per pagina, en het is de eigen hero
grep -c '<h1' index.html */index.html

# elke pagina bevat alleen zichzelf
grep -c '<div class="page' index.html */index.html

# alle deeplink-anchors bestaan nog en staan op de kaart, niet op de titel
grep -o '<article id="case-[a-z-]*"' projecten/index.html
grep -o 'id="cp-[a-z]*"' inspiratie/index.html
```

Daarnaast in een echte browser: intern klikken vanaf elke pagina, terug- en vooruitknop, een deeplink met anchor rechtstreeks openen, het Kompas gebruiken, en een formulier versturen.

## Nog open, los hiervan

De wereld-homepage heeft nu 54 woorden plus zes links. Wil je dat `/` zelf gaat ranken, dan is een echte tekstsectie onder de wereld nodig (350 tot 500 woorden). Dat vraagt dat de pagina in hub-state mag scrollen; nu staat er `body:not([data-state="verhaal"]) { overflow: hidden; height: 100vh }`.
