/* Custom, dependency-safe text splitter (primary engine).
 * Produces double-wrapped units — an overflow:hidden OUTER + a transformable INNER —
 * so clip/slide reveals work. Preserves an SR-only original and marks the visual
 * fragments aria-hidden. Re-splittable on resize / font-load via revert() + re-split
 * (see useSplitText). Line detection measures word offsetTop under the real webfont. */

export type SplitType = 'lines' | 'words' | 'chars';

export interface SplitResult {
  lines: HTMLElement[];
  words: HTMLElement[];
  chars: HTMLElement[];
  revert: () => void;
}

interface Token {
  text: string;
  isSpace: boolean;
  span?: HTMLElement;
}

const makeSpan = (cls: string, text?: string): HTMLElement => {
  const s = document.createElement('span');
  s.className = cls;
  if (text !== undefined) s.textContent = text;
  return s;
};

export function splitText(el: HTMLElement, type: SplitType): SplitResult {
  const original = el.getAttribute('data-split-original') ?? el.textContent ?? '';
  el.setAttribute('data-split-original', original);

  // pristine reset
  el.textContent = '';

  // SR-only original — assistive tech reads clean text, not fragments
  const sr = makeSpan('sr-only', original);
  el.appendChild(sr);

  const visual = makeSpan('split');
  visual.setAttribute('aria-hidden', 'true');
  el.appendChild(visual);

  // Tokenize keeping whitespace runs
  const rawTokens = original.split(/(\s+)/);
  const tokens: Token[] = [];
  for (const tk of rawTokens) {
    if (tk.length === 0) continue;
    const isSpace = /^\s+$/.test(tk);
    if (isSpace) {
      tokens.push({ text: tk, isSpace: true });
    } else {
      const span = makeSpan('split__measure', tk);
      span.style.display = 'inline-block';
      tokens.push({ text: tk, isSpace: false, span });
    }
  }

  // First pass: append measurable spans to detect natural line wrapping
  for (const t of tokens) {
    if (t.isSpace) visual.appendChild(document.createTextNode(t.text));
    else if (t.span) visual.appendChild(t.span);
  }

  // Group tokens into lines by measured offsetTop
  const lineGroups: Token[][] = [];
  let currentTop: number | null = null;
  let current: Token[] = [];
  for (const t of tokens) {
    if (t.isSpace) {
      if (current.length) current.push(t);
      continue;
    }
    const top = t.span ? t.span.offsetTop : 0;
    if (currentTop === null || top === currentTop) {
      current.push(t);
      currentTop = top;
    } else {
      lineGroups.push(current);
      current = [t];
      currentTop = top;
    }
  }
  if (current.length) lineGroups.push(current);

  // Second pass: rebuild visual DOM according to requested granularity
  visual.textContent = '';
  const lines: HTMLElement[] = [];
  const words: HTMLElement[] = [];
  const chars: HTMLElement[] = [];

  for (const group of lineGroups) {
    const lineOuter = makeSpan('split__line');

    if (type === 'lines') {
      const lineInner = makeSpan('split__line-i');
      lineInner.textContent = group.map((t) => t.text).join('');
      lineOuter.appendChild(lineInner);
      lines.push(lineInner);
    } else {
      for (const t of group) {
        if (t.isSpace) {
          lineOuter.appendChild(document.createTextNode(t.text));
          continue;
        }
        if (type === 'words') {
          const wOuter = makeSpan('split__word');
          const wInner = makeSpan('split__word-i', t.text);
          wOuter.appendChild(wInner);
          lineOuter.appendChild(wOuter);
          words.push(wInner);
        } else {
          // chars — keep each word unbroken with an inline-block wrapper
          const wWrap = makeSpan('split__wordwrap');
          for (const ch of Array.from(t.text)) {
            const cOuter = makeSpan('split__char');
            const cInner = makeSpan('split__char-i', ch);
            cOuter.appendChild(cInner);
            wWrap.appendChild(cOuter);
            chars.push(cInner);
          }
          lineOuter.appendChild(wWrap);
        }
      }
    }

    visual.appendChild(lineOuter);
  }

  const revert = () => {
    el.textContent = original;
  };

  return { lines, words, chars, revert };
}
