# Fase 2: echte AI-assets voor de Morgen-wereld (draaiboek)

Dit draaiboek vervangt de placeholder-assets uit fase 1 door echte AI-assets. Bronnen:
`.agents/skills/scroll-world/SKILL.md` (pijplijn en seam-contract),
`references/prompts.md` (prompt-templates), `references/pipeline.md`
(batch-commando's) en het ontwerp
`docs/superpowers/specs/2026-07-21-morgen-wereld-design.md`.

Kern: er wordt pas gegenereerd na een expliciete go van Harmen op de kalibratie
(stap 3). Stills kosten nul credits (Codex op het ChatGPT-abonnement), alleen de
video's tikken het Higgsfield-saldo aan.

## 0. Wat er al klaarligt en wat er moet landen

Promptbestanden (in `wereld/prompts/`, allemaal met byte-identieke stijlpreambule):

| Bestand | Rol |
|---|---|
| `style-preamble.txt` | gedeelde stijlpreambule (papercraft met Morgen-gloed), zit al vooraan in elke prompt |
| `still-hub.txt` | still: campus-overzicht, 3:2 |
| `still-train-binnen.txt` | still: binnenkant collegezaal (Train) |
| `video-intro.txt` | aankomstvlucht, eindigt op het hub-kader, ~6s |
| `video-dive-train.txt` | dive van hub naar binnen in de collegezaal, ~8s |
| `video-leg-train.txt` | binnen-leg door de collegezaal (rise-and-reveal zacht), ~10s |

Doelassets, exact dezelfde bestandsnamen als het placeholdercontract maar onder
`wereld/assets/echt/`:

| Doelpad | Formaat | Bron |
|---|---|---|
| `wereld/assets/echt/hub.webp` | 1536x1024 (3:2) | Codex-still hub |
| `wereld/assets/echt/hub-m.webp` | 720x1280 (9:16) | eerste frame 9:16-render dive-train (stap 8) |
| `wereld/assets/echt/train-binnen.webp` | 1536x1024 | Codex-still binnen |
| `wereld/assets/echt/train-binnen-m.webp` | 720x1280 | eerste frame 9:16-render leg-train |
| `wereld/assets/echt/vid/intro.mp4` | 1920x1080, ~6s | seedance desktopketen |
| `wereld/assets/echt/vid/intro-m.mp4` | 720x1280, ~6s | seedance 9:16-keten |
| `wereld/assets/echt/vid/dive-train.mp4` | 1920x1080, ~8s | seedance desktopketen |
| `wereld/assets/echt/vid/dive-train-m.mp4` | 720x1280, ~8s | seedance 9:16-keten |
| `wereld/assets/echt/vid/leg-train.mp4` | 1920x1080, ~10s | seedance desktopketen |
| `wereld/assets/echt/vid/leg-train-m.mp4` | 720x1280, ~10s | seedance 9:16-keten |

## 1. Voorwaarden en installatie

1. Gereedschap op `$PATH`: `ffmpeg`, `ffprobe`, `jq`, `cwebp`. Check:

   ```bash
   for t in ffmpeg ffprobe jq cwebp codex; do command -v "$t" || echo "ONTBREEKT: $t"; done
   ```

2. **Codex CLI** is aanwezig en ingelogd; verifieer met `codex login status`
   (moet een ChatGPT-login rapporteren, versie >= 0.125).
3. **Higgsfield CLI installeren.** Volg de officiele Higgsfield CLI-documentatie
   (de `higgsfield-generate` skill waarnaar SKILL.md verwijst zit niet in deze
   repo). Verifieer daarna met `higgsfield --version`.
4. **`higgsfield auth login`: interactieve stap voor Harmen.** Dit is een
   OAuth-flow in de browser en kan niet door een agent worden gedraaid. Daarna zo
   nodig `higgsfield workspace set <id>`. Klaar wanneer dit zonder auth-fout
   draait en een creditsaldo toont:

   ```bash
   higgsfield workspace list
   ```

## 2. Werkmap en shellregels

Ruwe 1080p-bronnen en tussenframes horen niet in de repo (Netlify deployt alles
mee). Werk buiten de repo:

```bash
WORK="$HOME/morgen-wereld-bron"                 # bronnen, frames, logs; overleeft reboots
REPO="$(git rev-parse --show-toplevel)"        # draai vanuit de feature/wereld worktree
PROMPTS="$REPO/wereld/prompts"
ECHT="$REPO/wereld/assets/echt"
mkdir -p "$WORK" "$ECHT/vid"
```

Shellregels (hard geleerd, zie SKILL.md Gotchas):

- macOS interactieve shell is **zsh** (arrays 1-geindexeerd). Zet elke loop over
  clips in een `#!/bin/bash`-script en draai het via `bash script.sh`.
- macOS bash is 3.2: **geen associatieve arrays**.
- Higgsfield-generaties duren 3 tot 8 minuten per stuk: draai ze **detached in de
  achtergrond** en poll de logs, nooit blokkerend in de voorgrond.
- Geef `--start-image`/`--end-image` altijd **lokale bestandspaden**, nooit job-UUID's.

## 3. Kalibratie en go/no-go (verplicht voor alles)

De CLI toont geen prijzen en plannen verschillen; **kalibreer, gok niet**
(SKILL.md stap 1.6). Referentie van juli 2026 op een plus-plan: standaardvideo
ongeveer 40 tot 55 credits, maar vertrouw alleen de eigen meting.

1. **Schema-check** (voor de intro belangrijk):

   ```bash
   higgsfield model get seedance_2_0
   ```

   Controleer: welke `--duration`-waarden zijn toegestaan (dit draaiboek wil 6, 8
   en 10; staat 6 er niet bij, gebruik 8 voor de intro), en of `--end-image`
   zonder `--start-image` mag (nodig voor de intro, stap 5.1; mag het niet, zie
   het alternatief daar).
2. **Saldo voor**: `higgsfield workspace list`, noteer het getal.
3. **1 still**: genereer `still-hub` via Codex (stap 4). Kost nul credits en is
   meteen de stijlcheck: leest het als Morgen-papercraft met paarse gloed en
   spaarzaam geel-groen?
4. **1 video**: genereer alleen de intro (stap 5.1). Dat is de enige clip die
   geen eerder frame nodig heeft.
5. **Saldo na**: `higgsfield workspace list` opnieuw. Verschil = prijs van een
   standaardvideo.
6. **Extrapoleer**: totaal = 6 video's (3 desktop + 3 mobiel) x gemeten prijs
   x 1,15 re-roll-marge (NSFW-filter op interieurs is grillig). Waarschuw als de
   schatting boven ~70% van het saldo uitkomt.
7. **Go/no-go door Harmen.** Bij go is de kalibratie-intro meteen de echte
   eerste clip; niets weggooien. Bij no-go: stoppen, de still kostte niets.

## 4. Stills via Codex CLI (nul credits)

Exact het commando uit SKILL.md stap 2 (Codex-variant), met deze
promptbestanden. Let op de single quotes rond het `$imagegen`-deel: de shell mag
dat niet expanderen. Ongeveer 1 tot 3 minuten per beeld.

```bash
codex exec -C "$WORK" -s workspace-write --skip-git-repo-check \
  'Use the image generation tool ($imagegen) to generate: '"$(cat "$PROMPTS/still-hub.txt")"' Wide 3:2 landscape, high resolution. Save it as ./still_hub.png. Do not do anything else.'

codex exec -C "$WORK" -s workspace-write --skip-git-repo-check \
  'Use the image generation tool ($imagegen) to generate: '"$(cat "$PROMPTS/still-train-binnen.txt")"' Wide 3:2 landscape, high resolution. Save it as ./still_train_binnen.png. Do not do anything else.'
```

Output landt op 1536x1024 (exact 3:2). **Review beide stills op cohesie** voor je
verder gaat: zelfde hoek, zelfde palet, zelfde licht, geen leesbare tekst op de
schermen. Off-style: alleen die ene opnieuw genereren. Een van de twee bronnen
gebruiken voor alle stills van een build (hier: altijd Codex), nooit mengen met
Higgsfield-stills, dat leest als stijldrift.

Posters voor desktop meteen wegschrijven (geen resize nodig, 1536x1024 is het
contract):

```bash
cwebp -quiet -q 84 "$WORK/still_hub.png" -o "$ECHT/hub.webp"
cwebp -quiet -q 84 "$WORK/still_train_binnen.png" -o "$ECHT/train-binnen.webp"
```

## 5. Desktopketen 16:9 (seedance_2_0, verplicht sequentieel)

Model voor de hele keten: `seedance_2_0`, `--mode std --resolution 1080p
--aspect_ratio 16:9`. Geen `--generate-audio` (errort op seedance). Een model
voor alle geketende clips; de enige gesanctioneerde uitzondering is de
NSFW-fallback hieronder.

**Seam-contract (kritiek):** elke vervolgclip start op het ECHTE laatste frame
van de vorige clip, geextraheerd met `ffmpeg -sseof`, nooit op de originele
still. Daarom is de volgorde intro, dive, leg strikt sequentieel: niet
parallelliseren.

**Motion-handoff-contract:** elke clip eindigt met "In the final second, settle
into a slow, steady forward drift ..." en elke vervolgclip begint met "Continue
the same slow, steady forward ...". Die clausules staan al letterlijk in de
promptbestanden; niet herformuleren.

### 5.1 Intro (~6s)

De intro moet rustig eindigen op het hub-kader, dus de still is hier het
**eindpunt**:

```bash
higgsfield generate create seedance_2_0 --prompt "$(cat "$PROMPTS/video-intro.txt")" \
  --end-image "$WORK/still_hub.png" \
  --mode std --resolution 1080p --aspect_ratio 16:9 --duration 6 \
  --wait --wait-timeout 20m --json > "$WORK/intro.json" 2> "$WORK/intro.err"
url=$(jq -r '.[0].result_url // empty' "$WORK/intro.json")
curl -fsSL "$url" -o "$WORK/intro.mp4"
```

Accepteert het schema geen `--end-image` zonder `--start-image` (check stap 3.1):
geef dan ook `--start-image "$WORK/still_hub.png"` mee en pas niets aan de prompt
aan; de camera begint dan op het hub-kader, stijgt niet echt van grote hoogte,
maar de prompt stuurt alsnog een dalende aankomst binnen de clip. Beoordeel het
resultaat; bevalt het niet, dan is dit het moment om het met Harmen te bespreken
voor er verder gegenereerd wordt.

### 5.2 Seam-frame intro en handoff-check

```bash
ffmpeg -v error -sseof -0.15 -i "$WORK/intro.mp4" -frames:v 1 -q:v 2 "$WORK/intro_last.png"
```

**Eyeball het frame voor je de dive genereert** (prompts.md): het moet lezen als
een frame uit een kalme voorwaartse drift boven het plein, geen zijwaartse
bewegingsonscherpte, geen half afgemaakte zwaai. Fout beeld: intro opnieuw
rollen, een slecht handoff-frame vergiftigt elke clip erna.

### 5.3 Dive Train (~8s)

```bash
higgsfield generate create seedance_2_0 --prompt "$(cat "$PROMPTS/video-dive-train.txt")" \
  --start-image "$WORK/intro_last.png" \
  --mode std --resolution 1080p --aspect_ratio 16:9 --duration 8 \
  --wait --wait-timeout 20m --json > "$WORK/dive-train.json" 2> "$WORK/dive-train.err"
url=$(jq -r '.[0].result_url // empty' "$WORK/dive-train.json")
curl -fsSL "$url" -o "$WORK/dive-train.mp4"
```

Geen `--end-image`: een eind-beeld dwingt de camera terug te trekken en dat is de
grootste bron van stotter (SKILL.md stap 4, architectuur A binnen de leg).

### 5.4 Seam-frame dive en binnen-leg (~10s)

```bash
ffmpeg -v error -sseof -0.15 -i "$WORK/dive-train.mp4" -frames:v 1 -q:v 2 "$WORK/dive-train_last.png"
# eyeball: kalm voorwaarts frame in het middenpad richting podium

higgsfield generate create seedance_2_0 --prompt "$(cat "$PROMPTS/video-leg-train.txt")" \
  --start-image "$WORK/dive-train_last.png" \
  --mode std --resolution 1080p --aspect_ratio 16:9 --duration 10 \
  --wait --wait-timeout 20m --json > "$WORK/leg-train.json" 2> "$WORK/leg-train.err"
url=$(jq -r '.[0].result_url // empty' "$WORK/leg-train.json")
curl -fsSL "$url" -o "$WORK/leg-train.mp4"
```

### 5.5 NSFW-re-roll-beleid (geldt voor elke video, ook mobiel)

Seedance's filter flagt onschuldige interieurs geregeld (`status "nsfw"`). Per
clip, in deze volgorde:

1. **Re-roll, tot 3 pogingen.** Het filter is deels non-deterministisch; vaak
   gaat poging 2 of 3 gewoon door.
2. Blijft het flaggen: strip verdachte woorden uit de prompt en voeg "empty,
   unoccupied, no people, no figures, architectural, tasteful" toe (haal dan ook
   de paper figures uit de zin).
3. Daarna: genereer alleen die clip op **`kling3_0`** met **dezelfde
   start/eind-frames**: `--mode std --sound off`, geen `--resolution`-parameter
   (bestaat niet op Kling; encodeer wat ffprobe rapporteert, nooit opschalen).
   Lichte render-karakterverschuiving op die ene clip is geaccepteerd. Herstel
   daarna het ketenmodel naar seedance.

Losse 503's of een `not_enough_credits`-race bij parallelle jobs zijn transient:
alleen die ene job opnieuw, saldo verifieren met `higgsfield workspace list`.

## 6. Mobiele 9:16-keten (apart, nooit mengen met 16:9)

De mobiele versie is een **natieve portretketen** (pipeline.md par. 6b), geen
center-crop. Zelfde seam-wetten, maar de keten framelockt tegen zijn **eigen
9:16-renders**: nooit een 16:9-frame als start voor een 9:16-clip.

### 6.1 Portret-startcanvas

Composit de hub-still op een 1080x1920-canvas in de achtergrondkleur (#0C0818,
zelfde kleur als de still-achtergrond, dus de naad is onzichtbaar), eiland op
~94% breedte, visueel centrum op ~45% hoogte:

```bash
ffmpeg -v error -y -i "$WORK/still_hub.png" \
  -vf "scale=1015:-2,pad=1080:1920:(ow-iw)/2:0.45*oh-ih/2:0x0C0818" \
  "$WORK/hub_canvas_m.png"
```

### 6.2 Portretprompts

Zelfde promptbestanden met een portretclausule vooraan (pipeline.md par. 6b):

```bash
for v in intro dive-train leg-train; do
  { printf 'Vertical portrait composition, the paper diorama centered with generous #0C0818 space above and below the scene.\n\n'
    cat "$PROMPTS/video-$v.txt"; } > "$WORK/video-$v-m.txt"
done
```

### 6.3 De keten

Zelfde commando's als stap 5, met `--aspect_ratio 9:16`, de `-m`-promptbestanden
en frames uit de 9:16-renders zelf:

```bash
# intro-m: eindigt op het portret-canvas
higgsfield generate create seedance_2_0 --prompt "$(cat "$WORK/video-intro-m.txt")" \
  --end-image "$WORK/hub_canvas_m.png" \
  --mode std --resolution 1080p --aspect_ratio 9:16 --duration 6 \
  --wait --wait-timeout 20m --json > "$WORK/intro-m.json" 2> "$WORK/intro-m.err"
# download zoals in 5.1, dan:
ffmpeg -v error -sseof -0.15 -i "$WORK/intro-m.mp4" -frames:v 1 -q:v 2 "$WORK/intro-m_last.png"
# eyeball, dan dive-train-m met --start-image intro-m_last.png (duration 8),
# dan leg-train-m met --start-image dive-train-m_last.png (duration 10)
```

Zelfde eyeball-check per laatste frame, zelfde NSFW-beleid (5.5). Portretrenders
triggeren het filter net zo goed.

## 7. Encodes

Exact de regels uit SKILL.md stap 6 en pipeline.md par. 5/6b. Scrubben werkt via
blob-URL's, dus geen all-intra nodig: kleine GOP volstaat.

Desktop (native 1080p, crf 20, GOP 8, lichte unsharp, geen audio, faststart):

```bash
enc() { ffmpeg -v error -y -i "$1" -an -vf "unsharp=5:5:0.8:5:5:0.0" \
  -c:v libx264 -preset slow -crf 20 -pix_fmt yuv420p \
  -g 8 -keyint_min 8 -sc_threshold 0 -movflags +faststart "$2"; echo "enc $2 $(du -h "$2"|cut -f1)"; }

enc "$WORK/intro.mp4"      "$ECHT/vid/intro.mp4"
enc "$WORK/dive-train.mp4" "$ECHT/vid/dive-train.mp4"
enc "$WORK/leg-train.mp4"  "$ECHT/vid/leg-train.mp4"
```

Mobiel (720 breed, GOP 4 want telefoon-decoders betalen per frame vanaf het
dichtstbijzijnde keyframe, crf 23; `scale=720:-2` maakt van de 9:16-render
720x1280):

```bash
encm() { ffmpeg -v error -y -i "$1" -an -vf "scale=720:-2,unsharp=5:5:0.6:5:5:0.0" \
  -c:v libx264 -preset slow -crf 23 -pix_fmt yuv420p \
  -g 4 -keyint_min 4 -sc_threshold 0 -movflags +faststart "$2"; echo "encm $2 $(du -h "$2"|cut -f1)"; }

encm "$WORK/intro-m.mp4"      "$ECHT/vid/intro-m.mp4"
encm "$WORK/dive-train-m.mp4" "$ECHT/vid/dive-train-m.mp4"
encm "$WORK/leg-train-m.mp4"  "$ECHT/vid/leg-train-m.mp4"
```

Richtwaarde: enkele MB per clip. Stottert een telefoon met 4-6x CPU-throttle
alsnog: GOP verder omlaag (`-g 2`), of crf 24-26 als gewicht het probleem is.

## 8. Portret-posters (webp)

De mobiele posters moeten pixel-matchen met frame 0 van de mobiele clips (anders
flitst het beeld van landschap naar portret zodra de video paint). Dus: eerste
frame uit de **ruwe 9:16-renders**, niet uit de stills:

```bash
ffmpeg -v error -ss 0 -i "$WORK/dive-train-m.mp4" -frames:v 1 -q:v 2 "$WORK/hub-m_frame.png"
ffmpeg -v error -ss 0 -i "$WORK/leg-train-m.mp4"  -frames:v 1 -q:v 2 "$WORK/train-binnen-m_frame.png"
ffmpeg -v error -y -i "$WORK/hub-m_frame.png"          -vf "scale=720:-2" "$WORK/hub-m.png"
ffmpeg -v error -y -i "$WORK/train-binnen-m_frame.png" -vf "scale=720:-2" "$WORK/train-binnen-m.png"
cwebp -quiet -q 84 "$WORK/hub-m.png"          -o "$ECHT/hub-m.webp"
cwebp -quiet -q 84 "$WORK/train-binnen-m.png" -o "$ECHT/train-binnen-m.webp"
```

(Dive-train-m opent op het hub-beeld, leg-train-m opent binnen in de zaal: dat
zijn precies de twee portret-posters uit het contract.)

## 9. Van placeholder naar echt: de wissel

`wereld/index.html` bevat zelf geen assetpaden; alle tien paden staan op een
plek: het `ASSETS`-object bovenaan **`wereld/wereld.js`**, regels 17-28 (blok
"Assetcontract", paden relatief aan `/wereld/`):

```js
const ASSETS = {
  hub:         'assets/placeholder/hub.webp',
  ...
  legTrainM:   'assets/placeholder/vid/leg-train-m.mp4',
};
```

De wissel is een find-replace van het prefix `assets/placeholder/` naar
`assets/echt/` binnen alleen dat object (tien regels, een prefix):

```bash
sed -i '' 's#assets/placeholder/#assets/echt/#g' wereld/wereld.js
```

Er verandert verder niets, omdat de bestandsnamen onder `assets/echt/` exact
het placeholdercontract volgen (zie de tabel in stap 0). De placeholdermap
blijft staan als regressie-referentie tot de PoC is beoordeeld. Pas na de wissel
ook de hotspot-percentages aan op de echte hub-still (`HOTSPOTS` bovenin
`wereld/wereld.js`, regels 9-14): de gebouwen liggen in de echte render vrijwel
zeker net anders dan in de placeholder.

## 10. QA (niet overslaan, SKILL.md stap 8)

- **Seams**: screenshot vlak voor en vlak na elke naad (intro naar dive, dive
  naar leg), op desktop en mobiel. De frames moeten near-identiek zijn; een pop
  betekent dat er toch een still in plaats van een echt frame als start is
  gebruikt.
- **Blob-seek**: console schoon, `video.seekable.end(0) > 0` per clip,
  `currentTime` volgt de scroll over de hele band.
- **Mobiel**: geemuleerde telefoon met 4-6x CPU-throttle, snel scrollen zonder
  freeze; eerste beeld direct zichtbaar (poster), geen zwart scherm op iOS
  Safari; Network-panel toont de `-m.mp4`-varianten en `videoWidth <
  videoHeight` (echt portret, geen crop); URL-balk inklappen mag de pagina niet
  laten springen.
- **Reduced motion**: valt terug op de stills, geen video, geen particles.
- **Merkcheck**: paarse gloed, geel-groene accenten spaarzaam, campus leesbaar.
  Eindoordeel: Harmen op de Netlify branch-preview.
