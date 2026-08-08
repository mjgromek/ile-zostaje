<!-- No cap. Entries are deleted when done or when they turn out to be false. Every entry carries the condition that makes it urgent. -->

# BACKLOG

Deferred items. P2 findings land here. An item with no urgency condition is not a backlog
item, it is a wish — write the condition or drop it.

Format:

```
- <item> — Urgent when: <the observable condition that promotes it into a slice>
```

## Deferred

<!-- - Pagination on the list endpoint — Urgent when: any account exceeds 500 rows. -->

## V1 backlog, from the V0 cut

- Intake skill: a one-time bounded interview that writes `PROJECT.md` and proposes slice 1
  — Urgent when: a run shows the orchestrator guessing at, or interrogating about, things
  a filled `PROJECT.md` would have answered.
- Project narrative: an on-demand plain-language walkthrough of what happened per phase,
  which agent did it and why, generated from `git log`, the `Agent:` trailers and
  `DECISIONS.md` — never hand-authored, never written by a hook — Urgent when: someone
  other than the author picks the project up.
- Upstream skill drift: `tdd`, `grill-me` and `frontend-design` are vendored forks with no
  update path, since `skills-lock.json` was deliberately removed — Urgent when: upstream
  materially improves one of them.
- Git worktrees and parallel agents — Urgent when: slices start blocking each other.
- Context7 or another docs MCP — Urgent when: a project needs library API lookups the web
  tools cannot cover.
- A formatter and linter hook — Urgent when: a target project has them configured.

## From RUN-001 (see docs/RUN-001-FINDINGS.md)

- F10 — checker findings persist nowhere: the report exists only in the returning agent's
  message, so a fresh orchestrator cannot read it. RUN-001 lost three of four P2s that way,
  and the orchestrator correctly refused to invent replacements — Urgent when: a run loses a
  checker report again, or a P1 or P0 is the thing lost.
- F1's design question — whether the orchestrator should "delegate" at all, given the runtime
  model is flat and the main session spawns every subagent. Its allowlist now carries `Task`,
  but line 3's wording was deliberately left alone — Urgent when: the description and the
  runtime disagree again, or a second runtime with different spawn semantics is targeted.
- F3 — agent and skill discovery when the session is rooted outside the clone. Still
  **INFERRED**: RUN-001 never reproduced it, because that session was rooted at the clone
  root. The CLAUDE.md preflight added since is a guard, not a confirmation, and this entry
  must not be read as fixed — Urgent when: anyone reports agents missing, or a run reports
  falling through to `general-purpose`.
- F13 — `commit-msg` rule A gates on the message prefix, not on the staged paths, so product
  code committed as `chore:`, `refactor:` or `docs:` bypasses test-first leaving no trace at
  all — unlike `--no-verify`, which at least signals. The fix needs per-project source paths,
  so it is configuration, not a clause — Urgent when: a run commits product code under a
  non-gated prefix, or a target project can enumerate its source paths reliably.
- F6 — the hook suite's fake server hardcoded port 8731, so a running app made the suite
  report false failures. FIXED: `fakeserver.py` binds port 0 and announces the chosen port,
  and `8731` appears nowhere in `hooks/`. Kept as a watch item, not a deferral — Urgent when:
  the suite reports a spurious pass or failure again, particularly with two runs on one
  machine.
