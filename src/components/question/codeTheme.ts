import type { PrismTheme } from 'prism-react-renderer';
import type { CodeLang } from '@/content/schema';

/**
 * One Prism theme for both colour schemes: every colour is a CSS variable defined in
 * globals.css (`--code-*`), so code blocks follow the app theme without re-rendering.
 */
export const codeTheme: PrismTheme = {
  plain: { color: 'var(--code-fg)', backgroundColor: 'transparent' },
  styles: [
    {
      types: ['comment', 'prolog', 'doctype', 'cdata'],
      style: { color: 'var(--code-comment)', fontStyle: 'italic' },
    },
    { types: ['punctuation', 'operator'], style: { color: 'var(--code-punct)' } },
    {
      types: ['keyword', 'atrule', 'important', 'rule'],
      style: { color: 'var(--code-keyword)' },
    },
    {
      types: ['string', 'char', 'attr-value', 'template-string', 'regex', 'triple-quoted-string'],
      style: { color: 'var(--code-string)' },
    },
    {
      types: ['number', 'boolean', 'constant', 'symbol', 'null', 'nil', 'undefined'],
      style: { color: 'var(--code-number)' },
    },
    { types: ['function', 'method', 'decorator'], style: { color: 'var(--code-function)' } },
    {
      types: ['class-name', 'maybe-class-name', 'builtin', 'namespace'],
      style: { color: 'var(--code-class)' },
    },
    { types: ['tag', 'attr-name', 'property'], style: { color: 'var(--code-tag)' } },
  ],
};

/** Content language -> Prism grammar. Languages without a bundled grammar render as plain text. */
export const PRISM_LANG: Record<CodeLang, string> = {
  python: 'python',
  javascript: 'javascript',
  typescript: 'typescript',
  sql: 'sql',
  json: 'json',
  bash: 'text',
  text: 'text',
};

export const LANG_LABEL: Record<CodeLang, string> = {
  python: 'Python',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
  sql: 'SQL',
  bash: 'Shell',
  json: 'JSON',
  text: 'Text',
};
