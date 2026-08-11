#!/usr/bin/env bash
# PreToolUse(Edit|Write) — enforce the brutalist design system at write time.
#
# Three laws, checked against the incoming text only (not the whole file):
#   1. no raw hex / rgb() / hsl() colours outside the token layer
#   2. no blurred shadows — brutalist shadows are "Npx Npx 0 0 <colour>"
#   3. no non-zero border-radius literals — corners are sharp
#
# Escape hatch: put "token-exempt" in a comment on the offending line.
#
# stdin : harness hook JSON  { tool_input: { file_path, content|new_string } }
# exit 0: allow.  exit 2: block, stderr is shown to the model.
set -uo pipefail

payload="$(cat)"
file_path="$(jq -r '.tool_input.file_path // empty' <<<"$payload")"
[ -z "$file_path" ] && exit 0

root="${CLAUDE_PROJECT_DIR:-$PWD}"
rel="${file_path#"$root"/}"

# Only guard the files that render the site.
case "$rel" in
  *.css|*.tsx) ;;
  *) exit 0 ;;
esac

# The token layer itself is where literal colours are supposed to live.
case "$rel" in
  src/styles/theme.css|src/config/theme.ts|src/settings/colors.ts|src/data/cursorThemes.ts)
    exit 0 ;;
esac

text="$(jq -r '(.tool_input.content // .tool_input.new_string) // empty' <<<"$payload")"
[ -z "$text" ] && exit 0

# Drop deliberately exempted lines before scanning.
scan="$(grep -v 'token-exempt' <<<"$text" || true)"
[ -z "$scan" ] && exit 0

violations=""

hex="$(grep -nE '#[0-9a-fA-F]{3,8}\b' <<<"$scan" | grep -vE 'https?://' || true)"
if [ -n "$hex" ]; then
  violations+=$'\n[1] Raw colour literal — use a var(--color-*) token from src/styles/theme.css:\n'
  violations+="$(head -5 <<<"$hex")"$'\n'
fi

rgb="$(grep -nE '\b(rgba?|hsla?)\(' <<<"$scan" || true)"
if [ -n "$rgb" ]; then
  violations+=$'\n[1] rgb()/hsl() literal — use a var(--color-*) token, or color-mix() on a token:\n'
  violations+="$(head -5 <<<"$rgb")"$'\n'
fi

# box-shadow whose 3rd length (the blur radius) is non-zero.
blur="$(grep -nE 'box-shadow[^;]*[0-9]+(px|rem|em)[^;]*[0-9]+(px|rem|em)[^;]*[1-9][0-9]*(px|rem|em)' <<<"$scan" || true)"
if [ -n "$blur" ]; then
  violations+=$'\n[2] Blurred shadow — brutalist shadows have zero blur. Use var(--shadow) / var(--shadow-sm) / var(--skin-shadow):\n'
  violations+="$(head -5 <<<"$blur")"$'\n'
fi

radius="$(grep -nE 'border-radius:[[:space:]]*(0?\.[0-9]+|[1-9][0-9]*)(px|rem|em|%)' <<<"$scan" || true)"
if [ -n "$radius" ]; then
  violations+=$'\n[3] Non-zero border-radius — corners are sharp. Use var(--radius), var(--skin-radius), or var(--radius-pill) for pills/chips only:\n'
  violations+="$(head -5 <<<"$radius")"$'\n'
fi

if [ -n "$violations" ]; then
  echo "DESIGN SYSTEM VIOLATION — $rel" >&2
  echo "$violations" >&2
  echo "See .claude/skills/brutalist-design-system/SKILL.md. If a literal is genuinely unavoidable, add a 'token-exempt' comment on that line." >&2
  exit 2
fi

exit 0
