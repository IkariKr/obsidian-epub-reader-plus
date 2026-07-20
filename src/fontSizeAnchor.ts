export interface ReaderLocation {
  start?: {
    cfi?: string;
  };
}

export interface FontSizeRendition {
  themes: {
    fontSize(size: string): unknown;
  };
}

export type FrameScheduler = (callback: FrameRequestCallback) => number;

/**
 * 仅在分页阅读器完成初始化后恢复 CFI，避免初始渲染读取未创建的 manager。
 * Restores a CFI only after a paginated reader is initialized to avoid reading an unavailable manager during initial rendering.
 */
export function shouldPreserveFontSizeAnchor(scrolled: boolean, managerReady: boolean): boolean {
  return !scrolled && managerReady;
}

/**
 * 为一次连续字号调整保留初始阅读页的起始 CFI。
 * Keeps the initial page-start CFI for one continuous font-size adjustment.
 */
export function getFontSizeAnchor(existingAnchor: string | null, location: ReaderLocation | undefined): string | null {
  return existingAnchor ?? location?.start?.cfi ?? null;
}

/**
 * 在固定 CFI 的前提下调整字号并重排，避免分页阅读跳离当前内容。
 * Changes the font size and reflows at a fixed CFI to keep paginated reading on the current content.
 */
export function reflowFontSizeAtAnchor(
  rendition: FontSizeRendition,
  size: number,
  anchor: string | null,
  resize: (anchor: string | null) => void,
  schedule: FrameScheduler,
): void {
  rendition.themes.fontSize(`${size}%`);
  schedule(() => {
    resize(anchor);
  });
}
