import { test } from 'node:test';
import assert from 'node:assert/strict';
import { sse } from './sse.mjs';

test('sse formatteert een object als data-frame', () => {
  assert.equal(sse({ type: 'text', text: 'hoi' }), 'data: {"type":"text","text":"hoi"}\n\n');
});
