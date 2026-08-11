#!/usr/bin/env bash
# Shared helpers for the project hooks. Sourced, never executed directly.

# Print a path relative to the git repository that actually contains it.
#
# Why not just strip CLAUDE_PROJECT_DIR: a git worktree lives OUTSIDE the
# session's project dir, so that prefix never matches and the path stays
# absolute — which makes every `case "$rel" in src/...)` pattern in the calling
# hook silently miss. That is not a loud failure; the guard just stops guarding.
#
# Falls back to CLAUDE_PROJECT_DIR, then to the raw path, so a non-git checkout
# still behaves sensibly.
repo_relative() {
  local p="$1" dir root
  dir="$(dirname "$p")"
  # The file may not exist yet (a Write creating it), and neither may its
  # directory — walk up to something git can be asked about.
  while [ ! -d "$dir" ] && [ "$dir" != "/" ] && [ "$dir" != "." ]; do
    dir="$(dirname "$dir")"
  done
  root="$(git -C "$dir" rev-parse --show-toplevel 2>/dev/null)"
  [ -n "$root" ] || root="${CLAUDE_PROJECT_DIR:-$PWD}"
  printf '%s' "${p#"$root"/}"
}
