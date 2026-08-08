---
name: theme-factory
description: Settles a project's palette and typography once, from ten preset themes or a generated custom one, shown as three variants on the project's own real screen. Runs only when a slice ships a user-visible interface.
license: Complete terms in LICENSE.txt
---

## Trigger

**Runs only when a slice ships a user-visible interface, and only ONCE per project.** A
theme is settled once, never renegotiated per slice. On a backend-only slice it declines in
one line and stops, and **it refuses to reopen a theme already recorded in `PROJECT.md`**.

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
and say so. On acceptance, write the palette, fonts and instructions into `PROJECT.md`.

Adapted from https://github.com/anthropics/skills. Tightened per PIPELINE_FINAL_PLAN.md.
