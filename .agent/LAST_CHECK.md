<!-- Overwritten every phase. The checker cannot write; this is its report, preserved. -->

# LAST CHECK — slice 2, cycle 4, the release check

Measured 2026-08-19 against `3ac5c90`, phase-start `1bbffef`, production build on :5181,
headless Chromium, PL and EN. STATE validated before use: every SHA it cites resolves
(`1bbffef`, `d6b943c`, `01389cd`, `44afef5`, `3ac5c90`), `v0.1.0` -> `f8fdf09`, and the
one-line change it claims is present at `src/components/Answer.tsx:47`.
`git status --porcelain` empty at start and end.

## VERDICT: PASS. P1-F CLOSED. Δ = 0. No open P0 or P1. Two P2, both deferred.

## P1-F — CLOSED, OBSERVED with the checker's own instrument

Instrument: an in-page capture-phase listener stamps `performance.now()`, a
`MutationObserver` on the `role="status"` node stamps the announcement; no CDP in the
interval. Second, independent instrument: Node-side 25 ms polling — the same method that
read 579/581 ms at cycle 3.

| control | in-page ms | 25 ms poll | utterances |
| --- | --- | --- | --- |
| contract -> Zlecenie / Dzieło / Etat | 14.3 / 14.9 / 13.3 | 58 / 57 / 57 | 1 each |
| copyright -> Tak / Nie | 11.6 / 12.6 | 61 / 74 | 1 each |
| under-26 -> Tak / Nie | 27.5 / 14.2 | 82 / 72 | 1 each |
| student -> Tak | 13.5 | 59 | 1 |
| EN: contract, under-26, copyright x2 | 13.0-15.2 | — | 1 each |

The same probe read 504.1 ms on the same page for typing, so it can produce a slow value;
it did not.

## The debounce and the utterance count

A 5-keystroke burst: **504.1 ms PL, 506.4 ms EN, one utterance each** — no keystroke is its
own utterance. Re-clicking the same contract or answer: **0 utterances**. Two different
answers 100 ms apart: 2 utterances, one per real change. Exactly one
`role="status" aria-live="polite" aria-atomic="true"` node in the tree; the visible numeral
is still `aria-hidden="true"`.

## Criteria re-verified in a real browser, and the chip

1. PASS. Three slots, three distinct nets (4 420,43 / 4 634,20 / 5 724,00), **0 page loads**
   across the clicks. Umowa o pracę compared against the v0.1.0 ARTIFACT built from the tag
   and served on :5182 — 16 inputs (8 amounts x under-26 on/off), 0 mismatches.
2. PASS. Student control on zlecenie only (1/0/0). Under 26 + student: 4 845,20 ->
   6 000,00, no emerytalna/rentowa/chorobowa/zdrowotna row and no such band segment; the
   `zusOff` row is the deliberate 0 zł explanatory row, not a charge; quote and link on page.
3. PASS. No ZUS or health row on dzieło. Control reads `Przenosisz prawa autorskie?` with
   no `50%` in the label; 20% -> 50% moves the net 5 724,00 -> 5 940,00; the cap prints
   `50% liczy się do 120 000,00 zł kosztów rocznie.` from `copyrightCostsAnnualCapGrosz`
   (12 000 000), consumed at `contract.ts:126`.
4. PASS. Under-26 moves the net on etat and zlecenie and not on dzieło; both languages say
   so on dzieło.
6. PASS. 8 rendered ladders (3 contracts x relief/student/20%/50%), struck pre-relief
   figures excluded: every one sums to exactly 6 000,00 zł.
7 and 8 spot-checked: 0 `⟦key⟧` markers and 0 stray Polish in EN once the verbatim source
quotes are excluded; bar 1088/1280 and 358/390 above the card, each contract's Nie/Tak
groups inside the amount `<section>`.

**The chip, unchanged from cycle 3:** ±291,00 zł (etat), ±211,00 zł (zlecenie),
±1 154,80 zł (student). Never on dzieło. Earned on etat then Dzieło clicked inside the dwell
-> none, re-read 900 ms later still none. Earned then amount changed to 20 000 -> none.

## Counts, Δ, mutation probe

- `npm test` -> **27 passed / 27 collected, 3 files**. `npx playwright test` -> **16 passed
  / 16 collected, chromium**. `npm run build` -> `tsc -b && vite build` clean, 53 modules,
  231.61 kB. Counts read off the runners.
- **Visible 43/43 = 100%. Held-out 5/5 = 100%. Δ = 0.** Held-out written from STATE's
  criteria (1, 2, 3, 4, 6) in a temp dir, run against the production build, deleted. Proven
  able to fail: against mutant M2 it scored 2/5, H2 failing on the exact symptom.
- Mutation M1, this slice's fix line: `const state` reverted to `${under26}/${student}` on a
  copy outside the repo -> the P1-F test FAILED at 514 ms against its 250 ms bound, and the
  debounce test correctly stayed green. M2: `answers.student &&` dropped from `isZusExempt`
  -> held-out H2 failed. Repo never mutated, porcelain empty, :5181/:5182/:5183 shut down,
  **:5180 never bound or killed and still HTTP 200**.

## P2 — deferred, nothing blocking

**P2-I, new.** Clear the amount, change an answer while the field is empty, then retype: the
first keystroke announces immediately, then the rest debounce — 2 utterances for one entry.
`announced.current` is not reset when the result goes null. Pre-existing for
under-26/student; the P1-F fix widens it to contract and copyright. No false figure.

**P2-G, carried, still reproduces.** `6 000 -> empty -> 20 000` with under-26 on prints
`+1 968,00 zł z ulgą dla młodych`, the relief's true worth at 20 000. Same root-cause family
as P2-I — a ref surviving a null result — so one fix closes both.

## Instruments discarded rather than reported — five would-be findings

A second `MutationObserver` installed by the checker's own probe, doubling every EN record;
reload arithmetic counting its own `goto` calls; a regex with an ASCII space where the page
renders U+00A0, making the 120 000,00 zł cap look absent; an EN "stray Polish" hit that was
the verbatim source quotes criterion 5 requires; an EN selector matching the Polish `Etat`.
One real behaviour re-checked and cleared: an amount above 1 000 000 zł clears the live
region, which is `parseGross`'s range-error path with its own on-screen message.

## PROBE after the release check — P1-J, CONFIRMED. The release is BLOCKED.

Raised by the orchestrator at the architecture gate as an INFERENCE FROM CODE, handed to a
checker as a question, and measured 2026-08-19 in Chromium against the production build.
The chip text is read from `[data-testid="delta-chip"]` after a 250 ms settle; the first
probe without the wait read a stale chip, which is why the settle is in the measurement.

**P1-J — the `Nie` delta chip prints the whole PIT advance as what the under-26 relief
would be worth, so it OVERSTATES the relief above the relief's monthly limit.** OBSERVED:

| gross, uop | `Tak` chip | `Nie` chip | overstatement |
| --- | --- | --- | --- |
| 6 000 | +291,00 | −291,00 | 0 |
| 10 318 | +738,00 | −738,00 | 0 |
| 10 320 | +738,00 | −739,00 | 1,00 |
| 12 000 | +759,00 | −934,00 | 175,00 |
| 20 000 | +1 968,00 | −3 143,00 | 1 175,00 |

Zlecenie has the same shape: 12 000 -> +607,00 vs −722,00; 20 000 -> +1 446,00 vs
−2 243,00. English identical: `−934.00 zł without the under-26 relief`, `−3,143.00 zł`.

**Hand arithmetic, uop 12 000 zł, from `rates-2026.ts` only.** ZUS 9,76+1,5+2,45% =
1 645,20. Monthly relief limit `divRoundHalfUp(8 552 800, 12)` = 712 733 gr = 7 127,33 zł.
Without relief: base = round-to-zloty(12 000 − 1 645,20 − 250) = 10 105,00; 12% on 10 000
plus 32% on 105 minus 300 = **934,00**. With relief: taxed 4 872,67, proportional ZUS
668,04, base 3 955,00, 12% minus 300 = 175,00, so the relief is worth **759,00**. Every
figure reproduces the screen exactly, so the `Tak` chip is the truth and the `Nie` chip
prints the whole advance.

**Cause, OBSERVED in source.** `src/engine/contract.ts:248` —
`const pitWithoutRelief = reliefApplies ? pitAdvance(gross, zus, 0, costs, rates) : pit;`
With `under26 = false`, `reliefApplies` is false, so `pitWithoutReliefGrosz` is the whole
advance, and `src/components/Answer.tsx:97` prints it as the relief's worth. The comment at
:94-96 anticipates exactly this for off-list contracts, but not for the annual-limit case.

**Grade P1.** Divergence begins at about 10 319 zł/month on uop (10 318 identical, 10 320
differs: above the 7 127,33 zł limit the exempt share still absorbs all tax until the
residual base clears the kwota zmniejszająca), and it grows without bound — 37% at 20 000
zł. Only the `Nie` chip is wrong: net figures, the `Tak` chip and the live region are
correct. Bounded fix: the `Nie` branch needs the counterfactual, `core` run with
`under26: true`, the way `studentWorthGrosz` is already computed at `contract.ts:314-320`.

**Why four checker cycles missed it:** every observed figure was at 6 000 zł, below the
relief's monthly limit, where the whole advance and the relief's worth coincide exactly.
