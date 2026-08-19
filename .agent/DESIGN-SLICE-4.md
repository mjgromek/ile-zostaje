<!-- Produced by the designer at HEAD 2732083. The Level 2 decision in §4 was ANSWERED by the stakeholder on 2026-08-19: option C, monthly dominant with a per-unit echo. -->

# DESIGN-SLICE-4 — input units: hour, week, month, year

All geometry below is **MEASURED** in headless Chromium (Playwright, `deviceScaleFactor`
1–2) against two live Vite servers running the project's own shipped stylesheet outside the
repository — one the unmodified `HEAD` tree, one the same tree with this proposal patched
in. Numbers are `boundingBox` / `getBoundingClientRect` reads, not stylesheet arithmetic.
DESIGN-SLICE-1 and DESIGN-SLICE-2 govern everything not restated here.

## 0. FORM — the unit is part of the value, not a mode of the app

The data added by this slice is **one scalar with a denominator**. "35 zł/h" is a single
quantity in two parts; it is not a second question the person answers. The direction
(`brutto → netto` / `netto → brutto`) is a genuine **mode**: it changes what the whole
screen means. These are different kinds of thing, and the layout must say so.

**Therefore: MERGED, not stacked, not nested, and neither demoted.** The direction row stays
exactly where slice 3 put it — its own row, above the field label, read before the field
whose meaning it changes. The unit goes **inside the amount field**, replacing the
`zł / mies.` suffix span that already sits at that exact pixel. Today that suffix displays a
unit that is a lie and cannot be edited; this slice does not add a control, it makes an
existing display truthful.

| MEASURED at 390×844, PL and EN identical | card height | net figure top |
| --- | --- | --- |
| `HEAD` today | 282 | 546 |
| **unit = month (the default)** | **282** | **546** |
| unit = year | 309 | 573 |
| unit = week | 309 | 573 |
| unit = hour | 361 | 625 |

**Zero cost in the default state.** A user who never opens the select sees a screen
identical in every dimension to `v0.3.0`. At 1280×800 the net figure sits at y = 240 in all
five states — the card grows inside the sticky left column (290 → 317 → 369) and nothing in
the right column moves. `documentElement.scrollWidth` equals the viewport at 320, 360 and
390 in every unit and both languages: no horizontal overflow anywhere.

**The rejected alternative, rejected on measurement.** A second segmented row in the
direction row's own treatment, four slots, injected into the live shipped card and measured:
**+54 px of card height in every state including month** (282 → 336), group width 260 px PL,
and at 320 px it forces the card's content box to 351 px against a 286 px client box,
pushing `scrollWidth` to **368 px — a 48 px horizontal overflow**. Per segment that leaves
41 px of text box; `miesiąc` does not fit. It is also wrong for the deeper reason above: it
would file the unit as a mode.

## 1. Layout at 390 and at desktop

Card, in DOM order. Only `▼ zł / mies.`, the hours row and the conversion line are new;
nothing existing moves.

```
CARD  LICZĘ            [ brutto → netto | netto → brutto ]     46 px, slice 3
      KWOTA BRUTTO                                             label, text CHANGED
      [ 6000                    │  zł / mies. ▾ ]              56 px, select MERGED IN
      (status slot: error / ambiguity)                         slice 3, unchanged
      (conversion line — only when unit ≠ month)                19 px @390, NEW
      Ile godzin tygodniowo?          [ 40 ] godz./tydz.       44 px, hour ONLY, NEW
      [ Płaca minimalna 2026 — 4 806 zł brutto ]               chip, text CHANGED
      Masz mniej niż 26 lat?               [ Nie | Tak ]
      ── consequence lines ──                                  gains the ZUS-ceiling note
```

Inside the 56 px input row, left → right: `#gross` (`flex:1 1 0; width:0`), a 1 px
`var(--line)` divider inset 10 px top and bottom (`aria-hidden`), then the select.
**MEASURED at 390:** select 96×54, amount field 193 px. At 360: 96×54 / 163 px. At 320:
96×54 / 130 px PL — 130 px of IBM Plex Mono 17 holds `1 000 000`, the parser's own maximum.
The select's 54 px height and 96 px width both clear the 44 px floor.

**Hours row (hour unit only).** Label left at 13 px `--ink`, field right: 44 px tall,
`1.5px solid var(--line)` — deliberately the *light* border, not the amount field's ink
border, so it reads as secondary to the figure it qualifies. Value in Plex Mono 15,
right-aligned, 44 px wide; suffix `godz. / tydz.` 12 px `--ink-muted`.

**Conversion line.** 13 px / lh 1.45 / `--ink-muted`, `margin-top: var(--s2)`, directly
under the field. MEASURED 19 px (one line) at 390 in both languages for all three units;
38 px (two lines) at 320 for week only.

**Desktop (≥900 px).** Nothing changes but the left column's height. Card 290 → 317
(week/year) → 369 (hour); `position: sticky; top: 24px` already handles it; the right column
is byte-identical.

**320×568.** The figure is below the fold before and after, and the sticky mini-bar already
covers it. MEASURED — at 320 with the hour unit the mini-bar fires on load and shifts the
card 190 → 234, which is the bar doing its job, not a regression.

**Pre-existing, NOT caused by this slice and NOT fixed by it:** at 320 EN the card's content
box is 299 px against a 286 px client box — a 13 px overflow forced by the EN direction
row's `gross → net` / `net → gross` nowrap. MEASURED identical on both trees in all six
width×language combinations. It goes to BACKLOG; touching it here would be slipping a fix
into a slice.

## 2. The control's exact ARIA shape

```html
<div class="inputRow">
  <input id="gross" type="text" inputMode="decimal" autoComplete="off" maxLength="12"
         aria-invalid={error} aria-describedby="<see below>" />
  <span class="unitDivider" aria-hidden="true"></span>
  <label class="visually-hidden" for="unit">Jednostka kwoty</label>
  <select id="unit" data-testid="unit-select">
    <option value="hour">zł / godz.</option>
    <option value="week">zł / tydz.</option>
    <option value="month">zł / mies.</option>
    <option value="year">zł / rok</option>
  </select>
</div>
```

- **A native `<select>`, not a radiogroup and not a custom menu.** Four options with long
  Polish words do not fit a segmented row (§0, measured); a native select gets keyboard,
  type-ahead and the phone's wheel picker for free, and its option text *is* its closed
  text, so `zł / mies.` — the exact string shipping today — becomes the selected option.
  Slice 1's "a dropdown would cost a tap and a guess" governs a **two**-item switch whose
  labels are two characters each; it does not bind a four-item picker.
- **A real visually-hidden `<label for>`, not `aria-label`.** Both produce the right
  accessible name (verified: the `aria-label` variant returned `Jednostka kwoty` /
  `Amount unit` from the a11y probe); the `<label>` is the project's existing pattern and
  survives a translation pass better.
- `aria-describedby` on `#gross` becomes a **space-separated list**, in this order:
  `amount-conv` (when the unit ≠ month), then `gross-error` **or** `amount-status`. The
  conversion is always true; the error and the ambiguity note remain mutually exclusive as
  slice 3 built them.
- **Hours field:** `<label for="hours">` visible (it is a real question), `#hours`
  `inputMode="numeric"` `maxLength="4"`, `aria-invalid` on a bad value,
  `aria-describedby="hours-error"`.
- **Announcement.** A unit change is an **answer**, not a keystroke: it announces
  immediately, un-debounced, joining contract / under-26 / student / copyright / direction.
  `Answer.tsx`'s `state` key string gains `unit` and **must not** gain `hoursPerWeek` —
  that is a typed field and debounces 500 ms with the amount.
- **Focus ring — a real defect found by rendering.** `src/styles/base.css:23` reads
  `:where(a, button, input, summary, [tabindex]):focus-visible`. **`select` is absent**, so
  the new control would ship a browser-default blue ring. MEASURED: before, a blue UA
  outline; after adding `select` to that list, `outlineColor rgb(43, 33, 28)`,
  `outlineWidth 3px`. **Add `select` to that selector list — one word.** Offset resolves to
  `-3px`, matching its sibling `#gross`; that inset is P2-4's existing deviation and this
  joins it rather than opening a second one. Update the P2-4 backlog entry to say two
  elements.

## 3. Conversion rules, and the assumption that must be visible

**One rounding, at the boundary into the engine.** Everything downstream is the shipped
monthly pipeline, untouched.

| unit | typed → monthly grosz (integer arithmetic only) | worked example |
| --- | --- | --- |
| hour | `divRoundHalfUp(a × h₁₀ × 52, 12 × 10)` where `h₁₀` = hours/week in tenths | 35 zł/h @ 40 → **6 066,67 zł/mies.** |
| week | `divRoundHalfUp(a × 52, 12)` | 1 000 zł/tydz. → **4 333,33 zł/mies.** |
| month | identity | 4 500 → 4 500,00 |
| year | `divRoundHalfUp(a, 12)` | 90 000 zł/rok → **7 500,00 zł/mies.** |

The inverse, for the echo line in §4, is the same shape and is applied **once** to the net
(or gross) grosz — never chained through an intermediate:
`divRoundHalfUp(n × 12 × 10, 52 × h₁₀)`, `divRoundHalfUp(n × 12, 52)`, `n × 12`.

**The assumption, and where it is displayed.** The conversion line under the field, always
visible whenever the unit ≠ month. It states the **operation, never a rounded intermediate**
— and that is load-bearing, not style. `40 × 52 ÷ 12 = 173,333…`; printing
`173,33 godz. miesięcznie` and then computing `6 066,67` gives a reader who multiplies
`6 066,55` — a 12-grosz gap, which is the invisible lie wearing a new coat. Printing the
operation lets the reader reproduce the app's figure exactly.

**A month is how many hours? The app refuses to answer that, and asks instead.** Poland has
no fixed hours-per-month — Kodeks pracy art. 130's nominal month runs roughly 152–184 h
across 2026. A fixed 168 is invented. A fixed 173⅓ is derivable from the statutory 40-hour
week (art. 129 §1) but is *wrong for this product's audience*: a student working 20 h/week
told they earn 6 066 zł/month has been confidently misinformed about their own pay. So the
**hour unit alone carries an hours-per-week field**, defaulting to 40, editable, persisted,
and printed in the sentence that uses it. Cost, stated: one extra text input, one string
pair, one storage key, one validation case — present in one of four unit states.

**52 and 12 are not cited rates and must not enter `rates-2026.ts`.** They are calendar
arithmetic, not tax-year facts, and they are printed in full in the sentence that applies
them — visibility is the substitute for citation, and it is the stronger one. They belong in
a new `src/state/units.ts` alongside the unit list, `toMonthlyGrosz` and `fromMonthlyGrosz`.
`40` is a *default in an editable field*, not a rate in a hidden branch; citing Kodeks pracy
art. 129 §1 for it in Sources is cheap and recommended, not required.

## 4. What the answer says in each unit — DECIDED: option C

**DECIDED by the stakeholder, 2026-08-19: the answer speaks MONTHLY, in every unit, always.
A per-unit echo line sits under it, secondary.** PROJECT.md line 8 states the objective as
"what actually lands in their account **each month**" and line 58 fixes the definition of
done at "the real **monthly** net". Every tax threshold the engine touches is monthly or
annual, and slice 5 subtracts **monthly** rent and food from **this** figure.

The payoff: **the band, the ladder, every why-line, `ladder.caption`, `total.from`, the
sticky mini-bar and the whole of slice 5 change by exactly nothing.** They decompose a
monthly gross, which is what they have always decomposed. The unit ends at the field's edge.

| | brutto → netto | netto → brutto |
| --- | --- | --- |
| eyebrow | `Na konto` | `Kwota na umowie` |
| figure | monthly net | monthly gross |
| from-line | `miesięcznie, z {gross} zł brutto` — `{gross}` is the **derived monthly** gross | `miesięcznie, żeby na konto trafiło {net} zł` |
| **echo (unit ≠ month)** | `≈ {amount} zł na konto {per}` | `≈ {amount} zł na umowie {per}` |

Both from-line keys are **unchanged and already correct**: they interpolate
`result.grossGrosz` / `result.netGrosz`, which are monthly by construction. The `≈` is doing
real work — it says this division does not close exactly, and the model assumes twelve
identical months.

**Echo treatment:** 13 px / lh 1.45 / `#5A3B00` on honey (7.2:1, the pair DESIGN-SLICE-1 §6
already sanctions for the eyebrow and from-line), directly beneath the from-line, above the
delta chip. MEASURED 19 px at 390 in both languages, 19 px at 1280. **No echo at unit =
month** — the answer already is the echo.

**Live region.** `answer.live` is unchanged (`Na konto: {net} zł miesięcznie.`); when the
unit ≠ month a second sentence is appended by the same mechanism the delta clause uses:
`Około {amount} zł {per}.` A screen-reader user hears both figures the screen shows, in the
same order.

**Sticky mini-bar: unchanged, monthly only.** It is 44 px and one figure; it mirrors the
answer's dominant number, which is the monthly one.

## 5. Every string, PL / EN

`{amount} {gross} {net} {per} {hours} {year} {unit} {max} {annual}` interpolate. Every key
from DESIGN-SLICE-1 §7 and DESIGN-SLICE-2 §10 stands except as listed.

**DIES — delete, do not deprecate.**

| key | why |
| --- | --- |
| `field.gross.label` | Rendered nowhere since slice 3. Ponytail's standing REMOVE, and its condition — "the next slice touches `strings.ts`" — is met. Free. |
| `field.gross.unit` | Its one consumer is the span the select replaces. |

**CHANGED.**

| key | PL | EN |
| --- | --- | --- |
| `field.amount.label.gross` | Kwota brutto | Gross amount |
| `field.gross.quickfill` | Płaca minimalna {year} — {amount} zł brutto | {year} minimum wage — {amount} zł gross |
| `error.range` | Wpisz kwotę od 0 do {max} {unit}. | Enter an amount between 0 and {max} {unit}. |

`field.amount.label.gross` drops "miesięcznie" / "Monthly" — the select now states the
period, one screen inch to the right, and two places asserting it is how they drift apart.
`field.amount.label.net` ("Ile chcesz mieć na koncie") is already period-free and unchanged.

**NEW.**

| key | PL | EN |
| --- | --- | --- |
| `unit.group` | Jednostka kwoty | Amount unit |
| `unit.hour` | zł / godz. | zł / hour |
| `unit.week` | zł / tydz. | zł / week |
| `unit.month` | zł / mies. | zł / month |
| `unit.year` | zł / rok | zł / year |
| `unit.per.hour` | za godzinę | an hour |
| `unit.per.week` | tygodniowo | a week |
| `unit.per.month` | miesięcznie | a month |
| `unit.per.year` | rocznie | a year |
| `conv.hour` | {hours} godz. tygodniowo × 52 tyg. ÷ 12 miesięcy. | {hours} h a week × 52 weeks ÷ 12 months. |
| `conv.week` | Tydzień × 52 ÷ 12 miesięcy — ta sama kwota co tydzień. | A week × 52 ÷ 12 months — the same amount every week. |
| `conv.year` | Rok ÷ 12 miesięcy — ta sama kwota co miesiąc. | A year ÷ 12 months — the same amount every month. |
| `field.hours.label` | Ile godzin tygodniowo? | How many hours a week? |
| `field.hours.unit` | godz. / tydz. | h / week |
| `error.hours` | Wpisz liczbę godzin od 1 do 168. | Enter a number of hours from 1 to 168. |
| `answer.perunit` | ≈ {amount} zł na konto {per} | ≈ {amount} zł in your account {per} |
| `answer.perunit.gross` | ≈ {amount} zł na umowie {per} | ≈ {amount} zł on the contract {per} |
| `answer.live.perunit` | Około {amount} zł {per}. | About {amount} zł {per}. |
| `note.zusCeiling` | Powyżej {amount} zł miesięcznie nie płacisz już składki emerytalnej i rentowej — roczny limit to {annual} zł. Liczymy tylko tę jedną umowę. | Above {amount} zł a month you stop paying the pension and disability contributions — the annual ceiling is {annual} zł. We count this one contract only. |
| `sources.zus.ceiling` | Roczny limit podstawy składek emerytalnej i rentowej (30-krotność) | Annual ceiling on the pension and disability contribution base (30×) |

`Zlecenie` / `Dzieło` remain Polish in the EN build — criterion 7's settled exception.

## 6. States — designed, not defaulted

- **Empty amount:** unchanged (`empty.answer`, `empty.band`). The unit select still shows a
  unit; a unit with no quantity is not a claim.
- **Range error:** the check moves to the **derived monthly grosz**, not the typed value.
  This is correctness, not polish: `MAX_GROSS_GROSZ` is what bounds the solver's work
  (P2-S2), and the solver now runs on the monthly figure. `35 000 zł/godz.` would otherwise
  reach the engine as 60 666 667 zł/mies. The message names the maximum **recomputed into
  the active unit** (floor to grosz): year 12 000 000 zł · month 1 000 000 zł · week
  230 769,23 zł · hour @40 h/wk 5 769,23 zł.
- **Hours empty, zero, non-numeric, or >168:** `error.hours` in a slot beneath the hours row
  with `aria-invalid` on `#hours`; the result goes null and the answer shows `empty.answer`.
  168 is the hours in a week — a physical bound, not a policy. Accepts one decimal (`37,5`
  is an ordinary Polish contract), comma or dot, carried in tenths so the arithmetic stays
  integer.
- **Ambiguity / unreachability (slice 3):** unchanged, still in the field's own status slot,
  still `role="status"` and never `aria-invalid`.
- **No loading state.** Nothing on this screen is asynchronous. Said explicitly rather than
  left undesigned, as in both prior specs.
- **No unit is ever inapplicable to any contract.** An hourly rate on a dzieło is unusual and
  legal. So DESIGN-SLICE-2 §6's statement-substitution rule has **no new instance** in this
  slice — stated so a checker does not go looking. The hours row's absence under three units
  is §5's *omit* case, not *disable* and not *strike*: for a monthly figure, hours are not a
  component of the value that exists.

## 7. localStorage

Key stays **`ile-zostaje.v1`**. `Entries` gains two fields, validated exactly as `direction`
was in slice 3:

- `unit: 'hour' | 'week' | 'month' | 'year'` — fallback `'month'` when absent or
  unrecognised. An entry written before slice 4 has no unit and gets the unit it was written
  in, which is why the namespace does not move.
- `hoursPerWeek: string` — the raw text, like `gross`. Fallback `'40'`. **Persisted always,
  including while the unit is not `hour`**: it is the user's own fact about their life, and
  losing it on a unit switch is a loss they did not ask for.

Free riders while the fields are open, optional and named as optional: `maxLength` on
`#gross` (12) and `#hours` (4) closes the second half of P2-S3 at the cost of two attributes.

## 8. Backlog: what this slice forces in, and what stays deferred

**IN — the annual ZUS ceiling (limit 30-krotności).** STATE.md already ruled it into slice 4,
and this design makes it visible almost for free.

- Data: a new cited `GroszAmount` under `contributions` (suggest `annualBaseCeilingGrosz`),
  source zus.pl "30-krotność". **INFERRED, not measured:** the 2026 figure appears to be
  **282 600 zł** (30 × a forecast average wage of 9 420 zł) — from a web-search summary,
  *not* read off zus.pl. The builder opens the official page, reads the number and the
  sentence, and cites both; PROJECT.md's invariant means an uncitable figure does not ship.
- Engine: the base for **emerytalna and rentowa only** becomes
  `min(monthlyGross, ceilingAnnual / 12)` — 23 550,00 zł/month at the figure above.
  Chorobowa is uncapped; zdrowotna is uncapped and its base *rises* automatically because
  ZUS fell. Contract-agnostic: it bites wherever those two lines exist, so uop and zlecenie,
  never dzieło.
- Screen: **no new why-line key.** `why.simple` already reads `{rate}% od {base} zł` off the
  engine's `baseGrosz`, so the ladder starts printing `9,76% od 23 550,00 zł` by itself.
  Plus `note.zusCeiling` on the card's consequence line and `sources.zus.ceiling` in the
  disclosure.
- **For the builder's tests:** the cap changes the function's *slope* (≈0.72 → ≈0.81) and not
  its *value*, so it is continuous and monotone at 23 550 and `solveGross`'s bisection stays
  sound. INFERRED from the arithmetic — pin it with a test at and either side of
  23 550 zł/mies. rather than assuming it.
- Honest note: the ceiling was **already reachable before this slice**. MEASURED —
  `src/state/gross.ts:1` sets `MAX_GROSS_GROSZ = 100_000_000` (1 000 000 zł) and
  23 550 < 1 000 000. The year unit makes it *legible*, not reachable. Promoting it is right;
  the entry's stated condition was met earlier than it says.

**IN — P2-L, the quick-fill.** Its own condition names this slice. It becomes a chip that
**states what it is and sets everything it asserts**: label
`Płaca minimalna 2026 — 4 806 zł brutto`, and one click sets `gross = 4806`,
`unit = 'month'` **and** `direction = 'g2n'`. Each of the three is something the cited figure
genuinely asserts; setting them is what makes the label true, and the user watches the
direction row and the select move. MEASURED at 13 px: 248 px PL / 237 px EN, inside the
264 px card content box at 320 — the fuller phrasing "…brutto na miesiąc" measured 310 px and
overflowed 320, which is why the period is carried by the select the click just moved. Spec
`white-space: normal` on the chip so a longer translation wraps instead of overflowing.

- **Rejected: deleting it** — it is the only zero-typing path into the app from the empty
  state. **Rejected: a unit-aware quick-fill** filling the statutory *minimalna stawka
  godzinowa* under the hour unit — a second citation, and it exists for zlecenie and not for
  etat, so the chip would become contract-dependent. To BACKLOG, urgent when the hourly
  minimum is quoted anywhere on screen or a contract-specific quick-fill is asked for.

**IN — ponytail's REMOVE on `field.gross.label`.** Free, per §5. `field.gross.unit` dies with
it.

**DEFERRED — the flat 12% ryczałt at ≤ 200 zł.** Its stated condition is that hour and week
units "make small amounts routine". **INFERRED from §3's conversion rules, and it runs the
other way:** hour and week *multiply the typed figure up* into a month — 20 zł/h at 5 h/week
is still 433 zł/mies., and reaching 200 zł/mies. through the hour unit needs about one hour a
week. The only unit that divides a typed figure down is `year`, and 200 zł/mies. has been
typeable in the monthly field since slice 1. **Slice 4 does not change its reachability**, so
the condition does not fire on units. Also worth recording: the law keys off *"kwota
należności określona w umowie"*, the contract's own amount, not a monthly total, which the
app has no field for at all.

**DEFERRED, flagged — the netto-solver's cost.** The hour unit adds a **second text input
that re-triggers the same ~4 000-call solve**; slice 3 MEASURED 157 ms per keystroke under 6×
CPU throttling. No second *solve* is added, so the existing entry's condition is not newly
met, but typing hours must not feel worse than typing an amount. The existing fix — a
debounce or a memo — covers both fields; it is a Level 0/1 implementation call and does not
belong in this spec.

**NOT TRIGGERED, stated so it is not assumed:** the typography backlog. **No third typeface,
no new size, no new weight, no display-level element.** The select is Familjen Grotesk 13/600
where the span it replaces was 13/400 — the one type change in the slice, inside the settled
scale, 600 because it is now interactive. The 19 px display floor is not approached.

## 9. Implementation approach for the interface

**No new dependency, and the dependency posture is a choice, not an inheritance.** React +
Vite + TypeScript, one route, no router; plain CSS — `tokens.css` plus `*.module.css`; no UI
library, no CSS framework, no CSS-in-JS, no chart library, no icon library; fonts self-hosted
from npm. Restated deliberately: a component library's `Select` would arrive with its own
focus ring, its own target sizes and its own opinion about a suffix inside a bordered row,
all of which §2 and DESIGN-SLICE-1 §6 already fix. The cost, stated: the builder hand-writes
the select's `appearance: none` reset, an inline-SVG chevron and the hours row — roughly
**35 lines of CSS**, less than either prior slice.

**The offline constraint is not a build constraint.** The product's storage promise forbids a
font CDN and a runtime third-party asset; it says nothing about a bundler, and Vite stays.

New module: `src/state/units.ts` — the unit list, `toMonthlyGrosz`, `fromMonthlyGrosz`,
`WEEKS_PER_YEAR`, `MONTHS_PER_YEAR`, `DEFAULT_HOURS_PER_WEEK`. It owns its own
`MONTHS_PER_YEAR` rather than importing `contract.ts`'s private one: calendar arithmetic for
a UI conversion and the spreading of an annual tax threshold are two concerns that happen to
share a number.

New CSS surface: `unitDivider` / `unitSelect` / `hoursRow` / `hoursLabel` / `hoursField` /
`hoursInput` / `hoursUnit` / `conv` in `GrossCard.module.css`; `perUnit` in
`Answer.module.css`. One shared edit to `base.css` (adding `select` to the focus list).

**Grid check, and one correction from measuring rather than calculating:** every new offset is
on the 4 px grid — `hoursRow` min-height 44, `margin-top` 8, `conv` margin-top 8, divider
inset 10… except the select's chevron gutter, first drawn at 22 px. **Set it to 24.** The SVG
stays 12×8 at `right 4px center`.

## 10. What this proposal does not satisfy, named rather than buried

Under the **hour** unit the card is the most crowded it has ever been: MEASURED 361 px at
390, **+79 px over `HEAD`**, holding a segmented pill, a text field with an embedded select,
an explanatory sentence, a second labelled text field, a chip and a Nie/Tak pill. That state
is the price of not lying about hours-per-month, and it is paid in exactly one of four unit
states — the other three cost 27 px and the default costs zero. If the stakeholder rejects
one thing in this spec, the designer expects it to be the hours field, and the honest
fallback is a fixed 173⅓ h/month with the operation printed and no control — smaller, and
wrong for a student.

Typography is **inherited, not advanced**: one weight bump, 13/400 → 13/600, inside the
settled scale. This slice neither improves nor worsens the accepted two-grotesque weakness.
theme-factory is NOT re-run and the theme is NOT extended.
