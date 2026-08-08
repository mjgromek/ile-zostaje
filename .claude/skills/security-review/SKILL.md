---
name: security-review
description: Risk-triggered security review, independent of the builder. Triggers on auth, secrets, filesystem or network access, user input, database mutation, LLM tool exposure, deployment. Mandatory before any release that touched a trigger area.
---

An independent pass, never run by whoever wrote the code.

## Triggers

Runs only when the change touches one of:

- Authentication or authorization
- Secrets, credentials or key material
- Filesystem or network access
- User-supplied input
- Database mutation
- LLM tool exposure
- Deployment or infrastructure

**State which trigger fired**, in the first line of the report. A review that cannot name
its trigger should not have run.

## Refusals

**Does not run on styling or copy work.** No trigger fired means it declines and says so,
in one line. Running anyway manufactures findings.

**Mandatory before any release that touched a trigger area.** A release without it, where
a trigger fired, is blocked — not warned about.
