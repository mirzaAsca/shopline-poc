# 01 — Environment Setup

Prerequisites and one-time setup to work with a SHOPLINE Bottle theme from the terminal.

## Verified host baseline (POC)

| Tool | Version used | Notes |
|---|---|---|
| OS | macOS (Darwin 24.1) | Linux works too; paths in [06](deploy-publish-validate.md) for Chrome differ |
| Node.js | v22.19.0 | **Node 22 recommended** for the CDP/admin helper scripts because they rely on the global `fetch` and `WebSocket`; the CLI itself needs ≥ 14 |
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
│  ├─ create-page.mjs      # create a custom page via internal session-authed admin API
│  ├─ create-blog.mjs      # create blogs/articles via public Admin REST API
│  └─ visual-diff/         # desktop/mobile screenshot + pixel-diff harness
├─ blocks/ components/ i18n/ layout/ public/ sections/ templates/   # the Bottle theme
├─ theme.config.json theme.schema.json
```

## Environment variables

Copy `.env.example` → `.env`, fill it, and `set -a; . ./.env; set +a` (or use direnv). `.env` is gitignored. See [.env.example](../../.env.example) for the full list. All docs reference these placeholders.

## Git / GitHub

SHOPLINE **does** have a native GitHub theme integration — admin **Theme library → Add theme → Add from GitHub** connects a repo/branch and syncs it (like Shopify). **BUT it requires a PURE theme repo** (only valid theme dirs at the root: `blocks/ components/ i18n/ layout/ public/ sections/ templates/` + `theme.config.json`/`theme.schema.json`). A **hybrid repo** like this one — theme **plus** `CLAUDE.md`, `docs/`, `prompts/`, `scripts/`, `external/`, `.claude/` — is **rejected**: every non-theme file errors with `InvalidFilePath: invalid file path`. So for this template repo, deploy via **`sl theme push`**; only use the GitHub connection against a **theme-only repo or branch**. (`.gitignore` does NOT fix this — already-tracked files stay on GitHub; you'd have to `git rm` them, deleting the infra.)

### Connecting SHOPLINE via GitHub (the `shopline-theme` branch)
We keep a dedicated **theme-only branch `shopline-theme`** (only the theme dirs — no infra, no `.gitignore`, no `.env`) that SHOPLINE connects to; `main` stays the full project.
1. Push the latest theme to it: **`scripts/sync-theme-branch.sh`** (copies *only* the theme paths from `main` → `shopline-theme`; never `git add -A`, so `.env` can't leak).
2. In the admin: **Theme library → Add theme → Add from GitHub** → pick this repo → branch **`shopline-theme`**.
> **`main` is the source of truth.** Edit the theme locally and run the sync script. If you edit in the SHOPLINE admin, SHOPLINE commits back to `shopline-theme` — pull that into `main` before the next sync or it gets overwritten. ⚠️ Never put any non-theme file (or `.gitignore`) on `shopline-theme` — the import will reject it.

```bash
git init && git checkout -b main
git add -A && git commit -m "Initial: Bottle theme"
git remote add origin https://${GH_REPO}.git
git push -u origin main
```
