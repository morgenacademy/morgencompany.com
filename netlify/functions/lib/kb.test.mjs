// netlify/functions/lib/kb.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { OFFER_KEYS, findOffer, buildSystemPrompt, buildCard } from './kb.mjs';

test('OFFER_KEYS bevat alle 13 keys (academy + consultancy + technology + kennismaking)', () => {
  assert.equal(OFFER_KEYS.length, 13);
  assert.ok(OFFER_KEYS.includes('basis'));
  assert.ok(OFFER_KEYS.includes('masterclass'));
  assert.ok(OFFER_KEYS.includes('implementatietraject'));
  assert.ok(OFFER_KEYS.includes('maatwerk'));
  assert.ok(OFFER_KEYS.includes('kennismaking'));
});

test('findOffer geeft het juiste aanbod terug', () => {
  const o = findOffer('basis');
  assert.equal(o.training, 'Basistraining AI');
  assert.ok(Array.isArray(o.bullets));
});

test('findOffer geeft null bij onbekende key', () => {
  assert.equal(findOffer('bestaat-niet'), null);
});

test('buildSystemPrompt bevat het Kompas, de drie pijlers, aanbod en tool', () => {
  const p = buildSystemPrompt();
  assert.ok(p.includes('het Kompas'));
  assert.ok(p.includes('Morgen Academy'));
  assert.ok(p.includes('Consultancy'));
  assert.ok(p.includes('Technology'));
  assert.ok(p.includes('Basistraining AI'));
  assert.ok(p.includes('AI-implementatietraject'));
  assert.ok(p.includes('presenteer_advies'));
  assert.ok(p.includes('waarom'));
  assert.ok(p.includes('totmorgen@morgenacademy.nl'));
});

test('buildCard verrijkt input tot kaart met waarom en academy-href', () => {
  const card = buildCard({
    offer_key: 'basis',
    waarom: 'Omdat jullie net starten, is de basis de logische eerste stap.',
    vervolg_keys: ['toolbuilding', 'workflows'],
  });
  assert.equal(card.training, 'Basistraining AI');
  assert.equal(card.waarom, 'Omdat jullie net starten, is de basis de logische eerste stap.');
  assert.equal(card.href, '/academy/#ac-trainingen');
  assert.equal(card.vervolg.length, 2);
  assert.equal(card.vervolg[0].training, 'Bouwen met AI (vibecoding)');
  assert.ok(card.vervolg[0].href.startsWith('/academy/#'));
});

test('buildCard routeert consultancy/technology cross-page', () => {
  assert.equal(
    buildCard({ offer_key: 'implementatietraject', waarom: 'x', vervolg_keys: [] }).href,
    '/consultancy/#co-aanvraag'
  );
  assert.equal(
    buildCard({ offer_key: 'maatwerk', waarom: 'x', vervolg_keys: [] }).href,
    '/technology/#te-aanvraag'
  );
});

test('buildCard negeert onbekende vervolg_keys en ontbrekende waarom', () => {
  const card = buildCard({ offer_key: 'basis', vervolg_keys: ['nep'] });
  assert.equal(card.vervolg.length, 0);
  assert.equal(card.waarom, '');
});
