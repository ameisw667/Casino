export type RawFrontmatter = {
  id?: string;
  version?: string;
  topic?: string;
  title?: string;
  tags?: string[];
  owner?: string;
  reviewedAt?: string;
  status?: string;
  [key: string]: unknown;
};

export type ParsedMarkdownDoc = {
  frontmatter: RawFrontmatter;
  content: string;
};

/**
 * Robust zero-dependency parser for YAML frontmatter in markdown files.
 * Extracts metadata between leading `---` delimiters and returns body content.
 */
export function parseFrontmatter(rawText: string): ParsedMarkdownDoc {
  const trimmed = rawText.trim();
  if (!trimmed.startsWith('---')) {
    return { frontmatter: {}, content: trimmed };
  }

  const endIndex = trimmed.indexOf('---', 3);
  if (endIndex === -1) {
    return { frontmatter: {}, content: trimmed };
  }

  const yamlBlock = trimmed.slice(3, endIndex).trim();
  const content = trimmed.slice(endIndex + 3).trim();
  const frontmatter: RawFrontmatter = {};

  const lines = yamlBlock.split('\n');
  let currentArrayKey: string | null = null;

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine || trimmedLine.startsWith('#')) continue;

    // Handle YAML list item e.g. "- tag1"
    if (trimmedLine.startsWith('- ') && currentArrayKey) {
      const itemVal = trimmedLine
        .slice(2)
        .trim()
        .replace(/^['"]|['"]$/g, '');
      const existing = Array.isArray(frontmatter[currentArrayKey])
        ? (frontmatter[currentArrayKey] as string[])
        : [];
      existing.push(itemVal);
      frontmatter[currentArrayKey] = existing;
      continue;
    }

    const colonIndex = trimmedLine.indexOf(':');
    if (colonIndex === -1) continue;

    const key = trimmedLine.slice(0, colonIndex).trim();
    let value = trimmedLine.slice(colonIndex + 1).trim();

    // Check inline array e.g. tags: [a, b, c]
    if (value.startsWith('[') && value.endsWith(']')) {
      const items = value
        .slice(1, -1)
        .split(',')
        .map((s) => s.trim().replace(/^['"]|['"]$/g, ''))
        .filter(Boolean);
      frontmatter[key] = items;
      currentArrayKey = null;
    } else if (value === '') {
      // Key with subsequent array items
      currentArrayKey = key;
      frontmatter[key] = [];
    } else {
      // Scalar value
      value = value.replace(/^['"]|['"]$/g, '');
      frontmatter[key] = value;
      currentArrayKey = null;
    }
  }

  return { frontmatter, content };
}
