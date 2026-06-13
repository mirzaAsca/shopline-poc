#!/usr/bin/env bash
# Ralph loop runner for to-SHOPLINE Bottle migrations.
#
# Repeatedly runs prompts/PROMPT.md in a FRESH-CONTEXT agent — one spec task per
# iteration (build -> deploy -> test -> visual-diff -> tick [x] -> commit+push) —
# and STOPS on an explicit exit condition. Full rationale: docs/principles/loop-and-exit.md.
#
# Exit conditions (priority order):
#   1. Done       — zero "- [ ]" left across specs/*.md            -> exit 0
#   2. Blocked    — .ralph/BLOCKED exists                          -> exit 3
#   3. Max iters  — RALPH_MAX_ITERATIONS reached (default 20)      -> exit 4
#   4. Budget     — cumulative cost > RALPH_MAX_BUDGET_USD ($10)   -> exit 5
#   5. Stuck      — no new commit for RALPH_NO_PROGRESS loops (3)  -> exit 6
#
# Usage:  scripts/ralph.sh
# Tunables (env): RALPH_MAX_ITERATIONS RALPH_MAX_BUDGET_USD RALPH_NO_PROGRESS
#                 RALPH_PROMPT RALPH_SPEC_GLOB CLAUDE_BIN CLAUDE_FLAGS
#
# UNATTENDED PERMISSIONS: a Ralph loop cannot answer permission prompts. Before an
# unattended run, set a non-interactive mode — ONLY in a sandbox/VM + dedicated repo:
#   export CLAUDE_FLAGS="-p --output-format json --dangerously-skip-permissions"

set -uo pipefail

# --- config ---------------------------------------------------------------
MAX_ITERATIONS="${RALPH_MAX_ITERATIONS:-20}"
MAX_BUDGET_USD="${RALPH_MAX_BUDGET_USD:-10}"
NO_PROGRESS_MAX="${RALPH_NO_PROGRESS:-3}"
PROMPT_FILE="${RALPH_PROMPT:-prompts/PROMPT.md}"
SPEC_GLOB="${RALPH_SPEC_GLOB:-specs/*.md}"
CLAUDE_BIN="${CLAUDE_BIN:-claude}"
CLAUDE_FLAGS="${CLAUDE_FLAGS:--p --output-format json}"

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT" || exit 2
mkdir -p .ralph

log() { printf '[ralph %s] %s\n' "$(date +%H:%M:%S)" "$*"; }

# count unchecked checkboxes across the spec files (the "work remaining" signal)
open_tasks() {
  # shellcheck disable=SC2086
  grep -rE '^[[:space:]]*- \[ \]' $SPEC_GLOB 2>/dev/null | wc -l | tr -d ' '
}

# --- preflight ------------------------------------------------------------
command -v "$CLAUDE_BIN" >/dev/null 2>&1 || { log "ERROR: '$CLAUDE_BIN' not on PATH"; exit 2; }
[ -f "$PROMPT_FILE" ] || { log "ERROR: prompt file '$PROMPT_FILE' missing"; exit 2; }
# shellcheck disable=SC2086
compgen -G $SPEC_GLOB >/dev/null 2>&1 || { log "ERROR: no specs match '$SPEC_GLOB' — run /plan-migration first"; exit 2; }

log "start | max_iter=$MAX_ITERATIONS budget=\$$MAX_BUDGET_USD no_progress_max=$NO_PROGRESS_MAX"
log "prompt=$PROMPT_FILE specs='$SPEC_GLOB' agent='$CLAUDE_BIN $CLAUDE_FLAGS'"

spent=0
no_progress=0
iter=0

while :; do
  iter=$((iter + 1))
  remaining="$(open_tasks)"
  log "iteration $iter — ${remaining} open task(s); spent \$$spent"

  # --- exit checks (BEFORE doing work) ---
  if [ -f .ralph/BLOCKED ]; then
    log "BLOCKED: $(head -n1 .ralph/BLOCKED 2>/dev/null)"; log "stopping — needs a human."; exit 3
  fi
  if [ "$remaining" -eq 0 ]; then
    log "DONE — no open '- [ ]' tasks remain across $SPEC_GLOB. Migration unit complete."; exit 0
  fi
  if [ "$iter" -gt "$MAX_ITERATIONS" ]; then
    log "STOP — max iterations ($MAX_ITERATIONS) reached."; exit 4
  fi
  if awk "BEGIN{exit !($spent >= $MAX_BUDGET_USD)}"; then
    log "STOP — budget \$$MAX_BUDGET_USD reached (spent \$$spent)."; exit 5
  fi
  if [ "$no_progress" -ge "$NO_PROGRESS_MAX" ]; then
    log "STOP — circuit-breaker: $no_progress loops with no new commit. Re-narrow the task or tune the prompt (docs/principles/loop-and-exit.md)."; exit 6
  fi

  # --- run ONE fresh-context iteration ---
  head_before="$(git rev-parse HEAD 2>/dev/null || echo none)"
  out=".ralph/iter-${iter}.json"
  log "running agent (fresh context)…"
  # A plain `claude -p` invocation starts a NEW session => fresh context per loop.
  "$CLAUDE_BIN" $CLAUDE_FLAGS < "$PROMPT_FILE" > "$out" 2>>.ralph/ralph.err \
    || log "agent exited non-zero (see .ralph/ralph.err)"

  # accumulate cost from the result JSON (total_cost_usd), if present
  cost="$(node -e 'try{const o=JSON.parse(require("fs").readFileSync(process.argv[1],"utf8"));process.stdout.write(String(o.total_cost_usd??0))}catch(e){process.stdout.write("0")}' "$out" 2>/dev/null || echo 0)"
  spent="$(awk "BEGIN{printf \"%.4f\", $spent + $cost}")"

  # --- progress detection: did a new commit land this loop? ---
  head_after="$(git rev-parse HEAD 2>/dev/null || echo none)"
  if [ "$head_after" = "$head_before" ]; then
    no_progress=$((no_progress + 1))
    log "no new commit this loop (no-progress ${no_progress}/${NO_PROGRESS_MAX})"
  else
    no_progress=0
    log "progress: new commit ${head_after:0:9} (+\$$cost, total \$$spent)"
  fi
done
