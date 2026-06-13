#!/usr/bin/env bash
# Self-test for scripts/ralph.sh EXIT LOGIC. Proves the loop stops on each defined
# breakpoint — done / stuck / blocked / max-iterations / budget — in isolation:
# a throwaway git repo + a stub "agent", touching neither the real repo nor the network.
# (It validates orchestration, not the agent's judgment — that needs a live run.)
#
# Usage:  scripts/ralph-selftest.sh      (exit 0 = all cases pass)
set -uo pipefail
REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
RALPH="$REPO/scripts/ralph.sh"
pass=0; fail=0

make_repo() { # $1 = number of unchecked boxes -> prints the scratch dir
  local n="$1" d; d="$(mktemp -d)"
  mkdir -p "$d/scripts" "$d/specs" "$d/prompts"
  cp "$RALPH" "$d/scripts/ralph.sh"; chmod +x "$d/scripts/ralph.sh"
  printf '#!/usr/bin/env bash\nexit 0\n' > "$d/scripts/sync-theme-branch.sh"; chmod +x "$d/scripts/sync-theme-branch.sh"
  echo "dummy prompt" > "$d/prompts/PROMPT.md"
  { echo "# test spec"; for i in $(seq 1 "$n"); do echo "- [ ] task $i"; done; } > "$d/specs/test.md"
  ( cd "$d" && git init -q && git config user.email t@t.t && git config user.name t \
      && git add -A && git commit -qm init )
  echo "$d"
}

write_stub() { # $1 = path, $2 = kind
  case "$2" in
    progress) cat > "$1" <<'EOF'
#!/usr/bin/env bash
perl -0pi -e 's/- \[ \]/- [x]/' specs/test.md          # tick ONE box
git add -A >/dev/null 2>&1; git commit -qm tick >/dev/null 2>&1   # = "progress"
echo '{"total_cost_usd":0}'
EOF
;;
    stuck)   printf '#!/usr/bin/env bash\necho '\''{"total_cost_usd":0}'\''\n' > "$1" ;;  # no commit
    blocked) cat > "$1" <<'EOF'
#!/usr/bin/env bash
mkdir -p .ralph; echo "needs a human decision" > .ralph/BLOCKED
echo '{"total_cost_usd":0}'
EOF
;;
    costly)  cat > "$1" <<'EOF'
#!/usr/bin/env bash
perl -0pi -e 's/- \[ \]/- [x]/' specs/test.md
git add -A >/dev/null 2>&1; git commit -qm tick >/dev/null 2>&1
echo '{"total_cost_usd":10}'
EOF
;;
  esac
  chmod +x "$1"
}

run_case() { # $1 name  $2 expected_exit  $3 boxes  $4 kind  [VAR=VAL ...]
  local name="$1" exp="$2" boxes="$3" kind="$4"; shift 4
  local d; d="$(make_repo "$boxes")"; write_stub "$d/stub.sh" "$kind"
  ( cd "$d" && env CLAUDE_BIN="$d/stub.sh" CLAUDE_FLAGS="x" "$@" bash scripts/ralph.sh ) >"$d/out.log" 2>&1
  local got=$?
  if [ "$got" = "$exp" ]; then echo "  PASS  $name"; pass=$((pass+1))
  else echo "  FAIL  $name — expected exit $exp, got $got"; sed 's/^/        | /' "$d/out.log" | tail -6; fail=$((fail+1)); fi
  rm -rf "$d"
}

echo "ralph.sh exit-logic self-test"
run_case "DONE     — all boxes ticked"        0 3 progress RALPH_MAX_ITERATIONS=10
run_case "STUCK    — no commit N loops"       6 3 stuck    RALPH_MAX_ITERATIONS=10 RALPH_NO_PROGRESS=3
run_case "BLOCKED  — .ralph/BLOCKED written"  3 3 blocked  RALPH_MAX_ITERATIONS=10
run_case "CAP      — max iterations hit"      4 5 progress RALPH_MAX_ITERATIONS=2
run_case "BUDGET   — cost ceiling hit"        5 5 costly   RALPH_MAX_ITERATIONS=10 RALPH_MAX_BUDGET_USD=5
echo ""
echo "result: $pass passed, $fail failed"
[ "$fail" = 0 ]
