import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import test from 'node:test';

const root = fileURLToPath(new URL('../../../', import.meta.url));
const bundles = [
  'index.html',
  'academy/index.html',
  'technology/index.html',
  'consultancy/index.html',
  'about/index.html',
  'projecten/index.html',
  'inspiratie/index.html',
];
const read = (relative) => readFileSync(new URL(relative, `file://${root}/`), 'utf8');
const bytes = (relative) => statSync(new URL(relative, `file://${root}/`)).size;
const normalizeBundleVariants = (contents) =>
  contents
    .replace(
      /<div class="page active" id="page-(assistenten|company)">/g,
      '<div class="page" id="page-$1">'
    )
    .replace(
      /<h1 class="h1"([^>]*)>([\s\S]*?)<\/h1>/g,
      '<h2 class="h1"$1>$2</h2>'
    );

function block(contents, start, end) {
  const startAt = contents.indexOf(start);
  const endAt = contents.indexOf(end, startAt);
  assert.notEqual(startAt, -1, `Startmarkering ontbreekt: ${start}`);
  assert.notEqual(endAt, -1, `Eindmarkering ontbreekt: ${end}`);
  return contents.slice(startAt, endAt + end.length);
}

test('project- en inspiratieblokken zijn gelijk in alle zeven bundles', () => {
  const markers = [
    ['<div class="page" id="page-assistenten">', '</div><!-- /page-assistenten -->'],
    ['<div class="page" id="page-company">', '</div><!-- /page-company -->'],
  ];
  for (const [start, end] of markers) {
    const expected = block(normalizeBundleVariants(read(bundles[0])), start, end);
    for (const bundle of bundles.slice(1)) {
      assert.equal(
        block(normalizeBundleVariants(read(bundle)), start, end),
        expected,
        `${bundle} wijkt af bij ${start}`
      );
    }
  }
});

test('alle bundles behouden projecthashes en sturen het logo naar de wereld', () => {
  for (const bundle of bundles) {
    const contents = read(bundle);
    assert.match(contents, /nav\('assistenten',a,\{updateHistory:false\}\)/);
    assert.match(contents, /function goToWorld\(\)\{\s+window\.location\.href='\/';/);
    assert.doesNotMatch(contents, /onclick="nav\('home'\)"/);
  }
});

test('alle wereldkaarten hebben een bestaande, unieke bestemming', () => {
  const wereld = read('wereld/wereld.js');
  const projects = read('projecten/index.html');
  const ids = [
    'case-pinkroccade',
    'case-mkb-boost',
    'case-solosolis',
    'case-tilburg',
    'case-avans-processen',
    'case-onview',
  ];
  for (const id of ids) {
    assert.match(wereld, new RegExp(`/projecten/#${id}`));
    assert.equal((projects.match(new RegExp(`id="${id}"`, 'g')) || []).length, 1);
  }
});

test('alle plekken op het wereldplein hebben een transparant klikvlak', () => {
  const wereld = read('wereld/wereld.js');
  const wereldCss = read('wereld/wereld.css');
  const hotspotMaps = block(wereld, 'const HOTSPOT_MAPS = {', '\n};');
  const ids = ['train', 'implement', 'build', 'inspire', 'projecten', 'overons', 'kompas'];
  for (const id of ids) {
    assert.equal(
      (hotspotMaps.match(new RegExp(`\\b${id}: 'M`, 'g')) || []).length,
      2,
      `${id} mist een desktop- of mobiel klikvlak`
    );
  }
  assert.match(wereld, /setAttribute\('preserveAspectRatio', 'xMidYMid slice'\)/);
  assert.match(wereld, /path\.dataset\.hotspotHit = h\.id/);
  assert.match(wereldCss, /\.hotspot-map path\s*\{[^}]*pointer-events: fill/s);
});

test('de wereld biedt een rustige route naar de overzichtspagina', () => {
  const wereldHtml = read('wereld/index.html');
  const wereldCss = read('wereld/wereld.css');
  assert.match(
    wereldHtml,
    /class="wereld-huidige" href="\/organisatie\/">Snel overzicht<\/a>/
  );
  assert.doesNotMatch(wereldHtml, />Bekijk het aanbod<\/a>/);
  assert.match(
    wereldCss,
    /body\[data-state="dive"\] \.wereld-huidige,\s*body\[data-state="verhaal"\] \.wereld-huidige\s*\{\s*display: none;/
  );
});

test('alle wereld-CTA’s wijzen naar bestaande pagina’s en ankers', () => {
  const wereld = read('wereld/wereld.js');
  const bundleByPath = new Map([
    ['/academy/', 'academy/index.html'],
    ['/consultancy/', 'consultancy/index.html'],
    ['/technology/', 'technology/index.html'],
    ['/inspiratie/', 'inspiratie/index.html'],
    ['/projecten/', 'projecten/index.html'],
    ['/about/', 'about/index.html'],
  ]);
  const hrefs = [...new Set([...wereld.matchAll(/\bhref: '([^']+)'/g)].map((match) => match[1]))];

  for (const href of hrefs) {
    if (href.startsWith('#')) continue;
    const url = new URL(href, 'https://morgencompany.com');
    const bundle = bundleByPath.get(url.pathname);
    assert.ok(bundle, `Geen bundle bekend voor ${href}`);
    if (!url.hash) continue;
    const id = url.hash.slice(1);
    const contents = read(bundle);
    assert.equal(
      (contents.match(new RegExp(`\\bid="${id}"`, 'g')) || []).length,
      1,
      `${href} heeft geen uniek doel in ${bundle}`
    );
  }
});

test('formulierinzendingen komen terug op de juiste route met een bevestiging', () => {
  const actions = [
    '/organisatie/?p=home&a=home-aanvraag&submitted=1',
    '/academy/?p=academy&a=ac-aanvraag&submitted=1',
    '/technology/?p=technology&a=te-aanvraag&submitted=1',
    '/consultancy/?p=consultancy&a=co-aanvraag&submitted=1',
  ];
  for (const bundle of bundles) {
    const contents = read(bundle);
    for (const action of actions) assert.match(contents, new RegExp(`action="${action.replace(/[?&]/g, '\\$&')}"`));
    assert.match(contents, /home:'\/organisatie\/'/);
    assert.match(contents, /if\(segments\[0\]==='organisatie'\)\{/);
    assert.match(contents, /params\.get\('submitted'\)==='1'/);
    assert.match(contents, /function toonFormulierBevestiging\(anchor\)/);
    assert.match(contents, /success\.setAttribute\('role','status'\)/);
    assert.match(contents, /container\.replaceChildren\(success\)/);
    assert.match(contents, /Aanvraag ontvangen/);
    assert.match(contents, /chat\.css\?v=20260726-mobiel-invoer/);
    assert.match(contents, /chat\.js\?v=20260724-launch/);
  }
});

test('het Kompas is modaal, kondigt status aan en begrenst gesprekshistorie', () => {
  const wereldHtml = read('wereld/index.html');
  const wereld = read('wereld/wereld.js');
  const wereldCss = read('wereld/wereld.css');
  const chat = read('docs/academy-chat/chat.js');
  const chatCss = read('docs/academy-chat/chat.css');

  assert.match(wereldHtml, /role="dialog" aria-modal="true" aria-labelledby="kompas-titel" aria-describedby="kompas-sub"/);
  assert.match(wereld, /hubEl\.inert = open/);
  assert.match(wereld, /wereldNav\.inert = open/);
  assert.match(wereld, /if \(e\.key !== 'Tab'\) return/);
  assert.equal((wereld.match(/sluitKompas\(\{ updateRoute: false, restoreFocus: false \}\)/g) || []).length, 3);
  assert.match(wereld, /if \(reduce \|\| !g\.dive\) \{ toVerhaal\(gebouwId\); return; \}/);
  assert.equal((wereld.match(/wereldPushed: pushed/g) || []).length, 4);
  assert.match(wereldCss, /\.sw-route \{ display: none; \}/);
  assert.match(wereldCss, /#hub\[inert\],\s*\.wereld-nav\[inert\] \{ pointer-events: none; \}/);

  assert.match(chat, /const MAX_HISTORY_MESSAGES = 20/);
  assert.match(chat, /const MAX_MESSAGE_LENGTH = 2000/);
  assert.match(chat, /const CHAT_TIMEOUT_MS = 60000/);
  assert.match(chat, /maxlength="\$\{MAX_MESSAGE_LENGTH\}"/);
  assert.match(chat, /state\.messages = state\.messages\.slice\(-MAX_HISTORY_MESSAGES\)/);
  assert.match(chat, /botItem\.text\.slice\(0, MAX_MESSAGE_LENGTH\)/);
  assert.match(chat, /role="log" aria-live="polite"/);
  assert.match(chat, /aria-busy="\$\{state\.busy\}"/);
  assert.match(chat, /aria-label="Stel je vraag of beschrijf je situatie"/);
  assert.match(chat, /Het Kompas denkt mee…/);
  assert.match(chat, /const heeftFormulierHandoff = card\.samenvatting && String\(card\.href\)\.startsWith\('\/'\)/);
  assert.match(chat, /log\.lastElementChild\?\.scrollIntoView\(\{ block: 'nearest' \}\)/);
  assert.match(chat, /signal: controller\.signal/);
  assert.match(chatCss, /\.ac-typing/);
  assert.match(chatCss, /prefers-reduced-motion: reduce/);
});

test('functionele wereldassets worden met dezelfde cacheversie geladen', () => {
  const wereldHtml = read('wereld/index.html');
  assert.match(wereldHtml, /wereld\.css\?v=20260726-ticker-link/);
  assert.match(wereldHtml, /scrub-engine\.js\?v=20260726-mobiel-fixes/);
  assert.match(wereldHtml, /wereld\.js\?v=20260726-mobiel-fixes/);
  assert.match(wereldHtml, /chat\.css\?v=20260726-mobiel-invoer/);
  assert.match(wereldHtml, /chat\.js\?v=20260724-launch/);
});

test('de wereld is technisch voorbereid als root-homepage', () => {
  const redirects = read('_redirects');
  const redirectRules = redirects.trim().split('\n');
  const wereldHtml = read('wereld/index.html');
  const wereld = read('wereld/wereld.js');

  assert.match(redirects, /^\/wereld \/ 301!$/m);
  assert.match(redirects, /^\/wereld\/ \/ 301!$/m);
  assert.match(redirects, /^\/wereld\/index\.html \/ 301!$/m);
  assert.match(redirects, /^\/index\.html \/ 301!$/m);
  assert.match(redirects, /^\/ \/wereld\/index\.html 200!$/m);
  assert.ok(
    redirectRules.indexOf('/index.html / 301!') < redirectRules.indexOf('/ /wereld/index.html 200!'),
    'de directe index-redirect moet vóór de root-rewrite staan'
  );
  assert.deepEqual(
    redirectRules.filter((rule) => rule.startsWith('/organisatie')),
    [
      '/organisatie /index.html 200',
      '/organisatie/ /index.html 200',
      '/organisatie/* /index.html 200',
    ]
  );
  assert.match(wereldHtml, /href="\/wereld\/wereld\.css\?v=20260726-ticker-link"/);
  assert.match(wereldHtml, /src="\/wereld\/scrub-engine\.js\?v=20260726-mobiel-fixes"/);
  assert.match(wereldHtml, /src="\/wereld\/wereld\.js\?v=20260726-mobiel-fixes"/);
  assert.doesNotMatch(wereldHtml, /(?:href|src)="(?:wereld\.css|scrub-engine\.js|wereld\.js)/);
  assert.doesNotMatch(wereld, /:\s*'assets\//);
  assert.match(wereldHtml, /class="wereld-merk" href="\/"/);
});

test('mobiele wereldvideo’s zijn aanwezig en substantieel lichter', () => {
  const pairs = [
    ['intro.mp4', 'intro-m.mp4'],
    ['dive-train.mp4', 'dive-train-m.mp4'],
    ['dive-implement.mp4', 'dive-implement-m.mp4'],
    ['dive-build.mp4', 'dive-build-m.mp4'],
    ['dive-inspire.mp4', 'dive-inspire-m.mp4'],
    ['leg-train.mp4', 'leg-train-m.mp4'],
    ['leg-implement.mp4', 'leg-implement-m.mp4'],
    ['leg-build.mp4', 'leg-build-m.mp4'],
    ['inspire-keynote.mp4', 'inspire-keynote-m.mp4'],
  ];
  let mobileTotal = 0;
  for (const [desktop, mobile] of pairs) {
    const desktopPath = `wereld/assets/echt/vid/${desktop}`;
    const mobilePath = `wereld/assets/echt/vid/${mobile}`;
    assert.ok(bytes(mobilePath) < bytes(desktopPath), `${mobile} is niet lichter dan ${desktop}`);
    mobileTotal += bytes(mobilePath);
  }
  assert.ok(bytes('wereld/assets/echt/vid/intro-m.mp4') < 1_500_000);
  assert.ok(mobileTotal < 13_500_000);
  assert.ok(bytes('wereld/assets/echt/intro-poster.jpg') > 0);
  assert.ok(bytes('wereld/assets/echt/intro-poster-m.jpg') > 0);

  const wereld = read('wereld/wereld.js');
  assert.equal((wereld.match(/(?:introM|diveM|legM|videoM):\s+'\/wereld\/assets\/echt\/vid\/[^']+-m\.mp4'/g) || []).length, 9);
  assert.match(wereld, /poster:\s+'\/wereld\/assets\/echt\/intro-poster\.jpg'/);
  assert.match(wereld, /posterM:\s+'\/wereld\/assets\/echt\/intro-poster-m\.jpg'/);
});

test('cache en preview-indexering blijven per Netlify-context correct', () => {
  const config = read('netlify.toml');
  const cache = read('netlify/headers/cache');
  assert.match(config, /command = "cp netlify\/headers\/cache _headers"/);
  assert.equal(
    (config.match(/command = "cp netlify\/headers\/cache _headers && cat netlify\/headers\/noindex >> _headers"/g) || []).length,
    2
  );
  assert.match(cache, /^\/wereld\/assets\/\*$/m);
  assert.match(cache, /max-age=86400, stale-while-revalidate=604800/);
  assert.match(cache, /^\/wereld\/wereld\.js$/m);
  assert.match(cache, /max-age=2592000, stale-while-revalidate=604800/);
});

test('tracking laadt alleen op productie en meet de wereldfunnel', () => {
  const wereldHtml = read('wereld/index.html');
  const wereld = read('wereld/wereld.js');
  const chat = read('docs/academy-chat/chat.js');
  assert.match(wereldHtml, /location\.hostname === 'morgencompany\.com'/);
  assert.match(wereldHtml, /document\.createElement\('script'\)/);
  assert.doesNotMatch(wereldHtml, /<script async src="https:\/\/www\.googletagmanager\.com/);
  for (const event of [
    'wereld_route_view',
    'wereld_hotspot_open',
    'wereld_kompas_open',
    'wereld_intro_skip',
    'wereld_kompas_advies',
    'wereld_cta_click',
  ]) {
    assert.match(wereld, new RegExp(`'${event}'`));
  }
  assert.match(chat, /new CustomEvent\('kompas:advies'/);
});

test('binnenvideo’s laden pas na de dive en oude engines worden opgeruimd', () => {
  const wereld = read('wereld/wereld.js');
  const engine = read('wereld/scrub-engine.js');
  const startDive = block(wereld, 'function startDive(', '\n}\n\nfunction toVerhaal');

  assert.match(startDive, /setState\('dive'\);\s+mountWorld\(gebouwId\)/);
  assert.match(wereld, /canLoadClips: \(\) => document\.body\.dataset\.state === 'verhaal'/);
  assert.match(engine, /\(config\.canLoadClips && !config\.canLoadClips\(\)\)/);
  assert.match(engine, /img\.loading = i === 0 \? 'eager' : 'lazy'/);
  assert.match(wereld, /activeWorld\.engine\?\.destroy\(\)/);
  assert.match(wereld, /activeWorld\.host\.remove\(\)/);
  assert.match(wereld, /if \(timer\) clearTimeout\(timer\)/);
  assert.match(engine, /const clipRequests = new AbortController\(\)/);
  assert.match(engine, /clipRequests\.abort\(\)/);
  assert.match(engine, /cancelAnimationFrame\(loopFrame\)/);
  assert.match(engine, /if \(destroyed \|\| !scrubbing \|\| !hasScrubbableClip \|\| loopFrame\) return/);
  assert.match(engine, /window\.removeEventListener\('scroll', onScroll\)/);
  assert.match(engine, /URL\.revokeObjectURL\(s\.objectUrl\)/);
  assert.match(engine, /return \{ destroy, setScrubbing \}/);
});

test('ambient binnenvideo en scroll-scrub nemen de videoklok niet tegelijk over', () => {
  const wereld = read('wereld/wereld.js');
  const engine = read('wereld/scrub-engine.js');
  const ambient = block(
    wereld,
    'function startAmbient(',
    '\n}\n\n/* ---------- Inspire: van papercraft'
  );

  assert.match(engine, /function ensureLoop\(\)/);
  assert.match(engine, /if \(destroyed \|\| !scrubbing \|\| !hasScrubbableClip \|\| loopFrame\) return/);
  assert.match(engine, /loopFrame = 0;\s+if \(destroyed \|\| !scrubbing\) return/);
  assert.match(engine, /function setScrubbing\(enabled\)/);
  assert.match(engine, /if \(destroyed \|\| scrubbing === next\) return/);
  assert.match(engine, /cancelAnimationFrame\(loopFrame\);\s+loopFrame = 0/);
  assert.match(engine, /read\(\);\s+ensureLoop\(\)/);

  assert.match(ambient, /engine\?\.setScrubbing\(false\);\s+zoek\(\);/);
  assert.match(ambient, /engine\?\.setScrubbing\(true\);/);
  assert.match(
    ambient,
    /window\.addEventListener\('scroll', stop, \{ passive: true \}\);\s+engine\?\.setScrubbing\(false\);\s+zoek\(\);/
  );
  assert.ok(
    ambient.indexOf("window.addEventListener('wheel', stop") < ambient.indexOf('const zoek'),
    'wheel-listener moet vóór de videopolling actief zijn'
  );
  assert.match(ambient, /if \(\+\+pogingen < 10\) \{[\s\S]*?return;\s+\}\s+stop\(\)/);
  assert.match(ambient, /p\.catch\(\(\) => stop\(\)\)/);
  assert.match(ambient, /catch \(e\) \{\s+stop\(\);/);
});

test('Inspire projecteert lui en toegankelijk echt keynotebeeld in het theater', () => {
  const wereldHtml = read('wereld/index.html');
  const wereld = read('wereld/wereld.js');
  const wereldCss = read('wereld/wereld.css');
  const start = block(
    wereld,
    'function startInspireEcht()',
    '\n}\n\ninspireEchtVideo.addEventListener'
  );

  assert.match(
    wereldHtml,
    /<video id="inspire-echt-video" muted playsinline loop preload="none"><\/video>/
  );
  assert.doesNotMatch(wereldHtml, /id="inspire-echt-video"[^>]+(?:src|poster)=/);
  assert.match(wereld, /video:\s+'\/wereld\/assets\/echt\/vid\/inspire-keynote\.mp4'/);
  assert.match(wereld, /videoM:\s+'\/wereld\/assets\/echt\/vid\/inspire-keynote-m\.mp4'/);
  assert.match(wereld, /poster:\s+'\/docs\/company\/film-poster\.jpg'/);
  assert.match(wereld, /label: 'Inspiratie',[\s\S]*?leg:\s+null,\s+legM:\s+null,/);
  assert.match(wereld, /still:\s+'\/wereld\/assets\/echt\/inspire-podium\.jpg'/);
  assert.match(wereld, /stillM:\s+'\/wereld\/assets\/echt\/inspire-podium-m\.jpg'/);
  assert.match(start, /if \(reduce\) return;/);
  assert.match(start, /inspireEchtVideo\.src = bron;\s+inspireEchtVideo\.load\(\)/);
  assert.match(wereld, /if \(actiefGebouw === 'inspire'\) startInspireEcht\(\);\s+else startAmbient\(actiefGebouw\);/);
  assert.match(wereld, /inspireEchtVideo\.removeAttribute\('src'\)/);
  assert.match(wereld, /inspireEchtVideo\.removeAttribute\('poster'\)/);
  assert.match(wereld, /if \(activeWorld\?\.id === 'inspire'\) activeWorld\.engine\?\.setScrubbing\(false\)/);
  assert.match(wereldCss, /\.inspire-echt\s*\{[^}]*z-index: 25[^}]*aspect-ratio: 16 \/ 9/s);
  assert.match(wereldCss, /\.inspire-echt::before\s*\{[^}]*border-left:[^}]*border-right:/s);
  assert.match(
    wereldCss,
    /@media \(max-width: 860px\) and \(orientation: portrait\)[\s\S]*?\.inspire-echt\s*\{[^}]*z-index: 15[^}]*width: min\(82vw, 330px\)/s
  );
  assert.match(
    wereldCss,
    /#world-inspire \.sw-copy__eyebrow \{ margin-top: 10px; \}[\s\S]*?#world-inspire \.sw-copy__cta \{[\s\S]*?margin-top: 14px;/
  );
  assert.match(wereldCss, /#world-inspire \.sw-hint span \{ display: none; \}/);
  assert.match(
    wereldCss,
    /max-height: 700px[\s\S]*?\.inspire-echt\s*\{[^}]*width: 70vw/
  );
  assert.match(
    wereldCss,
    /max-height: 620px[\s\S]*?#world-inspire \.sw-copy__num,[\s\S]*?#world-inspire \.sw-hint \{ display: none; \}/
  );
  assert.match(
    wereldCss,
    /@media \(min-width: 861px\) and \(max-aspect-ratio: 6 \/ 5\)[\s\S]*?width: min\(66vw, 1480px\)/
  );
  assert.match(wereldCss, /prefers-reduced-motion: reduce[\s\S]*?\.inspire-echt \{ transition: none;/);

  const desktop = bytes('wereld/assets/echt/vid/inspire-keynote.mp4');
  const mobile = bytes('wereld/assets/echt/vid/inspire-keynote-m.mp4');
  const podium = bytes('wereld/assets/echt/inspire-podium.jpg');
  const podiumMobile = bytes('wereld/assets/echt/inspire-podium-m.jpg');
  const legacy = bytes('docs/company/Filmpje Harmen Daan Karin.mp4');
  assert.ok(desktop < legacy, 'de wereldvariant moet lichter zijn dan de legacy-hero');
  assert.ok(desktop < 3_500_000, 'de desktop-keynotevariant is te zwaar');
  assert.ok(mobile < desktop, 'de mobiele keynotevariant moet lichter zijn');
  assert.ok(mobile < 2_000_000, 'de mobiele keynotevariant is te zwaar');
  assert.ok(podium < 200_000, 'de desktop-podiumstill is te zwaar');
  assert.ok(podiumMobile < 100_000, 'de mobiele podiumstill is te zwaar');
});

test('het plein toont de positionering als zichtbare hoofdkop', () => {
  const wereldHtml = read('wereld/index.html');
  const wereldCss = read('wereld/wereld.css');
  assert.equal((wereldHtml.match(/<h1>/g) || []).length, 1);
  assert.match(wereldHtml, /<h1>Maak AI onderdeel van het dagelijkse werk\.<\/h1>/);
  assert.match(
    wereldHtml,
    /<p>Met trainingen, implementatie en maatwerksoftware voor organisaties\.<\/p>/
  );
  assert.doesNotMatch(wereldHtml, /<h1 class="sr-only">/);
  assert.match(wereldCss, /body\[data-state="dive"\] \.hub-propositie/);
});

test('de projectcopy legt de visuele beeldtaal niet uit', () => {
  const wereld = read('wereld/wereld.js');
  const wereldHtml = read('wereld/index.html');
  assert.match(wereld, /title: 'Zij gingen je voor\.'/);
  assert.match(
    wereld,
    /body: 'Bekijk gerealiseerde projecten, trainingen en implementaties die zijn geland in het dagelijkse werk van organisaties\.'/
  );
  assert.match(wereld, /titel: 'Projecten in de praktijk'/);
  assert.doesNotMatch(wereld, /title: 'Maquettes|body: 'Elke stolp/);
  assert.match(wereld, /cta: \{ label: 'Bekijk jouw AI-oplossing', href: '\/technology\/' \}/);
  assert.equal((wereldHtml.match(/>Terug naar plein<\/button>/g) || []).length, 1);
  assert.doesNotMatch(wereld, /label: 'Terug naar (?:het plein|start)'/);
  assert.doesNotMatch(wereldHtml, />Terug naar (?:het plein|start)<\/button>/);
});

test('kennismakingslinks blijven na de wereld-omschakeling bereikbaar', () => {
  assert.doesNotMatch(read('docs/academy-chat/chat.js'), /href="\/#home-aanvraag"/);
  assert.doesNotMatch(read('netlify/functions/lib/kb.mjs'), /href: '\/#home-aanvraag'/);
  assert.match(read('docs/academy-chat/chat.js'), /href="\/organisatie\/#home-aanvraag"/);
  assert.match(read('netlify/functions/lib/kb.mjs'), /href: '\/organisatie\/#home-aanvraag'/);
  const spraaktool = read('spraaktool/index.html');
  assert.equal((spraaktool.match(/href="\/organisatie\/#home-aanvraag"/g) || []).length, 2);
  assert.doesNotMatch(spraaktool, /href="\/\?p=home/);
});

test('onbekende routes krijgen een echte 404', () => {
  assert.match(read('_redirects'), /^\/\* \/404\.html 404$/m);
  assert.match(read('404.html'), /<meta name="robots" content="noindex,follow">/);
});
