<!-- Cap: 120 lines. Orchestrator enforces on every write. Over cap: compact settled facts into DECISIONS.md and delete them from here. State describes now. -->

# STATE

Run 4. **Slice 2 SHIPPED at `e6be6b6`, tagged `v0.2.0`, both on `origin`.** Slice 1 shipped
at `f8fdf09`, tagged `v0.1.0`. The next slice sets its own phase-start SHA before any code;
FILES CHANGED is generated from `git diff --stat <phase-start>..HEAD`.

**Every shell command starts with `export PATH="/opt/homebrew/bin:$PATH"`.** Node and npm
are there and are NOT on the agent's default Bash PATH; without it you get `command not
found`, which reads as "not installed" and is wrong. R4-F3.

**Port 5180 is the stakeholder's dev server**, run with `--strictPort`. Never bound, never
killed by an agent; every agent uses 5181+.

## Current slice

None. Slice 2 — umowa zlecenie, umowa o dzieło and student status on layout B — is done.
Its nine acceptance criteria and every verdict against them are in `.agent/LAST_CHECK.md`;
its design is in `DESIGN-SLICE-2`. Slice 3 below is next and has NOT started.

## In flight

Nothing.

## Blocked

Nothing.

## Last verification result

Measured 2026-08-19 14:54, the P1-J re-check at `cb189dc` — **PASS**, nine criteria in a
real browser, Δ = 0 (visible 45/45, held-out 5/5), P1-J CLOSED on the first fix attempt, no
open P0 or P1, four P2 in BACKLOG. Verbatim in `.agent/LAST_CHECK.md`.

Gates, all reported: security-gate PASS (one P2, no CSP), architecture gate NO CHANGE,
release check PASS.

## Next slices, in order

3. **The brutto/netto toggle** — "I want 5 000 on hand, what must I earn?" Criteria written
   now so they cannot be quietly dropped: it sits on the amount input, defaults to brutto
   and persists with the other entries; netto->brutto INVERTS the cited rates by solving
   against the real function; the round-trip closes to the grosz for every contract and
   relief combination, in the browser and not only in Vitest; where the inverse is not
   unique or is undefined the screen says so instead of printing the first solution; both
   directions keep the estimate-not-advice framing. Place, copy and the measured
   non-uniqueness are settled in DESIGN-SLICE-2 §3; what it rules out is in DECISIONS.
4. Input units: hour, week, month, year.
5. The leftover layer — rent and food subtracted from the net. Survives every scope cut.
6. Deploy to a public URL, verified with `hooks/verify-deploy.sh`.

## Checkpoints

- 2026-08-18 22:48 — builder handed slice 2 over, `df2b307..d75fe30`.
- 2026-08-18 23:04 to 2026-08-19 00:02 — four check-and-fix cycles: P1-A, P2-B, P2-C, then
  P1-E (a false claim from a stale chip) at `c316bbe`, then P1-F (§8's immediate
  announcement dropped for contract and copyright) at `01389cd`. A red test led each.
- 2026-08-19 00:21 — release check PASS, Δ 0. Architecture gate NO CHANGE, one deferral.
- 2026-08-19 00:24 — security-gate, trigger USER-SUPPLIED INPUT: PASS, one P2 (no CSP).
- 2026-08-19 00:26 — PROBE CONFIRMED, P1-J: the `Nie` delta chip printed the whole PIT
  advance as the relief's worth, overstating above ~10 319 zł/month — 37% at 20 000.
  Release BLOCKED. The orchestrator instance then died on a 600 s harness stall.
- 2026-08-19 14:39 — fix cycle 1 of a permitted 2 on P1-J: red test `9ae3b38`, fix
  `cb189dc`. `reliefWorthGrosz` became the counterfactual on both sides;
  `pitWithoutReliefGrosz` untouched, so the ladder was unaffected.
- 2026-08-19 14:54 — checker: P1-J CLOSED, nine criteria PASS, Δ 0. New P2-K to BACKLOG:
  the chip's zero-guard survives a behaviour-bearing mutant.
- 2026-08-19 14:57 — README at v0.2.0 (`b9d3080`), state committed (`e6be6b6`), pushed,
  annotated tag `v0.2.0` pushed. Both verified with `git ls-remote`: `refs/heads/main` and
  `refs/tags/v0.2.0` -> `4369a46`, peeling to `e6be6b6`.
