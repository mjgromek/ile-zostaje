<!-- Cap: 50 lines, whole file. Over cap is a bug: cut content, never a rule. -->
# Deploying a project built with this pipeline

Provider-neutral. Railway, Cloud Run, Fly, a VM — the verbs differ, the rule does not.

## The reconcile rule

**Query the current remote state and branch on it. Never assume creation.**

Every provider has a create verb that is not idempotent — `railway add`, `gcloud run
deploy` against a fresh name, `fly launch`. Run one where the service already exists and you
get a second service, billing against the same project and serving nothing anyone asked for.
Only a slice's first deploy takes the create branch; every deploy after it is a reconcile.

In order:

1. **Read the environment before touching it.** List services and deployments, read the
   revision currently serving, and write down what you found.
2. **Branch on what you found, not on what the brief said.** A brief's environment snapshot
   is written once and stale from then on — the failure class of R2-F17.
3. **Create only when the read came back empty.** Otherwise update the service that exists.
4. **Verify with `hooks/verify-deploy.sh`**: it asserts the live URL serves the expected
   revision, and takes either `PROTECTED_PATH` or an explicit `NO_PROTECTED_ROUTE=1`. An
   omission is not a declaration — unset without the flag is FATAL and loses A1 too (R2-F21).

**A brief saying "there is no service yet" is a claim, not a measurement.** R2-F24 is the
instance: an agent was told a project had no service, measured first, and found one service
and two deployments. Following the instruction literally would have produced a duplicate.
Measuring first cost one command.

## What is NOT enforced

**Nothing mechanically checks the reconcile rule, and this file will not pretend otherwise.**

`verify-deploy.sh` runs *after* a deploy and asserts against a serving URL. The duplicate
happens *before* anything serves and is invisible from a URL: a stray second service sits
beside the real one while `/version` returns exactly the revision expected, so the gate
reports PASS over the defect it was asked to catch. Putting this rule in an executable file
would make it look enforced without making it so — the shape R2-F33 records five times.

It is a runbook precondition. It binds because someone reads it, and for no other reason.
