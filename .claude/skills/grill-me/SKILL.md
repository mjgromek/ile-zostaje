---
name: grill-me
description: Stress-tests a plan or decision in one bounded round of three to five questions. Use only when material ambiguity remains after intake, never as a routine step.
---

Interview the user once, to resolve ambiguity that would otherwise be guessed at. Number each question and give your recommended answer, then wait.

**One round only. Three to five questions, no more.** There is no second round: at five questions you stop asking, apply the stated defaults for anything still open, and name them. A question only qualifies if its answer changes one of: architecture, data model, public interface, security, user-visible behaviour. Anything else is not asked.

Each question should be formatted like so:

```
❓ **Q1** - **<question title>**: <question body, might be multiple paragraphs, including multiple choices>

➡️ <your recommended answer>
```

Each question also states the **default that applies if it goes unanswered**, so silence is never a block.

Finding _facts_ is your job, never the user's. When a question needs a fact from the environment (filesystem, tools, etc.), dispatch a sub-agent to find it — don't ask the user for anything you could look up yourself. The _decisions_ are the user's — put each to them and wait. **Ask nothing that `PROJECT.md` or the repository already answers**: read them before drafting, and a question whose answer is already written is dropped, not asked.

**"Use defaults" ends the skill immediately.** No follow-up, no confirmation round. Apply every stated default, name them, and hand back.

Adapted from https://github.com/mattpocock/skills. Tightened per PIPELINE_FINAL_PLAN.md section 6.
