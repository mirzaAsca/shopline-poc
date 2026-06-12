# 01 — Environment Setup

Prerequisites and one-time setup to work with a SHOPLINE Bottle theme from the terminal.

## Verified host baseline (POC)

| Tool | Version used | Notes |
|---|---|---|
| OS | macOS (Darwin 24.1) | Linux works too; paths in [06](deploy-publish-validate.md) for Chrome differ |
| Node.js | v22.19.0 | **Node ≥ 18** required for the CDP validation scripts (they use the global `WebSocket`, added in Node 21/22). CLI itself needs ≥ 14 |
| npm | 9.8.1 | |
| git + gh | gh authed | `gh auth status` should show your account with `repo` + `workflow` scopes |
| python3 | system | used by helper scripts for JSON encoding |

## ⚠️ Install the RIGHT CLI — this is the #1 trap

There are **two** SHOPLINE CLI packages on npm. They look interchangeable; they are not.

| Package | Binary | Use it? | Why |
|---|---|---|---|
| **`@shoplineos/cli`** | **`sl`** | ✅ **YES** | The **Online Store 3.0** CLI. Correctly pushes/pulls/serves Bottle (OS 3.0) themes. |
| `@shoplinedev/cli` | `shopline` | ❌ No | Older/legacy. Its `theme push`/`package`/`serve` only handle legacy 2.0 directories (`config, layout, sections, snippets, templates, assets`) and **abort** on OS 3.0 themes with *"Current directory is not a theme"*. |

```bash
npm install --global @shoplineos/cli
sl --version          # e.g. 1.5.2  (binary is `sl`)
sl theme --help
```

Both packages share the **same login session** (token in `~/.config/configstore/shopline.json`), so if you ever installed the legacy one, `sl` will still reuse the auth. Details: [08-troubleshooting](../troubleshooting.md#legacy-cli-cannot-push-os-30).

## Authenticate

```bash
sl login --store ${SL_STORE}     # opens a browser; approve there
sl theme list                    # confirms auth; lists themes + their OS version
```
`sl theme list` output tags each theme with `OS_3.0` / `OS_2.1` and `[live]` / `[unpublished]` — note your target Bottle theme's id into `SL_THEME_ID`.

## Project layout

```
shopline-poc/
├─ .env                     # real secrets (gitignored) — copy from .env.example
├─ .env.example            # template
├─ docs/                   # this documentation set
├─ scripts/
│  └─ create-page.sh       # create a page record via Admin REST API
├─ blocks/ components/ i18n/ layout/ public/ sections/ templates/   # the Bottle theme
├─ theme.config.json theme.schema.json
```

## Environment variables

Copy `.env.example` → `.env`, fill it, and `set -a; . ./.env; set +a` (or use direnv). `.env` is gitignored. See [.env.example](../../.env.example) for the full list. All docs reference these placeholders.

## Git / GitHub

The theme is version-controlled. GitHub is **not** an auto-deploy source for SHOPLINE (there is no native GitHub→theme sync like Shopify) — it is purely version control. Deploys always go through `sl theme push` ([06](deploy-publish-validate.md)).

```bash
git init && git checkout -b main
git add -A && git commit -m "Initial: Bottle theme"
git remote add origin https://${GH_REPO}.git
git push -u origin main
```
