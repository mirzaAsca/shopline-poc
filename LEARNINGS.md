# LEARNINGS (append-only)

> The append-only **journal of what we learned**, in time order. **Read it every loop.**
>
> **Write an entry when** you learn something non-obvious: a gotcha/surprise, a **bug in our own instructions** (`CLAUDE.md`/`docs/*`), a resolved SHOPLINE issue (+ the official doc link, per the docs-first rule), or a dead-end worth remembering. Append only — never overwrite or delete.
>
> **Route the durable part to its real home too** — LEARNINGS is the diary, *not* the source of truth for any topic:
> - it corrects/extends guidance → **also fix `docs/`**
> - a capability proven/disproven → **also update `docs/validation-status.md`**
> - a per-project choice → **the active spec's Decision log**
>
> **Don't log:** routine task completion, things already correctly documented, or concrete per-project values (those go in `.env`).
>
> Format: `## YYYY-MM-DD — <short title>` then **What / Why it matters / Action taken (doc fixed?)**.

---

## seed — verified during the POC (carry forward)
- **Use `@shoplineos/cli` (`sl`), not `@shoplinedev/cli`.** The latter can't push OS 3.0/Bottle themes. → `docs/ops/cli-reference.md`, `docs/troubleshooting.md`.
- **`sl theme push -p` (publish) is a no-op.** Publish via the `changeThemeStatus` API. → `docs/ops/deploy-publish-validate.md`.
- **A template ≠ a page route.** `/pages/<handle>` 404s until a page record exists (internal admin API, via `scripts/create-page.mjs`). → `docs/ops/create-custom-pages.md`.
- **The store can be password-gated** ("Opening soon") — public fetch sees the gate; drive the isolated Chrome/CDP instead. → `docs/ops/deploy-publish-validate.md`.
- **Unverified (⚠️):** menu API, redirects API. → `docs/validation-status.md`. Verify before relying on them unattended. *(Page creation is RESOLVED — internal admin API via `scripts/create-page.mjs`; the old `create-page.sh` was deleted.)*

<!-- New entries below this line. Append; do not edit existing ones. -->

## 2026-06-12 — SHOPLINE has NO REST Admin API "pages" resource (our create-page.sh path was wrong)
**What:** With a VALID custom-app token on mirza-asca, probed ~20 endpoint variants. `GET /admin/openapi/v20260901/store/blogs.json` → 200 `{"blogs":[]}` (token + version + `/store/` pattern all good). But every pages path 404s: plain paths → `{"errors":"url not found"}`; `/store/pages.json|page.json|custom_pages.json` → `{"errors":"script tag data not found:..."}` — i.e. the `/store/` handler only knows a fixed resource set (blogs, script_tags), and `pages` isn't one. `/admin/openapi/.../graphql.json` → 404; `/admin/api/.../graphql.json` → 204 (exists, but introspection returned no body).
**Why it matters:** `docs/ops/pages-and-records.md` + `scripts/create-page.sh` claimed `POST /admin/openapi/{v}/pages.json` with `template_suffix`. That came from a weak web-search citation (likely conflated with Shopify), was flagged ⚠️ "never executed" in `validation-status.md`, and is now **disproven by execution**. Auth/scope are fine; the REST resource simply does not exist. Pages DO exist as records (we created one via the Admin UI on the 0f5667 store), so SHOPLINE likely creates them via its internal admin API (cookie/session-authed, what the UI/CLI use) or possibly admin GraphQL — NOT the public app OpenAPI.
**Action:** Do NOT trust create-page.sh. Confirm the real mechanism (ask how the custom app creates pages; or investigate admin GraphQL at /admin/api/{v}/graphql.json) before fixing docs/ops/pages-and-records.md, scripts/create-page.sh, validation-status.md.

## 2026-06-12 — RESOLVED: pages ARE creatable via SHOPLINE's INTERNAL admin API
**What:** Captured the Admin UI's "Create a new page" request via CDP on a logged-in admin tab. Endpoint: `POST /admin/api/site/page/customize` (session/cookie-authed — NOT the public OpenAPI). Body keys: `name.default` (title), `handle`, `customizePath:/pages/<handle>`, **`templateName:"templates/page.<suffix>.json"` (attaches the theme template)**, `status:1`, `seo{...}`. Replayed it programmatically (fetch from the logged-in page context) → `{"code":"SUCCESS","data":{"id":..,"customizePath":"/pages/.."}}`. Created 3 test pages on mirza-asca (CLI Test Page, api-test-page, script-test).
**Why it matters:** completes the migration pipeline — template (CLI) + page record + attach (this API). Page content lives in the attached template's sections (no body_html). Reusable script committed: `scripts/create-page.mjs` (runs the POST inside the isolated logged-in Chrome). Public-API page creation remains impossible (REST/GraphQL have no page resource) — this internal endpoint is the only way.
**Action:** Done — pages-and-records.md, validation-status.md, CLAUDE.md updated; create-page.sh deleted. Future: replay via CLI cookies+dfp-token to drop the browser dependency.

## 2026-06-12 — Blogs & articles ARE in the public Admin API (verified)
**What:** Created a blog and an article on mirza-asca with the Bearer app token.
- Blog: `POST /admin/openapi/{ver}/store/blogs.json` `{"blog":{"title","handle"}}` → 200 + id.
- Article: `POST /admin/openapi/{ver}/store/blogs/{id}/articles.json` `{"blog":{"title","content_html","handle","published":true}}` → 200 + id. GOTCHA: the article body is wrapped in **"blog"** (not "article") — `{"article":{…}}` returns 500 "title not allow blank".
**Why it matters:** route parity for a 1:1 migration needs blogs/articles too, and these (unlike custom pages) use the PUBLIC token API. Reusable script: `scripts/create-blog.mjs`. Docs: `docs/ops/create-blogs.md`, `docs/ops/content-and-routes.md` (route hub). Also confirmed the GraphQL admin endpoint = `/admin/graph/{ver}/graphql.json` (96 mutations).
**Action:** Done — dedicated content-creation docs added; route parity made MANDATORY in migration-decisions + migrate-a-page.

## Route/content type map (quick ref)
- Custom page `/pages/x` → internal API `…/site/page/customize` (session) — `scripts/create-page.mjs`.
- Blog `/blogs/x` + article → public REST `store/blogs.json` / `store/blogs/{id}/articles.json` (token) — `scripts/create-blog.mjs`.
- Product/collection → public `productCreate`/`collectionCreate` (deferred, commerce).
- Home/cart/search/404/customer/product/collection pages → theme templates, route follows data.
- Menus + redirects → store data, APIs still unconfirmed.

## 2026-06-12 — RULE: docs-first for SHOPLINE (don't brute-force)
**What:** When debugging the test-page DELETE, I brute-forced 5 internal endpoint guesses — all returned `200 {"code":"SLE0006","message":"服务端错误"}` (server error). Wasteful. Per stakeholder direction: **consult the official SHOPLINE docs FIRST** for any SHOPLINE behavior/issue; only reverse-engineer genuinely undocumented internals as a last resort; record the doc link with the finding.
**Action:** Added `docs/ops/shopline-references.md` (official links + when-to-use); wired into CLAUDE.md + `docs/principles/agent-workflow.md`.

## 2026-06-12 — Deleting content
- **Blog + article DELETE — verified (public API):** `DELETE /admin/openapi/{ver}/store/blogs/{blogId}/articles/{articleId}.json` → 200, then `DELETE /admin/openapi/{ver}/store/blogs/{blogId}.json` → 200. (Deleted test-blog/test-article.)
- **Custom page DELETE — NO documented/working API found.** Page LIST = `GET /admin/api/site/page` (confirmed). All internal delete guesses (`/customize/{id}` DELETE, `/page/delete`, `/page/customize/delete`, `/batchDelete`, `/remove`) → SLE0006 server error. Custom pages have no public API at all → **delete them in the Admin UI** (Online Store → Page) until/unless the real internal delete is captured from the UI. (3 test pages still present on mirza-asca: cli-test-page, api-test-page, script-test.)

## 2026-06-13 — CORRECTION: SHOPLINE DOES have a native GitHub theme integration (I was wrong)
**What:** Earlier docs claimed "SHOPLINE has no native GitHub auto-deploy." **Wrong.** Confirmed in the live admin: **Theme library → Add theme → {Upload theme, Add from GitHub}**. It connects a repo/branch and syncs (like Shopify). *(I had over-asserted from Shopify-dominated web searches instead of checking — exactly the docs-first failure the rule warns about.)*
**Why it matters:** "Add from GitHub" requires a **PURE theme repo** — only valid theme dirs at root (`blocks components i18n layout public sections templates` + `theme.config.json`/`theme.schema.json`). Importing this **hybrid** repo (theme + `CLAUDE.md`/`docs/`/`prompts/`/`scripts/`/`external/`/`.claude/`) failed: every non-theme file → `InvalidFilePath: invalid file path` (the theme files themselves were NOT flagged). `.gitignore` does NOT help — 120 non-theme files are already tracked, so they stay on GitHub; removing them (`git rm`) would delete the migration infra.
**Action:** Corrected docs/ops/environment-setup.md + store-and-theme-config.md. Open decision: connect SHOPLINE GitHub to a **theme-only repo or branch** (keep this repo as the CLI-deployed template), OR keep using `sl theme push`. Still need the OFFICIAL SHOPLINE doc for the GitHub integration (couldn't find it via search — flagged ⚠️).

## 2026-06-13 — Dev target ≠ live theme; per-task auto-sync to `shopline-theme` would leak WIP to LIVE
**What:** `sl theme list` on mirza-asca: **Bottle1 [unpublished]** (= `SL_THEME_ID`, our CLI build/preview target) — but the **[live]** theme is **`shopline-poc/shopline-theme` #6a2c35a0…**, the GitHub-connected one (our `shopline-theme` branch). The `.env` comment calling Bottle1 "(live)" was wrong (fixed locally). `sl theme push --only theme.config.json --theme <id>` works (verified — pushes to the unpublished preview).
**Why it matters:** we wired the close-step to **auto-mirror the theme to `shopline-theme` every task** (PROMPT.md §6 + `scripts/ralph.sh`). But that branch *is* the live theme — so building iteratively on the *unpublished* Bottle1 while auto-syncing every task would **push half-built work to the LIVE store**. The CLI deploy (Bottle1 preview) and the GitHub sync (live) are **different targets with very different blast radius**.
**Action:** Held the live-sync for this task — committed to `main` only (`main` isn't GitHub-connected, so pushing it does not deploy). FLAGGED for a decision: make the live-mirror **opt-in / a separate go-live step** instead of every-task, so the dev loop builds on Bottle1 without leaking to live. Until decided, do **not** run `scripts/sync-theme-branch.sh` (or ralph.sh's auto-sync) during this test build.

## 2026-06-13 — SHOPLINE font library DOES include Inter (no custom @font-face needed)
**What:** Set `sort_title_font: "Inter:700"` and `sort_body_font: "Inter:400"` in `theme.schema.json` (defaults) + `theme.config.json` (preset). Pushed to Bottle1 → the `font_face()` filter in `components/theme-css-var.html` loaded Inter from SHOPLINE's CDN automatically. Verified via Playwright: `getComputedStyle(heading).fontFamily` includes "Inter" on the live preview. No custom `components/brand-fonts/fonts.html` or `public/fonts/` files needed.
**Why it matters:** Future migrations can use SHOPLINE's native font picker for any Google Font in the library — simpler than the self-hosted `@font-face` + `asset_url()` pattern from `docs/craft/assets-and-fonts.md`. The self-hosted pattern is still needed for truly custom/proprietary fonts not in the library.
**Action:** Done — no doc changes needed (the existing docs correctly describe both approaches). Title size set to 29px (→ h2 ≈ 48.3px, matching source h2 = 48px via the `sort_title_size * 1.6667` formula in `public/base/index.css`).
