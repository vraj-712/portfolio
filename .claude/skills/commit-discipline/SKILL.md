---
name: commit-discipline
description: Commit conventions for vraj-portfolio — one concern per commit, Conventional Commits format, the green-before-commit gate, and how to split refactors from behaviour changes. Read before committing during a multi-fix pass.
---

# Commit discipline

A commit is the unit of review and the unit of revert. Both jobs fail if a commit does more than one
thing.

---

## 1. One concern per commit

A commit contains **one** of:

- one bug fixed
- one refactor applied
- one feature added
- one dependency change
- one documentation change

Not "fixed the header and also tidied the About styles". If you find a second thing while fixing the
first, either commit the first and then fix the second, or `git add -p` to stage only the lines that
belong to the concern in hand.

The test: can you write the subject line without using "and"? If not, it is two commits.

**The one exception that is not a violation:** a change and its required counterpart are one concern.
Changing `EASE.expoOut` in `lib/gsap/easings.ts` and `--ease-expo-out` in `theme.css` is a single
commit, because the two values mirror each other and either alone is a defect.

---

## 2. Format

Conventional Commits, matching the existing history:

```
<type>(<scope>): <subject>

<body — why, not what>
```

| Type | For |
|---|---|
| `fix` | A defect a user could hit |
| `refactor` | Structure changed, rendered output identical |
| `feat` | New capability or changed behaviour |
| `style` | Visual/design-system change with no logic change |
| `perf` | Measurably faster or lighter |
| `docs` | Documentation, including `CLAUDE.md` and skills |
| `chore` | Tooling, config, dependencies |

Scope is the area: `hero`, `settings`, `cursor`, `theme`, `motion`, `a11y`, `build`.

Subject: imperative mood, lower case, no trailing period, under ~72 characters.

```
fix(hero): assign theme ref in an effect, not during render
refactor(settings): extract shade derivation from applySettings
style(about): give split lines descender room at tight line-height
```

The body explains **why**. The diff already shows what. If a fix is non-obvious, the body is where
you record the failure mode it prevents — that is the note your future self needs.

---

## 3. Green before commit

Both must pass, every time, before `git commit`:

```bash
npx tsc -b     # 0 errors
npx eslint .   # 0 errors, 0 warnings
```

The `Stop` hook enforces this at the end of a turn, but the discipline is per-commit. A red
intermediate commit destroys `git bisect` and makes the branch impossible to review commit-by-commit.

For anything that changes rendered output, add a browser check before committing — see
`.claude/skills/visual-verification/SKILL.md`.

---

## 4. Refactor versus behaviour change

This is the distinction most worth getting right in this codebase.

**`refactor` means the rendered output and the animation timing are identical.** Same DOM, same
classes, same tween durations and easings, same scroll positions. If a viewer could tell the
difference by looking, it is not a refactor.

If a restructure *does* change what appears on screen — even slightly, even for the better — it is a
`feat` or a `style` or a `fix`, and it gets:

- its own commit, separate from the surrounding refactor
- a body line stating exactly what changed visually
- a browser verification

Burying a visual change inside a "refactor" commit is how a portfolio quietly regresses. When in
doubt, split it out and label it.

---

## 5. What never gets committed

- `dist/` — build output (the `protect-paths.sh` hook blocks writes to it)
- `node_modules/`
- Hand-edited `bun.lock`
- `console.log` / `debugger` left from investigation
- Commented-out code "for later" — git remembers it; delete it
- Placeholder content replaced with invented real content. The `// TODO` markers in
  `src/data/content.ts` are intentional; leave them until the owner supplies real copy.

---

## 6. Checklist

- [ ] Subject line needs no "and"
- [ ] Type and scope are accurate; `refactor` really is output-identical
- [ ] Body says why, not what
- [ ] `npx tsc -b` clean
- [ ] `npx eslint .` clean
- [ ] Visual change verified in a browser, if any
- [ ] `git diff --staged` reviewed — nothing unrelated swept in
- [ ] No debug statements, no commented-out code, no `dist/`
