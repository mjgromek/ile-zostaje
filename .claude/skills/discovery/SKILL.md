---
name: discovery
description: Structured stakeholder interview run once per project, before anything exists, producing PROJECT.md and slice one. Runs when PROJECT.md is the unfilled template. Not for mid-build ambiguity — that is grill-me.
---
<!-- Cap: 65 lines, whole file. Over cap is a bug: cut content, never a rule. -->

Once per project, when `PROJECT.md` is the unfilled template — the orchestrator's first
action at intake. **REFUSES to run against a filled `PROJECT.md`:** a settled objective is
not reopened. Not `grill-me`, which is one bounded round on a mid-build ambiguity. Say up
front that this takes twenty to thirty minutes. **Before the first question, read the
environment and state what you found:** language and framework in the repo, cloud provider
if configured, git remote, existing services, anything in the working directory. Finding
facts is your job, never the human's: never ask what you could determine yourself, and say
out loud what you determined.

**Five rounds, in this order, because each depends on the last. Maximum four questions per
round**, each carrying a recommended answer, so "yes to all" is a complete reply.
1. **PROBLEM** — what is painful today, who feels it, what it costs them now. Not "what do
   you want built". **If an answer names a solution, ask what problem that solution
   solves.** Stakeholders describe solutions; the problem is underneath. This is the most
   important instruction in this file.
2. **OUTCOME** — what good looks like, how we will know it happened. Push for something
   observable: "faster" is not an outcome, "an on-call engineer finds the cause without
   opening the console" is. **A brief that specifies WHAT to build does not answer what the
   result should be like to use. Ask this round regardless.** If the answer names only
   capabilities, ask again: what should the user see, understand and be able to do at a
   glance? An outcome nobody stated becomes whatever the default implementation happens to
   produce.
3. **USERS AND CONSTRAINTS** — who touches this, how often, how technical. What is already
   fixed and not up for debate: stack, cloud, budget, data residency, compliance, systems
   it must live beside. **When an interface is in scope, the service stack and the
   INTERFACE stack are two questions, asked separately.** Language and framework for the
   backend; language, framework and build approach for anything a person looks at. A single
   "what stack" answer settles the first and lets the second be derived by whatever rule is
   loudest — which is how a UI ends up as strings inside application logic. Both are Level
   2: expensive to reverse, and the interface one is user-visible. Present options with a
   recommendation and wait. Record both in `PROJECT.md`.
4. **NON-GOALS AND INVARIANTS** — what we are deliberately not building, and what must
   never break. Ask directly: "what would make this a failure even if it worked?"
5. **DONE** — what must be true to call it shipped, who decides, what gets demonstrated
   and to whom.

**Then the playback, mandatory, before writing anything.** State your understanding back
plainly — problem, outcome, users, constraints, non-goals, invariants, done — and ask for
a correction. One round only, no second playback: a misunderstanding caught here costs a
sentence, caught in slice four it costs a cycle.

**"use defaults"** ends the current round immediately, applying every recommendation and
naming them. **"that's enough"** ends discovery entirely, at any point: write `PROJECT.md`
from what you have and list every unanswered area under an explicit **"Assumed, not
confirmed"** heading. Never pretend to know what you guessed — a silent assumption reads
as knowledge.

**Refusal conditions — five rounds maximum, four questions per round, twenty questions
total, absolute.** There is no sixth round, ever; at the fifth question the round stops;
at twenty, stop asking and write. **Never ask the same thing twice in different words.**
**Never ask about visual design** — that is `theme-factory`'s Level 2 gate.

**It ends in work: discovery with no first slice has failed.**
1. Write `PROJECT.md`: objective, users, constraints, non-goals, invariants, definition of
   done, stakeholder language. Cap 60 lines, so summarise rather than transcribe.
2. Ask once: "Summary language for this project? English or Polish." Any other language is
   accepted; silence means English. Not a Level 2 gate — do not wait on it.
3. Out-of-scope items go to `.agent/BACKLOG.md` with the condition that makes them urgent.
4. Propose slice one with acceptance criteria and hand to the orchestrator.
