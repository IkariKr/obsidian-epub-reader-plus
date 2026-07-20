export const MAX_READING_PAGE_WIDTH = 900;

export interface EpubRenderOptions {
  allowPopups: boolean;
  flow: 'paginated' | 'scrolled';
  manager?: 'continuous';
  spread?: 'none';
}

export interface ReaderHostDimensions {
  width: number;
  height: number;
}

/**
 * 返回当前阅读模式对应的 epub.js 渲染参数。
 * Returns the epub.js render options for the current reading mode.
 */
export function getEpubOptions(scrolled: boolean): EpubRenderOptions {
  if (scrolled) {
    return {
      allowPopups: true,
      flow: 'scrolled',
      manager: 'continuous',
    };
  }

  return {
    allowPopups: true,
    flow: 'paginated',
    spread: 'none',
  };
}

/**
 * 将阅读页限制在最大宽度内，并保留实际阅读区域的高度。
 * Caps the reading page width while preserving the actual reader-area height.
 */
export function getReaderHostDimensions(width: number, height: number): ReaderHostDimensions {
  return {
    width: Math.min(Math.max(width, 0), MAX_READING_PAGE_WIDTH),
    height: Math.max(height, 0),
  };
}

/**
 * 仅在 epub.js 的渲染 manager 就绪后返回可用于重排的尺寸。
 * Returns dimensions for reflow only after the epub.js rendition manager is ready.
 */
export function getResizeDimensions(managerReady: boolean, width: number, height: number): ReaderHostDimensions | null {
  if (!managerReady) return null;

  const dimensions = getReaderHostDimensions(width, height);
  return dimensions.width > 0 && dimensions.height > 0 ? dimensions : null;
}
