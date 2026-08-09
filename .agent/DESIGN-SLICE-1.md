# Slice 1 — design spec, as delivered by `designer` on 2026-08-09

Authoritative for the builder. The designer writes nothing to disk, so the orchestrator
persists it here: a spec that exists only in a conversation is lost to the next instance
and costs a full designer run to recover. Accepted at Level 1 under the run-4 brief.

theme-factory was NOT run — its three-variant showcase needs the project's own real
screen, and none exists at ea76697. It runs at the START of slice 2. The palette below is
a designer-settled starting point, not a theme-factory output.

Everything below was measured in headless Chromium against a rendered mock.

## 0. Form

The data is one scalar answer plus a part-to-whole decomposition where the parts must be
SEEN to sum to the whole. Two elements do that job:

1. **The band** — one horizontal proportional bar whose full width IS the gross, segmented
   into net + each deduction. Summation becomes a geometric fact, not a claim. Signature
   element.
2. **The ladder** — the deductions as a descending subtraction table with a running
   remainder column. Polish payroll is genuinely sequential (ZUS reduces the base for
   zdrowotna, which reduces the base for PIT), so order carries information. The final
   remainder equals the net at the top; that identity is what makes criterion 2 visible to
   a person rather than only to the checker.

A plain vertical list of amounts is the payslip, and the payslip is the artefact this
product exists to beat. Rejected deliberately. A waterfall chart was rejected too: it
degrades to unreadable stubs at 390 px and loses the sum-to-whole read.

## 1. Layout and hierarchy

DOM order, single column, every viewport:

```
header    wordmark · year chip · PL|EN
lede      one orienting sentence
CARD      gross input · quick-fill chip · contract type · under-26 switch
ANSWER    eyebrow · NET FIGURE · from-line · delta chip · disclaimer + storage
BAND      proportional bar · left/right captions
LADDER    header row · 5 deduction rows · total row
SOURCES   collapsed <details>
```

The net figure is the only element above 40 px, the only one on a saturated fill, and the
only one in the display face at 700. Nothing else competes for first fixation.

**Phone (<900 px):** single column. Measured 390x844 — net figure y 544->592, answer block
including both permanent statements 498->770, inside the ~700-730 px first-paint viewport.
At 360x740 net is 544->588. No horizontal overflow at 320, 360 or 390.

**320x568 is the one failure** — net lands 578->620, below the fold. Fix is a **sticky
mini-bar**: once the answer block scrolls out of view, a 44 px bar pins to the top showing
`Na konto · 4 711,43 zł` on honey. `position: sticky; top: 0; z-index: 10`. This guarantees
the net at any scroll on any device height, which first-paint fold placement cannot.

**Desktop (>=900 px):** two columns, `380px 1fr`, gap 48. Left = card, right = answer,
band, ladder. Net measured y 247->319 at 1280x800. The left column is
`position: sticky; top: 24px`, and the `Skąd te liczby?` disclosure plus the year line move
under the card in the left column — provenance sits beside the inputs and the dead area
below the card closes.

**Slice-2 safety:** contract type is a three-slot segmented control from day one, with
`Zlecenie` and `Dzieło` present and `disabled`. Slice 2 removes two attributes and changes
no layout.

## 2. The breakdown

**Band.** Six segments in one flex row, height 44, 2 px paper gaps,
`outline: 1.5px solid rgba(43,33,28,.18)`, radius 8. Order left->right: net (honey),
emerytalna, rentowa, chorobowa, zdrowotna (plum ramp dark->light), PIT (graphite). Widths
from the engine's grosz values as `flex: 0 0 <pct>%`; the net segment is `flex: 1 1 auto`
so rounding residue lands there and the bar always fills exactly. **Minimum segment width
4 px** so rentowa at 1.5% never vanishes. Inside the net segment, left-aligned:
`Na konto 78,5%`. Captions under the bar: gross left, `składki i podatek 21,5%` right.

**Ladder.** A real `<table>` with a visually-hidden `<caption>`, `<thead>`, two columns.
The swatch is a `::before` on the name cell, not a third column.

| column | contents |
| --- | --- |
| left | swatch · name (15 px, 600) · why-line (13 px, muted) |
| right | amount `− 585,60 zł` (mono 16, tabular) · running remainder `5 414,40 zł` (mono 12, muted) |

Header row `Skąd ta różnica` / `Zostaje`, 1.5 px ink rule beneath. Final row is the total:
`Na konto` in the display face at 18, amount at 20, honey swatch, no bottom border.

**The why-line is the teaching.** Not a legend — the rule applied to this user's number:
`9,76% od 6 000 zł`, and for zdrowotna `9% od 5 177,40 zł — po odjęciu składek ZUS`. That
clause is where a young person learns zdrowotna is not 9% of gross.

**Rounding rule, load-bearing for criterion 2.** The engine produces grosz integers; the
display formats those integers once. Percentages are derived FROM the grosz values for
display only and never fed back into arithmetic. Residue is absorbed by the net segment's
`flex: 1 1 auto`. Two independent rounding paths is how "the lines don't sum" bugs enter.

## 3. Aesthetic, concrete

Warm and friendly made concrete as **Polish poster-school ink on warm paper**: flat
saturated fields, no gradients, no shadows beyond one 1 px lift, warmth carried by a large
area of honey rather than by rounded corners and pastel tints. The deliberate avoidance is
the cream-paper/high-contrast-serif/terracotta look — the current default answer for
"warm", and therefore not a choice.

| token | hex | role | contrast |
| --- | --- | --- | --- |
| `--paper` | `#FFF6EE` | page background | — |
| `--surface` | `#FFFFFF` | card | — |
| `--ink` | `#2B211C` | primary text | 14.71:1 on paper, 15.71:1 on surface |
| `--ink-muted` | `#6B5B52` | why-lines, captions | 6.06:1 on paper, 6.47:1 on surface |
| `--line` | `#E8DCD0` | hairlines, borders | non-text |
| `--honey` | `#FFC24A` | the one accent — net, answer block, active states | ink on honey 9.77:1 |
| `--honey-soft` | `#FFE0A3` | relief chip fill | ink on it 12.7:1 |
| `--amber-ink` | `#8A5600` | accent-coloured text (wordmark) | 5.77:1 on paper |
| `--plum-1` | `#6E3F5F` | emerytalna | 7.75:1 on paper |
| `--plum-2` | `#855273` | rentowa | 5.70:1 |
| `--plum-3` | `#9C6787` | chorobowa | 4.18:1 |
| `--plum-4` | `#B37E9C` | zdrowotna | 3.08:1 |
| `--graphite` | `#4A3F3A` | PIT | 9.53:1 |

Computed with the WCAG 2.x relative-luminance formula in Node — measured, not eyeballed.
`--plum-3` and `--plum-4` are fills only and never carry text; all four clear 3:1 for
1.4.11 regardless.

**Honey is the only accent and means exactly one thing: money you keep.** The plums are one
sequential ramp for one category (składki), not competing accents. Graphite is a neutral
marking the one non-składka deduction. **The declared risk:** money interfaces default to
green-good/red-bad and this one has no green and no red, because the product's job is to
defuse, not to score. If the stakeholder rejects one thing, this is the thing.

**Typography.** Three faces, self-hosted from npm, all verified in Chromium via
`document.fonts.check(..., 'łąęćźżńóś')` -> true.
- Display — **Bricolage Grotesque Variable**. Wordmark, lede, net figure, ladder total.
  Rule: never below 19 px, never below weight 600.
- Body/UI — **Familjen Grotesk Variable**. Everything else. Rule: never above 17 px.
- Data — **IBM Plex Mono 500**. ONLY ladder amounts, running remainders, year chip, amount
  input value. Nothing else.

The size/weight rules are the mechanism that stops two grotesques reading as one face. A
first pass used mono for labels and chips and the page read as a developer tool.
**Declared weakness:** both display and body are grotesques, so the type's point of view is
carried by discipline rather than genre contrast. This is the least distinctive part of the
proposal and the first thing theme-factory should revisit in slice 2.

**Font loading — gets criterion 7 wrong if done wrong.** A Google Fonts CDN is an outbound
request and fails it. Self-host from npm into the bundle. Second trap, measured: fontsource
splits each family into `latin` and `latin-ext`, and `latin-ext` contains ONLY the extended
range — shipping one alone produces mid-word fallback (`Ile zostaje` rendered with a serif
for the ASCII and a sans `ł` inside the same word). Ship both per family with explicit
`unicode-range`:

```css
@font-face{font-family:Bricolage;src:url(/f/bric-lat.woff2) format('woff2');
  font-weight:200 800;font-display:swap;
  unicode-range:U+0000-00FF,U+2000-206F,U+20A0-20BF,U+2212}
@font-face{font-family:Bricolage;src:url(/f/bric-ext.woff2) format('woff2');
  font-weight:200 800;font-display:swap;
  unicode-range:U+0100-024F,U+0259,U+1E00-1EFF}
```

Six files, ~123 KB woff2 measured. Preload the two Bricolage files only.

**Type scale.**

| role | size / weight / tracking | face |
| --- | --- | --- |
| net figure | `clamp(44px, 13vw, 76px)` / 700 / −0.035em / lh .95 / tabular | Bricolage |
| lede | 17 px phone, 26 px >=900 / 700 / −0.01em / lh 1.3 | Bricolage |
| ladder total | 18 px / 700 | Bricolage |
| wordmark | 18 px phone, 20 px / 700 / −0.02em | Bricolage |
| row name | 15 px / 600 | Familjen |
| body, help | 15 px / 400 | Familjen |
| why-line, captions, furniture | 13–13.5 px / 400 / lh 1.45 | Familjen |
| field label | 12 px / 600 / 0.08em / uppercase | Familjen |
| ladder amount | 16 px / 500 / tabular | Plex Mono |
| remainder, year chip | 11–12 px / 500 | Plex Mono |

**Spacing, radius, elevation.** 4 px grid, no exceptions: 4 8 12 16 24 32 48 64. Page
gutter 16, `max-width: 1120px` centred. Card padding 12 phone / 16 desktop. Radius 6 chips,
10 controls, 16 cards, 999 pills. Exactly one elevation —
`0 1px 2px rgba(43,33,28,.14)` on the active segmented-control thumb. No card shadows;
cards are separated by `1px solid var(--line)` against paper.

**Motion.** `--dur-fast: 140ms; --dur: 240ms; --ease: cubic-bezier(.2,0,0,1)`. Animation
exists in exactly one place, the relief toggle. **Typing does not animate the net figure** —
no odometer, no count-up, no flash. `prefers-reduced-motion: reduce` sets all durations to
0, shows the strike-through and delta chip instantly, and extends the chip's dwell from 6 s
to 10 s to compensate for the lost entrance cue.

## 4. The under-26 toggle — the moment the app teaches

The only orchestrated moment on the screen. Three things over 240 ms:

1. **The band re-forms** — the graphite PIT segment animates to 0 and honey grows into the
   space. You watch the tax slice become your money. The whole lesson in one gesture.
2. **The PIT row rewrites** — a strike-through draws left->right across `− 291,00 zł`, the
   amount goes muted, a honey-soft chip appears beneath the why-line:
   `Ulga dla młodych — 0 zł`. The original amount stays visible, struck: showing what the
   relief is WORTH is more instructive than showing a zero.
3. **A delta chip enters** under the net figure — ink pill, honey text,
   `+291,00 zł z ulgą dla młodych`, rising 4 px. After 6 s it fades and is replaced by a
   permanent quiet line `Z ulgą dla młodych (PIT 0 zł).` so the state stays legible.

Off runs the same sequence reversed with `−291,00 zł bez ulgi dla młodych`. Control: native
`<input type="checkbox" role="switch">` with a real `<label>`, 56x32 track, 26 px honey
thumb on ink, 48 px tap row.

## 5. Language switch

Top right of the header, two-item segmented pill, 1.5 px ink border, both labels always
visible — `PL` and `EN` are two characters each, so an icon and a dropdown would cost a tap
and a guess for nothing. Active: ink fill, honey text. 44 px tall, `min-width: 48px` each.

Switches instantly, no reload, no route change. Sets `document.documentElement.lang`.
Persists to localStorage in the same key namespace as the entries. First visit defaults to
PL when `navigator.language` starts with `pl`, otherwise EN.

Number formatting follows the language: `pl-PL` (`6 000,00`, NBSP groups) and `en-GB`
(`6,000.00`). Currency always renders as the suffix `zł`, never `PLN`.

Below 380 px the year chip is hidden and the year appears under the band as
`Stawki za rok 2026`, so criterion 4's on-screen year survives at every width. Measured:
this removed an 88->81 px overflow of the language pill at 320 px.

## 6. Accessibility floor

- **Contrast** — every text pair above is >=4.5:1, most >=6:1. No text on `--honey` other
  than `--ink` (9.77:1) and `#5A3B00` (7.2:1, eyebrow and from-line).
- **Focus** — `outline: 3px solid var(--ink); outline-offset: 2px` on every interactive
  element, including inside the honey block. Never removed, never replaced by a shadow.
- **Targets** — all >=44x44: input row 56, segmented buttons 44, switch row 48, quick-fill
  chip 36 inside a 44 hit area via padding, language buttons 44x48.
- **Semantics** — ladder is a `<table>` with visually-hidden caption and `<thead>`;
  segmented control is a `role="radiogroup"` of buttons; switch is a native checkbox with
  `role="switch"`.
- **Net change announcement** — one visually-hidden
  `role="status" aria-live="polite" aria-atomic="true"` region. The visible numeral is
  `aria-hidden="true"` so it is not announced twice. Typing is **debounced 500 ms**;
  announcing every keystroke makes the field unusable. Full sentence:
  `Na konto: 4 711,43 zł miesięcznie.`
- **Toggle announcement** — immediate, not debounced, one utterance:
  `Na konto: 4 711,43 zł miesięcznie. To o 291,00 zł więcej dzięki uldze dla młodych.`
- **Colour is never the only channel** — every segment is named with its amount in the
  ladder; the relief state is text plus a strike-through, not a colour change.

## 7. Strings — every fixed label

`{gross} {net} {rate} {base} {amount} {kwota} {pct} {year}` are interpolated.

| key | PL | EN |
| --- | --- | --- |
| `app.name` | Ile zostaje | Ile zostaje |
| `app.lede` | Wpisz, ile masz brutto. Pokażemy, ile z tego zostaje na koncie — i gdzie poszła reszta. | Enter your gross pay. We'll show what actually lands in your account — and where the rest went. |
| `year.chip` | Dane za {year} | {year} rates |
| `year.inline` | Stawki za rok {year} | {year} rates |
| `lang.legend` | Język | Language |
| `lang.pl` / `lang.en` | Polski / Angielski | Polish / English |
| `field.gross.label` | Kwota brutto miesięcznie | Monthly gross pay |
| `field.gross.unit` | zł / mies. | zł / month |
| `field.gross.quickfill` | Płaca minimalna {year} | {year} minimum wage |
| `field.contract.label` | Rodzaj umowy | Contract type |
| `contract.uop` | Etat | Employment |
| `contract.zlecenie` | Zlecenie | Zlecenie |
| `contract.dzielo` | Dzieło | Dzieło |
| `contract.help` | Etat to umowa o pracę. Zlecenie i dzieło — wkrótce. | Employment means umowa o pracę. Zlecenie and dzieło are coming soon. |
| `field.under26.label` | Mam mniej niż 26 lat | I'm under 26 |
| `field.under26.hint` | Ulga dla młodych zeruje zaliczkę na PIT. | The under-26 relief cuts the income-tax advance to zero. |
| `answer.eyebrow` | Na konto | In your account |
| `answer.from` | miesięcznie, z {gross} zł brutto | per month, from {gross} zł gross |
| `answer.delta.on` | +{amount} zł z ulgą dla młodych | +{amount} zł with the under-26 relief |
| `answer.delta.off` | −{amount} zł bez ulgi dla młodych | −{amount} zł without the under-26 relief |
| `answer.relief.persistent` | Z ulgą dla młodych (PIT 0 zł). | With the under-26 relief (income tax 0 zł). |
| `answer.live` | Na konto: {net} zł miesięcznie. | In your account: {net} zł per month. |
| `answer.live.delta` | To o {amount} zł więcej dzięki uldze dla młodych. | That's {amount} zł more thanks to the under-26 relief. |
| `furniture.estimate` | To szacunek, nie porada podatkowa. | An estimate, not tax advice. |
| `furniture.storage` | Twoje dane zostają w tej przeglądarce — nic nie wychodzi na serwer. | Your entries stay in this browser — nothing is sent to a server. |
| `band.net` | Na konto {pct}% | In your account {pct}% |
| `band.left` | {gross} zł brutto | {gross} zł gross |
| `band.right` | składki i podatek {pct}% | contributions and tax {pct}% |
| `ladder.caption` | Podział miesięcznej pensji brutto | Breakdown of monthly gross pay |
| `ladder.head.what` | Skąd ta różnica | Where the difference goes |
| `ladder.head.left` | Zostaje | Left |
| `line.emerytalna` | Składka emerytalna | Pension contribution (emerytalna) |
| `line.rentowa` | Składka rentowa | Disability contribution (rentowa) |
| `line.chorobowa` | Składka chorobowa | Sickness contribution (chorobowa) |
| `line.zdrowotna` | Składka zdrowotna | Health contribution (zdrowotna) |
| `line.pit` | Zaliczka na PIT | Income-tax advance (PIT) |
| `line.net` | Na konto | In your account |
| `why.simple` | {rate}% od {base} zł | {rate}% of {base} zł |
| `why.zdrowotna` | {rate}% od {base} zł — po odjęciu składek ZUS | {rate}% of {base} zł — after ZUS contributions |
| `why.pit` | {rate}% od {base} zł, minus {kwota} zł kwoty zmniejszającej | {rate}% of {base} zł, minus the {kwota} zł tax-reducing amount |
| `why.relief.chip` | Ulga dla młodych — 0 zł | Under-26 relief — 0 zł |
| `total.from` | z {gross} zł brutto | from {gross} zł gross |
| `sources.summary` | Skąd te liczby? | Where do these numbers come from? |
| `sources.intro` | Stawki na rok {year} z oficjalnych źródeł. Każda pozycja ma datę wejścia w życie. | {year} rates from official sources. Each carries its effective date. |
| `empty.answer` | Wpisz kwotę brutto, a pokażemy, ile zostaje. | Enter a gross amount and we'll show what's left. |
| `empty.band` | Tu pojawi się podział twojej pensji. | Your pay breakdown will appear here. |
| `error.range` | Wpisz kwotę od 0 do 1 000 000 zł. | Enter an amount between 0 and 1,000,000 zł. |
| `error.digits` | Wpisz kwotę cyframi, na przykład 6000. | Enter the amount in digits, for example 6000. |

**`Zlecenie` and `Dzieło` stay Polish in the EN build.** They are legal contract types with
no English equivalent and every English speaker working in Poland uses the Polish words;
the EN helper text glosses them. A deliberate loanword, NOT a missing key. Criterion 5 must
not grade it as untranslated — this is written into STATE.md for the checker.

**States.** Empty and error are designed above. There is NO loading state, because nothing
on this screen is asynchronous; the only async work is the font swap, handled by
`font-display: swap`. Said explicitly rather than left undesigned.

## 8. Implementation approach

- React + Vite + TypeScript per DECISIONS.md. One route, no router.
- **Plain CSS.** One `tokens.css` holding every value in §3 as custom properties, plus
  per-component `.module.css`. No UI library, no CSS framework, no CSS-in-JS: one screen
  with six components does not repay a design system, and utility classes would put the
  tokens in class names where theme-factory cannot revise them in slice 2.
- **No chart library.** The band is six `<div>`s in a flex row. Recharts to draw one
  stacked bar is a dependency for something CSS already does.
- **No icon library.** Two furniture glyphs, inline SVG, about twelve lines.
- **Fonts self-hosted from npm** `@fontsource-variable/*` into `public/f/`. Never a CDN.

The cost, stated: the builder writes the segmented control, the switch and the band by hand
— roughly 150 lines of CSS a component library would have supplied with different opinions
about focus rings and target sizes than §6 requires.

## 9. Marked choices the brief did not settle

| CHOSE | reason |
| --- | --- |
| Band + ladder, not a payslip list or a waterfall | the band makes summation visible, the ladder makes the sequence learnable, neither degrades at 390 px |
| Honey as the single accent; no green, no red | the product's job is to defuse, not to score, and green-money is the template answer |
| Deductions as one plum ramp, not per-line hues | four hues would be four accents; a lightness ramp is one category |
| Three-slot contract control with two disabled | slice 2 removes two attributes and changes no layout |
| `Etat` / `Zlecenie` / `Dzieło` as labels, full name in helper text | "Umowa o pracę" does not fit one third of 358 px, and these are the words people use |
| Sticky mini-bar with the net figure | guarantees the net at any scroll on any height, which fold placement cannot |
| No animation on typing; motion only on the relief toggle | spends the whole motion budget on the one moment that teaches a rule |
| Disclaimer and storage line inside the answer block, not the footer | adjacency to the number is what makes permanent furniture actually read |
| PL default when `navigator.language` starts with `pl` | the audience is in Poland; honouring the browser beats a hardcoded default |
| `zł` suffix, never `PLN` | it is what a payslip says |
| Language-specific number formatting (`pl-PL` / `en-GB`) | correct i18n; both parse for the checker's criterion 2 sum |

Reference mock, scratchpad only, NOT project files — the spec above is authoritative:
`/private/tmp/claude-501/-Users-michal-Desktop-ile-zostaje/70e7b6e3-7c5d-4ef5-b200-91590df2a50a/scratchpad/mock/`
(`index.html`, `phone2.png`, `desktop2.png`, `type.png`). Scratchpad is session-scoped and
will not survive; the spec is the durable artefact.
