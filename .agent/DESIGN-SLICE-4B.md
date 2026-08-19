<!-- Produced by the designer at HEAD 589ea02, against the released v0.4.0. No Level 2 remained open: the four items were decided by the stakeholder on the live preview and this spec settles their shape. -->

# DESIGN-SLICE-4B — the card's first impression

## 0. Instruments

Everything marked MEASURED was read off a rendered page in headless Chromium (Playwright)
against **two live Vite servers running the project's own shipped stylesheet outside the
repository** — `head` = the unmodified `589ea02` tree on 5181, `prop` = the same tree with
this proposal patched in on 5182. All released; **5180 and 5184 never bound.** Geometry is
`getBoundingClientRect` / `scrollWidth`. Accessibility is Chromium's own AX engine via CDP
`Accessibility.getPartialAXTree`, cross-checked against Playwright's independent accname
implementation. Motion is `getComputedStyle` plus a `requestAnimationFrame` sampling loop.

**One instrument discounted, recorded so it is not repeated.**
`animation.effect.getTiming().easing` reported `linear` for the swap and was nearly filed as
a defect. It reports `linear` for *every* CSS animation by construction — the timing
function lives per-keyframe. `getComputedStyle().animationTimingFunction` and
`getKeyframes()[i].easing` both return `cubic-bezier(0.2, 0, 0, 1)`. The instrument could
not have produced the finding.

## 1. FORM — one control, and what it must not be mistaken for

The direction is **one binary mode with two named values**. The form that answers it in one
glance is a single control that **states the current reading** immediately above the field
whose label it governs. A two-segment pill is the shape this card uses for `Masz mniej niż
26 lat?`, and filing a mode as a question was the mismatch DESIGN-SLICE-4 §0 already argued.

The consequence is the designer's part: **a control that shows only its own current value
reads as a caption unless it is given an affordance.** Two things carry it, neither of them
colour — a swap glyph, and the ink pill outline the card already uses for interactive
things. This is why §3 promotes the quick-fill chip too: with its amount gone it lands in
exactly the same trap.

Nothing else about the form moves. No new element, no new row, no reordering.

## 2. The direction toggle

### 2.1 Markup — exact

```tsx
<div className={s.dirRow}>
  <span>{t(lang, 'dir.label')}</span>
  <button
    type="button"
    className={s.dirToggle}
    data-testid="dir-toggle"
    data-direction={direction}
    onClick={() => onDirection(direction === 'g2n' ? 'n2g' : 'g2n')}
  >
    <span className="visually-hidden">{t(lang, 'dir.group')}: </span>
    {before}
    <span aria-hidden="true">{'→'}</span>
    {after}
    <svg className={s.dirSwap} aria-hidden="true" width="12" height="12" viewBox="0 0 12 12">
      <path d="M1.5 4h9M8.5 1.5 11 4 8.5 6.5M10.5 8h-9M3.5 5.5 1 8l2.5 2.5"
            fill="none" stroke="currentColor" strokeWidth="1.5"
            strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  </button>
</div>
```

with, above the `return`:

```tsx
const [before = '', after = ''] = t(lang, `dir.${direction}`).split('→').map((p) => p.trim());
```

`const DIRECTIONS: Direction[] = ['g2n', 'n2g'];` is deleted from `GrossCard.tsx`. The
`.dir`, `.dirSeg` and `.active` rules are deleted from `GrossCard.module.css` — MEASURED by
grep that `.active` in that module has no other consumer.

### 2.2 The ARIA shape — settled by probe

**A plain `<button>`. No `aria-pressed`, no `role="switch"`, no `aria-checked`, no
`aria-live`, no `aria-describedby`.** The accessible name carries purpose *and* current
value; the AX tree carries no state property at all. **One fact, one channel.**

MEASURED — Chromium AX tree, all four states, `role: "button"`, properties `focusable` only:

| lang | state | accessible name |
| --- | --- | --- |
| PL | g2n | `Kierunek przeliczenia: brutto netto` |
| PL | n2g | `Kierunek przeliczenia: netto brutto` |
| EN | g2n | `Direction of the calculation: gross net` |
| EN | n2g | `Direction of the calculation: net gross` |

Playwright's independent accname implementation returned the identical four strings.
`nameFrom` is `contents` in every case. The `→` is excluded from the name and present in
`textContent` — slice 3's ruling that the arrow is decoration, carried forward now that
there is no group label to carry the meaning.

**The rejected variants, MEASURED rather than argued** — same button, attributes injected
live, AX tree re-read:

| variant | role | name | state property |
| --- | --- | --- | --- |
| **C — proposed** | `button` | `Kierunek przeliczenia: brutto netto` | *(none)* |
| A — `aria-pressed` | `button` | `…: brutto netto` | `pressed="false"` |
| A — after the flip | `button` | `…: netto brutto` | `pressed="true"` |
| B — `role="switch"` | `switch` | `…: netto brutto` | `checked="true"` |
| B — same, other state | `switch` | `…: netto brutto` *(unchanged)* | `checked="false"` |
| D — no purpose prefix | `button` | `netto brutto` | *(none)* |

A is the trap made concrete: the name says the app is in `brutto → netto` and the state says
*not pressed*. Bind `pressed` the other way and it is `true` in both directions, asserting
nothing — INFERRED from the same probe, since only the binding differs. B is worse: the name
is a *value*, so it does not change with `checked`, and the switch's state channel
contradicts a name it cannot describe. D leaves a button called "netto brutto" whose purpose
is unknowable off-screen.

### 2.3 What a screen reader announces on activation

Two utterances, saying two different things, in this order:

1. **The mode**, from the focused button's own name change. MEASURED: after the click the
   focused element's AX name is `Kierunek przeliczenia: netto brutto` with `focused=true`.
   That screen readers re-announce a changed accessible name on the focused element is
   INFERRED from platform behaviour, not measured here.
2. **The answer**, from the existing `role="status"` region, immediately and un-debounced,
   because the direction is already in `Answer.tsx`'s `state` key.

No third utterance and no duplication, because **the live region never names the mode and
the button never names the answer.** That rule is load-bearing.

MEASURED: activation works on both `Space` and `Enter` (native button, no key handler).
Focus ring `3px solid rgb(43, 33, 28)`, offset `2px` — §6's floor exactly, and *not* the
`-3px` inset P2-4 tracks. Tab order MEASURED: PL, EN, Etat, Zlecenie, Dzieło,
**dir-toggle**, `#gross`, `#unit` — **two tab stops become one.**

### 2.4 Treatment

```css
.dirToggle {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: var(--s2);
  min-height: 44px;
  padding: 0 var(--s3);
  border: 1.5px solid var(--ink);
  border-radius: var(--r-pill);
  background: var(--surface);
  font-family: var(--face-body);
  font-size: 14px;
  font-weight: 600;
  color: var(--ink);
  cursor: pointer;
  outline-offset: 2px;
  white-space: nowrap;
  transition: background var(--dur-fast) var(--ease);
}
.dirToggle:hover { background: var(--paper); }
.dirSwap { flex: 0 0 auto; color: var(--ink-muted); }
```

**Outlined, never ink-filled.** The filled treatment means "this one of several is
selected"; there is no longer a several. `.dirRow` keeps `min-height: 46px` unchanged.

**The swap glyph is `--ink-muted`, not `--ink`.** At ink, the `→` and the `⇄` read as one
four-arrow cluster. The arrow is content, the swap mark is chrome, and the colour says
which is which. `--ink-muted` on `--surface` is 6.47:1, far over the 3:1 non-text floor,
and it carries no information colour alone must carry.

## 3. The quick-fill chip

**Label:** `field.gross.quickfill` loses its dash and amount. The `{amount}` slot dies with
it, so `GrossCard`'s `minimumWageText` prop and App's `formatZloty(...)` call site both go.
**`formatZloty` itself stays** — MEASURED by grep, `Sources.tsx:56` still imports it.

**The click is unchanged and must stay unchanged:** `gross = 4806`, `unit = 'month'`,
`direction = 'g2n'`. MEASURED end to end on the real gesture at 390 from `netto` + `year` +
`90000`: after a real mouse click, field `4806`, unit `month`, direction `g2n`, figure
`3 605,85 zł` — the exact value e2e criterion 8 already asserts. P2-L stays closed.

### The measurement, and what it forced

MEASURED, 390 / 360 / 320, PL and EN — the chip is **identical at all three widths** because
it is content-sized:

| | HEAD `589ea02` | this proposal |
| --- | --- | --- |
| chip, PL | 248.2 × 44 | **151.2 × 44** |
| chip, EN | 236.9 × 44 | **143.2 × 44** |
| the header's year chip, PL | 97.2 × 22.5 | 97.2 × 22.5 |

The 44 px target survives — it comes from padding on the `<button>`, not from the text.

**It stops reading as a button, and that is the cost of item 2.** At 248 px with an amount
in it, a 1 px `--line` box was self-evidently a sentence you could tap. At 151 px holding
only `Płaca minimalna 2026`, the same box is the header year chip's treatment at a larger
size. The card's weakest element is now its only zero-typing entry point.

**Fix, one line: the chip takes the toggle's outline.**

```css
.quickChip { border: 1.5px solid var(--ink); border-radius: var(--r-pill); /* rest unchanged */ }
```

MEASURED: 151.2 × 36 unchanged, no reflow at any width. The card then has exactly one visual
language for a control — an ink pill: **outlined when it acts** (toggle, quick-fill),
**filled when it shows a selection** (Nie/Tak, Etat/Zlecenie/Dzieło). The year chip stays
1 px `--line`, 11 px mono, muted, 22.5 px tall: visibly a different kind of object.
`white-space: normal` stays.

**Rejected: filling it `--honey-soft`.** DESIGN-SLICE-2 §2 already ruled honey may not fill
a thing that is not money you keep, and a gross figure you have not entered yet is not.

**Rhythm at 320 / 360 / 390: holds, and one pre-existing defect closes.** MEASURED, card
`scrollWidth` / `clientWidth`:

| | HEAD | proposal |
| --- | --- | --- |
| 320 PL | 286 / 286 | 286 / 286 |
| **320 EN** | **299 / 286 — 13 px overflow** | **286 / 286** |
| 360, 390, 1280, both langs | flush | flush |

That is the overflow DESIGN-SLICE-4 §1 measured and sent to BACKLOG. Item 1 closes it for
free — the toggle is 81.7 px narrower in PL and 65.3 px narrower in EN. **The builder closes
that BACKLOG entry with this measurement quoted.**

**Vertical cost: zero.** MEASURED, card height 282 at 390 and 290 at 1280, net figure at
y 546 and y 240 — identical on both trees in all sixteen width × language × direction
combinations.

## 4. First run — `5000`, and the half that is load-bearing

The distinction that makes this correct is **"no record" versus "a record whose amount is
empty"**, drawn on the raw string, never on the parsed field.

```ts
/** What a browser with no record of its own opens on. A worked example, not a
 *  claim about the user: visible, editable and obviously round. */
export const FIRST_RUN_GROSS = '5000';
```

```ts
  // Declared outside the try so the catch can tell the two failures apart: a
  // record we never obtained is a first run, a record we obtained and could not
  // read is somebody's entry we must not write over.
  let raw: string | null | undefined;
  try {
    raw = globalThis.localStorage?.getItem(KEY) ?? null;
    if (raw === null || raw === '') return { ...fallback, gross: FIRST_RUN_GROSS };
    const parsed = JSON.parse(raw) as Partial<Entries>;
    ...                       // every field-level fallback UNCHANGED, gross still ''
  } catch {
    return raw === undefined ? { ...fallback, gross: FIRST_RUN_GROSS } : fallback;
  }
```

`fallback.gross` stays `''`. The prefill applies **only** where a record was never obtained
— so a hand-written record missing its `gross` key still yields an empty field, and a record
that failed to parse is never written over.

MEASURED, six cases driven in a real browser:

| case | field | screen |
| --- | --- | --- |
| 1. no key at all | `5000` | computes on load, `3 738,19 zł`, record written with `gross:"5000"` |
| 2. record `gross:"6000"` | `6000` | `4 420,43 zł` — untouched |
| **3. record `gross:""` (they cleared it)** | **`""`** | **`empty.answer` + `empty.band`** |
| 4. record is unparseable | `""` | empty states, no prefill |
| 5. first run, then user clears | `""` | empty states return |
| 5b. …then reload | `""` | still empty — the prefill happens **once ever** |
| 6. record `gross:""`, direction `n2g` | `""` | the new `empty.answer.net` |

Case 3 is the half a checker will drive. Case 5b proves "once ever" is real: the
write-on-mount effect turns the first paint into a record, so there is no second first run.

### What `5000` does to the empty state — and one copy defect it exposes

`empty.answer` and `empty.band` remain reachable and are MEASURED reachable. But their copy
no longer fits, for a reason that predates this slice:

**MEASURED at HEAD and at `v0.4.0`: in `netto` mode with an empty field, the screen says
`Wpisz kwotę brutto, a pokażemy, ile zostaje.` over a field whose own label is `Ile chcesz
mieć na koncie`.** The empty state instructs the user to type the opposite of what the field
asks for. It was survivable while a first-time visitor met it as a greeting; item 3 makes it
a *return* state a `netto` user reaches every time they clear the field.

**New key, direction-aware, mirroring `answer.eyebrow` / `answer.eyebrow.gross` and
`answer.from` / `answer.from.net`, which are already paired this way:**

```tsx
{t(lang, direction === 'n2g' ? 'empty.answer.net' : 'empty.answer')}
```

`empty.band` needs no pair — the band decomposes a gross either way.

The greeting tone of `empty.answer` is left alone: it is a correct instruction whether it is
the first thing you read or the thing you get back.

**One consequence of item 3, named and NOT fixed here.** MEASURED at HEAD: a returning
visitor with a stored amount already gets the live region filled ~500 ms after load, because
the first result goes through the typing debounce rather than being suppressed. That is
shipped `v0.4.0` behaviour. What item 3 changes is *who hears it*: a first-time visitor is
now told a number they did not enter, extending the accepted "someone may read 5000 as their
own figure" risk to the audio channel. **To BACKLOG** — suppressing the first-ever
announcement needs a mount flag that React StrictMode double-invocation eats in dev, so it
would ship a behaviour differing between `npm run dev` and the built artifact. Urgent when:
a screen-reader pass on the deployed build, or any further work on `Answer.tsx`'s
announcement contract.

## 5. The animation

### 5.1 The trigger set, and it is closed

**Contract or direction. Nothing else.**

```tsx
// Item 4's trigger set, and ONLY this set. Typing is excluded by
// DESIGN-SLICE-1 §3, the unit because the monthly answer often does not move,
// the under-26 / student answers because §4's band re-form already owns that
// moment, and the language because it is not a change of the answer.
const swapKey = `${contract}|${direction}`;
```

MEASURED, six triggers driven in order, reading `getAnimations()` 20 ms after each:
`running` on the direction flip and the contract change; `finished` — did not re-fire — on a
typed digit, a unit change, an under-26 flip, and a language switch.

Excluding under-26 is a design ruling, not an inheritance: DESIGN-SLICE-1 §4 spends its
whole motion budget on the band's PIT segment animating to 0 over 240 ms, and cross-fading
the band is the one thing that would destroy that lesson. The two never co-fire.

### 5.2 What moves — three groups, one gesture, no stagger

| element | moves | why |
| --- | --- | --- |
| answer eyebrow, figure, from-line, per-unit echo, delta chip, persistent lines | **yes**, one group | the eyebrow's text changes with the direction; leaving it behind tears the block |
| the band | **yes**, `.wrap`, same timing | it decomposes a different gross now |
| the ladder | **yes**, the whole `<table>`, same timing, **no stagger** | see below |
| the answer's `.furniture` (disclaimer, storage line) | **no** | permanent and identical in every mode |
| the live region | **no**, and structurally outside the group — §6 | |
| the sticky mini-bar | **no** | a pinned bar fading at the top of the viewport is motion with no context |
| anything in the card | **no** | the card is where the finger is |

**The ladder rows move together, and the refusal to stagger is a decision.** A stagger would
encode a sequence *in time*. The ladder's rows are sequential in *arithmetic* — ZUS reduces
the base for zdrowotna, which reduces the base for PIT — and that is the one true thing its
structure already encodes. Animating a temporal cascade over an arithmetic one decorates a
real property with a fake one, and costs 180 + 4×40 ≈ 340 ms to do it.

### 5.3 The gesture, the duration and the easing

```css
.swap { animation: answerSwap var(--dur-answer) var(--ease) both; }

@keyframes answerSwap {
  from { opacity: 0; transform: translateY(4px); }
  to   { opacity: 1; transform: none; }
}

@media (prefers-reduced-motion: reduce) { .swap { animation: none; } }
```

One new token: `--dur-answer: 180ms` beside `--dur-fast: 140ms` and `--dur: 240ms`, and
`--dur-answer: 0ms` in the existing reduced-motion block. **Cost, stated: the motion system
now holds three durations instead of two.** No new typeface, size, weight or colour.

MEASURED — `getComputedStyle`: `animation-duration: 0.18s`, `animation-timing-function:
cubic-bezier(0.2, 0, 0, 1)`, `animation-fill-mode: both`, on all three groups. Rendered
opacity sampled every frame after a real click:

```
   0 ms  opacity 0       translateY 4.00 px
  33 ms  opacity 0.129   translateY 3.48 px
  66 ms  opacity 0.653   translateY 1.39 px
 100 ms  opacity 0.852   translateY 0.59 px
 133 ms  opacity 0.947   translateY 0.21 px
 167 ms  opacity 0.990   translateY 0.04 px
 198 ms  opacity 1       translateY 0
```

**The figure is illegible for about 40 ms and fully settled at ~198 ms.**

**The 4 px rise is not a new gesture.** It is the delta chip's existing `rise` keyframe on a
second trigger — the restraint DESIGN-SLICE-2 applied when it put the student delta through
slice 1's existing chip mechanism rather than inventing one.

### 5.4 A named departure from the word "cross-fade"

The stakeholder said cross-fade and slide. **This specs a fade-in on swap: the old answer is
removed the instant the mode changes and the new one enters over 180 ms. The two are never
on screen together.** The reason is the stakeholder's own second clause. A true overlapping
cross-fade superimposes two money figures at partial opacity for roughly 90 ms and renders
an unreadable numeral — the visual form of exactly what "a money figure that is nobody's net
must never stand on screen" forbids. Measured, this gesture spends 40 ms illegible instead
of 90 ms garbled, and never shows a wrong number.

The alternative that honours the word literally — hold the previous result, fade out over
80 ms, swap, fade in over 100 ms — costs a phase state machine in `Answer` and puts the
*previous mode's* figure on screen for 80 ms after the user changed modes. Priced and
rejected. If the stakeholder wants the literal cross-fade, that is what it costs.

### 5.5 `prefers-reduced-motion: reduce` — exactly what it degrades to

**The new answer, band and ladder appear instantly in their final state. Nothing fades,
slides or is delayed. The announcement is unchanged, because it was never coupled to the
animation.** No entrance is substituted and no compensating cue added — unlike
DESIGN-SLICE-1 §3's relief chip, which extends its dwell because it loses an *entrance* the
user needs to notice; a mode swap loses nothing, because the label, the eyebrow and the
figure all state the new mode in text.

MEASURED under `reducedMotion: 'reduce'`: `animation-name: none`,
`animation-duration: 0s`, `opacity: 1`, `transform: none` on all three groups, and **no
animation fires on any of the six triggers**. The `animation: none` rule is belt and braces
beside the `0ms` token — a rule that says none cannot be broken by a later token edit.

### 5.6 Two structural constraints on where `.swap` may go

1. **Never on an element that is `position: sticky`, or an ancestor of one.** A `transform`
   creates a containing block and silently kills sticky positioning in a descendant. The
   desktop layout's `css.left` is sticky; all three swap groups are in `css.right`, and the
   mini-bar is a sibling of `css.page`.
2. **Never wrapping the live region.** See §6.

## 6. The live region, and the trap the animation sets for it

**Rule: the live region announces the answer and never the mode; the button's name announces
the mode and never the answer.** That is what stops the "told twice", and it is why §2.2
refuses a second ARIA channel on the button.

**The announcement is not coupled to the 180 ms transition in either direction.** It fires
at t = 0, synchronously in the same commit as the visual swap, because slices 3 and 4
settled that a direction change is an answer and announces un-debounced. A sighted user gets
the figure at ~198 ms and a screen-reader user at 0 ms; two channels at their own natural
speeds, not a race.

**The trap.** The swap is implemented by a changing React `key`, which unmounts and remounts
the subtree. **A live region that is destroyed and recreated does not reliably announce the
content it is created holding.** If the builder puts the key on `<section className={s.answer}>`
the announcement dies silently on exactly the gesture it exists for.

So the wrapper goes **inside** the section and **excludes** both the furniture and the region:

```tsx
<section className={s.answer} data-testid="answer">
  {/* The swap group. The furniture and the live region are deliberately
      OUTSIDE it: a live region that is destroyed and recreated does not
      reliably announce the content it is created holding. */}
  <div className={s.swap} key={swapKey} data-testid="answer-swap">
    …eyebrow, figure / empty, from-line, echo, delta chip, persistent lines…
  </div>
  <div className={s.furniture}>…</div>
  <p className="visually-hidden" data-testid="live" role="status" aria-live="polite" aria-atomic="true">{live}</p>
</section>
```

MEASURED: a marked reference to the live `<p>` was held in the page and re-compared after
all six triggers — `liveSurvived: true`, the marker intact. The node is never replaced.

### A P1-class defect this uncovered, PRE-EXISTING at `589ea02` and at `v0.4.0`

MEASURED identically on **both** trees, 390 PL, typed `6000`, flipped to `netto`:

| | screen shows | live region says |
| --- | --- | --- |
| HEAD `v0.4.0` | eyebrow `Kwota na umowie`, figure **`8 317,21 zł`** | **`Na konto: 6 000,00 zł miesięcznie.`** |

The region announces **the number the user typed, under the other direction's eyebrow**. It
is the P1-J shape that App.tsx's own comment says the sticky mini-bar was fixed for — "a bar
labelled with one direction's eyebrow over the other's figure" — surviving unfixed in the
one place a screen-reader user has no other channel. It is not caused by 4b; it is made
routine by 4b, because item 1 puts the flip one tap away instead of two.

**In, at Level 1, on DESIGN-SLICE-4 §2's precedent.** One key and one ternary:

```tsx
const headline =
  direction === 'n2g' && grossGrosz !== null
    ? t(lang, 'answer.live.gross', { gross: formatMoney(grossGrosz, lang) })
    : t(lang, 'answer.live', { net: formatMoney(netGrosz, lang) });
const sentence = headline + extra + echo;
```

with `grossGrosz` added to the effect's dependency list. MEASURED after the fix:
`Kwota na umowie: 8 317,21 zł miesięcznie.` — the figure the screen shows, under the eyebrow
the screen shows. The `≈ … {per}` echo clause needed no change.

**The checker must not grade this as a 4b regression.** It is a defect FIXED in 4b, and the
`v0.4.0` measurement above is the evidence it predates it.

## 7. Strings — every key, PL and EN

**CHANGED**

| key | PL | EN |
| --- | --- | --- |
| `field.gross.quickfill` | `Płaca minimalna {year}` | `{year} minimum wage` |

**NEW**

| key | PL | EN |
| --- | --- | --- |
| `empty.answer.net` | `Wpisz kwotę, jaką chcesz mieć na koncie, a policzymy brutto.` | `Enter what you want in your account and we'll work out the gross.` |
| `answer.live.gross` | `Kwota na umowie: {gross} zł miesięcznie.` | `On the contract: {gross} zł per month.` |

**UNCHANGED and still load-bearing** — `dir.label` stays as the row's visible eyebrow;
**`dir.group` survives and changes role**, from the deleted radiogroup's `aria-label` to the
toggle's visually-hidden purpose prefix, same string; `dir.g2n` and `dir.n2g` are unchanged
and still split on `→`.

**DIES** — nothing. `field.gross.unit` and `field.gross.label` were deleted in slice 4.

## 8. What the e2e references become

MEASURED by grep over `e2e/app.spec.ts` at `589ea02`:

| what | count |
| --- | --- |
| lines touching the direction control | **18** |
| — `direction(page, 'g2n'\|'n2g')` call sites | 12 |
| — `getByRole('radiogroup', { name: DIRECTION_PL })` lookups | 2 (lines 706, 719) |
| — `aria-checked` assertions on the direction | 5 |
| `role="radio"` / `radiogroup` for the **other three** controls — untouched | 6 + 17 lines |

### The migration, and the hazard in it

**A toggle is not idempotent.** `direction(page, 'n2g').click()` is safe twice today; on one
button, two clicks return to `g2n`. Lines 861 and 864 click `n2g` then `g2n` — with a toggle
those are the same element. Every call site goes through a **state-aware setter**:

```ts
async function setDirection(page: Page, which: 'g2n' | 'n2g') {
  const toggle = page.getByTestId('dir-toggle');
  if ((await toggle.getAttribute('data-direction')) !== which) await toggle.click();
  await expect(toggle).toHaveAttribute('data-direction', which);
}
```

| today | becomes |
| --- | --- |
| `getByRole('radiogroup', { name: DIRECTION_PL })` (2) | `page.getByTestId('dir-toggle')` |
| `direction(page, X).click()` (7) | `await setDirection(page, X)` |
| `toHaveAttribute('aria-checked','true')` (5) | `toHaveAttribute('data-direction','g2n')`, plus **one** `toHaveAccessibleName` per language asserting the literal §2.2 string |
| line 738's `.locator('[aria-hidden="true"]')).toHaveText('→')` | `expect(toggle).toContainText('→')` — there are now two `aria-hidden` children, so the old locator matches twice and the assertion breaks |
| the 44 px box loop over both segments (line 736) | one `boundingBox()` on the toggle; MEASURED 144.5 × 44 PL, 128.2 × 44 EN |
| line 1197's `toHaveText(/^Płaca minimalna 2026 — 4\D?806 zł brutto$/)` | `/^Płaca minimalna 2026$/`; the three post-click assertions below it stay as they are |

**`data-direction` is one new attribute and it earns its place:** the toggle's state must be
assertable by an instrument that is *not* the label's own text, or a test cannot tell a label
change from a state change. It also drives the setter above.

**Trap, MEASURED:** `getByRole('button', { name: /brutto → netto/ })` matches **nothing** —
count 0 in all four states. The arrow is not in the accessible name.

**New coverage this slice owes:**

1. First run with no `localStorage` key → field `5000`, `net-amount` present on load.
2. Record with `gross: ''` → field empty, `empty.answer` and `empty.band` visible. *The
   load-bearing half.*
3. Record with `gross: '6000'` → still `6000`.
4. Unparseable record → empty field, not `5000`.
5. `netto` + empty → `empty.answer.net`.
6. `netto` + a value → live region text starts `Kwota na umowie:` and carries the figure
   `net-amount` shows.
7. A Vitest case in `storage.test.ts` for the raw-`null` vs raw-unparseable branch —
   MEASURED, the two existing storage tests both seed a record and neither covers it.

**One unit test breaks and must be updated, MEASURED by running the suite against the
patched tree:** `src/i18n/strings.test.ts:176` pins `field.gross.quickfill` to its old text.
That is the **only** failure — 38 of 39 pass.

## 9. Implementation approach for the interface

**No new dependency, and the posture is a choice.** React + Vite + TypeScript, one route, no
router; plain CSS; no UI library, no CSS framework, no CSS-in-JS, **no animation library**,
no icon library; fonts self-hosted from npm. Restated because this slice is where a library
is most tempting: a motion library for a 180 ms opacity change is a runtime dependency for
eleven lines of CSS, and it would arrive with its own opinion about `prefers-reduced-motion`
— the one place §5.5 is not negotiable.

**Rejected by name: the View Transition API.** `document.startViewTransition` would give a
real cross-fade in one line, and what it gives is precisely the overlapping snapshot §5.4
rejects, plus a browser-support surface the product does not have.

**Cost, stated:** roughly **45 lines**, of which about 25 are deletions (`.dir`, `.dirSeg`,
`.active`, the `DIRECTIONS` map). **This is the first slice since slice 1 that removes more
markup than it adds.**

**Files touched:** `GrossCard.tsx`, `GrossCard.module.css`, `App.tsx`, `Answer.tsx`,
`Answer.module.css`, `Band.tsx`, `Band.module.css`, `Ladder.tsx`, `Ladder.module.css`,
`storage.ts`, `strings.ts`, `tokens.css`, plus `e2e/app.spec.ts`, `strings.test.ts`,
`storage.test.ts`. **No new module.** The `.swap` rule and its keyframes are duplicated in
three CSS modules because CSS Modules do not share `@keyframes` across files — the builder
may instead put one `.swap` rule in `base.css`; that is a Level 0 call and either is correct.

## 10. What this costs, and where one item makes another worse

1. **Item 2 damages item 2.** The short label removes the chip's affordance along with its
   amount, and §3 pays for it with a heavier border. The chip is now visually *stronger*
   than at `v0.4.0` despite being 97 px shorter. If the stakeholder wanted the chip quieter,
   they got the opposite, because at 151 px the quiet version stops looking clickable.
2. **Item 2 leaves a control whose label is narrower than its effect** — already graded in
   DECISIONS and not reopened here.
3. **Item 3 puts a number into a screen-reader user's ear on first load** that no first-time
   visitor asked for. Pre-existing mechanism, new audience, backlogged with its condition.
4. **Item 4 adds a third motion duration** to a system that had two, and its trigger set has
   to be written down and defended because five plausible triggers are excluded from it.
5. **Item 4 makes the contract change asymmetric:** the right column fades in while the card
   snaps. Deliberate — the card is under the user's thumb — but someone will notice it.
6. **Item 1 costs a visible state.** With one button you can no longer see `netto → brutto`
   sitting there unselected; the mode you are not in is invisible until you press. That is
   the point of the decision and it is still a loss, paid for by the swap glyph and by the
   field label changing underneath.
7. **The `.swap` keyframes are duplicated in three CSS modules** unless hoisted to
   `base.css`. Named so it is a choice.

## 11. Prototype tells

| tell | verdict |
| --- | --- |
| Real content, never placeholder | **Satisfied, and this slice is where it was in danger.** `5000` is real, computed through the shipped engine, editable in one keystroke, obviously round, and survives exactly one page load. |
| Empty, loading and error states designed | **Satisfied, and improved** — empty is now direction-aware in both languages, which it was not at `v0.4.0`. No loading state, still, because nothing here is asynchronous. |
| ONE accent carrying meaning | **Satisfied.** Nothing here adds a colour. Honey still means only "money you keep"; the toggle and the chip are ink on surface so they do not borrow it. |
| Spacing on a single grid | **Satisfied.** Every value is on the 4 px grid: gap 8, padding 12, min-height 44/46/36, rise 4. `--dur-answer: 180ms` is off any grid, and motion has no grid. |
| Typography with a point of view | **NOT satisfied, and not addressed.** DESIGN-SLICE-1 §3's declared two-grotesque weakness still stands. This slice adds no face, size or weight. |
| A structure with a beginning | **Satisfied, and item 3 strengthens it.** A first-time visitor used to meet two empty-state sentences; they now meet a formed band and a filled ladder. That is item 3's real payoff. |
