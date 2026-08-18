<!-- Cap: 120 lines. Orchestrator enforces on every write. Over cap: compact settled facts into DECISIONS.md and delete them from here. State describes now. -->

# STATE

Run 4, slice 2. Phase-start SHA 1bbffef. FILES CHANGED is generated from
`git diff --stat 1bbffef..HEAD`. Slice 1 shipped at f8fdf09, tagged `v0.1.0`.

**Every shell command starts with `export PATH="/opt/homebrew/bin:$PATH"`.** Node and npm
are there and are NOT on the agent's default Bash PATH; without it you get `command not
found`, which reads as "not installed" and is wrong. R4-F3.

## Current slice

**Slice 2 — umowa zlecenie and umowa o dzieło, with student status on zlecenie.**

The contract control's two disabled slots come alive. Zlecenie has its own ZUS rules and,
for a student under 26, no ZUS at all — the biggest number this audience will see change.
Dzieło has no ZUS and no health contribution, and koszty uzyskania przychodu at 20% or
50%, where 50% turns on transfer of copyright and is capped annually.

The screen becomes **variant B**, chosen by the stakeholder from three rendered layouts:
the contract bar above everything, one card holding the amount and the Nie/Tak questions,
the answer directly below. The lede sentence is CUT — "to wiadomo" — not shortened, not
moved, never reintroduced under another name. theme-factory is closed: type as shipped.

Not in this slice: the brutto/netto toggle and its reverse calculation — slice 3, NOT
dropped. A new engine capability, not a label, with its own verification surface.

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

## In flight

Two phase gates before the tag: the security review, and the delta-chip probe.

## Blocked

The tag, until both gates report. Nothing else.

## Last verification result

Measured 2026-08-19, slice 2 cycle 4, the release check — **PASS**, nine criteria, Δ = 0
(visible 43/43, held-out 5/5), no open P0 or P1, two P2 in BACKLOG. Verbatim in
`.agent/LAST_CHECK.md`.

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

- 2026-08-18 22:48 — builder handed over df2b307..d75fe30. Port 5180 is the stakeholder's;
  every agent used 5181+.
- 2026-08-18 23:04 — check 1: 1 P1 + 3 P2, Δ 20; 23:11 fix 1 dee069f..bbd5899 closed all
  three, a red test each first. 23:28 check 2: new P1-E, the same false claim from a stale
  chip. 23:37 fix 2, the final attempt on that root cause: P1-E closed at c316bbe.
- 2026-08-18 23:55 — check 3: P1-E CLOSED, nine criteria PASS, Δ 0 (41/41, 5/5). New P1-F:
  §8's immediate announcement dropped for contract and copyright, 579/581 ms vs 79/85 ms.
- 2026-08-19 00:02 — P1-F fix 01389cd: the announce key names all four answers. Latencies
  11-25 ms, typing still 503.7 ms. playwright 14 -> 16.
- 2026-08-19 00:21 — release check PASS. Architecture gate: NO CHANGE, one deferral.
  Probe opened on the `Nie` delta chip above the relief's monthly limit — inferred from
  code, NOT measured.
- 2026-08-19 00:24 — security-gate, trigger USER-SUPPLIED INPUT: PASS, one P2 (no CSP, in
  BACKLOG). No innerHTML path, input bounded, storage holds only what was typed, the built
  artifact's nine requests are all same-origin, deps unchanged.
- 2026-08-19 00:26 — PROBE CONFIRMED, P1-J: the `Nie` delta chip prints the whole PIT advance as the
  relief worth, overstating it above ~10 319 zl/month — 37% at 20 000. Release BLOCKED,
  tag held. First cycle on this root cause.
