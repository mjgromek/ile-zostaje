<!-- Overwritten each phase. Persisted verbatim from the checker, which has no write access. -->

# LAST_CHECK — slice 1, run 4, re-verification after fix cycle 1, 2026-08-09

**VERDICT: PASS on all eight acceptance criteria. No open P0 and no open P1.** Δ = 0 points
(visible 16/16 = 100 %, held-out 5/5 = 100 %). P1-1, P2-2 and P2-3 are CLOSED, each confirmed
by driving the artifact, not by reading the diff. Three P2 deferrals remain, all graded below.
No live deployment exists in slice 1, so the held-out suite ran locally only. **This is a PASS
with no open P0 or P1: the slice works, and a version tag asserting that is warranted.**

Tools that did not arrive for the checker: `Grep`, `Glob` (used Bash `grep`/`find`, R4-F1),
and `Edit`/`Write`/`Task` — the two temporary file mutations used a `python3` heredoc that
asserts the pattern matches exactly once, restored from a `cp` backup and confirmed by
`shasum`.

## Test count — verified by the checker, not accepted

`vitest run` -> 9 (2 files), `playwright test --list` -> 7, **16 COLLECTED**, matching the
builder's report exactly. All 16 map to a named criterion or a named DESIGN-SLICE-1 element
(the 3 new ones: §6 tap targets, criterion 4's quote invariant, criterion 4+5's provenance
labels). Zero unnamed implied guards. Within `tdd`'s cap; not a finding. Note, ungraded:
`.agent/STATE.md` still reads "13 tests are committed"; the orchestrator overwrites it next.

## Fix-by-fix confirmation

- **P1-1 CLOSED.** Row-by-row real `mouse.click` scan at 390x844, one click per CSS pixel:
  gross row 56 px, **55 of 56 rows focus `#gross`**; quick chip 151x44, **44/44 fill 4 806**;
  summary 358x44.3, **44/44 toggle** (also 44/44 at 1280); lang button 48x44, **44/44 switch**;
  switch row 48 px, **48/48 toggle**; segmented button 105x44. My first summary reading said
  0/44 — the element was below the fold and unscrolled; that was my instrument, corrected.
- **P2-2 CLOSED.** Re-fetched all four cited pages and substring-matched the de-tagged text:
  `pit.threshold` (new PIT_SCALE sentence), `pit.rate1`, `pit.rate2`, `pit.reducingYear` are
  **exact**; `chorobowa` and `emerytalna` verified verbatim too (see P2-5 for the one mark).
- **P2-3 CLOSED.** Read the rendered `<details>` in both languages: **12 entries, 12 distinct
  and accurate labels in PL and 12 in EN**, no missing or untranslated key. `250,00 zł` now
  reads *Koszty uzyskania przychodu (miesięcznie)* / *Deductible costs (monthly)*.

## Criteria re-checked in a real browser

- **C2, arithmetic from the rendered page** (struck original excluded): exact to the grosz at
  6 000, 4 806, 3 333,33, 19 999,99, 25 000 and 8 543,21 (833,82+128,15+209,31+663,47+555,00
  +6 153,46 = 854 321 grosz).
- **C1** one net figure, rises with the amount, zero main-frame navigations. **C3** from the
  rendered output only, never a Chrome a11y snapshot: net 4 420,43 -> 4 711,43, PIT line shows
  `0 zł` with the struck original beside it, and net delta = |PIT|, both states seen, restored
  on toggle back. **C5/C6** both languages whole, estimate and storage lines present, no
  placeholder or missing key. **C7** value, switch and net survive reload; zero foreign
  requests. **C4** unchanged: no `value:` line moved in this cycle, only quotes and sources.
- Regression: no earlier slice exists to break. Geographic rules do not apply — no map.

## Mutation probe

`src/components/GrossCard.module.css:40`, a line this fix cycle added: `align-self: stretch`
-> `align-self: center` (local only). **Caught by `e2e/app.spec.ts:136` "P1-1 — every control
takes a click across the 44 px the spec promises"** at line 150, field height 24 not 44.
Restored from backup, `shasum` identical, suite green again (9 vitest, 7 Playwright), and
`git status --porcelain` back to its baseline: 4 modified, `.agent/LAST_CHECK.md` untracked.

## Findings

**P2-4 — the gross field's focus ring is `outline-offset: -3px` where §6 says `2px`.**
Measured by computed style on every Tab stop plus a screenshot of the focused row: the other
six stops are `3px solid rgb(43,33,28) offset 2px`; `#gross` alone is `-3px`. No ancestor has
`overflow: hidden`, and the screenshot shows a full, unclipped 3 px ink ring inside the field,
so the constraint's purpose is met and only its placement differs. Urgent when: theme-factory
revisits focus in slice 2, or a second inset ring makes the inconsistency visible side by side.

**P2-5 — two quotes end with `.` where the page prints `,`.** `rentowa` and `chorobowa` are
list items ending in a comma on zus.pl; the app renders them as sentences. Measured by exact
substring search over the raw HTML of both live pages. **Correction to the brief's premise:
`emerytalna` is not affected** — the page prints "…podstawy wymiaru składek)." with a period;
my earlier mismatch was a space my tag-stripper inserted. Urgent when: anyone diffs quotes
character-for-character against the source, which the builder's new test deliberately does not.

**P2-6 — `pit.costs`' quote truncates a qualifying clause and changes what it claims.** The
page prints "…nie więcej niż: 3000 zł - w przypadku uzyskiwania przychodów z jednego stosunku
pracy, 4500 zł - …"; the app prints "…nie więcej niż: 3000 zł." Measured against the live
page's raw HTML. The cited value (250 zł/month) is correct and unaffected, but the displayed
evidence states a conditional annual cap as absolute. Urgent when: a user with two employers
reads the disclosure, or a later slice uses the annual cap.
