#!/usr/bin/env bash
# Stop — the project's definition of done: typecheck and lint must both be green.
#
# Re-entrancy: when this hook blocks, the model keeps working and Stop fires
# again. stop_hook_active tells us we are already inside that loop; bail out so
# a genuinely stuck failure cannot spin forever.
#
# stdin : harness hook JSON  { stop_hook_active }
# exit 0: green.  exit 2: red, stderr is shown to the model.
set -uo pipefail

payload="$(cat)"
[ "$(jq -r '.stop_hook_active // false' <<<"$payload")" = "true" ] && exit 0

root="${CLAUDE_PROJECT_DIR:-$PWD}"
cd "$root" || exit 0

problems=""

if ! tsc_out="$(npx tsc -b 2>&1)"; then
  problems+=$'\nTYPECHECK FAILED (npx tsc -b):\n'
  problems+="$(tail -40 <<<"$tsc_out")"$'\n'
fi

if ! lint_out="$(npx eslint . 2>&1)"; then
  problems+=$'\nLINT FAILED (npx eslint .):\n'
  problems+="$(tail -60 <<<"$lint_out")"$'\n'
fi

if [ -n "$problems" ]; then
  echo "QUALITY GATE — the tree is not green, so this work is not done." >&2
  echo "$problems" >&2
  exit 2
fi

exit 0
