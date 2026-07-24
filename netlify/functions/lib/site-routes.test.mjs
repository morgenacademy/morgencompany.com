import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
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
    const expected = block(read(bundles[0]), start, end);
    for (const bundle of bundles.slice(1)) {
      assert.equal(block(read(bundle), start, end), expected, `${bundle} wijkt af bij ${start}`);
    }
  }
});

test('alle bundles behouden projecthashes en sturen het logo naar de wereld', () => {
  for (const bundle of bundles) {
    const contents = read(bundle);
    assert.match(contents, /nav\('assistenten',a,\{updateHistory:false\}\)/);
    assert.match(contents, /function goToWorld\(\)\{\s+window\.location\.href='\/wereld\/';/);
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
    assert.match(contents, /chat\.css\?v=20260724-functional/);
    assert.match(contents, /chat\.js\?v=20260724-functional/);
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
  assert.match(wereldHtml, /wereld\.css\?v=20260724-functional/);
  assert.match(wereldHtml, /wereld\.js\?v=20260724-functional/);
  assert.match(wereldHtml, /chat\.css\?v=20260724-functional/);
  assert.match(wereldHtml, /chat\.js\?v=20260724-functional/);
});

test('de projectcopy legt de visuele beeldtaal niet uit', () => {
  const wereld = read('wereld/wereld.js');
  const wereldHtml = read('wereld/index.html');
  assert.match(wereld, /title: 'Zij gingen je voor\.'/);
  assert.match(
    wereld,
    /body: 'Ontdek gerealiseerde projecten, trainingen en implementaties die zijn geland in het dagelijkse werk van organisaties\.'/
  );
  assert.match(wereld, /titel: 'Projecten in de praktijk'/);
  assert.doesNotMatch(wereld, /title: 'Maquettes|body: 'Elke stolp/);
  assert.match(wereld, /label: 'Terug naar plein', href: '#plein'/);
  assert.match(wereld, /cta: \{ label: 'Bekijk maatwerk', href: '\/technology\/' \}/);
  assert.equal((wereldHtml.match(/>Terug naar plein<\/button>/g) || []).length, 2);
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
