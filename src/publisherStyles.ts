export const PUBLISHER_STYLE_MARKER_ATTRIBUTE = 'data-obsidian-epub-publisher-styles';

export interface PublisherStyleSheetResponse {
  ok: boolean;
  text(): Promise<string>;
}

export type PublisherStyleSheetLoader = (href: string) => Promise<PublisherStyleSheetResponse>;

/**
 * 收集并去重章节中声明的出版社样式表地址。
 * Collects and de-duplicates publisher stylesheet URLs declared by a section.
 */
export function getPublisherStyleSheetUrls(links: ArrayLike<Pick<HTMLLinkElement, 'href'>>): string[] {
  return Array.from(links)
    .map((link) => link.href)
    .filter((href, index, all) => href.length > 0 && all.indexOf(href) === index);
}

/**
 * 将 EPUB 的 blob 样式表复制到章节文档内，绕过 Obsidian srcdoc 环境下的失效链接样式表。
 * Copies EPUB blob stylesheets into the section document to work around inactive linked stylesheets in Obsidian's srcdoc environment.
 */
export async function injectPublisherStyles(
  document: Document,
  loadStyleSheet: PublisherStyleSheetLoader,
): Promise<boolean> {
  if (document.documentElement.hasAttribute(PUBLISHER_STYLE_MARKER_ATTRIBUTE)) return false;

  document.documentElement.setAttribute(PUBLISHER_STYLE_MARKER_ATTRIBUTE, 'pending');
  const links = Array.from(document.querySelectorAll<HTMLLinkElement>('link[rel~="stylesheet"][href]'));
  const urls = getPublisherStyleSheetUrls(links);
  const cssTexts = await Promise.all(urls.map(async (url) => {
    try {
      const response = await loadStyleSheet(url);
      return response.ok ? await response.text() : '';
    } catch {
      return '';
    }
  }));
  const styles = cssTexts.filter((css) => css.length > 0);

  if (styles.length === 0) {
    document.documentElement.removeAttribute(PUBLISHER_STYLE_MARKER_ATTRIBUTE);
    return false;
  }

  styles.forEach((css, index) => {
    const style = document.createElement('style');
    style.id = `obsidian-epub-publisher-style-${index}`;
    style.setAttribute(PUBLISHER_STYLE_MARKER_ATTRIBUTE, 'true');
    style.textContent = css;
    document.head.appendChild(style);
  });
  document.documentElement.setAttribute(PUBLISHER_STYLE_MARKER_ATTRIBUTE, 'applied');
  return true;
}
