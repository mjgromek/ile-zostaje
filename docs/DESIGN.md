> **Historical design document.** This is the specification V0 was built from.
> It is NOT read at runtime and no agent, skill or hook depends on it. Where
> this document and the implementation disagree, **the implementation is
> correct** — it disagrees because building the system exposed something this
> plan got wrong. Known divergences are listed below.

## Divergences from this plan

Each was found during the build and is evidenced against the current files.

| Divergence | Current behaviour, with evidence |
| --- | --- |
| Message-dependent commit rules | Both live in `hooks/commit-msg` (rule A :51-86, rule B :94-106). `hooks/pre-commit:2-4` states why: git runs `pre-commit` before a message exists, so a message-dependent rule cannot live there. `pre-commit` is the secret scan only. §7 put both in `pre-commit`, which is impossible. |
| Orchestrator allowlist | Now `Read, Grep, Glob, Bash, Write, Edit, Skill` (`orchestrator.md:4`). §5 listed `Read, Grep, Glob, Bash` while making it owner of every `.agent/` state file — it was told to enforce caps on files it had no tool to write. `Write, Edit` added in `5b5fd42`/`d98090c`, `Skill` in `d50ab12`, without which no skill is reachable. |
| Skill count | Eight, not the six named in §2 and §6: `architecture-check`, `frontend-design`, `grill-me`, `ponytail`, `security-gate`, `tdd`, plus `theme-factory` (`6920222`, tightened in `d628079`) and `discovery` (`88af69a`). §6's `/security-review` skill is named `security-gate` on disk: Claude Code ships a built-in of the original name, and our skill is the trigger policy for it, not a second copy of it. |
| Hook files | Four executables — `pre-commit`, `commit-msg`, `verify-deploy.sh`, `probe.sh` — plus `hooks/lib/live-assertions.sh`, one shared copy because two copies drift (`live-assertions.sh:3`). §7 named three. |
| Rule A prefixes | Gates `feat:` and `fix:` (`commit-msg:17-19`); `afe38f6` widened it, because without a test a fix is a claim. Rule B deliberately stayed `feat:`-only (`commit-msg:6-7`) — mandatory paperwork on every fix breeds filler. |
| Phase summary | Lives in `.claude/policies/summary.md`; `CLAUDE.md:31-33` points at it and forbids a second copy. Added since §11: the `FILES CHANGED` block with a git-generated stat and the `hold` offer (`summary.md:15-18`), and the `Stakeholder language:` rule (`summary.md:49-54`). |
| Escalation format | `autonomy.md:25-26` now states that a bounded `grill-me` or `discovery` interview is not an escalation and is not limited by the format (`8f0382f`). An agent had read §9's "never an open design discussion" as a ban on interviewing. |
| Intake | §12 and §13 assumed `PROJECT.md` would be filled but named no mechanism. The dry run showed a blank `PROJECT.md` deadlocks a fresh clone: the orchestrator could not write the file. Fixed by giving it `PROJECT.md` write access at intake (`orchestrator.md:10`) and, later, the `discovery` skill. |
| The dry run as integration test | §13 rules out a separate integration test and §12's final block serves that role instead. **This is not reproducible.** The run happened in a deleted scratch directory and left no script, log or artifact in the tree — only commit `4bc3236` and the three fixes it made. Treat §12's dry run as a one-time observation, not a test this repository can re-run. |

Everything below is the original plan, verbatim and unedited.

---

# PIPELINE_FINAL_PLAN.md

V0 of a bounded-autonomy operating system for Claude Code, delivered as a template
repository. Build it in four hours, then use it on a real project.

This file is standalone. It assumes no prior conversation.

---

## 1. Goal and success metrics

**Goal.** Reduce the human's active attention per unit of verified progress. The
attention that gets removed is sequencing and supervision. The attention that stays is
decisions.

**The primary problem.** In the project this design comes from, the human asked "what
next" dozens of times across a ten hour build. Every answer was derivable from the
repository state. That is the single largest attention drain and the orchestrator exists
to remove it.

**The secondary problem.** Four features were reported as built and did not exist. Five
observations were reported as findings without checking the instrument that produced
them. Both classes passed a green test suite and a confident report.

| Metric | V0 target |
| --- | --- |
| Human interventions per slice | 2 or fewer |
| "What next" questions | 0. The orchestrator always states the next action |
| Reported-complete but absent | 0. The checker drives the artifact |
| Repair loops before pass | 2 maximum, then escalate |
| Active human attention | 2 to 3 hours inside an 8 to 10 hour project |
| Escalation precision | Every pause is a decision the human alone could make |

---

## 2. V0 scope and non-goals

**In scope**

- Three agents: `orchestrator`, `builder`, `checker`
- Six skill contracts, tightened rather than rewritten
- Three deterministic hooks, all proven in practice
- Four state files, with hard size caps
- A four level autonomy and escalation matrix
- A vertical slice loop with a bounded fix cycle

**Explicit non-goals**

No fourth agent. No architect or researcher until a real run shows a dedicated role
prevents a mistake. No MCP servers. No dashboard. No vector memory. No task queue. No
PR automation. No Agent SDK migration. No formatter or linter hook until the target
project actually has one. No separate mini-feature integration test: the first real
project is the test.

---

## 3. Constraints inherited, with the evidence

Each is a rule because something specific went wrong.

| Constraint | What happened |
| --- | --- |
| The checker drives the artifact, never the diff alone | Four features shipped as reports and not as code: an undeclared Vue emit, a tooltip whose markup did not exist, an API field with no UI, a form that rendered and never submitted |
| Verify the instrument before trusting the observation | Contrast checked by eye and called passing. A synthetic click misread as a shipped bug. A `zoom` test that rescaled the unit it measured. Live state inferred from boot logic instead of queried |
| Never patch files with `str.replace` or `sed` | Four silent no-ops exited zero, produced identical files, and green builds. Two features were reported built on top of them |
| Agent briefs carry hard caps | A test agent asked for nine tests wrote eighteen, then eleven, and took twenty minutes per run until the brief was capped |
| Independent security review, separate from the builder | A recycled row id used as a session subject produced full admin takeover, reachable in three requests, under 91 passing tests. TDD did not find it. A separate review did |
| Release means verified at the live endpoint | A stale deployment served a pre-auth build on a public URL twice. Local tests were green throughout. Both times a human found it by opening the URL |
| One decision, one record, enforced | A per-commit log gate was the only discipline in the project that never slipped, because a hook refused the commit otherwise |
| Prefer the simplest deterministic interface | Roughly an hour went to MCP setup that a CLI and a dashboard replaced |
| Settle user-visible design once | Status indicators went pills, dots, pills. Renter visibility reversed three times |

---

## 4. Repository structure

A template repository. Clone it, or copy `.claude/` and `.agent/` into an existing
project.

```
.claude/
  agents/
    orchestrator.md
    builder.md
    checker.md
  skills/
    grill-me/
    tdd/
    ponytail/
    security-review/
    architecture-check/
    frontend-design/
  policies/
    autonomy.md
hooks/
  pre-commit
  verify-deploy.sh
  probe.sh
.agent/
  STATE.md
  DECISIONS.md
  BACKLOG.md
CLAUDE.md
PROJECT.md
```

`CLAUDE.md` holds rules that apply every session. `PROJECT.md` holds the objective and
does not change. `.agent/` holds what moves. There is no `CURRENT_PHASE.md`: the current
slice lives at the top of `STATE.md`, because two files describing the same thing is how
they drift.

---

## 5. Agent contracts

### orchestrator

**Owns:** sequencing, state, slicing, delegation, summaries.
**Tools:** Read, Grep, Glob, Bash. Write access limited to `.agent/`.
**Cannot:** write product code or tests.

Its first job on every invocation is to answer "what next" without being asked. It reads
the repository and `.agent/STATE.md`, determines the stage, states the next action and
why, and either executes it or escalates.

Output is always the phase summary format in section 11. Never an essay.

It applies the autonomy matrix. Level 0 and 1 it acts on. Level 2 and 3 it stops.

### builder

**Owns:** one slice, end to end.
**Tools:** Read, Grep, Glob, Edit, Write, Bash.
**Cannot:** declare a slice complete. That is the checker's word.

Works from the acceptance criteria in `.agent/STATE.md`. Writes the failing test first
and commits it before the implementation, because the pre-commit hook enforces that
order. Implements the minimum that passes. Does not expand scope.

**Standing rules.** Never patch with `str.replace` or `sed`; use the editing tool, which
fails loudly on a non-match. A green build is not evidence that an edit landed. Report in
five lines or fewer.

### checker

**Owns:** review and verification, merged.
**Tools:** Read, Grep, Glob, Bash, WebFetch. **No write access.**
**Cannot:** fix anything. It reports.

Two passes, in order.

*Review.* Does the diff meet the acceptance criteria? What in the diff is untested,
particularly authorization paths, error branches and concurrency? Returns `PASS` or
findings at P0, P1, P2. `PASS` is a legitimate outcome. Never invent a finding.

*Verify.* Runs the tests fresh rather than trusting the report. Then **exercises the
thing that was built**: calls the endpoint, drives the UI, reads the actual output. A
diff that looks right and an artifact that works are different claims, and only the
second one matters.

**Standing rule.** Before reporting an observation as a finding, state how it was
measured and whether the instrument could have produced it. Five separate false findings
in the source project came from trusting an instrument nobody checked.

---

## 6. Skill contracts

| Skill | Contract |
| --- | --- |
| `/grill-me` | Three to five questions, only where the answer changes architecture, data model, public interface, security or user-visible behaviour. Each states why it matters and the default if unanswered. Accepts "use defaults" and stops. |
| `/tdd` | Minimum failing test from the acceptance criteria. Confirm it fails for its own reason, not an import error. Implement minimally. No speculative tests. Hard cap: the named criteria plus at most two implied guards, and say which. |
| `/ponytail` | Simplicity gate. KEEP, SIMPLIFY or REMOVE per item. Never cuts validation, error handling, security or accessibility. |
| `/security-review` | Risk triggered only: auth, secrets, filesystem or network, user input, database mutation, LLM tools, deployment. Not for styling work. Mandatory before any release that touched those areas. |
| `architecture-check` | Prefers NO CHANGE. Only reports a concrete correctness, boundary or scaling problem. At most two items marked FIX NOW. |
| `frontend-design` | Only when UI is in scope. Requires a declared aesthetic before any CSS. Never runs on a backend-only slice. |

---

## 7. Hooks

Three, all proven. Nothing aspirational.

### `hooks/pre-commit`

Enforces two things, and refuses the commit otherwise.

1. **Test-first ordering.** A `feat:` commit must be preceded by a `test:` commit
   touching an overlapping path. This replaces a separate test-writing agent: the
   discipline becomes a property of the history rather than a promise.
2. **Decision record.** A commit that adds an ADR, changes a public interface, or is
   tagged `feat:` must stage `.agent/DECISIONS.md`.

Plus a secret scan on the staged diff.

Wire it with `git config core.hooksPath hooks` and document that line in the README,
because a fresh clone does not inherit it.

### `hooks/verify-deploy.sh`

Runs after any deploy. A deploy is not done until it passes.

Asserts against the live URL, not localhost: an unauthenticated request to a protected
route is refused, the health endpoint answers, a real credential logs in, and a known
resource returns. Waits for the new build to actually serve rather than trusting a health
check, which can answer from the old container.

### `hooks/probe.sh`

The same assertions on a schedule, from outside the deploy platform. A stale build
between deploys is invisible to a deploy-time check, which is exactly how it went
unnoticed twice.

**Exit code is not proof.** Any hook that transforms a file must assert the postcondition,
not the exit status.

---

## 8. State schema

Four files. Hard caps, enforced by the orchestrator on every write.

| File | Contents | Cap |
| --- | --- | --- |
| `PROJECT.md` | Objective, users, constraints, non-goals, invariants, definition of done. Changes rarely | 60 lines |
| `.agent/STATE.md` | Current slice and its acceptance criteria at the top, then: what is shipped, what is in flight, what is blocked, last verification result | 120 lines |
| `.agent/DECISIONS.md` | One entry per material decision: what, why, what it rules out. Append only | 8 lines per entry |
| `.agent/BACKLOG.md` | Deferred items, each with the condition that makes it urgent | No cap, but entries are deleted when done or false |

**Compaction rule.** When `STATE.md` exceeds its cap, the orchestrator moves settled
facts into `DECISIONS.md` and deletes them from state. State describes now. Decisions
describe why.

---

## 9. Autonomy and escalation

| Level | Examples | Behaviour |
| --- | --- | --- |
| 0, automatic | Implementation matching existing patterns, tests, local refactor, docs, naming | Act. Report in the phase summary |
| 1, do and report | A small dependency, an internal interface change, an index, a non-breaking implementation choice | Act. Name it in the summary |
| 2, propose and wait | A new external service, a schema migration, an auth model change, a breaking interface, material scope expansion, any user-visible design direction | Stop. One decision, one recommendation |
| 3, explicit approval | Production deletion, secret or access changes, billing, irreversible external effects, publishing data | Never without a direct yes |

**A bug fix is Level 0 only when a test now covers it.** In the source project, four
"obvious fixes" were reported complete and did not exist. Without a test, a fix is a
claim.

**User-visible design direction is Level 2.** Status indicators reversed twice and
renter visibility three times, each costing a full cycle plus a superseded document
entry.

**Escalation format.** One decision. The recommended option. What each option costs. What
is blocked until it is answered. Never an open design discussion.

---

## 10. The vertical slice loop

```
REQUEST
  -> orchestrator: intake
       objective, acceptance criteria, non-goals, risk flags
       /grill-me only if material ambiguity remains
  -> orchestrator: slice
       one coherent increment: data, logic, interface, tests
       written into STATE.md before any code
  -> builder: red
       failing test, committed as test:
  -> builder: green
       minimum implementation, committed as feat:
       pre-commit hook enforces the order
  -> checker: review
       PASS -----------------------------+
       P1 -> bounded fix, max 2 cycles ---+--> checker: verify
       P2 -> BACKLOG.md -----------------+       fresh tests
       P0 -> escalate                            drive the artifact
  -> orchestrator: phase summary
  -> next slice
```

**Slices are vertical.** "Add an item, persist it, expose it, test it" is a slice.
"The backend" is not. The source project ran backend-heavy phases and paid for it when
the UI turned out to be wrong while the tests were green.

**Fix loops stop at two.** A third attempt on the same finding means the finding is
misunderstood. Escalate with what was tried.

---

## 11. Gates and summaries

**Phase gate.** Run the triggered critics in parallel: `/security-review` if the phase
touched auth, secrets, input or deployment; `architecture-check` if module boundaries
moved; `/ponytail` if the diff grew faster than the behaviour; `frontend-design` only if
UI shipped.

**Release gate.** Fresh install, fresh build, full suite, `/security-review` if triggered,
deploy, then `verify-deploy.sh` against the live URL. Only then `SHIPPED`.

**Phase summary**, the only format the human reads:

```
PHASE COMPLETE
Shipped:      <what changed>
Verified:     <how, including what was actually exercised>
Decided:      <Level 1 choices worth naming, or NONE>
Deferred:     <P2 items, or NONE>
Needs you:    NONE | <one decision, with a recommendation>
Next:         <the next slice>
```

---

## 12. The four hour build

| Time | Work | Done when |
| --- | --- | --- |
| 0:00 to 0:25 | Skeleton and policy | Folder structure exists. `CLAUDE.md`, `PROJECT.md`, `.claude/policies/autonomy.md` written. No polish |
| 0:25 to 1:25 | Three agent contracts | `orchestrator.md`, `builder.md`, `checker.md` written with tools, boundaries, standing rules and the output format. Each under 50 lines |
| 1:25 to 2:00 | Skill contracts | Six skills tightened per section 6. Caps stated numerically, not as guidance |
| 2:00 to 2:50 | Hooks | `pre-commit` enforcing test-first ordering, decision records and a secret scan. `verify-deploy.sh` and `probe.sh` written and runnable. Each tested by making it fail on purpose |
| 2:50 to 3:20 | State files | Four files with caps, plus the compaction rule in the orchestrator contract |
| 3:20 to 4:00 | Dry run and cut | Give the orchestrator a one sentence request against an empty project. Watch where it asks something it could have derived, or acts where it should have stopped. Fix at most three things. Stop |

**Stop condition.** At four hours, ship V0 even if imperfect. The next real project is
the test, not another day of pipeline.

---

## 13. First real use

There is no separate integration test. Building a throwaway feature to exercise the
pipeline is the detour this design exists to prevent.

The first real project is the benchmark. Run it, measure section 1's table, and fix only
what the run proves.

---

## 14. Benchmark: GCP AI Incident Investigator

A good stress test because it combines backend work, cloud configuration, an AI layer,
security and deployment verification.

| Area | Expectation |
| --- | --- |
| Service | Small FastAPI app on Cloud Run with deliberately introduced failure scenarios |
| Evidence | Cloud Logging, Cloud Monitoring, runbooks in Cloud Storage, deployment metadata |
| AI layer | Gemini or Vertex with bounded diagnostic tools |
| Tools | `query_service_logs()`, `get_service_metrics()`, `search_runbook()`, `get_recent_deployments()` |
| Security | Dedicated least-privilege service account. No broad project permissions. No service account JSON keys |
| Human role | Diagnostic only. No autonomous rollback, no production mutation |
| Release | Deploy plus remote smoke against the live endpoint |

**Where this will stress the pipeline.** Cloud IAM is Level 3 territory and the
escalation matrix will be exercised properly for the first time. Deployment verification
against Cloud Run is exactly the class of check that failed twice before. The AI layer's
tool boundaries are a `/security-review` trigger.

---

## 15. V1 backlog

Add only when a run proves the need.

- A fourth agent, architect or researcher, if a run shows a dedicated role prevents a
  mistake the checker missed
- A formatter and linter hook, once a target project has them configured
- Parallel critics at the phase gate, if serial running becomes the bottleneck
- Cross-slice dependency tracking, if slices start blocking each other
- A `handoff` mechanism for context resets longer than the state files cover

---

## 16. Definition of done for V0

- [ ] Three agent contracts exist, each under 50 lines, each with tools, boundaries and standing rules
- [ ] Six skill contracts exist with numeric caps
- [ ] `pre-commit` refuses a `feat:` commit with no preceding `test:` commit, verified by trying it
- [ ] `pre-commit` refuses a commit that should carry a decision record and does not
- [ ] `verify-deploy.sh` fails against a URL serving the wrong build, verified by pointing it somewhere wrong
- [ ] `probe.sh` runs from outside the deploy platform
- [ ] Four state files exist with caps stated in the orchestrator contract
- [ ] The autonomy matrix is in `.claude/policies/autonomy.md` and referenced by every agent
- [ ] A dry run produces a phase summary in the section 11 format without being asked for one
- [ ] The orchestrator answers "what next" before the human asks

---

## 17. Handoff prompt

Paste into a fresh Claude Code chat together with this file.

```
Implement PIPELINE_FINAL_PLAN.md. Do not redesign it.

Build V0 exactly as specified: three agents, six skill contracts, three hooks, four
state files, the autonomy matrix. Four hour timebox. At four hours, ship what exists.

Rules while building:
- Use the editing tool. Never str.replace or sed. A green build is not evidence an edit
  landed.
- Test each hook by making it fail on purpose before calling it done.
- Report in five lines or fewer per block. No essays.
- Section 12 is the schedule. Follow the block order.

Stop and ask me only for Level 2 or Level 3 decisions as defined in section 9. For
everything else, decide and note it in the summary.

If something in the plan is wrong or impossible, say so and stop. Do not work around it
silently.

Start with block 0:00 to 0:25 and report when the skeleton exists.
```
