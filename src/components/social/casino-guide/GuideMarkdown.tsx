'use client';

function cleanLatexMath(text: string): string {
  return text
    .replace(/\\text\{([^}]+)\}/g, '$1')
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '$1 / $2')
    .replace(/\\[\[\]()]/g, '')
    .trim();
}

function parseInlineMarkdown(text: string): React.ReactNode[] {
  const parts: React.ReactNode[] = [];
  const cleaned = text.replace(/\\text\{([^}]+)\}/g, '$1');
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
  const tokens = cleaned.split(regex);

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (!token) continue;
    if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
      parts.push(
        <strong key={i} style={{ color: 'hsl(var(--primary))', fontWeight: 700 }}>
          {token.slice(2, -2)}
        </strong>,
      );
    } else if (token.startsWith('*') && token.endsWith('*') && token.length > 2) {
      parts.push(
        <em key={i} style={{ fontStyle: 'italic', color: 'hsl(var(--text-main))' }}>
          {token.slice(1, -1)}
        </em>,
      );
    } else if (token.startsWith('`') && token.endsWith('`') && token.length > 2) {
      parts.push(
        <code
          key={i}
          style={{
            padding: '1.5px 6px',
            borderRadius: '4px',
            background: 'hsla(var(--primary), 0.15)',
            border: '1px solid hsla(var(--primary), 0.28)',
            color: 'hsl(var(--primary))',
            fontFamily: 'monospace',
            fontSize: '0.78rem',
          }}
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else {
      parts.push(token);
    }
  }
  return parts;
}

function MarkdownMessage({ content }: { content: string }) {
  const lines = content.split('\n');
  const elements: React.ReactNode[] = [];
  let tableBuffer: string[] = [];
  let listBuffer: string[] = [];

  const flushTable = (keyIndex: number) => {
    if (tableBuffer.length === 0) return;
    const headerRow = tableBuffer[0]
      .split('|')
      .map((c) => c.trim())
      .filter(Boolean);
    const bodyRows = tableBuffer.slice(2).map((row) =>
      row
        .split('|')
        .map((c) => c.trim())
        .filter(Boolean),
    );

    elements.push(
      <div
        key={`tbl-${keyIndex}`}
        style={{
          margin: '8px 0',
          overflowX: 'auto',
          borderRadius: '8px',
          border: '1px solid hsla(var(--primary), 0.25)',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.78rem',
            textAlign: 'left',
          }}
        >
          <thead>
            <tr style={{ background: 'hsla(var(--primary), 0.14)' }}>
              {headerRow.map((col, idx) => (
                <th
                  key={idx}
                  style={{
                    padding: '6px 10px',
                    color: 'hsl(var(--primary))',
                    fontWeight: 700,
                    borderBottom: '1px solid hsla(var(--primary), 0.25)',
                  }}
                >
                  {parseInlineMarkdown(col)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {bodyRows.map((row, rIdx) => (
              <tr
                key={rIdx}
                style={{
                  borderBottom:
                    rIdx < bodyRows.length - 1 ? '1px solid hsla(var(--primary), 0.1)' : 'none',
                  background: rIdx % 2 === 1 ? 'hsla(var(--primary), 0.03)' : 'transparent',
                }}
              >
                {row.map((cell, cIdx) => (
                  <td
                    key={cIdx}
                    style={{
                      padding: '6px 10px',
                      color: 'hsl(var(--text-main))',
                    }}
                  >
                    {parseInlineMarkdown(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>,
    );
    tableBuffer = [];
  };

  const flushList = (keyIndex: number) => {
    if (listBuffer.length === 0) return;
    elements.push(
      <ul
        key={`list-${keyIndex}`}
        style={{
          margin: '6px 0',
          paddingLeft: '18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '5px',
          fontSize: '0.80rem',
          lineHeight: 1.55,
        }}
      >
        {listBuffer.map((item, lIdx) => (
          <li key={lIdx} style={{ listStyleType: 'disc' }}>
            {parseInlineMarkdown(item)}
          </li>
        ))}
      </ul>,
    );
    listBuffer = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const rawLine = lines[i];
    const trimmed = rawLine.trim();

    // Table detection
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushList(i);
      tableBuffer.push(trimmed);
      continue;
    } else {
      flushTable(i);
    }

    // List item detection (- item, * item, or 1. item)
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      listBuffer.push(trimmed.slice(2));
      continue;
    } else if (/^\d+\.\s/.test(trimmed)) {
      listBuffer.push(trimmed.replace(/^\d+\.\s/, ''));
      continue;
    } else {
      flushList(i);
    }

    // Empty line / separator
    if (!trimmed || trimmed === '-') {
      continue;
    }

    // Heading detection (#, ##, ###, ####)
    if (/^#{1,4}\s+/.test(trimmed)) {
      const headingText = trimmed.replace(/^#{1,4}\s+/, '');
      elements.push(
        <h4
          key={`h-${i}`}
          style={{
            fontSize: '0.86rem',
            fontWeight: 700,
            color: 'hsl(var(--primary))',
            margin: '10px 0 4px 0',
            letterSpacing: '0.02em',
            textWrap: 'balance',
          }}
        >
          {parseInlineMarkdown(headingText)}
        </h4>,
      );
      continue;
    }

    // Formula / Math block (\[ ... \] or $$ ... $$)
    if (
      (trimmed.startsWith('\\[') && trimmed.endsWith('\\]')) ||
      (trimmed.startsWith('$$') && trimmed.endsWith('$$'))
    ) {
      const formulaText = cleanLatexMath(trimmed);
      elements.push(
        <div
          key={`math-${i}`}
          style={{
            margin: '6px 0',
            padding: '6px 12px',
            borderRadius: '6px',
            background: 'hsla(var(--primary), 0.08)',
            border: '1px solid hsla(var(--primary), 0.22)',
            fontFamily: 'monospace',
            fontSize: '0.78rem',
            color: 'hsl(var(--primary))',
            textAlign: 'center',
          }}
        >
          {formulaText}
        </div>,
      );
      continue;
    }

    // Regular paragraph
    elements.push(
      <p
        key={`p-${i}`}
        style={{
          margin: '4px 0',
          fontSize: '0.80rem',
          lineHeight: 1.55,
          textWrap: 'pretty',
        }}
      >
        {parseInlineMarkdown(trimmed)}
      </p>,
    );
  }

  flushTable(lines.length);
  flushList(lines.length);

  return <div style={{ display: 'flex', flexDirection: 'column' }}>{elements}</div>;
}

export { cleanLatexMath, parseInlineMarkdown, MarkdownMessage };
