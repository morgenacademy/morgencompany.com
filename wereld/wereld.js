/* ============================================================
   Morgen-wereld (PoC), state-machine: intro -> hub -> dive -> verhaal -> hub
   Losstaande pagina, geen SPA-integratie met de 7-bundle site.
   ============================================================ */

/* ---- HOTSPOTS: posities als percentage van het scherm. ----
   x/y = desktop, xm/ym = mobiel (optioneel, valt terug op x/y).
   Pas deze getallen aan zodra de echte hub-still er is. */
const HOTSPOTS = [
  { id: 'train',     label: 'Train',     x: 22, y: 34, xm: 22, ym: 39, enabled: true },
  { id: 'implement', label: 'Implement', x: 44, y: 24, xm: 44, ym: 36, enabled: true },
  { id: 'build',     label: 'Build',     x: 69, y: 26, xm: 69, ym: 37, enabled: true },
  { id: 'inspire',   label: 'Inspire',   x: 77, y: 55, xm: 77, ym: 47, enabled: true },
];

/* ---- Assetcontract (relatief aan /wereld/) ----
   Mobiele mp4's wijzen tijdelijk naar de desktopclips totdat de natieve
   9:16-keten gegenereerd is; de engine en cine-player croppen cover. */
const ASSETS = {
  hub:    'assets/echt/hub.webp',
  hubM:   'assets/echt/hub-m.webp',
  intro:  'assets/echt/vid/intro.mp4',
  introM: 'assets/echt/vid/intro.mp4',
};

/* ---- Per gebouw: assets, engine-sectie-copy en eindpaneel. ----
   Copy komt letterlijk van de bronpagina's (/academy/, /consultancy/,
   /technology/, /inspiratie/). Ontbrekende video's vallen gracieus door:
   de cine-player en de scrub-engine vangen laadfouten zelf op. */
const GEBOUWEN = {
  train: {
    label: 'Train',
    dive:   'assets/echt/vid/dive-train.mp4',
    diveM:  'assets/echt/vid/dive-train.mp4',
    leg:    'assets/echt/vid/leg-train.mp4',
    legM:   'assets/echt/vid/leg-train.mp4',
    still:  'assets/echt/train-binnen.webp',
    stillM: 'assets/echt/train-binnen-m.webp',
    cta: { label: 'Bekijk alle trainingen', href: '/academy/' },
    sectie: {
      eyebrow: 'Train',
      title: 'Klein beginnen. Groot doorpakken.',
      body: 'Van je eerste prompt tot echt meer uit Claude Code, Codex of n8n halen en het integreren in de werkwijze van je team.',
      tags: ['Basistraining AI', 'Bouwen met AI (vibecoding)', 'Automatiseren met AI', 'Claude Code / Codex: de basis'],
    },
    einde: {
      titel: 'De leerlijn',
      items: [
        { kop: 'Basistraining AI', tekst: 'Van “waar moet ik beginnen?” naar: dit kan ik gewoon' },
        { kop: 'Bouwen met AI (vibecoding)', tekst: 'Bouw in no time je eerste site, app of tool' },
        { kop: 'Automatiseren met AI', tekst: 'Laat processen slimmer, sneller en beter lopen' },
        { kop: 'Claude Code / Codex: de basis', tekst: 'Van losse chats naar een AI-collega die meewerkt' },
      ],
    },
  },
  implement: {
    label: 'Implement',
    dive:   'assets/echt/vid/dive-implement.mp4',
    diveM:  'assets/echt/vid/dive-implement.mp4',
    leg:    'assets/echt/vid/leg-implement.mp4',
    legM:   'assets/echt/vid/leg-implement.mp4',
    still:  'assets/echt/implement-binnen.webp',
    stillM: 'assets/echt/implement-binnen.webp',
    cta: { label: 'Bekijk consultancy', href: '/consultancy/' },
    sectie: {
      eyebrow: 'Implement',
      title: 'Digitalisering die landt in het werk.',
      body: 'Morgen helpt om de echte keuzes scherp te maken en te vertalen naar een aanpak die past bij de strategie én bij het dagelijkse werk.',
      tags: ['Strategie', 'Uitvoering', 'Borging'],
    },
    einde: {
      titel: 'Van inzicht naar praktijk',
      items: [
        { kop: 'Zien wat er speelt', tekst: 'We brengen in kaart wat er al gebeurt, waar energie ontstaat en waar processen, afspraken of systemen knellen' },
        { kop: 'Keuzes scherp maken', tekst: 'Wat gebruik je wel, wat niet, wie is eigenaar en welke kaders zijn nodig?' },
        { kop: 'Werken met het team', tekst: 'We werken met de mensen die het straks gebruiken' },
        { kop: 'Vast ritme', tekst: 'De aanpak krijgt plek in overleg, besluitvorming en dagelijkse werkwijze' },
      ],
    },
  },
  build: {
    label: 'Build',
    dive:   'assets/echt/vid/dive-build.mp4',
    diveM:  'assets/echt/vid/dive-build.mp4',
    leg:    'assets/echt/vid/leg-build.mp4',
    legM:   'assets/echt/vid/leg-build.mp4',
    still:  'assets/echt/build-binnen.webp',
    stillM: 'assets/echt/build-binnen.webp',
    cta: { label: 'Bekijk technology', href: '/technology/' },
    sectie: {
      eyebrow: 'Build',
      title: 'Werk slimmer georganiseerd.',
      body: 'We bouwen slimme applicaties, workflows en koppelingen die passen in het werk dat er al is.',
      tags: ['Maatwerk', 'AI-workflows', 'Procesautomatisering'],
    },
    einde: {
      titel: 'Zij gingen je voor',
      items: [
        { kop: 'Trappenfabriek Vermeulen', tekst: 'Logistieke AI-planning voor een trappenfabriek' },
        { kop: 'Solo Solis', tekst: 'Van 40+ handmatige stappen naar maximaal 6 controles' },
        { kop: 'PinkRoccade Local Government', tekst: 'Workshops over n8n, automatiseren met AI en agentic workflows' },
        { kop: 'Gemeente Tilburg', tekst: 'Waardegedreven AI en procesdenken' },
      ],
    },
  },
  inspire: {
    label: 'Inspire',
    dive:   'assets/echt/vid/dive-inspire.mp4',
    diveM:  'assets/echt/vid/dive-inspire.mp4',
    leg:    'assets/echt/vid/leg-inspire.mp4',
    legM:   'assets/echt/vid/leg-inspire.mp4',
    still:  'assets/echt/inspire-binnen.webp',
    stillM: 'assets/echt/inspire-binnen.webp',
    cta: { label: 'Bekijk inspiratie', href: '/inspiratie/' },
    sectie: {
      eyebrow: 'Inspire',
      title: 'Technologie verandert hoe we werken en leven.',
      body: 'Keynotes, podcast, artikelen en boek: scherp, persoonlijk en gemaakt om het gesprek in beweging te zetten.',
      tags: ['Keynotes', 'Podcast', 'Artikelen', 'Boek'],
    },
    einde: {
      titel: 'Verder verdiepen',
      items: [
        { kop: 'Keynotes', tekst: 'Voor events, directiedagen en teams die technologie willen duiden' },
        { kop: 'Podcast: How to get the work done (with AI)', tekst: 'Over slimmer werken in het MKB: direct merkbaar in tijd, kosten en rust' },
        { kop: 'Artikelen', tekst: 'Lezen op eigen tempo: besluitvorming, menselijkheid en leiderschap' },
        { kop: 'Boek: De Digitale Collega', tekst: 'AI als teamlid in jouw organisatie' },
      ],
    },
  },
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
const worldEl = document.getElementById('world');
const eindePaneel = document.getElementById('verhaal-einde');
const eindeEyebrow = document.getElementById('einde-eyebrow');
const eindeTitel = document.getElementById('einde-titel');
const eindeLijst = document.getElementById('einde-lijst');
const eindeCta = document.getElementById('einde-cta');
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

/* ---------- Binnen-verhalen (scrub-engine, 1 sectie per gebouw) ----------
   Elke engine-mount is permanent (de engine kent geen unmount), dus we
   mounten per gebouw precies één keer in een eigen host-div en togglen
   daarna alleen display. Terug naar de hub en opnieuw klikken hergebruikt
   de bestaande mount: geen dubbele mounts, geen lek. */
const worldHosts = {};   // gebouwId -> host-element met gemounte engine

function mountWorld(gebouwId) {
  if (worldHosts[gebouwId]) return;
  const g = GEBOUWEN[gebouwId];
  const host = document.createElement('div');
  host.id = 'world-' + gebouwId;
  host.style.display = 'none';
  worldEl.appendChild(host);
  worldHosts[gebouwId] = host;
  mountScrollWorld(host, {
    nav: false,
    hint: 'Scroll om rond te kijken',
    sections: [
      {
        id: gebouwId,
        label: g.label,
        still: g.still,
        stillMobile: g.stillM,
        clip: g.leg,
        clipMobile: g.legM,
        accent: '#D8FE56',
        scroll: 2.4,
        linger: 0.45,
        eyebrow: g.sectie.eyebrow,
        title: g.sectie.title,
        body: g.sectie.body,
        tags: g.sectie.tags,
        cta: {
          primary: { label: g.cta.label, href: g.cta.href },
          secondary: { label: 'Terug naar het plein', href: '#plein' },
        },
      },
    ],
    connectors: [],
  });
}

function toonWorld(gebouwId) {
  Object.keys(worldHosts).forEach((k) => {
    worldHosts[k].style.display = (k === gebouwId) ? '' : 'none';
  });
}

/* ---------- Generiek eindpaneel, per gebouw gevuld ---------- */
function escHtml(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function vulEinde(gebouwId) {
  const g = GEBOUWEN[gebouwId];
  eindePaneel.setAttribute('aria-label', 'Einde van het ' + g.label + '-verhaal');
  eindeEyebrow.textContent = g.label;
  eindeTitel.textContent = g.einde.titel;
  eindeLijst.innerHTML = g.einde.items
    .map((it) => '<li><strong>' + escHtml(it.kop) + '</strong><span>' + escHtml(it.tekst) + '</span></li>')
    .join('');
  eindeCta.textContent = g.cta.label;
  eindeCta.href = g.cta.href;
}

/* ---------- State-machine ---------- */
let huidigGebouw = null;

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

function startDive(gebouwId) {
  huidigGebouw = gebouwId;
  mountWorld(gebouwId);           // laadt het binnen-verhaal alvast tijdens de dive
  toonWorld(gebouwId);
  vulEinde(gebouwId);
  if (reduce) { toVerhaal(gebouwId); return; }
  const g = GEBOUWEN[gebouwId];
  setState('dive');
  playCine(g.dive, g.diveM, () => toVerhaal(gebouwId));
}

function toVerhaal(gebouwId) {
  if (gebouwId) {
    huidigGebouw = gebouwId;
    mountWorld(gebouwId);         // idempotent: bestaande mount wordt hergebruikt
    toonWorld(gebouwId);
    vulEinde(gebouwId);
  }
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
