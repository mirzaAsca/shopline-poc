# LEARNINGS (append-only)

> The running log of things discovered while working — gotchas, surprises, and **bugs found in our own instructions** (`CLAUDE.md`/`docs/*`). Every loop reads this; every loop that learns something **appends** to it (never overwrite, never delete). When a learning means the docs are wrong, fix the doc *and* note it here.
>
> Format: `## YYYY-MM-DD — <short title>` then **What / Why it matters / Action taken (doc fixed?)**.

---

## seed — verified during the POC (carry forward)
- **Use `@shoplineos/cli` (`sl`), not `@shoplinedev/cli`.** The latter can't push OS 3.0/Bottle themes. → `docs/ops/cli-reference.md`, `docs/troubleshooting.md`.
- **`sl theme push -p` (publish) is a no-op.** Publish via the `changeThemeStatus` API. → `docs/ops/deploy-publish-validate.md`.
- **A template ≠ a page route.** `/pages/<handle>` 404s until a page record exists (Admin API). → `docs/ops/pages-and-records.md`.
- **The store can be password-gated** ("Opening soon") — public fetch sees the gate; drive the isolated Chrome/CDP instead. → `docs/ops/deploy-publish-validate.md`.
- **Unverified (⚠️):** Admin page-create API + `scripts/create-page.sh`, menu API, redirects API. → `docs/validation-status.md`. Verify before relying on them unattended.

<!-- New entries below this line. Append; do not edit existing ones. -->
