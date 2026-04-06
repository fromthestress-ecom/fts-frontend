export interface TocEntry {
  id: string;
  text: string;
  level: number;
}

/**
 * Nhận diện content là HTML hay Markdown
 * HTML: bắt đầu bằng '<' hoặc có thẻ HTML phổ biến
 */
export function isHtmlContent(content: string): boolean {
  const trimmed = content.trim();
  return trimmed.startsWith("<") || /<(p|h[1-6]|ul|ol|div|strong|em|blockquote)\b/i.test(trimmed);
}

/**
 * Decode HTML entities thành ký tự thực
 * Cần thiết vì Quill dùng &nbsp; thay vì space thường
 */
function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#039;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&#(\d+);/g, (_match, dec) => String.fromCharCode(Number(dec)))
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Trích xuất headings từ Markdown (## heading)
 */
function extractHeadingsFromMarkdown(markdown: string): TocEntry[] {
  const headingRegex = /^(#{2,4})\s+(.+)$/gm;
  const headings: TocEntry[] = [];
  let match;
  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    let text = match[2].trim();
    text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1").replace(/[*_]/g, "");
    headings.push({ id: generateSlug(text), text, level });
  }
  return headings;
}

/**
 * Trích xuất headings từ HTML (<h2>, <h3>, <h4>)
 * Decode &nbsp; và entities khác từ Quill output
 */
function extractHeadingsFromHtml(html: string): TocEntry[] {
  const headingRegex = /<h([2-4])[^>]*>([\s\S]*?)<\/h[2-4]>/gi;
  const headings: TocEntry[] = [];
  let match;
  while ((match = headingRegex.exec(html)) !== null) {
    const level = parseInt(match[1], 10);
    // Strip inner HTML tags → decode entities → lấy text thuần
    const rawText = match[2].replace(/<[^>]+>/g, "");
    const text = decodeHtmlEntities(rawText);
    if (text) {
      headings.push({ id: generateSlug(text), text, level });
    }
  }
  return headings;
}

/**
 * Hàm tổng hợp: tự detect định dạng rồi trích xuất headings
 * Tương thích ngược với cả bài cũ (Markdown) lẫn bài mới (HTML)
 */
export function extractHeadings(content: string): TocEntry[] {
  if (isHtmlContent(content)) {
    return extractHeadingsFromHtml(content);
  }
  return extractHeadingsFromMarkdown(content);
}

export function generateSlug(text: string) {
  return text
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "D")
    .toLowerCase()
    .trim()
    .replace(/[\s_]+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

export function extractText(children: any): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(extractText).join("");
  if (children?.props?.children) return extractText(children.props.children);
  return "";
}
