# Agent Workflow (Ralph-loop, READ FIRST)

> **Authority: principles.** How agents work on a migration: a two-phase, spec-driven loop. Greenfield only — each migration is a fresh Bottle theme, which is exactly where this loop shines.

## Two phases
1. **Plan** (`/plan-migration`, `prompts/PLAN.md`) — analyze the source site, write a new `specs/<NN>-<type>-<slug>.md` (all checkbox items). **No implementation.**
2. **Implement** (`/implement-next`, `prompts/PROMPT.md`) — one task per **fresh context window**: pick the most important unchecked task, build it, **deploy the changed theme/records to SHOPLINE**, test it, validate it (desktop+mobile), tick it, commit + push. Repeat. (Future: `while :; do cat prompts/PROMPT.md | claude ; done`.)

## Rules (non-negotiable)
- **One task per loop.** Context compaction is the enemy — do exactly one thing, then stop. The next loop starts clean.
- **Exit is explicit.** The loop stops on a defined condition — all spec checkboxes done, a `.ralph/BLOCKED` escalation, a max-iteration/budget cap, or a no-progress circuit-breaker — never an unbounded `while :`. "Done" is decided by the **gate (tests + visual-diff)**, not the model's say-so. Rules + runner: [loop-and-exit.md](loop-and-exit.md), `scripts/ralph.sh`.
- **Don't assume not implemented.** Before building, **search the codebase with parallel subagents**. Never assume an item is missing.
- **Subagents = research only.** Spawn many in parallel for search/analysis. **The main agent alone** edits, builds, tests, and validates — never delegate those (single-writer keeps back-pressure honest).
- **Full implementations, never placeholders.** Modular, brand-neutral, color-scheme + responsive + presets + i18n (see [implementation-principles.md](implementation-principles.md), `../craft/*`).
- **Tests are back-pressure.** Per task, write a runnable `tests/*.test.js` (Playwright) and run it; it must pass. Every test **documents what it guards and why** — future fresh-context loops have no memory ([../runbooks/testing.md](../runbooks/testing.md)). Tests are *planned* in the spec and *implemented* in the loop.
- **Deploy before validating.** A storefront/visual check is only meaningful against the pushed theme + created records — push the changed files to `${SL_THEME_ID}` (and create any page/blog records) before the visual gate ([../ops/deploy-publish-validate.md](../ops/deploy-publish-validate.md)).
- **Visual validation is mandatory for UI.** Side-by-side original|new at matched scroll coords, desktop **and** mobile, pixel-diff score + agent review of the merged image ([../runbooks/visual-qa.md](../runbooks/visual-qa.md)).
- **Close every task:** tick its `[x]` in the spec, log any decision + why in that spec's Decision log, **append** discoveries to [`/LEARNINGS.md`](../../LEARNINGS.md) **per its header rubric** (journal it; route durable fixes to `docs/` and `validation-status.md` too), then commit with detail and push.
- **Keep the source of truth current.** If you discover the guidance itself (`CLAUDE.md`/`docs/*`) is wrong, fix it as part of the task.
- **Docs-first for SHOPLINE.** When you hit a SHOPLINE unknown or bug, consult the **official docs first** ([../ops/shopline-references.md](../ops/shopline-references.md)) — don't guess/brute-force endpoints. Reverse-engineering (capture/replay, schema introspection) is a last resort for genuinely undocumented things. Record the doc link in `LEARNINGS.md` with the finding.

## Source-of-truth chain
`CLAUDE.md` (router) → `docs/principles/*` (read first) → `docs/craft/*` + `docs/ops/*` (on-demand) → the active `specs/*.md` (what to do) → `LEARNINGS.md` (what we've learned). Cite these in every spec task.
