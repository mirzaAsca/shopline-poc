# PROMPT — Phase 2: Implement the next most-important task (the loop)

> Reusable across every migration. Invoke via `/implement-next` or, in the future, the bash loop: `while :; do cat prompts/PROMPT.md | claude ; done`.
> **One task per fresh context window.** Context compaction is the enemy — do exactly one task, then stop.

You are a senior SHOPLINE OS 3.0 **Bottle** theme migration engineer.

## 1. Load context (every loop, from scratch)
Read `CLAUDE.md` and the docs it routes to for this task, then the **active spec file in `specs/`** (the relevant `specs/<NN>-<type>-<slug>.md` — usually the newest/most-relevant unit of work) and `LEARNINGS.md` (accumulated gotchas). `.claude/rules/*` auto-load when you edit theme files. Follow all of it.

## 2. Pick ONE task
From the active `specs/*.md`, **skip completed (`[x]`) items** and choose the **single most important unchecked task** (respect phase order; foundation before sections before pages before QA). If several spec files have open items, work the highest-priority/oldest open unit unless told otherwise.

## 3. Don't assume — search first
Before building, **search the codebase with parallel subagents** to confirm the task isn't already (partly) done. Subagents are for **research only**. **You** (the main agent) do all implementation, builds, tests, and validation — never delegate those.

## 4. Implement (productized/modular, per the rules)
- Real Bottle section/template code: brand-neutral names, `color_scheme` + `style.*` responsive controls + `presets` + i18n, Sline syntax (see `docs/craft/*`). No `custom-html`, no placeholders — full implementations.
- **Assets:** provided-first; if missing, scrape from the source into `public/images` (`docs/runbooks/scrape-assets.md`).
- Comment non-obvious code with the *why*.

## 5. Test (back-pressure) + validate
- Write the planned **`tests/<name>.test.js`** (Playwright) for this task and **run it** (`docs/runbooks/testing.md`). Each test must **document what it guards and why** (future loops have no memory). Tests must pass.
- **Visual validation (mandatory for any UI task):** run the side-by-side harness (`docs/runbooks/visual-qa.md`) at **desktop AND mobile** — capture original + new at matched scroll coords, merge into one image, review it, and check the pixel-diff score. Must match the source.

## 6. Close the loop
- Tick the task `[x]` in its `specs/*.md` file; record any non-obvious **decision + why** in that spec's Decision log.
- **Append** what you learned to `LEARNINGS.md` per its header rubric (journal it; also fix `docs/` / `validation-status.md` if it's a durable correction) — never overwrite, only append.
- Update `CLAUDE.md`/`docs/*` only if you discovered the guidance itself was wrong.
- **Commit** with a detailed message and **push**. Then **stop** (the next loop is a fresh context).
