import assert from 'node:assert/strict';
import test from 'node:test';
import { refreshEpubViews, resolveReaderColors } from '../src/readerBackground.ts';

test('theme mode uses Obsidian theme background and text colors', () => {
  assert.deepEqual(resolveReaderColors('theme', '#123456', '#fbfaf8', '#2d2b29'), {
    background: '#fbfaf8',
    text: '#2d2b29',
  });
});

test('custom mode replaces only the reader background color', () => {
  assert.deepEqual(resolveReaderColors('custom', '#123456', '#fbfaf8', '#2d2b29'), {
    background: '#123456',
    text: '#2d2b29',
  });
});

test('refreshes every open EPUB view with its current file', async () => {
  const loaded: string[] = [];
  await refreshEpubViews([
    { file: 'first.epub', onLoadFile: async (file) => { loaded.push(file); } },
    { file: 'second.epub', onLoadFile: async (file) => { loaded.push(file); } },
  ]);

  assert.deepEqual(loaded, ['first.epub', 'second.epub']);
});
