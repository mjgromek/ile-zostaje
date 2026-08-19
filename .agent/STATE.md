<!-- Cap: 120 lines. Orchestrator enforces on every write. Over cap: compact settled facts into DECISIONS.md and delete them from here. State describes now. -->

# STATE

Run 4. **Slice 4 IN PROGRESS.** Phase-start SHA **`2732083`** — FILES CHANGED is generated
from `git diff --stat 2732083..HEAD`. Slice 3 released at `8a5b3d8` / `v0.3.0`, slice 2 at
`e6be6b6` / `v0.2.0`, slice 1 at `f8fdf09` / `v0.1.0`, all on `origin`. **Pipeline upstream
SHA: none — this clone has one remote, `origin`, and no upstream pipeline remote to name.**

**Every shell command starts with `export PATH="/opt/homebrew/bin:$PATH"`.** Node 25.9.0
and npm 11.12.1 are there and are NOT on the agent's default Bash PATH; without it you get
`command not found`, which reads as "not installed" and is wrong. R4-F3.

**Port 5180 is the stakeholder's dev server**, run with `--strictPort`. Never bound, never
killed by an agent; every agent uses 5181+.

## Current slice — 4, input units: hour, week, month, year

Built to `.agent/DESIGN-SLICE-4.md`, which is a settled spec, not a suggestion. The Level 2
question it carried — what period the ANSWER speaks in — was **answered by the stakeholder
on 2026-08-19: option C, monthly dominant with a per-unit echo.** Do not reopen it.

### Acceptance criteria

1. **The unit lives inside the field, as §0 and §2 put it.** Native `<select id="unit">`
   with `data-testid="unit-select"` replacing the `zł / mies.` span, a visually-hidden
   `<label for="unit">`, four options in the order hour / week / month / year, default
   month. MEASURED at 390: the card is **282 px at month — identical to `v0.3.0`** — 309 at
   week and year, 361 at hour. `documentElement.scrollWidth` equals the viewport at 320,
   360 and 390 in both languages.
2. **The conversion is one rounding at the engine boundary, integer arithmetic only.**
   Asserted to the grosz: 35 zł/h at 40 h/wk → **6 066,67 zł/mies.**; 1 000 zł/tydz. →
   **4 333,33**; 90 000 zł/rok → **7 500,00**; month is identity. The inverse for the echo
   is applied ONCE to the monthly grosz, never chained through an intermediate.
3. **The conversion line prints the operation, never a rounded intermediate.** Visible
   whenever the unit ≠ month, in `aria-describedby` on `#gross` ahead of the error and the
   status. A test asserts the string contains `× 52` and `÷ 12` and NOT `173,33`.
4. **Hours per week is asked, never invented.** The field exists under the hour unit only,
   defaults to 40, persists under all four units, accepts one decimal with comma or dot,
   and rejects empty / 0 / non-numeric / >168 with `error.hours`, `aria-invalid` on
   `#hours` and a null result. No hours-per-month constant exists anywhere in the source.
5. **The answer speaks monthly in every unit.** The echo line renders only when the unit ≠
   month. The band, the ladder, every why-line, `ladder.caption`, `total.from` and the
   sticky mini-bar are **byte-identical to `v0.3.0`** for the same monthly gross, checked
   across all four units.
6. **The annual ZUS ceiling ships with a citation or does not ship.** A cited amount in the
   year data file with its source URL and effective date; the emerytalna and rentowa base
   becomes `min(monthlyGross, ceiling / 12)`; chorobowa and zdrowotna uncapped. Tests at,
   one grosz below and one grosz above the monthly crossing. **The 282 600 zł figure in
   DESIGN-SLICE-4 §8 is INFERRED from a web summary — read it off zus.pl or escalate.**
7. **The reverse solve still closes to the grosz, in every unit.** `net = compute(gross)`,
   `g' = solve(net)`, `compute(g').net === net` exactly — at 6 000 and 20 000 on all three
   contracts, and on both sides of the new ceiling crossing, in all four units.
8. **The quick-fill sets everything it asserts, and P2-L closes.** One click sets
   `gross = 4806`, `unit = 'month'` AND `direction = 'g2n'`; the label names brutto. Driven
   by a real click at 390 in netto mode, which is the gesture that produced P2-L.
9. **Both languages, and two keys DIE.** Every §5 key ships verbatim in PL and EN;
   `field.gross.label` and `field.gross.unit` are **deleted, not deprecated**;
   `strings.test.ts` key parity still passes.
10. **The accessibility floor holds on both new controls.** `select` is added to
    `base.css:23`'s `:focus-visible` list and the ring MEASURES 3 px in ink, not the UA
    blue; 44 px targets at 390; a unit change announces immediately and un-debounced, one
    utterance, while `hoursPerWeek` debounces 500 ms with the amount.
11. **Nothing slice 1, 2 or 3 shipped regressed.** Every existing Vitest and Playwright test
    passes unchanged, and the default screen at 6 000 / 12 000 / 20 000 on all three
    contracts is numerically identical to the `v0.3.0` tag.

## In flight

Nothing. The builder has not started.

## Blocked

Nothing. The Level 2 decision is answered.

## Last verification result

Slice 3, measured 2026-08-19 15:50 at `d68b471` — **PASS**, Δ = 0 (visible 56/56, held-out
5/5), 176 browser round trips with 0 failures, 72 screens compared against `v0.2.0` with 0
differing. Security gate 16:21 at `b1ceca9` — **PASS**, no P0 and no P1, three P2. The
human ran the built-in `/security-review` at 17:0x: **no findings**, scoped by the operator
to `6b6787a..v0.3.0` because the command's own diff came back empty on a clean `main`.
Verbatim in `.agent/LAST_CHECK.md`.

## Next slices, in order

4b. **The direction becomes one toggling button.** STAKEHOLDER DECISION on the live
    preview — see DECISIONS 2026-08-19. It REPLACES slice 3's criterion 1, which asserted a
    `role="radiogroup"` with two `role="radio"` segments, and MEASURED 20 references in
    `e2e/app.spec.ts` must be rewritten with it. Runs AFTER slice 4 lands, never folded into
    it. The designer settles the ARIA shape first — the second DECISIONS entry says why.
5. The leftover layer — rent and food subtracted from the net. Survives every scope cut.
6. Deploy to a public URL, verified with `hooks/verify-deploy.sh`.

## Checkpoints

- 2026-08-18 22:48 to 2026-08-19 16:24 — slices 2 and 3 built, checked and released at
  `v0.2.0` and `v0.3.0`; the detail is in `DECISIONS.md` and git history.
- 2026-08-19 17:46 — designer returned DESIGN-SLICE-4 and stopped at its Level 2 question.
  It found a real defect while rendering: `select` is absent from `base.css:23`'s focus
  list, so the new control would ship the browser's blue ring.
- 2026-08-19 — stakeholder answered: **option C, monthly dominant plus a per-unit echo.**
  Slice 4 and its eleven criteria written. Phase-start `2732083`.
