# 02 — SHOPLINE CLI (`sl`) Reference

All commands use the **`sl`** binary from `@shoplineos/cli` (see [01](01-environment-setup.md)). Run from the theme root unless noted.

## Auth & info

```bash
sl login --store ${SL_STORE}    # browser auth
sl theme list                   # themes with id, name, [status], OS version
```

## Theme commands

| Command | Purpose | Key flags |
|---|---|---|
| `sl theme init <name>` | Scaffold a new theme from a starter (clones a git seed) | `--path` |
| `sl theme pull` | Download remote theme files locally | `--theme <id>`, `-l/--live`, `-d/--development`, `-o/--only <glob…>`, `-x/--ignore`, `-n/--nodelete`, `--path` |
| `sl theme push` | Upload local files, overwriting remote | `--theme <id>`, `-l/--live`, `-a/--allow-live`, `-u/--unpublished`, `-d/--development`, `-o/--only`, `-x/--ignore`, `-n/--nodelete`, `--path` |
| `sl theme serve` | Live local preview, hot reload, uploads to a dev theme | `--port`, `--live-reload <hot-reload\|full-page\|off>`, `--theme-editor-sync`, `-o/-x` |
| `sl theme package` | Zip the theme for manual Admin upload | |
| `sl theme list` | List remote themes | |
| `sl theme check` | Validate the theme | |
| `sl theme console` | Sline/Handlebars REPL | |

### Pull a theme

```bash
sl theme pull --theme ${SL_THEME_ID}
# Surgical: only specific files
sl theme pull --theme ${SL_THEME_ID} --only templates/page.about-us.json --path /tmp/verify
```
> A trailing `config/settings_schema.json: ENOENT` warning on pull is **benign** — Bottle (OS 3.0) uses `theme.schema.json` instead; the pull still succeeds.

### Push a theme

```bash
sl theme push --theme ${SL_THEME_ID}
# Surgical single-file push (fast, additive):
sl theme push --theme ${SL_THEME_ID} --only templates/page.about-us.json
```
**Interactive prompt:** push asks *"Please choose an action"* with:
- `Push all static files (safe mode)` — assets only; **skips template/section edits**
- `Push all files (overwrite existing ones)` — what you almost always want; the default pointer is already on it.

To answer non-interactively, pipe Enter: `printf '\n' | sl theme push --theme ${SL_THEME_ID} --only <file>`.

Push prints a **preview URL** and a **theme-editor URL** on success.

### Verify a push (round-trip)

The reliable proof a change reached the store — pull the file back and inspect:
```bash
rm -rf /tmp/verify && sl theme pull --theme ${SL_THEME_ID} --only <path> --path /tmp/verify
cat /tmp/verify/<path>
```

## Publishing — ⚠️ the `-p` flag is a no-op

`sl theme push -p/--publish` is **parsed but never applied** in the current CLI (constructor never assigns `this.publish`). The theme stays unpublished. Publish via the **status-swap API**, reusing the CLI's own authenticated session:

```bash
node -e "require('$(npm root -g)/@shoplineos/cli/dist/services/theme/api.js')\
.changeThemeStatus({themeId:'${SL_THEME_ID}', status:1})\
.then(()=>console.log('published')).catch(e=>{console.error(e.message);process.exit(1)})"
sl theme list   # confirm [live] moved to your theme
```
`status: 1` = Published, `0` = Unpublished, `-1` = Delete. This is a **pointer swap** — the previously-live theme becomes `[unpublished]` (intact, reversible). See [06](06-deploy-publish-validate.md) and [08](08-troubleshooting.md#publish-flag-is-a-no-op).

## Advanced — reusing the CLI's authenticated API module

The publish trick above is one case of a general, **validated** technique: `require()` the installed CLI's compiled API module and call its functions directly — they reuse the CLI's stored session (cookies + `dfp-token` from `~/.config/configstore/shopline.json`), so **no extra token is needed**.

```bash
node -e "const api=require('$(npm root -g)/@shoplineos/cli/dist/services/theme/api.js'); \
  api.getThemeListWithPagination().then(r=>console.log(JSON.stringify(r.data))).catch(e=>console.error(e.message))"
```

Exports available on that module (only `changeThemeStatus` is **verified** here — the rest are present but unverified, see [09](09-validation-status.md)):
`changeThemeStatus`, `createFile`, `updateFile`, `uploadFile`, `getThemeFileDetail`, `getThemeInfo`, `getThemeListWithPagination`, `downloadThemePackage`, `getPublishedThemeInstance`, `uploadThemePackageFile`, `uploadPrivateThemePackage`, `createNewThemeOrCompleteUpload`.

> ⚠️ **Internal/undocumented.** This bypasses the public CLI surface and can break on any `@shoplineos/cli` update. Use it only for what `sl` lacks (currently: publish); prefer official commands otherwise. Base URLs the module talks to: `${store}/admin/api/site/theme` (theme ops) and `${store}/admin/api/merchant-bff`. These are **not** the Admin OpenAPI ([05](05-pages-and-templates.md)).

## What the CLI session can and cannot do

| Can (theme files) | Cannot (store data) |
|---|---|
| pull / push / serve / package theme files | create **page records** (`/pages/x`) |
| create/edit templates, sections, blocks, assets, i18n | create products / collections / blog posts |
| change theme publish status (via api.js) | anything needing the Admin REST API → use a token ([05](05-pages-and-templates.md)) |

The theme-CLI token is **separate** from the Admin OpenAPI token. Don't conflate them.
