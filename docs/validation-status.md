# 09 — Validation Status (proven vs. doc-derived)

Trust calibration for an automation agent (and humans). Everything in these docs is either **executed & verified during the POC** or **derived from SHOPLINE docs / CLI source but not yet run**. Treat the latter as "expected to work" — verify before relying on it in an unattended pipeline.

## ✅ Executed & verified this POC

| Capability | How it was proven |
|---|---|
| Install `@shoplineos/cli` (`sl`); legacy `@shoplinedev/cli` fails on OS 3.0 | Ran both; only `sl` pushed the Bottle theme |
| `sl login` / `sl theme list` (shows OS version + status) | Authenticated; listed real themes |
| `sl theme pull` (full, `--only`, `--path`) | Pulled Bottle1 (511 files) + single-file pulls |
| `sl theme push` (full + `--only`; overwrite-vs-safe prompt) | Pushed edits + new template; observed prompt behavior |
| Round-trip verify (pull a file back to confirm server state) | Confirmed footer edit + template landed on store |
| **Publish via `changeThemeStatus` API module** | Published Bottle1 live; `sl theme list` showed `[live]` swap; reversible |
| `sl theme push -p/--publish` is a **no-op** | Ran it; theme stayed unpublished |
| Reusing the CLI's authenticated `api.js` module | `node -e require(...api.js).changeThemeStatus(...)` worked with the existing session |
| Page **template** create + render (`page.about-us.json`) | Pushed; rendered with injected text on the live storefront |
| `template_suffix` links page→template | Page created with suffix `about-us` rendered our template |
| Template ≠ page (route 404s without a page record) | `/pages/about-us` returned "404 page not found" until a page record existed |
| Section/block schema `default` shows only when nothing overrides it | Footer copyright `default` rendered (no stored value present) |
| Setting-type vocabulary (see [04](ops/theme-architecture.md)) | Extracted from the real Bottle `sections/` + `blocks/` schemas |
| Isolated Chrome + CDP (screenshot, navigate, read DOM, fill password) | Validated footer + About page; passed the password gate; all via port 9333 |
| Storefront password gate behavior + primary-domain redirect | Observed live (`/preview/password`, redirect to primary domain) |
| **Custom page creation** (internal API `…/site/page/customize`) | Captured from the Admin UI + replayed → `SUCCESS`; `templateName` attaches the template. `scripts/create-page.mjs` ([create-custom-pages.md](ops/create-custom-pages.md)) |
| **Blog + article creation** (public REST `store/blogs.json`, `store/blogs/{id}/articles.json`) | Created both via Bearer token → 200 + ids; article body needs the `blog` wrapper. `scripts/create-blog.mjs` ([create-blogs.md](ops/create-blogs.md)) |
| **No public page API** | Probed ~25 REST paths + full GraphQL introspection (96 mutations) → zero page resource. The public `…/pages.json` does NOT exist |

## ⚠️ Documented but NOT yet executed (verify before unattended use)

| Capability | Status / risk |
|---|---|
| ~~Admin REST API create page (`/pages.json`)~~ | ✅ **RESOLVED** (moved to verified above): no public page API exists — use the internal API via `scripts/create-page.mjs`. Old `create-page.sh` deleted. |
| Admin API token generation (Staff Settings → API Auth) | Described from SHOPLINE docs; not performed in the POC (no token was minted) |
| `sl theme serve` / `package` / `check` / `console` / `init` | Documented from `--help`/docs; not exercised on the Bottle theme |
| Other `api.js` exports (`createFile`, `updateFile`, `uploadFile`, `getThemeFileDetail`, `getThemeListWithPagination`, `downloadThemePackage`, …) | The module exposes them and `changeThemeStatus` proved the pattern, but these specific calls are **unverified** |
| **Menus / navigation Admin API** | Assumed to exist; **not confirmed**. Blocks the nav phase ([07](runbooks/migrate-a-page.md)) |
| **URL redirects Admin API** | Assumed to exist; **not confirmed**. Blocks the SEO phase |
| `public/images` reference convention in Sline templates | Assets are provided pre-hosted, but the exact template reference syntax (`asset_url()` etc.) is **unconfirmed** against real provided assets |
| i18n `i18n/<locale>.json` authoring for sections | Structure observed (`t:` keys → `i18n/*.schema.json` labels; storefront strings → `i18n/*.json`) but not written/validated |

## Note on the `api.js` technique (advanced, validated-but-unofficial)

The publish workaround works by `require()`-ing the installed CLI's compiled module:
`$(npm root -g)/@shoplineos/cli/dist/services/theme/api.js`. It reuses the CLI's stored session (cookies + `dfp-token` from `~/.config/configstore/shopline.json`), so no extra token is needed. This is **internal/undocumented** — it can break on any CLI update. Use it for what `sl` lacks (currently: publish), and prefer official commands otherwise. See [02](ops/cli-reference.md#advanced--reusing-the-clis-authenticated-api-module).

---

## Trust model for the merged KB

**Legend:** ✅ verified this POC · ⚠️ inherited (Playbook / doc-derived), NOT re-tested here.

| Area | Default trust |
|---|---|
| `docs/ops/*` (CLI, deploy, publish, pages, architecture) | ✅ mostly verified this POC (exceptions listed above) |
| `docs/craft/*` (syntax, components, schemas, color, responsive, assets) | ⚠️ inherited from prior builds — sound, but not re-executed here; cross-check against this repo's theme when in doubt |
| `docs/principles/migration-decisions.md` | locked decisions (not a testable claim) |
| Page creation | ✅ **VERIFIED 2026-06-12** — created pages programmatically via the **internal** admin API `POST /admin/api/site/page/customize` ([`scripts/create-page.mjs`](ops/create-custom-pages.md)); template attached via `templateName`. NOTE: the *public* REST+GraphQL Admin API has **no** page resource (disproven by full schema introspection); old `create-page.sh` deleted. |
| Menus / redirects Admin API | ⚠️ assumed, unconfirmed |
| `sl theme serve` / `package` / `check` / `console` | ⚠️ documented from `--help`, not exercised |

**Rule for the agent:** before any **unattended** action (especially **auto-publish**), confirm the steps you rely on are ✅. If a ⚠️ step is on the critical path, verify it once (and update this file to ✅).
