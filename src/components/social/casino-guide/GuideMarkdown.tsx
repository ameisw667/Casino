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
  const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`|(?:\$|\\\()[^$\n]+?(?:\$|\\\)))/g;
  const tokens = cleaned.split(regex);

  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (!token) continue;
    if (token.startsWith('**') && token.endsWith('**') && token.length > 4) {
      parts.push(
        <strong key={i} style={{ color: '#D4AF37', fontWeight: 700 }}>
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
            background: 'rgba(212, 175, 55, 0.12)',
            border: '1px solid rgba(212, 175, 55, 0.28)',
            color: '#F4D068',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontSize: '0.78rem',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          {token.slice(1, -1)}
        </code>,
      );
    } else if (
      ((token.startsWith('$') && token.endsWith('$') && token.length > 2) ||
        (token.startsWith('\\(') && token.endsWith('\\)') && token.length > 4)) &&
      !token.includes('\n')
    ) {
      const mathInner = token.startsWith('\\(') ? token.slice(2, -2) : token.slice(1, -1);
      parts.push(
        <span
          key={i}
          style={{
            display: 'inline-block',
            padding: '1px 5.5px',
            borderRadius: '4px',
            background: 'rgba(212, 175, 55, 0.12)',
            border: '1px solid rgba(212, 175, 55, 0.28)',
            color: '#F4D068',
            fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            fontSize: '0.78rem',
            fontVariantNumeric: 'tabular-nums',
            fontWeight: 600,
          }}
        >
          {cleanLatexMath(mathInner)}
        </span>,
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
          border: '1px solid rgba(212, 175, 55, 0.28)',
          background: 'rgba(11, 14, 20, 0.65)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.35)',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: '0.78rem',
            textAlign: 'left',
            fontVariantNumeric: 'tabular-nums',
          }}
        >
          <thead>
            <tr
              style={{
                background:
                  'linear-gradient(90deg, rgba(212, 175, 55, 0.22) 0%, rgba(212, 175, 55, 0.08) 100%)',
              }}
            >
              {headerRow.map((col, idx) => (
                <th
                  key={idx}
                  style={{
                    padding: '7px 10px',
                    color: '#D4AF37',
                    fontWeight: 700,
                    fontSize: '0.72rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.06em',
                    borderBottom: '1px solid rgba(212, 175, 55, 0.30)',
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
                    rIdx < bodyRows.length - 1 ? '1px solid rgba(212, 175, 55, 0.10)' : 'none',
                  background: rIdx % 2 === 1 ? 'rgba(212, 175, 55, 0.04)' : 'transparent',
                }}
              >
                {row.map((cell, cIdx) => (
                  <td
                    key={cIdx}
                    style={{
                      padding: '7px 10px',
                      color: 'rgba(255, 255, 255, 0.88)',
                      fontVariantNumeric: 'tabular-nums',
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
          fontVariantNumeric: 'tabular-nums',
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
            color: '#D4AF37',
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
            margin: '8px 0',
            borderRadius: '8px',
            background:
              'linear-gradient(180deg, rgba(18, 24, 38, 0.85) 0%, rgba(11, 14, 20, 0.90) 100%)',
            border: '1px solid rgba(212, 175, 55, 0.35)',
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.4), inset 0 1px 0 rgba(212, 175, 55, 0.15)',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '4px 10px',
              background: 'rgba(212, 175, 55, 0.12)',
              borderBottom: '1px solid rgba(212, 175, 55, 0.20)',
            }}
          >
            <span
              style={{
                fontSize: '0.52rem',
                fontWeight: 700,
                color: '#D4AF37',
                textTransform: 'uppercase',
                letterSpacing: '0.10em',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
              }}
            >
              <span>Σ</span> Quoten- & Wahrscheinlichkeits-Formel
            </span>
            <span
              style={{
                fontSize: '0.50rem',
                fontWeight: 600,
                color: 'rgba(255, 255, 255, 0.45)',
                letterSpacing: '0.04em',
              }}
            >
              Provably Fair / EV
            </span>
          </div>
          <div
            style={{
              padding: '8px 12px',
              fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
              fontSize: '0.82rem',
              fontWeight: 600,
              color: '#F4D068',
              letterSpacing: '0.02em',
              textAlign: 'center',
              fontVariantNumeric: 'tabular-nums',
            }}
          >
            {formulaText}
          </div>
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
          fontVariantNumeric: 'tabular-nums',
        }}
      >
        {parseInlineMarkdown(trimmed)}
      </p>,
    );
  }

  flushTable(lines.length);
  flushList(lines.length);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        fontVariantNumeric: 'tabular-nums',
        fontFeatureSettings: '"tnum" on, "cv02" on, "cv03" on, "cv04" on',
      }}
    >
      {elements}
    </div>
  );
}

export { cleanLatexMath, parseInlineMarkdown, MarkdownMessage };
