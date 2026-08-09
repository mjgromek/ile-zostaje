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
- The annual ZUS contribution ceiling (limit 30-krotności) is not modelled — Urgent when:
  any supported input can express an annual income above the ceiling, which slice 3's
  year unit will allow. Until then it only misstates emerytalna and rentowa for high
  earners late in the year, who are not this product's audience. Raised by the designer at
  slice 1, recorded before it could become a defect discovered later.

