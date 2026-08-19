<!-- Cap: 120 lines. Orchestrator enforces on every write. Over cap: compact settled facts into DECISIONS.md and delete them from here. State describes now. -->

# STATE

Run 4. **Slice 4 RELEASED at `b7e726c` / `v0.4.0`**, both confirmed on `origin` with
`git ls-remote` — `refs/heads/main` and `refs/tags/v0.4.0^{}` are the same SHA. Slice 3 at
`8a5b3d8` / `v0.3.0`, slice 2 at `e6be6b6` / `v0.2.0`, slice 1 at `f8fdf09` / `v0.1.0`.
**Pipeline upstream SHA: none — this clone has one remote, `origin`, and no upstream
pipeline remote to name.**

**Every shell command starts with `export PATH="/opt/homebrew/bin:$PATH"`.** Node 25.9.0
and npm 11.12.1 live there and are NOT on the agent's default Bash PATH; without it you get
`command not found`, which reads as "not installed". R4-F3.

**Port 5180 is the stakeholder's dev server and 5184 is their LIVE PREVIEW.** Neither is
ever bound or killed by an agent; every agent uses 5181–5183 and releases them.

## Current slice — 4b, the card's first impression

Phase-start **`589ea02`**; FILES CHANGED from `git diff --stat 589ea02..HEAD`. Built to
`.agent/DESIGN-SLICE-4B.md`, a settled spec. Four stakeholder items, no escalation, plus one
pre-existing P1-class fix folded in.

### Acceptance criteria

Detail lives in `DESIGN-SLICE-4B.md`; § refs are to it. Twelve falsifiable claims.

1. **The toggle's ARIA shape is §2.2's exactly** — plain `<button>`, `data-testid`,
   `data-direction`, and NO `aria-pressed` / `role="switch"` / `aria-checked`. Accessible
   name is the literal four strings in §2.2, arrow excluded. `Space` and `Enter` activate.
   The radiogroup, both segments and `.dir`/`.dirSeg`/`.active` are DELETED.
2. **The e2e migration is state-aware** — a toggle is not idempotent, so every direction
   call site reads `data-direction` and clicks only if it must. The 18 direction lines
   migrate per §8; the 23 lines for contract, questions and language are UNTOUCHED.
3. **The chip reads `Płaca minimalna {year}` alone and still sets all three** — driven by a
   real click from `netto` + `year` + `90000` → `4806` / `month` / `g2n` / `3 605,85 zł`.
   It takes the toggle's 1.5 px ink outline, per §3, or it stops reading as a button.
4. **The 320 px EN overflow closes** — `scrollWidth`/`clientWidth` 286/286 where `v0.4.0`
   measured 299/286. Its BACKLOG entry is deleted with that measurement quoted.
5. **First run is decided on the RAW string, never the parsed field** — §4's six cases.
   Load-bearing: **a record with `gross: ""` leaves the field EMPTY**, unparseable is never
   overwritten, and clear + reload stays empty. Plus a Vitest case for raw-`null` vs
   raw-unparseable, covered by neither existing storage test.
6. **The empty state is direction-aware** — new `empty.answer.net`, PL and EN, so a `netto`
   user is not told to type a gross over a field labelled `Ile chcesz mieć na koncie`.
7. **The animation fires on contract and direction ONLY** — `getAnimations()` running on
   those two, not re-firing on a typed digit, a unit change, an under-26 flip or a language
   switch. 180 ms, fade-in on swap: the two figures are NEVER on screen together.
8. **`prefers-reduced-motion: reduce` degrades to instant** — `animation-name: none`, `0s`,
   `opacity: 1`, `transform: none`, no animation on any of the six triggers, announcement
   unchanged.
9. **The live region survives the swap** — the `key` sits on a wrapper INSIDE the section,
   excluding the furniture and the region; a held reference to the live `<p>` is the same
   node after all six triggers. `.swap` never wraps or ancestors a `position: sticky`
   element.
10. **The P1-class live-region defect is FIXED and it PREDATES this slice.** At `v0.4.0`,
    `netto` with `6000` announces `Na konto: 6 000,00 zł` while the screen reads
    `Kwota na umowie 8 317,21 zł` — CONFIRMED twice, by the designer in a browser and by
    the orchestrator reading `Answer.tsx:85` against `:178`. **Grade it a fix, not a
    regression.**
11. **Key parity holds** — `strings.test.ts:176` pins the old quick-fill text and must be
    updated; MEASURED as the ONLY unit failure against the patched tree.
12. **Nothing else regressed** — every other test passes, and the default screen on all
    three contracts is numerically identical to `v0.4.0`.

## In flight

Builder, on slice 4b.

## Blocked

Nothing.

## Last verification result

Slice 4 at `944a4b6` — **PASS**, Δ = 0 (68/68, held-out 5/5), no P0 or P1, two mutants
caught. Security gate **PASS**, three P2. Architecture **NO CHANGE**; ponytail one SIMPLIFY,
deferred. Verbatim in `.agent/LAST_CHECK.md`. The built-in `/security-review` has NOT been
typed for slice 4.

**One P2 governs how every future gate runs.** P2-2: mutating the input range gate at
`src/state/gross.ts:27` left all 39 Vitest tests green — only Playwright caught it. **No
gate may treat `npm test` as sufficient.** The README says so out loud.

## Next slices, in order

5. The leftover layer — rent and food subtracted from the net. **This is the one that turns
   a net calculator into this product**, and the last heavy Definition-of-Done clause.
6. Deploy to a public URL, verified with `hooks/verify-deploy.sh`. Four BACKLOG entries
   name it as their urgency condition, the missing CSP among them.

## Checkpoints

- 2026-08-18 22:48 to 2026-08-19 16:24 — slices 2 and 3 built, checked and released at
  `v0.2.0` and `v0.3.0`; the detail is in `DECISIONS.md` and git history.
- 2026-08-19 17:46 to 19:06 — slice 4 designed, built (the builder was interrupted by the
  machine sleeping and RESUMED from its own transcript), checked PASS, gated and released
  at `v0.4.0`. The checker caught three stale project records, all the orchestrator's own
  drift, all corrected.
- 2026-08-19 — four stakeholder decisions on the live preview became slice 4b. The designer
  returned with NO escalation and one pre-existing P1-class fix folded in.
