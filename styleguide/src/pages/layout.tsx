import { useState } from "react"
import { Button } from "@/components/base/button"
import { IconButton } from "@/components/base/icon-button"
import { Icon, type IconName } from "@/components/base/icon"
import { WorkspaceShell } from "@/components/product/workspace-shell"
import {
  LayoutColumn,
  ColumnHeader,
  ColumnTitle,
  ColumnBody,
  ColumnFooter,
  NavList,
} from "@/components/product/layout-column"
import { NavItem } from "@/components/product/nav-item"
import { Chip } from "@/components/product/chip"
import { CollapsibleSection } from "@/components/product/section"
import { PageSection, PageItem } from "../page-kit"

/* ---------------- layout: WorkspaceShell + column primitives ---------------- */

const shellNav: { icon: IconName; label: string }[] = [
  { icon: "sparkles", label: "Overview" },
  { icon: "chart-bar", label: "Portfolio" },
  { icon: "checklist", label: "Tasks" },
  { icon: "users", label: "Partners" },
]

// A bounded, LIVE WorkspaceShell built from the same primitives the Demo uses —
// collapse the columns, open the chat, or drag a gutter to resize. Change a metric
// in components/workspace.css and BOTH this and the Demo move (no drift). The
// launcher / travelling avatar are viewport-fixed, so they stay in the Demo.
function ShellDemo() {
  const [navC, setNavC] = useState(false)
  const [subC, setSubC] = useState(false)
  const [work, setWork] = useState(false)
  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <Button variant="secondary" onClick={() => setNavC((c) => !c)}>{navC ? "Expand" : "Collapse"} nav</Button>
        <Button variant="secondary" onClick={() => setSubC((c) => !c)}>{subC ? "Show" : "Hide"} agent home</Button>
        <Button variant="secondary" onClick={() => setWork((c) => !c)}>{work ? "Close" : "Open"} chat</Button>
        <span className="text-xs text-muted-foreground">…or drag a gutter edge to resize.</span>
      </div>
      <div className="overflow-hidden rounded-2xl border border-border-strong shadow-card [corner-shape:squircle]">
        <WorkspaceShell
          style={{ height: 460 }}
          navCollapsed={navC}
          subCollapsed={subC}
          workOpen={work}
          primaryNav={
            <LayoutColumn as="aside" variant="card">
              <ColumnHeader className={`gap-2.5 ${navC ? "justify-center" : "pr-3 pl-5"}`}>
                {!navC && <span className="truncate text-base font-bold tracking-[-0.01em]">Workspace</span>}
                <IconButton
                  icon={navC ? "chevrons-right" : "chevrons-left"}
                  motion={navC ? "arrow-right" : "arrow-left"}
                  className={navC ? "" : "ml-auto"}
                  aria-label={navC ? "Expand nav" : "Collapse nav"}
                  onClick={() => setNavC((c) => !c)}
                />
              </ColumnHeader>
              <ColumnBody className={`pt-3 ${navC ? "px-3" : "px-4"}`}>
                {navC ? (
                  <div className="flex flex-col items-center gap-0.5">
                    {shellNav.map((r) => (
                      <NavItem key={r.label} icon={r.icon} collapsed title={r.label} current={r.label === "Overview"}>
                        {r.label}
                      </NavItem>
                    ))}
                  </div>
                ) : (
                  <CollapsibleSection label="Pages" count={shellNav.length}>
                    <NavList>
                      {shellNav.map((r) => (
                        <NavItem key={r.label} icon={r.icon} current={r.label === "Overview"}>
                          {r.label}
                        </NavItem>
                      ))}
                    </NavList>
                  </CollapsibleSection>
                )}
              </ColumnBody>
            </LayoutColumn>
          }
          agentHome={
            <LayoutColumn as="aside" variant="card">
              <ColumnHeader className="gap-2.5 pr-3 pl-5">
                <ColumnTitle as="h2">Agent home</ColumnTitle>
                <IconButton icon="chevrons-left" motion="arrow-left" onClick={() => setSubC(true)} aria-label="Hide agent home" />
              </ColumnHeader>
              <ColumnBody className="px-4 pt-3">
                <CollapsibleSection label="Dashboards" count={3}>
                  <NavList>
                    <NavItem icon="layout-dashboard" tail={<Chip variant="new">3</Chip>}>Revenue</NavItem>
                    <NavItem icon="layout-dashboard" tail={<Chip variant="new">5</Chip>}>Retention</NavItem>
                    <NavItem icon="layout-dashboard" tail={<Chip variant="new">2</Chip>}>Activation</NavItem>
                  </NavList>
                </CollapsibleSection>
              </ColumnBody>
            </LayoutColumn>
          }
          content={
            <LayoutColumn as="main" variant="canvas">
              <ColumnHeader hairline={false} className="gap-0 pr-3 pl-3.5">
                <span className="mr-2 grid size-5 shrink-0 place-items-center text-foreground">
                  <Icon name="sparkles" size={20} stroke={1.5} />
                </span>
                <ColumnTitle>Overview</ColumnTitle>
                <Button variant="secondary" onClick={() => setWork((c) => !c)}>{work ? "Close" : "Open"} chat</Button>
              </ColumnHeader>
              <div className="grid flex-1 place-items-center p-6 text-center text-sm text-muted-foreground">
                The content pane (variant="canvas"). In the Demo the launcher docks here.
              </div>
            </LayoutColumn>
          }
          chat={
            <LayoutColumn as="aside" variant="card">
              {work && (
                <>
                  <ColumnHeader className="gap-2.5 pr-2 pl-5">
                    <ColumnTitle as="h2">Chat</ColumnTitle>
                    <IconButton icon="x" motion="rotate" onClick={() => setWork(false)} aria-label="Close chat" />
                  </ColumnHeader>
                  <div className="grid flex-1 place-items-center p-6 text-center text-sm text-muted-foreground">
                    The chat side panel (the Demo mounts a live &lt;ChatPanel&gt; here).
                  </div>
                </>
              )}
            </LayoutColumn>
          }
        />
      </div>
    </div>
  )
}

function LayoutColumnShowcase() {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {([
        ["card", "nav · agent home · chat"],
        ["canvas", "the content pane"],
        ["plain", "bare, no chrome"],
      ] as const).map(([variant, note]) => (
        <div key={variant}>
          <LayoutColumn variant={variant} className="h-40">
            <ColumnHeader className="px-4">
              <ColumnTitle className="!text-sm">{variant}</ColumnTitle>
            </ColumnHeader>
            <ColumnBody className="px-4 pt-3 text-xs text-muted-foreground">A column body.</ColumnBody>
            <ColumnFooter divider className="px-4 py-2.5 text-xs text-muted-foreground">Footer</ColumnFooter>
          </LayoutColumn>
          <p className="mt-1.5 text-center text-[11px] text-muted-foreground/70">{note}</p>
        </div>
      ))}
    </div>
  )
}

function ColumnHeaderShowcase() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      <div>
        <LayoutColumn variant="card">
          <ColumnHeader className="gap-2.5 px-4">
            <span className="grid size-8 place-items-center rounded-[9px] [corner-shape:squircle] bg-primary text-[13px] font-extrabold text-primary-foreground">L</span>
            <ColumnTitle className="!text-sm">Hairline</ColumnTitle>
            <IconButton icon="chevrons-left" motion="arrow-left" className="ml-auto" aria-label="Collapse" />
          </ColumnHeader>
          <ColumnBody className="px-4 pt-3 text-xs text-muted-foreground">Default — a bottom divider.</ColumnBody>
        </LayoutColumn>
        <p className="mt-1.5 text-center text-[11px] text-muted-foreground/70">{`<ColumnHeader>`}</p>
      </div>
      <div>
        <LayoutColumn variant="canvas">
          <ColumnHeader hairline={false} className="gap-0 px-4">
            <span className="mr-2 grid size-5 place-items-center text-foreground"><Icon name="sparkles" size={20} stroke={1.5} /></span>
            <ColumnTitle className="!text-sm">Flush</ColumnTitle>
          </ColumnHeader>
          <ColumnBody className="px-4 pt-3 text-xs text-muted-foreground">The content header — no divider.</ColumnBody>
        </LayoutColumn>
        <p className="mt-1.5 text-center text-[11px] text-muted-foreground/70">{`hairline={false}`}</p>
      </div>
    </div>
  )
}

function NavListShowcase() {
  return (
    <div className="max-w-xs rounded-xl border border-border-strong bg-card p-3 shadow-card [corner-shape:squircle]">
      <NavList>
        <NavItem icon="sparkles" current>Overview</NavItem>
        <NavItem icon="chart-bar">Portfolio</NavItem>
        <NavItem icon="checklist">Tasks</NavItem>
        <NavItem icon="users">Partners</NavItem>
      </NavList>
    </div>
  )
}

/* ---------------- the layout sections (folded into the Product page) ---------------- */

// The Product page's layout tier: the WorkspaceShell + its column primitives. Not a
// standalone page — the shell is a PRODUCT layout, so it lives under Product.
export function LayoutSections() {
  return (
    <>
      <PageSection
        title="Workspace shell"
        desc="The promoted 4-column workspace: a CSS-grid with custom-prop tracks, drag-to-resize gutters, and responsive drawers. The Demo renders the same components, so a metric changed in workspace.css moves both."
      >
        <PageItem title="The shell — collapse · resize · open chat">
          <ShellDemo />
        </PageItem>
      </PageSection>

      <PageSection
        title="Column primitives"
        desc="The LayoutColumn family that fills the shell's four slots: the column card, its header + title, and the nav list."
      >
        <PageItem title="LayoutColumn" desc="The column card: card · canvas · plain.">
          <LayoutColumnShowcase />
        </PageItem>
        <PageItem title="ColumnHeader + ColumnTitle">
          <ColumnHeaderShowcase />
        </PageItem>
        <PageItem title="NavList" desc="The row gap is one token (--ws-row-gap).">
          <NavListShowcase />
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Every nav list — here, in the Demo, in the shell above — reads its row gap from{" "}
            <code className="rounded bg-subtle px-1 py-0.5 text-[12px]">--ws-row-gap</code>. Bal's "nav-row gap captured
            once": change the token in workspace.css and every list moves together.
          </p>
        </PageItem>
      </PageSection>

      <PageSection title="Contract">
        <ul className="space-y-1.5 text-xs leading-relaxed text-muted-foreground">
          <li>• <b className="text-foreground">Slots, not order.</b> The shell places primaryNav / agentHome / content / chat into the grid and splices the resize gutters between them — columns can't be misordered.</li>
          <li>• <b className="text-foreground">Controlled state.</b> Collapse booleans + the compact drawer flags flow in as props, so the host's own effects (a travelling avatar, a docked launcher) can react to them.</li>
          <li>• <b className="text-foreground">Mechanics stay in the DS.</b> The grid tracks, resize maths, drawer transforms + scrim live in the shell; the host reacts to a drag via <code className="rounded bg-subtle px-1 py-0.5 text-[12px]">onResize</code>.</li>
        </ul>
      </PageSection>
    </>
  )
}
