#!/usr/bin/env bash
# RETRO — the LAST step after a Ralph loop. Two parts:
#   1. ANALYZE the run's stored logs for the tool errors the agent hit (deterministic).
#   2. IMPROVE: feed that report to an Opus 4.8 agent that tweaks the reusable setup/docs
#      so the recurring errors don't happen again, appends a LEARNINGS entry, and commits.
#
# Usage:  scripts/ralph-retro.sh [runDir]      (default: newest .ralph/runs/* , else .ralph)
# Env:    RALPH_RETRO_IMPROVE=0  -> analyze only (no agent, no commits)
#         RALPH_MODEL=<id>       -> model for the improvement agent (default Opus 4.8)
set -uo pipefail
ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"; cd "$ROOT" || exit 2

RUN_DIR="${1:-$(ls -dt .ralph/runs/*/ 2>/dev/null | head -1)}"
RUN_DIR="${RUN_DIR:-.ralph}"; RUN_DIR="${RUN_DIR%/}"
[ -d "$RUN_DIR" ] || { echo "no logs at '$RUN_DIR' — run the loop first"; exit 1; }
REPORT="$RUN_DIR/analysis.md"

echo "→ analyzing tool errors in $RUN_DIR"
node "$ROOT/scripts/ralph-analyze.mjs" "$RUN_DIR" | tee "$REPORT"
echo

if grep -q '_none_' "$REPORT"; then echo "✓ no tool errors logged — nothing to improve."; exit 0; fi
if [ "${RALPH_RETRO_IMPROVE:-1}" != "1" ]; then
  echo "report saved: $REPORT  (set RALPH_RETRO_IMPROVE=1 to run the improvement agent)"; exit 0
fi

echo "→ running the improvement agent (${RALPH_MODEL:-claude-opus-4-8}) on the report…"
PROMPT="You are improving a SHOPLINE Bottle migration agent toolkit by learning from its own run.
Below is a tool-error analysis from the latest autonomous loop. Identify the RECURRING or
SYSTEMIC tool errors (ignore one-off noise) and improve the REUSABLE setup so they don't recur:
edit the proper home per the source-of-truth routing — \`.claude/rules/*\`, \`docs/*\`,
\`prompts/PROMPT.md\`, or \`CLAUDE.md\` (most reusable first) — and append ONE dated entry to
\`LEARNINGS.md\` summarizing what you changed and why. Then commit + push to main with a detailed
message. Do NOT run scripts/sync-theme-branch.sh (no live deploy). If nothing is systemic, make
no changes and say so.

--- TOOL-ERROR ANALYSIS ($RUN_DIR) ---
$(cat "$REPORT")"

if [ -f "$ROOT/scripts/ralph-format.mjs" ]; then
  printf '%s' "$PROMPT" | claude -p --model "${RALPH_MODEL:-claude-opus-4-8}" --output-format stream-json --verbose --dangerously-skip-permissions 2>>"$RUN_DIR/retro.err" | tee "$RUN_DIR/retro.jsonl" | node "$ROOT/scripts/ralph-format.mjs"
else
  printf '%s' "$PROMPT" | claude -p --model "${RALPH_MODEL:-claude-opus-4-8}" --dangerously-skip-permissions
fi
echo "✓ retro complete — report: $REPORT"
