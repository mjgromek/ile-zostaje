<!-- Overwritten every phase. The checker cannot write; this is the orchestrator's transcript of its report. -->

# LAST CHECK — slice 4b, the card's first impression

**Received and written 2026-08-19.** Checked at HEAD `4e213c1`, builder's work at `3f77ddc`
(test:) and `8cc7149` (feat:), phase-start `589ea02`.

## VERDICT — PASS · Δ = 0 · three P2 · no P0, no P1

**Vitest 40/40, Playwright 37/37 = 77/77.** Held-out 5/5. Δ = 0. COLLECTED re-derived from
source rather than from the builder's report: 37 `test(` at line start in `e2e/app.spec.ts`;
Vitest 40 = 26 top-level plus 14 from `contract.test.ts`'s parameterised block. Nine new
tests, all nine mapping to a named criterion. `npm run build` clean. Every SHA in
`.agent/STATE.md` resolves, and `v0.4.0^{}` == `b7e726c`.

## Driven in the artifact

- **C1 ARIA, read off Chromium's own AX engine**, four states, both languages: names exactly
  `Kierunek przeliczenia: brutto netto` / `netto brutto` and the EN twins, `role: button`,
  and **zero `pressed` / `checked` properties in any state**. `Space` and `Enter` both flip.
  The radiogroup and both segments are gone from the DOM; the two surviving `s.active` uses
  are ContractBar and Question.
- **C5's load-bearing half holds.** No record → `5000` and `3 738,19 zł`; `gross: ""` →
  **field EMPTY**, and the rest of that record (`n2g`, `week`) still loads; unparseable →
  empty and still empty on a second reload; first run → clear → reload → **still empty**.
- **C9.** A `__mark` property set on the live `<p>` object survived all six triggers — the
  node is never replaced. Zero `position: sticky` elements inside or under `.swap` at 1280
  and 390. **The instrument was checked, not assumed:** a sticky element does exist at 1280
  and the phone mini-bar is sticky after a scroll, so the assertion is not vacuous.
- **The sibling-key defect the builder found, re-driven.** Six consecutive swaps, counting
  the DOM each time: `band:1, ladder:1, answer-swap:1, net-amount:1, live:1` every time.
  The three-band leak is gone.
- **C7/C8.** An `animationstart` capture listener fires on direction and contract and stays
  silent on a typed digit, a unit change, an under-26 flip and a language switch. Under
  `reducedMotion: 'reduce'` no animation fires on any of the six, and the live region is
  still populated.
- **C3/C4.** Real mouse click from `netto` + `year` + `90000` → `4806` / `month` / `g2n` /
  `3 605,85 zł`. Card at 320 EN: **`scrollWidth` 286 / `clientWidth` 286**, against
  `v0.4.0`'s 299/286.
- **C2.** Twelve `setDirection` call sites; the only bare `.click()`s are three
  toggle-as-toggle uses where no specific direction is intended. The six `aria-checked`
  lines for contract, questions and language are byte-identical to `589ea02`.
- **Regression vs `v0.4.0`.** Same amount on both trees, all three contracts, net plus every
  ladder cell plus band segment widths: `Etat 4420,43`, `Zlecenie 4634,20`,
  `Dzieło 5724,00` — identical.

## Criterion 10 — the checker verified the CLAIM, not just the fix

It extracted `v0.4.0` with `git archive` and served it: at `v0.4.0` the figure reads
`8 317,21 zł` while the live region says `Na konto: 6 000,00 zł miesięcznie.` **The defect
reproduces at the released tag.** At HEAD the region says `Kwota na umowie: 8 317,21 zł
miesięcznie.` It is a fix, and now three independent confirmations say the defect predates
this slice.

## Mutation probes — two run, both caught, one revealingly

1. `Answer.tsx`: `direction === 'n2g'` → `'g2n'` in the live headline. **Caught** by criteria
   10 and 9 — and **Vitest stayed 40/40 green**, which is slice 4's P2-2 reproducing exactly.
2. `App.tsx`: dropped the `band-`/`ladder-` key prefixes, reinstating the leak. **Caught,
   but by nothing that names it** — see P2-A.

## The builder's two replaced instruments — both sound

`getComputedStyle` reports `1px` for a specified `1.5px` border at DPR 1, 2 AND 3, while
CSSOM `rule.style.border` returns `1.5px`. The builder's claim holds, and comparing the chip
to the toggle with one instrument is a stronger assertion than a number. The
`animationstart` listener replacing the 20 ms `playState` sample has a positive control: the
same listener fires on the two triggers that should and is silent on the four that should
not, in the same run.

## Findings — three P2, all in BACKLOG

- **P2-A** — the sibling-key fix has no test that names it. The suite goes red when the fix
  is removed, but on four unrelated older assertions, so this is diagnosability rather than
  absent coverage.
- **P2-B** — `STATE.md` said "In flight: Builder" while `PROGRESS.md` said "NOW: checker".
  Two orchestrator-owned records, one stale by a step. **The orchestrator's own drift again,
  and corrected again.** Urgent when any instance resumes from state rather than transcript
  — the failure mode that already cost slice 4 an interrupted builder.
- **P2-C** — the test guarding the product's headline privacy claim hardcodes
  `http://localhost:5173`, so it is origin-literal rather than origin-relative. Pre-existing
  and byte-identical at `v0.4.0`. It matters at slice 6, which points this suite at a live
  URL.
