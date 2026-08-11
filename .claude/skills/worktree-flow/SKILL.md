---
name: worktree-flow
description: The isolated-worktree protocol for assessment and refactor passes on vraj-portfolio — create, work with commits per fix, verify green, merge back to main, and remove the worktree cleanly. Read before starting any multi-commit change.
---

# Worktree flow

Multi-commit refactor work happens in a git worktree, not on `main`. `main` stays checkoutable and
runnable the entire time, and the merge is a single reviewable event.

The rule that makes this safe: **the worktree is disposable, `main` is not.** Nothing lands on
`main` except through a verified merge, and the worktree is removed the moment it merges.

---

## 1. Create

```bash
git -C /var/www/html/vraj-github/vraj-portfolio worktree add \
    ../vraj-portfolio-<topic> -b <type>/<topic>
```

Conventions:

- Path is a **sibling** of the repo, never inside it — a nested worktree gets picked up by Vite's
  watcher, by `tsc -b`'s include globs, and by `eslint .`, which produces confusing duplicate errors.
- Branch name matches the worktree name: `refactor/assessment`, `fix/scroll-leak`.
- One worktree per topic. Two concurrent worktrees editing the same files will conflict at merge.

`node_modules` is **not** copied into a new worktree. Either symlink it or install:

```bash
cd ../vraj-portfolio-<topic>
ln -s ../vraj-portfolio/node_modules node_modules   # fast, fine for a short-lived worktree
```

A symlink is safe here because the worktree does not change `package.json`. If a change *does* touch
dependencies, run a real install instead.

---

## 2. Work

Inside the worktree:

- One concern per commit — see `.claude/skills/commit-discipline/SKILL.md`.
- **Verify before every commit**, not just at the end:
  ```bash
  npx tsc -b && npx eslint .
  ```
  Both must be clean. The `Stop` hook enforces this, but do not rely on it — a broken intermediate
  commit makes `git bisect` useless later.
- Commit immediately after each fix passes. Do not batch several fixes into one commit because they
  happened in the same sitting.
- For anything visual, verify in a browser before committing — see
  `.claude/skills/visual-verification/SKILL.md`.

---

## 3. Verify before merge

The full gate, run from inside the worktree:

```bash
npx tsc -b          # 0 errors
npx eslint .        # 0 errors, 0 warnings
npm run build       # full build including the Playwright prerender
```

If Chrome is unavailable for the prerender step, `npm run build:nossg` is an acceptable substitute —
but say so in the report rather than claiming the full build passed.

Then read your own diff:

```bash
git diff main...HEAD --stat
git diff main...HEAD
```

Look for changes you did not intend: a stray formatting sweep, a `console.log`, an edit to `dist/`.

---

## 4. Merge

From the **main** checkout, not the worktree:

```bash
cd /var/www/html/vraj-github/vraj-portfolio
git switch main
git merge --no-ff <type>/<topic> -m "merge: <topic> — <one-line summary>"
```

`--no-ff` is deliberate. It keeps the assessment pass legible as one unit in the history, so the
whole thing can be reverted with a single `git revert -m 1` if something turns out wrong.

Re-verify **after** the merge on `main` — a clean merge can still produce a broken tree if two
branches touched related code:

```bash
npx tsc -b && npx eslint . && npm run build
```

---

## 5. Remove

```bash
git worktree remove ../vraj-portfolio-<topic>
git worktree prune
git branch -d <type>/<topic>
git worktree list        # confirm only the main checkout remains
```

`git worktree remove` refuses if the tree is dirty — that refusal is a feature. Do not reach for
`--force` without first looking at what is uncommitted; it is usually work you meant to keep.

`git branch -d` (lowercase) also refuses if the branch is not merged. Same principle: if it refuses,
the merge did not happen the way you thought.

---

## 6. If something goes wrong

| Situation | Action |
|---|---|
| Merge conflict | Resolve in the main checkout, re-run the full gate before committing the merge |
| Tree broken after merge | `git reset --hard HEAD~1` (the merge is the tip and unpushed), fix in the worktree, merge again |
| Worktree removal refuses (dirty) | `git -C <worktree> status` first; commit or deliberately discard, then remove |
| Branch delete refuses (unmerged) | Confirm the merge landed with `git log main --oneline`. Do not use `-D` to silence it |
| Worktree directory deleted by hand | `git worktree prune` to clear the stale registration |

---

## 7. Checklist

- [ ] Worktree is a sibling directory, not nested
- [ ] Branch name matches the worktree topic
- [ ] `node_modules` linked or installed
- [ ] Every commit is one concern, and green at the time it was made
- [ ] Visual changes verified in a browser
- [ ] Full gate passes in the worktree before merge
- [ ] Merged with `--no-ff` from the main checkout
- [ ] Gate re-run on `main` after the merge
- [ ] Worktree removed, branch deleted, `git worktree list` shows only `main`
