# PROJECT — current instance values

> **Per-project, committed, agent-readable.** This replaces machine-local agent "memory": everything an agent needs travels in the repo. When you reuse this template for a new migration, **replace the values below**. Secrets (storefront password, Admin API token) live in `.env` (gitignored) — not here.

## Store
- **CLI/admin domain (`SL_STORE`):** `0f5667.myshopline.com`
- **Primary public domain:** `drinksnazzy.myshopline.com` ("Snazzy Beverages") — storefront is **password-gated** ("Opening soon"); the password is in `.env` as `STOREFRONT_PASSWORD`.
- **GitHub:** `github.com/mirzaAsca/shopline-poc` (branch `main`).

## Themes (`sl theme list`)
| Theme ID | Name | Notes |
|---|---|---|
| `6a26ca6245f2c028de488f08` | **Bottle1** | the POC sandbox; **currently live** (published during the POC) |
| `6a26d90145f2c028de488ff9` | snazzy-theme/main | the original live theme — **rollback target** |
| `6a2a8f4fc123ebeb49caa5c7` | Bottle2 | unpublished |
| `6a26d977a747ce5e9d42ed68` | snazzy-theme/dev | unpublished |
| `68b772d693f001615c0e14b9` | Modern1 | unpublished (OS_2.1) |

Target theme for migration output = a Bottle theme → set `SL_THEME_ID` in `.env`.

## Rollback
Re-publish the previous live theme:
```bash
node -e "require('$(npm root -g)/@shoplineos/cli/dist/services/theme/api.js').changeThemeStatus({themeId:'6a26d90145f2c028de488ff9',status:1})"
```

## Where the rest lives (agent: read these, not memory)
- **Router / how to work:** `CLAUDE.md` (auto-loaded).
- **Knowledge:** `docs/` (principles · craft · ops · runbooks · troubleshooting · validation-status).
- **Plan for the active migration:** `specs/*.md`.
- **Running log of learnings/gotchas:** `LEARNINGS.md` (append-only).
- **Secrets / per-env config:** `.env` (see `.env.example`).
