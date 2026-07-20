import assert from 'node:assert/strict';
import test from 'node:test';
import {
  MAX_READING_PAGE_WIDTH,
  getEpubOptions,
  getReaderHostDimensions,
  getResizeDimensions,
} from '../src/paginationLayout.ts';

test('paginated reading disables spreads while scrolling retains continuous flow', () => {
  assert.deepEqual(getEpubOptions(false), {
    allowPopups: true,
    flow: 'paginated',
    spread: 'none',
  });
  assert.deepEqual(getEpubOptions(true), {
    allowPopups: true,
    flow: 'scrolled',
    manager: 'continuous',
  });
});

test('the centered reader page is capped at the configured maximum width', () => {
  assert.equal(MAX_READING_PAGE_WIDTH, 900);
  assert.deepEqual(getReaderHostDimensions(1440, 800), { width: 900, height: 800 });
  assert.deepEqual(getReaderHostDimensions(640, 800), { width: 640, height: 800 });
});

test('font-size reflow uses unchanged reader host dimensions', () => {
  const beforeFontChange = getReaderHostDimensions(522, 729);
  const afterFontChange = getReaderHostDimensions(522, 729);

  assert.deepEqual(afterFontChange, beforeFontChange);
});

test('reflow waits until epub.js has initialized its rendition manager', () => {
  assert.equal(getResizeDimensions(false, 900, 760), null);
  assert.deepEqual(getResizeDimensions(true, 900, 760), { width: 900, height: 760 });
  assert.deepEqual(getResizeDimensions(true, 522, 729), { width: 522, height: 729 });
});
