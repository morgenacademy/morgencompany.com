# Morgen-wereld — handoff (2026-07-22, ~15:20)

Snelle overdracht voor een verse sessie. Volledige context: geheugen `morgen-wereld-poc.md` + spec `docs/superpowers/specs/2026-07-21-morgen-wereld-design.md`.

## Waar we staan
Desktopwereld bijna compleet: campus-dorp met 4 gebouwen (Train/Implement/Build/Inspire), hybride model (intro-vlucht → hub → klik-dive → scroll-verhaal binnen). Branch `feature/wereld` in worktree, Netlify-preview: https://feature-wereld--websitemorgencompany.netlify.app/wereld/ . Live pas na akkoord Harmen. Laatste commit vóór deze handoff: d6ba1d8.

## Assets — status
Alle stills goedgekeurd (gratis via Codex), in `~/morgen-wereld-bron/` + als webp in `wereld/assets/echt/`: hub (anchor v3, met brug/wegwijzer/maquette-tuin/kampvuur), 4 interieurs, projecten (3 stolpen), overons (kampvuur+team).

Video's (Seedance 2.0, 720p, trial-dag; ~6s elk, 4:3). Geencodeerd en in `wereld/assets/echt/vid/`:
- intro, dive-train (OUD interieur, gebogen rijen), leg-train (oud, getrimd 4,4s)
- dive-implement, leg-implement, dive-build, leg-build, dive-inspire — allemaal QA-goedgekeurd + geencodeerd (crf20/GOP8/unsharp/faststart)

## Nog lopend (2 background-agents)
1. **Chrome-agent** (sonnet) genereert de laatste 3 clips op higgsfield.ai:
   - `leg-inspire.mp4` (vanaf dive-inspire eindframe)
   - `dive-train.mp4` v3 + `leg-train.mp4` v4 — HERKANSING met `still_train_binnen.png` (lange gedeelde tafel) als Reference, want Harmen wil de lange tafel, niet de gebogen collegerijen. Overschrijft de oude train-clips (backups bestaan).
   - Bij oplevering: encoden zoals de rest (zie `wereld/prompts/GENERATIE.md` §7) naar `echt/vid/`.
2. **Pagina-agent** bouwt `wereld/wereld.js`+`index.html`+`css` om naar 4 klikbare gebouwen (content uit consultancy/technology/inspiratie-pagina's, generiek eindpaneel, engine-cache per gebouw).

## Daarna nog te doen
- **Ambient-beweging binnen** (verzoek Harmen "er beweegt niets"): na de dive de binnenwereld-clip zachtjes laten autoplayen tot de bezoeker scrollt, dan neemt de scrub het over. Kleine patch bovenop de engine-mount in `wereld.js` (engine NIET wijzigen — moet byte-identiek blijven aan de skill-referentie).
- Hotspot-posities voor projecten (wegwijzer→Kompas), maquette-tuin en kampvuur zijn nog niet klikbaar (uitbouw na PoC).
- Committen + preview verversen; Harmen beoordeelt.
- Mobiele 9:16-keten nog niet gedaan (slots wijzen tijdelijk naar desktopclips).

## Harde leerpunten (trial/Seedance)
- Trial dekt alleen website-UI, MCP/API geblokkeerd (`only_website_usage_on_trial_is_available`). 720p unlimited; 1080p kost credits. Trial verloopt vannacht ~00:47.
- Werkroute = claude-in-chrome op higgsfield.ai/ai/video, klembord-paste (osascript PNGf → cmd+v), rol Start/End Frame per thumbnail; duurveld negeert invoer (alles 6s); aspect volgt referentieframe.
- Seedance drift na ~4,5s uit interieurscènes (uitzoomen naar los object) → leg trimmen. Dive-prompt moet doelgebouw expliciet noemen.
- Abo-besluit uitgesteld tot na PoC-beoordeling. Starter ontoereikend; Plus (~1200 cr) voor uitbouw/1080p.
