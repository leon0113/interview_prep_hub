/**
 * Turns a guide's notes (Markdown, kept verbatim) into parts → sections → subsections, in the
 * notes' own order. Headings:
 *   `# পর্ব ১ — শুরু`        a part (any `# ` heading after the document title)
 *   `## ৮. Docker Compose`   a section     → id `section-8`
 *   `### ৮.৩ compose.yaml`   a subsection  → id `section-8-3`
 * Numbers may be Bangla (০–৯) or ASCII digits; ids always use ASCII.
 */

export interface GuideSubsection {
  id: string;
  /** "8.3" (ASCII), if the heading is numbered. */
  number?: string;
  title: string;
  body: string;
}

export interface GuideSection extends GuideSubsection {
  /** Text between the section heading and its first subsection. */
  subsections: GuideSubsection[];
}

export interface GuidePart {
  id: string;
  /** "পর্ব ১" */
  label: string;
  /** "শুরু" */
  title: string;
  sections: GuideSection[];
}

export interface ParsedGuide {
  /** Text before the first section (the "how to use" note), without the document title. */
  intro: string;
  parts: GuidePart[];
}

const BN_DIGITS = '০১২৩৪৫৬৭৮৯';

/** "৮.৩" → "8.3" */
export function toAsciiDigits(text: string): string {
  return text.replace(/[০-৯]/g, (d) => String(BN_DIGITS.indexOf(d)));
}

/** Leading number of a heading ("৮.৩ compose.yaml" → "8.3"). */
function headingNumber(title: string): string | undefined {
  const match = /^([০-৯\d]+(?:\.[০-৯\d]+)?)\.?\s/.exec(title);
  return match ? toAsciiDigits(match[1]!) : undefined;
}

export function sectionAnchor(number: string): string {
  return `section-${number.replace(/\./g, '-')}`;
}

/**
 * Anchor slug for an unnumbered heading ("Next steps (when you're ready)" → "next-steps-when-youre-ready").
 * Bangla-only headings have no ASCII letters; they fall back to a counter.
 */
function slug(title: string): string {
  return title
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

const isFence = (line: string) => line.trimStart().startsWith('```');

/** Drops a trailing `---` rule (the notes separate sections with one) and outer blank lines. */
function cleanBody(lines: string[]): string {
  return lines
    .join('\n')
    .trim()
    .replace(/\n---$/, '')
    .trim();
}

export function parseGuide(markdown: string): ParsedGuide {
  const lines = markdown.replace(/\r\n/g, '\n').split('\n');
  const intro: string[] = [];
  const parts: GuidePart[] = [];
  let seenTitle = false;
  let inFence = false;
  let skipping = false; // inside the notes' own table of contents
  let section: (GuideSection & { lines: string[] }) | null = null;
  let sub: (GuideSubsection & { lines: string[] }) | null = null;
  const used = new Set<string>();
  /** First free id: `base`, then `base-2`, `base-3`… */
  const unique = (base: string) => {
    let id = base;
    for (let n = 2; used.has(id); n++) id = `${base}-${n}`;
    used.add(id);
    return id;
  };

  const closeSub = () => {
    if (section && sub) section.subsections.push({ ...strip(sub), body: cleanBody(sub.lines) });
    sub = null;
  };
  const closeSection = () => {
    closeSub();
    if (section) {
      const part = parts.at(-1);
      part?.sections.push({ ...strip(section), body: cleanBody(section.lines) });
    }
    section = null;
  };

  for (const line of lines) {
    if (isFence(line)) inFence = !inFence;
    const heading = inFence ? null : /^(#{1,3}) (.+)$/.exec(line);

    if (heading) {
      const level = heading[1]!.length;
      const title = heading[2]!.trim();
      if (level === 1) {
        if (!seenTitle) {
          seenTitle = true;
          continue;
        }
        closeSection();
        skipping = false;
        const [label, ...rest] = title.split(/\s+—\s+/);
        parts.push({
          id: `part-${parts.length + 1}`,
          label: label!.trim(),
          title: rest.join(' — ').trim() || label!.trim(),
          sections: [],
        });
        continue;
      }
      if (level === 2) {
        closeSection();
        if (/সূচিপত্র/.test(title)) {
          skipping = true;
          continue;
        }
        skipping = false;
        if (!parts.length) parts.push({ id: 'part-1', label: '', title: '', sections: [] });
        const number = headingNumber(title);
        section = {
          id: unique(
            number
              ? sectionAnchor(number)
              : `section-${slug(title) || `x${parts.length}-${parts.at(-1)!.sections.length + 1}`}`,
          ),
          number,
          title,
          body: '',
          subsections: [],
          lines: [],
        };
        continue;
      }
      if (level === 3 && section) {
        closeSub();
        const current: GuideSection = section;
        const number = headingNumber(title);
        sub = {
          id: unique(
            number
              ? sectionAnchor(number)
              : `${current.id}-${slug(title) || `x${current.subsections.length + 1}`}`,
          ),
          number,
          title,
          body: '',
          lines: [],
        };
        continue;
      }
    }

    if (skipping) continue;
    if (sub) (sub as { lines: string[] }).lines.push(line);
    else if (section) (section as { lines: string[] }).lines.push(line);
    else if (!parts.length) intro.push(line);
  }
  closeSection();

  return {
    intro: cleanBody(intro.filter((l) => !/^---\s*$/.test(l))),
    parts: parts.filter((p) => p.sections.length > 0),
  };
}

function strip<T extends { lines: string[] }>(value: T): Omit<T, 'lines'> {
  const { lines: _lines, ...rest } = value;
  return rest;
}

/**
 * Plain fences that show program output render as Output blocks (```output):
 * - a plain fence right after another code block (the command, then what it printed), or
 * - a plain fence under an "আউটপুট" / "Output" / "Sample output" label or a "**`command`:**" label.
 * Plain fences that hold a file (first line `# file.txt`) or a folder tree stay plain text.
 */
export function markGuideOutputs(markdown: string): string {
  const lines = markdown.split('\n');
  const out: string[] = [];
  let inFence = false;
  let lastNonBlank = '';
  let lastWasFenceClose = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (isFence(line)) {
      if (!inFence) {
        inFence = true;
        if (line.trim() === '```') {
          const after = lines.slice(
            i + 1,
            lines.findIndex((l, j) => j > i && isFence(l)),
          );
          const first = after[0] ?? '';
          const isFile = /^#\s/.test(first) || after.some((l) => /[├└]──/.test(l));
          const labelled =
            /আউটপুট|\boutput\b/i.test(lastNonBlank) ||
            /^\*\*`[^`]+`:\*\*$/.test(lastNonBlank.trim());
          if (!isFile && (lastWasFenceClose || labelled)) {
            out.push(line.replace('```', '```output'));
            continue;
          }
        }
      } else {
        inFence = false;
        out.push(line);
        lastWasFenceClose = true;
        lastNonBlank = line;
        continue;
      }
    }
    out.push(line);
    if (!inFence && line.trim()) {
      lastNonBlank = line;
      lastWasFenceClose = false;
    }
  }
  return out.join('\n');
}

/**
 * Turns the notes' cross references ("সেকশন ৫.৪", "সেকশন ১, ৩") into in-page links, so the
 * text stays exactly as written but each reference jumps to its section.
 */
export function linkSectionRefs(markdown: string): string {
  let inFence = false;
  return markdown
    .split('\n')
    .map((line) => {
      if (isFence(line)) inFence = !inFence;
      if (inFence || isFence(line)) return line;
      // Leave inline code untouched: split on backtick spans and only rewrite the text parts.
      return line
        .split(/(`[^`]*`)/)
        .map((chunk, k) =>
          k % 2 === 1
            ? chunk
            : chunk.replace(
                /সেকশন ((?:[০-৯]+(?:\.[০-৯]+)?)(?:\s*,\s*[০-৯]+(?:\.[০-৯]+)?)*)/g,
                (_m, list: string) =>
                  'সেকশন ' +
                  list.replace(
                    /[০-৯]+(?:\.[০-৯]+)?/g,
                    (n) => `[${n}](#${sectionAnchor(toAsciiDigits(n))})`,
                  ),
              ),
        )
        .join('');
    })
    .join('\n');
}

/** Every heading of a guide, flat and in order (for search). */
export function guideHeadings(
  guide: ParsedGuide,
): { id: string; title: string; context: string; level: 2 | 3 }[] {
  return guide.parts.flatMap((part) =>
    part.sections.flatMap((section) => [
      { id: section.id, title: section.title, context: part.title, level: 2 as const },
      ...section.subsections.map((s) => ({
        id: s.id,
        title: s.title,
        context: section.title,
        level: 3 as const,
      })),
    ]),
  );
}

/** True when most letters are Bangla, so the text gets the Bangla font metrics (`lang="bn"`). */
export function isMostlyBangla(text: string): boolean {
  const prose = text.replace(/```[\s\S]*?```/g, '').replace(/`[^`]*`/g, '');
  const bangla = prose.match(/[\u0980-\u09FF]/g)?.length ?? 0;
  const latin = prose.match(/[A-Za-z]/g)?.length ?? 0;
  return bangla > 0 && bangla >= latin * 0.5;
}
