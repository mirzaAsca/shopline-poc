# SPEC template — the required structure for a `specs/` file

> Spec files do **not** ship in the template. `/plan-migration` (Phase 1) generates a **new file in `specs/`** per unit of work, named **`specs/<NN>-<type>-<slug>.md`** (increasing `NN`) — e.g. `specs/01-full-initial-migration.md`, `specs/02-fix-ux-on-homepage.md`, `specs/03-redesign-hero.md`. One file = one unit of work; a spec is the **record** of that work and is **never deleted** (items get ticked `[x]`, not removed). The `specs/` folder is created by the first run. This file defines the structure each spec must follow. Model: codex ExecPlan (self-contained, checkboxed progress, decision log, observable validation) + our migration rules.
>
> **Rule: every implementable line is a checkbox (`- [ ]`)** — tasks, sub-steps, tests, asset actions, and QA items. Prose is allowed only in the Header / Purpose / Decision-log metadata sections.

A `specs/<NN>-<type>-<slug>.md` file must contain these sections, in order:

## 1. Header
- **Source:** URL / reference file · **Mode:** `1:1` | `redesign` · **Target:** `${SL_STORE}` / theme `${SL_THEME_ID}`.
- **Locales:** list. **Generated:** by which command, when.

## 2. Purpose / big picture
What the finished migration looks like and how to observe it working (the live preview URL + the visual-diff passing at desktop+mobile).

## 3. Phases (each = a checklist of tasks)
Order matters; lower phases first.
- **Phase 0 — Foundation:** `theme.config.json` color schemes + `font`/`layout` from brand tokens; header-group/footer-group; global typography.
- **Phase 1 — Sections:** one task per source block → Bottle section (stock or new custom section). Modular, brand-neutral.
- **Phase 2 — Pages, nav, i18n, SEO:** templates (`page.<handle>.json`), page records (Admin API), store menus, `i18n/<locale>.json`, handles + 301s + meta.
- **Phase 3 — QA:** per-page side-by-side visual diff (desktop+mobile); fix-and-recheck tasks.

> **Single-page units (`--page`):** the phases cover only that one page — the foundation it needs (skip if already built) → its sections → that one page/route + i18n/SEO → QA for that page. The full-site route-parity rule does not apply.

### Task format (every task is a checkbox)
```
- [ ] <short task title>
      Goal:        <what must exist after this task>
      References:  <CLAUDE.md / docs/craft/… / docs/ops/…>  +  <source coordinates: URL + selector/region>
      Steps:       <concrete steps>
      Assets:      <provided | scrape: which>  (see docs/runbooks/scrape-assets.md)
      Acceptance:  <observable result; for UI → side-by-side visual-diff passes at desktop AND mobile, score ≤ threshold>
      Tests:
        - [ ] tests/<name>.test.js — <what it guards and WHY>
```
> **Tests are planned here as their own checkbox sub-tasks** and implemented in Phase 2. Each names a real `tests/*.test.js` (Playwright) and states what regression it prevents. See `docs/runbooks/testing.md`.

## 4. Assets register
Table of every asset: source URL · provided-in-`public/images`? · action (use | scrape) · final `public/images/...` path.

## 5. Decision log
Append-only: `YYYY-MM-DD — decision — why`. Every non-obvious choice (section mapping, redesign deviation, etc.). Check before re-litigating.

## 6. Validation / QA
How "done = identical to source" is proven: the side-by-side merged images (original | new) per page at matched scroll coords, the pixel-diff scores, and the passing `tests/`.
