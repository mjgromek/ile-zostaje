<!-- Overwritten every phase. The checker cannot write; this is its report, preserved. -->

# LAST CHECK — slice 2, cycle 2 (re-check after fix cycle 1)

Measured 2026-08-18, commits `af498a3..077ba74`, fix cycle `dee069f..bbd5899`, phase-start
`1bbffef`. Cycle 1's report is superseded; its three findings are resolved below.

## VERDICT: FINDINGS — 1 x P1 (P1-E), 1 x P2 (Δ = 20, caused by P1-E alone)

Criteria 1, 2, 3, 6, 7, 8 re-verified and met. Criterion 4 is still contradicted on screen,
by a second path. STATE.md validated first: all 9 cited SHAs resolve, `v0.1.0` -> `f8fdf09`.

## Cycle 1's three findings

**P1-A — PARTIALLY CLOSED.** OBSERVED, production build on :5181, both languages: on
dzieło, `Tak`/`Nie`/`Tak` on under-26 produces no chip at all (count 0 each time), net holds
5 724,00 and `subst.relief.dzielo` renders in the active language. No over-correction: the
chip is still truthful on etat (±291,00) and zlecenie (±211,00) in PL and EN, and the
student chip on zlecenie (±1 154,80) still fires. Still reachable by a second path — P1-E.

**P2-B — CLOSED.** OBSERVED on the EN screen: the ladder chip reads
`Under-26 relief — 0 zł`. The allowlist is not decorative: mutating EN `total.from` to the
PL value on a copy outside the repo made `no English string is its Polish original` FAIL.
Known limit, not graded: it catches an EN value identical to its PL original, so a Polish EN
string that differs from the PL table would still pass. A full EN body scan found none
beyond `Zlecenie`, `Dzieło` and `zł`.

**P2-C — CLOSED.** OBSERVED against both live pages fetched today (HTTP 200, ~985 kB): both
quotes are byte-exact including the trailing comma. The frozen `PAGE_TEXT` fixture was NOT
edited to accommodate the fix, and reverting the comma to a full stop fails the verbatim
test.

## Open finding

**P1-E — the delta chip is never cleared when an input other than the two answers changes,
so the false claim P1-A named still reaches the dzieło screen.** OBSERVED, real browser,
screenshot `/private/tmp/checker-kADRIz/carry-dzielo.png`: answer under-26 on etat, then
click Dzieło within the chip's 6 s life, and the dzieło screen shows
`+291,00 zł z ulgą dla młodych` two blocks above `Ulga dla młodych nie obejmuje umowy o
dzieło`. Same in EN (`−291,00 zł`). The student chip `+1 154,80 zł, bo studiujesz` reaches
dzieło the same way, which has no student control at all. Wider than contracts: typing
6000 -> 20000 leaves `+291,00 zł` up while the relief is worth a different amount at 20 000.
Root cause `src/components/Answer.tsx:113` plus the effect's `[under26, student]` deps —
`setDelta(null)` only ever fires on the 6 s timeout. Aim: clear `delta` whenever `result`
changes for any reason other than the two answers.

**P2 — Δ = 20 points.** Above zero, and P1-E is its only cause.

## Criteria re-verified — the six the touched files could break

1. PASS. 1 602 uop cases (0..40 000 zł step 50 x under26) run against `v0.1.0`'s OWN
   `uop.ts` and its own `rates-2026.ts`: net, every line's amount/base/remainder,
   `pitWithoutRelief`, `reliefWorth` — 0 mismatches. Signatures checked before comparing
   and a control proved the comparator can fail. Three slots selectable, no reload.
2. PASS. Zlecenie student: net 4 845,20 -> 6 000,00, ladder 4 rows -> 2, band paints 0 px
   of ZUS, the `uczniem lub studentem` quote is on the page.
3. PASS. Dzieło ladder has no emerytalna/rentowa/chorobowa/zdrowotna row; 20% -> 50% only
   via `Przenosisz prawa autorskie?`; 5 724,00 -> 5 940,00; cap `120 000,00 zł` and the
   creative-work condition on screen.
6. PASS. 9 rendered states, effective amounts added off the page (struck pre-relief figures
   excluded): every one sums to exactly 6 000,00 zł.
7. PASS. Key parity and the new allowlist green; the EN screen carries no untranslated
   Polish.
8. PASS. Variant B intact: bar full width above everything (1088/1280, 288/320, 358/390),
   amount + Nie/Tak in one card, no overlap, no lede. The desktop two-column is the spec's
   own.

## Counts, Δ, mutation probe

- `npm test` -> 27 passed, 3 files. `npx playwright test` -> 12 passed, chromium.
  `npm run build` -> `tsc -b && vite build` clean, 53 modules, 231.54 kB.
- Visible 39/39 = 100%. Held-out 4/5 = 80%, written from STATE's criteria in a temp dir
  outside the repo, run against the production build: C1, C2, C3, C6 PASS; **C4 FAIL** —
  path A (answer on dzieło) passes in both languages, path B (answer on a covered contract,
  then switch) fails on `−291,00 zł bez ulgi dla młodych`. **Δ = 20 points.**
- Mutation probe on a copy outside the repo, 3 mutations, 3 caught: dropping
  `&& reliefCovers` in `Answer.tsx` failed the new e2e case (11 passed, 1 failed); the
  chorobowa comma -> full stop failed the verbatim-quote test; EN `total.from` -> the PL
  value failed the allowlist test. Repo never mutated, `git status --porcelain` empty,
  :5181 shut down, :5180 untouched and still HTTP 200.
- tdd cap: the fix cycle added exactly 2 tests, each bound to a graded finding and named in
  its commit. Within cap.

## Instruments the checker discarded rather than reported — five would-be findings

`band-zusOff` in the DOM read as "a ZUS line survived" when it renders at 0 px and the spec
mandates that row; `/120 000,00 zł/` written with an ordinary space against the page's
non-breaking space; a C4 failure message calling `innerText()` unconditionally, so a genuine
PASS timed out and read as FAIL; the ladder sum reading the struck pre-relief figure; and
bounding-box y-ordering reading the spec's two-column desktop as "answer not directly
below". A sixth survived re-measurement and became P1-E.
