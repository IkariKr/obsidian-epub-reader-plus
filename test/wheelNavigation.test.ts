import assert from 'node:assert/strict';
import test from 'node:test';
import { getWheelPageAction } from '../src/wheelNavigation.ts';

test('pagination mode maps a downward wheel movement to the next page', () => {
  assert.equal(getWheelPageAction({
    deltaY: 120,
    isPaginated: true,
    enabled: true,
    isModified: false,
    now: 1000,
    lastTurnAt: 0,
  }), 'next');
});

test('pagination mode maps an upward wheel movement to the previous page', () => {
  assert.equal(getWheelPageAction({
    deltaY: -120,
    isPaginated: true,
    enabled: true,
    isModified: false,
    now: 1000,
    lastTurnAt: 0,
  }), 'prev');
});

test('continuous reading, modifier keys, and the cooldown do not turn a page', () => {
  const commonInput = {
    deltaY: 120,
    enabled: true,
    isModified: false,
    now: 1200,
    lastTurnAt: 1000,
  };

  assert.equal(getWheelPageAction({ ...commonInput, isPaginated: false }), null);
  assert.equal(getWheelPageAction({ ...commonInput, isPaginated: true, isModified: true }), null);
  assert.equal(getWheelPageAction({ ...commonInput, isPaginated: true }), null);
});
