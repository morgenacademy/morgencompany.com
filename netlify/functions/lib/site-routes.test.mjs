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
  assert.match(
    wereldHtml,
    /class="wereld-huidige" href="\/organisatie\/">Liever een overzicht\?<\/a>/
  );
  assert.doesNotMatch(wereldHtml, />Bekijk het aanbod<\/a>/);
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
  assert.doesNotMatch(wereld, /label: 'Terug naar het plein'/);
  assert.doesNotMatch(wereldHtml, />Terug naar het plein<\/button>/);
});

test('kennismakingslinks blijven na de wereld-omschakeling bereikbaar', () => {
  assert.doesNotMatch(read('docs/academy-chat/chat.js'), /href="\/#home-aanvraag"/);
  assert.doesNotMatch(read('netlify/functions/lib/kb.mjs'), /href: '\/#home-aanvraag'/);
  assert.match(read('docs/academy-chat/chat.js'), /href="\/organisatie\/#home-aanvraag"/);
  assert.match(read('netlify/functions/lib/kb.mjs'), /href: '\/organisatie\/#home-aanvraag'/);
});

test('onbekende routes krijgen een echte 404', () => {
  assert.match(read('_redirects'), /^\/\* \/404\.html 404$/m);
  assert.match(read('404.html'), /<meta name="robots" content="noindex,follow">/);
});
