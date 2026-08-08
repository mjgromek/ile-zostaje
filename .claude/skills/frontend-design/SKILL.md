---
name: frontend-design
description: Frontend design pass, only when UI is in scope. Requires a declared aesthetic before any CSS is written. Never runs on a backend-only slice.
---

Runs only when the slice ships something a user sees.

## Preconditions, checked in this order

1. **UI in scope?** If the slice is backend-only, it does not run. It says so in one line
   and stops. There is no partial run.
2. **Is there a declared aesthetic?** A named direction — references, tone, density,
   colour and type intent — recorded where the project keeps it. If it is missing, **stop
   and get one before writing a single line of CSS.** Do not infer one from the existing
   code and proceed.

## Autonomy

**User-visible design direction is Level 2** under `.claude/policies/autonomy.md`. This
skill proposes; the human decides. One decision, one recommendation, what each option
costs, what is blocked until it is answered.

It does not reverse a settled direction. Status indicators went pills, dots, pills, and
renter visibility reversed three times, each costing a full cycle.

## Cap

**At most three open design questions per slice.** Beyond three, stop and escalate the one
that blocks the most work; the rest are deferrals the orchestrator records.
