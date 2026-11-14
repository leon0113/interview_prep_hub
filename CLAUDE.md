# CLAUDE.md — Interview Prep Hub

This file is the source of truth for how this project is built. Read it fully before any change. If a request conflicts with this file, ask before deviating.

## 1. What this project is

A **frontend-only** React app for interview preparation. Each **track** (a language or technology) has:

1. **Questions** grouped into sections and ordered by difficulty: Foundation → Intermediate → Advanced.
2. Each question has a **hideable answer** containing:
   - **Interview Answer**: what to say in the interview (English, concise, confident, 3–8 sentences or bullets).
   - **ব্যাখ্যা (Explanation)**: a deeper explanation in **Bangla** (technical terms stay in English).
   - **Code examples** with a visible **Output** block for every snippet.
   - Optional: common pitfalls, likely follow-up questions, a visualization.
3. **Exercises** (logic building + common coding-round problems) at the end of each track, with hints and a hideable solution.
4. **Visualizations** for hard concepts (interactive, animated React components).
   Current tracks: **Python, JavaScript, TypeScript**.
   Future tracks (architecture must make these easy to add): React, Next.js, Node.js, MongoDB, SQL, and more.

There is **no backend**. All content lives in typed TS files inside the repo. User state (progress, bookmarks, theme, answer visibility) lives in `localStorage`.

## 2. Tech stack (do not swap without asking)

| Concern                    | Choice                                                                            |
| -------------------------- | --------------------------------------------------------------------------------- |
| Build                      | Vite + React 19 + TypeScript (strict)                                             |
| Styling                    | Tailwind CSS v4 (`@tailwindcss/vite`), CSS variables for theme tokens             |
| Routing                    | React Router (data router, `createBrowserRouter`), route-level lazy loading       |
| UI primitives              | Radix UI primitives (via shadcn/ui-style local components in `src/components/ui`) |
| Icons                      | `lucide-react`                                                                    |
| Animation / visualizations | `motion` (Framer Motion) + plain SVG                                              |
| Markdown                   | `react-markdown` + `remark-gfm`                                                   |
| Code highlighting          | `prism-react-renderer` (light + dark themes)                                      |
| Search                     | `fuse.js` (fuzzy) + command palette (`cmdk`)                                      |
| In-browser SQL             | `@electric-sql/pglite` (PostgreSQL in WebAssembly), dynamically imported only     |
| State                      | React context + small custom hooks; `zustand` with `persist` for user state       |
| Content validation         | `zod` schemas + a Vitest test that validates all content                          |
| Tests                      | Vitest + React Testing Library                                                    |
| Lint/format                | ESLint (flat config) + Prettier                                                   |

Package manager: **npm**.

## 3. Commands

```bash
npm install
npm run dev          # start dev server (regenerates content outlines on start and on save)
npm run build        # type-check + production build + prerender every content page to HTML
npm run preview      # preview the build
npm run test         # vitest (includes content validation)
npm run lint
npm run validate:content   # regenerate outlines, then run the content schema + outline tests
npm run verify:outputs     # run every code example/solution (python, node, tsc, PGlite) and compare outputs
npm run gen:outlines       # regenerate src/content/<track>/outline.generated.json by hand
```

`npm run build` and `npm run test` must pass before any task is considered done.

## 4. Folder structure

```
src/
  app/
    router.tsx              # all routes + per-page data loaders
    providers.tsx           # theme, store, etc. (loads saved user state after hydration)
  main.tsx                  # client entry: hydrates prerendered pages, else renders client-side
  entry-server.tsx          # build-time renderer used by scripts/prerender.mjs (never shipped)
  components/
    ui/                     # button, card, badge, tabs, accordion, tooltip, sheet, dialog...
    layout/                 # AppShell, Sidebar, TopBar, MobileNav, TableOfContents, Breadcrumbs
    question/               # QuestionCard, AnswerPanel, CodeBlock, OutputBlock, LevelBadge, PriorityStars
    exercise/               # ExerciseCard, HintList, SolutionPanel
    search/                 # CommandPalette, SearchResults
    common/                 # EmptyState, ProgressRing, KeyboardHint...
  visualizations/
    registry.ts             # id -> lazy component map
    python/                 # e.g. ReferenceModelViz.tsx, GeneratorStepperViz.tsx
    javascript/             # e.g. EventLoopViz.tsx, PrototypeChainViz.tsx
    typescript/             # e.g. TypeSetsViz.tsx, UtilityTypesViz.tsx
    shared/                 # VizFrame, StepControls (play/pause/next/prev/reset)
  content/
    schema.ts               # zod schemas + inferred types
    tracks.ts               # track registry (the ONLY place a new track is registered)
    loader.ts               # lazy loading: outlines, one chunk per section, exercises, coverage
    outline.ts              # outline types + builder (titles/ids/levels of a track, no answers)
    python/                 # folder name = track id
      index.ts              # track meta + sections list (full track: tests, verify, generator)
      sections/             # one file per section, named after the section id without its
                            #   track prefix: py-data-structures -> data-structures.ts
      exercises.ts
      coverage.ts           # quick concepts + not-covered list
      outline.generated.json  # GENERATED from the content — never edit by hand
    sql/dataset.ts          # optional per track: sample database (tables + rows); the seed SQL
                            #   is generated from it (content/dataset.ts). Enables /:trackSlug/dataset
    javascript/ ...same shape
    typescript/ ...same shape
  features/
    progress/               # store + hooks: learned, bookmarked, lastVisited
    search/                 # build Fuse index from all tracks
    theme/
    sql/                    # in-browser PGlite sessions (lazy), Run hook, runner context
  pages/
    HomePage.tsx
    TrackPage.tsx           # track overview: sections, level filter, progress
    SectionPage.tsx         # questions of one section
    QuestionPage.tsx        # single question deep link
    ExercisesPage.tsx
    ExercisePage.tsx
    CoveragePage.tsx
    BookmarksPage.tsx
    NotFoundPage.tsx
  lib/                      # utils (cn, slugify, storage helpers)
    sql/                    # statement splitter + psql-style runner, shared by Run/Playground and verify
  styles/globals.css
scripts/
  generate-outlines.ts      # builds outline.generated.json (also run by a Vite plugin in dev/build)
  prerender.mjs             # writes dist/<path>.html for every content page after the build
tests/
  content.test.ts           # validates every track against the schema
  outline.test.ts           # committed outlines are up to date; section files are named correctly
  verify/                   # npm run verify:outputs — executes every example and solution
                            #   (sql.verify.ts: every SQL example vs a freshly seeded PGlite)
```

**Content outlines:** the home page, sidebar, search, track page and bookmarks only need titles, ids, levels and tags, so they read a small generated `outline.generated.json` per track. Full answers are loaded one section at a time. Outlines are regenerated automatically (Vite plugin on dev start, on content save and before builds; `npm run validate:content` also regenerates them), and `tests/outline.test.ts` fails if a committed outline is stale.

## 5. Content model (contract — keep it stable)

Defined in `src/content/schema.ts` with zod; types are inferred from the schemas.

```ts
type Level = "foundation" | "intermediate" | "advanced";
type Priority = 1 | 2 | 3; // 3 = asked in almost every interview (⭐⭐⭐)

interface CodeExample {
  lang: "python" | "javascript" | "typescript" | "bash" | "json" | "text";
  code: string;
  output?: string; // REQUIRED whenever the code prints/returns something
  caption?: string;
}

interface Question {
  id: string; // "py-mutable-vs-immutable" — unique, kebab-case, track prefix
  sectionId: string;
  level: Level;
  priority: Priority;
  question: string; // English, as an interviewer would ask it
  tags: string[];
  answer: {
    interview: string; // markdown, English — what to SAY
    explanationBn: string; // markdown, Bangla — the deeper why/how
    examples?: CodeExample[];
    pitfalls?: string[]; // English or Bangla, short
    followUps?: string[]; // likely next questions from the interviewer
  };
  visualizationId?: string; // must exist in visualizations/registry.ts
  related?: string[]; // other question ids
}

interface Section {
  id: string; // "py-functions"
  title: string;
  description: string;
  order: number;
  questions: Question[]; // sorted foundation → intermediate → advanced
}

interface Exercise {
  id: string; // "py-ex-palindrome"
  title: string;
  level: Level;
  category:
    | "logic"
    | "strings"
    | "arrays"
    | "hashing"
    | "recursion"
    | "language-feature"
    | "output-prediction"
    | "implementation";
  tags: string[];
  prompt: string; // markdown
  examples: { input: string; output: string; note?: string }[];
  constraints?: string[];
  hints: string[]; // progressive, revealed one at a time
  solutions: {
    label: string;
    code: string;
    complexity?: { time: string; space: string };
  }[];
  sampleRun: { code: string; output: string };
  explanationBn: string;
}

interface Track {
  id: "python" | "javascript" | "typescript" | string;
  name: string;
  slug: string;
  accent: string; // tailwind color token for the track
  icon: string; // lucide icon name or local svg
  description: string;
  sections: Section[];
  exercises: Exercise[];
  coverage: {
    quickConcepts: Question[]; // one-liner topics: short interview answer only
    notCovered: { topic: string; reason: string }[];
    studyTips: string[];
  };
}
```

## 6. Content writing rules

- **Interview Answer (English):** start with a one-sentence direct answer, then key points, then (if useful) a one-line "real-world use". No filler, no "Great question". Should sound like a confident mid-level developer.
- **ব্যাখ্যা (Bangla):** explain _why_ and _how it works internally_, with an analogy where it helps. Keep technical terms in English (closure, event loop, hashable...). Natural, conversational Bangla, not textbook-formal.
- **Every code example that prints or returns something must have an `output`.** Outputs must be correct — mentally execute or actually run the code. Python outputs must match CPython 3.12+, JS outputs must match modern Node/Chrome. SQL examples run against the track's sample database: a query returning rows shows a `resultTable` (cells exactly as PostgreSQL prints them: integers as numbers, booleans as true/false, everything else as Postgres text such as `1500.00`); command tags, notices and errors go in `output`, psql-style (`UPDATE 3`, `ERROR:  …`). `npm run verify:outputs` checks every one against a freshly seeded PGlite.
- Keep code examples short (ideally ≤ 20 lines), runnable as-is, and focused on one idea.
- Output-prediction questions: put the code in the question; the answer reveals the output and explains it step by step.
- `priority: 3` only for topics asked in nearly every interview. Be honest; don't mark everything 3.
- Questions within a section are sorted by level, then priority (desc).
- No duplicate questions across sections. Link related ones with `related`.
- Content must be accurate for current versions: Python 3.12+, ES2024+, TypeScript 5.x.

## 7. UI / UX rules

**Look & feel:** clean, modern, documentation-grade (think Vercel docs / Linear quality). Generous whitespace, clear hierarchy, subtle borders, soft shadows, rounded-xl cards. No visual clutter. Use the `frontend-design` mindset: intentional typography (e.g. Inter / Geist for UI, JetBrains Mono for code; Hind Siliguri or Noto Sans Bengali for Bangla text), one accent color per track (Python: blue/yellow, JS: amber, TS: blue).

**Theme:** light and dark mode, both first-class. Default = system preference; toggle in the top bar; persisted. Theme via CSS variables + Tailwind `dark` variant. Code blocks switch Prism theme with the app theme. Check contrast in both modes (WCAG AA).

**Responsive (mobile is a must):**

- Desktop (≥1024px): left sidebar (tracks → sections), main content, right "On this page" TOC.
- Tablet: collapsible sidebar, no right TOC.
- Mobile: top bar with menu button → slide-in sheet navigation; bottom-safe spacing; code blocks scroll horizontally; tap targets ≥ 44px; visualizations must reflow or scale (no horizontal page overflow).
  **Navigation:**
- Sidebar: track list → expandable sections with question counts and progress.
- Breadcrumbs: Home / Track / Section / Question.
- Section page has a sticky level filter (All · Foundation · Intermediate · Advanced) and priority filter.
- Previous / Next question navigation.
- Table of contents on section pages (each question is an anchor).
  **Answers:**
- Each QuestionCard shows the question; the answer is collapsed by default ("Show answer").
- Global **Practice Mode** toggle: hides all answers on the page. Persisted.
- Answer panel uses tabs or stacked blocks: Interview Answer · ব্যাখ্যা · Code · Pitfalls · Follow-ups · Visualize (only tabs with content appear).
- Each question: "Mark as learned" (checkbox) and "Bookmark" (star). Show progress per section and per track.
- Copy button on code blocks; output block visually distinct ("Output" label, muted background).
  **Search:**
- Command palette on `Ctrl/Cmd + K` and a search button in the top bar (mobile too).
- Fuzzy search across question text, tags, section titles, exercise titles, quick concepts. Group results by track; show level badge. Enter navigates to the question anchor.
- Filter chips: track, level, type (question / exercise).
  **Keyboard shortcuts:** `Ctrl/Cmd+K` search, `/` search, `j/k` next/prev question, `space` toggle current answer, `p` practice mode, `t` theme. Show a shortcuts dialog on `?`.

**Accessibility:** semantic headings, focus rings, `aria-expanded` on toggles, reduced-motion support (`prefers-reduced-motion` disables auto-play animations).

## 8. Visualization rules

- Each visualization is a self-contained component in `src/visualizations/<track>/`, registered in `registry.ts` with a string id, and **lazy-loaded**.
- Wrap all in `VizFrame` (title, short caption, StepControls: prev / play-pause / next / reset, step counter, step description text under the diagram).
- Step-based: a visualization is a list of steps; each step = a state snapshot + a one-line explanation (English + optional Bangla). Prefer steps over continuous animation.
- Must work in both themes and on a 360px-wide screen.
- Built with SVG/divs + `motion`. No heavy chart libraries.

## 9. Routing

```
/                                   Home: track cards, overall progress, continue where you left off
/:trackSlug                         Track overview: sections, counts per level, progress
/:trackSlug/:sectionId              Section questions (level filter, practice mode)
/:trackSlug/q/:questionId           Single question deep link
/:trackSlug/exercises               Exercise list (filter by level/category)
/:trackSlug/exercises/:exerciseId   Single exercise
/:trackSlug/coverage                Quick concepts + not covered + study tips
/:trackSlug/dataset                 Sample database: tables, rows, ER diagram, seed SQL (tracks with dataset.ts)
/:trackSlug/playground              SQL Playground on the sample database, in-browser PGlite (tracks with dataset.ts; not prerendered)
/bookmarks                          Bookmarked questions across tracks
*                                   404
```

Routes are lazy-loaded; content is loaded per section (plus the track's outline) via dynamic import so the initial bundle stays small.

**Prerendering:** `npm run build` renders every content route to static HTML (`dist/<path>.html`, served at the clean URL) and the browser hydrates it. Consequences for code:

- Render must be deterministic and must not read browser-only state (`localStorage`, `matchMedia`, `window`) during render. Saved user state is loaded after hydration (`skipHydration` on the persisted zustand stores, rehydrated in `app/providers.tsx`). Read browser APIs in effects, or via `useSyncExternalStore` with a server snapshot.
- Loader data is embedded in each page's HTML, so loaders return only what the page shows.
- `/bookmarks` and unknown URLs are not prerendered: hosts serve `dist/spa.html` (the app shell) for them via `vercel.json` rewrites / Netlify `_redirects`.

## 10. Adding a new track (must stay this simple)

1. Create `src/content/<track>/` (folder name = track id) with `index.ts`, `meta.ts`, `sections/*.ts`, `exercises.ts`, `coverage.ts`. Name each section file after its section id without the track prefix (`go-concurrency` → `sections/concurrency.ts`).
2. Register it in `src/content/tracks.ts`.
3. Add any visualizations under `src/visualizations/<track>/` and register their ids.
4. Optional: add `dataset.ts` (exporting `dataset`, built with `defineDataset`) for a sample database. The dataset page, its sidebar link and track-page card appear automatically.
5. Run `npm run validate:content` (generates the track's outline, then validates). Commit the generated `outline.generated.json`.
   No changes to pages, router, search or sidebar should be needed.

## 11. Definition of done (for every task)

- `npm run build`, `npm run lint`, `npm run test` pass; `npm run verify:outputs` passes when content changed.
- Content validation passes (unique ids, valid `sectionId`/`visualizationId`/`related`, every printing example has `output`).
- Checked in light + dark mode and at 360px, 768px, 1280px widths.
- No console errors or warnings.

## 12. Don'ts

- Don't add a backend, auth, database, or analytics.
- Don't hardcode content inside components — content lives only in `src/content`.
- Don't mark everything as priority 3.
- Don't write code examples without outputs, or outputs you haven't verified.
- Don't install large UI kits (MUI, Ant, Chakra) or chart libraries.
- Don't break the content schema; if it must change, update schema, all tracks, and tests together.
