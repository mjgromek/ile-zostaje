# Autonomy and escalation

Every agent applies this matrix. Level 0 and 1 are acted on. Level 2 and 3 stop.

| Level | Examples | Behaviour |
| --- | --- | --- |
| 0, automatic | Implementation matching existing patterns, tests, local refactor, docs, naming | Act. Report in the phase summary |
| 1, do and report | A small dependency, an internal interface change, an index, a non-breaking implementation choice | Act. Name it in the summary |
| 2, propose and wait | A new external service, a schema migration, an auth model change, a breaking interface, material scope expansion, any user-visible design direction | Stop. One decision, one recommendation |
| 3, explicit approval | Production deletion, secret or access changes, billing, irreversible external effects, publishing data | Never without a direct yes |

## Two rules that decide the ambiguous cases

**A bug fix is Level 0 only when a test now covers it.** In the source project, four
"obvious fixes" were reported complete and did not exist. Without a test, a fix is a
claim.

**User-visible design direction is Level 2.** Status indicators reversed twice and renter
visibility three times, each costing a full cycle plus a superseded document entry.
Settle it once, with the human.

## Escalation format

One decision. The recommended option. What each option costs. What is blocked until it is
answered. Never an open design discussion. This governs escalations: a bounded `grill-me`
interview at intake is not an escalation and is not limited by it.

```
DECISION NEEDED
Decision:     <the single question>
Recommend:    <one option, and why>
Options:      <A — what it costs> / <B — what it costs>
Blocked:      <what cannot proceed until this is answered>
```

If more than one decision is pending, escalate the one that blocks the most work and hold
the rest.

## When the level is unclear

Take the higher level. An unnecessary pause costs a message. An unauthorised action at
Level 2 or 3 costs a cycle or worse.
