# Shopline Bottle Migration — Agent Guide

You build **productized, modular** SHOPLINE **Bottle** themes (Sline engine — Handlebars-like, **not** Liquid) and migrate storefronts onto them. Output is always reusable sections (color scheme + responsive controls + presets/i18n), **brand-neutral**, **pixel-close on desktop AND mobile**.

**Precedence on conflict:** ops/CLI/deploy/page-records/validation → `docs/ops/*` wins. Sline craft (syntax, sections, color, responsive) → `docs/craft/*` wins.

**Before anything unattended (e.g. auto-publish):** check `docs/validation-status.md` — ⚠️ items are unverified.

**This project's concrete values** (store domain, theme IDs, rollback): `PROJECT.md`. Per-env secrets: `.env`.

## Workflow — two phases (Ralph loop)
1. **Plan** — `/plan-migration <source-url> [1:1|redesign]` → analyze the source, write a new checkbox spec in `specs/`. No code. (`prompts/PLAN.md`)
2. **Implement** — `/implement-next` → **one task per fresh context**: pick the most important unchecked task from the active `specs/*.md`, build it, write + run `tests/*.test.js`, run the desktop+mobile visual diff, tick the box, append to `LEARNINGS.md`, commit + push. Repeat. (`prompts/PROMPT.md`)

Full rules in `docs/principles/agent-workflow.md`. **Append every discovery/gotcha to `LEARNINGS.md`** (append-only).

## Read BEFORE any work (principles)
- `docs/principles/agent-workflow.md` — the two-phase loop, subagents (research only), don't-assume-search-first, tests as back-pressure
- `docs/principles/implementation-principles.md` — reusability, brand-neutral, theme-vs-apps, PDP safety
- `docs/principles/migration-decisions.md` — the locked v1 decisions (authoritative)

## Read ON-DEMAND (Read the file when the task matches — do NOT preload)
| Task | Read |
|---|---|
| Write/edit a section or block | `docs/craft/sline-syntax.md`, `components-sections-blocks.md`, `schemas-and-i18n.md`, `color-schemes.md`, `responsive-controls.md` |
| Fonts / assets | `docs/craft/assets-and-fonts.md` |
| Understand the theme | `docs/ops/theme-architecture.md` |
| CLI / pull / push | `docs/ops/cli-reference.md` |
| Deploy / publish / validate | `docs/ops/deploy-publish-validate.md` |
| Create a page route | `docs/ops/pages-and-records.md` |
| Store/theme setup | `docs/ops/environment-setup.md`, `docs/ops/store-and-theme-config.md` |
| Plan a migration (write the spec) | `prompts/PLAN.md`, `docs/spec-template.md`, `specs/README.md` |
| Migrate a whole page | `docs/runbooks/migrate-a-page.md` |
| Build one section | `docs/runbooks/build-a-section.md` |
| Visual QA (side-by-side, desktop+mobile) | `docs/runbooks/visual-qa.md` |
| Assets (provided-first, else scrape) | `docs/runbooks/scrape-assets.md` |
| Write / run tests | `docs/runbooks/testing.md` |
| Audit a theme | `docs/runbooks/audit-a-theme.md` |
| Debug | `docs/troubleshooting.md` + `docs/validation-status.md` |

> `.claude/rules/*` auto-load when you edit `sections/`, `blocks/`, `templates/`, `theme.config.json` — no action needed.

## Non-negotiables (full detail in docs/craft + .claude/rules)
1. `@shoplineos/cli` (`sl`), **not** `@shoplinedev/cli`.
2. Sline, not Liquid. Files `.html` with `{{#schema}}`; no `config/settings_schema.json`.
3. kebab-case files; snake_case schema IDs & `t:` keys; `$`-prefix section-local block types.
4. Image setting type = `image` (not `image_picker`); resolve with `image_url()`.
5. Every merchant-addable section: `color_scheme` setting + `style.layout/spacing/size` with `@media (--mobile)`, rendered via `class_list()`.
6. Brand-neutral names everywhere; merchant copy only in editable content.
7. A template ≠ a page route. No public page API — create page records with `scripts/create-page.mjs` (internal API `…/site/page/customize`; `templateName` attaches the template) or the Admin UI (`docs/ops/pages-and-records.md`).
8. Publish = status-swap API (`sl theme push -p` is a no-op).
