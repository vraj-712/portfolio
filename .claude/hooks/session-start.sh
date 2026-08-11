#!/usr/bin/env bash
# SessionStart — put the facts an agent would otherwise have to go discover
# (branch, worktree, dirty files, lint health) into context up front.
#
# stdout is injected as additional context. Never fail the session.
set -uo pipefail

root="${CLAUDE_PROJECT_DIR:-$PWD}"
cd "$root" || exit 0

echo "=== vraj-portfolio ==="
echo "branch:    $(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo '?')"
echo "head:      $(git log -1 --oneline 2>/dev/null || echo '?')"

dirty="$(git status --porcelain 2>/dev/null | wc -l)"
echo "dirty:     $dirty file(s)"

wt="$(git worktree list 2>/dev/null | wc -l)"
if [ "$wt" -gt 1 ]; then
  echo "worktrees: $wt active —"
  git worktree list 2>/dev/null | sed 's/^/           /'
fi

echo "lint:      $(npx eslint . 2>&1 | tail -1 | sed 's/^[[:space:]]*//' || echo 'unknown')"
echo "Read CLAUDE.md before editing. Design law: every visual value is a token in src/styles/theme.css."

exit 0
