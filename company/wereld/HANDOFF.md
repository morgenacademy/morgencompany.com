# Morgen-wereld — handoff (2026-07-22, ~19:30)

Snelle overdracht voor een verse sessie. Volledige context: geheugen `morgen-wereld-poc.md` + spec `docs/superpowers/specs/2026-07-21-morgen-wereld-design.md`.

## Waar we staan
Desktopwereld compleet en geverifieerd: campus-dorp met 4 hoofdgebouwen (Train/Implement/Build/Inspire) + 3 secundaire plein-plekken (Projecten, Over Morgen., Kompas). Hybride model (intro-vlucht → hub → klik-dive → scroll-verhaal binnen). Branch `feature/wereld` in worktree, Netlify-preview: https://feature-wereld--websitemorgencompany.netlify.app/wereld/ . Live pas na akkoord Harmen. Laatste commit: 768d403.

## Sessie 2 — afgerond (2026-07-22 avond)
1. **Video-verwisseling hersteld.** De "Implement toont Train-tafel"-melding: de dive-toewijzing in `wereld.js` klopte al (Implement→dive-implement, Train→dive-train), maar de clips zélf waren zwak. Beide train- én implement-ketens opnieuw gegenereerd:
   - **Train-dive** (dive-train.mp4, v5, getrimd 5,3s): duikt nu het ZUILEN-gebouw links in; amfitheater-rijen vouwen in beeld om tot één lange gedeelde tafel. Start = intro_last.png.
   - **Train-leg** (leg-train.mp4, v5): near-static binnen (camera "hovers almost in place", geen uitzoom). Start = dive-train frame @5,3s.
   - **Implement-dive** (dive-implement.mp4, v2): vliegt de open werkplaats-schuur in (tandwielwand, werkbanken, staande figuren, lopende band). Start = intro_last.png.
   - **Implement-leg** (leg-implement.mp4, v2): glijdt door de schuurdeuren naar binnen, blijft near-static. Start = dive-implement eindframe.
   - Build/Inspire-ketens ongewijzigd (waren al goed).
   - Alle nieuw geëncodeerd crf20/GOP8/unsharp/faststart.
2. **Ambient-beweging binnen** (verzoek "er beweegt niets"): `startAmbient()` in `wereld.js` speelt na de dive de binnenclip gedempt af op 0,45× tot de eerste scroll; dan pauzeert het en neemt de scrub-engine het over. `scrub-engine.js` byte-identiek gelaten. **Geverifieerd in echte Chrome**: leg-video paused=false/rate=0.45/muted na dive-einde, paused=true na scroll-event.
3. **Sub-hotspots** Projecten (maquette-tuin/stolpen), Over Morgen. (kampvuur), Kompas (wegwijzer→`/#trainingwijzer-app`). Kleiner/stiller `.is-sub`-stijl zodat de 4 hoofdgebouwen het volle accent houden. Projecten+Over Morgen. openen still-binnenwerelden (geen dive) met eigen eindpaneel; Kompas linkt naar het Kompas op de hoofdsite. `startDive` valt voor plekken zonder `.dive` direct door naar het verhaal.
4. **train-binnen.webp** = goedgekeurde v2 (lange gedeelde tafel, `~/Downloads/morgen-wereld-anchors/still_train_binnen_v2.png`).

## Verificatie-valkuil (belangrijk)
De **claude-in-chrome** browser én de **browser-pane** throttlen media zwaar: video's blijven op `readyState 0` hangen, de intro-cinematic buffert eindeloos zwart en de scrub lijkt kapot. Dat is de testomgeving, niet de site. Verifieer flow-logica via `dispatchEvent(new Event('ended'))` op `#cine-video` (simuleert dive-einde) en check state/rate via `javascript_tool`; beoordeel het echte beeld op een gewoon toestel of via de Netlify-preview in een normale browser. Browser-pane forceert bovendien `prefers-reduced-motion` → dive+ambient worden daar overgeslagen.

## Nog te doen — mobiele 9:16-keten (taak 4, geblokkeerd op bronmateriaal)
Slots `diveM/legM/introM` wijzen nu naar de desktopclips; de engine/cine-player croppen cover, dus mobiel werkt al (bijgesneden). Native 9:16 is de openstaande enhancement. **Blokkade: er zijn geen 9:16-bronstills.** De desktopstills zijn 3:2 isometrische diorama's; center-croppen naar 9:16 snijdt de scène kapot. Nodig: purpose-made 9:16-composities (via Codex/ChatGPT gratis, zie GENERATIE.md §8) als anker voor intro-m → dive-m → leg-m per gebouw. Pas dán de Higgsfield-9:16-keten draaien. Niet doen met bijgesneden 3:2.

## Harde leerpunten (trial/Seedance)
- Trial dekt alleen website-UI, MCP/API geblokkeerd (`only_website_usage_on_trial_is_available`). 720p unlimited; 1080p kost credits. Trial verloopt vannacht ~00:47.
- Werkroute = claude-in-chrome op higgsfield.ai/ai/video, klembord-paste (`osascript … «class PNGf»` → cmd+v), thumbnail aanklikken → **"Use as… → Start Frame"** (vers geplakte thumb staat default op **Reference**, wat de run verpest — altijd expliciet op Start Frame zetten). Duurveld negeert invoer (alles 6s); aspect volgt referentieframe.
- Seedance drift na ~4,5s uit interieurscènes (uitzoomen). Oplossing die nu werkt: dive trimmen op het frame waar je binnen bent (~5,3s) én de leg-prompt "hovers almost in place / never zooms out / never pulls back" geven i.p.v. een voorwaartse sweep → geen drift meer.
- Dive-prompt moet het doelgebouw expliciet aanwijzen én de andere gebouwen uitsluiten ("Not the barn, not the domed lab…").
- Abo-besluit uitgesteld tot na PoC-beoordeling. Starter ontoereikend; Plus (~1200 cr) voor uitbouw/1080p.
