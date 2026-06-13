# Loop & Exit Strategy (Ralph) — READ FIRST

> **Authority: principles.** How the implement loop runs and — critically — **when it stops**. Runner: `scripts/ralph.sh`. Per-iteration prompt: `prompts/PROMPT.md`.

## The loop in one line
`scripts/ralph.sh` repeatedly invokes a **fresh-context** agent on `prompts/PROMPT.md`. Each iteration does **exactly one** spec task — build → deploy → test → visual-diff → tick `[x]` → commit + push — then exits. Progress lives in **files + git + the spec checkboxes**, never in a long conversation. *(Canonical Ralph, Huntley: "one item per loop"; "the more you use the context window, the worse the outcomes you'll get.")*

## Two layers of "done"

**1. Per-task gate (inner).** A checkbox becomes `[x]` **only when its tests AND the desktop+mobile visual-diff pass.** Completion is decided by **external verification — never the model's self-assessment.** The same model that wrote the code will confidently approve broken code, so "the agent said it's done" is *not* done; a green gate is. (See `../runbooks/testing.md`, `../runbooks/visual-qa.md`.)

**2. Per-loop exit (outer — the orchestrator decides, in priority order):**

| # | Condition | Action | exit code |
|---|---|---|---|
| 1 | **Work complete** — zero `- [ ]` left across `specs/*.md` | success | `0` |
| 2 | **Blocked** — `.ralph/BLOCKED` written (e.g. task needs a ⚠️ unverified capability) | stop + escalate to a human | `3` |
| 3 | **Max iterations** reached (`RALPH_MAX_ITERATIONS`, default 20) | stop (safety cap) | `4` |
| 4 | **Budget** exceeded (`RALPH_MAX_BUDGET_USD`, default 10) | stop (cost cap) | `5` |
| 5 | **Stuck** — no new commit for `RALPH_NO_PROGRESS` loops (default 3) | stop + escalate (circuit-breaker) | `6` |

> The `- [ ]` count hitting **0 is the natural terminator** — our specs are all-checkbox by design, so "out of work" is unambiguous and machine-checkable. No more open boxes ⇒ the migration unit is finished.

## When to recycle context (and when NOT to chase a usage %)
Recycle at the **task boundary** — one task per fresh context. Do **not** keep one conversation running toward ~90% / compaction to "save" reloads: that maximizes the degradation Ralph is built to avoid, and context-fill % isn't reliably measurable anyway (the model can't introspect it mid-run; `/context` is visual-only; headless JSON exposes *cost*, not *fill %*). To cut per-loop overhead, keep each task's context **small** — delegate research to **parallel subagents** — rather than stuffing one context full. Treat `--max-turns` / budget as **ceilings that stop a run**, not targets to creep toward.

## Blocked vs. stuck (operator playbook)
- **Blocked** = the task *can't* proceed (needs an unverified API — e.g. menus/redirects, see [../validation-status.md](../validation-status.md) — or a human decision). The agent writes a one-line reason to `.ralph/BLOCKED`; the loop stops cleanly. Don't spin on impossible work.
- **Stuck** = the loop runs but stops landing commits (circuit-breaker trips). Recovery is the same as canonical Ralph: re-narrow to one item, tune `prompts/PROMPT.md`, clarify/rewrite the offending spec task, or `git reset --hard` and re-run. *"Any problem created by AI can be resolved through a different series of prompts."*
