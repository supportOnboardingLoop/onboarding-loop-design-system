# Onboarding Loop — building with this design system

A Tailwind v4 + React component library on the OL brand (warm ivory surfaces,
slate text, **book-cloth** as the single accent). Components are real exports on
`window.OnboardingLoop.*`. Build with the components for UI and OL utility
classes for your own layout — both are already styled by the shipped CSS.

## Setup — no provider needed

There is **no provider or theme wrapper to mount.** Styling comes entirely from
the shipped `styles.css` (it `@import`s the compiled Tailwind layer, the OL
tokens, and the component CSS). Just render the components and use the utility
classes below.

- **Dark mode:** add `class="dark"` to any ancestor (e.g. `<body class="dark">`).
  All semantic tokens remap automatically.
- **Font:** Inter, applied via `font-sans` / the `--font-sans` token.

## Styling idiom — Tailwind utilities mapped to OL tokens

Style with utility classes (NOT inline hex, NOT CSS-in-JS). Color utilities map
to **semantic roles**, so always reach for the role, never a raw palette value.
These OL-token-backed utilities are guaranteed present in the shipped CSS:

| Need | Use |
|---|---|
| Surfaces | `bg-background` (page), `bg-card`, `bg-popover`, `bg-muted`, `bg-secondary`, `bg-accent` |
| Text | `text-foreground`, `text-muted-foreground`, `text-card-foreground`, `text-primary` |
| Accent / CTA | `bg-primary text-primary-foreground` — **book-cloth; CTAs & clickable only** |
| Danger | `bg-destructive`, `text-destructive` |
| Borders | `border border-border` (subtle), `border-input` (form fields) |
| Radius | `rounded-md` (controls), `rounded-lg` (cards), `rounded-full` (pills) |
| Type scale | `text-xs text-sm text-base text-lg text-xl text-2xl text-3xl` |
| Layout | `flex grid gap-2..gap-12 p-2..p-12 items-center justify-between max-w-md` |

**Brand rules that matter:**
- **book-cloth (`bg-primary`) is the only brand accent — use it for CTAs and
  clickable affordances ONLY.** Don't paint headers, cards, or decoration with it.
- **Badges convey semantic status, not brand** — `variant="neutral|success|warning|error"`.
- Borders/dividers are intentionally subtle (ivory). That's correct, not a bug.

## Where the truth lives

Read these before styling — the bound copies you have:
- `styles.css` (and its `@import` closure) — every available token & utility.
- `tokens.css` — the OL token source (semantic roles + brand primitives).
- Each component's `<Name>.prompt.md` (usage + examples) and `<Name>.d.ts` (props).

Compound components ship their parts on the global too: `Card` →
`CardHeader/CardTitle/CardDescription/CardContent/CardFooter/CardAction`;
`Select` → `SelectTrigger/SelectValue/SelectContent/SelectGroup/SelectLabel/SelectItem`.

## One idiomatic example

```jsx
const { Card, CardHeader, CardTitle, CardDescription, CardAction,
        CardContent, CardFooter, Button, Badge } = window.OnboardingLoop

function SetupCard() {
  return (
    <Card className="max-w-md">
      <CardHeader>
        <CardTitle>Onboarding progress</CardTitle>
        <CardDescription>3 of 5 setup steps complete</CardDescription>
        <CardAction><Badge variant="success">On track</Badge></CardAction>
      </CardHeader>
      <CardContent className="text-muted-foreground">
        Guide new teammates through workspace setup.
      </CardContent>
      <CardFooter className="gap-2">
        <Button>Continue</Button>
        <Button variant="ghost">Skip for now</Button>
      </CardFooter>
    </Card>
  )
}
```
