/* ============================================================
   Morgen-wereld (PoC), state-machine: intro -> hub -> dive -> verhaal -> hub
   Losstaande pagina, geen SPA-integratie met de 7-bundle site.
   ============================================================ */

/* ---- HOTSPOTS: posities als percentage van het scherm. ----
   x/y = desktop, xm/ym = mobiel (optioneel, valt terug op x/y).
   Pas deze getallen aan zodra de echte hub-still er is. */
const HOTSPOTS = [
  { id: 'train',     label: 'Train',     x: 28, y: 58, xm: 30, ym: 42, enabled: true  },
  { id: 'implement', label: 'Implement', x: 50, y: 40, xm: 62, ym: 30, enabled: false },
  { id: 'build',     label: 'Build',     x: 72, y: 54, xm: 58, ym: 58, enabled: false },
  { id: 'inspire',   label: 'Inspire',   x: 46, y: 76, xm: 34, ym: 72, enabled: false },
];

/* ---- Assetcontract (relatief aan /wereld/) ---- */
const ASSETS = {
  hub:         'assets/placeholder/hub.webp',
  hubM:        'assets/placeholder/hub-m.webp',
  trainStill:  'assets/placeholder/train-binnen.webp',
  trainStillM: 'assets/placeholder/train-binnen-m.webp',
  intro:       'assets/placeholder/vid/intro.mp4',
  introM:      'assets/placeholder/vid/intro-m.mp4',
  diveTrain:   'assets/placeholder/vid/dive-train.mp4',
  diveTrainM:  'assets/placeholder/vid/dive-train-m.mp4',
  legTrain:    'assets/placeholder/vid/leg-train.mp4',
  legTrainM:   'assets/placeholder/vid/leg-train-m.mp4',
};

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
const isMobile = () => coarse || window.innerWidth <= 860;

const hubEl = document.getElementById('hub');
const hubStill = document.getElementById('hub-still');
const hotspotLayer = document.getElementById('hotspots');
const cine = document.getElementById('cine');
const cineVideo = document.getElementById('cine-video');
const skipKnop = document.getElementById('skip-intro');
const exitKnop = document.getElementById('exit-verhaal');
const eindePaneel = document.getElementById('verhaal-einde');
const eindeTerug = document.getElementById('einde-terug');

/* ---------- Cinematics: 1 hergebruikt video-element ---------- */
let cineDone = null;

function playCine(desktopSrc, mobileSrc, done) {
  cineDone = done;
  cine.classList.remove('is-playing');
  cineVideo.src = isMobile() ? mobileSrc : desktopSrc;
  cineVideo.load();
  const p = cineVideo.play();
  if (p && p.catch) p.catch(() => finishCine());   // autoplay geweigerd: door naar de volgende state
}

function finishCine() {
  const f = cineDone;
  cineDone = null;
  if (f) f();
}

function stopCine() {
  cineDone = null;
  try { cineVideo.pause(); } catch (e) {}
  cine.classList.remove('is-playing');
  cineVideo.removeAttribute('src');
  cineVideo.load();   // geeft decoder en geheugen vrij, voorkomt dubbel afspelen
}

cineVideo.addEventListener('playing', () => cine.classList.add('is-playing'));
cineVideo.addEventListener('ended', finishCine);
cineVideo.addEventListener('error', () => finishCine());   // asset ontbreekt of kapot: flow gaat door

/* ---------- Binnen-verhaal (scrub-engine, 1 sectie) ---------- */
let worldMounted = false;

function mountWorldOnce() {
  if (worldMounted) return;
  worldMounted = true;
  mountScrollWorld(document.getElementById('world'), {
    nav: false,
    hint: 'Scroll om rond te kijken',
    sections: [
      {
        id: 'train',
        label: 'Train',
        still: ASSETS.trainStill,
        stillMobile: ASSETS.trainStillM,
        clip: ASSETS.legTrain,
        clipMobile: ASSETS.legTrainM,
        accent: '#D8FE56',
        scroll: 2.4,
        linger: 0.45,
        eyebrow: 'Train',
        title: 'Klein beginnen. Groot doorpakken.',
        body: 'Van je eerste prompt tot echt meer uit Claude Code, Codex of n8n halen en het integreren in de werkwijze van je team.',
        tags: ['Basistraining AI', 'Bouwen met AI (vibecoding)', 'Automatiseren met AI', 'Claude Code / Codex: de basis'],
        cta: {
          primary: { label: 'Bekijk alle trainingen', href: '/academy/' },
          secondary: { label: 'Terug naar het plein', href: '#plein' },
        },
      },
    ],
    connectors: [],
  });
}

/* ---------- State-machine ---------- */
function setState(s) { document.body.dataset.state = s; }

function startIntro() {
  setState('intro');
  playCine(ASSETS.intro, ASSETS.introM, toHub);
}

function toHub() {
  stopCine();
  setState('hub');
  window.scrollTo(0, 0);
  hubEl.focus({ preventScroll: true });
}

function startDive() {
  mountWorldOnce();               // laadt het binnen-verhaal alvast tijdens de dive
  if (reduce) { toVerhaal(); return; }
  setState('dive');
  playCine(ASSETS.diveTrain, ASSETS.diveTrainM, toVerhaal);
}

function toVerhaal() {
  stopCine();
  setState('verhaal');
  window.scrollTo(0, 0);
  eindePaneel.classList.remove('is-zichtbaar');
  // Engine-layout verversen nu de container zichtbaar is
  window.dispatchEvent(new Event('orientationchange'));
}

/* ---------- Hub opbouwen ---------- */
hubStill.src = isMobile() ? ASSETS.hubM : ASSETS.hub;
hubStill.addEventListener('error', () => { hubStill.style.visibility = 'hidden'; });   // placeholder ontbreekt: donkere gradient blijft

HOTSPOTS.forEach((h) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'hotspot' + (h.enabled ? '' : ' is-disabled');
  const x = (isMobile() && h.xm != null) ? h.xm : h.x;
  const y = (isMobile() && h.ym != null) ? h.ym : h.y;
  b.style.left = x + '%';
  b.style.top = y + '%';
  b.setAttribute('aria-label', h.enabled ? 'Open ' + h.label : h.label + ', binnenkort beschikbaar');
  if (!h.enabled) b.setAttribute('aria-disabled', 'true');
  b.innerHTML =
    '<span class="hotspot-dot" aria-hidden="true"></span>' +
    '<span class="hotspot-label">' + h.label + '</span>' +
    (h.enabled ? '' : '<span class="hotspot-badge">binnenkort</span>');
  b.addEventListener('click', () => { if (h.enabled) startDive(h.id); });
  hotspotLayer.appendChild(b);
});

/* ---------- Exits ---------- */
skipKnop.addEventListener('click', toHub);
exitKnop.addEventListener('click', toHub);
eindeTerug.addEventListener('click', toHub);

// De engine rendert de secundaire CTA als <a href="#plein">: onderschep die klik.
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href="#plein"]');
  if (a) { e.preventDefault(); toHub(); }
});

/* ---------- Eind-paneel: tonen tegen het einde van de sectie ---------- */
window.addEventListener('scroll', () => {
  if (document.body.dataset.state !== 'verhaal') return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const p = max > 0 ? window.scrollY / max : 0;
  eindePaneel.classList.toggle('is-zichtbaar', p > 0.72);
}, { passive: true });

/* ---------- Start ---------- */
if (reduce) {
  toHub();          // reduced motion: intro volledig overslaan
} else {
  startIntro();
}
