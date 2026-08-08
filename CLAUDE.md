# CLAUDE.md — rules for every session in a project using this template

## Editing

- **Never patch files with `str.replace` or `sed`.** Use the editing tool, which fails
  loudly on a non-match. A silent no-op exits zero and leaves the file identical.
- **A green build is not evidence that an edit landed.** Confirm the file changed.

## Verification

- **Exit code is not proof.** Any step that transforms a file asserts the postcondition,
  not the exit status.
- **The checker drives the artifact, never the diff alone.** Call the endpoint, drive the
  UI, read the real output. A diff that looks right and an artifact that works are
  different claims, and only the second one counts.
- **Before reporting an observation as a finding, state how it was measured and whether
  the instrument could have produced it.** An unchecked instrument is not evidence.
- A fix without a test that now covers it is a claim, not a fix.

## Autonomy

- **All autonomy decisions follow `.claude/policies/autonomy.md`.** Level 0 and 1: act
  and name it. Level 2 and 3: stop and escalate in the format that policy specifies.
- Every agent needs `Skill` in its `tools:` allowlist, or the skills are unreachable.
- Fix loops stop at two attempts on the same finding. A third means the finding is
  misunderstood. Escalate with what was tried.

## Reporting

- **Reports are five lines or fewer per block. No essays.**
- The phase summary is the only format the human reads. Its format and refusal
  conditions live in `.claude/policies/summary.md` — follow that file, and never
  restate the template anywhere else.
- Defects in the pipeline itself are recorded per `.claude/policies/findings.md`.

## Setup

- Wire the hooks once per clone: `git config core.hooksPath hooks`. A clone does not
  inherit it.
- **If `orchestrator`, `builder` and `checker` are not in the available agent types, stop
  and say so** — the session is rooted outside the clone. Never proceed under `general-purpose`.
- **Your first output line names your working directory and your `origin` remote, or
  `no remote`.** Never rely on a brief's description of which repository this is.
- **Before any work, name every tool in your `tools:` line that did not arrive, and any
  that arrived under a different name.** `Task` may arrive as `Agent`. A tool named in a
  contract and absent at runtime degrades silently.
- State file caps are enforced by the orchestrator on every write. The numbers and the
  compaction rule live in `.claude/agents/orchestrator.md` — never restate them elsewhere.
- **A cap counts lines wrapped at 90 characters.** Markdown table rows, fenced code blocks
  and YAML frontmatter are exempt. An unwrapped file makes its own cap meaningless: a
  600-character line and a 60-character line both count as one.
