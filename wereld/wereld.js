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
  // Plein-plekken, secundair (sub): stolpen-tuin en kampvuur openen een
  // still-binnenwereld (geen dive), de wegwijzer linkt naar het Kompas op de site.
  { id: 'projecten', label: 'Projecten',     x: 27, y: 51, xm: 27, ym: 52, enabled: true, sub: true },
  { id: 'overons',   label: 'Over Morgen.',  x: 70, y: 67, xm: 71, ym: 62, enabled: true, sub: true },
  { id: 'kompas',    label: 'Wegwijzer',     x: 52, y: 47, xm: 52, ym: 50, enabled: true, sub: true, kompas: true },
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
    cta2: { label: 'Trainingwijzer', action: 'kompas' },
    sectie: {
      eyebrow: 'Train',
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
        { kop: 'Zien wat er speelt', tekst: 'We brengen in kaart wat er al gebeurt, waar energie ontstaat en waar processen, afspraken of systemen knellen', href: '/consultancy/#co-aanpak' },
        { kop: 'Keuzes scherp maken', tekst: 'Wat gebruik je wel, wat niet, wie is eigenaar en welke kaders zijn nodig?', href: '/consultancy/#co-aanpak' },
        { kop: 'Werken met het team', tekst: 'We werken met de mensen die het straks gebruiken', href: '/consultancy/#co-aanpak' },
        { kop: 'Vast ritme', tekst: 'De aanpak krijgt plek in overleg, besluitvorming en dagelijkse werkwijze', href: '/consultancy/#co-aanpak' },
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
      tiles: true,
      items: [
        { kop: 'Keynotes', icon: 'keynote', href: '/inspiratie/#cp-keynote' },
        { kop: 'Podcast', icon: 'podcast', href: '/inspiratie/#cp-podcast' },
        { kop: 'Artikelen', icon: 'artikelen', href: '/inspiratie/#cp-artikelen' },
        { kop: 'Boek: De Digitale Collega', icon: 'boek', href: '/inspiratie/#cp-boek' },
      ],
    },
  },
  projecten: {
    label: 'Projecten',
    dive: null, diveM: null, leg: null, legM: null,
    still:  'assets/echt/projecten.webp',
    stillM: 'assets/echt/projecten.webp',
    cta: { label: 'Bekijk alle projecten', href: '/projecten/' },
    sectie: {
      eyebrow: 'Projecten',
      title: 'Maquettes van echt werk.',
      body: 'Elke stolp in de tuin is een project dat al draait: gebouwd met AI en geland in het dagelijkse werk van een organisatie.',
      tags: ['Cases', 'AI in productie', 'Maatwerk'],
    },
    einde: {
      titel: 'Zij gingen je voor',
      grid: true,
      items: [
        { kop: 'PinkRoccade Local Government', tekst: 'Workshops n8n, automatiseren met AI en agentic workflows', href: '/projecten/#case-pinkroccade', img: '/docs/logos/logo_localgovernment.png' },
        { kop: 'Rabobank & AgriFood Capital', tekst: 'MKB Boost: ondernemers werken aan hun bedrijf', href: '/projecten/', img: '/Fotos/MKB%20Boost%20Kick%20off-14.jpg' },
        { kop: 'Solo Solis', tekst: 'Van 40+ handmatige stappen naar maximaal 6 controles', href: '/projecten/#case-solosolis', img: '/Afbeeldingen%20projecten/SoloSolis%20print-order%20automatisatie.png' },
        { kop: 'Gemeente Tilburg', tekst: 'Waardegedreven AI en procesdenken', href: '/projecten/#case-tilburg', img: '/Fotos/Harmen%20training%20Gemeente%20Tilburg%201.jpg' },
        { kop: 'Avans Hogeschool', tekst: 'Alle processen van een afdeling scherp in beeld', href: '/projecten/', img: '/docs/company/karin-ai-automation-01.jpg' },
        { kop: 'OnView & PharmaPartners', tekst: 'Claude Code professioneel houden in developmentteams', href: '/projecten/#case-onview', img: '/Fotos/Harmen%20Claude%20Code%20training%20avans.jpg' },
      ],
    },
  },
  overons: {
    label: 'Over Morgen.',
    dive: null, diveM: null, leg: null, legM: null,
    still:  'assets/echt/overons.webp',
    stillM: 'assets/echt/overons.webp',
    cta: { label: 'Lees over Morgen', href: '/about/' },
    sectie: {
      eyebrow: 'Over Morgen.',
      title: 'Technologie als bedrijfskeuze.',
      body: 'Rond het kampvuur zitten de mensen van Morgen: aanpak, technologie en mensen. Zo groeit AI van eerste ervaring naar echte toepassing.',
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
const eindeCta2 = document.getElementById('einde-cta2');
const eindeTerug = document.getElementById('einde-terug');
const kompasPaneel = document.getElementById('kompas-paneel');
const kompasSluit = document.getElementById('kompas-sluit');
const wereldTicker = document.getElementById('wereld-ticker');
const tickerTrack = document.getElementById('ticker-track');

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

/* ---------- Ambient: binnenclip speelt zachtjes tot de eerste scroll ----------
   Verzoek Harmen: "er beweegt niets" na de dive. De engine scrubt de clip pas
   bij scroll; tot die tijd spelen we de sectie-video gedempt en vertraagd af.
   Zodra de bezoeker scrolt neemt de scrub-engine het over (die zet currentTime
   bij elke scroll-tick), dus hier alleen pauzeren en luisteraars opruimen.
   Bewust buiten de engine om: scrub-engine.js blijft byte-identiek. */
let ambientStop = null;

function stopAmbient() { if (ambientStop) ambientStop(); }

function startAmbient(gebouwId) {
  stopAmbient();
  const host = worldHosts[gebouwId];
  if (!host) return;
  let pogingen = 0;
  const zoek = () => {
    const v = host.querySelector('video');
    if (!v) {
      // engine maakt het video-element async aan; even nawachten
      if (++pogingen < 10) setTimeout(zoek, 250);
      return;
    }
    const stop = () => {
      window.removeEventListener('scroll', stop);
      window.removeEventListener('wheel', stop);
      window.removeEventListener('touchmove', stop);
      if (ambientStop === stop) ambientStop = null;
      try { v.pause(); } catch (e) {}
    };
    ambientStop = stop;
    window.addEventListener('scroll', stop, { passive: true });
    window.addEventListener('wheel', stop, { passive: true });
    window.addEventListener('touchmove', stop, { passive: true });
    v.muted = true;
    v.playbackRate = 0.45;
    const p = v.play();
    if (p && p.catch) p.catch(() => {});   // autoplay geweigerd: still blijft staan, scrub werkt gewoon
  };
  // Niet meteen: de scrollTo(0,0) van toVerhaal vuurt nog een scroll-event
  // na deze aanroep; met een korte adempauze vangt de stop-listener die niet.
  setTimeout(zoek, 400);
}

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
      eindeCta2.onclick = (e) => { e.preventDefault(); toHub(); openKompas(); };
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

function startIntro() {
  setState('intro');
  playCine(ASSETS.intro, ASSETS.introM, toHub);
}

function toHub() {
  stopCine();
  stopAmbient();
  sluitKompas();
  wereldTicker.hidden = true;
  document.body.classList.remove('ticker-actief');
  setState('hub');
  window.scrollTo(0, 0);
  hubEl.focus({ preventScroll: true });
}

function startDive(gebouwId) {
  huidigGebouw = gebouwId;
  mountWorld(gebouwId);           // laadt het binnen-verhaal alvast tijdens de dive
  toonWorld(gebouwId);
  vulEinde(gebouwId);
  const g = GEBOUWEN[gebouwId];
  // Reduced motion of een plek zonder dive-cinematic: direct het verhaal in.
  if (reduce || !g.dive) { toVerhaal(gebouwId); return; }
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
  startAmbient(gebouwId || huidigGebouw);
  toonTicker(gebouwId || huidigGebouw);
}

/* ---------- Hub opbouwen ---------- */
hubStill.src = isMobile() ? ASSETS.hubM : ASSETS.hub;
hubStill.addEventListener('error', () => { hubStill.style.visibility = 'hidden'; });   // placeholder ontbreekt: donkere gradient blijft

HOTSPOTS.forEach((h) => {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'hotspot' + (h.sub ? ' is-sub' : '') + (h.enabled ? '' : ' is-disabled');
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
  b.addEventListener('click', () => {
    if (!h.enabled) return;
    if (h.kompas) { openKompas(); return; }
    if (h.href) { window.location.href = h.href; return; }
    startDive(h.id);
  });
  hotspotLayer.appendChild(b);
});

/* ---------- het Kompas: vak onderaan op de hub ---------- */
function openKompas() {
  kompasPaneel.hidden = false;
}
function sluitKompas() {
  kompasPaneel.hidden = true;
}
kompasSluit.addEventListener('click', sluitKompas);
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && !kompasPaneel.hidden) sluitKompas();
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
