<!-- Cap: 45 lines. -->
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
- `NOW:` is ONE sentence. **The time in it is NEVER typed, composed or recalled.** It is
  produced by the shell at the moment of writing:

      printf 'NOW: %s   [%s]\n' "<the sentence>" "$(date '+%H:%M')"

  The agent supplies the sentence; the shell supplies the time. A timestamp a model can
  write is a timestamp a model can invent, and an invented one is worse than none — it makes
  a stale board look like the freshest thing in the repository.
- A `NOW:` line that has not moved is honest and useful: it says how long the current step
  has been running. Staleness is information. A fabricated time destroys that information,
  which is the entire purpose of the field.
- The board is rewritten when a step completes AND when the current step changes — but a
  single long step changes neither. **During any step expected to exceed ten minutes,
  rewrite the `NOW:` line on entry** with what is being waited on and why. A board that goes
  silent during the long steps is silent exactly when it is needed.
- Maximum 12 steps. If a slice needs more than twelve, it is not one vertical slice.
- No prose beyond `NOW:`. No explanation, no reasoning, no file contents. The board answers
  what and how far, never why.
- At slice end, the board is emptied to the single line `No slice in progress.`
