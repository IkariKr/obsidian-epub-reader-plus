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
  const styles: Array<{ id: string; textContent: string; attributes: Map<string, string> }> = [];
  const document = {
    documentElement: {
      hasAttribute: (name) => attributes.has(name),
      removeAttribute: (name) => attributes.delete(name),
      setAttribute: (name, value) => attributes.set(name, value),
    },
    head: {
      appendChild: (style: unknown) => styles.push(style as typeof styles[number]),
    },
    createElement: () => {
      const style = { id: '', textContent: '', attributes: new Map<string, string>(), setAttribute(name: string, value: string) { this.attributes.set(name, value); } };
      return style;
    },
    querySelectorAll: () => [{ href: 'blob:one' }, { href: 'blob:two' }],
  } as unknown as Document;
  const load = async (href: string) => ({ ok: true, text: async () => `${href} { color: red; }` });

  assert.equal(await injectPublisherStyles(document, load), true);
  assert.deepEqual(styles.map((style) => style.textContent), [
    'blob:one { color: red; }',
    'blob:two { color: red; }',
  ]);
  assert.equal(attributes.get(PUBLISHER_STYLE_MARKER_ATTRIBUTE), 'applied');
  assert.equal(await injectPublisherStyles(document, load), false);
  assert.equal(styles.length, 2);
});
