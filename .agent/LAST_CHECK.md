<!-- Overwritten every phase. The checker cannot write; this is its report, preserved. -->

# LAST CHECK — slice 2, cycle 3 (final re-check after fix cycle 2)

Measured 2026-08-18 against `afd76ef`, fix cycle 2 `dc22f78..e691a6e`, production build
served on :5181, headless Chromium, PL and EN. Phase-start `1bbffef`. STATE validated
first: every cited SHA resolves, `v0.1.0` -> `f8fdf09`, and the one-line change STATE
claims is present in the tree.

## VERDICT: FINDINGS — 1 x P1 (P1-F, NEW, different root cause), 2 x P2. Δ = 0.

**P1-E is CLOSED. All nine criteria PASS.** The slice does not release yet: P1-F is a spec
constraint silently dropped, not the P1-A/P1-E root cause, so it is a FIRST cycle on a new
finding, not a forbidden third.

## P1-E — CLOSED, OBSERVED in a real browser, both languages

- (a) under-26 `Tak` on etat -> chip `+291,00 zł z ulgą dla młodych`; click Dzieło inside
  the dwell -> no chip, substitution note on screen. Absence re-read 900 ms later, so it is
  not a paint race.
- (b) under-26 `Tak` at 6 000, then type 20 000 -> chip gone, net `14 529,78 zł`, both
  languages. (c) etat chip then switch to zlecenie (covered, worth 211 not 291) -> gone.
- (d) student chip `+1 154,80 zł, bo studiujesz` on zlecenie -> Dzieło -> copyright `Tak`:
  gone at every step. Re-clicking the same answer prices nothing and correctly leaves a
  truthful chip standing.

## No over-correction — the chip still fires where it is true

etat ±291,00, zlecenie ±211,00, student on zlecenie ±1 154,80, all in PL and EN, exact
strings read off the page. Dwell measured by polling to detachment: **6 420 ms** normal,
**10 455 ms** under `reducedMotion: reduce` (`matchMedia` confirmed `true` in-page) — spec
§4's 6 s and 10 s. The permanent line stands after the chip goes. The builder's 19/19 was
not taken on trust: 10 independent browser scenarios against the production build.

## The nine criteria

1. PASS. 1 602 uop cases (0..40 000 zł step 50 x under-26) against `v0.1.0`'s OWN `uop.ts`
   and `rates-2026.ts`: 0 mismatches on net, every line amount/base and the relief fields.
   A control proved the comparator can fail. Three slots, three distinct nets, no reload.
2. PASS. Student control on zlecenie only. Student under 26: net 4 845,20 -> 6 000,00,
   ladder 4 rows -> 2, zero ZUS rows and zero ZUS band segments, exemption quote on page.
3. PASS. Dzieło has no emerytalna/rentowa/chorobowa/zdrowotna row. 5 724,00 -> 5 940,00 via
   `Przenosisz prawa autorskie?`; the control label carries no `50%`; cap `120 000,00 zł`
   and the creative-work condition printed. The cap is its own entry, not the PIT alias.
4. PASS, both routes, both languages. `youthRelief.contracts` = `['uop','zlecenie']` in data
   with its quote; on dzieło the outlined note states the limit in the active language and
   the answer block claims no relief — by answering on dzieło AND by answering first and
   switching, the route that failed at cycle 2.
5. PASS. All 20 cited entries carry source/quote/effective/verified; all 11 pages re-fetched
   today, HTTP 200. 18 quotes matched verbatim by machine; the 2 misses were the checker's
   own HTML stripper inserting a space at a link boundary — both re-read by hand in the raw
   HTML and verbatim. A fabricated control quote was not found.
6. PASS. 9 rendered states (3 contracts x relief/student/20%/50%), amounts added off the
   page with struck pre-relief figures excluded: every one sums to exactly 6 000,00 zł.
7. PASS. 6 EN states across all three contracts: no `⟦key⟧` marker, no Polish beyond the
   settled `Zlecenie` / `Dzieło` / `zł`. Key-parity and allowlist tests green.
8. PASS. Variant B at 390x844 and 1280x800: bar full width above the field (358/390,
   1088/1280), amount and both Nie/Tak groups in one `<section>`, answer below, no lede and
   no replacement sentence.
9. PASS. Engine cases hand-computed with the arithmetic in comments per contract and relief
   state; the baseline is taken from the tag; Playwright drives a real browser for 1-4.

## P1-F — NEW. Spec §8's immediate announcement was dropped for two of the three controls

OBSERVED, PL, production build, polling the `role="status"` region every 50 ms: under-26
answer **79 ms**, student answer **85 ms**, **contract change 579 ms**, **copyright answer
581 ms**, typing 550 ms. The instrument reported both fast and slow values on the same page,
so it can produce either. DESIGN-SLICE-2 §8 binds the builder: "contract, student and
copyright changes announce immediately, one utterance each, never debounced." Contract and
copyright are debounced exactly like typing. Root cause `src/components/Answer.tsx:44` —
`const state = ${under26}/${student}` — so only those two answers set `answered` and
everything else falls to the 500 ms timeout; `result.contract` and `result.copyright` are
already on the props, so the fix is that one line. Recorded nowhere as a deferral, and no
acceptance criterion could catch it — this is the spec-vs-criteria gap. A screen-reader user
is told the truth, 500 ms late. First cycle on this root cause, unrelated to P1-A/P1-E.

## P2s

**P2-G, new.** With the amount cleared and retyped, the chip re-fires without any answer
having changed: the ref guarding the moment resets to `false/false` while `result` is null.
OBSERVED `6 000 -> empty -> 20 000` prints `+1 968,00 zł z ulgą dla młodych`, which IS the
relief's true worth at 20 000 (engine: 1 968,00), so no false claim today.

**P2-H.** Δ = 0. Reported as required; nothing to act on.

Informational, not graded: during the dwell the chip and the permanent line are both on
screen where §4 says "after 6 s replaced by" — identical to what shipped and passed in
`v0.1.0`, and the end state matches the spec.

## Counts, Δ, mutation probe

- `npm test` -> **27 passed, 3 files**. `npx playwright test` -> **14 passed, chromium**.
  `npm run build` -> `tsc -b && vite build` clean, 53 modules, 231.55 kB. Collected counts
  read from the runners' own output, not from the builder's report.
- Visible **41/41 = 100%**. Held-out **5/5 = 100%** — one case per criterion (1, 2, 3, 4, 6)
  written from STATE's criteria and run from a temp dir outside the repo against the
  production build. **Δ = 0.** Held-out proven able to fail: against the mutated build it
  scored 4/5, H4 failing on exactly the cycle-2 symptom.
- Mutation: `if (next === null) { setDelta(null); return; }` reverted on a copy outside the
  repo — caught by both new P1-E cases (2 failed, 12 passed). Repo never mutated,
  `git status --porcelain` empty, :5181 and :5182 shut down, :5180 never bound or killed and
  still HTTP 200.

## Instruments discarded rather than reported — four would-be findings

Chip reads taken before React painted (five scenarios read `<none>` where a chip was present
200 ms later); an EN contract-bar selector matching the Polish `Etat`; the HTML stripper
that inserted a space at a tag boundary and made two verbatim quotes look wrong; a page
cache whose base64 filenames collided at 40 chars, hiding a sentence that is on the live
page. Each was re-measured against the raw artifact before being dropped.
