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

## 2026-06-12 — SHOPLINE has NO REST Admin API "pages" resource (our create-page.sh path was wrong)
**What:** With a VALID custom-app token on mirza-asca, probed ~20 endpoint variants. `GET /admin/openapi/v20260901/store/blogs.json` → 200 `{"blogs":[]}` (token + version + `/store/` pattern all good). But every pages path 404s: plain paths → `{"errors":"url not found"}`; `/store/pages.json|page.json|custom_pages.json` → `{"errors":"script tag data not found:..."}` — i.e. the `/store/` handler only knows a fixed resource set (blogs, script_tags), and `pages` isn't one. `/admin/openapi/.../graphql.json` → 404; `/admin/api/.../graphql.json` → 204 (exists, but introspection returned no body).
**Why it matters:** `docs/ops/pages-and-records.md` + `scripts/create-page.sh` claimed `POST /admin/openapi/{v}/pages.json` with `template_suffix`. That came from a weak web-search citation (likely conflated with Shopify), was flagged ⚠️ "never executed" in `validation-status.md`, and is now **disproven by execution**. Auth/scope are fine; the REST resource simply does not exist. Pages DO exist as records (we created one via the Admin UI on the 0f5667 store), so SHOPLINE likely creates them via its internal admin API (cookie/session-authed, what the UI/CLI use) or possibly admin GraphQL — NOT the public app OpenAPI.
**Action:** Do NOT trust create-page.sh. Confirm the real mechanism (ask how the custom app creates pages; or investigate admin GraphQL at /admin/api/{v}/graphql.json) before fixing docs/ops/pages-and-records.md, scripts/create-page.sh, validation-status.md.
