# Runbook: Tests (Playwright, back-pressure)

> Tests are **real runnable `tests/*.test.js`** that validate each implementation and **prevent regression**. They are **planned in the spec** (as checkbox items) and **implemented in the loop** — never pre-created in the template.

## Where & how
- Location: **`tests/`** at project root, `tests/<name>.test.js`.
- Driver: **Playwright** (headless Chromium). Run with `npx playwright test` (config + dep added on first use via `npm i -D @playwright/test`).
- Each test **documents what it guards and WHY** at the top — future fresh-context loops have no memory of intent (Ralph back-pressure).

## Test types (agent picks what fits the task)
- [ ] **Visual diff** — drive the [visual-qa](visual-qa.md) harness; assert pixel-diff score ≤ threshold at desktop + mobile for the page/section.
- [ ] **Render / 200** — every route loads, no "404 page not found", no console errors.
- [ ] **Broken asset / link** — no 404 images/links; assets resolve under `public/images`.
- [ ] **Structure assertions** — the implemented section has the required schema: `color_scheme` setting, `style.*` responsive controls, `presets`, i18n labels, and a **brand-neutral name** (machine-check the principles).

## Lifecycle
1. Phase 1 (`/plan-migration`) lists the needed tests as checkbox items under each task (`tests/<name>.test.js — guards X because Y`).
2. Phase 2 (`/implement-next`) implements the task, **writes that test**, runs it green, then ticks both the task and its test checkbox.
3. The suite stays in `tests/` as the regression guard for all future loops.

## Note
Theme code has no traditional "unit" surface — these tests are **behavioral/visual** against the rendered storefront (preview URL) and the theme files. That's the correct correctness gate for a pixel-close migration.
