/**
 * Prerenders every content page into static HTML (run by `npm run build`).
 *
 * 1. `vite build`                                   -> dist/ (the client app)
 * 2. `vite build --ssr src/entry-server.tsx ...`    -> dist-server/entry-server.js
 * 3. this script                                    -> dist/<path>.html for each page
 *
 * Pages are written as `<path>.html` (e.g. dist/python/py-basics.html), which static hosts serve
 * at the clean URL: Netlify by default, Vercel with `cleanUrls`, and `vite preview`.
 *
 * The browser hydrates the prerendered markup, so text is visible before any JavaScript runs.
 * `dist/spa.html` is the untouched app shell: hosts serve it for routes that are not
 * prerendered (bookmarks, unknown URLs), where the app renders client-side.
 */
import { mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = join(root, 'dist');
const { render, prerenderPaths } = await import(
  pathToFileURL(join(root, 'dist-server', 'entry-server.js')).href
);

let template = readFileSync(join(dist, 'index.html'), 'utf8');

// Vite emits the module script and ~25 modulepreload links before the stylesheet. On HTTP/1.1
// (6 connections per host) the render-blocking CSS then queues behind JavaScript that a
// prerendered page does not need for its first paint. Request the CSS first, then the main
// UI font (its @font-face uses `font-display: optional`, so it must arrive early to be used).
const stylesheets = template.match(/[ \t]*<link rel="stylesheet"[^>]*>\n?/g) ?? [];
for (const tag of stylesheets) template = template.replace(tag, '');
const interFont = readdirSync(join(dist, 'assets')).find((f) =>
  /^inter-latin-wght-normal-[\w-]+\.woff2$/.test(f),
);
const early = [
  ...stylesheets.map((tag) => tag.trim()),
  interFont
    ? `<link rel="preload" as="font" type="font/woff2" crossorigin href="/assets/${interFont}">`
    : '',
].filter(Boolean);
template = template.replace(
  /(<meta name="viewport"[^>]*>)/,
  (meta) => `${meta}\n    ${early.join('\n    ')}`,
);
const ROOT = /<div id="root">[\s\S]*<\/div>(\s*<\/body>)/;
const TITLE = /<title>[\s\S]*?<\/title>/;
if (!ROOT.test(template) || !TITLE.test(template)) {
  throw new Error('dist/index.html: could not find <div id="root"> or <title>');
}

const escapeHtml = (text) =>
  text.replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);

// The shell must be saved before index.html is overwritten by the prerendered home page.
writeFileSync(join(dist, 'spa.html'), template);

const started = performance.now();
const pages = await prerenderPaths();
let bytes = 0;
for (const path of pages) {
  const { html, title, status } = await render(path);
  if (status !== 200) throw new Error(`${path} rendered with status ${status}`);
  const page = template
    .replace(TITLE, `<title>${escapeHtml(title)}</title>`)
    .replace(
      '</head>',
      `<script>window.__PRERENDERED_PATH=${JSON.stringify(path)}</script>\n  </head>`,
    )
    .replace(ROOT, (_, end) => `<div id="root">${html}</div>${end}`);
  const file = path === '/' ? join(dist, 'index.html') : join(dist, `${path}.html`);
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, page);
  bytes += page.length;
}

const seconds = ((performance.now() - started) / 1000).toFixed(1);
console.log(
  `prerendered ${pages.length} pages (${(bytes / 1024 / 1024).toFixed(1)} MB) in ${seconds}s`,
);
