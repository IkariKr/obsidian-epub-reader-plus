export interface TocItem {
  label: string;
  href: string;
  subitems?: TocItem[];
}

export interface TocEntry {
  label: string;
  href: string;
}

export interface TocSelection {
  location: string;
  tocOpen: false;
}

/**
 * 将 EPUB 嵌套目录按阅读顺序转为平铺条目。
 * Flattens a nested EPUB table of contents into reading-order entries.
 */
export function flattenToc(items: TocItem[]): TocEntry[] {
  const entries: TocEntry[] = [];
  items.forEach((item) => {
    entries.push({ label: item.label, href: item.href });
    entries.push(...flattenToc(item.subitems ?? []));
  });
  return entries;
}

/**
 * 返回目录点击后的导航状态。
 * Returns the navigation state after selecting a table-of-contents entry.
 */
export function getTocSelection(href: string): TocSelection {
  return { location: href, tocOpen: true };
}
