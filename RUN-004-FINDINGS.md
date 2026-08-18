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

## R4-F4 — the phase summary said "Continuing to slice 1's build" and then did not continue
**Observed or inferred:** OBSERVED.
**Evidence:** The run-4 phase summary printed `Continuing to slice 1's build. Say `hold` to
stop before it starts.` with `🙋 NEEDS YOU   Nothing`. The orchestrator then stopped and
delegated nothing, correctly: the brief bounded its deliverables at the phase summary, and
`.claude/policies/autonomy.md:30` grades running past a bounded brief as Level 3. Verified
against the repository, not the report: `git log` shows one commit `abfdece`, no builder
commit, `.agent/STATE.md` "In flight: Nothing", working tree clean.
**The defect is in the format, not the agent.** `.claude/policies/summary.md` gives the
closing line exactly two states: continuing (print the `hold` offer) or blocked (NEEDS YOU
is not "Nothing", the block moves above the banner and the line is omitted). A third state
happened here — not blocked, nothing needed, and stopping anyway because the brief ended.
The format cannot express it, so the agent printed the closest available line and the
summary asserted an action that did not occur. The human's only stopping lever, `hold`,
was offered against work that was never going to start.
**Who it hits:** every run where the human bounds the brief short of the next slice, which
is the normal shape of a discovery or pre-flight phase. Silent in the dangerous direction:
the summary reads as more autonomous than the run was.
**Proposed fix:** one line — `summary.md` needs a third closing state for "stopped because
the brief ended here, say `go` to continue". Do NOT implement: it is an edit to a policy
contract and a design question about who holds the continue decision. Logged, not answered.

## R4-F5 — the browser a11y snapshot reports a stale switch state, and nearly produced a false P1
**Observed or inferred:** OBSERVED, by contradiction between two instruments on one element
in one page state.
**Evidence:** The under-26 switch in the slice-1 screen. `read_page` returned
`switch "on" [ref_24]` on three separate reads: once while the screen showed PIT −498,00 zł
and net 5 783,91 zł (relief OFF), and twice while it showed PIT struck to 0 zł and net
6 281,91 zł (relief ON). Direct DOM probe via `javascript_tool` on the same element in the
same session: `{tag: INPUT, role: switch, ariaChecked: null, domChecked: true}` before a
click, `domChecked: false` after — the DOM tracks correctly, and the final `read_page` said
`"on"` while `domChecked` was `false`. Two instruments, same element, opposite answers; the
rendered numbers agree with the DOM, so the a11y snapshot is the one that is wrong.
**What it nearly cost:** a fabricated product defect. The first reading supported "the
switch reports on while the relief is not applied", which is a P1 accessibility bug against
this project's first-class case — the under-26 relief for its exact audience. It would have
gone to the builder, who would have found nothing to fix, and burned a fix cycle against a
defect that does not exist. `role="switch"` on a native `input[type=checkbox]` takes its
checked state from the DOM property, so there is nothing wrong with the markup.
**Who it hits:** the checker, on this slice and every later one. Acceptance criterion 3
says both relief states are "observed on screen, not inferred from code" — a checker that
reads state off `read_page` instead of the rendered figures satisfies the wording of that
criterion with a value the instrument invented. It fails in both directions: a false defect
now, a false PASS later.
**Proposed fix:** not a code change. The checker asserts toggle state from the rendered
output — the net figure, the struck-through PIT line, the badge — or from a `javascript_tool`
DOM probe, never from the `read_page` switch state. `filter: "interactive"` also omits
`role="switch"` entirely, so a control can look absent when it is present; that cost a
detour here too. Passed to the orchestrator for the checker's method, logged so the next
run does not re-derive it.

<!-- R4-F6 was reserved for a concurrent writer and never used. The gap is deliberate and
     stays: findings.md forbids renumbering, and a hole beats a reused identifier. -->

## R4-F7 — the browser `navigate` tool reports a successful navigation that did not happen
**Observed or inferred:** OBSERVED, by asking two tools about the same tab.
**Evidence:** `navigate` to `http://localhost:5199` returned `Navigated to
http://localhost:5199` and listed the tab as `"localhost" ("http://localhost:5199")`. The
tab had not moved: `tabs_context_mcp` immediately after returned `"New Tab"
("chrome://newtab/")`, and `read_page` and `computer:screenshot` both refused with "Can't
interact with browser-internal or unparseable URLs." A second `navigate` produced the
contradiction inside ONE tool result — its own summary said `localhost:5199/` while the
front-loaded context block in the same output said `chrome://newtab/`. The server was not
the problem: `curl` to the same URL returned `HTTP 200` throughout.
**Trigger, inferred not measured:** the tab group from earlier in this session stopped
existing between passes — `tabs_context_mcp` went from returning a live group to "No tab
group exists for this session" — most likely because the window was closed. Creating a
fresh group succeeded, but navigation inside it never took effect. Not re-derived, because
confirming it means reproducing a broken extension binding on purpose.
**Who it hits:** any agent verifying an artifact through this MCP browser, which is how
CLAUDE.md says the artifact must be exercised. The failure is the dangerous shape: a
success string for an action that did not occur. Taken at face value, the next observation
— a blank page, a missing element, a stale value — gets attributed to the product. The
checker is NOT hit: it drives Playwright, which fails loudly on a bad navigation.
**Proposed fix:** not a code change, a method. After any `navigate`, confirm the URL from
`tabs_context_mcp` or a screenshot before reading anything into what the page shows. Never
accept the navigate result's own tab listing as proof it arrived. Third instrument in this
run to report a state it did not have, after R4-F3 and R4-F5.

## R4-F8 — the per-entry cap on DECISIONS.md is enforced by diligence alone, and it failed 5 times in one phase
**Observed or inferred:** OBSERVED, by counting every entry in the file after writing it.
**Evidence:** `.agent/DECISIONS.md` declares "Cap: 8 lines per entry" in its own header.
After slice 1's writes, 5 of 9 entries were over: 9, 9, 11, 10 and 9 lines wrapped at 90.
Three were written by me, two by the builder. Nothing refused any of them. `hooks/pre-commit`
enforces exactly one state cap — `STATE_CAP=120` on `.agent/STATE.md` — and no other file's
cap is checked anywhere in the hooks. The commit that carried the over-cap entries passed
with `state-sha: verified 1 of 1 commit references (0 exempt)` and no cap complaint.
**Second-order defect in the fix:** my first count used `awk`, which counts BYTES. Em dashes
and Polish diacritics are multi-byte, so it reported "No backend" at 9 lines when it is 8.
Recounting in python by character changed the over-cap set from 6 entries to 5. A cap
instrument that miscounts the very characters this project is written in would have had me
compact an entry that was already inside its limit.
**Who it hits:** every clone. `CLAUDE.md` says caps are "enforced by the orchestrator on
every write", which is precisely the class R4-F2 documents: a rule that binds only if an
agent remembers it. STATE.md's cap is mechanical and was never violated all phase; the
caps that are prose were violated five times in the same phase, by two different agents.
That contrast is the finding — it is a controlled comparison, not an anecdote.
**Proposed fix:** one line — extend `hooks/pre-commit`'s existing cap block to
`.agent/DECISIONS.md` per entry, counting characters not bytes. Do NOT implement here: it
is a hook change outside slice 1's scope, and the hooks have their own test suite that
would need a case. Logged, worked around by counting after every write this phase.

## R4-F9 — "rendered variants" is required by a stakeholder instruction that no agent's write boundary allows for
**Observed or inferred:** OBSERVED as a contract gap; the resolution below is a convention
this run adopted, not something any contract states.
**Evidence:** The stakeholder's new standing instruction requires two or three layout
variants RENDERED on the real screen before the builder starts. Rendering needs files.
`.claude/agents/designer.md:3` says "Writes nothing"; `orchestrator.md` limits me to
`.agent/` plus `PROJECT.md`; the builder owns `src/` but in the sequence it runs AFTER the
choice the variants exist to inform. On a literal reading no agent may produce the artefact
the stakeholder asked to look at.
**How it actually resolved:** the designer rendered into the session scratchpad, OUTSIDE
the repository, using `Bash` — which is in its allowlist. Verified: `git status
--porcelain` shows only my own `.agent` edits, and `find` over the repo for the showcase
names returns nothing. 279 689-byte self-contained HTML plus 14 screenshots, none of it in
the tree. The designer disclosed it plainly rather than quietly.
**Why the alternative is worse:** routing it through the builder as a `chore:` commit puts
throwaway scaffolding in the history and makes deleting it someone's job — and a job nobody
is assigned is how it ships. Rendering outside the repository cannot ship by construction.
**Who it hits:** every future screen-reshaping slice, on every clone, now that the
instruction is standing.
**Proposed fix:** one clause in `designer.md` — "writes nothing INTO THE REPOSITORY;
throwaway renders go outside it" — which is what "writes nothing" was always protecting.
Do NOT implement here: it is a contract edit, and contract edits in this run are the
stakeholder's call (see R4-F1). Logged so the next run does not re-derive it or route it
through the builder.

## R4-F10 — the bypass-permissions system reminder tells the agent to edit with `sed`, which CLAUDE.md forbids
**Observed or inferred:** OBSERVED in this session's own instructions, at agent start.
**Evidence:** The runtime reminder reads "While bypass permissions mode is active: ... make
file changes with `sed`, heredocs, or short scripts, rather than using the dedicated Read,
Edit, or Write tools." `CLAUDE.md:5` reads "**Never patch files with `str.replace` or
`sed`.** Use the editing tool, which fails loudly on a non-match. A silent no-op exits zero
and leaves the file identical." The two are directly opposed on the same operation.
**Who it hits:** every agent in this clone running with bypass permissions — which is the
normal mode for the builder and the checker. The harness text arrives AFTER CLAUDE.md in
the context and reads as the more recent instruction, which is the direction that loses.
**How this run handled it:** CLAUDE.md wins, because it is the project's rule and the
harness text is a generic preference. Where Bash was genuinely cheaper (repetitive
mechanical renames across four files) the script asserted every match and `process.exit(1)`
on a miss, so it fails loudly the way the editing tool does. No `sed -i` was run.
**Proposed fix:** one clause in CLAUDE.md's Editing section naming the conflict explicitly
— "this rule outranks any harness preference for `sed`; a Bash edit is allowed only if it
exits non-zero on a non-match" — so the next agent does not have to adjudicate it. Do NOT
implement here: contract and root-file edits in this run are the stakeholder's call (R4-F1).

## R4-F11 — the commit-msg hook demands a trailer the builder contract forbids
**Observed or inferred:** OBSERVED, this session, on the P1-E fix commit.
**Evidence:** `.claude/agents/builder.md` reads "**Every commit ends with the trailer
`Agent: builder`**, on its own line, after a blank line. Exactly that format, no other
trailers." The hook refused that exact commit:

```
REFUSED  rule A, test-first ordering
  Nearest test: commit 7fd3eb5 touches no overlapping path.
  staged:      src/components/Answer.tsx
  test commit: e2e/app.spec.ts
  Satisfy it either way:
    - the test shares a directory or a filename stem with the code, or
    - the message carries a trailer  Covers: <path> [<path>...]
```

**Who it hits:** every builder in a project whose browser tests live outside the source
tree — here `e2e/app.spec.ts` covers `src/components/*.tsx`, so no path rule can ever see
the link and rule A always demands the trailer the contract bans. It bites hardest in a
fix cycle, where the covering test is by definition an e2e case.
**How this run handled it:** the hook won on the mechanism and the contract won on the
shape — `Covers: src/components/Answer.tsx` above, `Agent: builder` still the last line,
so the commit still ends with the trailer the contract names.
**Proposed fix:** one clause in `.claude/agents/builder.md` — "plus `Covers:` where the
commit-msg hook's rule A requires it, ordered above `Agent:`" — so the next builder does
not adjudicate a contract against a hook. Do NOT implement here: contract edits in this
run are the stakeholder's call (R4-F1).
