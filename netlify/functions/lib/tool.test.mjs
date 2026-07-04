// netlify/functions/lib/tool.test.mjs
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { presenteerAdviesTool } from './tool.mjs';
import { OFFER_KEYS } from './kb.mjs';

test('tool heet presenteer_advies en is strict', () => {
  assert.equal(presenteerAdviesTool.name, 'presenteer_advies');
  assert.equal(presenteerAdviesTool.strict, true);
});

test('offer_key enum bevat exact de KB-keys', () => {
  const enumKeys = presenteerAdviesTool.input_schema.properties.offer_key.enum;
  assert.deepEqual([...enumKeys].sort(), [...OFFER_KEYS].sort());
});

test('vervolg_keys is een array met dezelfde enum', () => {
  const items = presenteerAdviesTool.input_schema.properties.vervolg_keys.items;
  assert.deepEqual([...items.enum].sort(), [...OFFER_KEYS].sort());
});

test('schema staat geen extra properties toe', () => {
  assert.equal(presenteerAdviesTool.input_schema.additionalProperties, false);
});
