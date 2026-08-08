# EasyDev Agentic Pipeline

Template for bounded-autonomy Claude Code work: three agents, six skills, three hooks,
four state files. Copy them into a project, then fill in `PROJECT.md` before slice one.

## Wire the hooks — a fresh clone does not inherit them

```sh
git config core.hooksPath hooks
```

**This repository does not wire its own hooks, by design.** It has no tests and no product
code, so the test-first rule would refuse every commit to the template itself.

- `hooks/pre-commit` — secret scan over added lines. Override: `git commit --no-verify`.
- `hooks/commit-msg` — a `feat:` commit needs a preceding `test:` commit on an overlapping
  path, and must stage `.agent/DECISIONS.md`.

## Deployment checks

`verify-deploy.sh` runs after a deploy, `probe.sh` from cron outside the deploy platform;
both read `hooks/lib/live-assertions.sh`. Required: `BASE_URL`, `PROTECTED_PATH`.
Optional: `HEALTH_PATH` (default `/health`), `RESOURCE_PATH`, `TEST_USER`, `TEST_PASS`,
`LOGIN_PATH` — an unset one is skipped aloud, never silently. verify-deploy only:
`EXPECTED_REVISION` and `VERSION_PATH` (default `/version`).
