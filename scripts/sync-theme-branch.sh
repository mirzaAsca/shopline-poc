#!/usr/bin/env bash
# Sync the Bottle theme from `main` (or $1) onto the theme-only `shopline-theme` branch —
# the branch SHOPLINE's "Theme library > Add theme > Add from GitHub" connection reads.
#
# WHY: SHOPLINE's GitHub theme import rejects ANY non-theme file (`InvalidFilePath`), so the
# connected branch must contain ONLY the theme. `main` stays the full project (theme + infra);
# this script copies just the theme onto `shopline-theme`. `main` is the source of truth.
#
# SAFETY: `shopline-theme` has NO .gitignore (SHOPLINE rejects it too), so `.env` sits there
# untracked-but-visible. This script ONLY ever touches the theme paths below — never
# `git add -A`/`git add .` — so secrets can never leak onto the public theme branch.
#
# NOTE on two-way sync: if you edit the theme in the SHOPLINE admin, SHOPLINE commits those
# edits back to `shopline-theme`. This script OVERWRITES the theme with `main`'s — so pull such
# edits into `main` first, or just always edit locally and treat `main` as authoritative.
#
# Usage:  scripts/sync-theme-branch.sh [source-branch]      (default: main)
set -euo pipefail
THEME=(blocks components i18n layout public sections templates theme.config.json theme.schema.json)
SRC="${1:-main}"
BR="shopline-theme"

# refuse to run with uncommitted TRACKED changes (untracked like .env are fine)
[ -z "$(git status --porcelain --untracked-files=no)" ] || { echo "❌ commit/stash your tracked changes first"; exit 1; }

START="$(git rev-parse --abbrev-ref HEAD)"
trap 'git checkout -q "$START" 2>/dev/null || true' EXIT

git checkout -q "$BR"
git pull -q --ff-only origin "$BR" 2>/dev/null || true   # pick up anything SHOPLINE pushed back

# make the theme on this branch EXACTLY match SRC (adds, edits, AND deletes) — theme paths only
git rm -rq --ignore-unmatch "${THEME[@]}"
git checkout "$SRC" -- "${THEME[@]}"
git add -- "${THEME[@]}"

if git diff --cached --quiet; then
  echo "✓ $BR theme already matches $SRC — nothing to push"
else
  git commit -q -m "Sync theme from $SRC"
  git push -q origin "$BR"
  echo "✓ synced theme: $SRC → $BR (pushed). SHOPLINE will pick it up."
fi
