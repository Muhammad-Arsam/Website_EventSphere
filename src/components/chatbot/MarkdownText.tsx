'use client';

import React from 'react';
import { Block, Inline } from './markdown';

// Draws the parsed Markdown. React builds real elements (no dangerouslySetInnerHTML),
// so text from the AI can never inject HTML or scripts.

const renderInlines = (nodes: Inline[], tail?: React.ReactNode): React.ReactNode[] => {
  const out: React.ReactNode[] = nodes.map((n, i) => {
    switch (n.t) {
      case 'text':
        return <React.Fragment key={i}>{n.v}</React.Fragment>;
      case 'br':
        return <br key={i} />;
      case 'code':
        return (
          <code
            key={i}
            className="rounded-md px-1.5 py-0.5 font-mono text-[12.5px]"
            style={{ background: 'rgba(127,127,127,0.20)' }}
          >
            {n.v}
          </code>
        );
      case 'bold':
        return (
          <strong key={i} className="font-bold">
            {renderInlines(n.c)}
          </strong>
        );
      case 'italic':
        return <em key={i}>{renderInlines(n.c)}</em>;
      case 'strike':
        return <s key={i}>{renderInlines(n.c)}</s>;
      case 'link':
        return (
          <a
            key={i}
            href={n.href}
            target="_blank"
            rel="noopener noreferrer nofollow"
            className="break-all font-semibold underline underline-offset-2 transition-opacity hover:opacity-75"
          >
            {renderInlines(n.c)}
          </a>
        );
    }
  });
  if (tail) out.push(<React.Fragment key="tail">{tail}</React.Fragment>);
  return out;
};

interface MarkdownTextProps {
  blocks: Block[];
  tail?: React.ReactNode; // shown at the very end of the text (used for the typing caret)
}

export default function MarkdownText({ blocks, tail }: MarkdownTextProps) {
  if (blocks.length === 0) return <div>{tail}</div>;

  const lastIndex = blocks.length - 1;

  return (
    <div className="space-y-2 wrap-break-word">
      {blocks.map((b, i) => {
        const t = i === lastIndex ? tail : undefined;

        switch (b.t) {
          case 'p':
            return <p key={i}>{renderInlines(b.c, t)}</p>;

          case 'h':
            return (
              <p key={i} className={b.level <= 2 ? 'text-[16px] font-bold' : 'text-[15px] font-semibold'}>
                {renderInlines(b.c, t)}
              </p>
            );

          case 'ul':
          case 'ol': {
            const Tag = b.t;
            return (
              <Tag
                key={i}
                start={b.t === 'ol' ? b.start : undefined}
                className={`space-y-1 pl-5 ${b.t === 'ul' ? 'list-disc' : 'list-decimal'}`}
              >
                {b.items.map((it, j) => (
                  <li key={j} style={it.depth ? { marginLeft: `${it.depth * 1}rem` } : undefined}>
                    {renderInlines(it.c, i === lastIndex && j === b.items.length - 1 ? tail : undefined)}
                  </li>
                ))}
              </Tag>
            );
          }

          case 'code':
            return (
              <pre
                key={i}
                className="overflow-x-auto rounded-xl p-3 font-mono text-[12.5px] leading-relaxed"
                style={{ background: 'rgba(127,127,127,0.20)' }}
              >
                <code>{b.v}</code>
                {t}
              </pre>
            );

          case 'hr':
            return <hr key={i} className="border-0 border-t" style={{ borderColor: 'rgba(127,127,127,0.35)' }} />;
        }
      })}
    </div>
  );
}