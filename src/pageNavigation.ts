export type PageNavigationDirection = 'previous' | 'next';

export interface PageableRendition {
  prev(): unknown;
  next(): unknown;
}

/**
 * 根据阅读方向调用 EPUB 渲染器的翻页方法。
 * Invokes the EPUB rendition operation for the requested page direction.
 */
export function navigatePage(direction: PageNavigationDirection, rendition: PageableRendition): void {
  if (direction === 'previous') {
    rendition.prev();
  } else {
    rendition.next();
  }
}
