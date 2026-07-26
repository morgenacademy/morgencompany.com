/* ============================================================
   Morgen-wereld (PoC), state-machine: intro -> hub -> dive -> verhaal -> hub
   Losstaande pagina, geen SPA-integratie met de 7-bundle site.
   ============================================================ */

/* ---- HOTSPOTS: posities als percentage van het scherm. ----
   x/y = desktop, xm/ym = mobiel (optioneel, valt terug op x/y).
   Pas deze getallen aan zodra de echte hub-still er is. */
const HOTSPOTS = [
  { id: 'train',     label: 'Trainingen',     x: 22, y: 34, xm: 22, ym: 39, enabled: true },
  { id: 'implement', label: 'Implementatie', x: 44, y: 24, xm: 41, ym: 34, enabled: true },
  { id: 'build',     label: 'AI-oplossingen', x: 69, y: 26, xm: 72, ym: 38, enabled: true },
  { id: 'inspire',   label: 'Inspiratie',   x: 77, y: 55, xm: 77, ym: 47, enabled: true },
  // Plein-plekken, secundair (sub): stolpen-tuin en kampvuur openen een
  // still-binnenwereld (geen dive), de wegwijzer linkt naar het Kompas op de site.
  { id: 'projecten', label: 'Projecten',     x: 27, y: 51, xm: 27, ym: 52, enabled: true, sub: true },
  { id: 'overons',   label: 'Over Morgen.',  x: 70, y: 67, xm: 71, ym: 62, enabled: true, sub: true },
  { id: 'kompas',    label: 'Wegwijzer',     x: 52, y: 47, xm: 52, ym: 50, enabled: true, sub: true, kompas: true },
];

/* ---- Klikvlakken op de hub-still. ----
   De SVG gebruikt exact dezelfde bronverhouding en cover-uitsnede als de still.
   Daardoor volgen de transparante klikvlakken de gebouwen, ook als het scherm
   breder of smaller wordt. De vlakken raken elkaar bewust niet. */
const HOTSPOT_MAPS = {
  desktop: {
    viewBox: '0 0 1112 834',
    paths: {
      train: 'M132 185 324 165 398 213 403 330 371 374 205 395 137 354 113 272Z',
      implement: 'M338 131 530 124 607 170 603 278 554 326 425 328 405 291 406 211Z',
      build: 'M646 113 826 117 882 190 880 309 850 347 693 349 626 296 624 188Z',
      inspire: 'M757 369 888 351 984 377 1012 468 978 524 831 531 717 482 710 399Z',
      projecten: 'M73 414 181 401 395 407 420 450 413 505 376 560 197 600 94 541 68 468Z',
      kompas: 'M433 350 544 333 686 371 702 442 645 518 505 525 435 471 424 394Z',
      overons: 'M657 542 763 529 927 540 977 595 927 654 750 675 645 612Z',
    },
  },
  mobile: {
    viewBox: '0 0 720 1280',
    paths: {
      train: 'M128 424 218 405 281 438 282 497 258 540 154 548 111 521 109 466Z',
      implement: 'M246 400 360 396 400 426 397 484 370 517 295 520 284 490 283 435Z',
      build: 'M418 394 522 396 561 438 556 494 533 523 447 525 406 494 402 434Z',
      inspire: 'M570 510 626 528 657 577 640 625 589 647 537 653 465 613 465 568 503 540Z',
      projecten: 'M61 556 124 552 266 563 273 585 267 628 250 669 137 684 72 646 48 588Z',
      kompas: 'M292 535 356 528 448 542 452 582 432 628 337 646 277 610 276 554Z',
      overons: 'M426 670 495 658 607 665 651 690 625 735 540 760 462 755 411 710Z',
    },
  },
};

/* ---- Assetcontract onder /wereld/.
   De mobiele mp4's zijn lichter en volgen dezelfde verticale cover-uitsnede
   die voorheen in de browser op de desktopclips werd toegepast. */
const ASSETS = {
  hub:     '/wereld/assets/echt/hub.webp',
  hubM:    '/wereld/assets/echt/hub-m.webp',
  intro:   '/wereld/assets/echt/vid/intro.mp4',
  introM:  '/wereld/assets/echt/vid/intro-m.mp4',
  poster:  '/wereld/assets/echt/intro-poster.jpg',
  posterM: '/wereld/assets/echt/intro-poster-m.jpg',
};

/* De bestaande keynote-montage, opnieuw gecodeerd voor de wereld.
   De gewone pagina behoudt het 1080p-bronbestand; deze lichtere varianten
   worden alleen geladen zodra iemand Inspire daadwerkelijk opent. */
const INSPIRE_ECHT = {
  video:  '/wereld/assets/echt/vid/inspire-keynote.mp4',
  videoM: '/wereld/assets/echt/vid/inspire-keynote-m.mp4',
  poster: '/docs/company/film-poster.jpg',
};

/* ---- Per gebouw: assets, engine-sectie-copy en eindpaneel. ----
   Copy komt letterlijk van de bronpagina's (/academy/, /consultancy/,
   /technology/, /inspiratie/). Ontbrekende video's vallen gracieus door:
   de cine-player en de scrub-engine vangen laadfouten zelf op. */
const GEBOUWEN = {
  train: {
    label: 'Trainingen',
    dive:   '/wereld/assets/echt/vid/dive-train.mp4',
    diveM:  '/wereld/assets/echt/vid/dive-train-m.mp4',
    leg:    '/wereld/assets/echt/vid/leg-train.mp4',
    legM:   '/wereld/assets/echt/vid/leg-train-m.mp4',
    still:  '/wereld/assets/echt/train-binnen.webp',
    stillM: '/wereld/assets/echt/train-binnen-m.webp',
    cta: { label: 'Bekijk alle trainingen', href: '/academy/' },
    cta2: { label: 'Wegwijzer', action: 'kompas' },
    sectie: {
      eyebrow: 'Trainingen',
      title: 'Klein beginnen. Groot doorpakken.',
      body: 'Van je eerste prompt tot echt meer uit Claude Code, Codex of n8n halen en het integreren in de werkwijze van je team.',
      tags: ['Basistraining AI', 'Bouwen met AI (vibecoding)', 'Automatiseren met AI', 'Claude Code / Codex: de basis'],
    },
    einde: {
      titel: 'Alle trainingen',
      items: [
        { kop: 'Basistraining AI', tekst: 'Van “waar begin ik?” naar: dit kan ik gewoon', href: '/academy/#ac-trainingen' },
        { kop: 'Bouwen met AI (vibecoding)', tekst: 'Bouw in no time je eerste site, app of tool', href: '/academy/#ac-trainingen' },
        { kop: 'Automatiseren met AI', tekst: 'Processen slimmer laten lopen met n8n', href: '/academy/#ac-trainingen' },
        { kop: 'Claude Code / Codex: de basis', tekst: 'Van losse chats naar een AI-collega die meewerkt', href: '/academy/#ac-trainingen' },
        { kop: 'Haal meer uit Claude Code', tekst: 'Voor teams die al met Claude Code werken', href: '/academy/#ac-trainingen' },
        { kop: 'Keynotes & kick-offs', tekst: 'Energie, richting en urgentie losmaken', href: '/academy/#ac-verdiepen' },
        { kop: 'AI-richtingssessie', tekst: 'Samen bepalen welke route logisch is', href: '/academy/#ac-verdiepen' },
        { kop: 'Team-workshop', tekst: 'Kiezen welk proces slimmer kan', href: '/academy/#ac-verdiepen' },
        { kop: 'Mini masterclass AI in management', tekst: 'AI in sturing, besluitvorming en praktijk', href: '/academy/#ac-verdiepen' },
        { kop: 'Projectmanagement met AI', tekst: 'Nieuwe kijk op projecten organiseren', href: '/academy/#ac-verdiepen' },
        { kop: 'AI Implementatie Masterclass', tekst: '4-daagse deep dive: van kennis naar landen', href: '/academy/#ac-verdiepen' },
        { kop: 'Begeleid implementatietraject', tekst: 'Van eerste sessie naar borging en opschaling', href: '/academy/#ac-verdiepen' },
      ],
    },
  },
  implement: {
    label: 'Implementatie',
    dive:   '/wereld/assets/echt/vid/dive-implement.mp4',
    diveM:  '/wereld/assets/echt/vid/dive-implement-m.mp4',
    leg:    '/wereld/assets/echt/vid/leg-implement.mp4',
    legM:   '/wereld/assets/echt/vid/leg-implement-m.mp4',
    still:  '/wereld/assets/echt/implement-binnen.webp',
    stillM: '/wereld/assets/echt/implement-binnen.webp',
    cta: { label: 'Bekijk consultancy', href: '/consultancy/' },
    sectie: {
      eyebrow: 'Implementatie',
      title: 'Digitalisering die landt in het werk.',
      body: 'Morgen helpt om de echte keuzes scherp te maken en te vertalen naar een aanpak die past bij de strategie én bij het dagelijkse werk.',
      tags: ['Strategie', 'Uitvoering', 'Borging'],
    },
    einde: {
      titel: 'Van inzicht naar praktijk',
      items: [
        { kop: 'Zien wat er speelt', tekst: 'We brengen in kaart wat er al gebeurt, waar energie ontstaat en waar processen, afspraken of systemen knellen', href: '/consultancy/#co-aanpak' },
        { kop: 'Keuzes scherp maken', tekst: 'Wat gebruik je wel, wat niet, wie is eigenaar en welke kaders zijn nodig?', href: '/consultancy/#co-aanpak' },
        { kop: 'Werken met het team', tekst: 'We werken met de mensen die het straks gebruiken', href: '/consultancy/#co-aanpak' },
        { kop: 'Vast ritme', tekst: 'De aanpak krijgt plek in overleg, besluitvorming en dagelijkse werkwijze', href: '/consultancy/#co-aanpak' },
      ],
    },
  },
  build: {
    label: 'AI-oplossingen',
    dive:   '/wereld/assets/echt/vid/dive-build.mp4',
    diveM:  '/wereld/assets/echt/vid/dive-build-m.mp4',
    leg:    '/wereld/assets/echt/vid/leg-build.mp4',
    legM:   '/wereld/assets/echt/vid/leg-build-m.mp4',
    still:  '/wereld/assets/echt/build-binnen.webp',
    stillM: '/wereld/assets/echt/build-binnen.webp',
    cta: { label: 'Bekijk jouw AI-oplossing', href: '/technology/' },
    sectie: {
      eyebrow: 'AI-oplossingen',
      title: 'Werk slimmer georganiseerd.',
      body: 'We bouwen slimme maatwerkapplicaties, workflows en koppelingen die passen in het werk dat er al is.',
      tags: ['Maatwerk', 'AI-workflows', 'Procesautomatisering'],
    },
    einde: {
      titel: 'Wat we bouwen',
      items: [
        { kop: 'Proces eerst', tekst: 'Eerst scherp krijgen welk werk beter kan en waar technologie waarde toevoegt', href: '/technology/#te-aanpak' },
        { kop: 'Slim koppelen', tekst: 'Bestaande tools, data en systemen gebruiken waar dat logisch is', href: '/technology/#te-aanpak' },
        { kop: 'Op maat', tekst: 'Workflows, applicaties en koppelingen rond het echte proces', href: '/technology/#te-aanpak' },
        { kop: 'In het werk', tekst: 'De oplossing landt in team, proces en werkwijze', href: '/technology/#te-aanpak' },
      ],
    },
  },
  inspire: {
    label: 'Inspiratie',
    dive:   '/wereld/assets/echt/vid/dive-inspire.mp4',
    diveM:  '/wereld/assets/echt/vid/dive-inspire-m.mp4',
    // Na de dive neemt de echte keynote-laag het over. Een frame uit de
    // oorspronkelijke podiumclip bewaart de compositie zonder tweede video.
    leg:    null,
    legM:   null,
    still:  '/wereld/assets/echt/inspire-podium.jpg',
    stillM: '/wereld/assets/echt/inspire-podium-m.jpg',
    cta: { label: 'Bekijk inspiratie', href: '/inspiratie/' },
    sectie: {
      eyebrow: 'Inspiratie',
      title: 'Technologie verandert hoe we werken en leven.',
      body: 'Keynotes, podcast, artikelen en boek: scherp, persoonlijk en gemaakt om het gesprek in beweging te zetten.',
      tags: ['Keynotes', 'Podcast', 'Artikelen', 'Boek'],
    },
    einde: {
      titel: 'Verder verdiepen',
      tiles: true,
      items: [
        { kop: 'Keynotes', icon: 'keynote', href: '/inspiratie/#cp-keynote' },
        { kop: 'Podcast', icon: 'podcast', href: '/inspiratie/#cp-verdieping' },
        { kop: 'Artikelen', icon: 'artikelen', href: '/inspiratie/#cp-artikelen' },
        { kop: 'Boek: De Digitale Collega', icon: 'boek', href: '/inspiratie/#cp-boek' },
      ],
    },
  },
  projecten: {
    label: 'Projecten',
    dive: null, diveM: null, leg: null, legM: null,
    still:  '/wereld/assets/echt/projecten.webp',
    stillM: '/wereld/assets/echt/projecten.webp',
    cta: { label: 'Bekijk alle projecten', href: '/projecten/' },
    sectie: {
      eyebrow: 'Projecten',
      title: 'Zij gingen je voor.',
      body: 'Ontdek gerealiseerde projecten, trainingen en implementaties die zijn geland in het dagelijkse werk van organisaties.',
      tags: ['Cases', 'AI in productie', 'Maatwerk'],
    },
    einde: {
      titel: 'Projecten in de praktijk',
      grid: true,
      items: [
        { kop: 'PinkRoccade Local Government', tekst: 'Workshops n8n, automatiseren met AI en agentic workflows', href: '/projecten/#case-pinkroccade', img: '/docs/logos/logo_localgovernment.png' },
        { kop: 'Rabobank & AgriFood Capital', tekst: 'MKB Boost: ondernemers werken aan hun bedrijf', href: '/projecten/#case-mkb-boost', img: '/Fotos/MKB%20Boost%20Kick%20off-14.jpg' },
        { kop: 'Solo Solis', tekst: 'Van 40+ handmatige stappen naar maximaal 6 controles', href: '/projecten/#case-solosolis', img: '/Afbeeldingen%20projecten/SoloSolis%20print-order%20automatisatie.png' },
        { kop: 'Gemeente Tilburg', tekst: 'Waardegedreven AI en procesdenken', href: '/projecten/#case-tilburg', img: '/Fotos/Harmen%20training%20Gemeente%20Tilburg%201.jpg' },
        { kop: 'Avans Hogeschool', tekst: 'Alle processen van een afdeling scherp in beeld', href: '/projecten/#case-avans-processen', img: '/docs/company/karin-ai-automation-01.jpg' },
        { kop: 'OnView & PharmaPartners', tekst: 'Claude Code professioneel houden in developmentteams', href: '/projecten/#case-onview', img: '/Fotos/Harmen%20Claude%20Code%20training%20avans.jpg' },
      ],
    },
  },
  overons: {
    label: 'Over Morgen.',
    dive: null, diveM: null, leg: null, legM: null,
    still:  '/wereld/assets/echt/overons.webp',
    stillM: '/wereld/assets/echt/overons.webp',
    cta: { label: 'Lees over Morgen', href: '/about/' },
    sectie: {
      eyebrow: 'Over Morgen.',
      title: 'Technologie als bedrijfskeuze.',
      body: 'De mensen van Morgen: aanpak, technologie en mensen. Zo groeit AI van eerste ervaring naar echte toepassing.',
      tags: ['Aanpak', 'Technologie', 'Mensen'],
    },
    einde: {
      titel: 'Technologie als bedrijfskeuze',
      items: [
        { kop: 'Meet the Humans', tekst: 'De mensen achter Morgen', href: '/about/#about-inspiratie' },
        { kop: 'Van eerste ervaring naar echte toepassing', tekst: 'Het begint met zelf doen: je eerste assistent, tool of automatisering', href: '/about/#about-aanpak' },
        { kop: 'Dan wordt het concreet', tekst: 'Wat AI-integratie betekent voor werk, processen en je team', href: '/about/#about-aanpak' },
        { kop: 'Van inzicht naar praktijk', tekst: 'AI echt laten landen, niet iets wat je erbij doet', href: '/about/#about-aanpak' },
      ],
    },
  },
};

/* ---- Iconen voor tegel-panelen (statische, veilige SVG's) ---- */
const ICONS = {
  keynote: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="2.5" width="6" height="11" rx="3"/><path d="M6 11a6 6 0 0 0 12 0"/><path d="M12 17.5v4"/><path d="M8.5 21.5h7"/></svg>',
  podcast: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M4 13.5v-1a8 8 0 0 1 16 0v1"/><rect x="3" y="13" width="4" height="7" rx="1.6"/><rect x="17" y="13" width="4" height="7" rx="1.6"/></svg>',
  artikelen: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3h8l5 5v12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M14 3v5h5"/><path d="M8.5 13h7"/><path d="M8.5 17h7"/><path d="M8.5 9h3"/></svg>',
  boek: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5z"/><path d="M5 19.5A1.5 1.5 0 0 1 6.5 18H19v3H6.5A1.5 1.5 0 0 1 5 19.5z"/></svg>',
};

const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const coarse = window.matchMedia('(hover: none) and (pointer: coarse)').matches;
const isMobile = () => coarse || window.innerWidth <= 860;
const ROUTE_BY_GEBOUW = {
  train: 'train',
  implement: 'implement',
  build: 'build',
  inspire: 'inspire',
  projecten: 'projecten',
  overons: 'over-morgen',
};
const GEBOUW_BY_ROUTE = Object.fromEntries(
  Object.entries(ROUTE_BY_GEBOUW).map(([gebouw, route]) => [route, gebouw])
);
const LEGACY_ROUTES = {
  'home-aanvraag': '/organisatie/#home-aanvraag',
  aanbod: '/organisatie/#aanbod',
};

const hubEl = document.getElementById('hub');
const hubStill = document.getElementById('hub-still');
const hotspotLayer = document.getElementById('hotspots');
const cine = document.getElementById('cine');
const cineVideo = document.getElementById('cine-video');
const skipKnop = document.getElementById('skip-intro');
const exitKnop = document.getElementById('exit-verhaal');
const worldEl = document.getElementById('world');
const inspireEcht = document.getElementById('inspire-echt');
const inspireEchtVideo = document.getElementById('inspire-echt-video');
const eindePaneel = document.getElementById('verhaal-einde');
const eindeEyebrow = document.getElementById('einde-eyebrow');
const eindeTitel = document.getElementById('einde-titel');
const eindeLijst = document.getElementById('einde-lijst');
const eindeCta = document.getElementById('einde-cta');
const eindeCta2 = document.getElementById('einde-cta2');
const kompasPaneel = document.getElementById('kompas-paneel');
const kompasSluit = document.getElementById('kompas-sluit');
const wereldNav = document.querySelector('.wereld-nav');
const wereldTicker = document.getElementById('wereld-ticker');
const tickerTrack = document.getElementById('ticker-track');

function zetWereldRoute(route, { replace = false, pushed = false } = {}) {
  const hash = route ? '#' + route : '';
  const url = window.location.pathname + window.location.search + hash;
  const state = { wereldRoute: route || 'plein', wereldPushed: pushed };
  if (replace) window.history.replaceState(state, '', url);
  else window.history.pushState(state, '', url);
}

/* ---------- Cinematics: 1 hergebruikt video-element ---------- */
let cineDone = null;
let cineCleanup = null;   // uitgestelde bron-opruiming (na de crossfade)

function playCine(desktopSrc, mobileSrc, done) {
  if (cineCleanup) { clearTimeout(cineCleanup); cineCleanup = null; }   // geen opruiming op de nieuwe clip
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
  // Laatste frame BEVRIEZEN en laten staan: de state-wissel fadet #cine uit
  // (crossfade naar hub-still of binnenwereld). De bron ruimen we pas ná die
  // fade op, anders blankt de video naar zwart en zie je een harde sprong
  // van animatie naar afbeelding.
  try { cineVideo.pause(); } catch (e) {}
  if (cineCleanup) clearTimeout(cineCleanup);
  cineCleanup = setTimeout(() => {
    cine.classList.remove('is-playing');
    cineVideo.removeAttribute('src');
    cineVideo.removeAttribute('poster');
    cineVideo.load();   // geeft decoder en geheugen vrij, voorkomt dubbel afspelen
    cineCleanup = null;
  }, 750);   // iets langer dan de #cine-fade
}

cineVideo.addEventListener('playing', () => cine.classList.add('is-playing'));
cineVideo.addEventListener('ended', finishCine);
cineVideo.addEventListener('error', () => finishCine());   // asset ontbreekt of kapot: flow gaat door

/* ---------- Binnen-verhalen (scrub-engine, maximaal 1 actieve mount) ---------- */
const worldHosts = {};
let activeWorld = null;

function unmountWorld() {
  stopAmbient();
  stopInspireEcht();
  if (!activeWorld) return;
  activeWorld.engine?.destroy();
  activeWorld.host.remove();
  delete worldHosts[activeWorld.id];
  activeWorld = null;
}

function mountWorld(gebouwId) {
  if (worldHosts[gebouwId]) return;
  unmountWorld();
  const g = GEBOUWEN[gebouwId];
  const host = document.createElement('div');
  host.id = 'world-' + gebouwId;
  host.style.display = 'none';
  worldEl.appendChild(host);
  worldHosts[gebouwId] = host;
  const engine = mountScrollWorld(host, {
    nav: false,
    canLoadClips: () => document.body.dataset.state === 'verhaal',
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
        // Eén weg terug is genoeg: de vaste knop linksboven staat er altijd.
        cta: {
          primary: { label: g.cta.label, href: g.cta.href },
        },
      },
    ],
    connectors: [],
  });
  activeWorld = { id: gebouwId, host, engine };
}

function toonWorld(gebouwId) {
  Object.keys(worldHosts).forEach((k) => {
    worldHosts[k].style.display = (k === gebouwId) ? '' : 'none';
  });
}

/* ---------- Ambient: binnenclip speelt zachtjes tot de eerste scroll ----------
   Verzoek Harmen: "er beweegt niets" na de dive. De engine scrubt de clip pas
   bij scroll; tot die tijd spelen we de sectie-video gedempt en vertraagd af.
   Zodra de bezoeker scrolt neemt de scrub-engine het over (die zet currentTime
   bij elke scroll-tick), dus hier alleen pauzeren en luisteraars opruimen.
   Deze rustige autoplaylaag blijft bewust los van de scrollbesturing. */
let ambientStop = null;

function stopAmbient() {
  const stop = ambientStop;
  ambientStop = null;
  if (stop) stop();
}

function startAmbient(gebouwId) {
  stopAmbient();
  const host = worldHosts[gebouwId];
  const engine = activeWorld?.id === gebouwId ? activeWorld.engine : null;
  if (!host || reduce || !GEBOUWEN[gebouwId]?.leg) return;
  let pogingen = 0;
  let timer = null;
  let video = null;
  let onPlaying = null;
  let gestopt = false;
  const stop = () => {
    if (gestopt) return;
    gestopt = true;
    if (timer) clearTimeout(timer);
    window.removeEventListener('scroll', stop);
    window.removeEventListener('wheel', stop);
    window.removeEventListener('touchmove', stop);
    if (ambientStop === stop) ambientStop = null;
    if (video && onPlaying) video.removeEventListener('playing', onPlaying);
    try { video?.pause(); } catch (e) {}
    engine?.setScrubbing(true);
  };
  ambientStop = stop;
  // Wheel en touchmove zijn altijd echte gebruikersinteracties en kunnen dus
  // meteen luisteren zonder de voorafgaande scrollTo(0, 0) te onderscheppen.
  window.addEventListener('wheel', stop, { passive: true });
  window.addEventListener('touchmove', stop, { passive: true });
  const zoek = () => {
    timer = null;
    if (gestopt) return;
    video = host.querySelector('video');
    if (!video) {
      // engine maakt het video-element async aan; even nawachten
      if (++pogingen < 10) {
        timer = setTimeout(zoek, 250);
        return;
      }
      stop();   // geen video: geef de scrollbesturing altijd weer vrij
      return;
    }
    onPlaying = () => video.closest('.sw-scene')?.classList.add('has-clip');
    video.addEventListener('playing', onPlaying, { once: true });
    video.muted = true;
    video.playbackRate = 0.45;
    try {
      const p = video.play();
      if (p && p.catch) p.catch(() => stop());
    } catch (e) {
      stop();
    }
  };
  // Niet meteen: de scrollTo(0,0) van toVerhaal vuurt nog een scroll-event
  // na deze aanroep. Daarna staat de scroll-listener vóór de eerste videopoll.
  timer = setTimeout(() => {
    timer = null;
    if (gestopt) return;
    if ((window.scrollY || window.pageYOffset) > 2) {
      stop();   // bezoeker scrolde al tijdens de korte overgang
      return;
    }
    window.addEventListener('scroll', stop, { passive: true });
    engine?.setScrubbing(false);
    zoek();
  }, 400);
}

/* ---------- Inspire: van papercraft naar echt keynotebeeld ----------
   Dit is bewust een eigen videolaag. De scrub-engine beheert zijn eigen
   videoklok; door beide niet te mengen blijven scrollen en autoplay robuust. */
let inspireEchtWanted = false;
let inspireEchtToken = 0;
let inspireEchtUnload = null;
let inspirePosterReady = false;

function toonInspireEcht() {
  if (
    !inspireEchtWanted ||
    huidigGebouw !== 'inspire' ||
    document.body.dataset.state !== 'verhaal'
  ) return;
  inspireEcht.classList.add('is-zichtbaar');
  document.body.classList.add('inspire-echt-zichtbaar');
}

function ontkoppelInspireEcht() {
  inspireEchtVideo.removeAttribute('src');
  inspireEchtVideo.removeAttribute('poster');
  try { inspireEchtVideo.load(); } catch (e) {}
}

function stopInspireEcht({ direct = false } = {}) {
  inspireEchtWanted = false;
  inspireEchtToken += 1;
  inspireEcht.classList.remove('is-zichtbaar');
  document.body.classList.remove('inspire-echt-zichtbaar');
  if (activeWorld?.id === 'inspire') activeWorld.engine?.setScrubbing(true);
  try { inspireEchtVideo.pause(); } catch (e) {}
  if (inspireEchtUnload) clearTimeout(inspireEchtUnload);
  inspireEchtUnload = null;
  if (!inspireEchtVideo.getAttribute('src') && !inspireEchtVideo.getAttribute('poster')) return;
  if (direct) {
    ontkoppelInspireEcht();
    return;
  }
  // Laat de laatste frame tijdens de crossfade staan; ruim daarna decoder en
  // bron op. Een nieuwe Inspire-start annuleert deze timer.
  inspireEchtUnload = setTimeout(() => {
    inspireEchtUnload = null;
    if (!inspireEchtWanted) ontkoppelInspireEcht();
  }, 850);
}

function startInspireEcht() {
  stopAmbient();
  if (inspireEchtUnload) clearTimeout(inspireEchtUnload);
  inspireEchtUnload = null;
  inspireEchtWanted = true;
  const token = ++inspireEchtToken;
  inspireEchtVideo.defaultMuted = true;
  inspireEchtVideo.muted = true;
  inspireEchtVideo.poster = INSPIRE_ECHT.poster;

  // De poster is de inhoudelijke fallback én de reduced-motionvariant.
  if (inspirePosterReady) {
    toonInspireEcht();
  } else {
    const poster = new Image();
    poster.onload = () => {
      inspirePosterReady = true;
      if (token === inspireEchtToken) toonInspireEcht();
    };
    poster.src = INSPIRE_ECHT.poster;
  }

  if (reduce) return;
  const bron = isMobile() ? INSPIRE_ECHT.videoM : INSPIRE_ECHT.video;
  if (inspireEchtVideo.getAttribute('src') !== bron) {
    inspireEchtVideo.src = bron;
    inspireEchtVideo.load();
  }
  try {
    const p = inspireEchtVideo.play();
    // Een geweigerde autoplay is geen lege foutstaat: de poster blijft staan.
    if (p && p.catch) p.catch(() => {});
  } catch (e) {}
}

inspireEchtVideo.addEventListener('loadeddata', toonInspireEcht);
inspireEchtVideo.addEventListener('playing', () => {
  if (!inspireEchtWanted) {
    try { inspireEchtVideo.pause(); } catch (e) {}
    return;
  }
  toonInspireEcht();
  // De engine blijft copy en scrollpositie bijwerken, maar hoeft zijn
  // verborgen papercraftvideo niet meer te seeken.
  if (activeWorld?.id === 'inspire') activeWorld.engine?.setScrubbing(false);
});
inspireEchtVideo.addEventListener('error', () => {
  // Het al geladen posterbeeld blijft de rustige fallback.
  if (inspirePosterReady) toonInspireEcht();
});

/* ---------- Generiek eindpaneel, per gebouw gevuld ---------- */
function escHtml(s) {
  return String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
}

function vulEinde(gebouwId) {
  const g = GEBOUWEN[gebouwId];
  const grid = !!g.einde.grid;    // showcase-grid met preview-foto's (Projecten)
  const tiles = !!g.einde.tiles;  // vierkante icoon-tegels (Inspire)
  eindePaneel.setAttribute('aria-label', 'Einde van het ' + g.label + '-verhaal');
  eindePaneel.classList.toggle('einde--breed', grid);
  // Tegel-modus (Inspire): geen kader/kop/CTA's, alleen 4 zwevende tegels.
  eindePaneel.classList.toggle('einde--tegels', tiles);
  eindeEyebrow.textContent = g.label;
  eindeTitel.textContent = g.einde.titel;
  eindeLijst.classList.toggle('einde-lijst--grid', grid);
  eindeLijst.classList.toggle('einde-lijst--tiles', tiles);
  eindeLijst.innerHTML = g.einde.items
    .map((it) => {
      const kop = escHtml(it.kop);
      // Tegel: alleen icoon + label, klikbaar naar de juiste plek.
      if (tiles) {
        const icoon = ICONS[it.icon] || '';
        const inner = '<span class="einde-icon" aria-hidden="true">' + icoon + '</span><strong>' + kop + '</strong>';
        return it.href
          ? '<li class="is-tile is-link"><a href="' + escHtml(it.href) + '">' + inner + '</a></li>'
          : '<li class="is-tile">' + inner + '</li>';
      }
      const tekst = escHtml(it.tekst);
      const thumb = it.img
        ? '<span class="einde-thumb" style="background-image:url(\'' + escHtml(it.img) + '\')" aria-hidden="true"></span>'
        : '';
      const binnen = thumb + '<strong>' + kop + '</strong><span>' + tekst + '</span>';
      if (it.placeholder) {
        return '<li class="is-placeholder">' + binnen + '<span class="einde-badge">binnenkort</span></li>';
      }
      if (it.href) {
        return '<li class="is-link"><a href="' + escHtml(it.href) + '">' + binnen + '</a></li>';
      }
      return '<li>' + binnen + '</li>';
    })
    .join('');
  eindeCta.textContent = g.cta.label;
  eindeCta.href = g.cta.href;
  // Optionele tweede CTA. action:'kompas' opent het Wegwijzer-vak in de wereld
  // (terug naar het plein en dan het Kompas), anders een gewone link.
  if (g.cta2) {
    eindeCta2.textContent = g.cta2.label;
    if (g.cta2.action === 'kompas') {
      eindeCta2.href = '#';
      eindeCta2.onclick = (e) => {
        e.preventDefault();
        toonHub();
        openKompas({
          historyMode: 'replace',
          pushed: window.history.state?.wereldPushed === true,
          trigger: document.querySelector('[aria-label="Open Wegwijzer"]'),
        });
      };
    } else {
      eindeCta2.href = g.cta2.href;
      eindeCta2.onclick = null;
    }
    eindeCta2.hidden = false;
  } else {
    eindeCta2.hidden = true;
  }
}

/* ---------- State-machine ---------- */
let huidigGebouw = null;

function setState(s) { document.body.dataset.state = s; }

function meetWereld(event, parameters = {}) {
  if (typeof window.gtag === 'function') window.gtag('event', event, parameters);
}

function startIntro() {
  cineVideo.poster = isMobile() ? ASSETS.posterM : ASSETS.poster;
  setState('intro');
  playCine(ASSETS.intro, ASSETS.introM, toHub);
}

function toonHub() {
  stopCine();
  unmountWorld();
  sluitKompas({ updateRoute: false, restoreFocus: false });
  wereldTicker.hidden = true;
  document.body.classList.remove('ticker-actief');
  document.body.classList.remove('tegels-zichtbaar');
  setState('hub');
  window.scrollTo(0, 0);
  const focusTarget = kompasFocusNaSluiten?.isConnected ? kompasFocusNaSluiten : hubEl;
  kompasFocusNaSluiten = null;
  focusTarget.focus({ preventScroll: true });
}

function toHub({ historyMode = 'base' } = {}) {
  toonHub();
  if (historyMode === 'none') return;
  zetWereldRoute(historyMode === 'base' ? '' : 'plein', {
    replace: historyMode !== 'push',
    pushed: historyMode === 'push',
  });
}

function terugNaarHub() {
  if (window.history.state?.wereldPushed === true) {
    window.history.back();
    return;
  }
  toHub({ historyMode: 'replace' });
}

function startDive(gebouwId, { updateRoute = true } = {}) {
  sluitKompas({ updateRoute: false, restoreFocus: false });
  huidigGebouw = gebouwId;
  if (updateRoute) zetWereldRoute(ROUTE_BY_GEBOUW[gebouwId], { pushed: true });
  const g = GEBOUWEN[gebouwId];
  // Reduced motion of een plek zonder dive-cinematic: direct het verhaal in.
  if (reduce || !g.dive) { toVerhaal(gebouwId); return; }
  setState('dive');
  mountWorld(gebouwId);           // laadt de still, maar nog niet de leg-video
  toonWorld(gebouwId);
  vulEinde(gebouwId);
  playCine(g.dive, g.diveM, () => toVerhaal(gebouwId));
}

function toVerhaal(gebouwId) {
  sluitKompas({ updateRoute: false, restoreFocus: false });
  if (gebouwId) {
    huidigGebouw = gebouwId;
    mountWorld(gebouwId);         // idempotent: bestaande mount wordt hergebruikt
    toonWorld(gebouwId);
    vulEinde(gebouwId);
    meetWereld('wereld_route_view', { wereld_target: gebouwId });
  }
  stopCine();
  setState('verhaal');
  window.scrollTo(0, 0);
  eindePaneel.classList.remove('is-zichtbaar');
  document.body.classList.remove('tegels-zichtbaar');
  // Engine-layout verversen nu de container zichtbaar is
  window.dispatchEvent(new Event('orientationchange'));
  const actiefGebouw = gebouwId || huidigGebouw;
  if (actiefGebouw === 'inspire') startInspireEcht();
  else startAmbient(actiefGebouw);
  toonTicker(actiefGebouw);
}

/* ---------- Hub opbouwen ---------- */
hubStill.src = isMobile() ? ASSETS.hubM : ASSETS.hub;
hubStill.addEventListener('error', () => { hubStill.style.visibility = 'hidden'; });   // placeholder ontbreekt: donkere gradient blijft

const hotspotMap = HOTSPOT_MAPS[isMobile() ? 'mobile' : 'desktop'];
const hotspotSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
hotspotSvg.classList.add('hotspot-map');
hotspotSvg.setAttribute('viewBox', hotspotMap.viewBox);
hotspotSvg.setAttribute('preserveAspectRatio', 'xMidYMid slice');
hotspotSvg.setAttribute('aria-hidden', 'true');
hotspotSvg.setAttribute('focusable', 'false');
hotspotLayer.appendChild(hotspotSvg);

const hotspotButtons = new Map();
function activeerHotspot(h, trigger) {
  trigger.classList.remove('is-object-hovered');
  if (!h.enabled) return;
  meetWereld('wereld_hotspot_open', { wereld_target: h.id, wereld_label: h.label });
  if (h.kompas) { openKompas({ trigger }); return; }
  if (GEBOUWEN[h.id]) { startDive(h.id); return; }
  if (h.href) { window.location.href = h.href; return; }
}

// De hotspots staan als echte links in de HTML (crawlbaar, werkt zonder JS).
// Hier hangen we alleen het gedrag eraan. Ontbreken ze, dan maken we ze alsnog
// aan, zodat de wereld blijft werken als de markup ooit uit de pas loopt.
HOTSPOTS.forEach((h) => {
  let b = hotspotLayer.querySelector('[data-hotspot="' + h.id + '"]');
  if (!b) {
    b = document.createElement('a');
    b.className = 'hotspot' + (h.sub ? ' is-sub' : '');
    b.dataset.hotspot = h.id;
    if (h.href) b.href = h.href;
    b.innerHTML =
      '<span class="hotspot-dot" aria-hidden="true"></span>' +
      '<span class="hotspot-label">' + h.label + '</span>';
    hotspotLayer.appendChild(b);
  }
  b.classList.toggle('is-disabled', !h.enabled);
  if (!h.enabled) b.setAttribute('aria-disabled', 'true');
  // Mobiel kent eigen posities; desktopwaarden staan al in de HTML.
  const x = (isMobile() && h.xm != null) ? h.xm : h.x;
  const y = (isMobile() && h.ym != null) ? h.ym : h.y;
  b.style.left = x + '%';
  b.style.top = y + '%';
  b.addEventListener('click', (e) => {
    e.preventDefault();   // de href is de fallback zonder JS; hier blijven we in de wereld
    activeerHotspot(h, b);
  });
  hotspotButtons.set(h.id, b);
});

HOTSPOTS.forEach((h) => {
  const d = hotspotMap.paths[h.id];
  const b = hotspotButtons.get(h.id);
  if (!d || !b) return;
  const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  path.setAttribute('d', d);
  path.dataset.hotspotHit = h.id;
  path.addEventListener('pointerenter', () => b.classList.add('is-object-hovered'));
  path.addEventListener('pointerleave', () => b.classList.remove('is-object-hovered'));
  path.addEventListener('click', () => activeerHotspot(h, b));
  hotspotSvg.appendChild(path);
});

/* ---------- het Kompas: vak onderaan op de hub ---------- */
let kompasOpener = null;
let kompasFocusNaSluiten = null;

function zetKompasModal(open) {
  hubEl.inert = open;
  wereldNav.inert = open;
}

function kompasFocusables() {
  return [...kompasPaneel.querySelectorAll(
    'a[href], button:not([disabled]), input:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
  )].filter((el) => !el.hidden && el.getClientRects().length > 0);
}

function openKompas({ historyMode = 'push', pushed = true, trigger = document.activeElement } = {}) {
  kompasOpener = trigger instanceof HTMLElement ? trigger : null;
  kompasPaneel.hidden = false;
  zetKompasModal(true);
  meetWereld('wereld_kompas_open');
  if (historyMode !== 'none') {
    zetWereldRoute('wegwijzer', {
      replace: historyMode === 'replace',
      pushed,
    });
  }
  requestAnimationFrame(() => {
    const input = kompasPaneel.querySelector('.ac-input');
    (input || kompasSluit).focus({ preventScroll: true });
  });
}

function sluitKompas({ updateRoute = true, restoreFocus = true } = {}) {
  if (kompasPaneel.hidden) return;
  const focusTarget = restoreFocus && kompasOpener?.isConnected ? kompasOpener : null;
  kompasPaneel.hidden = true;
  zetKompasModal(false);
  if (updateRoute) {
    if (window.history.state?.wereldPushed === true) {
      kompasFocusNaSluiten = focusTarget;
      window.history.back();
      return;
    }
    zetWereldRoute('plein', { replace: true });
  }
  focusTarget?.focus({ preventScroll: true });
}
/* De balk op het plein is alleen een instap: hij opent het Wegwijzer-vak en
   geeft de vraag door aan de bestaande chat-widget. Zo is er één gesprek en
   één plek waar het antwoord verschijnt. */
const hubKompasBalk = document.getElementById('hub-kompasbalk');
const hubKompasInput = document.getElementById('hub-kompasbalk-input');

if (hubKompasBalk && hubKompasInput) {
  hubKompasBalk.addEventListener('submit', (e) => {
    e.preventDefault();
    const vraag = hubKompasInput.value.trim();
    openKompas({ trigger: hubKompasInput });
    if (!vraag) return;                       // leeg versturen opent alleen het vak
    // Direct doorzetten, zonder requestAnimationFrame: de widget staat al in
    // het vak en rAF loopt niet in achtergrondtabs.
    const doel = kompasPaneel.querySelector('.ac-input');
    const stuur = kompasPaneel.querySelector('.ac-send');
    if (!doel || !stuur) return;              // chat.js niet geladen: vak staat open, rest doet de bezoeker
    hubKompasInput.value = '';
    doel.value = vraag;
    stuur.click();
  });
}

kompasSluit.addEventListener('click', sluitKompas);
document.addEventListener('keydown', (e) => {
  if (kompasPaneel.hidden) return;
  if (e.key === 'Escape') {
    e.preventDefault();
    sluitKompas();
    return;
  }
  if (e.key !== 'Tab') return;
  const focusables = kompasFocusables();
  if (!focusables.length) return;
  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  if (e.shiftKey && document.activeElement === first) {
    e.preventDefault();
    last.focus();
  } else if (!e.shiftKey && document.activeElement === last) {
    e.preventDefault();
    first.focus();
  }
});

/* ---------- Logo-ticker: loopt onderin tijdens Projecten ---------- */
const TICKER_LOGOS = [
  { src: '/logos/logo-e0471b2770.png', alt: 'klantlogo' },
  { src: '/docs/logos/pinkroccade.png', alt: 'PinkRoccade' },
  { src: '/logos/logo-c14ea2f159.png', alt: 'klantlogo' },
  { src: '/docs/logos/gemeente-tilburg.svg', alt: 'Gemeente Tilburg' },
  { src: '/docs/logos/pharmapartners.png', alt: 'PharmaPartners' },
  { src: '/logos/logo-8c22008faf.png', alt: 'klantlogo' },
  { src: '/logos/logo-8e5d10ac4a.png', alt: 'klantlogo' },
  { src: '/logos/logo-0be1ac9b0c.png', alt: 'klantlogo' },
  { src: '/docs/logos/vlm.png', alt: 'VLM' },
  { src: '/logos/logo-0a46f8e343.png', alt: 'klantlogo' },
  { src: '/docs/logos/fc-den-bosch.png', alt: 'FC Den Bosch' },
  { src: '/logos/logo-a3564bb2de.png', alt: 'klantlogo' },
  { src: '/logos/logo-fda4ea2999.png', alt: 'klantlogo' },
  { src: '/docs/logos/agrifood-capital.png', alt: 'AgriFood Capital' },
  { src: '/logos/logo-cddbd087d9.png', alt: 'klantlogo' },
  { src: '/logos/logo-f5c55a8062.png', alt: 'klantlogo' },
  { src: '/logos/Logo%20Onview.png', alt: 'OnView' },
  { src: '/docs/logos/house-of-eve.svg', alt: 'House of Eve' },
];
(function vulTicker() {
  const set = TICKER_LOGOS
    .map((l) => '<img src="' + l.src + '" alt="' + escHtml(l.alt) + '" class="clogo" loading="lazy">')
    .join('');
  tickerTrack.innerHTML = set + set;   // dubbel voor een naadloze -50%-loop
})();

function toonTicker(gebouwId) {
  const aan = (gebouwId === 'projecten');
  wereldTicker.hidden = !aan;
  // Tilt de scroll-hint van de engine boven de ticker uit (engine zelf blijft ongemoeid)
  document.body.classList.toggle('ticker-actief', aan);
}

/* ---------- Exits ---------- */
skipKnop.addEventListener('click', () => {
  meetWereld('wereld_intro_skip');
  toHub();
});
exitKnop.addEventListener('click', terugNaarHub);

document.addEventListener('kompas:advies', (e) => {
  meetWereld('wereld_kompas_advies', { training: e.detail?.training || 'onbekend' });
});

document.addEventListener('click', (e) => {
  const link = e.target.closest(
    '#world a[href], #verhaal-einde a[href], #kompas-paneel a[href], .wereld-huidige'
  );
  if (!link) return;
  meetWereld('wereld_cta_click', {
    wereld_label: link.textContent.trim().slice(0, 80),
    wereld_href: link.getAttribute('href') || '',
  });
});

// De engine rendert de secundaire CTA als <a href="#plein">: onderschep die klik.
document.addEventListener('click', (e) => {
  const a = e.target.closest('a[href="#plein"]');
  if (a) { e.preventDefault(); terugNaarHub(); }
});

/* ---------- Eind-paneel: tonen tegen het einde van de sectie ---------- */
window.addEventListener('scroll', () => {
  if (document.body.dataset.state !== 'verhaal') return;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  const p = max > 0 ? window.scrollY / max : 0;
  const zichtbaar = p > 0.72;
  eindePaneel.classList.toggle('is-zichtbaar', zichtbaar);
  // Tegel-modus (Inspire): laat de engine-sectiecopy weg zodra de tegels
  // verschijnen, zodat écht alleen de 4 tegels zweven (transparant paneel).
  document.body.classList.toggle('tegels-zichtbaar', zichtbaar && eindePaneel.classList.contains('einde--tegels'));
}, { passive: true });

/* ---------- URL-routes, browsergeschiedenis en start ---------- */
function pasWereldRouteToe() {
  const route = window.location.hash.slice(1);
  const pushed = window.history.state?.wereldPushed === true;
  if (LEGACY_ROUTES[route]) {
    window.location.replace(LEGACY_ROUTES[route]);
    return true;
  }
  if (route === 'wegwijzer') {
    toonHub();
    openKompas({ historyMode: 'none', pushed: false });
    window.history.replaceState({ wereldRoute: route, wereldPushed: pushed }, '', window.location.href);
    return true;
  }
  const gebouwId = GEBOUW_BY_ROUTE[route];
  if (gebouwId) {
    toVerhaal(gebouwId);
    window.history.replaceState({ wereldRoute: route, wereldPushed: pushed }, '', window.location.href);
    return true;
  }
  if (route === 'plein') {
    toHub({ historyMode: 'none' });
    window.history.replaceState({ wereldRoute: route, wereldPushed: pushed }, '', window.location.href);
    return true;
  }
  return false;
}

if (!pasWereldRouteToe()) {
  zetWereldRoute('', { replace: true });
  if (reduce) {
    toHub();          // reduced motion: intro overslaan
  } else {
    startIntro();     // showcase: de vlucht speelt bij elke load, met skip-knop
  }
}

window.addEventListener('popstate', () => {
  if (!pasWereldRouteToe()) toHub({ historyMode: 'none' });
});
