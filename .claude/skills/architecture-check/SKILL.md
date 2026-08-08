---
name: architecture-check
description: Reports concrete correctness, boundary or scaling problems and prefers NO CHANGE. Runs only when module boundaries moved in the diff, at the phase gate.
---
<!-- Cap: 60 lines, whole file. Over cap is a bug: cut content, never a rule. -->

Prefers NO CHANGE. Its default answer is that the current structure is adequate.

## Trigger

**Runs only when module boundaries moved in the diff** — a new module, a moved
responsibility, a changed interface between them. On a diff that stayed inside one module
it declines in one line and stops.

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
