# PROJECT.md

<!-- Cap: 60 lines. Filled at discovery, run 4, from the stakeholder brief. -->

## Objective

A browser calculator that tells a young person in Poland what actually lands in their
account each month from a given contract, and what is left once rent and food are paid.
It exists so that "can I live on this?" is decided on a real number, not a gross one.

## Users

Young people and students in Poland, usually under 26, quoted pay as a gross amount on
umowa o pracę, zlecenie or dzieło, unable to tell what they will receive — deductions
differ sharply by contract, by age and by student status. Not technical, in Polish or
English, as likely on a phone as a laptop. The under-26 relief and student status on
zlecenie are FIRST-CLASS cases, never edge cases.

## Stakeholder language

**Stakeholder language:** Polish

## Constraints

- No backend. Static client-side app; user data lives in localStorage and nowhere else,
  and the interface says so. A server ships only if something is shown to need one.
- Stack: TypeScript, Vite, React. Vitest for the engine, Playwright to drive a real
  browser, so the checker exercises the artifact and not the diff.
- Node 25.9.0 and npm 11.12.1 are at `/opt/homebrew/bin`, NOT on the agent's default Bash
  PATH. Every command sets it first. See R4-F3.
- The tax year is DATA, not code. Every rate carries a citable official source URL and an
  effective date. A rate that cannot be cited does not ship.
- Polish AND English, both first-class from the first slice.
- V0 contracts: umowa o pracę, zlecenie, dzieło. Input units: hour, week, month, year.
  Visual direction is warm and friendly — stakeholder-settled, never reopened.
- No secrets, no keys, no credentials of any kind.

## Non-goals

- B2B and działalność gospodarcza, however often they are assumed to be in scope.
- Tax advice, filing, a PIT return, anything a tax office would treat as authoritative.
- Accounts, login, server-side storage, analytics, telemetry, cookies.
- Any tax year other than the one shipped, and any rate the project cannot cite.

## Invariants

- No rate or threshold literal in engine code. Every one comes from the year data file
  with its source. A rate in an if-branch is a defect, not a shortcut.
- Every user-facing string exists in both Polish and English. No untranslated fallback.
- No user data leaves the device: no outbound request beyond the app's own assets.
- Every screen says the result is an estimate, not tax advice, and where data is kept.
- The "what's left over" layer survives every scope cut. Net pay alone is a commodity.

## Definition of done

At a public URL, on a phone or a laptop, in Polish or English: a user enters what they
earn, in hour/week/month/year, on any of the three V0 contracts, with age and student
status, and sees the real monthly net plus a breakdown whose lines sum back to the gross.
They then enter rent and food and see what remains. A reload keeps their entries, and the
browser's network log shows nothing left the device.
