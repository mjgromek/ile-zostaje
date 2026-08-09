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
Why: Node 25.9.0 and npm are present (R4-F3), so a real test runner is available. React
     because one screen recalculates many linked fields live and hand-rolled DOM updates
     break in ways unit tests do not see. Playwright is what makes "the checker drives the
     artifact" true rather than aspirational — the checker has no browser tool.
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
What: The designer's spec (`.agent/DESIGN-SLICE-1.md`) is authoritative for the builder:
     honey as the single accent, deductions as one plum ramp, a proportional band plus a
     subtraction ladder, no green and no red anywhere.
Why: Warm and friendly was settled by the stakeholder; this is that direction made
     concrete, not a new one. The brief closed questions for this phase and told me to
     choose where it is silent. The designer graded its own spec Level 2 correctly under
     autonomy.md — the grant, not the grading, is what moves it.
Rules out: A stakeholder review before the builder starts. The reversal risk is the
     no-green/no-red call, named by the designer as the one item most likely rejected.
Level: 2 by autonomy.md — taken at Level 1 under the run-4 brief's explicit grant.

## 2026-08-09 — The engine models one payroll case, and models the relief limit properly
What: Slice one computes a single employment relationship with standard koszty uzyskania
     przychodu and a filed PIT-2. Above the monthly share of the 85 528 zł relief limit
     the excess is taxed, with ZUS deductible only in the taxed proportion.
Why: Those three assumptions cover almost every young person on umowa o pracę. The limit
     is modelled rather than assumed away because giving a 20 000 zł/month 25-year-old a
     zero tax bill is a plain correctness bug, and the limit is data the brief required.
Rules out: Multi-employer months, podwyższone KUP, no-PIT-2 payroll, art. 83 reduction of
     the health contribution to the tax advance. Each is a later slice, none is silent.
Level: 1, do and report, under the run-4 grant.

