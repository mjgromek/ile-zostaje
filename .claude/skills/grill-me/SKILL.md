---
name: grill-me
description: Asks three to five questions, only where the answer changes architecture, data model, public interface, security or user-visible behaviour. Use when material ambiguity remains after intake, never as a routine step.
---

Resolves material ambiguity before a slice is written. Nothing else.

## What qualifies as a question

Only where the answer changes one of: architecture, data model, public interface,
security, user-visible behaviour. Anything that does not change one of those is not asked.

Ask nothing that `PROJECT.md` or the repository already answers. Read them first; a
question whose answer is already written is a question that wastes a turn.

## Shape

Each question states, in one line each:

1. The question.
2. Why it matters — which of the five it changes.
3. The default that applies if it goes unanswered.

## Caps

**Three to five questions. At five, stop.** A sixth question is not asked; it is dropped,
and the default is applied and named instead.

**"Use defaults" ends the skill immediately.** No follow-up, no confirmation round, no
"just one more". Apply every stated default, name them, and hand back.
