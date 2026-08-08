---
name: tdd
description: Derives the minimum failing test from the acceptance criteria in .agent/STATE.md, confirms it fails for its own reason, then implements minimally. Use for every slice that changes behaviour.
---

Red, then green, from the acceptance criteria in `.agent/STATE.md`. If the criteria are
missing, stop and say so — do not infer them from the code.

## Red

Write the minimum failing test for a named criterion. Run it and **confirm it fails for
its own reason**: the assertion, not an import error, a typo, a missing fixture or a
collection failure. A test that fails for the wrong reason has verified nothing.

## Green

Implement the minimum that makes it pass. No refactor beyond what the test forces.

## Caps

**The named criteria, plus at most two implied guards.** An implied guard is written only
with a stated reason, and the report says which two and why.

**At the third implied guard, refuse.** Do not write it. Report it as a deferral with the
condition that would make it urgent, and let the orchestrator record it.

No speculative tests. No test for behaviour nobody asked for. A test that exists because
it seemed thorough is scope expansion wearing a test's clothes.
