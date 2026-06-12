# SHOPLINE Migration Foundation — Docs

This `docs/` set captures **everything needed to configure the environment, drive the SHOPLINE CLI, and deploy/validate a Bottle theme** — the verified foundation for an automated **"any platform → SHOPLINE" website-migration** pipeline.

The end goal: an agent is given a source website URL, scans its navigation / pages / content / assets / full UX-UI, and rebuilds it on **SHOPLINE's Bottle theme** (currently the `Bottle1` theme on the POC store) either **1:1** or as a **redesign**. These docs cover the SHOPLINE/Bottle target side. The source-scraping side is intentionally out of scope here (see [07-migration-blueprint](07-migration-blueprint.md) for where it plugs in).

> Audience: **hybrid** — command-first runbook an automation agent can execute, plus the rationale/gotchas a human needs. Every non-obvious finding below was learned the hard way during the POC; the gotchas are real.

## Read in this order

| Doc | What it covers |
|---|---|
| [01-environment-setup.md](01-environment-setup.md) | Prereqs, Node, **which CLI package to install** (critical), git/gh, env vars |
| [02-shopline-cli-reference.md](02-shopline-cli-reference.md) | `sl` commands, flags, the OS-3.0-vs-legacy trap, publish workaround, verification |
| [03-store-and-theme-config.md](03-store-and-theme-config.md) | Store domain, password gate, theme IDs, GitHub, rollback |
| [04-bottle-theme-architecture.md](04-bottle-theme-architecture.md) | OS 3.0 / Sline structure; **full sections + blocks + templates catalog**; the content model migration maps onto |
| [05-pages-and-templates.md](05-pages-and-templates.md) | Page **templates** via CLI vs page **records** via Admin API; `template_suffix`; `create-page.sh` |
| [06-deploy-publish-validate.md](06-deploy-publish-validate.md) | Push → publish (status swap) → validate via isolated Chrome + CDP |
| [07-migration-blueprint.md](07-migration-blueprint.md) | End-to-end pipeline; **locked v1 decisions**; source-scrape → Bottle mapping; risks |
| [08-troubleshooting.md](08-troubleshooting.md) | Consolidated catalog of every gotcha + fix |
| [09-validation-status.md](09-validation-status.md) | **What's proven vs. doc-derived** — trust calibration for the agent |

## The five things that will bite you (TL;DR)

1. **Use `@shoplineos/cli` (binary `sl`), NOT `@shoplinedev/cli`.** The latter can't push OS 3.0 / Bottle themes. ([01](01-environment-setup.md), [08](08-troubleshooting.md))
2. **Bottle is OS 3.0 / Sline (Handlebars-like), not Liquid.** Files are `.html` with `{{#schema}}` blocks; no `config/settings_schema.json`. ([04](04-bottle-theme-architecture.md))
3. **`sl theme push -p` (publish) is a no-op in current CLI.** Publish via the status-swap API instead. ([02](02-shopline-cli-reference.md), [06](06-deploy-publish-validate.md))
4. **A template ≠ a page.** `sl theme push` creates the *template*; the *page record* (`/pages/x` route) needs the Admin REST API or admin UI. ([05](05-pages-and-templates.md))
5. **Secrets live in `.env` (gitignored), never in these docs.** All examples use `${PLACEHOLDERS}`. See [.env.example](../.env.example).

## Conventions

- Shell snippets assume a POSIX shell with the env vars from [.env.example](../.env.example) exported.
- `${SL_STORE}` = `xxxx.myshopline.com`, `${SL_THEME_ID}` = the target Bottle theme id, etc.
- Real current POC values are **not** in these committed docs (kept in the agent's private memory / local `.env`).
