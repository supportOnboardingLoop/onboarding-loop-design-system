import * as React from "react"

import { Icon } from "@/components/base/icon"
import { Button } from "@/components/base/button"
import { DateRangePicker } from "@/components/product/calendar"
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownCheckItem,
  DropdownSearch,
  DropdownEmpty,
} from "@/components/product/dropdown"
import { Choices } from "@/components/product/choices"
import { useDemoIdentity } from "../identity"
import { AnalyticsBody } from "./analytics-content"
import { REPORTS, ReportBuild } from "./analytics-reports"
import { makeSeedDashboard } from "./analytics-dashboard"
import type { DemoPreset, SlotProps } from "./types"

// ============================================================================
// ANALYTICS — a CRO-analytics portal. This is the flagship preset: the
// money-ranked insight / portfolio / generated-report content on the Card
// system. It is CONTENT only; it carries no brand and no real client data. The
// public demo shows it in the visitor's chosen skin with invented, generic site
// names (identity.ts DEFAULT_SITES); the Heatmap client build overrides both the
// skin (clients.ts) and the sites, so it reads as the real Heatmap portal.
// ============================================================================

const CHOICE_OPTS = [
  { value: "a", label: "Pull the full revenue-leak report" },
  { value: "b", label: "Compare it against last quarter" },
  { value: "c", label: "Just summarise the top 3 issues" },
]

// who a saved view / dashboard is shared with — used both by the create-dashboard
// modal (accessOptions below) and the dashboard header's Access dropdown.
const ACCESS_OPTS = ["Only myself", "My team", "Everyone at the agency"]

/* the dashboard header's Access control: the SAME multi-select checklist dropdown
   as the create-dashboard modal (checkbox rows, no search), in the header control
   style so it sits alongside the date-range picker. Display-only in the demo. */
function AccessFilter() {
  const [access, setAccess] = React.useState<string[]>(["Only myself"])
  const toggle = (o: string) => setAccess((v) => (v.includes(o) ? v.filter((x) => x !== o) : [...v, o]))
  return (
    <Dropdown>
      <DropdownTrigger className="group/trigger bp-chev-host flex h-[34px] shrink-0 items-center gap-2 rounded-lg [corner-shape:squircle] border border-[var(--ctl-line)] bg-[linear-gradient(180deg,var(--ctl-face),var(--ctl-face-2))] pr-2.5 pl-3.5 text-base font-medium text-[var(--ctl-ink)] shadow-[0_1px_2px_rgba(10,13,18,0.05)] outline-none transition-[border-color,box-shadow,background] hover:border-[var(--ctl-line-hover)] hover:bg-[linear-gradient(180deg,var(--ctl-face),var(--ctl-face-hover))] data-[popup-open]:border-primary data-[popup-open]:shadow-[0_0_0_3px_var(--accent-tint)]">
        <span className="whitespace-nowrap">Access</span>
        <Icon
          name="chevron-down"
          size={18}
          className="bp-chev text-muted-foreground transition-transform duration-200 group-data-[popup-open]/trigger:rotate-180"
        />
      </DropdownTrigger>
      <DropdownContent align="end" className="min-w-[200px]">
        {ACCESS_OPTS.map((o) => (
          <DropdownCheckItem key={o} checked={access.includes(o)} onCheckedChange={() => toggle(o)}>
            {o}
          </DropdownCheckItem>
        ))}
      </DropdownContent>
    </Dropdown>
  )
}

/* the content-header Clients filter: the ONE dropdown (a search field + checkbox
   rows) — a searchable multi-select, same surface / rows / placement as every other
   dropdown. Only the trigger chrome (a secondary-button look) is local. */
function ClientsFilter({
  options,
  value,
  onChange,
}: {
  options: string[]
  value: string[]
  onChange: (v: string[]) => void
}) {
  const [q, setQ] = React.useState("")
  const filtered = options.filter((o) => o.toLowerCase().includes(q.toLowerCase()))
  const label =
    value.length === 0 ? "Clients" : value.length === options.length ? "All clients" : `${value.length} clients`
  const toggle = (o: string) => onChange(value.includes(o) ? value.filter((x) => x !== o) : [...value, o])
  return (
    <Dropdown>
      <DropdownTrigger className="group/trigger bp-chev-host flex h-[34px] shrink-0 items-center gap-2 rounded-[var(--ctl-radius)] [corner-shape:squircle] border border-[#dcdcdc] bg-[linear-gradient(180deg,#fff,#f7f7f7)] pr-2.5 pl-3.5 text-base font-medium text-[#26262a] shadow-[0_1px_2px_rgba(10,13,18,0.05)] outline-none transition-colors hover:border-[#cfcfcf] data-[popup-open]:border-primary data-[popup-open]:shadow-[0_0_0_3px_var(--accent-tint)]">
        <span className="whitespace-nowrap">{label}</span>
        <Icon
          name="chevron-down"
          size={18}
          className="bp-chev text-muted-foreground transition-transform duration-200 group-data-[popup-open]/trigger:rotate-180"
        />
      </DropdownTrigger>
      <DropdownContent
        align="end"
        search={
          <DropdownSearch value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search clients…" autoComplete="off" />
        }
      >
        {filtered.length === 0 ? (
          <DropdownEmpty>No matches</DropdownEmpty>
        ) : (
          filtered.map((o) => (
            <DropdownCheckItem key={o} checked={value.includes(o)} onCheckedChange={() => toggle(o)}>
              {o}
            </DropdownCheckItem>
          ))
        )}
      </DropdownContent>
    </Dropdown>
  )
}

/* the content-header actions cluster. In a DASHBOARD it is just the date range +
   a "Create banner" CTA (the clients filter + "Save as Dashboard" don't apply to a
   saved board). Everywhere else it's the Clients filter + date range + the primary
   "Save as Dashboard" CTA (its dashboard-grid glyph draws itself on hover). The
   clients selection is display-only, so it lives here rather than in the shell. */
function AnalyticsHeaderActions({ ctx }: SlotProps) {
  // the filterable clients are the first few sites of the resolved identity
  // (generic in the public demo, the real portfolio in a client build)
  const { sites } = useDemoIdentity()
  const clientOptions = React.useMemo(() => sites.slice(0, 3).map((s) => s.name), [sites])
  const [clients, setClients] = React.useState<string[]>(() => [...clientOptions])

  if (ctx.selectedDash) {
    return (
      <>
        <DateRangePicker placeholder="30 days" className="!w-auto min-w-[120px]" />
        <AccessFilter />
        <Button variant="secondary" onClick={ctx.openBannerComposer}>
          <Icon name="plus" size={16} />
          Create banner
        </Button>
      </>
    )
  }

  return (
    <>
      <ClientsFilter options={clientOptions} value={clients} onChange={setClients} />
      <DateRangePicker placeholder="30 days" className="!w-auto min-w-[120px]" />
      <Button variant="primary" className="st-content__save" onClick={ctx.openSaveModal}>
        Save as Dashboard
        <span className="st-save-ic" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <rect className="st-db st-db-a" x="4" y="4" width="6" height="8" rx="1.4" />
            <rect className="st-db st-db-b" x="14" y="4" width="6" height="4" rx="1.4" />
            <rect className="st-db st-db-c" x="14" y="12" width="6" height="8" rx="1.4" />
            <rect className="st-db st-db-d" x="4" y="16" width="6" height="4" rx="1.4" />
          </svg>
        </span>
      </Button>
    </>
  )
}

export const analyticsPreset: DemoPreset = {
  id: "analytics",
  label: "Analytics",
  tagline: "A CRO analytics portal",
  pickerIcon: "chart-bar",
  status: "ready",

  brand: { mark: "C", name: "Company" },
  nav: [
    {
      label: "Workspace",
      count: 1,
      items: [
        { id: "Overview", icon: "sparkles", label: "Overview", badge: { text: "4", variant: "new" } },
      ],
    },
    {
      label: "Admin",
      count: 2,
      items: [
        { id: "Tasks", icon: "checklist", label: "Tasks" },
        { id: "Partners", icon: "users", label: "Partners" },
      ],
    },
  ],

  collection: {
    label: "Dashboards",
    itemIcon: "layout-dashboard",
    // boot with ONE populated dashboard (a store-performance board, two tiles
    // already carrying a comment thread). New dashboards start empty; the user
    // fills them by pinning cards. See makeSeedDashboard.
    seed: [],
    seedDashboards: () => [makeSeedDashboard()],
    saveVerb: "Save as Dashboard",
    saveNoun: "Dashboard",
  },
  seedSavedChats: [{ id: "saved-setup", title: "Workspace Setup", firstText: "Help me set up my workspace", saved: true }],
  seedRecentChats: [{ id: "seed-onb", title: "New User Onboarding", firstText: "Walk me through new user onboarding" }],
  contextEngine: {
    label: "Context Engine",
    items: [
      { icon: "book-2", label: "The agency SOP", count: 4 },
      { icon: "brain", label: "Client memory", count: 8 },
      { icon: "chart-bar", label: "Evidence & benchmarks", count: 7 },
    ],
  },

  content: {
    title: "Overview",
    icon: "sparkles",
    HeaderActions: AnalyticsHeaderActions,
    Body: AnalyticsBody,
  },

  accessOptions: ACCESS_OPTS,
  // Coach-marks temporarily disabled (Bal, 2026-07-21). The spotlight/tooltip
  // machinery is untouched; re-enable by uncommenting the two entries below.
  // (target "collection" = Dashboards sub-nav, arrow left; "actions" =
  // content-header actions, arrow top.)
  coaches: [
    // {
    //   target: "collection",
    //   side: "left",
    //   title: "Create Dashboards",
    //   desc: "Create dashboards out of pinned data for yourself or to share with others.",
    // },
    // {
    //   target: "actions",
    //   side: "top",
    //   title: "Filter, then save your view",
    //   desc: "Filter by client and date range, then save the current view as a dashboard.",
    // },
  ],

  // The agent offers the A/B/C choice, then BUILDS the picked report: a "building"
  // message + progress, then a "ready" CTA that opens the report in the content area.
  conversation: {
    respond: (api, _text, actions) => {
      api
        .think("Great question. Here are a few ways I can dig into that:", { loops: 1 })
        .then(() =>
          api.ask((done) => (
            <Choices options={CHOICE_OPTS} onValueChange={(v) => done(CHOICE_OPTS.find((o) => o.value === v)?.label ?? v)} />
          ))
        )
        .then((echo) => {
          const rep = REPORTS[CHOICE_OPTS.find((o) => o.label === echo)?.value ?? ""]
          if (!rep) return
          // think for a beat, reveal the "building" message, THEN start the progress
          api
            .think(`On it. I'm building out your ${rep.name} now, pulling the numbers across the selected sites.`, { loops: 1 })
            .then(() => api.ask(() => <ReportBuild rep={rep} onOpen={() => actions?.openReport?.(rep.id, rep.name)} />, { echo: false }))
        })
    },
  },
}
