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
