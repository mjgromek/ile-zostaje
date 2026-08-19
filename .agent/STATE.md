<!-- Cap: 120 lines. Orchestrator enforces on every write. Over cap: compact settled facts into DECISIONS.md and delete them from here. State describes now. -->

# STATE

Run 4. **Slice 3 IN PROGRESS.** Phase-start SHA **`6b6787a`** — FILES CHANGED is generated
from `git diff --stat 6b6787a..HEAD`. Slice 2 shipped at `e6be6b6` / `v0.2.0`, slice 1 at
`f8fdf09` / `v0.1.0`, all on `origin`. **Pipeline upstream SHA: none — this clone has one
remote, `origin`, and no upstream pipeline remote to name.** `git remote -v`, 15:03.

**Every shell command starts with `export PATH="/opt/homebrew/bin:$PATH"`.** Node 25.9.0
and npm 11.12.1 are there and are NOT on the agent's default Bash PATH; without it you get
`command not found`, which reads as "not installed" and is wrong. R4-F3.

**Port 5180 is the stakeholder's dev server**, run with `--strictPort`. Never bound, never
killed by an agent; every agent uses 5181+.

## Current slice — 3, the brutto/netto toggle with reverse calculation

The direction control from DESIGN-SLICE-2 §3, built as specified there: in the card, on its
own row immediately above the amount field's label, defaulting to `brutto → netto`. In
`netto → brutto` the user types what they want to LAND ON and the app solves for the gross
producing it, by inverting the shipped engine — not by a multiplier or a second formula.

**Measured 15:00 with the shipped `computeContract`, before the criteria were written.**
These are the numbers the criteria straddle:

| threshold | bites at gross | measured on |
| --- | --- | --- |
| ulga dla młodych monthly limit | 7 127,33 zł | uop, zlecenie |
| PIT 32% (base > 10 000 zł/mies.) | uop 11 880 · zlecenie 14 087 · dzieło 12 501 | all three |
| 50% KUP annual cap (10 000 zł/mies. of costs) | 20 001 zł | dzieło + prawa autorskie |

**Net is NOT monotone in gross.** Over gross 5 000–5 300 zł the net FALLS on 118 one-grosz
steps on uop (worst 1,00 zł), 61 on zlecenie, 18 on dzieło+50%, 0 on student-zlecenie,
which is exactly 1:1. Plateaus run to 6 gross per net. **No unreachable net was found
below the input cap**, so `dir.unreachable` is testable only above the top reachable net
(uop 511 491,00 zł at 1 000 000 zł of gross).

### Acceptance criteria

1. **The control is where the spec puts it.** `role="radiogroup"` labelled `Kierunek
   przeliczenia`, two `role="radio"` segments `brutto → netto` / `netto → brutto`
   (EN `gross → net` / `net → gross`), inside the card immediately above the amount label,
   default brutto, 44 px min-height, persisted with the other entries and surviving a
   reload. An entry stored before slice 3 loads as brutto, not as an error.
2. **Direction changes the words, never the arithmetic.** In netto mode: field label `Ile
   chcesz mieć na koncie`, eyebrow `Kwota na umowie`, from-line `miesięcznie, żeby na
   konto trafiło {net} zł`. Band, ladder and total row are byte-identical to brutto mode
   for the same solved gross. Both directions still print estimate and storage lines.
3. **The inverse is obtained from the real function.** The solver calls `computeContract`;
   no rate literal, no closed form, no approximation, nothing new in `rates-2026.ts`. A
   test asserts the solver's answer equals an EXHAUSTIVE one-grosz scan's lowest match,
   over one window per contract: non-monotonicity makes a bare bisection unsound.
4. **The round trip closes to the grosz, both sides of every threshold.** For each gross
   below: `net = compute(gross)`, `g' = solve(net)`, `compute(g').net === net` exactly.
   - relief limit: **6 000** and **12 000** and **20 000**, uop and zlecenie, under-26 Nie
     and Tak, plus **7 127,00 / 7 127,33 / 7 128,00** at the boundary itself.
   - 32% PIT: uop **11 000** / **15 000**; zlecenie **13 000** / **16 000**; dzieło
     **12 000** / **14 000** — one below and one above each contract's own crossing.
   - 50% KUP cap: dzieło+prawa autorskie **15 000** / **25 000**, and **20 000 / 20 001**.
   - every combination of contract × under26 × student × copyright at 6 000 and at 20 000.
5. **Non-uniqueness is stated, never hidden.** Where several gross values give the entered
   net the app shows the LOWEST and prints `dir.ambiguous` with the measured `{lo}`/`{hi}`
   in the field's status slot, `role="status"`, NOT `aria-invalid` — ambiguity is not an
   error. Where none does, `dir.unreachable` with the closest gross. Both carry numbers
   computed from THIS entry. Verified in the browser on **4 600 zł net, uop** — five gross
   values, 6 263,06…6 264,35 zł. **CORRECTED 15:31:** this criterion first named 6 000 zł
   net on uop, which the builder measured by exhaustive scan as UNIQUE (8 317,21 zł). The
   example was wrong, the criterion is not. A student under 26 on a zlecenie is 1:1.
6. **The P1-J family cannot come back.** No figure anywhere on screen — chip, why-line,
   live region, ambiguity message — is computed under an answer other than the one shown.
   Checked in netto mode at a net produced by gross **12 000** and by gross **20 000**,
   both above the relief's monthly limit, on uop and on zlecenie.
7. **Both languages, no new untranslated key.** The nine slice-3 keys of DESIGN-SLICE-2
   §10 ship verbatim in PL and EN; `strings.test.ts` key parity still passes.
8. **P2-G and P2-I close together** — their backlog urgency condition is this toggle.
   `announced.current` and the delta ref reset when the result goes null, so clear-and-
   retype produces one utterance and no chip that prices a screen that is not there.
9. **Nothing slice 1 or slice 2 shipped regressed.** Every existing Vitest and Playwright
   test passes unchanged, and the default screen at 6 000 / 12 000 / 20 000 on all three
   contracts is numerically identical to the `v0.2.0` tag.
10. **The accessibility floor holds on the new row** at 390: 44 px targets, the 3 px focus
    ring, contrast per §8, and a direction change announces immediately, one utterance,
    never debounced.

## In flight

Slice 3 built at `8531b01`, with the checker.

## Blocked

Nothing.

## Last verification result

Measured 2026-08-19 15:50, slice 3 at `d68b471` — **PASS**, Δ = 0 (visible 56/56, held-out
5/5), 176 browser round trips with 0 failures, 72 screens compared against the `v0.2.0`
worktree with 0 differing, two mutants caught. No open P0 or P1; one P2 (P2-L) in BACKLOG.
Verbatim in `.agent/LAST_CHECK.md`.

## Next slices, in order

4. Input units: hour, week, month, year. Promotes the annual ZUS ceiling from BACKLOG.
5. The leftover layer — rent and food subtracted from the net. Survives every scope cut.
6. Deploy to a public URL, verified with `hooks/verify-deploy.sh`.

## Checkpoints

- 2026-08-18 22:48 to 2026-08-19 14:57 — slice 2 built, checked over five cycles and
  released at `e6be6b6` / `v0.2.0`; the detail is in `DECISIONS.md` and git history.
- 2026-08-19 15:00 — slice 3 thresholds and non-monotonicity measured. Table above.
- 2026-08-19 15:04 — slice 3 and its ten criteria written. Phase-start `6b6787a`.
- 2026-08-19 15:30 — builder handed over: `3676565` test: (5 Vitest, 6 Playwright red),
  `8531b01` feat:, `f8ff553` docs. 33 Vitest and 23 Playwright green, 11 tests added.
- 2026-08-19 15:31 — criterion 5's example corrected on the builder's measurement; two
  deferrals to BACKLOG. The DECISIONS per-entry cap caught one of my own entries at 9
  lines and it was trimmed — R4-F8's known workaround, not a new finding.
- 2026-08-19 15:50 — checker: PASS on all ten criteria, Δ 0, zero fix cycles needed. P2-L
  to BACKLOG. Gates next, then README and the v0.3.0 release.
