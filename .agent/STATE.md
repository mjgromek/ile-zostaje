<!-- Cap: 120 lines. Orchestrator enforces on every write. Over cap: compact settled facts into DECISIONS.md and delete them from here. State describes now. -->

# STATE

Run 4. **Slice 4 RELEASED at `b7e726c` / `v0.4.0`**, both confirmed on `origin` with
`git ls-remote` — `refs/heads/main` and `refs/tags/v0.4.0^{}` are the same SHA. Slice 3 at
`8a5b3d8` / `v0.3.0`, slice 2 at `e6be6b6` / `v0.2.0`, slice 1 at `f8fdf09` / `v0.1.0`.
**Pipeline upstream SHA: none — this clone has one remote, `origin`, and no upstream
pipeline remote to name.**

**Every shell command starts with `export PATH="/opt/homebrew/bin:$PATH"`.** Node 25.9.0
and npm 11.12.1 live there and are NOT on the agent's default Bash PATH; without it you get
`command not found`, which reads as "not installed". R4-F3.

**Port 5180 is the stakeholder's dev server and 5184 is their LIVE PREVIEW.** Neither is
ever bound or killed by an agent; every agent uses 5181–5183 and releases them.

## Current slice — 4b, the card's first impression

Phase-start **`589ea02`**; FILES CHANGED from `git diff --stat 589ea02..HEAD`. Built to
`.agent/DESIGN-SLICE-4B.md`, a settled spec. Four stakeholder items, no escalation, plus one
pre-existing P1-class fix folded in.

### Acceptance criteria

**Settled — all twelve PASS.** They live verbatim in `.agent/LAST_CHECK.md` beside the
measurement that closed each one, and their detail in `.agent/DESIGN-SLICE-4B.md`. Two are
worth carrying forward because a later slice can undo them:

- **Criterion 5's byte-level wording was CORRECTED after the security gate.** It said an
  unparseable record is "never overwritten". MEASURED false: the field stays empty, but
  `App.tsx:47`'s unconditional write-on-mount persists the fallback over the damaged bytes
  one paint later. The user-visible guarantee holds; the storage one does not.
- **Criterion 10 was a FIX of a defect predating this slice**, confirmed three times, last
  by the checker serving the extracted `v0.4.0` tag. Never re-grade it as a regression.

## In flight

Slice 4b checked PASS. Gates, then README and the v0.5.0 release.

## Blocked

Nothing.

## Last verification result

Slice 4b at `4e213c1` — **PASS**, Δ = 0 (77/77 visible, 5/5 held-out), no P0 or P1, two
mutants caught. The checker verified the `v0.4.0` claim rather than accepting it: it served
the extracted tag and reproduced the live-region defect there before grading the fix.
Security gate — **PASS**, three P2, two mutants caught. Architecture **NO CHANGE** with one
structural deferral. Verbatim in `.agent/LAST_CHECK.md`.

**Two P2 govern how future gates run.** (a) `npm test` alone is never sufficient — measured
three times now that a broken gate leaves Vitest fully green. (b) The live-region sentence
has no seam, which is the single cause behind three separate findings.

**The built-in `/security-review` has NOT been typed for slice 4 or 4b.**

## Next slices, in order

5. The leftover layer — rent and food subtracted from the net. **This is the one that turns
   a net calculator into this product**, and the last heavy Definition-of-Done clause.
6. Deploy to a public URL, verified with `hooks/verify-deploy.sh`. Four BACKLOG entries
   name it as their urgency condition, the missing CSP among them.

## Checkpoints

- 2026-08-18 22:48 to 2026-08-19 16:24 — slices 2 and 3 built, checked and released at
  `v0.2.0` and `v0.3.0`; the detail is in `DECISIONS.md` and git history.
- 2026-08-19 17:46 to 19:06 — slice 4 designed, built (the builder was interrupted by the
  machine sleeping and RESUMED from its own transcript), checked PASS, gated and released
  at `v0.4.0`. The checker caught three stale project records, all the orchestrator's own
  drift, all corrected.
- 2026-08-19 — four stakeholder decisions on the live preview became slice 4b. The designer
  returned with NO escalation and one pre-existing P1-class fix folded in.
