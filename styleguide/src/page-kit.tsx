import type { ReactNode } from "react"
import { Card, CardSurface } from "@/components/base/card"
import { SectionHeader } from "@/components/product/section-header"
import { cn } from "@/lib/utils"

/* ============================================================================
   Page kit — the content-area treatment, dogfooded onto the real Card system.

   Every styleguide page is now ONE long page built from two header tiers plus
   the real Card. The pattern mirrors the Demo:

     PageSection   a tier-1 subsection (e.g. "Atoms"). Its header sits on the
                   page grey (a SectionHeader, outside any card); it becomes an
                   accordion GROUP in the sub-nav.  [data-section-anchor="group"]
       PageItem    a tier-2 sub-subsection (e.g. "Icons"). Header outside the
                   card; becomes an anchor LINK inside the group's accordion.
                   [data-section-anchor="item"]
         Example   the real <Card> tray + one white <CardSurface> well — where
                   the live component actually lives.

   A PageSection with no PageItems (a foundation like "Radius") renders as a
   plain link in the sub-nav and holds its Example directly.
   ========================================================================== */

// a stable anchor id from a title, so the sub-nav can jump to it
export function sectionId(title: string) {
  return "sec-" + title.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}

// Tier-1 subsection. Big heading on the page grey + a top rule between sections;
// starts an accordion group in the sub-nav.
export function PageSection({
  title,
  desc,
  id,
  children,
}: {
  title: string
  desc?: ReactNode
  id?: string
  children: ReactNode
}) {
  return (
    <section
      id={id ?? sectionId(title)}
      data-section-anchor="group"
      data-section-title={title}
      className="scroll-mt-4 mt-14 border-t border-border-strong pt-10 first:mt-0 first:border-0 first:pt-0"
    >
      <SectionHeader title={title} description={desc} size="lg" />
      <div className="mt-6 flex flex-col gap-12">{children}</div>
    </section>
  )
}

// Tier-2 sub-subsection. Smaller heading + its example card(s); an anchor link
// inside the parent group's accordion.
export function PageItem({
  title,
  desc,
  id,
  action,
  children,
}: {
  title: string
  desc?: ReactNode
  id?: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section
      id={id ?? sectionId(title)}
      data-section-anchor="item"
      data-section-title={title}
      className="scroll-mt-4"
    >
      <SectionHeader title={title} description={desc} action={action} />
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </section>
  )
}

// A single-surface example: the real Card tray + one white CardSurface well.
//   `tray`      → styles the outer Card (width / alignment)
//   `className` → styles the inner surface (padding / layout; overrides win via cn)
//   `padded`    → CardSurface's default p-6 (set false for bleed content)
export function Example({
  children,
  className,
  tray,
  padded = true,
}: {
  children: ReactNode
  className?: string
  tray?: string
  padded?: boolean
}) {
  return (
    <Card className={tray}>
      <CardSurface padded={padded} className={className}>
        {children}
      </CardSurface>
    </Card>
  )
}

// A labeled-row list inside one surface (the old Rows/Row): each row is a label
// + its live examples, divided by hairlines.
export function ExampleRows({
  children,
  tray,
  className,
}: {
  children: ReactNode
  tray?: string
  className?: string
}) {
  return (
    <Card className={tray}>
      <CardSurface padded={false} className={cn("gap-0 px-5", className)}>
        {children}
      </CardSurface>
    </Card>
  )
}

export function ExampleRow({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-4 border-b border-border py-3.5 last:border-b-0">
      <div className="w-28 shrink-0 text-xs font-medium text-muted-foreground">{label}</div>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  )
}

// A small caption under an example, naming its configuration.
export function Caption({ children }: { children: ReactNode }) {
  return <p className="mt-3 text-xs font-medium text-muted-foreground">{children}</p>
}

// An intro paragraph at the top of a page (before the first PageSection).
export function PageIntro({ children }: { children: ReactNode }) {
  return <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground">{children}</p>
}
