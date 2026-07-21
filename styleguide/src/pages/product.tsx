import { useState, useRef, type ReactNode } from "react"
import { Button } from "@/components/base/button"
import { Icon } from "@/components/base/icon"
import { NavItem } from "@/components/product/nav-item"
import { Badge } from "@/components/base/badge"
import { Chip } from "@/components/product/chip"
import { CollapsibleSection } from "@/components/product/section"
import { Calendar, DateRangePicker } from "@/components/product/calendar"
import { Launcher } from "@/components/product/launcher"
import { type LauncherApi } from "@/components/product/launcher-engine"
import { PageSection, PageItem, Example } from "../page-kit"
import { LayoutSections } from "./layout"

// Wilson, the reference agent — the avatar is a standalone floating illustration.
const AGENT_AV = "/avatars/wilson.svg"

/* ---------------- Navigation ---------------- */

function NavItemShowcase() {
  return (
    <Example>
      <div className="max-w-xs space-y-0.5">
        <NavItem icon="layout-dashboard" current>Dashboard</NavItem>
        <NavItem icon="checklist" tail={<Badge variant="neutral">4</Badge>}>Tasks</NavItem>
        <NavItem icon="users">Team</NavItem>
        <NavItem icon="settings">Settings</NavItem>
        <NavItem>Text-only row</NavItem>
      </div>
    </Example>
  )
}

function SectionShowcase() {
  return (
    <Example tray="max-w-xs">
      <p className="text-xs text-muted-foreground">Click a title to roll it up; the chevron parks pointing right and a count chip shows what’s hidden.</p>
      <CollapsibleSection label="Dashboards" count={3} organize={() => {}}>
        <div className="flex flex-col gap-0.5 pb-1">
          <NavItem icon="layout-dashboard" tail={<Chip variant="new">3</Chip>}>laticoleathers.com</NavItem>
          <NavItem icon="layout-dashboard" tail={<Chip variant="new">5</Chip>}>gearrush.com</NavItem>
          <NavItem icon="layout-dashboard" tail={<Chip variant="new">2</Chip>}>plushlair.com</NavItem>
        </div>
      </CollapsibleSection>
      <CollapsibleSection label="Context Engine" count={3} defaultCollapsed>
        <div className="flex flex-col gap-0.5 pb-1">
          <NavItem icon="book-2" tail={<Chip>4</Chip>}>The agency SOP</NavItem>
          <NavItem icon="brain" tail={<Chip>8</Chip>}>Client memory</NavItem>
        </div>
      </CollapsibleSection>
    </Example>
  )
}

/* ---------------- Scheduling ---------------- */

function CalendarShowcase() {
  return (
    <Example>
      <div className="flex flex-wrap items-start gap-10">
        <div className="rounded-xl border border-border-strong p-4"><Calendar /></div>
        <div className="w-64 space-y-2"><p className="text-xs text-muted-foreground">Dropdown form</p><DateRangePicker /></div>
      </div>
    </Example>
  )
}

/* ---------------- The launcher (all six morph states in one machine) ---------------- */

function DriverBtn({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <Button variant="secondary" size="sm" onClick={onClick}>
      {children}
    </Button>
  )
}

// The Launcher + Coach mark are the SAME machine: one fixed card + one floating agent
// PNG that morphs between six states (default / input / modal / saving / notif / coach).
// So this is ONE canvas with ONE <Launcher> — driving both the save flow and the
// coach-mark spotlight from a single instance (two would fight over the viewport).
function LauncherShowcase() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const targetLeftRef = useRef<HTMLDivElement>(null)
  const targetTopRef = useRef<HTMLDivElement>(null)
  const [api, setApi] = useState<LauncherApi | null>(null)
  const [saved, setSaved] = useState<string[]>([])
  const [sent, setSent] = useState<string[]>([])

  const coaches = [
    {
      ref: targetLeftRef,
      side: "left" as const,
      title: "Create Dashboards",
      desc: "Create dashboards out of pinned data for yourself or to share with others.",
    },
    {
      ref: targetTopRef,
      side: "top" as const,
      title: "Shape your view",
      desc: "Filter by client, pick a date range, then save the result as a live dashboard.",
    },
  ]

  const dashboards = ["Revenue overview", "Activation funnel", "Weekly digest"]

  return (
    <div>
      <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
        One fixed card + one floating agent PNG that morphs between six states: default, input, modal, saving, the
        positive-green notification, and the coach-mark spotlight. Hover the pill (or press ⌘K) to grow the composer;
        Save-as-Dashboard travels it up into the modal; a coach mark dims + blurs everything except a crisp cutout
        around a target. Drive each state directly:
      </p>
      <div className="mb-4 flex flex-wrap gap-2">
        <DriverBtn onClick={() => api?.toDefault()}>Default</DriverBtn>
        <DriverBtn onClick={() => api?.morphTo("input")}>Input</DriverBtn>
        <DriverBtn onClick={() => api?.openModal()}>Modal</DriverBtn>
        <DriverBtn
          onClick={() =>
            api?.startSaveFlow({
              name: "Revenue overview",
              notifTitle: "New dashboard created",
              notifDesc: 'Your dashboard "Revenue overview" has been saved.',
            })
          }
        >
          Save flow
        </DriverBtn>
        <DriverBtn onClick={() => api?.showNotification("Saved", "Your changes have been saved.")}>Notif</DriverBtn>
        <DriverBtn onClick={() => api?.openCoach(0)}>Coach: dashboards</DriverBtn>
        <DriverBtn onClick={() => api?.openCoach(1)}>Coach: date range</DriverBtn>
      </div>
      <div
        ref={canvasRef}
        className="relative h-[460px] overflow-hidden rounded-xl border border-border-strong bg-canvas [corner-shape:squircle]"
      >
        <div className="flex h-[52px] items-center justify-between gap-2 border-b border-border px-4">
          <span className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Icon name="layout-dashboard" size={18} stroke={1.5} />
            Overview
          </span>
          <div
            ref={targetTopRef}
            className="flex items-center gap-2 rounded-lg border border-border-strong bg-card px-3 py-1.5 text-sm font-semibold text-foreground [corner-shape:squircle]"
          >
            <Icon name="calendar" size={16} stroke={1.5} />
            Last 30 days
            <Icon name="chevron-down" size={15} stroke={1.5} />
          </div>
        </div>
        <div className="flex gap-4 p-4">
          <div
            ref={targetLeftRef}
            className="w-52 shrink-0 rounded-xl border border-border-strong bg-card p-3 [corner-shape:squircle]"
          >
            <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Dashboards</div>
            <div className="flex flex-col gap-0.5">
              {[...dashboards, ...saved].map((d, i) => (
                <div key={`${d}-${i}`} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-foreground">
                  <Icon name="layout-dashboard" size={16} stroke={1.5} />
                  {d}
                </div>
              ))}
            </div>
          </div>
          <div className="min-w-0 flex-1 space-y-1 text-xs text-muted-foreground">
            {sent.map((t, i) => (
              <div key={i} className="truncate">
                You: {t}
              </div>
            ))}
            {sent.length === 0 && <div className="opacity-70">Hover the pill, press ⌘K, or use the buttons above.</div>}
          </div>
        </div>
      </div>
      <Launcher
        agentName="Wilson"
        avatarSrc={AGENT_AV}
        dockRef={canvasRef}
        regionRef={canvasRef}
        coaches={coaches}
        onNewChat={(t) => setSent((s) => [t, ...s].slice(0, 4))}
        onSaveDashboard={(n) => setSaved((s) => [n, ...s])}
        onReady={setApi}
      />
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        The card and the profile pic are the persistent frame that travels + resizes on one bounce; every other part
        builds in on a staggered wave and reverse-builds out quicker. The blur backdrop covers only this pane, so the
        surrounding chrome stays sharp. Reduced motion collapses each morph to an instant swap.
      </p>
    </div>
  )
}

/* ---------------- the page ---------------- */

export function ProductPage() {
  return (
    <>
      <PageSection title="Navigation" desc="The rows and sections that build a sidebar.">
        <PageItem title="Nav item" desc="One row reused by every sidebar / sub-nav list: an icon or text row, a trailing tail (chip / badge), and the current state.">
          <NavItemShowcase />
        </PageItem>
        <PageItem title="Section" desc="A collapsible subsection title: click to roll the body up (the chevron parks right, a count chip shows what's hidden), with an optional Organize action.">
          <SectionShowcase />
        </PageItem>
      </PageSection>

      <PageSection title="Scheduling" desc="Date selection, inline and in a dropdown.">
        <PageItem title="Calendar" desc="The month grid and the date-range picker dropdown form.">
          <CalendarShowcase />
        </PageItem>
      </PageSection>

      <PageSection title="The launcher" desc="The agent's entry point: one persistent card that morphs through every state.">
        <PageItem title="Launcher" desc="One fixed card + one floating agent PNG morphing between six states (default, input, modal, saving, the positive-green notification, and the coach-mark spotlight), all from a single machine.">
          <LauncherShowcase />
        </PageItem>
      </PageSection>

      {/* the layout tier lives here: the WorkspaceShell is a product layout, not web */}
      <LayoutSections />
    </>
  )
}
