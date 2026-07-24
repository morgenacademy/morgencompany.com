#!/bin/bash
# wereld-placeholders.sh
#
# Genereert placeholder-videoassets en -stills voor de scroll-gescrubde
# "vlieg door de wereld"-pagina, zodat die getest kan worden zonder
# AI-generatiekosten.
#
# Output (relatief aan repo-root):
#   wereld/assets/placeholder/hub.webp              1536x1024
#   wereld/assets/placeholder/hub-m.webp             720x1280
#   wereld/assets/placeholder/train-binnen.webp     1536x1024
#   wereld/assets/placeholder/train-binnen-m.webp    720x1280
#   wereld/assets/placeholder/vid/intro.mp4         1920x1080, 6s
#   wereld/assets/placeholder/vid/intro-m.mp4        720x1280, 6s
#   wereld/assets/placeholder/vid/dive-train.mp4    1920x1080, 8s
#   wereld/assets/placeholder/vid/dive-train-m.mp4   720x1280, 8s
#   wereld/assets/placeholder/vid/leg-train.mp4     1920x1080, 10s
#   wereld/assets/placeholder/vid/leg-train-m.mp4    720x1280, 10s
#
# Vereist: ffmpeg (Homebrew) en /usr/bin/python3 met Pillow.
# De lokale ffmpeg-build heeft geen drawtext (geen freetype) en geen
# libwebp-encoder; daarom rendert Pillow de tekstlagen (transparante
# PNG's, gecomposit via ffmpeg overlay) en schrijft Pillow de webp-stills.
# Tekstfont: Barlow-Black (huisstijl), valt terug op Arial.
#
# In elk videobeeld zit, naast de camerabeweging (zoompan):
#   - een groot segmentlabel (INTRO / DIVE TRAIN / TRAIN BINNEN)
#   - een lopende secondeteller (0s, 1s, ...) voor seams en scrubrichting
#   - een continu bewegend accent-blokje onderin (per-frame beweging)
#
# Bash 3.2-veilig: geen associative arrays, geen bash-4-features.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
OUT="$ROOT/wereld/assets/placeholder"
VID="$OUT/vid"
TMP="$(mktemp -d "${TMPDIR:-/tmp}/wereld-placeholders.XXXXXX")"
trap 'rm -rf "$TMP"' EXIT

mkdir -p "$OUT" "$VID"

FPS=30
PY="/usr/bin/python3"

# Morgen-kleuren (0x-notatie voor ffmpeg, kale hex voor Pillow)
DONKER=0x0C0818
PAARS=0x5B2D8E
LILA=0x9B6FCF
ACCENT=0xD8FE56

# ---------------------------------------------------------------------------
# Pillow-helper voor tekstlagen en webp-export
# ---------------------------------------------------------------------------

PYHELPER="$TMP/wereld_text.py"
cat > "$PYHELPER" <<'PYEOF'
import os, sys
from PIL import Image, ImageDraw, ImageFont

FONT_CANDIDATES = [
    os.path.expanduser("~/Library/Fonts/Barlow-Black.ttf"),
    "/Library/Fonts/Barlow-Black.ttf",
    "/System/Library/Fonts/Supplemental/Arial Bold.ttf",
    "/System/Library/Fonts/Supplemental/Arial.ttf",
]

def font(size):
    for p in FONT_CANDIDATES:
        if os.path.exists(p):
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()

def rgba(hexstr, alpha=1.0):
    hexstr = hexstr.lstrip("#")
    return (int(hexstr[0:2], 16), int(hexstr[2:4], 16),
            int(hexstr[4:6], 16), int(round(float(alpha) * 255)))

def _measure(text, f):
    d = ImageDraw.Draw(Image.new("RGBA", (8, 8)))
    return d.textbbox((0, 0), text, font=f)

def make_label(out, text, fs, fg, box, boxalpha):
    f = font(fs)
    bb = _measure(text, f)
    tw, th = bb[2] - bb[0], bb[3] - bb[1]
    pad = max(8, fs // 3)
    img = Image.new("RGBA", (tw + 2 * pad, th + 2 * pad), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, img.width - 1, img.height - 1],
                        radius=max(6, fs // 4), fill=rgba(box, boxalpha))
    d.text((pad - bb[0], pad - bb[1]), text, font=f, fill=rgba(fg))
    img.save(out)

def make_strip(out, cellh, count, fs, fg, box, boxalpha):
    # Verticale strip met 1 secondelabel per cel van precies cellh (=framehoogte).
    # De overlay schuift de strip per seconde 1 cel omhoog, dus er is altijd
    # exact 1 label in beeld.
    f = font(fs)
    texts = ["%ds" % i for i in range(count)]
    dims = [_measure(t, f) for t in texts]
    maxw = max(b[2] - b[0] for b in dims)
    maxh = max(b[3] - b[1] for b in dims)
    pad = max(8, fs // 3)
    stripw = maxw + 2 * pad
    img = Image.new("RGBA", (stripw, cellh * count), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    for i, (t, bb) in enumerate(zip(texts, dims)):
        tw, th = bb[2] - bb[0], bb[3] - bb[1]
        cx, cy = stripw // 2, i * cellh + cellh // 2
        d.rounded_rectangle([cx - maxw // 2 - pad, cy - maxh // 2 - pad,
                             cx + maxw // 2 + pad, cy + maxh // 2 + pad],
                            radius=max(6, fs // 4), fill=rgba(box, boxalpha))
        d.text((cx - tw // 2 - bb[0], cy - th // 2 - bb[1]),
               t, font=f, fill=rgba(fg))
    img.save(out)

def make_marker(out, size, fill):
    img = Image.new("RGBA", (size, size), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    d.rounded_rectangle([0, 0, size - 1, size - 1], radius=size // 4,
                        fill=rgba(fill),
                        outline=rgba("0C0818", 0.9),
                        width=max(2, size // 12))
    img.save(out)

def compose_webp(out, base, overlays):
    # overlays: lijst (png-pad, verticale-centerfractie)
    img = Image.open(base).convert("RGBA")
    W, H = img.size
    for path, frac in overlays:
        ov = Image.open(path).convert("RGBA")
        img.alpha_composite(ov, ((W - ov.width) // 2,
                                 int(H * float(frac)) - ov.height // 2))
    img.convert("RGB").save(out, "WEBP", quality=80, method=4)

cmd, a = sys.argv[1], sys.argv[2:]
if cmd == "label":
    make_label(a[0], a[1], int(a[2]), a[3], a[4], float(a[5]))
elif cmd == "strip":
    make_strip(a[0], int(a[1]), int(a[2]), int(a[3]), a[4], a[5], float(a[6]))
elif cmd == "marker":
    make_marker(a[0], int(a[1]), a[2])
elif cmd == "compose":
    out, base, rest = a[0], a[1], a[2:]
    compose_webp(out, base, [(rest[i], rest[i + 1]) for i in range(0, len(rest), 2)])
else:
    sys.exit("onbekend commando: " + cmd)
PYEOF

# ---------------------------------------------------------------------------
# Scene-definities per segment. Alles relatief aan iw/ih zodat dezelfde
# vormen op elk canvasformaat werken.
# ---------------------------------------------------------------------------

scheme_base() {
  case "$1" in
    dive) echo "$PAARS" ;;   # dive: overwegend paars
    *)    echo "$DONKER" ;;  # intro/binnen/hub: donker
  esac
}

scheme_shapes() {
  case "$1" in
    intro)
      # donker met paarse blobs, klein accentje
      echo "drawbox=x=iw*0.06:y=ih*0.55:w=iw*0.34:h=ih*0.30:color=${PAARS}@0.85:t=fill,drawbox=x=iw*0.55:y=ih*0.10:w=iw*0.30:h=ih*0.24:color=${LILA}@0.50:t=fill,drawbox=x=iw*0.72:y=ih*0.58:w=iw*0.18:h=ih*0.32:color=${PAARS}@0.45:t=fill,drawbox=x=iw*0.30:y=ih*0.18:w=iw*0.09:h=ih*0.14:color=${ACCENT}@0.30:t=fill,drawgrid=w=iw/12:h=ih/12:color=${LILA}@0.12:t=2"
      ;;
    dive)
      # paars dominant met donkere en lila vlakken
      echo "drawbox=x=iw*0.10:y=ih*0.12:w=iw*0.36:h=ih*0.36:color=${DONKER}@0.55:t=fill,drawbox=x=iw*0.58:y=ih*0.50:w=iw*0.30:h=ih*0.34:color=${LILA}@0.70:t=fill,drawbox=x=iw*0.44:y=ih*0.30:w=iw*0.14:h=ih*0.40:color=${PAARS}@0.90:t=fill,drawbox=x=iw*0.70:y=ih*0.12:w=iw*0.10:h=ih*0.16:color=${ACCENT}@0.40:t=fill,drawgrid=w=iw/10:h=ih/10:color=${ACCENT}@0.10:t=2"
      ;;
    binnen)
      # binnen-leg: accent geel-groen op donker
      echo "drawbox=x=iw*0.08:y=ih*0.60:w=iw*0.50:h=ih*0.10:color=${ACCENT}@0.80:t=fill,drawbox=x=iw*0.62:y=ih*0.15:w=iw*0.26:h=ih*0.55:color=${PAARS}@0.55:t=fill,drawbox=x=iw*0.15:y=ih*0.15:w=iw*0.12:h=ih*0.34:color=${LILA}@0.35:t=fill,drawbox=x=iw*0.40:y=ih*0.28:w=iw*0.10:h=ih*0.10:color=${ACCENT}@0.55:t=fill,drawgrid=w=iw/14:h=ih/14:color=${ACCENT}@0.14:t=2"
      ;;
    hub)
      # hub-overzicht: centraal paars blok, satellieten, accentpunt
      echo "drawbox=x=iw*0.32:y=ih*0.32:w=iw*0.36:h=ih*0.36:color=${PAARS}@0.75:t=fill,drawbox=x=iw*0.10:y=ih*0.10:w=iw*0.16:h=ih*0.22:color=${LILA}@0.45:t=fill,drawbox=x=iw*0.72:y=ih*0.66:w=iw*0.18:h=ih*0.24:color=${LILA}@0.45:t=fill,drawbox=x=iw*0.48:y=ih*0.46:w=iw*0.04:h=ih*0.08:color=${ACCENT}@0.90:t=fill,drawgrid=w=iw/12:h=ih/12:color=${LILA}@0.12:t=2"
      ;;
  esac
}

label_colors() {
  # "tekstkleur boxkleur boxalpha" (kale hex, voor Pillow) per schema,
  # voor directe segment-herkenning
  case "$1" in
    intro)  echo "FFFFFF 5B2D8E 0.75" ;;
    dive)   echo "0C0818 D8FE56 0.90" ;;
    binnen) echo "D8FE56 0C0818 0.70" ;;
    hub)    echo "FFFFFF 5B2D8E 0.75" ;;
  esac
}

camera_expr() {
  # "z|x|y" zoompan-expressies; FR wordt vervangen door het aantal frames
  case "$1" in
    intro)  echo "1.10+0.45*on/FR|(iw-iw/zoom)*on/FR|(ih-ih/zoom)*(0.5+0.15*sin(on/30))" ;;
    dive)   echo "1.05+0.85*on/FR|(iw-iw/zoom)*0.5|(ih-ih/zoom)*on/FR" ;;
    binnen) echo "1.28+0.12*sin(on/40)|(iw-iw/zoom)*on/FR|(ih-ih/zoom)*0.35" ;;
  esac
}

# ---------------------------------------------------------------------------
# make_clip OUT W H DUR LABEL SCHEMA GOP CRF
# Bouwt eerst een scene-still op 2x doelresolutie en vliegt daar met
# zoompan overheen (camerabeweging). Daarna overlays: label, secondeteller,
# bewegend accent-blokje. Encode volgens scrub-profiel.
# ---------------------------------------------------------------------------
make_clip() {
  local out="$1" w="$2" h="$3" dur="$4" label="$5" scheme="$6" gop="$7" crf="$8"
  local frames=$((dur * FPS))
  local cw=$((w * 2)) ch=$((h * 2))
  local label_fs=$((w / 9)) timer_fs=$((w / 14)) marker_px=$((w / 24))
  local base shapes scene labelpng strip marker cam zz zx zy fc bc ba filter

  base="$(scheme_base "$scheme")"
  shapes="$(scheme_shapes "$scheme")"
  scene="$TMP/scene-${scheme}-${w}x${h}.png"
  labelpng="$TMP/label-${scheme}-${w}.png"
  strip="$TMP/strip-${dur}s-${w}x${h}.png"
  marker="$TMP/marker-${w}.png"

  # 1. scene-still op dubbele resolutie zodat zoompan scherp blijft
  ffmpeg -hide_banner -loglevel error -y \
    -f lavfi -i "color=c=${base}:s=${cw}x${ch}" \
    -vf "$shapes" -frames:v 1 "$scene"

  # 2. tekst- en markerlagen (Pillow)
  set -- $(label_colors "$scheme")
  fc="$1"; bc="$2"; ba="$3"
  "$PY" "$PYHELPER" label "$labelpng" "$label" "$label_fs" "$fc" "$bc" "$ba"
  "$PY" "$PYHELPER" strip "$strip" "$h" $((dur + 1)) "$timer_fs" FFFFFF 0C0818 0.60
  "$PY" "$PYHELPER" marker "$marker" "$marker_px" D8FE56

  # 3. camerabeweging per segment
  cam="$(camera_expr "$scheme")"
  zz="$(echo "$cam" | cut -d'|' -f1)"; zz="${zz//FR/$frames}"
  zx="$(echo "$cam" | cut -d'|' -f2)"; zx="${zx//FR/$frames}"
  zy="$(echo "$cam" | cut -d'|' -f3)"; zy="${zy//FR/$frames}"

  # 4. composiet + encode
  #    - secondeteller: strip met cellen van framehoogte schuift per
  #      seconde 1 cel omhoog (floor(t)*H), altijd 1 getal in beeld
  #    - marker: beweegt elke frame, dus scrubrichting is direct zichtbaar
  filter="[0:v]zoompan=z='${zz}':x='${zx}':y='${zy}':d=${frames}:s=${w}x${h}:fps=${FPS}[bg]"
  filter="$filter;[bg][1:v]overlay=x='(W-w)/2':y='H*0.30-h/2'[v1]"
  filter="$filter;[v1][2:v]overlay=x='(W-w)/2':y='H*0.08-floor(t)*H'[v2]"
  filter="$filter;[v2][3:v]overlay=x='(W-w)*t/${dur}':y='H-h-H*0.03',format=yuv420p[v]"

  ffmpeg -hide_banner -loglevel error -y \
    -i "$scene" -i "$labelpng" -i "$strip" -i "$marker" \
    -filter_complex "$filter" -map "[v]" \
    -frames:v "$frames" -an \
    -c:v libx264 -preset fast -crf "$crf" -pix_fmt yuv420p \
    -g "$gop" -keyint_min "$gop" -sc_threshold 0 \
    -movflags +faststart \
    "$out"
  echo "  klaar: ${out#$ROOT/} (${w}x${h}, ${dur}s, g=${gop}, crf=${crf})"
}

# ---------------------------------------------------------------------------
# make_still OUT W H LABEL SCHEMA
# Rendert de scene direct op doelresolutie (ffmpeg, png), composit label en
# subtitel eroverheen en schrijft webp (Pillow, q80).
# ---------------------------------------------------------------------------
make_still() {
  local out="$1" w="$2" h="$3" label="$4" scheme="$5"
  local label_fs=$((w / 9)) sub_fs=$((w / 24))
  local stem base shapes basepng labelpng subpng fc bc ba

  stem="$(basename "$out" .webp)"
  base="$(scheme_base "$scheme")"
  shapes="$(scheme_shapes "$scheme")"
  basepng="$TMP/stillbase-${stem}.png"
  labelpng="$TMP/stilllabel-${stem}.png"
  subpng="$TMP/stillsub-${stem}.png"

  ffmpeg -hide_banner -loglevel error -y \
    -f lavfi -i "color=c=${base}:s=${w}x${h}" \
    -vf "$shapes" -frames:v 1 "$basepng"

  set -- $(label_colors "$scheme")
  fc="$1"; bc="$2"; ba="$3"
  "$PY" "$PYHELPER" label "$labelpng" "$label" "$label_fs" "$fc" "$bc" "$ba"
  "$PY" "$PYHELPER" label "$subpng" "PLACEHOLDER ${w}x${h}" "$sub_fs" FFFFFF 0C0818 0.60
  "$PY" "$PYHELPER" compose "$out" "$basepng" "$labelpng" 0.44 "$subpng" 0.58
  echo "  klaar: ${out#$ROOT/} (${w}x${h})"
}

# ---------------------------------------------------------------------------
# Genereren
# ---------------------------------------------------------------------------

echo "== video's (desktop 1920x1080 g8 crf20, mobiel 720x1280 g4 crf23) =="
make_clip "$VID/intro.mp4"        1920 1080  6 "INTRO"        intro  8 20
make_clip "$VID/intro-m.mp4"       720 1280  6 "INTRO"        intro  4 23
make_clip "$VID/dive-train.mp4"   1920 1080  8 "DIVE TRAIN"   dive   8 20
make_clip "$VID/dive-train-m.mp4"  720 1280  8 "DIVE TRAIN"   dive   4 23
make_clip "$VID/leg-train.mp4"    1920 1080 10 "TRAIN BINNEN" binnen 8 20
make_clip "$VID/leg-train-m.mp4"   720 1280 10 "TRAIN BINNEN" binnen 4 23

echo "== stills (webp) =="
make_still "$OUT/hub.webp"            1536 1024 "HUB"          hub
make_still "$OUT/hub-m.webp"           720 1280 "HUB"          hub
make_still "$OUT/train-binnen.webp"   1536 1024 "TRAIN BINNEN" binnen
make_still "$OUT/train-binnen-m.webp"  720 1280 "TRAIN BINNEN" binnen

# ---------------------------------------------------------------------------
# Verificatie
# ---------------------------------------------------------------------------

echo "== verificatie (ffprobe) =="
for f in "$VID/intro.mp4" "$VID/intro-m.mp4" "$VID/dive-train.mp4" \
         "$VID/dive-train-m.mp4" "$VID/leg-train.mp4" "$VID/leg-train-m.mp4"; do
  info="$(ffprobe -v error -select_streams v:0 \
    -show_entries stream=width,height -show_entries format=duration \
    -of csv=p=0 "$f" | tr '\n' ' ')"
  echo "  ${f#$ROOT/}: $info"
done
for f in "$OUT/hub.webp" "$OUT/hub-m.webp" \
         "$OUT/train-binnen.webp" "$OUT/train-binnen-m.webp"; do
  info="$(ffprobe -v error -select_streams v:0 \
    -show_entries stream=width,height -of csv=p=0 "$f")"
  echo "  ${f#$ROOT/}: $info"
done

echo "Alle placeholder-assets staan in ${OUT#$ROOT/}/"
