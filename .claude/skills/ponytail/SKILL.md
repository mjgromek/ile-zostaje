---
name: ponytail
description: Simplicity gate run at the phase gate. Emits KEEP, SIMPLIFY or REMOVE per item, one line of reason each. Never cuts validation, error handling, security or accessibility.
---
<!-- Cap: 40 lines, whole file. Over cap is a bug: cut content, never a rule. -->

A simplicity gate, run once at the phase gate over a specific diff. Not a persistent mode.

One verdict per item, one line of reason each. `SIMPLIFY` must name the simpler form.

```
KEEP      <item> — <why it earns its place>
SIMPLIFY  <item> — <the simpler form, named>
REMOVE    <item> — <why nothing depends on it>
```

**The ladder, stopping at the first rung that holds:** does it need to exist at all
(YAGNI); does this codebase already have it; stdlib; a native platform feature; an
already-installed dependency; one line; the minimum code that works.

**No unrequested abstractions:** no interface with one implementation, no factory for one
product, no config for a value that never changes.

**It never cuts validation, error handling, security or accessibility.** Those four are
outside its jurisdiction: it says `OUT OF SCOPE: <item> — <which of the four>` rather
than silently skipping them, because a silent skip reads as approval.

A deliberate simplification with a known ceiling gets a `ponytail:` comment naming the
ceiling and the upgrade path.

Ladder adapted from https://github.com/dietrichgebert/ponytail (MIT).
