import { Card, CardSurface, CardFooter, CardTitle, CardDescription } from "@/components/base/card"
import { Button } from "@/components/base/button"
import { Icon, type IconName } from "@/components/base/icon"
import { PageSection, PageIntro } from "../page-kit"

/* ============================================================================
   Toolkit: the shelf of downloadable Onboarding Loop artifacts — the protocol
   docs (PDF + a matching Markdown you can feed straight to an LLM) and the
   drop-in Claude skill. Every file is real, under /public/toolkit, and opens
   in a new tab. The card is static; only the footer buttons act.
   ========================================================================== */

type FileLink = { label: string; href: string; aria: string }
type Artifact = {
  icon: IconName
  title: string
  desc: string
  files: FileLink[]
}

// One format button = a real <a> (opens in a new tab) styled as the DS Button:
// text-only at rest, the download icon reveals on the right on hover.
function FileButton({ label, href, aria }: FileLink) {
  return (
    <Button
      render={<a href={href} target="_blank" rel="noopener noreferrer" aria-label={aria} />}
      nativeButton={false}
      size="sm"
      variant="secondary"
      revealIcon="download"
    >
      {label}
    </Button>
  )
}

// A static artifact card: the real Card system (no hover). Leading file-type
// tile + title + one-line summary; the footer holds one button per format.
function ToolkitCard({ icon, title, desc, files }: Artifact) {
  return (
    <Card className="h-full">
      <CardSurface className="flex-1 gap-4">
        <div className="flex items-start gap-3.5">
          <span className="grid size-10 shrink-0 place-items-center rounded-xl [corner-shape:squircle] border border-border bg-subtle text-foreground">
            <Icon name={icon} size={20} stroke={1.5} />
          </span>
          <div className="flex min-w-0 flex-col gap-1">
            <CardTitle>{title}</CardTitle>
            <CardDescription>{desc}</CardDescription>
          </div>
        </div>
      </CardSurface>
      <CardFooter
        action={
          <div className="flex items-center gap-2">
            {files.map((f) => (
              <FileButton key={f.href} {...f} />
            ))}
          </div>
        }
      />
    </Card>
  )
}

function Shelf({ items }: { items: Artifact[] }) {
  return (
    <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">
      {items.map((a) => (
        <ToolkitCard key={a.title} {...a} />
      ))}
    </div>
  )
}

// each protocol ships as a PDF (to read) + a matching Markdown (to feed an LLM)
const proto = (icon: IconName, title: string, desc: string, slug: string): Artifact => ({
  icon,
  title,
  desc,
  files: [
    { label: "PDF", href: `/toolkit/${slug}.pdf`, aria: `Download ${title} as a PDF` },
    { label: "MD", href: `/toolkit/${slug}.md`, aria: `Download ${title} as Markdown` },
  ],
})

const PROTOCOLS: Artifact[] = [
  proto("file-text", "Activation Protocol", "Turn first-time signups into activated users who reach their first real win.", "activation-protocol"),
  proto("file-text", "Retention Protocol", "Build the habits and loops that bring users back, week after week.", "retention-protocol"),
  proto("file-text", "Expansion Protocol", "Grow accounts from active to expanding: upgrades, seats, and new use cases.", "expansion-protocol"),
  proto("file-text", "Level Design Patterns", "Sequence the journey into levels, so each step unlocks the next.", "level-design-patterns"),
]

const SKILLS: Artifact[] = [
  {
    icon: "sparkles",
    title: "Activation Audit",
    desc: "A drop-in Claude skill: the framework for auditing and scoring a SaaS product's onboarding and activation.",
    files: [{ label: "SKILL.md", href: "/toolkit/activation-audit-skill.md", aria: "Download the Activation Audit skill" }],
  },
]

export function ToolkitPage() {
  return (
    <>
      <PageIntro>
        The Onboarding Loop toolkit: each protocol as a PDF to read plus a matching Markdown you can feed straight to an
        LLM, and a drop-in Claude skill. Free while we are in preview.
      </PageIntro>

      <PageSection title="Protocols" desc="The Onboarding Loop methodology, one doc per phase (PDF + Markdown).">
        <Shelf items={PROTOCOLS} />
      </PageSection>

      <PageSection title="Claude skill" desc="A drop-in SKILL.md that teaches Claude the Onboarding Loop method.">
        <Shelf items={SKILLS} />
      </PageSection>
    </>
  )
}
