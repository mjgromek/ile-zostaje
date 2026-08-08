<!-- Cap: 8 lines per entry. Append only — never edit or delete a past entry. Newest at the bottom. -->

# DECISIONS

One entry per material decision: what, why, what it rules out.

<!--
## 2026-01-01 — Sessions keyed by an opaque token, not a row id
What: Session subjects are a random opaque token issued at login.
Why: Row ids are recycled by the database and a recycled id was reachable as another
     user's session in three requests, under a passing test suite.
Rules out: Any lookup that treats a primary key as an identity claim.
Level: 2, approved by the human.
-->

## 2026-08-08 — Our security skill is named `security-gate`, not `security-review`
What: `.claude/skills/security-review/` renamed to `security-gate/`, frontmatter name with
      it. A public interface name changed: the skill is invoked under the new name.
Why: Claude Code ships a built-in `security-review`. Before the rename one entry of that
      name was listed, ours; after it, both are listed separately — the collision was real.
      Which one a call resolved to was never tested, and no substitution was ever observed:
      in the failed run none of our skills loaded. Precaution, not a fix for a proven bug.
Rules out: Any claim that our skill performs the review. It only decides when to run it.
