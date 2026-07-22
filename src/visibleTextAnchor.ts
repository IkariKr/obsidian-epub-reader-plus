import type { Contents } from 'epubjs';

export interface VisibleTextPoint {
  left: number;
  offset: number;
  top: number;
}

interface VisibleTextCandidate extends VisibleTextPoint {
  node: Text;
}

interface VisibleBounds {
  bottom: number;
  left: number;
  right: number;
  top: number;
}

/**
 * 从可见字符中选择最靠上、最靠左的字符作为阅读锚点。
 * Chooses the topmost, then leftmost, visible character as the reading anchor.
 */
export function pickFirstVisibleTextPoint<T extends VisibleTextPoint>(points: readonly T[]): T | null {
  return points.reduce<T | null>((first, point) => {
    if (first == null || point.top < first.top || (point.top === first.top && point.left < first.left)) return point;
    return first;
  }, null);
}

/**
 * 将阅读器视口内的首个可见字符转换为精确 EPUB CFI。
 * Converts the first visible character in the reader viewport to an exact EPUB CFI.
 */
export function getFirstVisibleTextCfi(contents: Contents, readerViewport: Element): string | null {
  const document = contents.window.document;
  const iframe = contents.window.frameElement as HTMLIFrameElement | null;
  if (document.body == null || iframe == null) return null;

  const bounds = getVisibleBounds(contents.window, iframe, readerViewport);
  if (bounds == null) return null;

  const candidates: VisibleTextCandidate[] = [];
  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  let node = walker.nextNode() as Text | null;
  while (node != null) {
    const text = node.textContent ?? '';
    if (text.trim().length > 0 && nodeHasVisibleText(node, bounds, document)) {
      collectVisibleCharacters(node, bounds, document, candidates);
    }
    node = walker.nextNode() as Text | null;
  }

  const first = pickFirstVisibleTextPoint(candidates);
  if (first == null) return null;

  const range = document.createRange();
  range.setStart(first.node, first.offset);
  range.collapse(true);
  return contents.cfiFromRange(range);
}

function getVisibleBounds(contentWindow: Window, iframe: HTMLIFrameElement, readerViewport: Element): VisibleBounds | null {
  const frameRect = iframe.getBoundingClientRect();
  const viewportRect = readerViewport.getBoundingClientRect();
  if (frameRect.width <= 0 || frameRect.height <= 0) return null;

  const scaleX = contentWindow.innerWidth / frameRect.width;
  const scaleY = contentWindow.innerHeight / frameRect.height;
  return {
    bottom: (viewportRect.bottom - frameRect.top) * scaleY,
    left: (viewportRect.left - frameRect.left) * scaleX,
    right: (viewportRect.right - frameRect.left) * scaleX,
    top: (viewportRect.top - frameRect.top) * scaleY,
  };
}

function nodeHasVisibleText(node: Text, bounds: VisibleBounds, document: Document): boolean {
  const range = document.createRange();
  range.selectNodeContents(node);
  return Array.from(range.getClientRects()).some((rect) => isVisible(rect, bounds));
}

function collectVisibleCharacters(node: Text, bounds: VisibleBounds, document: Document, candidates: VisibleTextCandidate[]): void {
  const text = node.textContent ?? '';
  const range = document.createRange();
  for (let offset = 0; offset < text.length; offset += 1) {
    if (text[offset].trim().length === 0) continue;
    range.setStart(node, offset);
    range.setEnd(node, offset + 1);
    for (const rect of Array.from(range.getClientRects())) {
      if (isVisible(rect, bounds)) candidates.push({ left: rect.left, node, offset, top: rect.top });
    }
  }
}

function isVisible(rect: DOMRect, bounds: VisibleBounds): boolean {
  return rect.bottom > bounds.top && rect.top < bounds.bottom && rect.right > bounds.left && rect.left < bounds.right;
}
