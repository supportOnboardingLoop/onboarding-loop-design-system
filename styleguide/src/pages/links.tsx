import type { ReactNode } from "react"
import { Card, CardSurface, CardFooter, CardTitle, CardDescription } from "@/components/base/card"
import { Button } from "@/components/base/button"
import { Icon, type IconName } from "@/components/base/icon"
import { PageSection, PageIntro } from "../page-kit"

/* ============================================================================
   Links — the product hub. Everywhere the Onboarding Loop System lives, as a
   grid of link cards built on the real Card system (a gray tray + one white
   surface + a footer CTA). Every card is a live destination that opens in a
   new tab.
   ========================================================================== */

type LinkCardProps = {
  icon: IconName
  title: string
  description: string
  href: string
}

// One link card = a static Card (gray tray) holding a white CardSurface (icon
// tile + title + description) and a CardFooter whose Open button is the link.
// The card itself is not clickable and has no hover; only the button acts. The
// Button renders as a real <a> that opens in a new tab.
function LinkCard({ icon, title, description, href }: LinkCardProps) {
  return (
    <Card className="h-full">
      <CardSurface className="flex-1 gap-4">
        <span className="grid size-10 place-items-center rounded-[12px] border border-border bg-subtle text-foreground [corner-shape:squircle]">
          <Icon name={icon} size={20} stroke={1.75} />
        </span>
        <div className="flex flex-col gap-1">
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
      </CardSurface>
      <CardFooter
        action={
          <Button
            render={<a href={href} target="_blank" rel="noopener noreferrer" aria-label={`Open ${title}`} />}
            nativeButton={false}
            size="sm"
            variant="secondary"
            revealIcon="external-link"
          >
            Open
          </Button>
        }
      />
    </Card>
  )
}

// The responsive grid every section shares: cards flow to fill, min 300px wide.
function LinkGrid({ children }: { children: ReactNode }) {
  return <div className="grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(300px,1fr))]">{children}</div>
}

export function LinksPage() {
  return (
    <>
      <PageIntro>
        Everywhere the Onboarding Loop System lives: the live demo, the marketing site, and the code. Each opens in a
        new tab.
      </PageIntro>

      <PageSection title="Product" desc="The system in action.">
        <LinkGrid>
          <LinkCard
            icon="layout-dashboard"
            title="Live demo"
            description="The multi-SaaS product demo: the design system + agent in action."
            href="https://demo.onboardingloop.ai"
          />
        </LinkGrid>
      </PageSection>

      <PageSection title="Web" desc="The public face and the source.">
        <LinkGrid>
          <LinkCard
            icon="cloud"
            title="Website"
            description="The Onboarding Loop marketing site."
            href="https://onboardingloop.ai"
          />
          <LinkCard
            icon="file-text"
            title="GitHub"
            description="The component library + tokens, open on GitHub."
            href="https://github.com/supportOnboardingLoop/onboarding-loop-design-system"
          />
        </LinkGrid>
      </PageSection>
    </>
  )
}
