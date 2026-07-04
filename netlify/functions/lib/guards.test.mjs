import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateChatRequest, MAX_MESSAGES, MAX_LEN } from './guards.mjs';

test('geldig verzoek wordt geaccepteerd', () => {
  const r = validateChatRequest({ messages: [{ role: 'user', content: 'hoi' }] });
  assert.equal(r.ok, true);
});

test('ontbrekende messages faalt', () => {
  assert.equal(validateChatRequest({}).ok, false);
});

test('lege messages faalt', () => {
  assert.equal(validateChatRequest({ messages: [] }).ok, false);
});

test('te veel berichten faalt', () => {
  const messages = Array.from({ length: MAX_MESSAGES + 1 }, () => ({ role: 'user', content: 'x' }));
  assert.equal(validateChatRequest({ messages }).ok, false);
});

test('te lang bericht faalt', () => {
  const messages = [{ role: 'user', content: 'x'.repeat(MAX_LEN + 1) }];
  assert.equal(validateChatRequest({ messages }).ok, false);
});

test('ongeldige rol faalt', () => {
  assert.equal(validateChatRequest({ messages: [{ role: 'system', content: 'x' }] }).ok, false);
});

test('niet-string content faalt', () => {
  assert.equal(validateChatRequest({ messages: [{ role: 'user', content: 42 }] }).ok, false);
});
