---
name: architecture-check
description: Reports concrete correctness, boundary or scaling problems and prefers NO CHANGE. Runs at the phase gate when module boundaries moved in the diff, or when a single module grew by 100+ lines without one moving.
---
<!-- Cap: 60 lines, whole file. Over cap is a bug: cut content, never a rule. -->

Prefers NO CHANGE. Its default answer is that the current structure is adequate.

## Trigger

**Runs when module boundaries moved in the diff** — a new module, a moved responsibility,
a changed interface between them.

**Runs also when any single module grew by 100 or more counted lines across the phase's
diff, boundary moved or not.** A module that grows by a module's worth of code while
staying one module is the shape of a seam that should have been drawn and was not — and a
missing seam produces one-module diffs by definition, which the old trigger read as its
decline condition (R2-F34: 295 → 466 lines of routing-plus-markup, declined at every
gate). 100 because it is module-sized in the reference codebase (`theme.py` 132,
`boundaries.py` 222 at birth); routine slice growth ran +8 to +60 and stays below it. An
eager trigger costs one look — the default answer is still NO CHANGE.

On a diff that moved no boundary and grew no module past the threshold, it declines in
one line and stops.

## What it may report — naming file, mechanism and consequence

- **Correctness** — the structure permits a wrong result.
- **Boundary** — a module reaches through another's interface, or owns foreign state.
  **Presentation mixed into application logic is a boundary finding.** Markup assembled by
  string concatenation inside a module that also holds request routing, data access or
  business rules crosses a seam, and the tell is that the module cannot be tested for either
  concern without the other. Templates live in their own files or their own module. This is
  a concrete boundary problem, not taste, and is therefore inside this skill's remit.
- **Scaling** — a named load or data volume at which the structure fails.

**Never a preference, never refactor-for-elegance.** "Would be cleaner as", "more
idiomatic", "consider extracting" are not findings. Taste is not a finding.

When nothing in the three classes is wrong, the whole output is `NO CHANGE` plus one line
of what was examined. That is a success, not an empty result.

## Cap

**At most two items marked FIX NOW. At the third, refuse the mark.** The third and beyond
are deferrals reported to the orchestrator; this skill writes nothing itself.
