---
name: theme-factory
description: Settles a project's palette and typography once, from ten preset themes or a generated custom one, shown as three variants on the project's own real screen. Runs only when a slice ships a user-visible interface.
license: Complete terms in LICENSE.txt
---
<!-- Cap: 70 lines, whole file. Over cap is a bug: cut content, never a rule. -->

## Trigger

**Runs only when a slice ships a user-visible interface, and only ONCE per project.** A
theme is settled once, never renegotiated per slice. On a backend-only slice it declines in
one line and stops, and **it refuses to reopen a theme already recorded in
`.agent/DECISIONS.md`**.

A settled theme is colour, typography and visual identity. It is NOT the information
design — what form the interface takes, what is visible at once, how it is arranged.
Refusing to reopen a settled theme must never block a change of form or layout. If a new
form needs colour roles the theme does not have, EXTEND the theme and record the extension;
do not treat that as reopening it.

## The ten themes

1. **Ocean Depths** — professional, calming maritime
2. **Sunset Boulevard** — warm, vibrant sunset colours
3. **Forest Canopy** — natural, grounded earth tones
4. **Modern Minimalist** — clean contemporary grayscale
5. **Golden Hour** — rich, warm autumnal palette
6. **Arctic Frost** — cool, crisp winter-inspired
7. **Desert Rose** — soft, sophisticated dusty tones
8. **Tech Innovation** — bold, modern tech aesthetic
9. **Botanical Garden** — fresh, organic garden colours
10. **Midnight Galaxy** — dramatic, cosmic deep tones

Each is fully specified in `themes/`: palette hex codes and a header/body font pairing. If
none fits, generate a custom theme in the same shape, named for what it represents.

## Show it on the real thing

Do not show `theme-showcase.pdf`, and do not show swatches. Generate ONE self-contained
HTML file in the OS temp directory holding THREE variants applied to this project's own
actual screen — real content, real layout. Inline all CSS; no CDNs, no network. Open it
(`open` on macOS, `xdg-open` on Linux) and print the absolute path.

## Level 2 — present and wait

**It never picks for the user and never proceeds on silence.** User-visible design
direction is Level 2 under `.claude/policies/autonomy.md`: the one place in this pipeline
where a default is not allowed. The user replies with a variant and may add free-form
instructions ("2, but darker, lose the rounded corners"); apply those to the chosen
variant, re-render, show again. **At most two re-render rounds**, then apply what it has
and say so.

On acceptance, record the palette, fonts and instructions in `.agent/DECISIONS.md`, which is
append-only and uncapped, and read the refusal check from there. `PROJECT.md` carries a
one-line pointer only. Recorded in `PROJECT.md` alone, the theme vanishes from the check the
moment compaction moves it — and the one thing this skill exists to prevent becomes possible.

**Third branch: on EXPLICIT delegation, pick** — and require a `DECISIONS.md` entry naming
what was picked, what it beat, and that no variant round was shown. Silence is still not
delegation and still never proceeds.

Adapted from https://github.com/anthropics/skills. Tightened per `docs/DESIGN.md` section 9, which makes user-visible design direction Level 2; it postdates the plan's six skills.
