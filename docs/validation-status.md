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

## ⚠️ Documented but NOT yet executed (verify before unattended use)

| Capability | Status / risk |
|---|---|
| **Admin REST API create page** (`POST /admin/openapi/{ver}/pages.json`) | Endpoint pattern + auth confirmed from docs and a **sibling endpoint** (blogs) — but the *pages* call itself was **never run** here (the POC page was made in the admin UI). [`scripts/create-page.sh`](../scripts/create-page.sh) is untested end-to-end. **First real run should be verified manually.** |
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
| Admin API page-create + `scripts/create-page.sh` | ⚠️ never executed (POC page made in admin UI) |
| Menus / redirects Admin API | ⚠️ assumed, unconfirmed |
| `sl theme serve` / `package` / `check` / `console` | ⚠️ documented from `--help`, not exercised |

**Rule for the agent:** before any **unattended** action (especially **auto-publish**), confirm the steps you rely on are ✅. If a ⚠️ step is on the critical path, verify it once (and update this file to ✅).
