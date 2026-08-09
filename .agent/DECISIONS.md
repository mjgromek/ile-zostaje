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

## 2026-08-09 — No backend. The app is a static page and localStorage is the database
What: No server, no API, no database. Everything runs in the browser; entries persist to
     localStorage only.
Why: The brief fixes user data to localStorage and requires a server be justified rather
     than assumed. Nothing in V0 needs one — the rates are static data and the arithmetic
     is local. No server also means no secrets, no auth and no personal data at rest.
Rules out: Accounts, sync across devices, server-side rate updates, analytics.
Level: 1, under the run-4 brief's grant to choose where the brief is silent.

## 2026-08-09 — TypeScript + Vite + React, tested with Vitest and Playwright
What: The interface stack. Vitest for the calculation engine, Playwright driving a real
     browser for the artifact checks.
Why: Node 25.9.0 and npm are present (R4-F3). React because one screen recalculates many
     linked fields live and hand-rolled DOM updates break in ways unit tests miss.
     Playwright is what makes "the checker drives the artifact" true, not aspirational.
Rules out: A Python-served app, a build-free vanilla page, jsdom-only verification.
Level: 2 by autonomy.md — taken at Level 1 under the run-4 brief's explicit grant.

## 2026-08-09 — Slice one is umowa o pracę and monthly input only
What: The first slice ships one contract type and one input unit, both languages, the
     rate data file and the leftover layer's absence.
Why: A vertical slice must be thin enough to finish and real enough to use. Both languages
     ship from slice one because retrofitting i18n is far more expensive than starting
     with it; hour/week/year and the other two contracts plug into the same engine later.
Rules out: A backend-heavy first phase, and a slice one that ships English only.
Level: 1, do and report.

## 2026-08-09 — The shipped tax year is 2026, and the UI names it
What: The rate data file is keyed by tax year, ships 2026, and the interface displays
     which year the numbers come from.
Why: The tax year is data, not code. Naming the year on screen is what makes a stale rate
     visible to the user instead of silently wrong, and it is the cheapest possible guard
     on a file that will go out of date on a fixed schedule.
Rules out: A single undated rate set, and rates carried in engine branches.
Level: 1, do and report.

## 2026-08-09 — The slice 1 design direction is accepted without a stakeholder round
What: `.agent/DESIGN-SLICE-1.md` is authoritative for the builder: honey as the single
     accent, deductions as one plum ramp, a band plus a ladder, no green and no red.
Why: Warm and friendly was settled by the stakeholder; this makes it concrete, it is not
     a new direction. The run-4 grant, not the designer's own Level 2 grading, moves it.
Rules out: A stakeholder review before the builder starts. The reversal risk is the
     no-green/no-red call, which the designer named as most likely to be rejected.
Level: 2 by autonomy.md — taken at Level 1 under the run-4 brief's explicit grant.

## 2026-08-09 — The engine models one payroll case, and models the relief limit properly
What: One employment relationship, standard KUP, a filed PIT-2. Above the monthly share
     of the 85 528 zł relief limit the excess is taxed, ZUS deductible in that proportion.
Why: Those assumptions cover almost every young person on umowa o pracę. The limit is
     modelled, not assumed away: a zero tax bill at 20 000 zł/month is a correctness bug.
Rules out: Multi-employer months, podwyższone KUP, no-PIT-2 payroll, art. 83 health-
     contribution reduction. Each is a later slice, none is silent.
Level: 1, do and report, under the run-4 grant.

## 2026-08-09 — Polish number grouping is forced, against CLDR's own pl default
What: `formatMoney` sets `useGrouping: 'always'`, so pl-PL prints `6 000,00` and not
     `6000,00`. CLDR's pl locale suppresses grouping below five digits.
Why: The design spec fixes `6 000,00` as a measured example, Polish convention groups
     from four digits, and a salary is exactly the range where the default drops the
     separator — silently changing the one number the whole screen exists to show.
Rules out: Relying on the locale default for money anywhere in this app.
Level: 1, do and report.

## 2026-08-09 — Every slice ships to GitHub as a tagged version. STAKEHOLDER INSTRUCTION
What: After a checker PASS, before the summary: push main, then an annotated minor tag
     per slice (`v0.1.0`, ...), message in Polish, both confirmed with `git ls-remote` and
     never from an exit code. Push and tag ONLY; anything beyond that is Level 3.
Why: The stakeholder asked directly: "z każdym slice commituj też jako wersje na github."
     A tag asserts the slice works, so it never goes over an open P0 or P1.
Rules out: Tagging before a PASS, and a later run "simplifying" this away — not mine to
     drop. Not my choice: a standing instruction, recorded so it survives me.

## 2026-08-09 — Typography: the stakeholder chose variant A, the shipped control
What: theme-factory ran three type variants on the real screen. A (Bricolage / Familjen /
     Plex Mono, as shipped) beat B (Fraunces) and C (Bricolage at width 75%): "wybieram
     ten." No font change lands in slice 2; no colour token was ever in question.
Why: Recorded as a decision the stakeholder MADE, not as "no change needed" — the
     alternatives were rendered and shown and the control won, which a later run must see.
Rules out: Re-running the type question without new evidence.
Level: Stakeholder decision, not mine.

## 2026-08-09 — Page-form variants are rendered and chosen by the stakeholder. INSTRUCTION
What: Every slice that reshapes the screen renders two or three structurally different
     takes on the real screen and stops until the stakeholder picks. They must differ in
     structure, not decoration; an honest pair beats a set padded to three.
Why: Their words: "ale chcę też warianty stron nie tylko fontów jak coś." Choosing type
     from rendered variants worked; form is chosen the same way, looked at not imagined.
Rules out: One-proposal design handoffs, and building before the pick. The stop is
     requested, so it is not a Level 3 violation and never to be worked around.

