<!-- Cap: 45 lines. -->
# Findings — defects in the pipeline itself

A finding records a defect in the **pipeline**, never in the product. Product defects are
graded P0, P1, P2 and belong to the checker. A product bug written up as a finding is a
bug nobody is assigned to fix.

## Where and when

**Findings go to `RUN-<nnn>-FINDINGS.md` at the repository root, appended THE MOMENT
something is found.** A findings file reconstructed at the end of a run is a memory, not a
record: it keeps what the writer still recalls and silently drops the rest.

**Numbering is global, never per-file.** Before appending, `grep '^## F' RUN-*-FINDINGS.md`
across every such file in the repository and take the highest plus one. Two files each
counting from F1 is how a run mints a duplicate.

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
