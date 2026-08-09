<!-- Cap: 120 lines. Orchestrator enforces on every write. Over cap: compact settled facts into DECISIONS.md and delete them from here. State describes now. -->

# STATE

Run 4. Phase-start SHA ea76697. Pipeline upstream SHA ea76697 — the same commit: the
template's history is in this repository and the clean clone is where product work starts.
FILES CHANGED for this phase is generated from `git diff --stat ea76697..HEAD`.

**Every shell command in this project starts with `export PATH="/opt/homebrew/bin:$PATH"`.**
Node and npm are there and are NOT on the agent's default Bash PATH. Skipping it produces
`command not found`, which reads as "not installed" and is wrong. See R4-F3.

## Current slice

**Slice 1 — Umowa o pracę: a monthly gross goes in, the real net comes out.**

One screen. The user enters a monthly gross amount on umowa o pracę and states whether
they are under 26. They see the net that reaches their account, a breakdown of where the
difference went, in Polish or English, on the warm screen the designer specifies. Rates
come from a year-keyed data file with cited sources, never from code. Entries persist in
localStorage and the screen says so.

Not in this slice: umowa zlecenie, umowa o dzieło, hour/week/year units, the rent-and-food
leftover layer, deployment. Each is a later slice, none is dropped.

## Acceptance criteria

Checked in a real browser against the running app, not against the diff.

1. Entering a monthly gross for umowa o pracę displays one prominent net-per-month figure
   in PLN, updating as the input changes, with no page reload.
2. The breakdown names every deduction with its amount. The deductions plus the net add
   up to the gross to the grosz — the checker adds the displayed numbers and confirms it.
3. Toggling "under 26" changes the displayed net, and the income-tax line reads 0 zł where
   the relief applies. Both states are observed on screen, not inferred from code.
4. Every rate and threshold comes from a year-keyed data file. Each carries an official
   source URL (gov.pl, zus.pl, sejm.gov.pl or equivalent) and an effective date, and the
   screen names the tax year in use. Proof: the checker edits one value in the data file,
   reloads, and the net changes. A rate that cannot be cited does not ship.
5. The language switch renders the whole screen in Polish and in English. No untranslated
   or missing-key string is visible in either language. ONE deliberate exception, not a
   defect: `Zlecenie` and `Dzieło` stay Polish in the EN build — legal contract types with
   no English equivalent, glossed in the EN helper text. Do not grade it as a miss.
6. The screen states, in the active language, that the result is an estimate and not tax
   advice, and that entries stay in this browser.
7. Entries survive a page reload. The browser's network log shows no request beyond the
   app's own assets — nothing leaves the device.
8. Evidence: Vitest covers the engine with at least three hand-computed cases per relief
   state, each naming the source its expected figure came from; Playwright drives a real
   browser for criteria 1, 3, 5 and 7.

## Shipped

Nothing yet. No product code exists at ea76697.

## In flight

Nothing. `designer` has delivered; its spec is persisted at `.agent/DESIGN-SLICE-1.md` and
is authoritative for the builder — read it before writing any interface code. `builder` is
the next delegation and is not blocked.

## Blocked

Nothing. Slice one proceeds under the run-4 brief's grant to choose where the brief is
silent, with each choice recorded in DECISIONS.md.

## Last verification result

No slice verified yet. Pre-flight only: `./hooks/test/run-hook-tests.sh` passed 28/28,
reported by the human at the start of run 4, not re-run by this instance.

## Next slices, in order

2. Umowa zlecenie and umowa o dzieło, including student status on zlecenie.
3. Input units: hour, week, month, year.
4. The leftover layer — rent and food subtracted from the net. Survives every scope cut.
5. Deploy to a public URL, verified with `hooks/verify-deploy.sh`.

## Checkpoints

- 2026-08-09 20:47 — discovery run from the brief; PROJECT.md filled, stakeholder language
  Polish, four decisions recorded, slice one written here.
- 2026-08-09 21:06 — designer delivered; spec persisted to .agent/DESIGN-SLICE-1.md, accepted at
  Level 1 under the run-4 grant. ZUS ceiling deferred to BACKLOG. Builder is next.
