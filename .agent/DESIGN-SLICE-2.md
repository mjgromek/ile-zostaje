# Slice 2 — design spec, variant B, as delivered by `designer` on 2026-08-09

Authoritative for the builder. The designer writes nothing to disk, so the orchestrator
persists it. Measured in headless Chromium at 320x568, 390x844 and 1280x800 against the
project's own shipped stylesheet, rendered outside the repository (R4-F9).

DESIGN-SLICE-1.md still governs everything not restated here: the band, the ladder, the
palette, the type scale, the spacing grid, motion, and the accessibility floor.

## 0. Orchestrator rulings on the two things the designer flagged

**The lede element is DELETED ENTIRELY, all three contracts, both languages** — including
the shipped `app.lede` for umowa o pracę. The stakeholder's reason was "to wiadomo", it
states the obvious, and that reasoning is contract-independent. Deleting one string and
keeping two others saying the same obvious thing would honour the words and miss the point.

**50% KUP is modelled on dzieło ONLY in slice 2**, and that boundary is NAMED on screen
under the statement-substitution rule, never assumed away in a branch. Creative work on
zlecenie can legally carry 50% too; it is in BACKLOG with its urgency condition. Slice 2
does not silently under-report it — it says what it covers.

## 1. Where B differs from the rendered variant

| | rendered B | slice 2 B, as built |
| --- | --- | --- |
| lede | present, contract-specific | **element deleted entirely** |
| dzieło/ulga caveat | 13 px muted, inside consequence area | promoted to an outlined note between band and ladder |
| under-26 control | Nie/Tak pill | Nie/Tak pill wins; slice 1's switch is SUPERSEDED |
| student delta | none | delta chip under the net figure, slice 1's mechanism |
| brutto/netto toggle | absent | still absent — slice 3. Nothing reserved |

## 2. Nothing replaces the lede

**No sentence is added anywhere.** The cut sentence did two jobs. Job one was already
duplicated by the field label 40 px below it. Job two — "student status dominates the
zlecenie result" — was a PROMISE, BEFORE THE FACT, CONTAINING NO NUMBER.

**The test applied, so it can be checked:** any candidate replacement must contain a number
computed from THIS user's input. The deleted sentence contained none and could not.
Anything passing that test does a job the sentence was not doing; anything failing it is
the sentence wearing a hat.

Two things carry job two instead, both after the fact, both numeric:

1. **The ladder collapse** — five deduction rows become one, `Składki ZUS · 0 zł`, why-line
   `Student do 26 lat nie płaci składek z umowy zlecenia.`, band at `Na konto 100,0%`.
2. **The delta chip**, slice 1's existing mechanism on a second trigger — the only addition:
   `+769,86 zł, bo studiujesz`. Measured at 390: chip at y 632->669, page 1358->1403.

`769,86 zł` on a 4 000 zł zlecenie is the whole argument, stated by the app rather than
asserted by a heading.

**What genuinely got worse, judged separately:** B's dzieło/ulga caveat was already the
weakest surface and is now the only explanatory one. It moves out of the consequence area
into an **outlined note between band and ladder**: 1.5 px ink border on surface, 14 px
full-contrast ink, `max-width: 52ch`, 67 px tall at 390 and 1280.

CHOSE outlined, NOT honey-soft — honey means "money you keep"; filling a does-not-apply
note with it inverts the accent's one meaning. CHOSE to show it only once the user answers
`Tak` on dzieło: it answers "why did nothing happen?" at the moment that question arises.

## 3. The brutto/netto toggle — place fixed now, built in slice 3

**It drops in with no restructure. Reserve nothing.**

| measured | 390x844 | 1280x800 |
| --- | --- | --- |
| B today (lede present), net figure top | 642 | 357 |
| slice 2 B (lede cut) | **552** | **232** |
| slice 3 B (+ direction row) | **610** | **232** |
| band top, slice 2 -> slice 3 | 770 -> 828 | **455 -> 455** |
| card height, slice 2 -> slice 3 | 296 -> 354 | 304 -> 362 |

On desktop nothing outside the left column moves at all. On phone everything below the card
shifts down 58 px, and the cut lede pre-paid for it: the toggle costs 58, the lede refunded
90, so slice 3 lands the net figure 32 px HIGHER than the screen the stakeholder saw. At
320x568 the figure is below the fold before and after; the sticky mini-bar already covers
that. Slice 3's ambiguity messages reuse the field's existing status slot.

**Do not pre-generalise anything in slice 2.** No empty row, no placeholder, no
mode-parameterised keys "ready for" slice 3. Renaming one key costs the same later, and
reserved space that renders nothing is a prototype tell.

**Where it sits:** inside the card, on its own row, immediately above the amount field's
label — read before the field whose meaning it changes.

```
CARD  LICZĘ          [ brutto → netto | netto → brutto ]   46 px, new
      KWOTA BRUTTO MIESIĘCZNIE
      [ 6000                          zł / mies. ]         56 px
      (status slot: error / ambiguity)
      Masz mniej niż 26 lat?        [ Nie | Tak ]
      Studiujesz?                   [ Nie | Tak ]
      ── consequence line ──
```

CHOSE each segment carries an arrow — a currency picker never contains an arrow, and two
arrows pointing opposite ways ARE the message. Row label `Liczę` makes it read
`Liczę: brutto → netto`. Rejected on measurement, not taste: sharing the field-label row
(wraps at 390, 72 px vs 46 px) and a full-width bar (84 px, reads as a second page mode).

Treatment, all settled tokens: pill `1.5px solid var(--ink)`, `--r-pill`; segment 44 px
min-height, `padding: 0 var(--s3)`, Familjen 14/600, `white-space: nowrap`; active
`background: var(--ink); color: var(--honey)`; row label 12/600/0.08em uppercase
`--ink-muted`; arrow `<span aria-hidden="true">→</span>`;
`role="radiogroup" aria-label="Kierunek przeliczenia"` with two `role="radio"` buttons.

**Copy per mode** — the band, ladder and total row do NOT change in either direction. The
decomposition is direction-free, which is why this is a drop-in; in netto mode the ladder's
total row becomes the confirmation that the reverse solve closed.

| | brutto -> netto (default) | netto -> brutto |
| --- | --- | --- |
| field label | `Kwota brutto miesięcznie` | `Ile chcesz mieć na koncie` |
| answer eyebrow | `Na konto` | `Kwota na umowie` |
| from-line | `miesięcznie, z {gross} zł brutto` | `miesięcznie, żeby na konto trafiło {net} zł` |

**Measured evidence for slice 3, scanned over 20 001 one-grosz steps per case using the
SHIPPED `computeUop` for umowa o pracę:** non-uniqueness is the NORM, not an edge case — up
to 5 gross values map to one net (net 2 366,45 zł <- gross 3 013,65…3 013,69), 6 near the
second bracket. No unreachable nets found in any window tested. The plateau comes from
rounding the PIT base to whole złote, not from the brackets. Student-on-zlecenie is exactly
1:1. So slice 3's "ambiguous" text will fire routinely and "undefined" may never fire; both
render in the field's status slot with `role="status"`, NOT `aria-invalid` — ambiguity is
not an error.

## 4. The student-ZUS teaching moment

On `Studiujesz? -> Tak` with under-26 on zlecenie, over 240 ms:

1. **The band collapses to one honey segment** — every plum and the graphite animate to 0,
   honey grows into the space, ending at `Na konto 100,0%`. The lesson in one gesture.
2. **The ladder collapses to one row** — five deduction rows replaced by
   `Składki ZUS · 0 zł`, swatch `var(--line)`, why-line
   `Student do 26 lat nie płaci składek z umowy zlecenia.`
3. **The delta chip enters** — `+769,86 zł, bo studiujesz`, ink pill, honey text, rising
   4 px. After 6 s replaced by the permanent line `Bez składek ZUS — student do 26 lat.`

`prefers-reduced-motion: reduce` sets durations to 0 and extends the dwell 6 s -> 10 s.

**The under-26 control changes shape:** slice 1's `<input type="checkbox" role="switch">`
becomes B's Nie/Tak pill (`role="radiogroup"`, two `role="radio"`, 44 px min-height, 56 px
min-width). DESIGN-SLICE-1 §4's MOTION SEQUENCE stands unchanged; its CONTROL description
is superseded here. Three questions must use one control.

## 5. Omit versus strike versus collapse — three absences, never mixed

- **Struck** — a line that exists and was zeroed FOR THIS PERSON BY A RELIEF: keep the
  original amount visible with `<s>`, muted, plus the honey-soft chip
  `Ulga dla młodych — 0 zł`. Showing what the relief is WORTH teaches more than a zero.
- **Collapsed to a zero row** — lines removed by a rule about WHO THIS PERSON IS (the
  student ZUS exemption): one row at `0 zł` carrying the reason. Never five zero rows,
  never silent absence.
- **Omitted** — lines that do not exist for this CONTRACT TYPE at all (no ZUS, no zdrowotna
  on dzieło): absent from band and ladder, no row, no strike.

The rule of thumb: **strike a person's exemption, omit a contract's non-existence.**
Striking five ZUS lines on dzieło would teach a rule that is not true.

## 6. Statement substitution — controls that do not apply

A control whose answer cannot change the result is **never disabled and never hidden**. It
stays live and the screen states, in the active language, that the answer has no effect and
why. Disabling is a dead end the user cannot interrogate; hiding makes the app appear to
have ignored them.

The instance in slice 2: under-26 on dzieło. `Tak` produces the outlined note under the
band — `subst.relief.dzielo`. This is the sentence criterion 4 exists to force onto the
screen, and it must come from the same source list the engine branches on. A rule that
lives only in an `if` is the defect that criterion catches.

## 7. The KUP copyright question

The 50% rate is presented as **the condition that earns it, never a bare percentage**. The
question is `Przenosisz prawa autorskie?` with Nie/Tak; the rate appears as a CONSEQUENCE,
not as a control label. `Tak` produces `note.dzielo.kup` and `note.dzielo.kup.cap`.

Verified against podatki.gov.pl, and binding on the builder:

- The cap is stated as a flat annual figure: "50% koszty uzyskania przychodów ze wszystkich
  tytułów nie mogą przekroczyć w roku podatkowym kwoty 120 000 zł." It numerically EQUALS
  the first PIT bracket. **It must still be its own cited entry with its own quote and
  effective date — never an alias of `pit.thresholdAnnualGrosz`.** The source states two
  facts that happen to be equal; aliasing them makes a future decoupling silently wrong.
  P2-6's promotion into this slice is where that gets fixed.
- The 50% rate is **not** granted by copyright transfer alone — the source enumerates
  qualifying creative activities. A bare Nie/Tak over-promises, mitigated by
  `note.dzielo.kup.condition`.

## 8. Accessibility floor — re-run over every new state at 390, ALL PASS

Every control >=44 px in both dimensions; every text pair at or above its WCAG AA floor.
Contract bar segments 52 px; Nie/Tak segments 44x56; language pill 44x48. Ink on honey
9.77:1; honey on ink (delta chip) 9.77:1; `--ink-muted` 6.06:1 on paper; the outlined note
is full-contrast ink at 14 px. `outline: 3px solid var(--ink); outline-offset: 2px` on
every interactive element, never removed. The ladder stays a real `<table>` with a
visually-hidden `<caption>` and `<thead>`; the collapsed ZUS row is a normal row, not an
ARIA trick. One `role="status" aria-live="polite" aria-atomic="true"` region; the visible
numeral stays `aria-hidden="true"`. Typing debounced 500 ms; **contract, student and
copyright changes announce immediately**, one utterance each, never debounced. Colour is
never the only channel — the band collapse is accompanied by the ladder row and the chip.

## 9. Implementation

No new dependency. React + Vite + TypeScript, one route, no router. Plain CSS: `tokens.css`
plus per-component `*.module.css`. No UI library, no CSS framework, no CSS-in-JS, no chart
library, no icon library. Fonts stay self-hosted from npm — never a CDN, which would be an
outbound request and fail the storage promise printed in the answer block.

The builder hand-writes the Nie/Tak pill and the outlined note, roughly 60 lines of CSS.
Cheaper than a component library whose focus rings and target sizes disagree with §8, and
it keeps the tokens where a later theme pass can revise them.

New CSS surface: `v-modewrap` / `v-modebar` / `v-mode` (contract bar), `v-two` / `v-mini` /
`v-miniSeg` (question pill), `v-consequence` (card footer line), `d-note` (statement
substitution), `d-delta` (delta chip). Slice 3 adds `d-dirRow` / `d-dir` / `d-dirSeg`.

## 10. Strings — PL / EN

`{gross} {net} {rate} {base} {amount} {kwota} {kup} {pct} {year} {lo} {hi}` interpolate.
Every key from DESIGN-SLICE-1 §7 stands EXCEPT as noted.

**Deleted:** `app.lede` (the cut sentence, all contracts) · `contract.help` (its "wkrótce"
text is now false; its job passes to `note.*`) · `field.under26.label` and
`field.under26.hint` (replaced by `q.under26` — B asks, it does not switch).

| key | PL | EN |
| --- | --- | --- |
| `field.contract.label` | Rodzaj umowy | Contract type |
| `q.yes` / `q.no` | Tak / Nie | Yes / No |
| `q.under26` | Masz mniej niż 26 lat? | Are you under 26? |
| `q.student` | Studiujesz? | Are you a student? |
| `q.copyright` | Przenosisz prawa autorskie? | Are you transferring copyright? |
| `note.zlecenie.chorobowa` | Bez chorobowej — przy zleceniu jest dobrowolna. | Without the sickness contribution — it is voluntary on a zlecenie. |
| `note.zlecenie.student` | Student do 26 lat — bez składek ZUS i bez zdrowotnej. | A student under 26 — no ZUS and no health contribution. |
| `note.dzielo.kup` | Liczymy koszty uzyskania {pct}% — {amount} zł. | Deductible costs at {pct}% — {amount} zł. |
| `note.dzielo.kup.cap` | 50% liczy się do {amount} zł kosztów rocznie. | The 50% rate applies up to {amount} zł of costs a year. |
| `note.dzielo.kup.condition` | 50% należy się tylko za pracę twórczą, do której przenosisz prawa autorskie. | The 50% rate applies only to creative work whose copyright you transfer. |
| `subst.relief.dzielo` | Ulga dla młodych nie obejmuje umowy o dzieło — tylko etat i zlecenie. Twój wiek nic tu nie zmienia. | The under-26 relief does not cover umowa o dzieło — only etat and zlecenie. Your age changes nothing here. |
| `line.zusOff` | Składki ZUS | ZUS contributions |
| `why.zusOff` | Student do 26 lat nie płaci składek z umowy zlecenia. | A student under 26 pays no contributions on a zlecenie. |
| `why.kup.inline` | {pct}% kosztów ({amount} zł) | {pct}% deductible costs ({amount} zł) |
| `why.pit.zlecenie` | {rate}% od {base} zł — po odjęciu {kup} i składek ZUS, minus {kwota} zł kwoty zmniejszającej | {rate}% of {base} zł — after {kup} and ZUS, minus the {kwota} zł tax-reducing amount |
| `why.pit.zlecenie.nozus` | {rate}% od {base} zł — po odjęciu {kup}, minus {kwota} zł kwoty zmniejszającej | {rate}% of {base} zł — after {kup}, minus the {kwota} zł tax-reducing amount |
| `why.pit.dzielo` | {rate}% od {base} zł — po odjęciu {kup}, minus {kwota} zł kwoty zmniejszającej | {rate}% of {base} zł — after {kup}, minus the {kwota} zł tax-reducing amount |
| `answer.delta.student.on` | +{amount} zł, bo studiujesz | +{amount} zł because you are a student |
| `answer.delta.student.off` | −{amount} zł, gdy nie studiujesz | −{amount} zł if you are not a student |
| `answer.student.persistent` | Bez składek ZUS — student do 26 lat. | No ZUS — student under 26. |
| `answer.live.delta.student` | To o {amount} zł więcej, bo nie ma składek ZUS. | That is {amount} zł more, because there is no ZUS. |

**Slice 3 keys — place fixed now, DO NOT ADD IN SLICE 2.**

| key | PL | EN |
| --- | --- | --- |
| `dir.label` | Liczę | Calculating |
| `dir.group` | Kierunek przeliczenia | Direction of the calculation |
| `dir.g2n` / `dir.n2g` | brutto → netto / netto → brutto | gross → net / net → gross |
| `field.amount.label.gross` | Kwota brutto miesięcznie | Monthly gross amount |
| `field.amount.label.net` | Ile chcesz mieć na koncie | What you want in your account |
| `answer.eyebrow.gross` | Kwota na umowie | Amount on the contract |
| `answer.from.net` | miesięcznie, żeby na konto trafiło {net} zł | per month, so that {net} zł lands in your account |
| `dir.ambiguous` | Tę kwotę na koncie daje kilka kwot brutto — od {lo} zł do {hi} zł. Pokazujemy najniższą. | Several gross amounts produce this net — from {lo} zł to {hi} zł. We show the lowest. |
| `dir.unreachable` | Żadna kwota brutto nie daje dokładnie tyle na konto. Najbliższa to {amount} zł. | No gross amount produces exactly this net. The closest is {amount} zł. |

`Zlecenie` and `Dzieło` stay Polish in the EN build — criterion 7's settled exception.

**States.** Empty (`empty.answer`, `empty.band`) and error (`error.range`, `error.digits`)
unchanged from slice 1, applying to all three contracts. Still **no loading state**:
nothing on this screen is asynchronous. Said explicitly rather than left undesigned.

## 11. Judgement calls

| CHOSE | reason |
| --- | --- |
| Nothing replaces the lede | the sentence was a promise with no number; only a number does its second job without restating it |
| The delta chip fires on the student toggle | slice 1's existing mechanism, second trigger — no new surface, and `+769,86 zł` argues better than a sentence |
| The dzieło caveat promoted to an outlined note | criterion 4 requires it to be seen; 13 px grey is where a caveat goes to be ignored |
| Outlined, not honey-soft | honey means money you keep; filling a does-not-apply note with it inverts the accent's only meaning |
| Direction control on its own row above the field label | shares-the-label-row wraps at 390 (72 px vs 46 px); a control is read before the field it redefines |
| Segments carry an arrow | a currency picker never has an arrow; two opposed arrows are the whole explanation |
| `Kwota na umowie` for the reverse eyebrow | concrete, echoes the contract bar, true for all three contracts, avoids "musisz" inflating an estimate |
| Reserve nothing for slice 3 | measured: desktop does not move, phone moves 58 px against a 90 px refund |
| The KUP cap is its own cited entry, never an alias of the PIT threshold | the source states two facts that happen to be equal |
| The under-26 switch becomes a Nie/Tak pill | three questions need one control; slice 1's motion sequence survives intact |

Reference renders, scratchpad only, session-scoped — this spec is the durable artefact:
`/private/tmp/claude-501/-Users-michal-Desktop-ile-zostaje/70e7b6e3-7c5d-4ef5-b200-91590df2a50a/scratchpad/s3/`
(`shot-B0-*` slice 2 as it ships, `shot-p-B6-*` the delta chip, `shot-p-B5-*` the promoted
caveat, `shot-B1/B3-*` the toggle in both modes, `shot-B2/B4-*` the rejected placements).
Two mock artefacts to ignore: some strings render without Polish diacritics (the generator
source was ASCII), and the mock's rates are uncited by design — the builder cites them.
