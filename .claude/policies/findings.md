<!-- Cap: 60 lines. -->
# Findings — defects in the pipeline itself

A finding records a defect in the **pipeline**, never in the product. Product defects are
graded P0, P1, P2 and belong to the checker. A product bug written up as a finding is a
bug nobody is assigned to fix.

## Where and when

**Findings go to `RUN-<nnn>-FINDINGS.md` at the repository root, appended THE MOMENT
something is found.** A findings file reconstructed at the end of a run is a memory, not a
record: it keeps what the writer still recalls and silently drops the rest.

**A finding is identified by its run and its number within that run: `R2-F5`, never a bare
`F5`.** Numbering restarts at 1 in each `RUN-<nnn>-FINDINGS.md`, so no cross-file grep is
needed and a collision is impossible. Before appending, `grep '^## R<n>-F'` in THIS file
only and take the highest plus one.

**A reference to a finding always carries its run prefix.** `See F6` is ambiguous the moment
a second run exists; `See R1-F6` is not.

**Findings written before this convention keep their bare numbers. Do not renumber them** —
a stable identifier that is ugly beats a tidy one that breaks every existing reference.

This is F14's family: cross-repo state with no mechanical guard. It is fixed by removing the
need for the guard rather than by adding one. The previous rule said to grep every
`RUN-*-FINDINGS.md` in the repository, but findings live in whichever repository the run
happened in, and a repo-scoped grep cannot see the other one — following it literally
collides.

## Shape

```
## F<n> — <one-line title>
**Observed or inferred:** <which, explicitly>
**Evidence:** <verbatim output, or file:line>
**Who it hits:** <clone users, vendored users, this run only>
**Proposed fix:** <one line. Do NOT implement unless it is a blocker>
```

## Refusal conditions

**Never write a finding you cannot evidence.** Suspected but unseen is marked **INFERRED**
and carries what would confirm it. A findings file that overstates its certainty fails the
same way as the reports it exists to catch.

**Secret-shaped literals are REDACTED** — `AKIA[REDACTED: 16 chars]` — so the file can be
committed by the scanner it documents. Quoting a refusal verbatim and intact is what makes
the record unstageable.

**A blocker fix is logged BEFORE the edit, never after.** A fix with no prior entry is
invisible when the changes are extracted.

**Blockers get fixed; design questions get logged.** If a fix takes more than five minutes,
or needs a choice between two reasonable designs, log it and work around it. Implementing a
design question is how a findings pass becomes an unreviewed redesign.
