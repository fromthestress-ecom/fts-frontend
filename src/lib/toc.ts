export interface TocEntry {
  id: string;
  text: string;
  level: number;
}

export function extractHeadings(markdown: string): TocEntry[] {
  const headingRegex = /^(#{2,4})\s+(.+)$/gm;
  const headings: TocEntry[] = [];
  let match;
  while ((match = headingRegex.exec(markdown)) !== null) {
    const level = match[1].length;
    let text = match[2].trim();
    text = text.replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1").replace(/[*_]/g, "");

    const id = generateSlug(text);

    headings.push({ id, text, level });
  }
  return headings;
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
