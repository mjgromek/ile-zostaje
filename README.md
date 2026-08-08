<!-- No line cap. No PROSE section longer than 18 lines. Tables and reproduced
formats are exempt: each is one thing, and splitting it makes it wrong. -->

# EasyDev — Agentic Engineering Pipeline

A bounded-autonomy operating system for Claude Code: three agents, eight skills, four
deterministic hooks.

*You describe the problem. It builds and verifies vertical slices, and interrupts you only
for the decisions you alone can make.*

## 🔥 Why it exists

Every rule here was bought with a failure. In the source project, a ten-hour build had the
human answering "what next?" dozens of times, when every answer was already derivable from
the repository. Four features were reported built and did not exist, under a green suite.
Five findings were reported without anyone checking the instrument that produced them. A
recycled database row id was reachable as another user's session in three requests, under
91 passing tests, which is full admin takeover. A stale deployment served a pre-auth build
on a public URL twice, because a deploy-time health check answered from the old container.
Every rule in this repository traces to one of those.

## ⚡ Quickstart

```bash
git clone https://github.com/mjgromek/easydev-agentic-pipeline.git my-project
cd my-project   # the session's working directory must be INSIDE the clone
git config core.hooksPath hooks
claude   # then ask for the orchestrator: it reads the repo and states the next action
```

**Start the session with its working directory inside the clone.** Agents and skills are
enumerated once, when the session starts, from that directory. Clone into a subdirectory and
start the session in the parent, and `.claude/` sits one level below the root: none of the
three agents and none of the eight skills exist, and nothing warns you. Definitions added
after a session has started are not picked up either — restart.

**Preflight — the first thing to do in any new session, before any work.** Ask for the list
of available agent types and confirm `orchestrator`, `builder` and `checker` are in it. If
they are not, the session is rooted outside the clone or was started before the files
existed: restart inside the clone. Skip this check and a request for the orchestrator falls
through to `general-purpose`, which holds every tool and will appear to work.

**A clone does not wire the hooks — that `core.hooksPath` line is required, once per
clone.** This repository deliberately does not wire its own: it has no tests and no product
code, so the test-first rule would refuse every commit to the template itself.

## 📋 What a slice looks like

This block is the only thing you read per phase. It is generated, capped at 26 lines, and
refuses vague values — "all tests pass" is rejected because it names nothing exercised.

```text
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅  SLICE 3 COMPLETE — Warranty Tracker
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

🎁 WHAT YOU CAN DO NOW
   Add an appliance and see how much cover is left. Appliances are stored
   in warranty.db in the project folder.

🔍 HOW I KNOW IT WORKS
   Added "Fridge", 5 years cover from 2024-03-01: the list shows 236 days
   left. Restarted the app; it was still there.

📝 FILES CHANGED
   src/warranty/models.py | 34 ++++++++++++
   src/warranty/cli.py    | 21 ++++++--
   tests/test_models.py   | 48 ++++++++++++++++
   3 files changed, 98 insertions(+), 5 deletions(-)
   Nothing needs your eyes.
   Continuing to slice 4. Say `hold` to stop before it starts.

⚙️  DECIDED     Dates stored as ISO strings — stopped at the stdlib rung
📥 DEFERRED    CSV import — urgent when a user has more than 20 appliances
🙋 NEEDS YOU   Nothing
➡️  NEXT        Slice 4 — warn 30 days before expiry
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

## 🧩 What's inside

| Agent | Owns | Cannot do |
| --- | --- | --- |
| orchestrator | Sequencing, slicing, state, delegation, the summary | Write product code or tests |
| builder | One slice end to end: failing test first, then the minimum | Declare a slice complete; write `.agent/` |
| checker | Review against criteria, then exercising the artifact | **Write anything — it has no write access** |

| Skill | What it does | Hard cap |
| --- | --- | --- |
| discovery | One-time intake interview; writes `PROJECT.md` and slice one | 5 rounds, 4 questions each, 20 total |
| grill-me | Resolves one mid-build ambiguity that would be guessed at | 1 round, 3–5 questions |
| tdd | Red, green, refactor for the slice's tests | Criteria plus at most 2 implied guards |
| ponytail | Simplicity gate over a diff at the phase gate | One verdict and one line of reason per item |
| architecture-check | Boundary and scaling review when module boundaries moved | At most 2 items marked FIX NOW |
| security-review | Trigger policy for the built-in `/security-review` | Risk-triggered only; else declines in a line |
| theme-factory | Settles palette and type once, on the project's real screen | Once per project; at most 2 re-render rounds |
| frontend-design | Visual direction when UI is in scope | UI slices only; palette belongs to theme-factory |

| Hook | What it refuses |
| --- | --- |
| `hooks/pre-commit` | A staged line matching one of seven secret patterns. Override: `--no-verify` |
| `hooks/commit-msg` | A `feat:`/`fix:` with no preceding `test:` on an overlapping path; a `feat:` that does not stage `.agent/DECISIONS.md` |
| `hooks/verify-deploy.sh` | Calling a deploy done while `/version` has not served `EXPECTED_REVISION` within 120s, or any live assertion fails |
| `hooks/probe.sh` | Silence between deploys: the same assertions on cron, non-zero when the live site stops satisfying them |

## 🛡 The four guardrails

**The checker drives the artifact, never the diff alone, and it has no write access at
all.** Four features were reported built and did not exist. It reports and never fixes, so
it cannot quietly make its own verdict true.

**Verify the instrument before trusting the observation.** Five false findings came from
instruments nobody checked — contrast judged by eye, a test that rescaled the unit it
measured. A finding states how it was measured.

**Exit code is not proof — assert the postcondition.** A silent no-op patch exits zero and
leaves the file identical, which is how edits were reported as landed when they were not.

**One decision, one record, enforced by a hook rather than by discipline.** Status
indicators reversed twice, renter visibility three times; `commit-msg` now refuses a
`feat:` commit that does not stage `.agent/DECISIONS.md`.

## 🎚 Autonomy

| Level | Example | Behaviour |
| --- | --- | --- |
| 0, automatic | Implementation matching existing patterns, tests, docs | Act; report in the summary |
| 1, do and report | A small dependency, an internal interface change | Act; name it in the summary |
| 2, propose and wait | A schema migration, an auth change, any user-visible design direction | Stop; one decision, one recommendation |
| 3, explicit approval | Production deletion, secrets, billing, irreversible effects | Never without a direct yes |

The matrix and the escalation format live in `.claude/policies/autonomy.md`, the only copy.

## ⚙️ Configuration

Read by `verify-deploy.sh` and `probe.sh` through `hooks/lib/live-assertions.sh`. An unset
optional variable is skipped aloud, never silently.

| Variable | Required | If unset |
| --- | --- | --- |
| `BASE_URL` | yes | `FATAL BASE_URL is unset. Nothing was asserted.`, and the run fails |
| `PROTECTED_PATH` | yes | `FATAL PROTECTED_PATH is unset. Nothing was asserted.`, and the run fails |
| `HEALTH_PATH` | no | Defaults to `/health` |
| `RESOURCE_PATH` | no | A4, the resource assertion, is skipped |
| `TEST_USER`, `TEST_PASS` | no | A3 login and A4 resource are skipped |
| `LOGIN_PATH` | no | A3 login is skipped |
| `EXPECTED_REVISION` | verify-deploy only | The revision gate is skipped, and a health check can answer from the old container |
| `VERSION_PATH` | no | Defaults to `/version` |
| `REVISION_TIMEOUT` | no | Defaults to 120s; a shorter value prints `SHORTENED revision gate` |

On Railway, `BASE_URL` is the public domain, `EXPECTED_REVISION` is the deployment SHA,
and `PROTECTED_PATH` is required. The scripts are platform-agnostic — they take a URL.

### Running the probe from cron

```sh
*/10 * * * * BASE_URL=https://app.example.com PROTECTED_PATH=/api/me \
  /path/to/hooks/probe.sh >> /var/log/probe.log 2>&1
```

## 🚫 What this deliberately does not do

- No branch or pull request automation
- No MCP servers
- No dashboard or web UI
- No vector memory or embedding store
- No task queue or parallel agents
- No fourth agent

Each of these sits in `.agent/BACKLOG.md` with the condition that would make it urgent.

## 📍 Status

V0 is cut. Nine of the ten definition-of-done items are evidenced, and the four hooks are
proven by sixteen fail-on-purpose cases in `./hooks/test/run-hook-tests.sh`. Clone this
repository and run that script: it builds its own throwaway repositories, needs no
configuration, is safe to run in a repository with its own hooks wired, and checks every
refusal case against `git log` rather than trusting an exit code. **The builder and checker loop has not yet run end to end on a
real project**, so nothing here should be read as a proven result.

The original design specification is in `docs/DESIGN.md`. It is a historical record, not a
runtime dependency — nothing reads it, and the implementation wins wherever the two
disagree.

## 📜 Credits

`tdd` and `grill-me` are adapted from
[mattpocock/skills](https://github.com/mattpocock/skills); `frontend-design` and
`theme-factory` from [anthropics/skills](https://github.com/anthropics/skills); the
`ponytail` ladder from [dietrichgebert/ponytail](https://github.com/dietrichgebert/ponytail)
(MIT). Each vendored skill keeps its own licence file in its own directory. All are
tightened forks with no automatic update path — upstream fixes do not arrive on their own.
