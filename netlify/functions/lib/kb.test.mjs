// netlify/functions/lib/kb.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { OFFERS, OFFER_KEYS, findOffer, buildSystemPrompt, buildCard } from './kb.mjs';

test('OFFER_KEYS bevat alle 10 aanbod-keys', () => {
  assert.equal(OFFER_KEYS.length, 10);
  assert.ok(OFFER_KEYS.includes('basis'));
  assert.ok(OFFER_KEYS.includes('masterclass'));
});

test('findOffer geeft het juiste aanbod terug', () => {
  const o = findOffer('basis');
  assert.equal(o.training, 'Basistraining AI');
  assert.ok(Array.isArray(o.bullets));
});

test('findOffer geeft null bij onbekende key', () => {
  assert.equal(findOffer('bestaat-niet'), null);
});

test('buildSystemPrompt bevat merknaam, aanbod en FAQ-instructie', () => {
  const p = buildSystemPrompt();
  assert.ok(p.includes('Morgen Academy'));
  assert.ok(p.includes('Basistraining AI'));
  assert.ok(p.includes('presenteer_advies'));
  assert.ok(p.includes('totmorgen@morgenacademy.nl'));
});

test('buildCard verrijkt een geldige tool-input tot een kaart', () => {
  const card = buildCard({ offer_key: 'basis', vervolg_keys: ['toolbuilding', 'workflows'] });
  assert.equal(card.training, 'Basistraining AI');
  assert.equal(card.vervolg.length, 2);
  assert.equal(card.vervolg[0].training, 'Bouwen met AI (vibecoding)');
});

test('buildCard negeert onbekende vervolg_keys', () => {
  const card = buildCard({ offer_key: 'basis', vervolg_keys: ['nep'] });
  assert.equal(card.vervolg.length, 0);
});
