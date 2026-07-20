import assert from 'node:assert/strict';
import test from 'node:test';
import { flattenToc, getTocSelection } from '../src/tocNavigation.ts';

test('flattens nested EPUB table-of-contents entries in reading order', () => {
  assert.deepEqual(flattenToc([
    {
      label: '第一部分',
      href: 'part-1.xhtml',
      subitems: [
        { label: '第一章', href: 'chapter-1.xhtml' },
        { label: '第二章', href: 'chapter-2.xhtml' },
      ],
    },
    { label: '第二部分', href: 'part-2.xhtml' },
  ]), [
    { label: '第一部分', href: 'part-1.xhtml' },
    { label: '第一章', href: 'chapter-1.xhtml' },
    { label: '第二章', href: 'chapter-2.xhtml' },
    { label: '第二部分', href: 'part-2.xhtml' },
  ]);
});

test('selecting a table-of-contents entry navigates while keeping the panel open', () => {
  assert.deepEqual(getTocSelection('chapter-2.xhtml'), {
    location: 'chapter-2.xhtml',
    tocOpen: true,
  });
});
