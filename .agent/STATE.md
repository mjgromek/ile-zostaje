<!-- Cap: 120 lines. Orchestrator enforces on every write. Over cap: compact settled facts into DECISIONS.md and delete them from here. State describes now. -->

# STATE

Run 4, slice 2. Phase-start SHA 1bbffef. FILES CHANGED is generated from
`git diff --stat 1bbffef..HEAD`. Slice 1 shipped at f8fdf09, tagged `v0.1.0`.

**Every shell command starts with `export PATH="/opt/homebrew/bin:$PATH"`.** Node and npm
are there and are NOT on the agent's default Bash PATH; without it you get `command not
found`, which reads as "not installed" and is wrong. R4-F3.

## Current slice

**Slice 2 — umowa zlecenie and umowa o dzieło, with student status on zlecenie.**

The contract control's two disabled slots come alive. Zlecenie brings its own ZUS rules
and, for a student under 26, the removal of ZUS entirely — the single biggest number this
audience will see change, and the reason they came. Dzieło is a different animal: no ZUS,
no health contribution, and koszty uzyskania przychodu at 20% or 50%, where 50% depends on
transfer of copyright and is capped annually.

The screen becomes **variant B**, chosen by the stakeholder from three rendered layouts:
contract type as a full-width bar above everything, one card holding the amount and the
Nie/Tak questions, the answer directly below. The lede sentence is CUT — "to wiadomo" —
not shortened, not moved, and never reintroduced under another name. theme-factory is
closed: type stays as shipped.

Not in this slice: the brutto/netto toggle and its reverse calculation, which is now
slice 3 and NOT dropped — it is a new engine capability, not a label, and its round-trip
is its own verification surface. Then units (4), the leftover layer (5), deployment (6).

## Acceptance criteria

Checked in a real browser against the running app, not against the diff.

1. All three contract slots are selectable. Choosing zlecenie or dzieło recomputes the net
   with no reload, and umowa o pracę returns the same figures as `v0.1.0` for the same
   inputs — the checker compares against the tagged release, not against a memory.
2. A student control is offered where it applies. For a student under 26 on zlecenie,
   every ZUS line vanishes from band and ladder and the net rises to match. Both states
   are observed on screen, and the source for the exemption is cited on the page.
3. Dzieło shows no ZUS and no health line. Koszty uzyskania przychodu are selectable
   between 20% and 50%; the 50% option is presented as the condition that earns it —
   transfer of copyright — not as a bare percentage. Its annual cap comes from the data
   file, never from a branch.
4. The under-26 PIT relief applies to exactly the contract types the cited source lists.
   Where a selected contract is outside that list, the interface says so in the active
   language rather than silently ignoring the control. A rule hidden in an if-branch is a
   defect this criterion exists to catch.
5. Every new rate, threshold and cap is in the year data file with an official source URL,
   an effective date, and a quote that is genuinely printed on that page. Slice 1's
   carried-forward entries are re-fetched and re-verified, not assumed clean because they
   passed once.
6. The ladder's lines sum to the gross to the grosz for all three contracts, with the
   student control on and off, and at both 20% and 50% — checked by adding the numbers on
   the rendered page.
7. Both languages are complete for every new string, with no untranslated or missing key.
   The settled exception stands: `Zlecenie` and `Dzieło` remain Polish in the EN build.
8. The screen is variant B: the contract bar sits above everything, the amount and the
   Nie/Tak questions share one card, the answer is directly below. The lede sentence is
   gone from both languages, and no sentence has replaced it that restates it.
9. Evidence: the engine's cases are hand-computed per contract and per relief state, each
   naming its source; Playwright drives a real browser for criteria 1, 2, 3 and 4.

## Shipped

**Slice 1 — umowa o pracę, gross to real net.** Checker PASS on all eight criteria,
no open P0 or P1, after one fix cycle. 16 tests (9 vitest, 7 Playwright). Tagged `v0.1.0`,
confirmed on origin. Details in `.agent/DECISIONS.md` and `.agent/LAST_CHECK.md`.

## In flight

`designer` — two or three structurally different layouts for the slice 2 screen, rendered
on the real screen for the stakeholder to pick from. theme-factory is CLOSED: variant A,
the shipped type, won. **The pipeline stops at the pick.** No interface code before it.

## Blocked

Nothing. Slice 2 proceeds under the run-4 autonomy grant, recorded in DECISIONS.md.

## Last verification result

2026-08-09, slice 1 after fix cycle 1 — **PASS on all eight criteria, no open P0 or P1.**
Δ = 0 (visible 16/16, held-out 5/5). Three P2 deferrals remain, in BACKLOG. Full report,
verbatim, in `.agent/LAST_CHECK.md`, which is overwritten when slice 2 is checked.

## Next slices, in order

3. **The brutto/netto toggle**, split out of slice 2 by size. A user says "I want 5 000 on
   hand — what must I earn?" Its criteria, written now so they cannot be quietly dropped:
   the toggle sits on the amount input and defaults to brutto; its state persists with the
   other entries; netto->brutto INVERTS the same cited rates the forward path uses, by
   solving against the real function, never a second formula or a typical multiplier; the
   round-trip closes to the grosz for every contract and relief combination, checked in
   the browser and not only in Vitest; and where the inverse is not unique or undefined —
   flat and stepped regions from thresholds and rounding — the screen says so rather
   than printing the first numeric solution as the answer. Both directions carry the
   estimate-not-advice framing: a gross derived from a target net looks like a stronger
   claim and is not one.
4. Input units: hour, week, month, year.
5. The leftover layer — rent and food subtracted from the net. Survives every scope cut.
6. Deploy to a public URL, verified with `hooks/verify-deploy.sh`.

## Checkpoints

- 2026-08-09 22:44 — slice 1 shipped and tagged v0.1.0; slice 2 written here before any
  code, phase-start 1bbffef.
- 2026-08-09 23:11 — theme-factory closed: stakeholder chose variant A, as shipped.
  New standing instruction: page-form variants are rendered and picked by the human.
  P2-6 promoted out of BACKLOG into slice 2 — its condition ("a later slice uses the
  annual cap") fired when KUP arrived. Builder fixes it with the new KUP citations.
- 2026-08-09 23:29 — three layouts rendered outside the repo; stopped for the pick.
  R4-F9 logged: no agent write boundary allows for rendering, resolved via scratchpad.
