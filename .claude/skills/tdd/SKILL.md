---
name: tdd
description: Test-driven development. Use when the user wants to build features or fix bugs test-first, mentions "red-green-refactor", or wants integration tests.
---
<!-- Cap: 60 lines, whole file. Over cap is a bug: cut content, never a rule. -->

# Test-Driven Development

TDD is the red → green loop. This skill is the reference that makes that loop produce tests worth keeping: what a good test is, where tests go, the anti-patterns, and the rules of the loop. Every section applies on every cycle — consult them before and during the loop, not after.

Work from the acceptance criteria at the top of `.agent/STATE.md`. If they are missing, stop and say so — do not infer them from the code.

When exploring the codebase, read `CONTEXT.md` if present and `docs/adr/` if present, so test names and interface vocabulary match the project's domain language; neither is required by this template.

## What a good test is

Tests verify behavior through public interfaces, not implementation details. Code can change entirely; tests shouldn't. A good test reads like a specification — "user can checkout with valid cart" tells you exactly what capability exists — and survives refactors because it doesn't care about internal structure.

See [tests.md](tests.md) for examples and [mocking.md](mocking.md) for mocking guidelines.

## Seams — where tests go

A **seam** is the public boundary you test at: the interface where you observe behavior without reaching inside. Tests live at seams, never against internals.

**Test only at pre-agreed seams.** Before writing any test, write down the seams under test and confirm them with the user. No test is written at an unconfirmed seam. You can't test everything — agreeing the seams up front is how testing effort lands on the critical paths and complex logic instead of every edge case.

Ask: "What's the public interface, and which seams should we test?"

When the shape of that interface is itself in question — how deep the module is, where the seam belongs, what the interface should expose — that is a design question, not a test question. Settle it against `PROJECT.md` and the acceptance criteria before writing the test.

## Anti-patterns

- **Implementation-coupled** — mocks internal collaborators, tests private methods, or verifies through a side channel (querying the database instead of using the interface). The tell: the test breaks when you refactor but behavior hasn't changed.
- **Tautological** — the assertion recomputes the expected value the way the code does (`expect(add(a, b)).toBe(a + b)`, a snapshot derived by hand the same way, a constant asserted equal to itself), so it passes by construction and can never disagree with the code. Expected values must come from an independent source of truth — a known-good literal, a worked example, the spec.
- **Horizontal slicing** — writing all tests first, then all implementation. Bulk tests verify _imagined_ behavior: you test the _shape_ of things rather than user-facing behavior, the tests go insensitive to real changes, and you commit to test structure before understanding the implementation. Work in **vertical slices** instead — one test → one implementation → repeat, each test a **tracer bullet** that responds to what the last cycle taught you.

## Rules of the loop

- **Red before green.** Write the failing test first, then only enough code to pass it. Don't anticipate future tests or add speculative features.
- **Confirm it fails for its own reason.** Run it and read the failure: the assertion, not an import error, a typo, a missing fixture or a collection error. A test that fails for the wrong reason has verified nothing.
- **One slice at a time.** One seam, one test, one minimal implementation per cycle.
- **Refactoring is not part of the loop.** It belongs to the review stage (see the `code-review` skill), not the red → green implementation cycle.

## Cap

**The named acceptance criteria from `.agent/STATE.md`, plus at most two implied guards.** An implied guard is written only with a stated reason, and the report says which two and why.

**At a third implied guard, refuse.** Do not write it. Report it as a deferral with the condition that would make it urgent, and let the orchestrator record it. No speculative tests, and no test for behaviour nobody asked for: a test that exists because it seemed thorough is scope expansion wearing a test's clothes.

**A test that asserts documentation agrees with configuration, or that a placeholder looks like a placeholder, is lint, not a test.** It does not verify behaviour through a public interface and it does not belong in the suite the checker re-runs every phase. Testing a seam by TAKING a value from config and exercising it is correct and is not this. Re-typing a literal and asserting equality is not.

Adapted from https://github.com/mattpocock/skills. Tightened per `docs/DESIGN.md` section 6.
