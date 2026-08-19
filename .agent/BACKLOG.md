<!-- No cap. Entries are deleted when done or when they turn out to be false. Every entry carries the condition that makes it urgent. -->

# BACKLOG

Deferred items. P2 findings land here. An item with no urgency condition is not a backlog
item, it is a wish — write the condition or drop it.

Format:

```
- <item> — Urgent when: <the observable condition that promotes it into a slice>
```

## Deferred

<!-- - Pagination on the list endpoint — Urgent when: any account exceeds 500 rows. -->

- B2B / działalność gospodarcza as a contract type — Urgent when: the stakeholder states a
  target user is invoicing rather than employed. Out of V0 by explicit constraint, and the
  most likely thing to be assumed in by mistake.
- A visible warning when the shipped tax year is not the current one — Urgent when: the
  calendar year passes the shipped rate year. The year is displayed from slice one, but a
  displayed year is passive and a stale rate is silently wrong.
- Rates for the following tax year — Urgent when: the official rates are published and
  citable. Adding a year is a data file, not code; if it is not, invariant one has broken.
- Side-by-side comparison of the three contract types on one gross figure — Urgent when:
  anyone is observed re-entering the same amount to compare contracts.
- 50% copyright KUP on umowa zlecenie, not only on dzieło — Urgent when: a user doing
  creative work on a zlecenie reports the net as too low, or any slice widens KUP. Slice 2
  scopes it to dzieło and says so on screen rather than under-reporting in silence.
- The shipped typography carries an ACCEPTED weakness, in the winning variant's own words:
  two grotesques, so the point of view rests on size and weight discipline alone. This is a
  trade the stakeholder chose with the alternatives in front of them, NOT a defect and not
  a finding — Urgent when: a screen's hierarchy goes visibly flat, or a slice adds a
  display-level element that must separate from body text at the same size and weight and
  cannot. Do not resolve it by quietly introducing a third face.
- Wordmark and ladder total ship at 18 px where DESIGN-SLICE-1 §3 fixes the display floor
  at 19 px — a slice 1 self-inconsistency, spotted during the theme run and deliberately
  NOT slipped in with it — Urgent when: any slice revisits the type scale, or the 19 px
  floor is used as the rule to judge a new element.
- Chorobowa on zlecenie is voluntary and modelled as off, stated in help text rather than
  given a control — Urgent when: a user reports a zlecenie that does pay chorobowa.
- P2-6: the `pit.costs` quote truncates a qualifying clause, so the disclosure states a
  conditional annual cap (3 000 zł, one employment relationship) as absolute — Urgent when:
  a user with two employers reads the disclosure, or a later slice uses the annual cap. The
  250 zł/month value it cites is correct and unaffected.
- The frozen ZUS passages are cleaned of the page's raw-HTML spacing: the financing page
  prints `podstawy wymiaru składek )` with a space before the bracket where
  `rates-2026.test.ts` records `składek).` — Urgent when: a quote check runs against live
  HTML instead of the frozen passages. Raised by the builder in slice 2's fix cycle.
- P2-4: the gross field's focus ring is `outline-offset: -3px` where DESIGN-SLICE-1 §6 says
  `2px`; the ring is present, 3 px and unclipped, so only its placement differs — Urgent
  when: theme-factory revisits focus in slice 2, or a second inset ring makes the
  inconsistency visible side by side.
- Art. 83 reduction of składka zdrowotna to the tax advance is not modelled — Urgent when:
  a very low part-time gross reports a net that is too low. Raised by the builder in slice 1.
- A real axe / screen-reader accessibility pass — Urgent when: any slice claims an
  accessibility standard, or a user reports one. Slice 1's criteria cover contrast, focus,
  targets and the live region, but no slice has yet run an audit tool end to end.
- The annual ZUS contribution ceiling (limit 30-krotności) is not modelled — Urgent when:
  any supported input can express an annual income above the ceiling, which slice 3's
  year unit will allow. Until then it only misstates emerytalna and rentowa for high
  earners late in the year, who are not this product's audience. Raised by the designer at
  slice 1, recorded before it could become a defect discovered later.

- The flat 12% ryczałt on a zlecenie or dzieło of 200 zł or less is not modelled, so the
  app over-reports the net below that amount — Urgent when: any supported input or unit
  makes small amounts routine (slice 4's hour and week units do), or a user compares the
  figure against a real rachunek. Raised by the builder in slice 2.
- The student ZUS exemption's own exception — a zlecenie signed with one's own employer —
  is not modelled — Urgent when: a user in that position reports a net that is too high.
  Raised by the builder in slice 2.
- On a student zlecenie the `Zaliczka na PIT` row carries two persistent why-lines at once
  (`Bez składek ZUS…` and `Z ulgą dla młodych…`), both true — Urgent when: a user or the
  checker reads the pair as redundant, or a third relief would make it three lines.
  Raised by the builder in slice 2.
- A language switch deliberately leaves the delta chip standing, because `result` does not
  change and the chip's numerals are formatted per locale at render — Urgent when: a chip's
  text becomes locale-derived beyond number formatting, which would make the standing chip
  read in the previous language. Raised by the builder in slice 2's fix cycle 2.
- P2-G: clearing and retyping the amount re-fires the delta chip although no answer changed
  — the ref guarding the moment resets while `result` is null. The figure it prints is the
  relief's true worth at the new amount, so nothing false is claimed today — Urgent when: a
  chip's text stops being derivable from the current result, e.g. a second relief or copy
  that names the previous state. Raised by the checker at slice 2's final re-check.
- P2-I: clear the amount, change an answer while the field is empty, then retype — the first
  keystroke announces at once and the rest debounce, so one entry produces two utterances.
  `announced.current` is not reset when the result goes null; pre-existing for under-26 and
  student, widened to contract and copyright by the P1-F fix. No false figure — Urgent when:
  slice 3's toggle makes clear-and-retype a normal entry mode, or the announced sentence
  ever carries a relief clause computed on the partial value. Same root-cause family as
  P2-G above, so one fix closes both. Raised by the checker at slice 2's release check.
- No Content-Security-Policy on the built page, so the product's headline promise — nothing
  leaves the browser — holds by convention rather than mechanically. OBSERVED at slice 2's
  security gate: no CSP in index.html, vite.config.ts, public/ or dist/index.html; the built
  artifact makes nine requests, all to its own origin — Urgent when: slice 6 puts this on a
  host, where it belongs as a `default-src 'self'` HEADER and not a meta tag, or the moment
  any third-party asset enters index.html.
- P2-K: the delta chip's zero-guard is untested. MEASURED at slice 2's P1-J re-check: the
  mutant `reliefWorth > 0` -> `>= 0` at `Answer.tsx:97` — the very line that fix rewrote —
  survives the whole suite green, and it is behaviour-bearing: on the mutant build uop
  3 000 zł prints `+0,00 zł z ulgą dla młodych` where HEAD correctly shows no chip —
  Urgent when: the chip's amount derivation changes again, or the relief becomes worth zero
  on a covered contract. With nothing pinning it, that regression lands silently, which is
  exactly how P1-J survived four cycles. Raised by the checker at slice 2's P1-J re-check.
- `field.gross.label` is now rendered nowhere — the direction row supplies both labels —
  and was kept because DESIGN-SLICE-2 §10's deletion list does not name it — Urgent when:
  anything renders it again, or the two EN gross labels drift apart, at which point one of
  them is dead copy pretending to be live. Raised by the builder in slice 3.
- `data-testid="net-amount"` carries the GROSS in netto mode, because the element is the
  answer figure and the answer figure changes meaning with the direction — Urgent when:
  any test or checker reads that id as proof that the figure is a net. Renaming it later
  costs one line; misreading it once costs a false PASS. Raised by the builder in slice 3.
- P2-L: the quick-fill button offers a GROSS legal figure as a NET target in netto mode.
  MEASURED at slice 3's check by a real click at 390: the field `Ile chcesz mieć na koncie`
  took `4806` and the answer read `Kwota na umowie 6 566,15 zł`. Nothing false is printed,
  which is why it is not P1 — Urgent when: slice 4 adds hour/week/month/year to the same
  button, or the minimum wage appears anywhere with a `brutto` qualifier. Either makes the
  shortcut assert something its source does not. Raised by the checker at slice 3's check.
- The netto solve runs on every keystroke — about 4 000 engine calls, MEASURED at ~10 ms
  at full speed and ~157 ms per keystroke under 6x CPU throttling, against brutto's 92 ms
  — Urgent when: a second solved field shares the screen (slice 5's rent and food, or
  slice 4's units multiplying the entries), or measured keystroke latency passes 100 ms on
  a mid-range phone. The fix is a debounce or a memo on the answers, not a faster solver.
  Raised by the architecture gate at slice 3.
- Ponytail says REMOVE on the i18n key `field.gross.label`, now rendered nowhere. It was
  NOT removed at slice 3's gate: the tree sat at a checked PASS and the tag asserts that
  SHA — Urgent when: the next slice touches `strings.ts` for any other reason, which makes
  the deletion free. Merges with the builder's entry above. Raised by ponytail at slice 3.
- P2-S1: the solver's negative-target clamp is untested. `src/engine/solve.ts:47`
  `Math.max(0, Math.round(targetNetGrosz))` — removing it leaves 33/33 Vitest green,
  MEASURED in a sandboxed copy at slice 3's security gate. No live exposure: the only
  caller is `App.tsx` and `parseGross`'s `^\d+(\.\d{0,2})?$` cannot yield a negative —
  Urgent when: any second caller feeds `solveGross` a value that did not pass `parseGross`.
  Raised by the checker at slice 3's security gate.
- P2-S2: nothing asserts the solver's work bound. `WINDOW_GROSZ = 2_000` is enforced only
  by itself; widened to a full-range scan the suite did not return within 180 s — caught by
  hanging, never by an assertion. MEASURED in a sandboxed copy at slice 3's security gate —
  Urgent when: the window, the input cap or `maxGrossGrosz` becomes derived from input
  rather than constant. Raised by the checker at slice 3's security gate.
- P2-S3: `gross` read from localStorage is validated for type but not for length.
  `src/state/storage.ts:44` accepts any `typeof === 'string'`; a 5 MB stored value MEASURED
  830 ms to first paint against a ~95 ms baseline. Same-origin write only, so self-
  inflicted, and the `#gross` input likewise has no `maxLength` — Urgent when: any URL
  param, share link or cross-origin path can write the entry. Raised by the checker at
  slice 3's security gate.
- At 320 px in ENGLISH the card's content box is 299 px against a 286 px client box — a
  13 px horizontal overflow, forced by the slice 3 direction row's `gross → net` /
  `net → gross` nowrap. MEASURED at slice 4's design pass, identical on the HEAD tree and
  the patched tree in all six width×language combinations, so it is pre-existing and not
  slice 4's — Urgent when: any slice touches the direction row's copy or its layout, or a
  320 px device is reported. Raised by the designer at slice 4.
- A unit-aware quick-fill, filling the statutory minimalna stawka godzinowa under the hour
  unit — rejected for slice 4 because it needs a second citation AND exists for zlecenie
  but not for etat, which would make the chip contract-dependent — Urgent when: the hourly
  minimum is quoted anywhere on screen, or a contract-specific quick-fill is asked for.
  Raised by the designer at slice 4.
