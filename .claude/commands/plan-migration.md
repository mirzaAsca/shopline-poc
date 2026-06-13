---
description: Phase 1 — analyze a source site (or one page) and generate a descriptively-named specs/ plan file (all checkbox items). Does not implement.
argument-hint: <source-url-or-html> [1:1|redesign] [--page]
---
Source / mode / scope: $ARGUMENTS

Read and follow `prompts/PLAN.md` exactly. Parse `$ARGUMENTS` as the source URL/HTML, an optional mode (`1:1` default | `redesign`), and an optional scope flag **`--page`** — when present, plan **only that one page** (no site crawl, no other routes; default is the full site). Produce a new, descriptively-named spec file in `specs/` (e.g. `specs/01-full-initial-migration.md`, or `specs/02-page-about.md` for `--page`) per `docs/spec-template.md`, with every item as a checkbox. Plan only — write the spec file and stop; do not implement theme code.
