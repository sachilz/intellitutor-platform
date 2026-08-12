import React from 'react';

/**
 * Parses inline markdown formatting (bold, italic, inline code, links) into React elements.
 */
export const renderInlineMarkdown = (str) => {
  if (!str) return str;

  const parts = [];
  let remaining = str;
  let key = 0;

  // Matches: `code`, ***bold italic***, **bold**, *italic*, [text](url)
  const regex = /(`[^`]+`)|\*\*\*([^*]+)\*\*\*|\*\*([^*]+)\*\*|\*([^*]+)\*|\[([^\]]+)\]\(([^)]+)\)/g;
  let lastIndex = 0;
  let match;

  while ((match = regex.exec(remaining)) !== null) {
    if (match.index > lastIndex) {
      parts.push(<span key={key++}>{remaining.slice(lastIndex, match.index)}</span>);
    }

    if (match[1]) {
      // Inline code `code`
      parts.push(
        <code
          key={key++}
          style={{
            background: 'rgba(99, 102, 241, 0.15)',
            color: '#a5b4fc',
            padding: '2px 6px',
            borderRadius: '4px',
            fontSize: '0.84em',
            fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
            border: '1px solid rgba(99, 102, 241, 0.25)',
          }}
        >
          {match[1].slice(1, -1)}
        </code>
      );
    } else if (match[2]) {
      // Bold Italic ***text***
      parts.push(
        <strong key={key++} style={{ fontWeight: 700, fontStyle: 'italic', color: '#f8fafc' }}>
          {match[2]}
        </strong>
      );
    } else if (match[3]) {
      // Bold **text**
      parts.push(
        <strong key={key++} style={{ fontWeight: 700, color: '#f8fafc' }}>
          {match[3]}
        </strong>
      );
    } else if (match[4]) {
      // Italic *text*
      parts.push(
        <em key={key++} style={{ fontStyle: 'italic', color: '#e2e8f0' }}>
          {match[4]}
        </em>
      );
    } else if (match[5] && match[6]) {
      // Link [text](url)
      parts.push(
        <a
          key={key++}
          href={match[6]}
          target="_blank"
          rel="noreferrer"
          style={{
            color: '#818cf8',
            textDecoration: 'underline',
            fontWeight: 500,
          }}
        >
          {match[5]}
        </a>
      );
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < remaining.length) {
    parts.push(<span key={key++}>{remaining.slice(lastIndex)}</span>);
  }

  return parts.length > 0 ? parts : str;
};

/**
 * Parses block-level markdown (headings, lists, code blocks, quotes, HRs) into styled React elements.
 */
export const renderMarkdown = (text) => {
  if (!text) return null;

  const lines = text.split('\n');
  const elements = [];
  let codeBlock = null;
  let listItems = [];
  let listType = null; // 'ul' or 'ol'

  const flushList = () => {
    if (listItems.length > 0) {
      const Tag = listType === 'ol' ? 'ol' : 'ul';
      elements.push(
        <Tag
          key={`list-${elements.length}`}
          style={{
            margin: '8px 0',
            paddingLeft: '22px',
            color: '#cbd5e1',
            listStyleType: listType === 'ol' ? 'decimal' : 'disc',
          }}
        >
          {listItems.map((li, j) => (
            <li key={j} style={{ margin: '4px 0', lineHeight: 1.65, fontSize: '0.88rem' }}>
              {renderInlineMarkdown(li)}
            </li>
          ))}
        </Tag>
      );
      listItems = [];
      listType = null;
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Code block start / end
    if (line.trim().startsWith('```')) {
      flushList();
      if (codeBlock === null) {
        const lang = line.trim().slice(3).trim();
        codeBlock = { lang, lines: [] };
        continue;
      } else {
        elements.push(
          <div
            key={`code-${i}`}
            style={{
              margin: '10px 0',
              borderRadius: '10px',
              overflow: 'hidden',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
            }}
          >
            {codeBlock.lang && (
              <div
                style={{
                  padding: '6px 14px',
                  background: 'rgba(99, 102, 241, 0.15)',
                  borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
                  fontSize: '0.72rem',
                  color: '#a5b4fc',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em',
                }}
              >
                {codeBlock.lang}
              </div>
            )}
            <pre
              style={{
                margin: 0,
                padding: '14px 16px',
                background: '#020617',
                overflowX: 'auto',
                fontSize: '0.83rem',
                lineHeight: 1.65,
                fontFamily: "'JetBrains Mono', 'Fira Code', 'Cascadia Code', monospace",
                color: '#e2e8f0',
              }}
            >
              <code>{codeBlock.lines.join('\n')}</code>
            </pre>
          </div>
        );
        codeBlock = null;
        continue;
      }
    }

    if (codeBlock !== null) {
      codeBlock.lines.push(line);
      continue;
    }

    // Horizontal Rule
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      flushList();
      elements.push(
        <hr
          key={`hr-${i}`}
          style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.1)', margin: '12px 0' }}
        />
      );
      continue;
    }

    // Headings (# Heading 1, ## Heading 2, ### Heading 3, #### Heading 4)
    const headingMatch = line.match(/^(#{1,6})\s+(.+)/);
    if (headingMatch) {
      flushList();
      const level = headingMatch[1].length;
      const headingStyles = {
        1: { fontSize: '1.18rem', fontWeight: 800, color: '#f8fafc', margin: '16px 0 8px 0', borderBottom: '1px solid rgba(255,255,255,0.1)', paddingBottom: '6px' },
        2: { fontSize: '1.08rem', fontWeight: 700, color: '#f1f5f9', margin: '14px 0 6px 0' },
        3: { fontSize: '0.98rem', fontWeight: 700, color: '#818cf8', margin: '12px 0 5px 0' },
        4: { fontSize: '0.9rem', fontWeight: 700, color: '#c7d2fe', margin: '10px 0 4px 0' },
        5: { fontSize: '0.86rem', fontWeight: 600, color: '#cbd5e1', margin: '8px 0 4px 0' },
        6: { fontSize: '0.84rem', fontWeight: 600, color: '#94a3b8', margin: '8px 0 4px 0' },
      };
      elements.push(
        <div key={`h-${i}`} style={headingStyles[level] || headingStyles[4]}>
          {renderInlineMarkdown(headingMatch[2])}
        </div>
      );
      continue;
    }

    // Blockquote (> Quote)
    const quoteMatch = line.match(/^\s*>\s+(.+)/);
    if (quoteMatch) {
      flushList();
      elements.push(
        <blockquote
          key={`quote-${i}`}
          style={{
            margin: '8px 0',
            padding: '8px 14px',
            background: 'rgba(99, 102, 241, 0.08)',
            borderLeft: '3px solid #6366f1',
            borderRadius: '0 8px 8px 0',
            color: '#cbd5e1',
            fontSize: '0.86rem',
            fontStyle: 'italic',
          }}
        >
          {renderInlineMarkdown(quoteMatch[1])}
        </blockquote>
      );
      continue;
    }

    // Numbered list items (1. 2. etc.)
    const olMatch = line.match(/^\s*(\d+)\.\s+(.+)/);
    if (olMatch) {
      if (listType !== 'ol') flushList();
      listType = 'ol';
      listItems.push(olMatch[2]);
      continue;
    }

    // Bullet list items (- item, • item, * item)
    const ulMatch = line.match(/^\s*[-•*]\s+(.+)/);
    if (ulMatch) {
      if (listType !== 'ul') flushList();
      listType = 'ul';
      listItems.push(ulMatch[1]);
      continue;
    }

    // Paragraph / Blank line
    flushList();
    if (line.trim() === '') {
      elements.push(<div key={`empty-${i}`} style={{ height: '6px' }} />);
    } else {
      elements.push(
        <div key={`p-${i}`} style={{ margin: '3px 0', lineHeight: 1.65, fontSize: '0.88rem', color: '#e2e8f0' }}>
          {renderInlineMarkdown(line)}
        </div>
      );
    }
  }

  // Flush any remaining list items
  flushList();

  // If code block was not closed
  if (codeBlock !== null) {
    elements.push(
      <pre
        key="code-end"
        style={{
          margin: '10px 0',
          padding: '14px 16px',
          background: '#020617',
          borderRadius: '10px',
          overflowX: 'auto',
          fontSize: '0.83rem',
          lineHeight: 1.65,
          fontFamily: "'JetBrains Mono', monospace",
          color: '#e2e8f0',
          border: '1px solid rgba(99, 102, 241, 0.25)',
        }}
      >
        <code>{codeBlock.lines.join('\n')}</code>
      </pre>
    );
  }

  return elements;
};

/**
 * Reusable React component for rendering markdown content nicely.
 */
export default function MarkdownRenderer({ content, style = {} }) {
  if (!content) return null;
  return (
    <div
      className="markdown-content"
      style={{
        lineHeight: 1.65,
        wordBreak: 'break-word',
        whiteSpace: 'pre-wrap',
        ...style,
      }}
    >
      {renderMarkdown(content)}
    </div>
  );
}
