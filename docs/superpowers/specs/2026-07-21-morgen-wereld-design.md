# Morgen-wereld: immersive scroll-wereld (design)

Datum: 2026-07-21. Status: goedgekeurd door Harmen (brainstormsessie). Branch: `feature/wereld` (eigen worktree, los van lopend werk; live pas na expliciet akkoord).

## Doel

Morgen is een AI-bedrijf met een bewust simpele statische site en dat wringt met het merk. De nieuwe siteversie laat bezoekers een wereld binnenkomen waarin de vier pilaren (Train, Implement, Build, Inspire) als gebouwen te openen zijn. De site wordt zelf het bewijs van wat Morgen kan: showcase boven conversie. Inspiratie en techniek: de open-source agent skill [scroll-world](https://github.com/oso95/scroll-world) (MIT).

## Besluiten

1. **Interactiemodel: hybride.** Korte, skipbare intro-vlucht (autoplay, geen scroll) landt op een hub. Klik op een gebouw start een camera-dive naar binnen; het binnen-verhaal is wel scroll-gescrubd. Binnen volgt per gebouw een kort scroll-verhaal met de content van die pilaar als overlay-secties. Uitgang onderaan: terug naar de hub of door naar het volgende gebouw. Een gewone nav-balk blijft er bovenop staan. De hub bevat geen instructietekst ("kies een gebouw" of vergelijkbaar): de uitnodiging om te klikken moet volledig visueel zijn (gloed, hover, subtiele beweging).
2. **Wereld: campus-dorp** in een tuinachtige setting. Vier gebouwen rond een Morgen-plein met de geel-groene punt als landmark: collegezaal (Train), werkplaats (Implement), lab (Build), theater (Inspire). Zones vloeien visueel in elkaar over; Train en Implement zijn het sterkst verweven (gedeeld terrein, doorlopend pad).
3. **Stijl:** licht papercraft-diorama zoals de inspiratievideo. Zones krijgen een zwart/paarse gloed (`#0C0818`, `#5B2D8E`, `#9B6FCF`) met geel-groen accent (`#D8FE56`). De huisstijl mag hiervoor losser; herkenbaarheid komt uit de accenten en de merknaam.
4. **Repo-strategie:** alles op branch `feature/wereld` in een eigen worktree. De wereldversie leeft op de branch als `wereld/index.html` met assets onder `wereld/assets/`; zodra de PoC slaagt en uitgebouwd is, wordt hij daar de nieuwe `index.html`. De bestaande pagina's blijven op de branch onaangeraakt tot dat moment. De huidige site blijft parallel doorontwikkelbaar op andere branches. Netlify branch-preview dient als showcase-URL. Merge naar `main` alleen op expliciet verzoek.
5. **Mobiel vanaf start:** natieve 9:16-portretketen (geen center-crop), conform de skill.

## Techniek

- **Pijplijn: scroll-world skill, architectuur B** (dive-in plus luchtverbinding), bedoeld voor diorama/miniatuurwerelden. De vanilla scrub-engine (`references/scrub-engine.js`) is zelfstandig en framework-vrij: past op de statische Netlify-site zonder build-step.
- **Seam-contract (kritiek):** elke vervolgclip start op het echte laatste frame van de vorige clip (ffmpeg-extractie), nooit op de originele still. De engine legt een korte crossfade over elke seam.
- **Stills via Codex CLI** (aanwezig, ingelogd met ChatGPT): gpt-image-2 op het ChatGPT-abonnement, nul Higgsfield-credits voor beelden. Eén bron voor alle stills van een build (geen stijldrift).
- **Video via Higgsfield** (CLI nog installeren; auth en credits zijn actie Harmen). Standaardmodel `seedance_2_0`; draft-tier `seedance_2_0_mini` als previz; `kling3_0` als NSFW-fallback per clip. Kostenkalibratie: eerst 1 still en 1 video, creditsaldo diffen, dan pas de rest.
- **Encodes:** desktop native 1080p, crf 20, GOP 8, faststart, audio strippen; mobiel 720 breed, GOP 4, crf 23, als `clipMobile`/`connectorsMobile` plus `stillMobile`-posters.
- **Fallbacks:** `prefers-reduced-motion` en trage verbindingen krijgen statische beelden met gewone navigatie (zit in de engine).

## PoC-scope

Eerst bewijzen, dan uitbouwen. Twee fasen:

**Fase 1: placeholderbouw (nul credits).** Volledige interactie werkend met ffmpeg-gegenereerde placeholderclips en -stills: intro, hub met vier hotspots (drie stil op "binnenkort"), dive Train, binnen-verhaal Train met academy-content als overlays, exits, mobiel, reduced-motion. Hiermee valideren we engine, flow en gevoel zonder uitgaven.

**Fase 2: echte assets (na akkoord kosten).** Assets PoC:

| Asset | Bron | Aantal |
|---|---|---|
| Still hub-overzicht (3:2, 2k) | Codex image_gen | 1 |
| Still binnen Train | Codex image_gen | 1 |
| Intro-vlucht naar hub | Higgsfield video | 1 desktop + 1 mobiel |
| Dive Train (hub naar binnen) | Higgsfield video | 1 desktop + 1 mobiel |
| Binnen-leg Train (scroll-verhaal) | Higgsfield video | 1 desktop + 1 mobiel |

Ordegrootte: 2 gratis stills, 6 video's plus ~15% re-roll-marge (NSFW-filter op interieurs is grillig). Skill toont de raming vooraf; Harmen keurt het budget goed vóór generatie.

## Slaagcriteria PoC

- Dive Train zonder zichtbare frame-sprong op de seams.
- Scrubben soepel op desktop én op een geëmuleerde telefoon met 4-6x CPU-throttle.
- Eerste beeld direct zichtbaar (still als poster), geen zwart scherm op iOS.
- Laadgewicht per clip enkele MB's; blob-seek werkt (`video.seekable.end(0) > 0`).
- Wereld voelt als Morgen: paarse gloed, geel-groene accenten, campus leesbaar.
- Oordeel Harmen op de branch-preview.

## Buiten scope PoC (vervolg na geslaagde PoC)

- Binnen-verhalen van Implement (consultancy), Build (technology plus projecten) en Inspire (inspiratie), met dezelfde pijplijn.
- Het Kompas als klikbaar kompas-object op het plein dat de chat opent.
- Content-migratie en SEO-strategie van de overige pagina's binnen de wereldversie.
- Merge naar `main` en livegang.

`lib/kb.mjs` hoeft niet mee in de PoC: het aanbod wijzigt niet, alleen de presentatie.
