# Interview Prep Hub

A frontend-only React app for language-level interview preparation. Each track (Python, JavaScript, TypeScript, SQL & PostgreSQL) has questions ordered Foundation → Intermediate → Advanced, each with:

- an **Interview Answer** in English (what to say),
- a **ব্যাখ্যা** in Bangla (the why and how),
- code examples with their real, machine-verified output,
- pitfalls, likely follow-ups and, for hard concepts, a step-by-step visualization.

Every track also has coding-round exercises (hints and solutions) and a coverage page (quick concepts, what is not covered, study tips). The SQL track adds a sample clinic database (ER diagram, seed SQL) and an in-browser PostgreSQL playground.

A separate **LeetCode** area (`/leetcode`) holds solved LeetCode problems (DSA and Database) for revision: each problem reveals Problem → Approach → Breakdown → Solution → Revise one stage at a time, with spaced-repetition ratings, a pattern cheat sheet, a practice list and a pattern quiz. How to add problems: `CLAUDE.md`, section 13.

A **Guides** area (`/guides`) holds tool handbooks built from my notes: **Docker** (`/guides/docker`), **FastAPI** (`/guides/fastapi`), **Data Visualization** (`/guides/data-visualization`) , **NumPy** (`/guides/numpy`) and **Pydantic** (`/guides/pydantic`). Each shows the notes in their original order, plus a "Quick find" panel of ready setups that jump straight to the right section: for Docker, Node/FastAPI backends, React, Next.js, MongoDB, PostgreSQL + Prisma and a full-stack `compose.yaml`; for FastAPI, venv and packages, settings, Pydantic schemas, Postgres (SQLAlchemy async + Alembic), MongoDB (PyMongo async) and Pytest; for Data Visualization, which chart to use, every common Matplotlib / pandas / Seaborn plot with its picture, EDA and ML plots, and interview questions; for NumPy, axis, view vs copy, broadcasting, indexing and every everyday function with when to use it; for Pydantic, models, validators, FastAPI usage and a catalogue of real error messages with fixes. Every recipe and heading is searchable with `Ctrl+K`. How to add a guide: `CLAUDE.md`, section 14.

There is no backend. Content lives in typed TypeScript files under `src/content`. Progress, bookmarks, theme and practice mode are stored in `localStorage`.

> `CLAUDE.md` is the source of truth for the stack, content model, writing rules and UI rules. Read it before changing anything.

## Quick start

```bash
npm install
npm run dev          # http://localhost:5173
```

Requires Node.js 22 or newer (developed on Node 25). `npm run verify:outputs` also needs `python` (3.11+) on `PATH`.

## Commands

| Command                    | What it does                                                                            |
| -------------------------- | --------------------------------------------------------------------------------------- |
| `npm run dev`              | Dev server. Regenerates content outlines on start and whenever a content file is saved. |
| `npm run build`            | Type-check (`tsc -b`), production build to `dist/`, then prerender every content page.  |
| `npm run preview`          | Serve the production build locally.                                                     |
| `npm run test`             | Unit, component and content-validation tests (Vitest + Testing Library, jsdom).         |
| `npm run lint`             | ESLint (flat config).                                                                   |
| `npm run format`           | Prettier.                                                                               |
| `npm run validate:content` | Regenerate outlines, then validate every track against the content schema and rules.    |
| `npm run verify:outputs`   | Run **every** code example and exercise solution and compare with the written output.   |
| `npm run gen:outlines`     | Regenerate `src/content/<track>/outline.generated.json` by hand (rarely needed).        |

A task is done when `build`, `lint`, `test` and `verify:outputs` all pass.

## How the content is checked

The content contract is enforced by tests, not by convention.

- **`tests/content.test.ts`** checks:
  - the zod schema;
  - unique, correctly prefixed ids;
  - valid `sectionId`, `visualizationId` and `related` links;
  - level/priority ordering;
  - an `output` on every example that prints;
  - a cap on how many questions are priority 3;
  - that code shown inside a question matches a verified example.
- **`tests/outline.test.ts`** fails if a committed outline is out of date, or if a section file is not named after its section id.
- **`tests/verify/`** (`npm run verify:outputs`) actually runs the code:
  - **Python** runs with `python -I -X utf8` and `PYTHONHASHSEED=0`.
  - **JavaScript** runs with `node`, as a classic script or as an ES module if the snippet has `import`/`export`.
  - **TypeScript** is checked three ways:
    1. Every snippet type-checks under `strict`.
    2. Lines marked `// @ts-expect-error ❌ <message>` must really fail with that message. A copy without the marker is compiled and the error text is compared.
    3. The snippet is compiled by TypeScript, run on Node, and its output compared.
  - **SQL** runs on real PostgreSQL via PGlite (WebAssembly), on a freshly seeded copy of the sample database for every example and exercise solution. Scripts run statement by statement like `psql`. Each `resultTable` must match the last result set exactly, and `output` must match the command tags, notices and errors (`UPDATE 3`, `ERROR:  …`). An undocumented error fails the check.

## Project structure

```
src/
  app/                 router (route-level lazy loading + per-page data loaders), providers
  components/          ui/ (Radix-based primitives), layout/, question/, exercise/, search/, common/
  content/
    schema.ts          zod schemas = the content contract (types are inferred from them)
    tracks.ts          the track registry — the ONLY place a track is registered
    loader.ts          lazy loading of outlines, sections, exercises and coverage
    outline.ts         outline types + builder (light index of a track, no answers)
    <track>/
      index.ts         assembles the full track (used by tests, verification and the generator)
      meta.ts          name, slug, accent, icon, description
      sections/*.ts    one file per section, named after the section id without its prefix
      exercises.ts
      coverage.ts
      outline.generated.json   generated — do not edit by hand
  features/            progress, search, theme, practice mode, shortcuts, ui state
  pages/               one component per route
  visualizations/      registry.ts + one folder per track + shared VizFrame / StepControls
scripts/
  generate-outlines.ts
tests/                 unit/component tests, content validation, verify/ (output checks)
```

## How content is loaded

To keep pages fast, a track is never loaded in one piece:

| Chunk                                 | Size (gzip)       | Loaded by                                                 |
| ------------------------------------- | ----------------- | --------------------------------------------------------- |
| `outline.generated.json` (per track)  | ~7–10 kB          | home, sidebar, search, track page, bookmarks              |
| `sections/<section>.ts`               | ~5–20 kB each     | section page, single-question page                        |
| `exercises.ts` / `coverage.ts`        | ~15–24 kB / ~5 kB | exercise page / coverage page                             |
| Answer panel (react-markdown + Prism) | ~77 kB            | when an answer opens; prefetched when the browser is idle |
| Search (cmdk + Fuse.js)               | small             | first time search opens                                   |
| PGlite (PostgreSQL in WebAssembly)    | ~5 MB             | first Run on a SQL example, or the SQL Playground         |

Outlines are generated from the content by `scripts/generate-outlines.ts`. A Vite plugin runs it on dev-server start, on every content save in dev, and before each production build.

### Prerendering

`npm run build` renders all 602 content pages (home, tracks, sections, questions, exercises, coverage, sample database, the LeetCode pages and the guides) to static HTML:

1. `vite build` builds the client app into `dist/`.
2. `vite build --ssr src/entry-server.tsx` builds a renderer into `dist-server/`; it is never deployed.
3. `scripts/prerender.mjs` writes `dist/<path>.html` for every page, with the page's title and its loader data embedded.

Text is visible before any JavaScript runs, then React hydrates the page.

- **Saved state:** the user's theme, progress and practice mode load right after hydration, so the prerendered HTML can never disagree with the first client render.
- **Data:** a prerendered page already contains its section (or exercise), so it does not download that chunk again.
- **Not prerendered:** `/bookmarks` (it depends on the visitor) and unknown URLs are served `dist/spa.html`, the plain app shell, which renders in the browser.

## Adding a track

1. Create `src/content/<id>/` with `index.ts`, `meta.ts`, `sections/*.ts`, `exercises.ts` and `coverage.ts`. The folder name must equal the track `id`. Name each section file after its section id without the prefix (`go-concurrency` → `sections/concurrency.ts`).
2. Register it in `src/content/tracks.ts`: one line with its meta and lucide icon.
3. Add any visualizations under `src/visualizations/<id>/` and register their ids in `src/visualizations/registry.ts`.
4. Optional: add `dataset.ts` for a sample database (as the SQL track does). Define the tables and rows once with `defineDataset`; the seed SQL is generated from them, and the Sample Database page (`/<track>/dataset`, with an ER diagram and a "Copy seed SQL" button) plus its sidebar link appear automatically.
5. Run `npm run validate:content`. It generates the outline and validates everything, including the dataset.
6. Teach `tests/verify/` the language if its examples should be executed.

No changes to pages, the router, search or the sidebar are needed.

## Deployment

The build output is a static site in `dist/`. Prerendered pages are `<path>.html` files that must be served at the clean URL (`/python/py-basics` → `python/py-basics.html`), and everything else falls back to `spa.html`:

- **Vercel:** `vercel.json` enables `cleanUrls`, rewrites everything else to `/spa.html`, and sets long-term caching for `/assets/*`.
- **Netlify:** pretty URLs serve the `.html` files. `public/_redirects` sends everything else to `/spa.html`, and `public/_headers` sets asset caching.
- **Other hosts** (nginx, S3 + CloudFront…): `try_files $uri $uri.html /spa.html` or the equivalent.
- **SQL in the browser:** PGlite's `.wasm` and `.data` files sit in `dist/assets`. Serve `.wasm` as `application/wasm` (Vercel and Netlify do this by default) and allow compression for `.data`.

### SQL Run button and Playground

SQL code blocks on a track with a sample database get a **Run** button. It runs the query on a fresh copy of the database in the browser and shows the live result under the verified one. **Edit in Playground** opens the query in `/<track>/playground`, where changes persist until **Reset database**. Both use the same runner as the verifier (`src/lib/sql/`).

## Quality notes

- **Themes:** light and dark are both first-class. The default follows the system; the toggle in the top bar (or `t`) persists the choice.
- **Responsive:** laid out for 360 px and up — sheet navigation on phones, a collapsible sidebar on tablets, and a right-hand TOC on desktop.
- **Keyboard:**

  | Key                  | Action                    |
  | -------------------- | ------------------------- |
  | `Ctrl/Cmd + K` / `/` | Search                    |
  | `j` / `k`            | Next / previous question  |
  | `Space`              | Toggle the current answer |
  | `p`                  | Practice mode             |
  | `t`                  | Theme                     |
  | `?`                  | Show all shortcuts        |

- **Reduced motion:** visualizations never auto-play, and with `prefers-reduced-motion` Motion animations and CSS transitions are turned off.
- **Lighthouse** (production build):
  - Accessibility, best practices and SEO: 100 on every page checked, mobile and desktop.
  - Desktop performance: 98–99 on the pages measured. Layout shift is 0 on every page.
  - Mobile performance, measured with real throttling (`--throttling-method=devtools`: slow 4G, 4× CPU):

    | Page type                                   | Score | LCP       |
    | ------------------------------------------- | ----- | --------- |
    | Home                                        | 93–96 | 2.1 s     |
    | Track pages                                 | 85–90 | 2.0–2.1 s |
    | Section, question, exercise, coverage pages | 76–82 | 2.1–2.4 s |

  - Before prerendering, the same pages measured 43–63, with LCP of 5.9–11.9 s.
  - What remains is total blocking time: the browser's first layout of a long page, plus React hydrating it, on a 4×-slowed CPU.
  - Lighthouse's default _simulated_ mode estimates throttled timings from an unthrottled local trace. For prerendered pages served from `localhost`, it reports a later FCP than real throttling measures.
- **axe-core**: no WCAG A/AA violations on the main pages or in any visualization step, in light and dark mode, at 360 px and 1280 px.
