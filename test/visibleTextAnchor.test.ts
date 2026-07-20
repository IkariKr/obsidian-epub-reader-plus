import assert from 'node:assert/strict';
import test from 'node:test';
import { pickFirstVisibleTextPoint } from '../src/visibleTextAnchor.ts';

test('chooses the topmost and then leftmost visible text character as the anchor', () => {
  assert.deepEqual(pickFirstVisibleTextPoint([
    { left: 56, offset: 12, top: 84 },
    { left: 140, offset: 3, top: 44 },
    { left: 46, offset: 8, top: 44 },
  ]), { left: 46, offset: 8, top: 44 });
});

test('returns null when no text character is visible', () => {
  assert.equal(pickFirstVisibleTextPoint([]), null);
});
