import assert from 'node:assert/strict';
import test from 'node:test';
import { navigatePage } from '../src/pageNavigation.ts';

test('previous-page controls invoke the rendition previous-page operation', () => {
  let previousCalls = 0;
  let nextCalls = 0;

  navigatePage('previous', {
    prev: () => { previousCalls += 1; },
    next: () => { nextCalls += 1; },
  });

  assert.equal(previousCalls, 1);
  assert.equal(nextCalls, 0);
});

test('next-page controls invoke the rendition next-page operation', () => {
  let previousCalls = 0;
  let nextCalls = 0;

  navigatePage('next', {
    prev: () => { previousCalls += 1; },
    next: () => { nextCalls += 1; },
  });

  assert.equal(previousCalls, 0);
  assert.equal(nextCalls, 1);
});
