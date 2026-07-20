import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getFontSizeAnchor,
  reflowFontSizeAtAnchor,
  shouldPreserveFontSizeAnchor,
} from '../src/fontSizeAnchor.ts';

test('waits for a paginated rendition manager before reading a font-size anchor', () => {
  assert.equal(shouldPreserveFontSizeAnchor(false, false), false);
  assert.equal(shouldPreserveFontSizeAnchor(true, true), false);
  assert.equal(shouldPreserveFontSizeAnchor(false, true), true);
});

test('uses the current page start CFI as the initial font-size anchor', () => {
  assert.equal(getFontSizeAnchor(null, { start: { cfi: 'epubcfi(/6/8!/4/2)' } }), 'epubcfi(/6/8!/4/2)');
  assert.equal(getFontSizeAnchor(null, undefined), null);
});

test('keeps the first anchor for the duration of one slider adjustment', () => {
  assert.equal(
    getFontSizeAnchor('epubcfi(/6/8!/4/2)', { start: { cfi: 'epubcfi(/6/12!/4/2)' } }),
    'epubcfi(/6/8!/4/2)',
  );
});

test('passes the page-start anchor directly into the font-size reflow', () => {
  const calls: string[] = [];
  const rendition = {
    themes: { fontSize: (size: string) => calls.push(`font:${size}`) },
  };

  reflowFontSizeAtAnchor(rendition, 120, 'epubcfi(/6/8!/4/2)', (anchor) => calls.push(`resize:${anchor}`), (callback) => callback());

  assert.deepEqual(calls, [
    'font:120%',
    'resize:epubcfi(/6/8!/4/2)',
  ]);
});

test('reflows without a display operation when there is no current location', () => {
  const calls: string[] = [];
  const rendition = {
    themes: { fontSize: (size: string) => calls.push(`font:${size}`) },
  };

  reflowFontSizeAtAnchor(rendition, 80, null, (anchor) => calls.push(`resize:${anchor}`), (callback) => callback());

  assert.deepEqual(calls, ['font:80%', 'resize:null']);
});
