#!/usr/bin/env bash
# PostToolUse(Edit|Write) — lint the single file that was just touched, so a
# mistake is reported while the change is still fresh rather than at Stop time.
#
# stdin : harness hook JSON  { tool_input: { file_path } }
# exit 0: clean.  exit 2: problems found, stderr is shown to the model.
set -uo pipefail

payload="$(cat)"
file_path="$(jq -r '.tool_input.file_path // empty' <<<"$payload")"
[ -z "$file_path" ] && exit 0

case "$file_path" in
  *.ts|*.tsx) ;;
  *) exit 0 ;;
esac
[ -f "$file_path" ] || exit 0

root="${CLAUDE_PROJECT_DIR:-$PWD}"
cd "$root" || exit 0

out="$(npx eslint "$file_path" 2>&1)" && exit 0

echo "ESLint problems in ${file_path#"$root"/}:" >&2
echo "$out" >&2
echo "Fix these now — the Stop gate blocks on a non-green lint." >&2
exit 2
