<!-- Overwritten every phase. The checker cannot write; this is the orchestrator's transcript of its report. -->

# LAST CHECK — slice 3, the brutto/netto toggle

**Received and written 2026-08-19 15:50.** Checked at HEAD `d68b471`, builder's work at
`3676565` (test:) and `8531b01` (feat:), phase-start `6b6787a`.

## VERDICT — PASS · Δ = 0 · one P2 · no P0, no P1

<!-- The security gate ran later, at the end of this file: PASS, three further P2. -->


Visible 56/56 = 100%. Held-out 5/5 = 100%. **Δ = 0.**

## State file validated first

All nine SHAs in `.agent/STATE.md` resolve (`6b6787a`, `d68b471`, `3676565`, `8531b01`,
`e6be6b6`, `f8fdf09`, `cb189dc`, `8628187`, `f8ff553`); every "shipped" item is in the
tree. Criterion 5's "CORRECTED 15:31" note is itself correct: an independent exhaustive
scan of net 4 600,00 zł on uop returns exactly five gross values — 6 263,06 / 6 263,08 /
6 264,33 / 6 264,34 / 6 264,35 — **non-contiguous**, which is why `lo`/`hi` are bounds and
not a span.

## Counts, verified by the checker rather than taken from the builder

Vitest 33 collected / 33 passed; Playwright 23 / 23 — both match the builder's figures.
11 tests added against a cap of 10 criteria + 2 implied guards. No `.skip`, `.only` or
`.fixme` anywhere in `src` or `e2e`.

## The artifact was driven, not the diff

Own dev server on 5181; 5180 untouched and still the stakeholder's; ports released after.

- **Round trip in the browser: 176 trips, 0 failures.** 3 contracts × under26 × student ×
  both KUP rates, at 6 000 / 7 127,00 / **7 127,33** / 7 128 / each contract's own 32%
  crossing ±1 gr (uop 11 880, zlecenie 14 087, dzieło 12 501) / 20 000 / **20 001** /
  25 000. Each trip: typed gross → read the net off the screen → switched to netto → typed
  that net → read the gross off the screen → switched back → typed that gross. The net
  came back identical to the grosz every time.
- **Criterion 5 on screen:** figure `6 263,06 zł`, status `…od 6 263,06 zł do 6 264,35 zł.
  Pokazujemy najniższą.`, `role="status"`, `aria-invalid` never set. The unreachable path
  renders in PL and EN at the 1 000 000 zł input cap.
- **Criterion 6, the P1-J family:** at nets produced by gross 12 000 and 20 000, on uop and
  zlecenie, every ladder line, the struck PIT, the chip, the from-line and the sticky
  mini-bar equal the engine's answer for the gross actually shown — chip 738,00 = the
  relief's worth, never the 797,00 advance.

## Regression against the tag itself, not against memory

`v0.2.0` checked out into a worktree and served on 5182. **72 screens compared** (3
contracts × 8 answer combinations × 6 000 / 12 000 / 20 000), over `answer`, `band`,
`ladder`, `ladder-total`, `consequences`, `note-substitution`, `year-chip`, `sources`:
**0 differing.** Layout matches DESIGN-SLICE-2 §3 at 1280 (figure, band and ladder move
0 px); at 390 the column below the card moves down 54 px against the 58 px predicted, so
the spec's argument — a 54–58 px cost against the lede's 90 px refund — survives.

## Held-out suite — 5 tests, none of them the builder's

Derived from `.agent/STATE.md`, written in a `mktemp -d` OUTSIDE the repository, run,
reported and deleted. The oracle was an in-page exhaustive one-grosz scan of the shipped
`computeContract`, never `solve.ts`. H1 lowest match at the thresholds · H2 ambiguity
bounds equal the scan's bounds · H3 direction changes words, not arithmetic · H4 the P1-J
family in netto mode · H5 the row at 390. **5/5 passed.** No live deployment exists yet
(slice 6), so the checks are local only.

## Mutation probe — both mutants caught, both restored

1. `src/engine/solve.ts:66` `if (lowest < 0) lowest = gross;` → `lowest = gross;` — caught
   by BOTH "the solver agrees with an exhaustive one-grosz scan" and "the round trip closes
   to the grosz on both sides of every threshold".
2. `src/components/Answer.tsx`, the P2-I line `announced.current = null;` deleted — caught
   by "slice 3, criterion 8 — clear, answer, retype".

Restored; 33 + 23 green again; `git status --porcelain` clean apart from the `PROGRESS.md`
edit that predated the run.

## P2 — the quick-fill button offers a gross figure as a net target in netto mode

**Measured:** a real click at 390 px in netto mode on `Płaca minimalna 2026`. The field
(`Ile chcesz mieć na koncie`) took `4806` and the answer showed `Kwota na umowie
6 566,15 zł`. **Instrument:** a real browser click, the value read back from `input#gross`
and from `[data-testid="net-amount"]`; the instrument can produce this observation.
Nothing false is printed — every sentence on the resulting screen is true — which is why
this is not P1 and not a criterion 6 breach. **Repro:** open `/`, click `netto → brutto`,
click `Płaca minimalna 2026`.

## Checked and explicitly NOT findings — the instrument was examined first

- Three held-out failures on the first run were the checker's, not the app's: `num()` ate
  the pl-PL thousands separator and glued the digits; a figure regex missing U+00A0/U+202F
  split every amount; and a shared browser context inherited a netto-mode `localStorage`
  and then looked for a label that does not exist in that mode. All three fixed, all three
  then passed. R4-F5 and R4-F7's lesson, applied before a P1 was written.
- The pill border computes as `1px` at DPR 1 against §3's `1.5px`. `getComputedStyle`
  returns the device-snapped used value, so the instrument cannot tell the two apart; the
  source declares `1.5px solid var(--ink)`, as specified. Not a finding.
- Contrast on the new row, from computed styles with the WCAG formula and not by eye:
  inactive segment 15.71, active (ink on honey) 9.77, row label `Liczę` 6.47. Segments
  44 px at 390; focus ring ≥ 3 px; no overlap (row 204–248, label 257–275, input 284–338).
- The solver's ±20 zł window: 186 targets across six answer combinations, each re-scanned
  200 zł below — 0 cases where a lower match existed. The 7 ms claim holds: under 6× CPU
  throttling netto costs ~157 ms per keystroke against brutto's ~92 ms.
- Criterion 3 structurally: `rates-2026.ts` is untouched in `git diff 6b6787a..HEAD`, and
  `solve.ts` holds no rate literal — its only constant is the scan window.

## Security gate — received and written 2026-08-19 16:21, at HEAD `b1ceca9`

**VERDICT — PASS · no P0, no P1 · three P2 (P2-S1, P2-S2, P2-S3, all in BACKLOG).**
Triggers fired: user-supplied input driving the solver loop, and storage access — the
persisted `direction` field. Reported verbatim by the checker, unprompted: **the built-in
`/security-review` did NOT run — no agent can execute a slash command.** The human runs it.

- **The scan is not attacker-influenceable.** `WINDOW_GROSZ` is a compile-time constant and
  bisection is ≤ 27 steps, so ~4 028 engine calls is the cost of EVERY input, not a worst
  case. Input→render MEASURED 3–11 ms in real Chromium against `dist`; zero `longtask`
  entries, worst rAF gap 30 ms. Hostile inputs — `-500`, `NaN`, `Infinity`, `1e308`,
  `0x1p100`, 20 / 10 000 / 100 000 digits — never reach the solver: `parseGross`'s
  `^\d+(\.\d{0,2})?$` whitelist rejects them first, each settling in 26–51 ms.
- **A 1 000 000-digit paste settled in 358 ms with two long tasks.** A visible stall, not a
  hang, and on the pre-existing parser path rather than anything slice 3 added.
- **18 hand-crafted localStorage entries, fresh context each, all booted clean.** A
  pre-slice-3 entry with no `direction` loads as `g2n`; bogus string, number, object and
  array all fall back; `__proto__` and `constructor.prototype` payloads left
  `({}).polluted === null`. XSS payloads in `gross` rendered as the input's `value`
  property — `window.__pwned === null`, no injected `img` or `script` node.
- **9 requests, all to `localhost:5181`**: document, JS, CSS and six self-hosted woff2.
  No WebSocket, `document.cookie` empty, `sessionStorage` empty. No `innerHTML`,
  `dangerouslySetInnerHTML`, `eval`, `new Function`, `fetch`, `XHR`, `sendBeacon` anywhere
  in `src`, `index.html` or `vite.config.ts`. The 12 remote URLs in `dist` are `href`
  citations to zus.pl and podatki.gov.pl plus XML namespaces, never fetched. No key, token
  or credential in the diff. PROJECT.md's third invariant holds, measured not assumed.
- **Four mutants, run in a `cp -R` sandbox outside the repo.** Storage's `direction`
  allowlist and the lowest-match rule were both CAUGHT. The negative-target clamp was not
  (P2-S1), and the scan window was caught only by the suite hanging (P2-S2).
- **Instrument check.** Latency came from three independent clocks — a `longtask`
  PerformanceObserver, a rAF gap recorder and in-page `performance.now()` — which agreed,
  and the 1M-digit paste is the positive control proving they could have shown a stall.
  The network log is CDP `context.on('request')`, which fires before a request leaves.
