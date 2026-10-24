// A small, safe Markdown parser for chatbot replies (Gemini and similar models answer in Markdown).
//
// Supported: **bold**, *italic*, _italic_, ***bold italic***, ~~strike~~, `code`, ```code blocks```,
//            [links](https://...), plain https:// links, # headings, - / * / + bullet lists
//            (with simple nesting), 1. numbered lists, --- lines, and line breaks.
// Not supported: tables, images, raw HTML. Raw HTML is never rendered: it is shown as plain text.
//
// The result is a tree of plain objects (no HTML strings), so the typewriter effect can reveal it
// character by character without ever showing half-written Markdown symbols.

export type Inline =
  | { t: 'text'; v: string }
  | { t: 'code'; v: string }
  | { t: 'br' }
  | { t: 'bold' | 'italic' | 'strike'; c: Inline[] }
  | { t: 'link'; href: string; c: Inline[] };

export interface ListItem {
  depth: number; // 0, 1 or 2
  c: Inline[];
}

export type Block =
  | { t: 'p'; c: Inline[] }
  | { t: 'h'; level: number; c: Inline[] }
  | { t: 'ul'; items: ListItem[] }
  | { t: 'ol'; items: ListItem[]; start: number }
  | { t: 'code'; v: string }
  | { t: 'hr' };

const MAX_DEPTH = 6;
const isSpace = (ch: string | undefined) => ch === undefined || /\s/.test(ch);
const isWordChar = (ch: string | undefined) => ch !== undefined && /[A-Za-z0-9]/.test(ch);

// Only these link types are allowed (blocks javascript:, data:, etc.)
export const isSafeUrl = (url: string): boolean => /^(https?:\/\/|mailto:|tel:)/i.test(url.trim());

// Finds the closing marker for an opening marker at index i.
// Returns the end index (after the closer) and the text between.
const matchPair = (
  s: string,
  i: number,
  marker: string,
  wordBoundary = false,
): { end: number; inner: string } | null => {
  const start = i + marker.length;
  if (start >= s.length || isSpace(s[start])) return null; // the opener must be followed by a non-space
  if (wordBoundary && isWordChar(s[i - 1])) return null; // snake_case_words are not italic

  let idx = s.indexOf(marker, start);
  while (idx !== -1) {
    const okBefore = idx > start && !isSpace(s[idx - 1]); // the closer must follow a non-space
    const okAfter = !wordBoundary || !isWordChar(s[idx + marker.length]);
    // for single-character markers, skip closers that belong to a double marker (**)
    const partOfDouble = marker.length === 1 && (s[idx + 1] === marker || s[idx - 1] === marker);
    if (okBefore && okAfter && !partOfDouble) {
      return { end: idx + marker.length, inner: s.slice(start, idx) };
    }
    idx = s.indexOf(marker, idx + 1);
  }
  return null;
};

const parseInline = (s: string, depth = 0, inLink = false): Inline[] => {
  const out: Inline[] = [];
  let buf = '';
  const flush = () => {
    if (buf) {
      out.push({ t: 'text', v: buf });
      buf = '';
    }
  };

  let i = 0;
  while (i < s.length) {
    const ch = s[i];

    // escaped symbol: \* \_ \` etc.
    if (ch === '\\' && i + 1 < s.length && /[\\`*_{}[\]()#+\-.!~>|]/.test(s[i + 1])) {
      buf += s[i + 1];
      i += 2;
      continue;
    }

    if (ch === '\n') {
      flush();
      out.push({ t: 'br' });
      i++;
      continue;
    }

    if (ch === '`') {
      const j = s.indexOf('`', i + 1);
      if (j > i + 1) {
        flush();
        out.push({ t: 'code', v: s.slice(i + 1, j) });
        i = j + 1;
        continue;
      }
    }

    if (depth < MAX_DEPTH) {
      // ***bold italic***
      if (s.startsWith('***', i)) {
        const m = matchPair(s, i, '***');
        if (m) {
          flush();
          out.push({ t: 'bold', c: [{ t: 'italic', c: parseInline(m.inner, depth + 1, inLink) }] });
          i = m.end;
          continue;
        }
      }
      // **bold** or __bold__
      if (s.startsWith('**', i) || s.startsWith('__', i)) {
        const marker = s.slice(i, i + 2);
        const m = matchPair(s, i, marker, marker === '__');
        if (m) {
          flush();
          out.push({ t: 'bold', c: parseInline(m.inner, depth + 1, inLink) });
          i = m.end;
          continue;
        }
      }
      // ~~strike~~
      if (s.startsWith('~~', i)) {
        const m = matchPair(s, i, '~~');
        if (m) {
          flush();
          out.push({ t: 'strike', c: parseInline(m.inner, depth + 1, inLink) });
          i = m.end;
          continue;
        }
      }
      // *italic* or _italic_
      if ((ch === '*' || ch === '_') && s[i + 1] !== ch) {
        const m = matchPair(s, i, ch, ch === '_');
        if (m) {
          flush();
          out.push({ t: 'italic', c: parseInline(m.inner, depth + 1, inLink) });
          i = m.end;
          continue;
        }
      }
      // [label](url)
      if (ch === '[' && !inLink) {
        const mid = s.indexOf('](', i + 1);
        if (mid > i) {
          const end = s.indexOf(')', mid + 2);
          if (end > mid) {
            const label = s.slice(i + 1, mid);
            const url = s.slice(mid + 2, end).trim().split(/\s+/)[0] ?? '';
            flush();
            if (isSafeUrl(url)) {
              out.push({ t: 'link', href: url, c: parseInline(label, depth + 1, true) });
            } else {
              out.push(...parseInline(label, depth + 1, true)); // unsafe link: keep only the text
            }
            i = end + 1;
            continue;
          }
        }
      }
    }

    // plain https:// link
    if ((ch === 'h' || ch === 'H') && !inLink && !isWordChar(s[i - 1])) {
      const m = /^https?:\/\/[^\s<>]+/i.exec(s.slice(i));
      if (m) {
        const url = m[0].replace(/[.,;:!?)\]]+$/, ''); // do not include trailing punctuation
        flush();
        out.push({ t: 'link', href: url, c: [{ t: 'text', v: url }] });
        i += url.length;
        continue;
      }
    }

    buf += ch;
    i++;
  }

  flush();
  return out;
};

const FENCE = /^\s*```/;
const HEADING = /^\s{0,3}(#{1,6})\s+(.+?)\s*#*\s*$/;
const HR = /^\s*([-*_])(\s*\1){2,}\s*$/;
const BULLET = /^(\s*)[*+\-•]\s+(.*)$/;
const ORDERED = /^(\s*)(\d+)[.)]\s+(.*)$/;

const depthFor = (indent: string) => (indent.length === 0 ? 0 : Math.min(2, Math.ceil(indent.length / 4)));

export const parseMarkdown = (source: string): Block[] => {
  const lines = (source ?? '').replace(/\r\n?/g, '\n').split('\n');
  const blocks: Block[] = [];

  let para: string[] = [];
  let list: { kind: 'ul' | 'ol'; start: number; items: { depth: number; raw: string }[] } | null = null;

  const flushPara = () => {
    if (para.length) {
      blocks.push({ t: 'p', c: parseInline(para.join('\n')) });
      para = [];
    }
  };
  const flushList = () => {
    if (!list) return;
    const items = list.items.map((it) => ({ depth: it.depth, c: parseInline(it.raw) }));
    blocks.push(list.kind === 'ul' ? { t: 'ul', items } : { t: 'ol', items, start: list.start });
    list = null;
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // fenced code block
    if (FENCE.test(line)) {
      flushPara();
      flushList();
      const code: string[] = [];
      i++;
      while (i < lines.length && !FENCE.test(lines[i])) {
        code.push(lines[i]);
        i++;
      }
      blocks.push({ t: 'code', v: code.join('\n') });
      continue;
    }

    if (line.trim() === '') {
      flushPara();
      flushList();
      continue;
    }

    const heading = HEADING.exec(line);
    if (heading) {
      flushPara();
      flushList();
      blocks.push({ t: 'h', level: heading[1].length, c: parseInline(heading[2]) });
      continue;
    }

    if (HR.test(line)) {
      flushPara();
      flushList();
      blocks.push({ t: 'hr' });
      continue;
    }

    const bullet = BULLET.exec(line);
    if (bullet) {
      flushPara();
      if (list && list.kind !== 'ul') flushList();
      if (!list) list = { kind: 'ul', start: 1, items: [] };
      list.items.push({ depth: depthFor(bullet[1]), raw: bullet[2] });
      continue;
    }

    const ordered = ORDERED.exec(line);
    if (ordered) {
      flushPara();
      if (list && list.kind !== 'ol') flushList();
      if (!list) list = { kind: 'ol', start: parseInt(ordered[2], 10) || 1, items: [] };
      list.items.push({ depth: depthFor(ordered[1]), raw: ordered[3] });
      continue;
    }

    // an indented line right after a list item continues that item
    if (list && /^\s{2,}\S/.test(line)) {
      list.items[list.items.length - 1].raw += `\n${line.trim()}`;
      continue;
    }

    flushList();
    para.push(line.replace(/\s+$/, ''));
  }

  flushPara();
  flushList();
  return blocks;
};

// ─── Typewriter helpers ───────────────────────────────────────────────────────
// "Visible characters" are the characters a reader sees (Markdown symbols are not counted).

const countInlines = (nodes: Inline[]): number =>
  nodes.reduce((sum, n) => {
    switch (n.t) {
      case 'text':
      case 'code':
        return sum + n.v.length;
      case 'br':
        return sum + 1;
      default:
        return sum + countInlines(n.c);
    }
  }, 0);

export const countVisibleChars = (blocks: Block[]): number =>
  blocks.reduce((sum, b) => {
    switch (b.t) {
      case 'p':
      case 'h':
        return sum + countInlines(b.c);
      case 'ul':
      case 'ol':
        return sum + b.items.reduce((s, it) => s + countInlines(it.c), 0);
      case 'code':
        return sum + b.v.length;
      default:
        return sum;
    }
  }, 0);

const sliceInlines = (nodes: Inline[], budget: { n: number }): Inline[] => {
  const out: Inline[] = [];
  for (const node of nodes) {
    if (budget.n <= 0) break;
    switch (node.t) {
      case 'text':
      case 'code': {
        const v = node.v.slice(0, budget.n);
        budget.n -= v.length;
        out.push({ t: node.t, v });
        break;
      }
      case 'br':
        budget.n -= 1;
        out.push(node);
        break;
      case 'link':
        out.push({ t: 'link', href: node.href, c: sliceInlines(node.c, budget) });
        break;
      default:
        out.push({ t: node.t, c: sliceInlines(node.c, budget) });
    }
  }
  return out;
};

// Returns only the first `count` visible characters, keeping the formatting of what is shown.
export const sliceBlocks = (blocks: Block[], count: number): Block[] => {
  const budget = { n: count };
  const out: Block[] = [];
  for (const b of blocks) {
    if (budget.n <= 0) break;
    switch (b.t) {
      case 'p':
        out.push({ t: 'p', c: sliceInlines(b.c, budget) });
        break;
      case 'h':
        out.push({ t: 'h', level: b.level, c: sliceInlines(b.c, budget) });
        break;
      case 'ul':
      case 'ol': {
        const items: ListItem[] = [];
        for (const it of b.items) {
          if (budget.n <= 0) break;
          items.push({ depth: it.depth, c: sliceInlines(it.c, budget) });
        }
        out.push(b.t === 'ul' ? { t: 'ul', items } : { t: 'ol', items, start: b.start });
        break;
      }
      case 'code': {
        const v = b.v.slice(0, budget.n);
        budget.n -= v.length;
        out.push({ t: 'code', v });
        break;
      }
      default:
        out.push(b);
    }
  }
  return out;
};