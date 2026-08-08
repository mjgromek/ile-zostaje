<!-- Produced by RUN-001, a 90-minute shakedown of this pipeline on 2026-08-08: one vertical slice (Warsaw district air quality) driven end to end through orchestrator, builder and checker. -->
<!-- Ran against clone SHA 33e90a6 ("docs: editorial rule matches the content it governs"). Content below is the run's record, unedited. -->

# FINDINGS — pipeline test run, 2026-08-08

> **Redaction note.** Six secret-shaped literals in this record were redacted so the file
> could be committed by the very scanner it documents. The lines are 194, 196, 198, 345,
> 347 and 349 (as numbered before this note was inserted). Nothing else was changed. The
> byte-exact original is untracked at `warsaw-air/FINDINGS.md`.

Findings about the **pipeline template**, discovered while driving one vertical slice
through it. Appended the moment something is found, not at the end.

A finding is written only when it can be evidenced. Anything suspected but not seen is
marked **INFERRED** and carries what would confirm it.

**Run mode:** main-session-spawns-subagents (flat). The orchestrator decided the next
agent and wrote the acceptance criteria; the runtime did the spawning. See F1.

---

## F1 — orchestrator's contract promises delegation its allowlist forbids

**Observed or inferred:** Observed.

**Evidence:** `.claude/agents/orchestrator.md:3-4`, verbatim:

```
description: Sequences the work. Reads the repo and .agent/STATE.md, states the next action unprompted, slices, delegates to builder and checker, enforces the state caps, and reports the phase summary. Use at the start of a request and between slices.
tools: Read, Grep, Glob, Bash, Write, Edit, Skill
```

Line 3 claims it "delegates to builder and checker". Line 4 omits `Task`. There is no
error text to quote, and that is part of the finding: a tool absent from an allowlist
cannot be invoked, so it fails silently rather than loudly. The orchestrator reported:
"There is no error string to quote, and that is itself the finding."

Nested `claude -p` (v2.1.226) was tested as a fallback. It does expose `builder` and
`checker` as subagent types, but every file write is denied:

```
DENIED — "The write to ./nested_probe_delete_me.txt was blocked — the permission to
write that file wasn't granted, so no file was created."
```

Postcondition confirmed rather than trusted: `FILE ABSENT`.

**Deeper reading (architecture, not a workaround):** Claude Code's model appears to be
main-session-spawns-subagents, flat, not nested. The nested route needs the permission
system disabled to write anything. If that is right, the orchestrator was never going to
be the spawner, and the word "delegates" in its contract is simply wrong. Its real job
is to DECIDE the next agent and write the acceptance criteria down; the runtime does the
spawning. This is a defect in how the contract describes the architecture, not a missing
tool.

**Who it hits:** Every clone user. Blocks all product work — all seven of slice one's
acceptance criteria were blocked at the point of discovery.

**FIX APPLIED (blocker).** Written before the edit. Adding `Task` to the `tools:` line of
`.claude/agents/orchestrator.md`, so the allowlist matches what the description already
promises. Minimum viable unblock, one word, nothing else on the line changes.

**NOT FIXED, logged as a design question.** Whether line 3 should say "delegates" at all —
i.e. whether the orchestrator was ever meant to be the spawner, given Claude Code's model
appears to be flat main-session-spawns-subagents — is a contract redesign, not a blocker.
Left exactly as found. Deciding it under time pressure would be the wrong call.

**Caveat on the applied fix:** it was NOT verified end to end. Adding `Task` to a
subagent's allowlist may or may not be honoured by the runtime; this run reached the
builder and checker via the main session, so the repaired path was never exercised. What
would confirm it: re-run the orchestrator in a fresh session and see whether it can spawn
the builder itself.

**VERIFICATION NOTE, 2026-08-08, fresh orchestrator session — the fix HOLDS. CONFIRMED.**

The confirming test named above was run. Answer to "can the orchestrator now see and use
the delegation tool": **yes, both.**

*Seen.* The delegation tool is present in this orchestrator's own tool schema, exposed
under the name `Agent`. The agent-type listing served to this session carries, verbatim:

```
- orchestrator: ... (Tools: Read, Grep, Glob, Bash, Write, Edit, Skill, Task)
```

and `builder`, `checker`, `Explore` and `general-purpose` all appear as resolvable
subagent types.

*Used.* Presence in a listing is not evidence that the instrument fires, so it was fired.
A synchronous subagent was spawned with a no-tool prompt and returned, verbatim:

```
DELEGATION REACHABLE FROM ORCHESTRATOR
```

The round trip completed, so the runtime honours a `Task` entry added to a subagent's
`tools:` line. F1's caveat — "may or may not be honoured by the runtime" — is now
answered: it is honoured. What is still NOT tested is the orchestrator spawning `builder`
or `checker` specifically and those agents completing real work; only the generic
delegation path was exercised, deliberately, under a hard clock. The mechanism is the
same one, so the residual risk is low but non-zero.

The design question in F1 stands untouched and unanswered: whether line 3 should say
"delegates" at all. The fix makes the contract satisfiable; it does not settle whether the
contract is right.

---

## F10 — the checker's report is not persisted anywhere, so a fresh orchestrator loses it

**Observed or inferred:** Observed, 2026-08-08, by a fresh orchestrator instance that
needed the report and could not obtain it.

**Evidence:** the checker returned PASS scoped to `7e5b564..6d506c3` and raised four P2
findings. A fresh orchestrator session was then asked to record those four P2s in
`.agent/STATE.md`. Searching the repository for them:

```
$ grep -rl "P2" --include="*.md" .
.claude/policies/summary.md
.claude/agents/checker.md
.claude/skills/security-review/SKILL.md
docs/DESIGN.md
.agent/BACKLOG.md
```

Every hit is a template or a policy file. The three product hits contain the *word* in
their own instructions, not this run's findings. `.agent/BACKLOG.md` has an mtime of
15:44, earlier than the checked commits at ~16:15, so its entries predate the checker and
are not its output. The four P2s exist only in the conversation transcript.

`.claude/agents/checker.md` requires the checker to grade findings P0/P1/P2 and return
them; nothing requires it, or anyone, to write them to a file. The orchestrator's contract
says "every deferral reported by the builder or the checker is recorded in
`.agent/BACKLOG.md`" — which only works while the orchestrator that heard the report is
still alive. Context loss, a crash, or a fresh instance between the check and the write
drops the findings silently.

**Who it hits:** Any run where the orchestrator is replaced, compacted or restarted
between the checker finishing and the backlog being written. The loss is silent: STATE.md
and BACKLOG.md look complete, and nothing indicates four findings went missing.

**Consequence in this run:** the P2 list in `.agent/STATE.md` had to be written from the
one P2 recoverable by direct observation — STATE.md's own staleness, which is visible in
the file — plus an explicit note that the remaining three are unrecoverable. Nothing was
invented to fill the gap.

**Proposed fix:** Have the checker write its verdict and graded findings to a file
(`.agent/LAST_CHECK.md`, overwritten per phase) as part of returning, rather than
returning them only in prose. Do NOT implement — this changes the checker's contract and
its read-only posture, and that is a design decision, not a five-minute unblock.

---

## F11 — a subagent's `tools:` allowlist is not the tool set it actually receives

**Observed or inferred:** Observed, 2026-08-08, in the fresh orchestrator session.

**Evidence:** `.claude/agents/orchestrator.md` line 4, after the F1 fix, reads:

```
tools: Read, Grep, Glob, Bash, Write, Edit, Skill, Task
```

The tools actually present in that session's schema were: `Read`, `Bash`, `Write`,
`Edit`, `Skill`, `Agent`. Two names in the allowlist — `Grep` and `Glob` — arrived as no
tool at all, and one name, `Task`, arrived under a different name, `Agent`.

**Why this matters beyond cosmetics.** F1's whole failure mode was a name absent from an
allowlist failing *silently*. The inverse holds too: a name *present* in an allowlist is
not proof the tool arrives, and the mapping from allowlist name to delivered tool is not
identity. An agent author reading `orchestrator.md` would reasonably conclude the
orchestrator can `Grep`; it cannot. It worked here only because `Bash` covers the same
ground with `grep`.

**Who it hits:** Any agent whose contract depends on a tool the runtime renames or does
not serve. It degrades quietly — the agent works around the gap and no error is ever
emitted.

**Not fixed, and deliberately so.** Removing `Grep`/`Glob` or renaming `Task` to `Agent`
in the agent files would be guessing at one runtime's current naming, and `.claude/` is
out of this session's write boundary. The durable fix is a preflight that asserts each
allowlisted tool is present and reports the ones that are not.

**What would confirm the general case:** add a nonsense entry to a `tools:` line and
observe whether anything warns. Not run here — it modifies `.claude/`.

---

## F2 — the secret scanner refuses its own source, so the hooks cannot be committed

**Observed or inferred:** Observed. Reproduced directly in this run.

**Evidence:** `git add hooks/pre-commit hooks/test/run-hook-tests.sh && git commit`
produces, verbatim:

```
REFUSED  secret-scan [gcp-sa-json]  hooks/pre-commit:16
  gcp-sa-json	"private_key[REDACTED]"
REFUSED  secret-scan [aws-access-key]  hooks/test/run-hook-tests.sh:194
  stage "$d" config.txt "key = AKIA[REDACTED: 16 uppercase chars]"
REFUSED  secret-scan [private-key]  hooks/test/run-hook-tests.sh:200
  stage "$d" id_rsa "-----BEGIN RSA PRIVATE [REDACTED] KEY-----"

Commit refused: a staged line matches a secret pattern.
Remove the secret, or move it to an untracked env file.
Override with git commit --no-verify. It leaves no trace in history.
```

`hooks/pre-commit:16` is the scanner's own pattern table matching itself.
`hooks/test/run-hook-tests.sh:194,200` are the suite's own deliberate fail-on-purpose
fixtures matching themselves.

**Who it hits:** Clone users, severely. `hooks/pre-commit` and
`hooks/test/run-hook-tests.sh` remain untracked in this repository right now — they
cannot be staged without `--no-verify`. **Anyone cloning this repo gets no hooks at
all**, silently losing the pipeline's central guarantee. The failure is quiet: the clone
succeeds, `git config core.hooksPath hooks` succeeds, and nothing enforces anything.

**FIX APPLIED (blocker).** Written before the edit. In `hooks/pre-commit`, the
`'+++ b/'*` branch will clear `$file` when the path is under `hooks/`, so the scanner
skips its own source. The existing `[ -n "$file" ] || continue` guard then does the work —
one line changed, no new control flow.

**Why this option and not the other.** Splitting the pattern literals so the table cannot
match itself would also require rewriting the fail-on-purpose fixtures at
`hooks/test/run-hook-tests.sh:194,200` — those literals are deliberately real-looking and
are the point of the test. That is a redesign of the suite, not an unblock.

**Tradeoff, stated plainly:** the scanner no longer scans `hooks/`. A genuine secret
committed under `hooks/` would now pass. Accepted because the alternative currently in
force is worse — every clone gets NO hooks at all, silently. This is a stopgap and should
be revisited.

**NOT FIXED:** the `FINDINGS.md` instance below. Exempting `hooks/` does not cover it, and
widening the exemption to documentation is a scope question, not an unblock.

---

## F3 — agent and skill discovery when the session is rooted outside the clone

**Observed or inferred:** **INFERRED.** Not observed in this run.

**Evidence:** None from this run, and that is stated plainly. This session was rooted at
the clone root (`/Users/michal/Desktop/Warsaw_District_Air_Board/warsaw-air`), where
`.claude/agents/` and `.claude/skills/` resolve correctly — `orchestrator`, `builder` and
`checker` all appeared in the available agent types and the project skills were listed.
The failure mode described (discovery falling through to `general-purpose`, which looks
like it works) was therefore never triggered here.

**Who it hits:** Inferred: any user who starts a session in a parent directory of the
clone, or opens the pipeline as a vendored subdirectory of a larger repository.

**What would confirm it:** Start a session rooted one level up
(`/Users/michal/Desktop/Warsaw_District_Air_Board`) and check whether `orchestrator`,
`builder` and `checker` still appear in the available agent types, and whether an
`Agent` call naming `builder` resolves or silently falls back to `general-purpose`.

**Proposed fix:** None proposed — the finding is unconfirmed. Confirm first. Do NOT
implement.

---

## F4 — project skill `security-review` may collide with the built-in `/security-review`

**Observed or inferred:** **INFERRED.** The collision was never observed; the skill was
never invoked in this run.

**Evidence, partial and only of the precondition:** `.claude/skills/security-review`
exists in the project. A built-in `/security-review` command also exists. The project
skill's own description names it: "Trigger policy for Claude Code's built-in
/security-review." So the project skill is a *policy wrapper* around a built-in of the
same name. Only one `security-review` entry appears in the available-skills listing —
which of the two it resolves to was not determined, because nothing in this run
triggered it.

**Who it hits:** Inferred: clone users whose work touches auth, secrets, filesystem or
network access, user input, database mutation, LLM tool exposure, or deployment — the
skill's own trigger conditions. Slice one touches network access, so a longer run would
likely reach it.

**What would confirm it:** Invoke `Skill(security-review)` in a clone and observe
whether the project trigger-policy file is loaded or the built-in review runs instead.

**Proposed fix:** None proposed — unconfirmed. If confirmed, rename the project skill to
something non-colliding (e.g. `security-review-policy`). Do NOT implement.

---

## F5 — the builder cannot make a `feat:` commit without breaking its own contract

**Observed or inferred:** Observed. Reproduced in this run, deliberately, to get the text.

**Evidence:** `.claude/agents/builder.md:16`, verbatim:

```
- Does not write `.agent/` at all; the orchestrator owns state.
```

`hooks/commit-msg:94-106` (rule B) refuses any `feat:` commit that does not stage
`.agent/DECISIONS.md`. Attempting the slice-one parser commit with only product code
staged produced, verbatim:

```
REFUSED  rule B, decision record
  A feat: commit or an ADR change must stage .agent/DECISIONS.md.
  staged: warsaw_air/parse.py
  Satisfy it: append the what / why / what-it-rules-out entry, then git add it.
```

Postcondition confirmed rather than trusted: `git log --oneline -1` still showed the
preceding `test:` commit, so nothing landed.

The builder is the only agent that writes `feat:` commits — the orchestrator "cannot
write product code or tests" (`orchestrator.md`), the checker has no write access. So
the one rule that guarantees a decision record is unsatisfiable by the only agent it
ever fires on. The deadlock is total: obey `builder.md:16` and no `feat:` commit can
ever land; land the commit and `builder.md:16` is broken.

Resolved in this run only because the human's task brief explicitly directed the builder
to stage `.agent/DECISIONS.md`. Without that sentence the slice stops here.

**Who it hits:** Every clone user, on the first `feat:` commit of the first slice. It is
not a silent failure — the hook refuses loudly — but the agent has no contract-legal move.

**FIX APPLIED (blocker).** Written before the edit. `.claude/agents/builder.md:16` will be
narrowed to the files the orchestrator actually owns:

"Does not write `.agent/STATE.md` or `.agent/BACKLOG.md`; the orchestrator owns state.
Appends to `.agent/DECISIONS.md` only as far as `commit-msg` rule B requires."

Minimum viable unblock: it makes the existing hook rule satisfiable without changing the
hook, and without granting the builder ownership of state. The hook is the stricter of the
two contracts and it is the one with teeth, so the prose moved rather than the rule.

**Not touched:** `hooks/commit-msg` rule B itself. Whether a decision record should be
required on every `feat:` commit is a design question about the pipeline's philosophy, and
this run has no mandate to settle it.

---

## F2, second instance — `FINDINGS.md` itself cannot be committed

**Observed or inferred:** Observed, 2026-08-08, while trying to commit F5.

**Evidence:** `git add FINDINGS.md && git commit` produced, verbatim:

```
REFUSED  secret-scan [gcp-sa-json]  FINDINGS.md:66
    gcp-sa-json	"private_key[REDACTED]"
REFUSED  secret-scan [aws-access-key]  FINDINGS.md:68
    stage "$d" config.txt "key = AKIA[REDACTED: 16 uppercase chars]"
REFUSED  secret-scan [private-key]  FINDINGS.md:70
    stage "$d" id_rsa "-----BEGIN RSA PRIVATE [REDACTED] KEY-----"
```

Lines 66-70 are F2's own verbatim quotation of the scanner's refusal text. Writing the
finding down is what makes the finding file unstageable. Staged change was reverted with
`git reset`; postcondition confirmed: `FINDINGS.md` is still untracked.

**Who it hits:** Anyone who records a secret-scan finding by quoting the scanner. The
findings file is the one artifact of a pipeline run that most needs to survive, and it is
the one the pipeline refuses to keep.

**Proposed fix:** Same as F2 — split the pattern literals so the table cannot match
itself. Do NOT implement. This file therefore remains untracked, deliberately, and
`--no-verify` was not used.

---

## F6 — the hook test suite hardcodes port 8731 and fails spuriously when it is taken

**Observed or inferred:** Observed, 2026-08-08, accidentally, mid-run.

**Evidence:** `hooks/test/fakeserver.py:13`, verbatim:

```
PORT = int(sys.argv[2]) if len(sys.argv) > 2 else 8731
```

There is no collision check and no fallback. The same suite that reported
`16 passed, 0 failed` at the start of this run reported, later in the same run:

```
14   PASS      exited 1: FAIL     A1 health /health returns 200 (got 404)  FAIL

14 passed, 2 failed
```

**How it was measured, and whether the instrument could have produced it.** The failure
appeared immediately after an edit to `hooks/pre-commit`, so the edit was the obvious
suspect and was checked first. It is innocent: that edit changes only which file paths the
secret scanner reads, which is exercised by cases 1-10 — all ten still pass. Cases 11-16
run `probe.sh` and `verify-deploy.sh` and never invoke the scanner. The scanner cannot
emit an HTTP 404.

The actual cause was then confirmed rather than inferred:

```
$ lsof -nP -iTCP -sTCP:LISTEN | grep python
Python  85926 michal  4u  IPv4 ...  TCP 127.0.0.1:8731 (LISTEN)

$ ps -o pid,lstart,command -p 85926
85926 Sat Aug  8 16:09:14 2026   ... Python -m warsaw_air.app

$ curl -s -o /dev/null -w "%{http_code}" http://127.0.0.1:8731/health
404
```

The product's own server held 8731. `probe.sh` connected to it, asked for `/health`, and
got the app's genuine 404 for an unknown route. The suite reported a hook failure; what
actually happened was that it tested the wrong process.

**Who it hits:** Any clone user running the suite while anything else holds 8731 —
including the product they are building, a leaked `fakeserver.py` from an earlier aborted
run of the suite itself, or a second agent working in parallel. The failure is worse than
noisy: it is a false negative dressed as a false positive. A suite that silently probes
whatever process answers on a fixed port can also report PASS against the wrong server.

**Proposed fix:** Bind port 0, let the OS assign, and pass the resolved port to `probe.sh`;
or refuse to start when 8731 is already listening. Do NOT implement — this is the test
harness's own design and picking between those two is not a five-minute unblock. It did
not block this run; it was worked around by noting the collision.

---

## F4, UPGRADED — the security-review collision is CONFIRMED, and upstream already fixed it

**Observed or inferred:** Was INFERRED at F4. Now **CONFIRMED**, by upstream's own history
rather than by anything this run did. F4's original text stands as written; this entry
supersedes its status only.

**Evidence:** cloning the reference for the minute-90 extraction surfaced it:

```
$ git -C /tmp/pipeline-ref log --oneline -1
e87b2e3 refactor: rename security-review to security-gate, avoiding a builtin collision

$ ls /tmp/pipeline-ref/.claude/skills
architecture-check  discovery  frontend-design  grill-me
ponytail  security-gate  tdd  theme-factory
```

Upstream `HEAD` carries `security-gate`; this clone carries `security-review`. The commit
subject names the exact failure F4 predicted — "avoiding a builtin collision" — so the
collision was real, not hypothetical, and was diagnosed independently.

**Not fixed here, deliberately.** The brief classes a name collision as a design question,
and the fix already exists upstream. Renaming locally would fake a repair that a pull
performs correctly.

**F4, DIRECT CONFIRMATION at the phase gate, 2026-08-08.** F4 asked for exactly one test:
"Invoke `Skill(security-review)` in a clone and observe whether the project trigger-policy
file is loaded or the built-in review runs instead." The phase gate invoked it. **Answer:
the project skill wins the name.** What loaded was
`.claude/skills/security-review/SKILL.md`, opening "This is the trigger policy for Claude
Code's built-in `/security-review`, not a reimplementation of it."

The consequence is worse than a naming clash, and it is new. The project policy's own
step 2 is "Run the built-in `/security-review` over the change" — but the project skill
has taken the only name that would reach it. The wrapper shadows the thing it wraps, so
following the policy to the letter is impossible: step 1 (name the trigger) and step 3
(grade the findings) can be done, step 2 cannot. The gate therefore ran a hand review
against the diff and said so, rather than reporting a built-in review that never ran.

This is the strongest argument yet for upstream's `security-gate` rename (`e87b2e3`): the
collision does not merely confuse a reader, it makes the policy unexecutable. Still not
fixed locally, for the reason above — a pull fixes it correctly.

---

## F7 — this clone is behind upstream, and two of its findings are already fixed there

**Observed or inferred:** Observed.

**Evidence:** upstream commits absent from this clone:

```
e87b2e3 refactor: rename security-review to security-gate, avoiding a builtin collision
f2b0cde docs: session root and preflight check for agent discovery
33e90a6 docs: editorial rule matches the content it governs
ea4ea0f fix: narrow the suite's guard, drop the README line cap
```

`e87b2e3` is F4. `f2b0cde` — "session root and preflight check for agent discovery" — is
the subject matter of F3, the finding this run could only mark INFERRED. Upstream evidently
hit it and documented a preflight check for it.

**Who it hits:** Anyone reading this run's findings without checking upstream first. Two of
seven entries describe problems already solved, which would waste a maintainer's time and
overstate the defect count.

**Consequence for the extraction diff:** `diff -ru` against upstream `HEAD` mixes this run's
three deliberate hunks with upstream drift the run never touched. The mapping in the report
separates them; the `security-gate` / `security-review` directory difference is drift, not a
change made here.

**Proposed fix:** Re-run the exercise against a clone pinned to the commit under test, or
record the clone SHA at setup so drift is separable mechanically. Do NOT implement.

---

## F8 — `theme-factory` cannot record an outcome its own trigger rule forbids re-reading

**Observed or inferred:** Observed for the contradiction; INFERRED for the consequence.

**Evidence, observed:** `.claude/skills/theme-factory/SKILL.md` line 5 says it "refuses to
reopen a theme already recorded in `PROJECT.md`", and the Level 2 section says "On
acceptance, write the palette, fonts and instructions into `PROJECT.md`." `PROJECT.md`
carries a 60-line cap (`docs/DESIGN.md` §8). It was 56 lines before this run. Recording
the theme took it to 59. Postcondition confirmed with `wc -l`: 59.

**What is inferred:** that the next project to record a theme plus one more constraint
tips `PROJECT.md` over its cap, at which point the orchestrator's compaction rule moves
settled facts into `DECISIONS.md` — and the theme record is exactly a settled fact. Once
compacted out of `PROJECT.md`, the skill's own refusal-to-reopen check no longer sees it
and the theme becomes renegotiable, which is the one thing the skill exists to prevent.
Not observed: compaction was never triggered here, 59 is under 60.

**What would confirm it:** add five lines to `PROJECT.md`, run the orchestrator's
compaction, then invoke `theme-factory` and see whether it refuses or reopens.

**Who it hits:** Inferred: any project whose `PROJECT.md` reaches its cap after a theme
is settled.

**Proposed fix:** Have the skill read the theme record from `.agent/DECISIONS.md`, which
is append-only and uncapped, rather than from the capped file. Do NOT implement.

---

## F9 — `theme-factory` has no path for delegated design authority

**Observed or inferred:** Observed in this run, as a conflict the builder had to resolve
against the skill's text.

**Evidence:** `.claude/skills/theme-factory/SKILL.md`, verbatim: "It never picks for the
user and never proceeds on silence." The stakeholder in this run explicitly delegated the
pick to the builder. The skill has no branch for that: it is written as though the only
two states are "user picks" and "agent overreaches". Following it literally would have
meant refusing an instruction the user gave; departing from it meant running a Level 2
decision with no variant round.

Taken: the departure, because the delegation came through the coordinator as an explicit
stakeholder decision, and it is recorded in `.agent/DECISIONS.md` as "authority delegated
... Recorded, not approved" so the provenance survives.

**Who it hits:** Any run where the human says "you choose". The skill's silence there is
what forces an agent to improvise on the one class of decision the pipeline most wants
audited.

**Proposed fix:** Add a third branch: on explicit delegation, pick, and require the
DECISIONS.md entry to name what was picked, what it beat, and that no variant round was
shown. Do NOT implement.

---

## F12 — the summary asserts the work is pushed and never says when it was not

**Observed or inferred:** Observed, by external review of the file, not by the run.

**Evidence:** `summary.md:45` stated as fact that "the work is already committed and
pushed" — the justification for the `hold` offer. The 90-minute run made 15 commits in a
repository with no origin remote. The orchestrator handled the skip correctly
(`orchestrator.md:44-46`) and recorded it in `STATE.md:79`, but the summary — the only
thing the human reads — implied the work was safe elsewhere. Same failure class as a
silently skipped assertion; `live-assertions.sh` prints SKIPPED for exactly this reason.

**Who it hits:** Any run without a remote, or where the push fails. Silent.

**FIXED in ccfb77b:** the closing line now states push status always, and says
"NOT PUSHED: <reason>. This work exists only on this machine." when it did not run.

---

## F13 — rule A is unsatisfiable for prose contracts, and the escape is a prefix

**Observed or inferred:** Observed, during the port-back of these findings.

**Evidence:** rule A gates `feat:`/`fix:` on a prior `test:` commit sharing a directory or
filename stem. `.claude/agents/*.md` has no possible overlapping test, so no change to an
agent contract can ever be committed as `feat:` or `fix:`. Attempting exactly that:

```
REFUSED  rule A, test-first ordering
  Nearest test: commit 4959a7e touches no overlapping path.
  staged:      .claude/agents/builder.md
  staged:      .claude/agents/orchestrator.md
  Satisfy it: the test must share a directory or a filename stem with the code.
```

`hooks/commit-msg:18` shows the gate keys off the message prefix alone:

```
feat:* | feat\(*\):* | fix:* | fix\(*\):*) needs_test_first=1 ;;
```

The only legal route is to choose a prefix rule A does not gate.

Here that is CORRECT — the change genuinely is documentation, and it was committed as
`docs:`. But the same escape is available to anyone committing real product code as
`chore:`, `refactor:` or `docs:`, and rule A will never fire. The discipline is enforced
by the author's honesty about the prefix, not by the hook.

**Who it hits:** Any user who wants to skip test-first without leaving a trace. Unlike
`--no-verify`, this leaves no signal at all — a `chore:` commit looks entirely normal.

**Proposed fix, NOT implemented:** gate rule A on staged PATHS rather than on the message
prefix. If a commit touches source paths, require the test regardless of what it calls
itself. That is language-specific and needs a per-project config, so it is a design
decision, not a five-minute change.

---

## F14 — no agent verifies which repository it is operating in

**Observed or inferred:** Observed.

**Evidence:** Two repositories with near-identical structure — the pipeline template and a
clone of it — sit side by side. A brief that said "in the pipeline repo" as prose was
executed against the clone. Every finding it produced was correct for the repo it was in,
and every external verification was correct for the other, and the contradiction was only
caught by comparing them. Both parties reported with full rigour and neither checked
`pwd`.

The same secret-scanner probe, same key, same command, in the two trees:

```
~/Desktop/Warsaw_District_Air_Board/warsaw-air     hooks/pre-commit:33 exemption present
  $ git commit -m "chore: scanner check"
  [main 1efa586] chore: scanner check          <- ALLOWED

~/Desktop/EasyDev_Agentic_Engineering_Pipeline     exemption absent, fragments at 13-14
  $ git commit -m "chore: scanner check"
  REFUSED  secret-scan [aws-access-key]  hooks/probe.sh:26
```

Neither result was wrong. They were answers to the same question about different repos,
and nothing in either report named which one.

**Who it hits:** Anyone running the pipeline alongside a clone, a vendored copy, or a
worktree. Silent: the work lands, the commits succeed, the reports are internally
consistent.

**Proposed fix, NOT implemented:** an agent's first line of output names its working
directory and the repository's origin remote, or "no remote". Prose in a brief is not
enforceable; a printed postcondition is.

---

## F23 — §15's fourth-agent trigger fired: the checker passed a flat interface, honestly

**Observed or inferred:** Observed, during run 002's slice two.

**Numbering note:** F15–F22 exist only in the clone's `RUN-002-FINDINGS.md` and are not
visible from this repository. `findings.md` says numbering is global; a `grep` confined to
this repo would have produced F15 and collided with four existing findings. Cross-repo
numbering has no mechanical guard — an instance of F14.

**Evidence:** `docs/DESIGN.md:393` admits a fourth agent only "if a run shows a dedicated
role prevents a mistake the checker missed". A run did. The board shipped 18 districts as a
vertical list: three fill a viewport, a ~5,500px scroll with no overview. Measured in
headless Chrome at 1280x1000 against the live server, not judged from the CSS.

The checker did not miss it through negligence — it passed the slice **correctly**, because
the acceptance criteria never mentioned quality, and its contract scopes it to the criteria
in `STATE.md`. An honest PASS about criteria nobody wrote to include the result being usable.

**The structural cause, and why a skill could not fix it.** The builder holds two
contradictory mandates. `ponytail`'s ladder — "does this need to exist at all", one line
before fifty, the laziest solution that works — sits in the builder's own contract.
`frontend-design`'s "spend your boldness in one place, take one real aesthetic risk" sits in
a skill the builder invokes. When they conflict the ladder wins, because a contract outranks
a skill. No amount of stronger wording inside the skill changes that ordering.

**Who it hits:** Any project whose interface quality is not written into acceptance
criteria — which is most of them, since criteria describe capability. Silent: tests pass,
the checker's assertions pass, and the interface quietly reads as a prototype.

**FIXED here:** `.claude/agents/designer.md`, a fourth agent owning form and aesthetic
direction, with no write access, exempt from the ladder by design. `orchestrator.md`
delegates to it before the builder on any slice that ships or reshapes an interface. The
builder's ladder is unchanged — it is correct for code; the builder simply no longer chooses
form.

---

## KNOWN LIMITATION — the verifier is not a different model family

**Not a defect. A property of the environment, recorded so nobody mistakes it for one.**

Adversarial review practice specifies the verifier should be a different MODEL FAMILY with
fresh context and read-only tools. This repository has two of the three: the checker gets
fresh context and has no write access. A different family is not available inside Claude
Code, and a different Claude model shares the blind spots that matter, so it is not faked —
a substitution that looks like independence without being it is worse than an acknowledged
gap.

**What stands in its place**, all structural rather than judgmental:

- the **held-out suite**, derived from the acceptance criteria and never committed, so
  nothing can be written against it;
- the **mutation probe**, which breaks one line and requires a test to notice;
- the **collected-count check**, which catches tests that exist but never run.

Published research finds LLM judges detect false-success at AUROC 0.54-0.65 while
outcome-based checks reach 0.83-0.95. The structural substitutes are therefore not a lesser
option here; they are the stronger one. Judgment is what this pipeline distrusts by
construction, so replacing a missing judge with more judgment would have been the wrong
repair.

---

<!-- PORTED 2026-08-09 from the clone's RUN-002-FINDINGS.md (warsaw-air, run 2, slices 4-5),
     source SHA d32881b. IDs carry the R2- run prefix per .claude/policies/findings.md.
     Full evidence — timestamps, verbatim probe output — lives in the source record;
     these entries are the pipeline-relevant substance plus status as of the port. -->

## R2-F26 — the designer cannot see the thing it is designing

**Observed or inferred:** Observed in run 2. Ported.

**Evidence:** `designer.md` frontmatter omitted `Bash`. Slice 4 existed because the board
measured ~6,438px in headless Chrome; the designer sent to fix it could not render a page,
said so — "every height number below is a budget for the builder to verify, not a
measurement" — and substituted stylesheet arithmetic (24 + 24 + 16 + 96 + … ≈ 922px), which
is precisely what the pipeline's own rules forbid.

**Who it hits:** Every slice with a layout constraint. Read-only was the intent, but
read-only and cannot-measure are different things: the checker is also read-only and has
`Bash`, which is the proof it was never needed for write-denial. Write access is enforced
by the absence of `Edit` and `Write`, not by the absence of a shell.

**Status:** FIXED in run 2 — `Bash` added to `designer.md`. Confirmed delivered in this
session's spawn census: the designer reported `Bash` among its arrived tools.

## R2-F27 — an agent-definition fix applied mid-session does not reach the running session

**Observed or inferred:** Observed in run 2, three independent instruments agreeing. Ported.

**Evidence:** The R2-F26 fix was live on disk — the frontmatter read correctly when the
file was read. The session's agent-type listing also looked correct. The spawned designer's
own first line: "Bash did NOT arrive." Two enumerations exist and only one updates: the
agent-type listing is a session-start snapshot, while the delivered tool set is what the
runtime actually hands a spawned subagent. The same designer made 19 successful WebFetch
calls in that run, so the instrument reporting the absence was itself working.

**Who it hits:** Any mid-session pipeline repair. Editing an agent definition and
continuing looks identical to editing one and having it take effect. It cost a design
round, and was caught only because the designer reported its delivered tools unprompted.

**Proposed fix:** An agent-definition change is followed by a session restart before any
run that depends on it. And the arrival census becomes mandatory, not conventional: an
agent's first line states its DELIVERED tools and names every contracted tool that did not
arrive or arrived renamed. This is F11's failure class, now with a measured cost.

## R2-F31 — escalations do not mark unmeasured claims INFERRED

**Observed or inferred:** Observed in run 2, self-reported by the orchestrator. Ported.

**Evidence:** A Level 2 escalation read "638px of horizontal overflow pushes the table
off-screen entirely" and the backlog called the content "unrecoverable". Neither was
measured — nobody scrolled. The probe behind the number was itself clamped: macOS limits
headless Chrome to ~500 CSS px, so `--window-size=390,844` reported `clientWidth=500`. At
a true 390px the table was already reachable (`maxScrollX=756`). The real defect was a
collapsed grid track squeezing the table ~70px under its desktop width. The human decided
on the inflated premise, presented as fact.

**Who it hits:** The human, at the exact boundary the pipeline exists to protect.
`findings.md` requires observed/inferred marking of internal notes; nothing required it of
what reaches the human — a note to oneself got more rigour than a decision request.

**Status:** FIXED at the port — `.claude/policies/autonomy.md` now requires every claim in
an escalation to be marked measured or inferred, with measured claims naming their
instrument. See the clause and this port's commit.

## R2-F32 — commit-msg rule A enforced nothing: two correct rules composed into a false green

**Observed or inferred:** Observed in run 2; mechanism confirmed upstream by inspection and
by audit. Ported.

**Evidence:** Rule B forces every `feat:` commit to stage `.agent/DECISIONS.md`. The
progress board causes `test:` commits to stage `.agent/PROGRESS.md`. `dirof()` returned
`.agent` for both, so rule A's overlap check passed on every `feat:` commit regardless of
whether any test covered the code. Audited over history: rule A passed 17 of 17 `feat:`
commits in warsaw-air — it refused nothing, ever. Neither rule is wrong in isolation.

**Who it hits:** Every project using this pipeline. Rule A is the pipeline's central
guarantee — the one enforced by a hook rather than by discipline — and it silently stopped
binding the day the progress board landed. The 21-case suite could not catch it because
every case staged clean fixtures; a suite of individually-correct rules tested one at a
time cannot see two of them compose into a false green.

**Status:** FIXED upstream and in the clone (`39794b4` / `d32881b`): overlap is computed
over paths outside `.agent/` and `docs/` on both sides, a checked `Covers:` trailer handles
links no path rule can see, and suite cases 24-28 stage the interacting fixtures.

## R2-F33 — five tests that could not fail, and where in the lifecycle each was caught

**Observed or inferred:** Observed, run 2, all five individually evidenced in the clone's
record and in this repository's commits.

**Evidence:** Five checks in one run passed while asserting nothing:

1. **Self-comparison** — a ring-closure check compared a district's tuple of rings to
   itself. Trivially true.
2. **Truncate-before-read** — a progress-board writer opened its file for writing before
   reading it, committing an empty board with exit 0.
3. **Shape-not-value** — band colours asserted only as six distinct `^#[0-9a-f]{6}$`
   strings; a one-character drift in a published EEA scale hex stayed green through 103
   tests until a checker mutation exposed it.
4. **The overflow:hidden scroll container** — a guard's docstring promised
   `overflow-x: hidden` would redden it; an `overflow:hidden` box is still a scroll
   container, `window.scrollTo` moves it programmatically, and the geometry probe was
   blind under both `body` and `html` mutations.
5. **The grep -F multi-line presence check** — the hook suite's `assert_allowed` grepped
   the whole commit message; a multi-line message becomes several patterns, one of them
   the blank line before a trailer, which matches every line of any log.

The first four were found AFTER landing — by later mutation, by looking at the artifact,
or by the checker. The fifth was caught DURING authoring, before it landed. That
difference is the finding: the counterfactual habit (run the assertion against the broken
state before trusting it) moved the catch from cleanup to construction, which is the only
place it is cheap.

**Who it hits:** Everyone, structurally. Five independent authors, five different
mechanisms, one shape: an instrument that cannot produce a negative result. No review of
the assertion's text caught any of them; only running the assertion against a state it
should reject did.

**Proposed fix:** Already partly in force — the suite's header rule and cases 24-28 encode
it for the hooks. The general rule worth porting to the agent contracts: a new test is
run once against the defect it exists to catch (mutate, then restore) before it is
trusted, and a test that cannot be made to fail is reported as a finding, not committed.

## R2-F34 — architecture-check cannot fire on the case its own clause was written for

**Observed or inferred:** Observed, 2026-08-09, measured against the clone.

**Evidence:** The skill's boundary section targets "markup assembled by string
concatenation inside a module that also holds request routing" — and its trigger reads
"Runs only when module boundaries moved in the diff." The clone's `app.py` went 295 → 466
lines with 41 tag-bearing lines and zero template files, and the skill declined every
phase gate. A missing seam produces one-module diffs by definition, and one-module diffs
are the decline condition: the clause is structurally unreachable from its own trigger.

**Who it hits:** Any project growing a monolith — which is the default failure mode the
clause was written against.

**Status:** FIXED at the port, both repos: the trigger now also fires when any single
module grew by 100 or more counted lines across the phase's diff. 100 because it is
module-sized in the reference codebase (`theme.py` 132, `boundaries.py` 222 at birth): a
module's worth of new code producing no new seam is the shape of a seam not drawn. The
observed miss (+171) fires; routine slice growth (+8 to +60) does not. The skill's
default remains NO CHANGE, so an eager trigger costs one look, not a refactor.
