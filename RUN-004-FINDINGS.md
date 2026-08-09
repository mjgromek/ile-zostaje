# RUN-004 findings

Defects in the pipeline. Product defects are the checker's P0/P1/P2 and are not here.

## R4-F1 — RECURRENCE of R2-F29, occurrence 3: Grep and Glob declared by four agents, arriving in none
**Observed or inferred:** MIXED, split deliberately.
OBSERVED — this occurrence, by calling the tools inside each of the four agents.
STAKEHOLDER-REPORTED — the identity with R2-F29, the two prior occurrences and the count
of three. `grep -rn 'R2-F29' --include='*.md'` over this clone returns nothing, so the
history is not verifiable here and is not claimed as measured.
**Evidence:** `.claude/agents/{orchestrator,builder,checker,designer}.md` each name `Grep,
Glob` on their `tools:` line. Four probe spawns, four absences: orchestrator — "both
refused at call time with 'No such tool available', fallback directed to `grep`/`find` via
Bash"; checker — "neither is callable in this runtime"; designer — "absent, not merely
untested"; builder — "they did not arrive as tools; no substitute was used to fake them".
Read and Bash were exercised ok in all four, so the instrument could not have produced a
false absence. Same pair, same direction, every time.
**What is new in this occurrence:** the measurement. Prior occurrences were reported from
the frontmatter — a tool read off a declaration. This one was proven by call: each agent
invoked the tool and reported the runtime's refusal. Declared-and-absent is now measured,
not inferred, and that is the first time for this finding.
**Who it hits:** every clone, non-deterministically — the runtime has supplied these
inconsistently across three sessions.
**Proposed fix:** NONE. Do not edit the contracts. Stakeholder decision, run 4: the
contract states what the role needs; this file states what the runtime gave. Deleting
`Grep, Glob` would fit the contract to one session and break against the next. Agents work
around it with Bash `grep`/`find`. This entry IS the fix — the record is the mechanism.

## R4-F2 — a clause written to prevent this exact behaviour failed at its first live test
**Observed or inferred:** OBSERVED, both halves.
**Evidence:** The clause exists in this clone. `.claude/policies/autonomy.md:30`, read
directly: "**And the inverse, which is the direction that has actually cost something:
work is not a substitute for an instruction the brief bounds.** Where a brief names a
single action, a required output shape, or a stop condition, that IS the deliverable —
produce it first and literally." It was added after R2-F28 to stop precisely this. The
builder probe named one required output shape: first line `builder: arrived = <tools>`.
The builder's reply began at `EXERCISED:` and contained the exercise results, a
not-exercised caveat and an unrequested impact assessment. The one bounded deliverable was
the only absent item. The other three agents, under the identical instruction, produced it.
**The finding is not "the builder missed a line."** It is that a written policy clause,
authored against this behaviour, sitting in the agent's own loaded context, did not change
the behaviour on the first occasion it was tested for real. The clause is not weakly
worded, not buried and not ambiguous — it is bolded, it names the failure mode, and it
grades it Level 3. It still did not bind.
**Who it hits:** the method, not this commit. Every gate in this pipeline that is enforced
by a clause an agent is expected to read and obey, rather than by a hook that refuses.
R4-F1 is caught by a mechanism; this class is not. One agent in four failed, so the clause
is partially effective, which is the worst case for detection: it works often enough to
look like it works.
**Proposed fix:** one line — a bounded output shape needs a mechanical check (the caller
asserts the first line matches, and re-asks), not a policy sentence. Do NOT implement:
it is a design question about how far prose can be trusted to enforce anything, and it is
logged, not answered. Worked around this run by re-asking the builder.

## R4-F3 — the agent Bash shell does not inherit the login PATH, so Node reads as ABSENT
**Observed or inferred:** OBSERVED, by running the same probe two ways in one session.
**Evidence:** In the Bash tool's default shell, `command -v node` returned nothing and
`$PATH` was `/Users/michal/.local/bin:/usr/local/bin:...:/opt/anaconda3/condabin` — no
`/opt/homebrew/bin`. Under `zsh -lc`, `$PATH` contains `/opt/homebrew/bin` and
`command -v node` returns `/opt/homebrew/bin/node`. Direct probe: `/opt/homebrew/bin/node
--version` -> `v25.9.0`, `npm --version` -> `11.12.1`, `npm ping` -> `PONG 241ms`. The
Bash tool's own description states the shell "is initialized from the user's profile"; on
this machine it is not, and the two PATHs differ.
**What it nearly cost:** a stack constraint. The first probe supported the conclusion "no
JS runtime on this machine", which would have ruled out the entire Vite/Vitest/Playwright
path and pushed V0 onto a Python server the brief's localStorage-only rule argues against.
It was caught only by CLAUDE.md's rule to check whether the instrument could have produced
the observation. This is the R2-F31 class — a measured-looking claim from an unchecked
instrument — and here the instrument was the shell itself.
**Who it hits:** every agent in this clone, on every tool that lives in `/opt/homebrew/bin`
— node, npm, npx, brew. Silent: the failure mode is `command not found`, which reads as
"not installed" rather than "not on PATH".
**Proposed fix:** not a contract edit. Worked around in-project: every command in the
acceptance criteria is invoked so that PATH is set first, and `.agent/STATE.md` carries the
one line agents must use. Logged so the next run does not re-derive it.
