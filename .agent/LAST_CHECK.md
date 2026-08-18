<!-- Overwritten every phase. The checker cannot write; this is its report, preserved. -->

# LAST CHECK — slice 2, cycle 1

Measured 2026-08-18, commits `df2b307..af498a3`, phase-start `1bbffef`.

## VERDICT: FINDINGS — 1 x P1, 3 x P2

Criteria 1, 2, 3, 5, 6, 7, 8, 9 met. Criterion 4 met in the engine and contradicted on
screen. STATE.md validated first: all 9 cited SHAs resolve, `v0.1.0` -> `f8fdf09`.

## Criterion by criterion, as reported

1. PASS, OBSERVED. Three slots selectable, recompute with no reload. Regression against the
   tag itself: 602 uop cases (gross 0..400 000 zl x under26) — line amounts, bases and net
   identical to `v0.1.0`, 0 mismatches.
2. PASS, OBSERVED at 390 px. Student question only on zlecenie; `Nie`->`Tak` collapses the
   band from `Na konto 80,8%` (5 segments) to `100,0%` (1), four ZUS/health rows to a single
   `Skladki ZUS · 0 zl`, net 4 845,20 -> 6 000,00 zl. Exemption quote cited on the page.
3. PASS, OBSERVED. Dzielo renders zero ZUS/health rows. 50% is reached through
   `Przenosisz prawa autorskie?`; the rate appears only as a consequence, with the cap and
   the creative-work condition. Cap reads `120 000,00 zl` from data.
4. MET IN DATA, CONTRADICTED ON SCREEN. `youthRelief.contracts.value` is data, the note
   fires in PL and EN and never on uop/zlecenie. See P1-A.
5. PASS, OBSERVED. All 20 citations fetched live: 20/20 quotes genuinely printed on their
   page, each with URL, effective date, `verified: 2026-08-18`. The 50% cap is its own entry
   with its own quote and source, not an alias of `pit.thresholdAnnualGrosz`. P2-6 fixed.
6. PASS, OBSERVED by adding the rendered numbers. 8 states at gross 6 000: every one sums
   deductions + net to exactly 6 000,00 zl.
7. PASS for new strings. 82 keys in both tables, none missing, none empty, interpolation
   slots match. Only `Zlecenie`/`Dzielo` untranslated among new strings. See P2-B.
8. PASS, OBSERVED at 390/1280/320. Bar fully above the card, amount + Nie/Tak in one card,
   answer directly below, order answer->band->ladder, no overlap, no lede in either language.
9. PASS. 14 hand-computed cases per contract and relief state, arithmetic written out and
   source named; Playwright drives Chromium for criteria 1, 2, 3, 4.

## Findings

**P1-A — the delta chip claims the under-26 relief is worth money on umowa o dzielo, which
it does not cover.** OBSERVED, driven from a fresh load in both languages; screenshots
`repro-dzielo-PL.png` / `repro-dzielo-EN.png` in the session scratchpad. On dzielo, toggling
under-26 to `Nie` renders `-276,00 zl bez ulgi dla mlodych` while the net is identical in
both states (5 724,00 zl) and the outlined note two blocks below says the relief does not
cover dzielo. Control: the same toggle on uop moves the net 4 711,43 -> 4 420,43, so the
chip is truthful there and the instrument distinguishes the two. Root cause
`src/components/Answer.tsx:78-82` — the branch has no `reliefCovers` guard and uses
`pitWithoutRelief`, which `computeContract` sets equal to the whole PIT advance when the
relief does not apply. Exactly the failure criterion 4 exists to catch; the visible e2e test
for criterion 4 passes because it asserts the note and never the chip.

**P2-B — `why.relief.chip` renders Polish in the EN build.** OBSERVED on screen: EN shows
`Ulga dla mlodych — 0 zl`. Carried unchanged from `v0.1.0`, outside criterion 7's "every new
string". Urgent when: any slice touches EN copy, or an English speaker sees the under-26
state.

**P2-C — two slice-1 quotes normalise the page's punctuation.** `contributions.rentowa` and
`contributions.chorobowa` end with a full stop where the page prints a comma; both are list
items. Words, values and rates verbatim. Measured by punctuation-insensitive matching
against the live HTML, which separates this from an absent quote. This is slice 1's P2-5,
resurfaced by criterion 5's re-verification requirement.

**P2-D — delta 20 points.** Above zero, and caused by P1-A alone.

## Counts and delta

- `npm test` -> `vitest run`: 26 passed, 3 files. `npx playwright test`: 11 passed, chromium.
  `npm run build`: `tsc -b && vite build` clean, 53 modules.
- Visible 37/37 = 100%. Held-out 4/5 = 80%, one test per criterion written from STATE's
  criteria and run in a temp dir outside the repo: C1, C2, C3, C6 PASS, **C4 FAIL** (P1-A).
  **Delta = 20 points.**
- Held-out engine arithmetic hand-computed from the cited pages: 15/15, including dzielo
  4 000 @20% = 3 916,00, @50% = 4 000,00, 30 000 @50% capped = 25 900,00, zlecenie 4 000 =
  3 189,14, and the student delta 769,86 zl — independently reproducing DESIGN-SLICE-2 §2.

## Mutation probe

Run on a copy outside the repository. Five mutations to `src/engine/contract.ts`, all five
caught: dropping the `answers.student &&` guard in `isZusExempt` (3 failures); 50%->20% KUP
(3, incl. the cap-from-its-own-entry test); removing the annual cap from `Math.min` (2);
`reliefCovers = true` (caught by the relief-list test); charging chorobowa on zlecenie (5).
Baseline restored, repo clean.

## Instruments the checker corrected before trusting them

Four of its own measurements were wrong and are NOT findings: calling `computeUop` with an
object where `v0.1.0` takes a boolean (274 false mismatches); a money regex reading
`4,420.43` as `4.42`; reading a collapsed `<details>` with `innerText`; grepping `const PL`
where the tables are `pl`/`en`, which reported all 82 strings identical while the EN screen
was plainly English.
