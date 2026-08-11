#!/usr/bin/env bash
# Stop — the project's definition of done.
#
# Typecheck is absolute: tsc -b must be 0 errors, always.
#
# Lint is a RATCHET, not an absolute gate. It compares the current error count
# against a recorded baseline and blocks only on a regression. Two reasons:
#   - pre-existing debt would otherwise block every turn until it is paid off,
#     which trains you to ignore the gate
#   - during a worktree flow the main checkout stays red until the merge, so an
#     absolute gate would fire on every turn of the whole job
# When the count drops the baseline ratchets down automatically, so debt can be
# paid off but never re-accrued.
#
# Re-entrancy: when this hook blocks, the model keeps working and Stop fires
# again. stop_hook_active tells us we are already inside that loop; bail out so
# a genuinely stuck failure cannot spin forever.
#
# stdin : harness hook JSON  { stop_hook_active }
# exit 0: acceptable.  exit 2: regression, stderr is shown to the model.
set -uo pipefail

payload="$(cat)"
[ "$(jq -r '.stop_hook_active // false' <<<"$payload")" = "true" ] && exit 0

root="${CLAUDE_PROJECT_DIR:-$PWD}"
cd "$root" || exit 0

baseline_file="$root/.claude/quality-baseline"
baseline="$(cat "$baseline_file" 2>/dev/null || echo 0)"
[[ "$baseline" =~ ^[0-9]+$ ]] || baseline=0

# --- typecheck: absolute ---
if ! tsc_out="$(npx tsc -b 2>&1)"; then
  echo "QUALITY GATE — typecheck failed. This is never acceptable." >&2
  tail -40 <<<"$tsc_out" >&2
  exit 2
fi

# --- lint: ratcheted ---
lint_json="$(npx eslint . -f json 2>/dev/null)" || true
if [ -z "$lint_json" ]; then
  exit 0   # eslint could not run; do not invent a failure
fi

errors="$(jq '[.[].errorCount] | add // 0' <<<"$lint_json" 2>/dev/null || echo 0)"
warnings="$(jq '[.[].warningCount] | add // 0' <<<"$lint_json" 2>/dev/null || echo 0)"

if [ "$errors" -gt "$baseline" ]; then
  echo "QUALITY GATE — lint REGRESSED: $errors errors, baseline was $baseline." >&2
  echo "" >&2
  npx eslint . 2>&1 | tail -50 >&2
  echo "" >&2
  echo "Fix the errors you introduced. Do not raise the baseline to silence this." >&2
  exit 2
fi

if [ "$errors" -lt "$baseline" ]; then
  echo "$errors" > "$baseline_file"
  echo "Lint baseline ratcheted down: $baseline -> $errors errors." >&2
fi

if [ "$errors" -gt 0 ]; then
  echo "Lint: $errors error(s), $warnings warning(s) — at baseline, no regression. Still owed." >&2
fi

exit 0
