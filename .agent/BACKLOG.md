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
- P2-5: the `rentowa` and `chorobowa` quotes end with `.` where zus.pl prints `,` — they are
  list items rendered as sentences — Urgent when: anyone diffs the quotes character-for-
  character against the source, which the builder's quote test deliberately does not.
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
