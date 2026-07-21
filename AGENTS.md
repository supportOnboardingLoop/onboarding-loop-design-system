# Onboarding Loop Design System — agent rules

This repo is ONE master component set, reused everywhere (styleguide, demo, client
builds, Loop OS). Its entire purpose is to prevent design drift. Read this before
writing or changing any UI.

## THE LAW: reuse first, never build lookalikes

Before you build ANY interface — a button, a row, a close control, a scroll
container, a launcher state, a menu — you MUST first find the existing component
and use it. Do NOT hand-roll something that "kinda looks like" what we already
have. A lookalike that's a little different IS drift, and drift is the one thing
this system exists to kill.

**Audit checklist (do this first, every time):**
1. Look in the styleguide pages — they are the living catalog: `styleguide/src/pages/`
   → **Base** (atoms/molecules/surfaces), **Charts**, **Agent** (conversation +
   answer widgets), **Product** (nav, launcher, calendar).
2. Look in `components/base/` and `components/product/` and the `index.ts` barrel.
3. Reuse the REAL component: real import, real props, real tokens. Never
   re-create its look in ad-hoc CSS/classes.

## Components you will reach for (don't reinvent these)

| Need | Use | Where |
|---|---|---|
| Agent gives 2-3 options (A/B/C + reveal check) | `Choices` | `components/product/choices.tsx` |
| The agent launcher / search / command bar | `Launcher` (+ `launcher-engine.ts`) | `components/product/launcher.tsx` |
| Close / collapse control (rotating X, chevrons) | `IconButton` (`motion="rotate"`) | `components/base/icon-button.tsx` |
| Any scrolling region + its scrollbar | `ScrollArea` | `components/base/scroll-area.tsx` |
| Buttons | `Button` (variants) | `components/base/button.tsx` |
| Card tray + white well | `Card` / `CardSurface` | `components/base/card.tsx` |
| Text field / multiline | `Input` / `Textarea` | `components/base/*` |
| Select / dropdown / menu | `Select` / `Dropdown` | `components/base/select.tsx`, `components/product/dropdown.tsx` |
| Icons | `Icon` (Tabler set only) | `components/base/icon.tsx` |

When unsure whether something exists, assume it does and go look. The catalog is
bigger than this table.

## Shared components stay identical across consumers

A shared component (the launcher, buttons, avatars, icons) must behave the SAME
everywhere. Do NOT fork its look/behavior for one screen (e.g. do not restyle the
launcher avatar in a search mode so hover differs from the demo). A change to a
shared component applies everywhere by design; if you scope it to one place,
you're creating drift — flag it instead.

## If a component genuinely doesn't exist

Good — new components are how the system grows. But:
1. STOP and tell Bal it's new before building it.
2. Build it as a REAL design-system component (in `components/`, shown in the
   styleguide, dogfooded), then consume it.
3. Never inline-invent a one-off in the feature's CSS.

## Non-negotiable style rules

- **Brand = neutral.** No accent/brand color; the brand IS the gray palette.
  Semantic state colors (green/red/amber) are utility only.
- **Squircles** on rounded rects (`corner-shape: squircle`); circles stay circles.
- **Tabler icons only**, via `Icon` / `BP_ICONS`. Never paid/Untitled icon sets.
- **American English, no em dashes** in copy/comments.
- Verify visual changes measured in a real browser (see the `visual-verify` skill),
  in BOTH light and dark, before calling anything done.
