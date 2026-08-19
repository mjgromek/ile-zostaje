<!-- Cap: 120 lines. Orchestrator enforces on every write. Over cap: compact settled facts into DECISIONS.md and delete them from here. State describes now. -->

# STATE

Run 4. **Slice 4 RELEASED at `b7e726c` / `v0.4.0`**, both confirmed on `origin` with
`git ls-remote` — `refs/heads/main` and `refs/tags/v0.4.0^{}` are the same SHA. Slice 3 at
`8a5b3d8` / `v0.3.0`, slice 2 at `e6be6b6` / `v0.2.0`, slice 1 at `f8fdf09` / `v0.1.0`.
**Pipeline upstream SHA: none — this clone has one remote, `origin`, and no upstream
pipeline remote to name.**

**Every shell command starts with `export PATH="/opt/homebrew/bin:$PATH"`.** Node 25.9.0
and npm 11.12.1 are there and are NOT on the agent's default Bash PATH; without it you get
`command not found`, which reads as "not installed" and is wrong. R4-F3.

**Port 5180 is the stakeholder's dev server and 5184 is their LIVE PREVIEW.** Neither is
ever bound or killed by an agent; every agent uses 5181–5183 and releases them.

## Current slice — 4b, the card's first impression: four stakeholder decisions

All four taken on the live preview, all Level 2, all answered. Rulings in DECISIONS
2026-08-19. **The designer runs first** — three of the four have an open shape.

1. **One toggling button** replaces the direction radiogroup; its label IS the active
   direction. OPEN: the ARIA shape. `aria-pressed` on a button whose label changes asserts
   the mode twice and can be read out in conflict; `role="switch"` is on/off and these are
   two named modes. The designer settles it.
2. **The quick-fill chip reads `Płaca minimalna {year}` alone** — no dash, no amount. The
   click must STILL set amount, unit AND direction; that is what keeps P2-L closed, and
   the label under-describing it is a graded, accepted cost, not a regression to fix.
3. **A first-time visitor gets `5000` as a real value** and the screen computes on load. A
   returning visitor's stored entry is NEVER overwritten — that is the load-bearing half.
4. **The figure animates** on a change of contract or direction: cross-fade and slide,
   ~180 ms, band and ladder moving with it. **No counter through intermediate values** —
   a money figure that is nobody's net must never stand on screen. OPEN: whether the
   ladder rows stagger, and `prefers-reduced-motion` is not optional.

## In flight

Designer, on all four items of slice 4b.

## Blocked

Nothing.

## Last verification result

Slice 4 at `944a4b6` — **PASS**, Δ = 0 (visible 68/68, held-out 5/5), no P0 and no P1.
Criterion 5 re-derived by the checker with a stronger instrument than the builder's: 27
LIVE screen pairs from a `git archive` extraction of `v0.3.0` served beside HEAD, zero
differing. The ZUS ceiling confirmed at source by the checker's own HTTP 200, not taken
from the builder. Two mutants caught. Security gate — **PASS**, three P2; the range gate
holds in all four units, driven on the built artifact, and nothing reached the engine above
`MAX_GROSS_GROSZ`. Architecture gate **NO CHANGE**; ponytail one SIMPLIFY, deferred.
Both verdicts verbatim in `.agent/LAST_CHECK.md`.

**The built-in `/security-review` did NOT run for slice 4 — no agent can execute a slash
command.** The human ran it for slice 3 and it returned no findings. It has not been typed
for slice 4.

**One P2 is about this pipeline rather than the product, and it changes how gates run.**
P2-2: mutating the input range gate at `src/state/gross.ts:27` left all 39 Vitest tests
green — only Playwright caught it. `npm test` alone can report health on a broken input
gate, so no gate may treat it as sufficient. The README now says so out loud.

## Next slices, in order

5. The leftover layer — rent and food subtracted from the net. Survives every scope cut.
   **This is the one that turns a net calculator into this product**; it is also the only
   remaining Definition-of-Done clause with real weight.
6. Deploy to a public URL, verified with `hooks/verify-deploy.sh`. Three BACKLOG entries
   name slice 6 as their urgency condition: the missing CSP, P2-1's unbounded stored
   `hoursPerWeek`, and the security gate's header observation.

## Checkpoints

- 2026-08-18 22:48 to 2026-08-19 16:24 — slices 2 and 3 built, checked and released at
  `v0.2.0` and `v0.3.0`; the detail is in `DECISIONS.md` and git history.
- 2026-08-19 17:46 — designer returned DESIGN-SLICE-4, found a real defect while rendering
  (`select` absent from `base.css:23`'s focus list), and stopped at its Level 2 question.
  Stakeholder answered **option C**, monthly dominant with a per-unit echo.
- 2026-08-19 18:12 — builder interrupted mid-`feat:` when the machine slept, and RESUMED
  from its own transcript rather than restarted. The `test:` commit was already safe.
- 2026-08-19 18:37 to 19:06 — slice 4 checked PASS, three gates run, README to `v0.4.0`,
  released and pushed. The checker caught three stale project records, all the
  orchestrator's own drift, all corrected. Four closed BACKLOG entries deleted.
