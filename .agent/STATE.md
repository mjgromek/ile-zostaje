<!-- Cap: 120 lines. Orchestrator enforces on every write. Over cap: compact settled facts into DECISIONS.md and delete them from here. State describes now. -->

# STATE

Run 4. **Slice 3 RELEASED at `8a5b3d8` / `v0.3.0`**, both confirmed on `origin` with
`git ls-remote` at 16:24 — `refs/heads/main` and `refs/tags/v0.3.0^{}` are the same SHA.
Slice 2 shipped at `e6be6b6` / `v0.2.0`, slice 1 at `f8fdf09` / `v0.1.0`. **Pipeline
upstream SHA: none — this clone has one remote, `origin`, and no upstream pipeline remote
to name.** `git remote -v`, 15:03.

**Every shell command starts with `export PATH="/opt/homebrew/bin:$PATH"`.** Node 25.9.0
and npm 11.12.1 are there and are NOT on the agent's default Bash PATH; without it you get
`command not found`, which reads as "not installed" and is wrong. R4-F3.

**Port 5180 is the stakeholder's dev server**, run with `--strictPort`. Never bound, never
killed by an agent; every agent uses 5181+.

## Current slice

None. Slice 4 is next and is NOT started. The orchestrator writes it and its acceptance
criteria here, with a phase-start SHA taken at that moment, before any builder runs.

Two things slice 4 inherits, already measured, so it re-measures nothing:
the thresholds table and the non-monotonicity figures are in `DECISIONS.md` under
2026-08-19; the annual ZUS ceiling in BACKLOG becomes urgent the moment the year unit
ships, by its own condition, and is the one backlog item slice 4 promotes rather than
defers.

## In flight

Nothing.

## Blocked

Nothing.

## Last verification result

Measured 2026-08-19 15:50, slice 3 at `d68b471` — **PASS**, Δ = 0 (visible 56/56, held-out
5/5), 176 browser round trips with 0 failures, 72 screens compared against the `v0.2.0`
worktree with 0 differing, two mutants caught. Security gate 16:21 at `b1ceca9` — **PASS**,
no P0 and no P1, three P2. Vitest re-run green at the release commit, 33/33, 16:21.
No open P0 or P1 anywhere. Both verdicts verbatim in `.agent/LAST_CHECK.md`.

**The built-in `/security-review` did NOT run — no agent can execute a slash command.**
It is the human's to type, and it has not been typed for slice 3.

## Next slices, in order

4. Input units: hour, week, month, year. Promotes the annual ZUS ceiling from BACKLOG.
5. The leftover layer — rent and food subtracted from the net. Survives every scope cut.
6. Deploy to a public URL, verified with `hooks/verify-deploy.sh`.

## Checkpoints

- 2026-08-18 22:48 to 2026-08-19 14:57 — slice 2 built, checked over five cycles and
  released at `e6be6b6` / `v0.2.0`; the detail is in `DECISIONS.md` and git history.
- 2026-08-19 15:00 to 15:50 — slice 3 measured, sliced into ten criteria, built test-first
  at `3676565` / `8531b01`, and checked PASS with zero fix cycles. Criterion 5's example
  was corrected on the builder's own measurement before the check, not after it.
- 2026-08-19 16:03 — ponytail and architecture gates: one deferral each, no change to the
  tree. Ponytail's REMOVE on `field.gross.label` was NOT applied — the tree sat at a
  checked PASS and the tag asserts that SHA.
- 2026-08-19 16:21 — security gate PASS, three P2 (P2-S1, P2-S2, P2-S3) to BACKLOG.
- 2026-08-19 16:24 — README to v0.3.0, released and pushed. Slice 3 closed.
