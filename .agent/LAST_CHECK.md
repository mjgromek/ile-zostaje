<!-- Overwritten per phase. The checker cannot write; this is its report, verbatim in
substance, written by the orchestrator on receipt, BEFORE anything else. -->

# LAST CHECK — slice 2, P1-J fix cycle 1, at cb189dc

Measured 2026-08-19 14:54 by the checker in Chromium against the production build on
:5181. The stakeholder's :5180 was never bound and never killed; verified still HTTP 200.

## VERDICT: PASS. P1-J CLOSED. Δ = 0. No open P0 or P1. One new P2.

Nine criteria hold in the browser. Visible 45/45, held-out 5/5, Δ = 0. The held-out five
were written from STATE criteria 1, 2, 3, 4 and 6 in a `mktemp -d` outside the repo, run
against the production build and discarded; proven able to fail — against mutant M3 they
scored 4/5, H2 failing on the exact symptom.

STATE validated before use: all 14 SHAs it cites resolve, `v0.1.0` -> `f8fdf09`, and the
change it claims is present at `src/engine/contract.ts:322-336` and
`src/components/Answer.tsx:94-101`.

## P1-J — CLOSED. The chip, measured with a 320 ms settle

| lang / contract | 6 000 | 10 318 | 12 000 | 20 000 |
| --- | --- | --- | --- | --- |
| PL uop Tak / Nie | +291,00 / −291,00 | +738,00 / −738,00 | +759,00 / −759,00 | +1 968,00 / −1 968,00 |
| PL zlecenie Tak / Nie | +211,00 / −211,00 | +579,00 / −579,00 | +607,00 / −607,00 | +1 446,00 / −1 446,00 |
| EN uop Tak / Nie | +291.00 / −291.00 | +738.00 / −738.00 | +759.00 / −759.00 | +1,968.00 / −1,968.00 |
| EN zlecenie Tak / Nie | +211.00 / −211.00 | +579.00 / −579.00 | +607.00 / −607.00 | +1,446.00 / −1,446.00 |
| PL+EN dzieło, both sides | no chip | no chip | no chip | no chip |

**Instrument check.** The identical probe pointed at a `1fde72d` build read `−934,00`,
`−3 143,00`, `−722,00`, `−2 243,00` in the same four cells: it CAN produce the failing
value and did not against HEAD. Cross-check: the chip now equals the measured net
difference to the grosz in all 16 cells — uop 12 000, 9 247,87 − 8 488,87 = 759,00,
matching the hand arithmetic of the previous cycle.

## Nothing else moved — 24 states x 11 page fields, pre-fix build vs HEAD

`takChip`, `takNet`, `nieNet`, `takLive`, `nieLive`, `takTotal`, `nieTotal`, every ladder
row and the cleared state after an amount change: all byte-identical. The ONLY delta is
`nieChip`, at exactly the four amounts above the 7 127,33 zł monthly limit. The live region
on the `Tak` side still reads 759,00 at uop 12 000. `Ladder.tsx`'s `pitWithoutReliefGrosz`
still prints the struck 934,00 / 3 143,00 with under-26 on above the limit.

## The nine criteria — all hold

1. PASS — three distinct nets (4 420,43 / 4 634,20 / 5 724,00), 0 page loads; uop compared
   against the v0.1.0 artifact built from the tag on :5182, 16 states, 0 mismatches in net,
   ladder total and every ladder line.
2. PASS — student control on zlecenie only; under-26 + student 4 845,20 -> 6 000,00, three
   ZUS rows -> none, source quoted on the page.
3. PASS — dzieło has only a `pit` row, the control label carries no bare `%`, 20% -> 50%
   moves 5 724,00 -> 5 940,00, the cap prints from the data file.
4. PASS — the relief moves the net on uop (+291) and zlecenie (+1 365,80 with student on),
   0 on dzieło, with the substitution note shown in PL and EN.
5. PASS, carried — `rates-2026.ts` byte-identical to `3ac5c90` where the URLs were
   re-fetched; 20 valued entries, 0 missing source, effective date or quote. **The official
   URLs were NOT re-fetched this cycle**; nothing in the data file moved.
6. PASS — ten ladders sum to exactly 6 000,00 zł.
7. PASS — 0 `⟦key⟧` markers across three contracts x two languages.
8. PASS — the bar at 104-166 above the card at 190 at both 1280x900 and 390x844, PL and EN;
   the gross input and the under-26 radiogroup share one `<section>`; the answer follows in
   DOM order, 442 under the card's 418 on a phone; the lede is absent in both languages.
9. PASS — 17 Playwright tests drive a real browser for criteria 1, 2, 3 and 4.

## Runners, read directly

`npm test` 28 passed / 28 collected, 3 files. `npx playwright test` 17 passed / 17
collected. `npm run build` clean, 53 modules, 231.63 kB. Matches the builder's claim.

**The new tests are genuinely red at `1fde72d`** — verified in a temp tree from `git
archive 1fde72d` carrying only the two test files from `9ae3b38`. Vitest: `uop 6000,
answered Nie: expected +0 to be 29100`. Playwright: `unexpected value "−934,00 zł bez ulgi
dla młodych"`, the exact P1-J symptom. **M1**, the fix's own line — `under26: true` ->
`false` on a copy outside the repo — failed BOTH new cases. The repo was never mutated.

## P2-K — NEW, deferred to BACKLOG. The chip's zero-guard is untested

MEASURED, not inferred. M4 (`reliefWorth > 0` -> `>= 0` at `Answer.tsx:97`, the line this
fix rewrote) survived the whole suite green and is behaviour-bearing: on the mutant build
uop 3 000 zł prints `+0,00 zł z ulgą dla młodych`; HEAD correctly shows no chip.

## Discarded rather than reported

**M2** (`: result.reliefCovers` -> `: true`) survived but is an EQUIVALENT mutant:
`contract.ts:248` sets `pitWithoutRelief = pit` whenever the relief does not apply, so the
off-list difference is 0 either way — redundant defence, not behaviour. A criterion-8 probe
first reported `card: null`; that was the checker's own selector
(`[data-testid="consequences"]` is absent with no consequence lines), re-measured against
the section that owns the gross input.

## Carried, neither blocks the tag

**P2-G** still reproduces; note the fix makes its figure the relief's TRUE worth at 20 000,
so the stale chip is now stale-but-arithmetically-true — the defect is the ref surviving a
null result, not the number. **P2-I**, same root-cause family, one fix closes both.
