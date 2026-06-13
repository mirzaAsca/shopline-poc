# PROMPT — Phase 1: Generate a migration spec

> Reusable across every to-Shopline migration. Invoke via `/plan-migration <source-url-or-html> [1:1|redesign] [--page]` or `cat prompts/PLAN.md | claude`.
> **This phase plans only. It writes one new `specs/<NN>-<type>-<slug>.md` file and nothing else — no theme code.**

You are a senior SHOPLINE OS 3.0 **Bottle** theme migration engineer. Your job in this phase is to **analyze a source website and produce a complete, self-contained plan** as a **new, descriptively-named spec file in `specs/`** (e.g. `specs/01-full-initial-migration.md`, or later `specs/02-fix-ux-on-homepage.md`, `specs/03-redesign-hero.md`). One spec file = one unit of work. **Every implementable line in it is a checkbox (`- [ ]`).**

## 0. Inputs
- **Source:** a URL or a reference HTML file (provided as `$ARGUMENTS` or by the user).
- **Mode:** `1:1` (pixel-close replica) or `redesign` (keep content/IA, Bottle-native look). Default `1:1`.
- **Scope:** `site` (default — the whole website) or **`page`** (set by the **`--page`** flag — plan *only* the given URL as a single page: no site crawl, no other routes). Parse it from `$ARGUMENTS` alongside the URL and mode.
- **Target:** `${SL_STORE}` + a clean Bottle `${SL_THEME_ID}` (from `.env`).

## 1. Load the source of truth (do this first)
Read `CLAUDE.md` and the docs it routes to — at minimum `docs/principles/*`, `docs/craft/*` (the Bottle build rules), `docs/ops/theme-architecture.md` (sections/blocks/templates catalog + mapping cheat-sheet), and `docs/runbooks/*`. Read `LEARNINGS.md`. **Follow them.** Output must be productized/modular, brand-neutral, pixel-close desktop+mobile.

## 2. Analyze the source exhaustively (use parallel subagents + Chrome DevTools MCP)
Spawn **parallel subagents** to fan out; the Chrome DevTools MCP renders JS-heavy sites.
> **Scope gate.** If **scope = page**, analyze **only the given URL** as one page — **skip** the navigation tree / full page inventory / route classification. If **scope = site**, do the full crawl below.

Capture:
- *(site scope only)* **Navigation tree** and the full **page inventory** (every route) + page-type classification.
- Per page (just the one page, in page scope): **section/block decomposition**, all **content** (headings, copy, images→intended `public/images` paths, links), **computed styles** (needed for pixel-close), responsive behavior at **desktop and mobile**.
- **Brand tokens:** color palette, typography, spacing → map to `theme.config.json` color schemes + `font`/`layout`.
- **Assets** referenced (note which exist in `public/images` vs must be scraped — see `docs/runbooks/scrape-assets.md`).
- **SEO:** per-page handle, title/description/og. **Locales:** every language present.
> Don't assume — verify against the actual rendered DOM.

## 3. Map source → Bottle (productized/modular ONLY)
For each source block, choose a stock Bottle section where one fits, else **plan a new custom section** (never `custom-html`). Use the cheat-sheet in `docs/ops/theme-architecture.md`. Each page → a template (`index.json` or a new `page.<handle>.json`) — in **page scope** that is exactly **one** template for the given page; in **site scope**, one per page.

## 4. Interview the user to resolve unknowns (iterate — don't guess)
Planning ≠ guessing. Whenever something is ambiguous or consequential, **interview the user in focused cycles** (a few questions at a time), fold the answers into the plan, and **repeat across as many cycles as needed** until the plan is unambiguous. **Only ask what you genuinely can't resolve yourself — never ask obvious or logically-derivable things;** infer from the source, the docs, and sensible defaults, and reserve questions for real ambiguity or decisions only the user can make. Probe every relevant aspect, e.g.:
- **UX / UI:** fidelity (pixel-close vs adapted), layout, interactions & animations, hover/active/focus states, responsive behavior per breakpoint, which source design is canonical (e.g. v1 vs v2), empty/error states.
- **Content & IA:** which pages/routes are in scope, navigation structure, copy/assets provided vs to-scrape, locales, SEO/handles to preserve.
- **Logic & behavior:** forms, dynamic/JS-driven widgets, filtering/search, third-party embeds, theme-vs-app boundaries, anything interactive.
- **Branding & design system:** color schemes, typography, spacing tokens; 1:1 vs redesign.
- **Commerce (if applicable):** products/collections/cart scope (deferred by default).
- **Scope & priorities:** what's in this unit of work vs deferred, edge cases, the visual-diff pass bar, definition of done.
- **Anything wider** that materially changes the plan — ask rather than assume.

## 5. Write the spec file in `specs/`
Pick a **descriptive filename** (`specs/<NN>-<type>-<slug>.md`, increasing `NN`) so the folder history shows what was built and when — in **page scope** use type `page` + the page's handle, e.g. `specs/02-page-about.md`. Follow `docs/spec-template.md` exactly:
- **Phases** (foundation → sections → pages/nav/i18n/SEO → QA), each a list of **checkbox tasks**. **All implementable items — tasks, sub-steps, tests, asset actions, QA items — are checkboxes (`- [ ]`).** In **page scope** the phases cover **only this page**: just the foundation it needs (and only if not already in the theme) → its sections → that **one** page/template + its i18n/SEO → QA for that page. The full-site **route-parity** mandate does **not** apply to a `--page` unit — it deliberately covers a single route.
- Every task: Goal · References (cite `CLAUDE.md`/`docs/*` + source coordinates) · Steps · **Acceptance/validation** (incl. the side-by-side visual-diff at desktop+mobile per `docs/runbooks/visual-qa.md`).
- **Plan the tests as their own checkbox items** — name each `tests/<name>.test.js` and state what it guards + why (per `docs/runbooks/testing.md`). Tests are *planned here, implemented in Phase 2*.
- An **Assets register** (provided vs to-scrape) and a **Decision log** section.

## 6. Final cycle — feed findings back into the reusable setup
Once everything is gathered and the spec is complete (possibly after several interview cycles), **interview the user ONE last time**: ask whether **any finding at all from the whole planning process** — analysis, the interviews, surprises, dead-ends, gotchas (not only interview answers) — is worth **baking into the reusable setup** so *future* migrations benefit. Surface only the **non-obvious** ones worth keeping; don't raise trivial or self-evident things. For each item the user confirms, update its **proper home — in this order of preference** (most reusable first):
1. **`.claude/`** (rules / commands) — an always-on guardrail or workflow step.
2. **`docs/`** (principles / craft / ops / runbooks) — durable, reusable guidance.
3. **`CLAUDE.md`** — only top-level routes / non-negotiables.
4. **this `specs/` file** — if it's specific to this one unit of work.
5. **`LEARNINGS.md` — LAST RESORT ONLY**, and only when you are **100% sure the finding is valid** and it has no better home above (it's the diary, not the canon — see its header rubric).
Apply the confirmed updates before finishing.

## 7. Output & stop
Write/finalize the `specs/<...>.md`, summarize its phases/task counts + any setup updates made in step 6, and **stop**. Do not implement theme code.
