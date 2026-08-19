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

## 2026-08-09 — Layout: the stakeholder chose variant B, and cut the lede sentence
What: B ships — contract type as a full-width bar above everything, one card with the
     amount and Nie/Tak questions, answer directly below. The lede sentence is CUT, not
     shortened and not moved: "to wiadomo."
Why: B is the only variant that never requires a payroll word to answer a question, and it
     was picked from three rendered layouts rather than from prose.
Rules out: Re-opening the page form without new rendered variants, and reintroducing the
     lede sentence under another name.

## 2026-08-09 — The brutto/netto toggle becomes slice 3, not part of slice 2
What: Slice 2 keeps three contracts, student status, KUP and layout B. The netto->brutto
     toggle and its reverse calculation get their own slice, round-trip as the criterion.
Why: A new engine capability, not a label: it inverts the cited rates and meets flat and
     stepped regions where a rounded net maps to many gross values or none. Bundled with
     two unresearched contract types, a P0 in either blocks both.
Rules out: A "typical multiplier", any parallel formula, and a slice 2 too big to verify.
Level: 1 under the grant; named in the summary as instructed, not absorbed silently.

## 2026-08-09 — The lede is deleted as an ELEMENT, not as one contract's string
What: `app.lede` goes for all three contracts and both languages, not only the zlecenie
     text the stakeholder quoted. The designer flagged the ambiguity rather than guessing.
Why: Their reason was "to wiadomo" — it states the obvious — and that is contract-
     independent. Deleting one string while two others say the same obvious thing would
     honour the words and miss the point. Cheap now, expensive after the builder starts.
Rules out: A per-contract lede returning later under another key.
Level: 1 under the grant. Reversible in one commit if the reading was wrong.

## 2026-08-09 — 50% copyright KUP is modelled on dzieło only, and says so on screen
What: Slice 2 offers the 20/50% copyright question on umowa o dzieło. Creative work on
     zlecenie can also carry 50%; that is out of this slice and NAMED on screen.
Why: The slice's criteria scope KUP to dzieło, and widening it silently would be the
     hidden-branch defect criterion 4 exists to catch. Saying "this is what we cover" is
     honest; showing 20% to a creative on zlecenie without a word is not.
Rules out: Silent under-reporting for zlecenie, and a bare percentage with no condition.
Level: 1 under the grant. In BACKLOG with its urgency condition.


## 2026-08-18 — One engine for three contracts, every per-contract RULE cited as data
What: `computeUop` becomes `computeContract(gross, answers, rates)`. Which contributions exist,
     chorobowa's voluntariness, the student-under-26 ZUS exemption, the contracts the
     under-26 relief covers and the 20/50% koszty are all `Cited` entries in the year file.
Why: Criterion 4 fails any rule that lives in an `if`. One engine also makes sum-to-the-
     grosz one property instead of three, and keeps etat on the arithmetic v0.1.0 shipped.
Rules out: A second formula per contract, and a rule readable only by reading the engine.
Level: 0 — slice 1's data-as-citation shape, widened from numbers to rules.

## 2026-08-18 — A question appears where it can change the result; one exception, stated
What: `Studiujesz?` renders on zlecenie and `Przenosisz prawa autorskie?` on dzieło.
     `Masz mniej niż 26 lat?` renders on all three, and on dzieło it stays live while the
     screen prints `subst.relief.dzielo` under the band.
Why: DESIGN-SLICE-2 §6 names exactly one substitution instance and §10 gives exactly one
     substitution string. A question with no possible effect and no sentence explaining
     that would be the dead end §6 forbids, and inventing strings reopens a closed spec.
Level: 0 — the spec settles it; recorded because the reading, not the rule, was the choice.

## 2026-08-19 — The relief's worth is a counterfactual, not the tax it happened to remove
What: `reliefWorthGrosz` is `core(gross, { ...answers, under26: true })` netted against the
     current answer, on BOTH sides of the flip, the way `studentWorthGrosz` already was.
Why: The `Nie` chip read `pitWithoutReliefGrosz`, which with `under26: false` is the WHOLE
     PIT advance — right below the relief's monthly limit and wrong above it, by 37% at
     20 000 zł (P1-J). Four checker cycles missed it because every figure was at 6 000 zł.
Rules out: Pricing any answer from a field computed under the other answer's branch, and
     any chip figure not obtained by running the engine with the answer flipped. Level 1.

## 2026-08-19 — The designer is not re-run for slice 3; DESIGN-SLICE-2 §3 settled it
What: §3 fixes the toggle's own row above the amount label, its two arrowed segments, its
     treatment, its copy per mode and its nine strings, measured at 390 and 1280.
Why: The standing rule is that a slice RESHAPING the screen shows rendered variants. This
     one does not reshape: §3 measured the drop-in when variant B was picked, and
     re-running the designer would reopen a decision the stakeholder has already made.
Rules out: A second placement round, and any deviation from §3's copy table.
Level: 0 — executing a settled spec.

## 2026-08-19 — Flipping the direction REINTERPRETS the amount; it never clears it
What: The number in the field stays; the control above it changes what that number means.
     6 000 brutto becomes 6 000 wanted on hand, and the answer changes accordingly.
Why: The control sits above the field precisely to be read before it (§3). Converting
     would silently rewrite what the person typed; clearing would throw it away. Both
     invent behaviour the spec does not contain, and neither can be read off the screen.
Rules out: Auto-filling the field with the net just computed.
Level: 1 — a small user-visible choice inside a settled form. Named in the summary.

## 2026-08-19 — P2-G and P2-I are promoted into slice 3 by their own urgency condition
What: The announce and delta refs reset when the result goes null, so clear-and-retype
     gives one utterance and no chip pricing a screen that is gone. One fix, both items.
Why: P2-I's condition is literally "slice 3's toggle makes clear-and-retype a normal entry
     mode" — flipping direction and retyping is now the ordinary gesture. The backlog
     pre-authorised this; carrying it further would make the entry a wish.
Rules out: Deferring the pair into slice 4, where a third trigger would widen it again.
Level: 0 — the backlog states the condition and the condition is met.

## 2026-08-19 — The reverse solve searches the shipped engine; bisection alone is unsound
What: `solveGross` calls `computeContract` and scans; it is verified against an exhaustive
     one-grosz scan per contract, and reports the LOWEST gross plus the run's bounds.
Why: MEASURED with the shipped engine at 15:00 — the net FALLS on 118 of 30 000 one-grosz
     gross steps on uop, worst 1,00 zł, so net is not monotone and a bare bisection can
     land in a hole. Plateaus reach 6 gross per net: "the lowest" is a choice, not a tie.
Rules out: A closed-form inverse, a multiplier, and any solver not checked against a scan.
Level: 1 — an internal interface added inside the engine's existing shape.

## 2026-08-19 — The reverse solve is bisection to LOCATE, an exhaustive scan to DECIDE
What: `solveGross` bisects `computeContract` for the crossing, then scans ±20 zł of gross
     one grosz at a time and reports the lowest exact match, the bounds of the matching
     set, or the closest gross when there is none. `WINDOW_GROSZ` is measured, not chosen.
Why: Net is not monotone in gross, so bisection alone can land in a hole; and a matching
     set spans up to 129 grosz WITH GAPS INSIDE IT, so its bounds cannot be walked
     outwards from the first match either. The scan is what makes "lowest" and "from lo to
     hi" true. 4 000 engine calls, ~7 ms — a keystroke's worth of work. Level 1.
