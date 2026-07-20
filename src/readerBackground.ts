export type ReaderBackgroundMode = 'theme' | 'custom';

export interface ReaderColors {
  background: string;
  text: string;
}

export interface ReloadableEpubView<TFile> {
  file: TFile;
  onLoadFile(file: TFile): Promise<void>;
}

/**
 * 根据用户背景设置和 Obsidian 主题变量解析阅读器颜色。
 * Resolves reader colors from the user background setting and Obsidian theme variables.
 */
export function resolveReaderColors(
  mode: ReaderBackgroundMode,
  customBackground: string,
  themeBackground: string,
  themeText: string,
): ReaderColors {
  return {
    background: mode === 'custom' && customBackground.length > 0 ? customBackground : themeBackground,
    text: themeText,
  };
}

/**
 * 重载所有已打开的 EPUB View，使设置立即生效。
 * Reloads every open EPUB View so the updated setting takes effect immediately.
 */
export async function refreshEpubViews<TFile>(views: Array<ReloadableEpubView<TFile>>): Promise<void> {
  await Promise.all(views.map((view) => view.onLoadFile(view.file)));
}
