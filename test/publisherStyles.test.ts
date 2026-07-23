import assert from 'node:assert/strict';
import test from 'node:test';
import {
  getPublisherStyleSheetUrls,
  injectPublisherStyles,
  PUBLISHER_STYLE_MARKER_ATTRIBUTE,
} from '../src/publisherStyles.ts';

test('collects every publisher stylesheet once in document order', () => {
  assert.deepEqual(getPublisherStyleSheetUrls([
    { href: 'blob:one' },
    { href: 'blob:two' },
    { href: 'blob:one' },
    { href: '' },
  ]), ['blob:one', 'blob:two']);
});

test('injects publisher styles once and reports that a reflow is needed', async () => {
  const attributes = new Map<string, string>();
  const styles: Array<{ textContent: string }> = [];
  class TestStyleSheet {
    textContent = '';

    async replace(css: string): Promise<void> {
      this.textContent = css;
    }
  }
  const document = {
    documentElement: {
      hasAttribute: (name) => attributes.has(name),
      removeAttribute: (name) => attributes.delete(name),
      setAttribute: (name, value) => attributes.set(name, value),
    },
    adoptedStyleSheets: styles,
    defaultView: {
      CSSStyleSheet: TestStyleSheet,
    },
    querySelectorAll: () => [{ href: 'blob:one' }, { href: 'blob:two' }],
  } as unknown as Document;
  const load = async (href: string) => ({ ok: true, text: async () => `${href} { color: red; }` });

  assert.equal(await injectPublisherStyles(document, load), true);
  assert.deepEqual(document.adoptedStyleSheets.map((style) => style.textContent), [
    'blob:one { color: red; }',
    'blob:two { color: red; }',
  ]);
  assert.equal(attributes.get(PUBLISHER_STYLE_MARKER_ATTRIBUTE), 'applied');
  assert.equal(await injectPublisherStyles(document, load), false);
  assert.equal(document.adoptedStyleSheets.length, 2);
});
