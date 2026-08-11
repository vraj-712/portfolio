#!/usr/bin/env bash
# PreToolUse(Edit|Write|NotebookEdit) — refuse writes to generated or vendored paths.
#
# stdin : harness hook JSON  { tool_input: { file_path } }
# exit 0: allow.  exit 2: block, stderr is shown to the model.
set -uo pipefail

payload="$(cat)"
file_path="$(jq -r '.tool_input.file_path // empty' <<<"$payload")"
[ -z "$file_path" ] && exit 0

# Normalise to a repo-relative path so the patterns below stay readable.
root="${CLAUDE_PROJECT_DIR:-$PWD}"
rel="${file_path#"$root"/}"

deny() {
  echo "BLOCKED — $rel" >&2
  echo "$1" >&2
  exit 2
}

case "$rel" in
  dist/*)
    deny "dist/ is build output. Edit the source in src/ or scripts/prerender.mjs, then run 'npm run build'." ;;
  node_modules/*)
    deny "node_modules/ is vendored. Change package.json and reinstall instead." ;;
  bun.lock|package-lock.json)
    deny "Lockfiles are generated. Run the package manager rather than hand-editing." ;;
  .git/*)
    deny "Refusing to write inside .git/. Use git commands." ;;
esac

exit 0
