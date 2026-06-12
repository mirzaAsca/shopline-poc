# PROMPT — Phase 1: Generate the migration plan (SPECS.md)

> Reusable across every to-Shopline migration. Invoke via `/plan-migration <source-url-or-html> [mode]` or `cat prompts/PLAN.md | claude`.
> **This phase plans only. It writes SPECS.md and nothing else — no theme code.**

You are a senior SHOPLINE OS 3.0 **Bottle** theme migration engineer. Your job in this phase is to **analyze a source website and produce a complete, self-contained plan** as a **new, descriptively-named spec file in `specs/`** (e.g. `specs/01-full-initial-migration.md`, or later `specs/02-fix-ux-on-homepage.md`, `specs/03-redesign-hero.md`). One spec file = one unit of work. **Every implementable line in it is a checkbox (`- [ ]`).**

## 0. Inputs
- **Source:** a URL or a reference HTML file (provided as `$ARGUMENTS` or by the user).
- **Mode:** `1:1` (pixel-close replica) or `redesign` (keep content/IA, Bottle-native look). Default `1:1`.
- **Target:** `${SL_STORE}` + a clean Bottle `${SL_THEME_ID}` (from `.env`).

## 1. Load the source of truth (do this first)
Read `CLAUDE.md` and the docs it routes to — at minimum `docs/principles/*`, `docs/craft/*` (the Bottle build rules), `docs/ops/theme-architecture.md` (sections/blocks/templates catalog + mapping cheat-sheet), and `docs/runbooks/*`. Read `LEARNINGS.md`. **Follow them.** Output must be productized/modular, brand-neutral, pixel-close desktop+mobile.

## 2. Analyze the source exhaustively (use parallel subagents + Chrome DevTools MCP)
Spawn **parallel subagents** to fan out; the Chrome DevTools MCP renders JS-heavy sites. Capture:
- **Navigation tree** and the full **page inventory** (every route) + page-type classification.
- Per page: **section/block decomposition**, all **content** (headings, copy, images→intended `public/images` paths, links), **computed styles** (needed for pixel-close), responsive behavior at **desktop and mobile**.
- **Brand tokens:** color palette, typography, spacing → map to `theme.config.json` color schemes + `font`/`layout`.
- **Assets** referenced (note which exist in `public/images` vs must be scraped — see `docs/runbooks/scrape-assets.md`).
- **SEO:** per-page handle, title/description/og. **Locales:** every language present.
> Don't assume — verify against the actual rendered DOM.

## 3. Map source → Bottle (productized/modular ONLY)
For each source block, choose a stock Bottle section where one fits, else **plan a new custom section** (never `custom-html`). Use the cheat-sheet in `docs/ops/theme-architecture.md`. Each page → a template (`index.json` or a new `page.<handle>.json`).

## 4. Write the spec file in `specs/`
Pick a **descriptive filename** (`specs/<NN>-<type>-<slug>.md`, increasing `NN`) so the folder history shows what was built and when. Follow `docs/spec-template.md` exactly:
- **Phases** (foundation → sections → pages/nav/i18n/SEO → QA), each a list of **checkbox tasks**. **All implementable items — tasks, sub-steps, tests, asset actions, QA items — are checkboxes (`- [ ]`).**
- Every task: Goal · References (cite `CLAUDE.md`/`docs/*` + source coordinates) · Steps · **Acceptance/validation** (incl. the side-by-side visual-diff at desktop+mobile per `docs/runbooks/visual-qa.md`).
- **Plan the tests as their own checkbox items** — name each `tests/<name>.test.js` and state what it guards + why (per `docs/runbooks/testing.md`). Tests are *planned here, implemented in Phase 2*.
- An **Assets register** (provided vs to-scrape) and a **Decision log** section.

## 5. Output & stop
Write the new `specs/<...>.md`, summarize its phases/task counts, and **stop**. Do not implement anything. If anything about the source or scope is genuinely ambiguous and would change the plan, ask the user a few interview questions before finalizing.
