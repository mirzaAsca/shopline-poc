# 03 — Store & Theme Configuration

How a target store and its themes are identified and managed. All concrete values live in `.env` / agent memory — here we describe the *shape*.

## Store identity

| Variable | Meaning | How to find |
|---|---|---|
| `${SL_STORE}` | The `*.myshopline.com` domain the CLI/admin uses | The admin URL host |
| `${SL_PRIMARY_DOMAIN}` | The public-facing primary domain | Storefront may 301-redirect `${SL_STORE}` → this |
| `${STOREFRONT_PASSWORD}` | "Password protection" gate value | Admin → Settings → Preferences → Password protection |

**Password protection / "Opening soon":** New/unfinished stores show a password gate (and an "Opening soon" splash) instead of the storefront. Public fetches (and search engines) only see the gate. To view the real storefront you must pass the gate — relevant for validation ([06](06-deploy-publish-validate.md)) and for any source-scraping of a SHOPLINE origin.

## Themes

A store has a **theme library**: one `[live]` theme + N `[unpublished]`. Each has an id, name, and OS version.

```bash
sl theme list
# #<id>  <name>  [live|unpublished]  OS_3.0|OS_2.1
```

- Target theme for migration output: a **Bottle** theme (OS_3.0). Put its id in `${SL_THEME_ID}`.
- Theme ids are 24-char hex. They are stable per theme; capture them in `.env`/memory.
- Prefer working against an **unpublished** Bottle theme during a build, then publish when ready ([06](06-deploy-publish-validate.md)).

### Recommended theme strategy for migration runs

1. Keep a **clean Bottle baseline** theme (never edited) to clone from.
2. For each migration, push the built theme to a **dedicated unpublished theme** (or create one with `sl theme push -u`).
3. Validate via preview, then publish (status swap) only when signed off.
4. The previously-live theme stays in the library as instant rollback.

## GitHub

- `${GH_REPO}` holds the theme + `docs/` + `scripts/`.
- Pure version control — **no native GitHub→SHOPLINE auto-deploy** exists. Deploy is always `sl theme push`.
- Optional future automation: a CI job (GitHub Action) that runs `sl theme push` on merge to `main`, using a stored CLI token. (Not set up yet.)

## Rollback

Publishing is a reversible pointer swap. To restore a previous theme as live:
```bash
node -e "require('$(npm root -g)/@shoplineos/cli/dist/services/theme/api.js')\
.changeThemeStatus({themeId:'<previous-live-theme-id>', status:1})"
```
Always record the **current live theme id before publishing** so you can revert.

## Secrets handling

- `.env` is gitignored; real values never enter committed files.
- The storefront password and any Admin API token are secrets — treat accordingly.
- Theme ids / store domain are not strictly secret but are kept in `.env` for portability across stores.
