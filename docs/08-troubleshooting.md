# 08 — Troubleshooting (gotcha catalog)

Every issue hit during the POC, with symptom → cause → fix. These are real and will recur.

## Legacy CLI cannot push OS 3.0

**Symptom:** `theme push`/`package` aborts with **"Current directory is not a theme, Please run this command in a theme directory."**
**Cause:** You're using `@shoplinedev/cli` (binary `shopline`). Its push reads `config/settings_schema.json` and globs only legacy dirs (`config, layout, sections, snippets, templates, assets`). Bottle (OS 3.0) has neither that file nor that layout (`blocks/`, `components/`, `i18n/`, `theme.config.json`, `theme.schema.json`).
**Fix:** Use **`@shoplineos/cli`** (binary **`sl`**). `npm i -g @shoplineos/cli`. Both CLIs share the same login token, so no re-auth needed.

## "next" / 2.x CLI has no theme commands

**Symptom:** `@shoplineos/cli@next` (2.x) → `theme` command missing.
**Cause:** 2.x is an incomplete rewrite.
**Fix:** Stay on the `latest` 1.x line of `@shoplineos/cli`.

## Pull warns about `config/settings_schema.json`

**Symptom:** `… config/settings_schema.json: ENOENT …` at end of `sl theme pull`.
**Cause:** Benign — a legacy file check; Bottle uses `theme.schema.json`.
**Fix:** Ignore it. The pull succeeded (all files present).

## Push only uploaded some files

**Symptom:** Template/section edits don't appear after push.
**Cause:** Chose **"Push all static files (safe mode)"** at the prompt — that skips templates/sections.
**Fix:** Choose **"Push all files (overwrite existing ones)"**. Non-interactive: `printf '\n' | sl theme push …` (the default pointer is already on the overwrite option).

## Publish flag is a no-op

**Symptom:** `sl theme push -p/--publish` runs fine but the theme stays `[unpublished]`.
**Cause:** Bug — the CLI parses `--publish` but never applies it (`this.publish` is never set).
**Fix:** Publish via the status-swap API:
```bash
node -e "require('$(npm root -g)/@shoplineos/cli/dist/services/theme/api.js')\
.changeThemeStatus({themeId:'${SL_THEME_ID}', status:1})"
```
`status`: `1`=Published, `0`=Unpublished, `-1`=Delete. Reversible (old live theme → unpublished).

## `/pages/<handle>` returns "404 page not found"

**Symptom:** Template exists and pushed, but the storefront route 404s.
**Cause:** No **page record**. The template is theme code; the page is store data.
**Fix:** Create the page via Admin API ([`scripts/create-page.sh`](../scripts/create-page.sh)) or admin UI, with `template_suffix` = your template's suffix. See [05](05-pages-and-templates.md).

## Public fetch of the storefront shows "Opening soon" / no content

**Symptom:** `curl`/WebFetch of the store returns a password/coming-soon splash; expected content missing.
**Cause:** Storefront **password protection** is on.
**Fix:** Pass `${STOREFRONT_PASSWORD}` (programmatically via CDP or once in the isolated browser). For validation use the isolated-Chrome flow ([06](06-deploy-publish-validate.md)), not anonymous fetch.

## Chrome won't launch / "browser is already running for <profile>"

**Symptom:** A browser-automation tool (e.g. chrome-devtools MCP) errors that the profile is in use; you can't open a page.
**Cause:** Another agent/tool holds that Chrome profile (single-instance lock).
**Fix:** Launch your **own** isolated Chrome with a unique `--user-data-dir` + `--remote-debugging-port` and drive it via CDP yourself ([06](06-deploy-publish-validate.md)). It's fully independent.

## Admin API call returns 401/403

**Symptom:** `pages.json` POST rejected.
**Cause:** Missing/invalid token, wrong scope, or expired/IP-restricted token. (The theme-CLI session is **not** an Admin API token.)
**Fix:** Generate a token in Admin → Settings → Staff Settings → API Auth, authorize pages/`write_content`, set IP allowlist correctly, put it in `${SL_TOKEN}`. See [05](05-pages-and-templates.md#getting-an-admin-api-token-one-time-in-admin).

## Two `*.myshopline.com` domains (redirect surprises)

**Symptom:** Requests to `${SL_STORE}` 301-redirect to a different host.
**Cause:** The store has a separate **primary domain** (`${SL_PRIMARY_DOMAIN}`) distinct from the CLI/admin domain.
**Fix:** Expect the redirect; follow it. Preview URLs still use `${SL_STORE}/?preview=1&themeId=…`.

## CDP script: `TypeError: Cannot read properties of undefined (reading 'result')`

**Symptom:** A `Runtime.evaluate` call returns no `.result`.
**Cause:** Evaluating during/after a navigation before the context is ready, or the expression threw.
**Fix:** Add a small delay after `Page.navigate`, guard `r && r.result ? r.result.value : null`, and re-`Runtime.enable` after navigations.
