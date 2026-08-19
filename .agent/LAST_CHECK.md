<!-- Overwritten every phase. The checker cannot write; this is the orchestrator's transcript of its report. -->

# LAST CHECK — slice 4, input units

**Received and written 2026-08-19 19:0x.** Checked at HEAD `944a4b6`, builder's work at
`64695d0` (test:) and `bc0a757` (feat:), phase-start `2732083`.

## VERDICT — PASS · Δ = 0 · three P2 · no P0, no P1

Visible suite re-run fresh and COLLECTED re-derived by the checker: **Vitest 39/39,
Playwright 29/29 = 68/68.** Held-out **5/5**. Δ = 0. Twelve new tests for eleven criteria,
inside the tdd cap; the twelfth is criterion 4's own words, not a speculative guard.

## Criterion 5 — re-derived with a STRONGER instrument than the builder's

The builder compared against a frozen `e2e/v030-screens.ts`. The checker instead extracted
`v0.3.0` with `git archive` (no worktree, no repo mutation), served it on 5182 and HEAD on
5181, and compared **27 live screen pairs** — 3 contracts × 9 cases — reading
`net / from / band / ladder / caption / total / sticky` out of BOTH browsers at 320×568.
**Zero differing** below and at the 23 550,00 zł crossing, in all four units. Live-vs-live
agrees with the frozen fixture, which is what makes the fixture trustworthy.

Above the crossing uop and zlecenie diverge — criterion 6 REQUIRES that — and dzieło does
not, because it has no ZUS. The checker's probe printed "CEILING-NOT-BITING" there and
recorded it as **its own expectation being wrong, not the app's behaviour.**

## Criterion 6 — the citation confirmed at source, not taken from the builder

`curl` to the cited ZUS page returned **HTTP 200** and the line verbatim:
`282 600,00 zł ​​​- kwota rocznego ograniczenia podstawy w 2026 r. (MP 2025.1206)`.
Shipped `value: 28_260_000` = 282 600,00 zł = **23 550,00 zł/month exactly**; quote, URL,
title and `effective: '2026-01-01'` all match the year data file. Grep of `src/` finds **no
ceiling literal outside `rates-2026.ts`** and no hours-per-month constant anywhere
(criterion 4). On screen the note fires at 23 550,01 and NOT at 23 550,00, and the why-line
prints `9,76% od 23 550,00 zł` with no new key.

## Driven in Chromium, not read off the diff

- 35 zł/h @ 40 → `6 066,67`; 1 000 zł/tydz. → `4 333,33`; 90 000 zł/rok → `7 500,00`.
- Conversion line prints `40 godz. tygodniowo × 52 tyg. ÷ 12 miesięcy.` — `× 52` and `÷ 12`,
  never `173,33`. `aria-describedby` = `amount-conv gross-error`, conversion first.
- Focus ring on `#unit` after a real Tab: `rgb(43, 33, 28)` = `--ink`, **3px**, matching
  `:focus-visible` — not UA blue. Targets 96×54 / 72×44 / 248×44.
- Geometry matches DESIGN-SLICE-4 §1 to the pixel: card 282 (= `v0.3.0`) / 309 / 309 / 361;
  select 96×54; amount 130 / 163 / 193 at 320 / 360 / 390. No `scrollWidth` overflow in 24
  width × unit × language combinations.
- Quick-fill by a real mouse click from netto + year sets all three: gross, unit, direction.
- The round trip closes to the grosz across 4 units × 3 contracts × both sides of the
  crossing, in the checker's own held-out suite.

## Both of the builder's self-reported instrument defects — checked, both hold

`installLiveProbe` now disconnects before reinstalling. The checker installed its OWN
observer once, reading raw MutationRecords with **no dedupe**, and recorded **exactly one**
record 35 ms after a unit change and nothing at 1400 ms; the amount debounces to 532 ms and
hours to 527 ms. **No real double announcement is hiding behind the artefact fix.**

The v0.1.0 uop baseline move at 99 999,99 zł/month was re-derived by hand end to end —
capped 229 848 / 35 325, uncapped chorobowa 245 000, zdrowotna base rising to 9 489 826,
PIT advance 25 823 zł, net 6 053 442. It is the ceiling, not drift. Only **two** existing
expectations changed in the whole diff, both mandated by criteria 6 and 9.

## Mutation probes — two run, both caught

The checker has no edit tool, so probes were applied with a `python3` replace guarded by
`assert count == 1` — fails loudly on a non-match — and reverted with `git checkout --`.

1. `Math.min(gross, ceilingMonthly)` → `gross` at `src/engine/contract.ts:245` — CAUGHT by
   the ceiling test and by the v0.1.0 baseline test.
2. `tenths <= 0` → `tenths < 0` at `src/state/units.ts:66` — CAUGHT by the conversion test.

Restored; `git status --porcelain` empty afterwards, HEAD still `944a4b6`, suite green.
Ports 5181/5182 released; **5180 and 5184 never bound.** The held-out suite ran in a
`mktemp -d` outside the repo and is discarded.

## Findings — three P2, all in BACKLOG

- **P2-A — three project records contradicted the shipped tree.** STATE still said "the
  builder has not started"; P2-4 still named one element where two now deviate; P2-S3 still
  said `#gross` has no `maxLength` where `maxlength="12"` is in the DOM. **All three were
  the orchestrator's own drift and all three are now corrected.**
- **P2-B — the echo's contrast is 6.34:1, not the 7.2:1 the spec asserts.** Not slice 4's:
  the eyebrow and from-line measure the identical 6.34:1 on `v0.3.0`. AA passes, AAA fails.
- **P2-C — `error.range` prints two full stops in PL**, confirmed in the live DOM; EN is
  clean. Spec-literal, so shipping it was right. Plus two untested paths the checker also
  confirms: `parseGross`'s `maxGrosz`, and the `hoursError → POSITIVE_INFINITY` cap.
