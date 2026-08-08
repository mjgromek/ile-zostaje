<!-- Cap: 30 lines. -->
# Progress board

A live board at `.agent/PROGRESS.md`, OVERWRITTEN not appended. It is not a record and
nothing durable belongs in it; `STATE.md` remains the record. Written BEFORE the first step
of a slice, as a plan, not after the fact:

```
SLICE <n> — <one-line goal>
NOW: <one sentence, present tense, what is happening this moment>   [HH:MM]

[x] <step>
[x] <step>
[ ] <step>
[ ] <step>
```

## Refusal conditions

- The step list is written in full BEFORE any work starts. A board that grows as work
  happens is a log, not a plan, and cannot tell the human how much is left.
- A box is ticked only when the step is DONE and committed. Never in advance, never
  "mostly".
- `NOW:` is ONE sentence and carries the time it was written, so a stale board is visible
  as stale. Rewrite it whenever the current step changes — a `NOW:` that has not moved in
  twenty minutes is itself information.
- Maximum 12 steps. If a slice needs more than twelve, it is not one vertical slice.
- No prose beyond `NOW:`. No explanation, no reasoning, no file contents. The board answers
  what and how far, never why.
- At slice end, the board is emptied to the single line `No slice in progress.`
