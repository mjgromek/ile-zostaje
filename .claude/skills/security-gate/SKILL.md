---
name: security-gate
description: Trigger policy for Claude Code's built-in /security-review. Risk triggered only - auth, secrets, filesystem or network access, user input, database mutation, LLM tool exposure, deployment. Mandatory before a release that touched one.
---
<!-- Cap: 40 lines, whole file. Over cap is a bug: cut content, never a rule. -->

Decides *when* a security review runs and *who* performs it. Named `security-gate` so it
cannot collide with the built-in. The review is never run by whoever wrote the code.

**No agent can execute `/security-review`** — it is a slash command and no `tools:` line
here carries `SlashCommand`. A step no role can perform is a gate-shaped hole that
self-certifies, so the review goes to `checker` and the built-in goes to the human, who can
type it. Rationale and rejected alternatives: R2-F22 in `archiwum ustaleń w mjgromek/easydev-agentic-pipeline`.

## Triggers

Runs only when the change touches one of: authentication or authorization; secrets,
credentials or key material; filesystem or network access; user-supplied input; database
mutation; LLM tool exposure; deployment or infrastructure.

## Procedure

1. **State which trigger fired**, in the first line. A review that cannot name its
   trigger should not have run.
2. **Delegate the review to `checker`**, briefed to the fired trigger and the diff. Report
   verbatim, unprompted: **"the built-in /security-review did NOT run — no agent can
   execute a slash command."** Without it a hand review is read as the built-in's output.
3. **Hand the human `/security-review`** on its own line, so they can run the real thing.
4. Grade every finding P0, P1 or P2, like any checker finding: P0 escalates, P1 is a
   bounded fix of at most two cycles, P2 is a deferral the orchestrator records.

## Refusals

**Does not run on styling or copy work.** No trigger fired means it declines in one line.
Running it anyway manufactures findings out of a diff that has none.

**Mandatory before any release that touched a trigger area.** Where a trigger fired and
this has not run, the release is blocked — not warned about. The block is on step 2, which
is executable; never on the built-in. A rule that must be broken to ship trains everyone
to break it.
