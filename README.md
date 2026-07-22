# The OnboardingLoop System

The single, reusable source of truth for OL brand: colors, type, spacing, radius,
and the base UI primitives. Built so any new product (Loop OS, the Blueprint
deliverable, whatever comes next) inherits the brand instead of redefining it.

## What's here

- `tokens.css` — the brand. Two layers: **primitives** (`--ol-*`, the raw palette)
  and **semantic tokens** (`--primary`, `--background`…, the roles UI uses).
  Framework-agnostic; this is also what Claude Design `/design-sync` reads.
- `theme.css` — the Tailwind v4 layer. Imports Tailwind + tokens and bridges them
  into Tailwind's theme so utility classes (`bg-primary`, `rounded-md`,
  `text-muted-foreground`) resolve to OL brand. This is what a product imports.
- `components/` — the base primitives: button, card, input, textarea, label,
  badge, select, separator, scroll-area. React + Tailwind, built on Base UI.
- `lib/utils.ts` — the `cn` class-merge helper the components use.
- `preview/index.html` — a plain-HTML visual styleguide. Open it (in Chrome, for
  the squircle corners) to see the whole system. Also the surface to sync to Claude Design.
- `components.json` — shadcn config, so the CLI and Claude Design recognise this as a source.

## Use it in a new product

Two paths, both valid:

1. **Tokens only** (any stack, fastest): copy `tokens.css`, load it globally,
   reference the **semantic** tokens (never the raw `--ol-*`). Instant brand.
2. **Full system** (React + Tailwind v4 + shadcn): import `theme.css` once in your
   root stylesheet, install the peer/runtime deps below, and copy the files in
   `components/` into your app's `@/components` (they expect the standard shadcn
   aliases `@/components` and `@/lib/utils`). This is how Loop OS will consume it.

Runtime deps for the components: `@base-ui/react`, `@hugeicons/react`,
`@hugeicons/core-free-icons`, `class-variance-authority`, `clsx`, `tailwind-merge`,
`tw-animate-css`. Peers: `react` 19+, `react-dom` 19+, `tailwindcss` 4.

## Notes

- Semantic token names match shadcn, so the system drops into shadcn projects and
  Claude Design with no translation.
- Components are built on Base UI (`base-mira` shadcn style), matching Loop OS. If
  cross-tool portability ever needs the more common Radix-based shadcn, that's a
  future conversion; the tokens travel cleanly either way.
- `book-cloth` is reserved for CTAs / clickable elements in light mode.
- Squircle corners (`corner-shape`) render in Chromium and fall back gracefully.

_v0.4 — tokens + primitives ported and wired. Next: point Loop OS at this system._
