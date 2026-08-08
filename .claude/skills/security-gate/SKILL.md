---
name: security-gate
description: Trigger policy for Claude Code's built-in /security-review. Risk triggered only - auth, secrets, filesystem or network access, user input, database mutation, LLM tool exposure, deployment. Mandatory before a release that touched one.
---
<!-- Cap: 40 lines, whole file. Over cap is a bug: cut content, never a rule. -->

This skill decides *when* the built-in `/security-review` runs. It is the trigger policy,
not a reimplementation of the review — the review itself is Claude Code's, and this skill
never performs one. It is named `security-gate` so it cannot collide with the built-in.
The review stays independent: never run by whoever wrote the code.

## Triggers

Runs only when the change touches one of: authentication or authorization; secrets,
credentials or key material; filesystem or network access; user-supplied input; database
mutation; LLM tool exposure; deployment or infrastructure.

## Procedure

1. **State which trigger fired**, in the first line. A review that cannot name its
   trigger should not have run.
2. Run the built-in `/security-review` over the change.
3. Grade every finding P0, P1 or P2, like any checker finding: P0 escalates, P1 is a
   bounded fix of at most two cycles, P2 is a deferral the orchestrator records.

## Refusals

**Does not run on styling or copy work.** No trigger fired means it declines in one line.
Running it anyway manufactures findings out of a diff that has none.

**Mandatory before any release that touched a trigger area.** Where a trigger fired and
this has not run, the release is blocked — not warned about.
