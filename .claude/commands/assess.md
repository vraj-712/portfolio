---
description: Run a full parallel code assessment across the agent fleet and produce one ranked report.
---

Run a complete assessment of this codebase. Scope: `$ARGUMENTS` (default: all of `src/`).

## 1. Establish the baseline

```bash
npx tsc -b
npx eslint .
git log --oneline -5
```

Record the numbers before anything else. A finding that is already a lint error is not a discovery.

## 2. Fan out — launch these in ONE message so they run concurrently

**Project agents** (they know this codebase's laws):
- `brutalist-stylist` — token discipline across `src/styles/` and every `.module.css`
- `motion-engineer` — `useGSAP` scoping, ScrollTrigger leaks, reduced-motion end states, Lenis
- `frontend-engineer` — React 19 correctness, hook rules, provider/context wiring, a11y floor
- `code-quality-auditor` — types, dead code, duplication, layering, complexity
- `bug-hunter` — runtime defects with concrete reproduction steps

**ECC agents** (independent second opinions, different priors):
- `ecc:react-reviewer` — hook correctness and render performance
- `ecc:typescript-reviewer` — type safety and async correctness
- `ecc:a11y-architect` — WCAG 2.2 AA audit
- `ecc:performance-optimizer` — bundle size, render cost, animation cost
- `ecc:silent-failure-hunter` — swallowed errors and bad fallbacks

Give each agent the same scope and tell it to cite `file:line` for every finding.

## 3. Merge

Pass every agent's raw output to `assessment-reporter`. It verifies each claim against the actual
code, drops what does not survive, deduplicates by root cause, re-ranks on one scale, and sequences
the work into commit-sized units.

## 4. Report

Present the ranked report. State explicitly:
- how many findings were dropped as unverifiable, and why
- which findings would change rendered output (those need a browser check and their own commit)
- the three things most worth fixing, in order

Do not start fixing until the report is presented.
