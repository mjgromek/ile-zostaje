# Phase summary format

The one thing the human reads every phase. Two layers: prose to understand, fields to act.

```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅  SLICE <n> COMPLETE — <project name>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎁 WHAT YOU CAN DO NOW
   <plain language: what the app can do that it could not before.
    If storage changed, name where the data actually lives.>

🔍 HOW I KNOW IT WORKS
   <what was actually exercised, and the real result observed>

⚙️  DECIDED     <Level 1 choices, and the ponytail rung stopped at — or NONE>
📥 DEFERRED    <P2 items — or NONE>
🙋 NEEDS YOU   <Nothing — or the one decision, with a recommendation>
➡️  NEXT        <the next slice>
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## Refusal conditions

**WHAT YOU CAN DO NOW — at 4 lines, cut it.** Maximum 3. Plain language a non-programmer
understands. No file names, no function names, no library names. The one exception: where
data is stored, which is always named when it changed. Capability, never implementation.

**HOW I KNOW IT WORKS — at 4 lines, cut it.** Maximum 3. Must name what was actually
exercised and the result observed. **"All tests pass" is a REFUSED value** — it is the
exact report this pipeline exists to distrust, and it names nothing that was exercised.
"Added Fridge, listed it, 236 days shown" is the shape.

**The four labelled lines are one line each.** At two lines the content moves to DEFERRED
or gets cut. It does not wrap.

**If NEEDS YOU is anything other than "Nothing", the whole block moves above the banner.**
A decision blocking work must not sit at line twelve.

**At 21 lines, it is an essay.** Maximum 20. Section 11's "never an essay" still governs:
cut content, do not shrink the format.
