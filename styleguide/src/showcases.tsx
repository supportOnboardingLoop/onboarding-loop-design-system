import { useState, useRef, type ReactNode } from "react"
import { Button } from "@/components/base/button"
import { IconButton } from "@/components/base/icon-button"
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownCheckItem,
  DropdownSearch,
  DropdownEmpty,
} from "@/components/product/dropdown"
import { Input } from "@/components/base/input"
import { Label } from "@/components/base/label"
import { Textarea } from "@/components/base/textarea"
import { Separator } from "@/components/base/separator"
import { Badge } from "@/components/base/badge"
import { Checkbox } from "@/components/base/checkbox"
import { Checkmark } from "@/components/base/checkmark"
import { Icon, BP_ICONS, type IconName } from "@/components/base/icon"
import { ScrollArea } from "@/components/base/scroll-area"
import { Card, CardSurface, CardHeader, CardFooter, CardTitle, CardDescription, CardContent } from "@/components/base/card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel } from "@/components/base/select"
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
import { CtaRow } from "@/components/product/cta"
import { Progress } from "@/components/product/progress"
import { Score } from "@/components/product/score"
import { Chatbar, Composer, SuggestionChips, SuggestionChip } from "@/components/product/composer"
import { ChecklistItem } from "@/components/product/checklist-item"
import { PanelHeader } from "@/components/product/card-header"
import { Calendar, DateRangePicker } from "@/components/product/calendar"
import { Choices } from "@/components/product/choices"
import { BadgeSelect } from "@/components/product/badge-select"
import { Slider } from "@/components/product/slider"
import { AgentTooltip } from "@/components/product/tooltip"
import { ResourceCenter } from "@/components/product/resource-center"
import { Chip, StatusBadge } from "@/components/product/chip"
import { CollapsibleSection } from "@/components/product/section"
import { MessageRow, Bubble, AgentAvatar, UserAvatar } from "@/components/product/message-row"
import { Thinking } from "@/components/product/thinking"
import { ConversationDivider } from "@/components/product/conversation-divider"
import { ConversationChecklist } from "@/components/product/conversation-checklist"
import { ModelPicker, ModelChip } from "@/components/product/model-picker"
import { Conversation, type ConvoStep } from "@/components/product/conversation"
import { Launcher } from "@/components/product/launcher"
import { type LauncherApi } from "@/components/product/launcher-engine"

/* ---------------- shared layout bits ---------------- */

function Block({ title, children }: { title?: string; children: ReactNode }) {
  // a titled Block is an anchorable section too — the sub-nav "on this page" rail
  // falls back to these on pages that have no GroupHeaders (see App.tsx).
  const anchor = title ? { id: sectionId(title), "data-section-anchor": "block", "data-section-title": title } : {}
  return (
    <section {...anchor} className="mb-10 scroll-mt-4">
      {title && <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</h2>}
      {children}
    </section>
  )
}
function Rows({ children }: { children: ReactNode }) {
  return <div className="rounded-xl border border-border-strong bg-card px-5 shadow-card">{children}</div>
}
function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-4 border-b border-border py-3.5 last:border-b-0">
      <div className="w-28 shrink-0 text-xs font-medium text-muted-foreground">{label}</div>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  )
}
function Demo({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl border border-border-strong bg-card p-6 shadow-card ${className}`}>{children}</div>
}

/* ---------------- foundations ---------------- */

// The ordered neutral ramp (light → dark). ONE scale; the brand tints it.
const neutralScale = [
  "neutral-0", "neutral-12", "neutral-25", "neutral-50", "neutral-100", "neutral-200", "neutral-300", "neutral-400",
  "neutral-500", "neutral-600", "neutral-700", "neutral-750", "neutral-800", "neutral-900", "neutral-950",
]
// Layout roles: the readable vocabulary, each pointing at one scale step.
const surfaceRoles: [string, string][] = [
  ["background", "the page behind everything · row + control hover fill"],
  ["surface", "cards · panels · menus · popovers"],
  ["canvas", "card tray / footer · selected-row fill (a step darker than the background)"],
  ["subtle", "quiet fills · secondary button · muted chip"],
  ["border", "hairline · card / divider · selected-row ring"],
  ["edge", "crisp control edge · field / button / menu"],
]
const textRoles: [string, string][] = [
  ["icon", "leading icons · section headers ('Dashboards')"],
  ["text-muted", "secondary + meta text"],
  ["text", "body ink"],
  ["primary", "the brand — the only role that carries hue on purpose"],
]
const statusRoles = ["success", "warning", "destructive", "info"]
// shadcn aliases kept so Tailwind utilities keep resolving.
const aliases = "card → surface · background → neutral-12 · muted / secondary / accent → subtle · muted-foreground → text-muted · foreground → text · border-strong / input → edge"

function ScaleChip({ token }: { token: string }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div className="h-16 w-11 rounded-lg border border-border-strong [corner-shape:squircle]" style={{ background: `var(--${token})` }} />
      <div className="text-[10px] font-medium tabular-nums text-muted-foreground">{token.replace("neutral-", "")}</div>
    </div>
  )
}
function RoleSwatch({ token, use }: { token: string; use: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="size-11 shrink-0 rounded-lg border border-border-strong [corner-shape:squircle]" style={{ background: `var(--${token})` }} />
      <div className="min-w-0">
        <div className="font-mono text-xs font-semibold">{token}</div>
        <div className="text-[11px] leading-snug text-muted-foreground">{use}</div>
      </div>
    </div>
  )
}
function StatusSwatch({ role }: { role: string }) {
  return (
    <div className="w-24">
      <div className="h-14 rounded-md border border-border-strong" style={{ background: `var(--${role})` }} />
      <div className="mt-1.5 text-[11px] font-medium">{role}</div>
    </div>
  )
}
function ColorsShowcase() {
  return (
    <div>
      <Block title="Neutral scale · light → dark">
        <Demo>
          <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
            One ordered ramp. Each step holds a fixed lightness and borrows its hue from the brand, so a grey brand stays
            perfectly neutral and a coloured brand leans the whole ramp a hair its way. Switch the Brand in the sidebar
            (or paste a Neutral&nbsp;tint) to watch it move.
          </p>
          <div className="flex flex-wrap gap-2">{neutralScale.map((t) => <ScaleChip key={t} token={t} />)}</div>
        </Demo>
      </Block>
      <Block title="Roles · surfaces & lines">
        <Demo>
          <div className="grid gap-4 sm:grid-cols-2">{surfaceRoles.map(([t, u]) => <RoleSwatch key={t} token={t} use={u} />)}</div>
          <p className="mt-5 border-t border-border pt-4 text-[11px] leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">Depth.</span> The page background is the lightest step; a card's
            tray + footer sit one step darker (<span className="font-mono">canvas</span>) and its content wells are white
            (<span className="font-mono">surface</span>), so a card reads as a recessed tray holding raised wells. A row's
            hover borrows the background (lighter); the selected row borrows canvas (a step darker).
          </p>
        </Demo>
      </Block>
      <Block title="Roles · text & icons">
        <Demo>
          <div className="grid gap-4 sm:grid-cols-2">{textRoles.map(([t, u]) => <RoleSwatch key={t} token={t} use={u} />)}</div>
          <p className="mt-5 border-t border-border pt-4 text-[11px] leading-relaxed text-muted-foreground">
            <span className="font-semibold text-foreground">Aliases</span> (kept for utilities): {aliases}
          </p>
        </Demo>
      </Block>
      <Block title="Status · functional (the only hues)">
        <div className="flex flex-wrap gap-3">{statusRoles.map((r) => <StatusSwatch key={r} role={r} />)}</div>
      </Block>
    </div>
  )
}

function IconsShowcase() {
  const names = Object.keys(BP_ICONS) as IconName[]
  return (
    <Demo>
      <p className="mb-5 text-xs text-muted-foreground">Tabler outline set, ported from <code className="text-foreground">kit/icons.js</code>. Hover a cell to draw the strokes in.</p>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(88px,1fr))] gap-2">
        {names.map((n) => (
          <div key={n} className="bp-ico-host flex flex-col items-center gap-2 rounded-lg border border-border p-3 text-center transition-colors hover:border-border-strong">
            <Icon name={n} size={22} draw className="text-foreground" />
            <span className="text-[10px] text-muted-foreground">{n}</span>
          </div>
        ))}
      </div>
    </Demo>
  )
}

/* ---------------- base ---------------- */

const variants = ["primary", "secondary", "tertiary", "ghost", "destructive", "link"] as const

function ButtonShowcase() {
  return (
    <div>
      <Block title="Variants">
        <Rows>{variants.map((v) => <Row key={v} label={v}><Button variant={v}>Button</Button><Button variant={v}>Get started</Button></Row>)}</Rows>
      </Block>
      <Block title="Sizes">
        <Rows>
          <Row label="default"><Button>Button</Button><Button variant="secondary">Secondary</Button></Row>
          <Row label="sm"><Button size="sm">Button</Button><Button size="sm" variant="secondary">Secondary</Button></Row>
          <Row label="icon"><Button size="icon" aria-label="Add"><Icon name="plus" /></Button><Button size="icon-sm" variant="secondary" aria-label="Add"><Icon name="plus" /></Button></Row>
        </Rows>
      </Block>
      <Block title="Icon behaviors (hover me)">
        <Rows>
          <Row label="reveal icon"><Button revealIcon="arrow-right">Continue</Button><Button variant="secondary" revealIcon="arrow-right">Next step</Button></Row>
          <Row label="reveal · leading"><Button variant="secondary" revealIcon="arrow-left" revealIconSide="leading">Previous</Button></Row>
          <Row label="reveal label"><Button size="icon" revealLabel="Send" aria-label="Send" className="bp-ico-host"><Icon name="send" loop="fly" /></Button><Button variant="secondary" size="icon" revealLabel="Save" aria-label="Save" className="bp-ico-host"><Icon name="device-floppy" /></Button></Row>
          <Row label="nav tier"><div className="w-52"><Button variant="nav" data-current>Dashboard</Button><Button variant="nav">Settings</Button></div></Row>
        </Rows>
      </Block>
      <Block title="Icon button (close / expand — hover me)">
        <Rows>
          <Row label="close"><IconButton icon="x" motion="rotate" aria-label="Close" /></Row>
          <Row label="collapse / expand"><IconButton icon="chevrons-left" motion="arrow-left" aria-label="Collapse" /><IconButton icon="chevrons-right" motion="arrow-right" aria-label="Expand" /></Row>
        </Rows>
      </Block>
      <Block title="States">
        <Rows>
          <Row label="disabled"><Button disabled>Button</Button><Button variant="secondary" disabled>Secondary</Button></Row>
          <Row label="invalid"><Button aria-invalid>Button</Button></Row>
        </Rows>
      </Block>
    </div>
  )
}

function InputShowcase() {
  return (
    <Demo>
      <div className="max-w-sm space-y-4">
        <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" type="email" placeholder="you@example.com" /></div>
        <div className="space-y-1.5"><Label htmlFor="filled">Filled (600)</Label><Input id="filled" defaultValue="Ada Lovelace" placeholder="Name" /></div>
        <div className="space-y-1.5"><Label htmlFor="disabled-input">Disabled</Label><Input id="disabled-input" placeholder="Disabled" disabled /></div>
        <div className="space-y-1.5"><Label htmlFor="invalid-input">Invalid</Label><Input id="invalid-input" defaultValue="not-an-email" aria-invalid /></div>
      </div>
    </Demo>
  )
}
function LabelShowcase() {
  return <Demo><div className="max-w-sm space-y-1.5"><Label htmlFor="name">Full name</Label><Input id="name" placeholder="Ada Lovelace" /><p className="text-xs text-muted-foreground">Labels are 14px, 600, and pair with any control.</p></div></Demo>
}
function SelectShowcase() {
  return (
    <Demo className="flex flex-wrap items-start gap-8">
      <div className="w-56">
        <Select defaultValue="Banana">
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Apple">Apple</SelectItem>
            <SelectItem value="Banana">Banana</SelectItem>
            <SelectItem value="Cherry">Cherry</SelectItem>
            <SelectItem value="Dragonfruit">Dragonfruit</SelectItem>
            <SelectItem value="Elderberry">Elderberry</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="w-48">
        <Select size="sm" defaultValue="Weekly">
          <SelectTrigger size="sm"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Daily">Daily</SelectItem>
            <SelectItem value="Weekly">Weekly</SelectItem>
            <SelectItem value="Monthly">Monthly</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </Demo>
  )
}

// A small caption under a demo card, naming its configuration.
function Caption({ children }: { children: ReactNode }) {
  return <p className="mt-3 text-xs font-medium text-muted-foreground">{children}</p>
}

// A positive-trend sparkline for the stat surface (green like the Figma).
function Sparkline() {
  const line = "M0 44 L13 40 L26 42 L39 30 L52 33 L65 21 L78 25 L91 11 L104 6 L112 3"
  return (
    <svg width="112" height="56" viewBox="0 0 112 56" fill="none" className="shrink-0" aria-hidden>
      <path d={`${line} L112 56 L0 56 Z`} fill="url(#spark)" opacity="0.16" />
      <path d={line} stroke="var(--success)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="104" cy="6" r="4" fill="var(--surface)" stroke="var(--success)" strokeWidth="2" />
      <defs>
        <linearGradient id="spark" x1="0" y1="0" x2="0" y2="56" gradientUnits="userSpaceOnUse">
          <stop stopColor="var(--success)" />
          <stop offset="1" stopColor="var(--success)" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  )
}

// A neutral range-band area chart, to show a Surface holding a big chart.
function AreaChart() {
  const upper = "M0 118 C120 108 200 96 320 82 C440 68 560 58 800 40"
  const mid = "M0 150 C120 146 220 140 320 132 C440 122 560 116 800 104"
  const lower = "M0 190 C120 188 200 184 320 176 C460 168 600 160 800 150"
  return (
    <svg viewBox="0 0 800 240" preserveAspectRatio="none" className="h-52 w-full" aria-hidden>
      {[40, 90, 140, 190].map((y) => (
        <line key={y} x1="0" y1={y} x2="800" y2={y} stroke="var(--border)" strokeWidth="1" />
      ))}
      <path d={`${upper} L800 150 C560 156 440 158 320 162 C200 166 120 168 0 170 Z`} fill="var(--subtle)" opacity="0.7" />
      <path d={upper} stroke="var(--chart-2)" strokeWidth="2" fill="none" vectorEffect="non-scaling-stroke" />
      <path d={mid} stroke="var(--chart-4)" strokeWidth="2" fill="none" vectorEffect="non-scaling-stroke" />
      <path d={lower} stroke="var(--chart-2)" strokeWidth="2" fill="none" vectorEffect="non-scaling-stroke" />
    </svg>
  )
}

// Reusable stat content that sits inside a Surface.
function StatContent() {
  return (
    <>
      <div className="flex flex-col gap-0.5">
        <CardTitle>Team members</CardTitle>
        <CardDescription>Manage your team and their account permissions.</CardDescription>
      </div>
      <div className="flex items-end justify-between gap-4">
        <div className="flex flex-col gap-2.5">
          <div className="text-3xl leading-none font-semibold tracking-[-0.01em] text-foreground">2,000</div>
          <div className="flex items-center gap-1.5 text-base">
            <Icon name="trending-up" size={16} className="text-success" />
            <span className="font-medium text-success">100%</span>
            <span className="text-muted-foreground">vs last month</span>
          </div>
        </div>
        <Sparkline />
      </div>
    </>
  )
}

const jaimie = (
  <span className="grid size-9 place-items-center rounded-full [corner-shape:round] bg-primary text-xs font-semibold text-primary-foreground">
    J
  </span>
)

function CardShowcase() {
  return (
    <div className="space-y-8">
      <Demo className="space-y-6">
        {/* Full anatomy: header + one surface + footer, full width to breathe */}
        <div className="mx-auto max-w-xl">
          <Card>
            <CardHeader title="Team members" onClose={() => {}} action={<IconButton icon="dots-vertical" motion="rotate" size={32} aria-label="More" />} />
            <CardSurface>
              <StatContent />
            </CardSurface>
            <CardFooter avatar={jaimie} name="Jaimie" role="AI Assistant" action={<><Button size="sm" variant="secondary">Secondary</Button><Button size="sm">Primary</Button></>} />
          </Card>
          <Caption>Header · surface · footer: the full anatomy</Caption>
        </div>

        <div className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
          {/* Header only, action inside the surface */}
          <div>
            <Card>
              <CardHeader title="Team members" onClose={() => {}} />
              <CardSurface className="gap-0 p-0">
                <div className="flex flex-col gap-3 p-6">
                  <StatContent />
                </div>
                <div className="flex items-center justify-end border-t border-border px-6 py-3.5">
                  <Button size="sm" variant="tertiary" revealIcon="arrow-right">View report</Button>
                </div>
              </CardSurface>
            </Card>
            <Caption>Header only, footer hidden</Caption>
          </div>

          {/* No chrome: the degenerate "simple card" */}
          <div>
            <Card>
              <CardSurface>
                <CardTitle>Weekly digest</CardTitle>
                <CardDescription>A summary of what shipped this week.</CardDescription>
                <CardContent>With no header or footer, the tray is a uniform 4px gray gutter around one surface.</CardContent>
              </CardSurface>
            </Card>
            <Caption>No chrome: a single surface (today’s “simple card”)</Caption>
          </div>

          {/* Multiple surfaces stacked in one tray */}
          <div>
            <Card>
              <CardHeader title="This week" onClose={() => {}} />
              <CardSurface>
                <CardTitle>Signups</CardTitle>
                <div className="text-3xl leading-none font-semibold tracking-[-0.01em] text-foreground">1,204</div>
              </CardSurface>
              <CardSurface>
                <CardTitle>Active users</CardTitle>
                <div className="text-3xl leading-none font-semibold tracking-[-0.01em] text-foreground">842</div>
              </CardSurface>
              <CardFooter title="Updated just now" />
            </Card>
            <Caption>Multiple surfaces, grouped in one tray</Caption>
          </div>
        </div>
      </Demo>

      {/* Wide: a surface holding a big chart */}
      <Demo>
        <Card>
          <CardHeader title="Active users" onClose={() => {}} action={<><IconButton icon="pin-filled" motion="rotate" size={36} iconSize={18} aria-label="Pin" /></>} />
          <CardSurface>
            <div className="flex flex-col gap-0.5">
              <CardTitle>Active users</CardTitle>
              <CardDescription>Monthly active users across the year.</CardDescription>
            </div>
            <AreaChart />
          </CardSurface>
          <CardFooter title="Jan – Dec 2026" action={<><Button size="sm" variant="secondary">Export</Button><Button size="sm">View report</Button></>} />
        </Card>
        <Caption>Responsive: the surface stretches to hold a full-width chart</Caption>
      </Demo>
    </div>
  )
}
function BadgeShowcase() {
  return (
    <Demo className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">Status pills</p>
        <div className="flex flex-wrap gap-2"><Badge variant="neutral">Neutral</Badge><Badge variant="success">Active</Badge><Badge variant="warning">Pending</Badge><Badge variant="error">Failed</Badge></div>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">Status badges (dot)</p>
        <div className="flex flex-wrap items-center gap-3"><StatusBadge tone="success">Online</StatusBadge><StatusBadge tone="warning">Needs review</StatusBadge><StatusBadge tone="info">Syncing</StatusBadge><StatusBadge tone="destructive">Offline</StatusBadge></div>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">Count chips</p>
        <div className="flex flex-wrap items-center gap-3"><Chip>4</Chip><Chip variant="new">3</Chip><Chip variant="new">Healthy</Chip><Chip variant="warn">2</Chip></div>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-semibold tracking-widest text-muted-foreground uppercase">Nav tails, in context</p>
        <div className="max-w-xs space-y-0.5">
          <NavItem icon="sparkles" current tail={<Chip variant="new">4</Chip>}>Overview</NavItem>
          <NavItem icon="chart-bar" tail={<Chip variant="new">Healthy</Chip>}>Portfolio</NavItem>
          <NavItem icon="checklist" tail={<StatusBadge tone="success">Online</StatusBadge>}>Settings</NavItem>
        </div>
      </div>
    </Demo>
  )
}
function CheckboxShowcase() {
  return (
    <Demo>
      <div className="flex flex-wrap items-center gap-6">
        <label className="flex items-center gap-2 text-base"><Checkbox defaultChecked /> Checked</label>
        <label className="flex items-center gap-2 text-base"><Checkbox /> Unchecked</label>
        <label className="flex items-center gap-2 text-base"><Checkbox disabled /> Disabled</label>
      </div>
    </Demo>
  )
}
function CheckmarkShowcase() {
  return (
    <Demo>
      <div className="flex flex-wrap items-center gap-8">
        <div className="flex flex-col items-center gap-2"><Checkmark filled /><span className="text-[11px] text-muted-foreground">filled disc</span></div>
        <div className="flex flex-col items-center gap-2"><Checkmark filled={false} /><span className="text-[11px] text-muted-foreground">outline ring</span></div>
      </div>
    </Demo>
  )
}
function TextareaShowcase() {
  return <Demo><div className="max-w-sm space-y-4"><Textarea placeholder="Write something…" /><Textarea placeholder="Disabled" disabled /><Textarea defaultValue="Invalid value" aria-invalid /></div></Demo>
}
function SeparatorShowcase() {
  return (
    <Demo>
      <div className="max-w-sm text-xs">
        <p className="py-1">Section one</p><Separator /><p className="py-1">Section two</p><Separator strong /><p className="py-1">After a strong divider</p>
        <div className="mt-4 flex h-8 items-center gap-4"><span>Left</span><Separator orientation="vertical" /><span>Middle</span><Separator orientation="vertical" /><span>Right</span></div>
      </div>
    </Demo>
  )
}
function ScrollAreaShowcase() {
  return (
    <Demo className="space-y-3">
      <ScrollArea className="h-40 w-64 rounded-lg border border-border-strong">
        <div className="space-y-2 p-3 text-xs">
          {Array.from({ length: 20 }).map((_, i) => (
            <p key={i}>Scrollable line {i + 1}</p>
          ))}
        </div>
      </ScrollArea>
      <p className="max-w-md text-xs leading-relaxed text-muted-foreground">
        The one scrollbar the whole product uses, and where it lives: a 2px thumb, invisible at rest,
        revealed only while you scroll. It's global — every overflowing surface (nav, sub-nav, content,
        menus) gets it automatically via <code className="text-[11px]">.scroll-thin</code> + the shared
        reveal-on-scroll behavior.
      </p>
    </Demo>
  )
}

/* ---------------- product ---------------- */

function NavItemShowcase() {
  return (
    <Demo>
      <div className="max-w-xs space-y-0.5">
        <NavItem icon="layout-dashboard" current>Dashboard</NavItem>
        <NavItem icon="checklist" tail={<Badge variant="neutral">4</Badge>}>Tasks</NavItem>
        <NavItem icon="users">Team</NavItem>
        <NavItem icon="settings">Settings</NavItem>
        <NavItem>Text-only row</NavItem>
      </div>
    </Demo>
  )
}
function CtaShowcase() {
  return (
    <Demo className="max-w-sm space-y-4">
      <CtaRow><Button variant="secondary">Skip</Button><Button>Start</Button></CtaRow>
      <CtaRow split><Button variant="ghost">Back</Button><Button revealIcon="arrow-right">Next</Button></CtaRow>
    </Demo>
  )
}
function ProgressShowcase() {
  return <Demo className="max-w-sm space-y-6"><Progress label="Building your dashboard" value={40} /><Progress label="Done" value={100} /></Demo>
}
function ScoreShowcase() {
  return (
    <div>
      <Block title="Standalone">
        <Demo className="max-w-md"><Score options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]} value={8} ends={["Not likely", "Very likely"]} /></Demo>
      </Block>
      <Block title="In a conversation (echoes the score as your chip)">
        <Demo>
          <EchoDemo
            question="How likely are you to recommend us, 1 to 10?"
            render={(echo) => (
              <Score options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]} ends={["Not likely", "Very likely"]} onValueChange={(v) => echo(`${v} out of 10`)} />
            )}
          />
        </Demo>
      </Block>
    </div>
  )
}
function ComposerShowcase() {
  return (
    <Demo className="max-w-md space-y-5">
      <Chatbar placeholder="Ask me anything…" />
      <Composer />
      <SuggestionChips><SuggestionChip>Show me an example</SuggestionChip><SuggestionChip>What can you do?</SuggestionChip><SuggestionChip>Skip</SuggestionChip></SuggestionChips>
    </Demo>
  )
}
function ChecklistShowcase() {
  return (
    <Demo className="max-w-sm px-0">
      <ChecklistItem state="done" label="Connect your store" />
      <ChecklistItem state="open" label="Invite your team" description="Add teammates so they can pick up conversations with you." action={<CtaRow><Button size="sm" variant="secondary">Skip</Button><Button size="sm">Start</Button></CtaRow>} />
      <ChecklistItem state="todo" label="Set your goals" />
      <ChecklistItem state="todo" label="Publish your first campaign" />
    </Demo>
  )
}
function CardHeaderShowcase() {
  const avatar = <span className="grid size-8 place-items-center rounded-full bg-secondary text-xs font-bold text-foreground">W</span>
  return (
    <Demo className="space-y-5">
      <div className="max-w-xs overflow-hidden rounded-xl border border-border-strong shadow-card">
        <PanelHeader variant="accent" avatar={avatar} name="Wilson" role="Onboarding guide" heading="Let's get you set up" onClose={() => {}} progress={{ value: 40, count: "2/5" }} />
        <div className="p-4 text-sm text-muted-foreground">Body content goes here.</div>
      </div>
      <div className="max-w-xs overflow-hidden rounded-xl border border-border-strong shadow-card">
        <PanelHeader variant="plain" avatar={avatar} name="Wilson" role="Onboarding guide" heading="Click the settings icon" onClose={() => {}} />
        <div className="px-5 py-4 text-sm text-muted-foreground">A plain (white) header for the explainer tooltip.</div>
      </div>
    </Demo>
  )
}

function CalendarShowcase() {
  return (
    <Demo className="flex flex-wrap items-start gap-10">
      <div className="rounded-xl border border-border-strong p-4"><Calendar /></div>
      <div className="w-64 space-y-2"><p className="text-xs text-muted-foreground">Dropdown form</p><DateRangePicker /></div>
    </Demo>
  )
}

const avatarW = <span className="grid size-8 place-items-center rounded-full bg-secondary text-xs font-bold text-foreground">W</span>

/* ---------- agent-tier shared bits ---------- */
// Wilson, the reference agent (matches the docs + starter layout). The avatar is
// a standalone floating illustration on the standardized 64x75 canvas (disc full
// width, bottom-anchored, head overflows up); the .bp-fig-avatar slot never clips it.
const AGENT_AV = "/avatars/wilson.svg"

// The canonical "answer widget as a conversation child" pattern: the agent asks
// in a bubble, the widget sits under it, and answering echoes the pick back as
// the user's own chip below — exactly what the live engine does with user().
function EchoDemo({ question, render }: { question: string; render: (echo: (t: string) => void) => ReactNode }) {
  const [reply, setReply] = useState<string | null>(null)
  return (
    <div className="bp-chat mx-auto w-full max-w-md">
      <MessageRow side="agent" avatar={<AgentAvatar src={AGENT_AV} />} name="Wilson" role="CRO expert" time="now">
        <Bubble>{question}</Bubble>
        <div className="bp-answer">{render(setReply)}</div>
      </MessageRow>
      {reply && (
        <MessageRow side="user" avatar={<UserAvatar />} name="You" time="now">
          <Bubble side="user">{reply}</Bubble>
        </MessageRow>
      )}
    </div>
  )
}

const SENTIMENT = ["Do it myself", "Mostly me", "A mix", "Mostly you", "Just get the result"]
const readSentiment = (v: number) => SENTIMENT[Math.min(4, Math.floor(v / 20))]

// the slider answer needs a confirm (a slider has no discrete tap-to-pick)
function SliderAnswer({ onConfirm }: { onConfirm: (t: string) => void }) {
  const [v, setV] = useState(70)
  return (
    <div className="space-y-3">
      <Slider plain value={v} onValueChange={setV} readFor={readSentiment} />
      <Button className="w-full" revealIcon="arrow-right" onClick={() => onConfirm(readSentiment(v))}>Lock it in</Button>
    </div>
  )
}

const CHOICE_OPTS = [
  { value: "a", label: "Do it for me end to end" },
  { value: "b", label: "Guide me step by step" },
  { value: "c", label: "Just point me to the docs" },
]
function ChoicesShowcase() {
  return (
    <div>
      <Block title="Standalone">
        <Demo className="max-w-md"><Choices defaultValue="b" options={CHOICE_OPTS} /></Demo>
      </Block>
      <Block title="In a conversation (echoes the pick as your chip)">
        <Demo>
          <EchoDemo
            question="How hands-on do you want me to be?"
            render={(echo) => (
              <Choices options={CHOICE_OPTS} onValueChange={(v) => echo(String(CHOICE_OPTS.find((o) => o.value === v)?.label))} />
            )}
          />
        </Demo>
      </Block>
    </div>
  )
}
const CHANNEL_OPTS = [
  { value: "email", label: "Email" },
  { value: "chat", label: "Live chat" },
  { value: "sms", label: "SMS" },
  { value: "social", label: "Social" },
  { value: "phone", label: "Phone" },
]
function BadgeSelectShowcase() {
  return (
    <div>
      <Block title="Standalone">
        <Demo className="max-w-md"><BadgeSelect defaultValue={["email", "chat"]} confirmLabel="Confirm channels" options={CHANNEL_OPTS} /></Demo>
      </Block>
      <Block title="In a conversation (echoes the picks as your chip)">
        <Demo>
          <EchoDemo
            question="Which channels should I set up? Pick all that apply."
            render={(echo) => (
              <BadgeSelect
                options={CHANNEL_OPTS}
                confirmLabel="Confirm channels"
                onConfirm={(vals) => echo(vals.map((v) => CHANNEL_OPTS.find((o) => o.value === v)?.label).join(", "))}
              />
            )}
          />
        </Demo>
      </Block>
    </div>
  )
}
function SliderShowcase() {
  return (
    <div>
      <Block title="Standalone">
        <Demo className="max-w-md space-y-8">
          <div className="space-y-2"><p className="text-xs text-muted-foreground">Sentiment</p><Slider defaultValue={70} /></div>
          <div className="space-y-2"><p className="text-xs text-muted-foreground">Plain (neutral scale)</p><Slider plain defaultValue={50} readFor={readSentiment} /></div>
        </Demo>
      </Block>
      <Block title="In a conversation (echoes the reading as your chip)">
        <Demo>
          <EchoDemo question="How much of this should I handle for you?" render={(echo) => <SliderAnswer onConfirm={echo} />} />
        </Demo>
      </Block>
    </div>
  )
}
function TooltipShowcase() {
  return (
    <Demo className="flex min-h-52 items-center justify-center">
      <AgentTooltip defaultOpen side="top" avatar={avatarW} name="Wilson" role="Onboarding guide" content="Click the settings icon to connect your first data source.">
        <span className="inline-flex h-9 items-center rounded-lg border border-border-strong bg-card px-3 text-sm font-medium">Anchor element</span>
      </AgentTooltip>
    </Demo>
  )
}
function ResourceCenterShowcase() {
  return (
    <Demo className="flex justify-center">
      <ResourceCenter
        avatar={avatarW}
        name="Wilson"
        role="Onboarding guide"
        heading="How can I help?"
        onClose={() => {}}
        sections={[
          { label: "Get started", options: [{ icon: "book-2", label: "Read the quickstart" }, { icon: "checklist", label: "Finish setup" }] },
          { label: "Learn more", options: [{ icon: "users", label: "Join the academy" }, { icon: "lifebuoy", label: "Contact support", trailing: "external-link" }] },
        ]}
      />
    </Demo>
  )
}

/* ---------- agent tier: the conversation surface ---------- */

function MessageRowShowcase() {
  return (
    <div>
      <Block title="A turn each way">
        <Demo>
          <div className="bp-chat mx-auto w-full max-w-md">
            <MessageRow side="agent" avatar={<AgentAvatar src={AGENT_AV} />} name="Wilson" role="CRO expert" time="Monday 9:41am">
              <Bubble>Want me to set up your first heatmap?</Bubble>
            </MessageRow>
            <MessageRow side="user" avatar={<UserAvatar />} name="You" time="Monday 9:41am">
              <Bubble side="user">Yes please.</Bubble>
            </MessageRow>
          </div>
        </Demo>
      </Block>
      <p className="text-xs leading-relaxed text-muted-foreground">
        A row is an avatar, a small head (name · role · time), and a bubble. The agent sits left with its
        avatar a floating illustration; you sit right with an initials circle. Speakers read by side and tail,
        never by a loud fill.
      </p>
    </div>
  )
}

function BubblesShowcase() {
  return (
    <div>
      <Block title="Bot · user · chip">
        <Demo>
          <div className="mx-auto flex w-full max-w-md flex-col gap-3">
            <Bubble>A bot bubble: neutral grey, squared toward the avatar on the left.</Bubble>
            <Bubble side="user">A user bubble: a shade darker, squared toward the right.</Bubble>
            <Bubble side="user">Guide me step by step</Bubble>
          </div>
        </Demo>
      </Block>
      <p className="text-xs leading-relaxed text-muted-foreground">
        The third is the same user bubble used as a "chip" — the short echo the engine drops in when you pick an
        answer widget. Both bubbles run full width so their edges line up with the timestamp and any widget below.
      </p>
    </div>
  )
}

function ThinkingShowcase() {
  return (
    <div>
      <Block title="Bulb (product) · dots (fallback)">
        <Demo className="flex flex-col items-start gap-4">
          <Thinking />
          <Thinking variant="dots" />
        </Demo>
      </Block>
      <p className="text-xs leading-relaxed text-muted-foreground">
        The pause that reads as working, not broken. The bulb glyph gently breathes (a Lottie doodle can drop into
        the same slot later); the three dots are the guaranteed fallback contract. In the live engine this same
        bubble morphs into the reply. Both hold still under reduced motion.
      </p>
    </div>
  )
}

function ConversationDividerShowcase() {
  return (
    <div>
      <Block title='"Thought for" divider'>
        <Demo>
          <div className="bp-chat mx-auto w-full max-w-md">
            <MessageRow side="user" avatar={<UserAvatar />} name="You" time="now">
              <Bubble side="user">Where are we leaking the most revenue?</Bubble>
            </MessageRow>
            <ConversationDivider>Thought for 3s</ConversationDivider>
            <MessageRow side="agent" avatar={<AgentAvatar src={AGENT_AV} />} name="Wilson" role="CRO expert" time="now">
              <Bubble>Checkout drop-off is the biggest one. Here are the top three.</Bubble>
            </MessageRow>
          </div>
        </Demo>
      </Block>
      <p className="text-xs leading-relaxed text-muted-foreground">
        A quiet label with a hairline out each side, sitting between a question and the considered reply. In the
        live engine it leads the turn with a ticking present-tense counter, then flips to the past tense as the
        reply morphs in. It also carries the model annotation (see Models).
      </p>
    </div>
  )
}

function ConversationChecklistShowcase() {
  return (
    <div>
      <Block title="A to-do the agent posts inline">
        <Demo>
          <div className="mx-auto max-w-md">
            <ConversationChecklist
              title="Before we launch"
              items={[
                { label: "Connect your store", done: true },
                { label: "Install the tracking snippet" },
                { label: "Capture a first session" },
                { label: "Invite a teammate" },
              ]}
            />
          </div>
        </Demo>
      </Block>
      <p className="text-xs leading-relaxed text-muted-foreground">
        A compact, checkable list the agent surfaces mid-thread, with a running count. Distinct from the onboarding
        Checklist item (the big accent rings) — this sits as a conversation child under a bot bubble. Rows tick off
        in place and strike through.
      </p>
    </div>
  )
}

function ModelsShowcase() {
  return (
    <div>
      <Block title="Pick a model">
        <Demo><ModelPicker defaultValue="sonnet" /></Demo>
      </Block>
      <Block title="Shown on a reply">
        <Demo>
          <div className="bp-chat mx-auto w-full max-w-md">
            <ConversationDivider>
              <span className="inline-flex items-center gap-2">Thought for 3s <ModelChip model="Opus 4.8" glyph="brain" /></span>
            </ConversationDivider>
            <MessageRow side="agent" avatar={<AgentAvatar src={AGENT_AV} />} name="Wilson" role="CRO expert" time="now">
              <Bubble>I went deep on this one — here's the full breakdown.</Bubble>
            </MessageRow>
          </div>
        </Demo>
      </Block>
      <p className="text-xs leading-relaxed text-muted-foreground">
        How the agent shows and picks which model it is running. Neutral chrome, never an accent moment: a small
        trigger with a name + tagline menu to switch, and an inline chip that annotates a reply with the model that
        produced it (dropped onto the "Thought for" divider).
      </p>
    </div>
  )
}

const LEAK_OPTS = [
  { value: "a", label: "Pull the full revenue-leak report" },
  { value: "b", label: "Compare it against last quarter" },
  { value: "c", label: "Just summarise the top 3 issues" },
]
// module-scope so the reference stays stable (the Conversation replays if `script` changes)
const LIVE_SCRIPT: ConvoStep[] = [
  { role: "user", text: "Where are we leaking the most revenue?" },
  {
    role: "agent",
    think: "Great question. Here are a few ways I can dig into that:",
    loops: 1,
    widget: (done) => (
      <Choices options={LEAK_OPTS} onValueChange={(v) => done(String(LEAK_OPTS.find((o) => o.value === v)?.label))} />
    ),
  },
  { role: "agent", think: "On it. Pulling the top three issues together now.", loops: 1 },
]
function ConversationShowcase() {
  return (
    <div>
      <Block title="Live build-out">
        <Demo className="!p-0">
          <Conversation
            avatar={AGENT_AV}
            name="Wilson"
            role="CRO expert"
            script={LIVE_SCRIPT}
            controls
            className="h-[460px]"
          />
        </Demo>
      </Block>
      <p className="text-xs leading-relaxed text-muted-foreground">
        The whole surface assembling itself: each atomic part builds in on a staggered wave (avatar → name → time →
        bubble), bot copy reveals line by line, the thinking bubble morphs into the reply on one persistent node
        (measured before/after), and the answer widget is a real component whose pick echoes back as your chip. The
        view sticks to the newest turn. Reduced motion collapses it all to an instant swap. Hit Replay to watch again.
      </p>
    </div>
  )
}

/* ---------- foundations: tokens ---------- */
const typeScale = [
  ["3xl", 36, 700], ["2xl", 28, 700], ["xl", 22, 700], ["lg", 18, 600],
  ["md", 16, 600], ["base", 14, 500], ["sm", 13, 500], ["xs", 12, 500],
] as const
function TypeShowcase() {
  return (
    <Demo>
      <p className="mb-5 text-xs text-muted-foreground">Inter. base 14 = default body / control / label. Weights: control 500, field label 600, card title 700.</p>
      <div className="space-y-3">
        {typeScale.map(([name, px, wt]) => (
          <div key={name} className="flex items-baseline gap-5 border-b border-border pb-3 last:border-b-0">
            <span className="w-16 shrink-0 text-xs text-muted-foreground tabular-nums">{name} · {px}</span>
            <span style={{ fontSize: px, fontWeight: wt, letterSpacing: px >= 22 ? "-0.02em" : px >= 15 ? "-0.01em" : 0 }}>Agent-led design</span>
          </div>
        ))}
      </div>
    </Demo>
  )
}
const radii = [["sm", 8], ["base", 12], ["lg", 16], ["xl", 24], ["pill", 9999]] as const
function RadiusShowcase() {
  return (
    <Demo>
      <p className="mb-5 text-xs text-muted-foreground">Squircle on rects (controls 16, cards 24). Circles stay round.</p>
      <div className="flex flex-wrap items-end gap-6">
        {radii.map(([name, r]) => (
          <div key={name} className="text-center">
            <div className="size-20 border border-border-strong bg-fill [corner-shape:squircle]" style={{ borderRadius: r === 9999 ? 9999 : r }} />
            <div className="mt-1.5 text-[11px] font-medium">{name}</div>
            <div className="text-[10px] text-muted-foreground tabular-nums">{r === 9999 ? "pill" : `${r}px`}</div>
          </div>
        ))}
      </div>
    </Demo>
  )
}
const spaces = [["1", 4], ["2", 8], ["3", 12], ["4", 16], ["5", 20], ["6", 24], ["8", 32]] as const
function SpacingShowcase() {
  return (
    <Demo>
      <p className="mb-5 text-xs text-muted-foreground">4px base. Default gap 8, card gap 12 / pad 18, header pad 16.</p>
      <div className="space-y-2.5">
        {spaces.map(([name, px]) => (
          <div key={name} className="flex items-center gap-4">
            <span className="w-14 shrink-0 text-xs text-muted-foreground tabular-nums">space-{name}</span>
            <div className="h-4 rounded-sm bg-primary" style={{ width: px }} />
            <span className="text-[11px] text-muted-foreground tabular-nums">{px}px</span>
          </div>
        ))}
      </div>
    </Demo>
  )
}
const elevations = [["control", "shadow-control", "Raised buttons, dropdown triggers"], ["pop", "shadow-pop", "Popovers, floating menus"], ["card", "shadow-card", "Cards, surfaces (3-layer)"]] as const
function ElevationShowcase() {
  return (
    <Demo>
      <div className="flex flex-wrap gap-8">
        {elevations.map(([name, cls, desc]) => (
          <div key={name} className="w-52">
            <div className={`flex h-20 items-center justify-center rounded-xl border border-border bg-card text-sm font-semibold ${cls}`}>{name}</div>
            <div className="mt-2 text-[11px] text-muted-foreground">{desc}</div>
          </div>
        ))}
      </div>
    </Demo>
  )
}
const eases = [["ease-back", "cubic-bezier(.68,-.6,.32,1.6)", "Build in / out (bounce both ends)"], ["ease-emphasized", "cubic-bezier(.22,1,.36,1)", "Reveals, width expands"], ["ease-standard", "cubic-bezier(.2,.8,.2,1)", "House ease-out"]] as const
function MotionShowcase() {
  return (
    <Demo>
      <p className="mb-5 text-xs text-muted-foreground">Hover a track to run its curve. Snap duration .3s.</p>
      <div className="space-y-4">
        {eases.map(([name, curve, desc]) => (
          <div key={name} className="group/ease">
            <div className="mb-1 flex items-baseline justify-between">
              <span className="text-sm font-semibold">{name}</span>
              <span className="text-[11px] text-muted-foreground">{desc}</span>
            </div>
            <div className="relative h-9 rounded-lg border border-border bg-fill">
              <div className="absolute top-1/2 left-1 size-6 -translate-y-1/2 rounded-md bg-primary transition-[left] duration-500 group-hover/ease:left-[calc(100%-28px)]" style={{ transitionTimingFunction: curve }} />
            </div>
          </div>
        ))}
      </div>
    </Demo>
  )
}

function SectionShowcase() {
  return (
    <Demo className="max-w-xs">
      <p className="mb-3 text-xs text-muted-foreground">Click a title to roll it up — the chevron parks pointing right and a count chip shows what’s hidden.</p>
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
    </Demo>
  )
}

function EmptyBucket({ note }: { note: string }) {
  return <div className="rounded-xl border border-dashed border-border-strong bg-card/50 p-10 text-center text-sm text-muted-foreground">{note}</div>
}

/* ---------------- product: the launcher morph machine ---------------- */

function DriverBtn({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return (
    <Button variant="secondary" size="sm" onClick={onClick}>
      {children}
    </Button>
  )
}

// a faux content canvas: a bordered grey pane that plays the content area the launcher
// docks to (bottom-centre), centres the modal/saving on, and blurs behind the modal.
function LauncherShowcase() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [api, setApi] = useState<LauncherApi | null>(null)
  const [saved, setSaved] = useState<string[]>([])
  const [sent, setSent] = useState<string[]>([])

  return (
    <div>
      <Block title="The six-state morph">
        <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
          One fixed card + one floating agent PNG that morphs between six states. Hover the pill (or press ⌘K) to grow
          the composer; Save-as-Dashboard travels it up into the modal; Save runs the progress then collapses into the
          positive-green toast. Drive each state directly:
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
        </div>
        <div
          ref={canvasRef}
          className="relative h-[440px] overflow-hidden rounded-xl border border-border-strong bg-canvas [corner-shape:squircle]"
        >
          <div className="flex h-[52px] items-center gap-2 border-b border-border px-4 text-sm font-medium text-muted-foreground">
            <Icon name="layout-dashboard" size={18} stroke={1.5} />
            Overview
          </div>
          <div className="space-y-1 p-4 text-xs text-muted-foreground">
            {saved.length > 0 && <div>Dashboards: {saved.join(", ")}</div>}
            {sent.map((t, i) => (
              <div key={i} className="truncate">
                You: {t}
              </div>
            ))}
            {saved.length === 0 && sent.length === 0 && <div className="opacity-70">Hover the pill, press ⌘K, or use the buttons above.</div>}
          </div>
        </div>
      </Block>
      <Launcher
        agentName="Wilson"
        avatarSrc={AGENT_AV}
        dockRef={canvasRef}
        regionRef={canvasRef}
        onNewChat={(t) => setSent((s) => [t, ...s].slice(0, 4))}
        onSaveDashboard={(n) => setSaved((s) => [n, ...s])}
        onReady={setApi}
      />
      <p className="text-xs leading-relaxed text-muted-foreground">
        The card and the profile pic are the persistent frame that travels + resizes on one bounce; every other part
        builds in on a staggered wave and reverse-builds out quicker. The blur backdrop covers only this pane, so the
        surrounding chrome stays sharp. Reduced motion collapses each morph to an instant swap.
      </p>
    </div>
  )
}

function CoachMarkShowcase() {
  const canvasRef = useRef<HTMLDivElement>(null)
  const targetLeftRef = useRef<HTMLDivElement>(null)
  const targetTopRef = useRef<HTMLDivElement>(null)
  const [api, setApi] = useState<LauncherApi | null>(null)

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

  return (
    <div>
      <Block title="Coach-mark spotlight">
        <p className="mb-4 text-xs leading-relaxed text-muted-foreground">
          A sixth launcher state: the pill travels to a target and becomes an arrow tooltip over a spotlight that dims +
          blurs everything except a crisp squircle cutout around the target. Hover a target (with a short intent delay),
          or trigger one directly:
        </p>
        <div className="mb-4 flex flex-wrap gap-2">
          <DriverBtn onClick={() => api?.openCoach(0)}>Highlight left target</DriverBtn>
          <DriverBtn onClick={() => api?.openCoach(1)}>Highlight top target</DriverBtn>
        </div>
        <div
          ref={canvasRef}
          className="relative h-[460px] overflow-hidden rounded-xl border border-border-strong bg-canvas [corner-shape:squircle]"
        >
          <div className="flex h-[52px] items-center justify-between gap-2 border-b border-border px-4">
            <span className="text-sm font-medium text-muted-foreground">Overview</span>
            <div
              ref={targetTopRef}
              className="flex items-center gap-2 rounded-lg border border-border-strong bg-card px-3 py-1.5 text-sm font-semibold text-foreground [corner-shape:squircle]"
            >
              <Icon name="calendar" size={16} stroke={1.5} />
              Last 30 days
              <Icon name="chevron-down" size={15} stroke={1.5} />
            </div>
          </div>
          <div className="p-4">
            <div
              ref={targetLeftRef}
              className="w-52 rounded-xl border border-border-strong bg-card p-3 [corner-shape:squircle]"
            >
              <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">Dashboards</div>
              <div className="flex flex-col gap-0.5">
                {["Revenue overview", "Activation funnel", "Weekly digest"].map((d) => (
                  <div key={d} className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-foreground">
                    <Icon name="layout-dashboard" size={16} stroke={1.5} />
                    {d}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </Block>
      <Launcher agentName="Wilson" avatarSrc={AGENT_AV} dockRef={canvasRef} regionRef={canvasRef} coaches={coaches} onReady={setApi} />
      <p className="text-xs leading-relaxed text-muted-foreground">
        Opens in two beats (travel + collapse to just the avatar disc, then expand into the tooltip). The highlight is
        brief (2s); the tooltip lingers (6s or the close button). Each target fires once per deliberate hover.
      </p>
    </div>
  )
}

/* ---------------- nav ---------------- */

// The ONE dropdown, dogfooded: the same surface + rows everywhere, only the row
// slots change (leading icon vs checkbox, an optional search header). All 16px, one
// hover, one shadow, always drops below.
const DD_TRIGGER =
  "group/trigger bp-chev-host inline-flex h-[34px] items-center gap-2 rounded-[var(--ctl-radius)] [corner-shape:squircle] border border-[#dcdcdc] bg-[linear-gradient(180deg,#fff,#f7f7f7)] px-3.5 text-base font-medium text-[#26262a] shadow-[0_1px_2px_rgba(10,13,18,0.05)] outline-none transition-colors hover:border-[#cfcfcf] data-[popup-open]:border-primary data-[popup-open]:shadow-[0_0_0_3px_var(--accent-tint)]"
function DdChevron() {
  return <Icon name="chevron-down" size={18} className="bp-chev text-muted-foreground transition-transform duration-200 group-data-[popup-open]/trigger:rotate-180" />
}
function DropdownShowcase() {
  const CLIENTS = ["Acme Co", "Globex", "Initech", "Umbrella", "Soylent"]
  const [multi, setMulti] = useState<string[]>(["Acme Co"])
  const [searched, setSearched] = useState<string[]>([])
  const [q, setQ] = useState("")
  const toggle = (set: typeof setMulti) => (c: string) =>
    set((p) => (p.includes(c) ? p.filter((x) => x !== c) : [...p, c]))
  const filtered = CLIENTS.filter((c) => c.toLowerCase().includes(q.toLowerCase()))
  return (
    <div>
      <Block title="One dropdown, versatile rows (open them)">
        <Demo className="flex flex-wrap items-start gap-3">
          <Dropdown>
            <DropdownTrigger className={DD_TRIGGER}>Actions <DdChevron /></DropdownTrigger>
            <DropdownContent align="start">
              <DropdownItem icon="pencil">Rename</DropdownItem>
              <DropdownItem icon="copy">Duplicate</DropdownItem>
              <DropdownItem icon="bookmark">Save chat</DropdownItem>
              <DropdownItem icon="archive" danger>Archive</DropdownItem>
            </DropdownContent>
          </Dropdown>

          <Dropdown>
            <DropdownTrigger className={DD_TRIGGER}>
              {multi.length ? `${multi.length} selected` : "Checkboxes"} <DdChevron />
            </DropdownTrigger>
            <DropdownContent align="start">
              {CLIENTS.map((c) => (
                <DropdownCheckItem key={c} checked={multi.includes(c)} onCheckedChange={() => toggle(setMulti)(c)}>
                  {c}
                </DropdownCheckItem>
              ))}
            </DropdownContent>
          </Dropdown>

          <Dropdown>
            <DropdownTrigger className={DD_TRIGGER}>Search + filter <DdChevron /></DropdownTrigger>
            <DropdownContent
              align="start"
              search={<DropdownSearch value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search clients…" />}
            >
              {filtered.length ? (
                filtered.map((c) => (
                  <DropdownCheckItem key={c} checked={searched.includes(c)} onCheckedChange={() => toggle(setSearched)(c)}>
                    {c}
                  </DropdownCheckItem>
                ))
              ) : (
                <DropdownEmpty>No matches</DropdownEmpty>
              )}
            </DropdownContent>
          </Dropdown>

          <Dropdown>
            <DropdownTrigger
              nativeButton={false}
              render={<span role="button" tabIndex={0} aria-label="Options" />}
              className="grid size-8 cursor-pointer place-items-center rounded-[10px] [corner-shape:squircle] text-[var(--ctl-icon)] outline-none hover:bg-[var(--ctl-hover)] data-[popup-open]:bg-[var(--ctl-hover)]"
            >
              <Icon name="dots-vertical" size={18} />
            </DropdownTrigger>
            <DropdownContent align="end">
              <DropdownItem icon="pencil">Rename</DropdownItem>
              <DropdownItem icon="archive" danger>Archive</DropdownItem>
            </DropdownContent>
          </Dropdown>
        </Demo>
      </Block>
      <Block title="The contract">
        <Demo>
          <p className="text-sm leading-relaxed text-muted-foreground">
            One surface, one row. The leading slot is an <b className="font-semibold text-foreground">icon</b> (action
            rows) or a <b className="font-semibold text-foreground">checkbox</b> (multi-select, stays open); an optional{" "}
            <b className="font-semibold text-foreground">search</b> field sits on top. Every part — surface, rows, and
            search — is 16px squircle (<code className="text-[13px]">--ctl-radius</code>) with the same light hover
            (<code className="text-[13px]">--ctl-hover</code>), the same soft card shadow, and always drops below the
            trigger. The three-dot kebab is the same dropdown with a span trigger.
          </p>
        </Demo>
      </Block>
    </div>
  )
}

// ---- consolidated pages: the Base section is organised as Atoms / Molecules /
// Surfaces so the whole family is visible together (per the "one page, all siblings"
// model) instead of scattered across a dozen pages. ----
// a stable anchor id for the section, so the sub-nav "on this page" menu can jump to it
function sectionId(title: string) {
  return "sec-" + title.toLowerCase().replace(/&/g, "and").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")
}
function GroupHeader({ title, desc }: { title: string; desc?: string }) {
  return (
    <div
      id={sectionId(title)}
      data-section-anchor="group"
      data-section-title={title}
      className="mt-14 mb-5 scroll-mt-4 border-t border-border-strong pt-10 first:mt-0 first:border-0 first:pt-0"
    >
      <h2 className="text-xl font-bold tracking-[-0.01em] text-foreground">{title}</h2>
      {desc && <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">{desc}</p>}
    </div>
  )
}

// ATOMS — the parts that go INSIDE controls (icons, checkbox, checkmark, badges/chips).
function AtomsShowcase() {
  return (
    <div>
      <GroupHeader title="Icons" desc="The Tabler set, one stroke, with the draw-in + hover treatments. These drop into a button, a dropdown row, a field, or a nav item." />
      <IconsShowcase />
      <GroupHeader title="Checkbox" desc="The tick that rides in a multi-select dropdown row or a checklist." />
      <CheckboxShowcase />
      <GroupHeader title="Checkmark" desc="The standalone reveal-check (the disc that fills on a selected choice / select row)." />
      <CheckmarkShowcase />
      <GroupHeader title="Badges & chips" desc="Count chips + status badges — a trailing atom on a nav row or a dropdown item." />
      <BadgeShowcase />
    </div>
  )
}

// MOLECULES — the button / input family: one versatile control that carries atoms on
// either side, in four button variants + the field siblings + the one dropdown.
function MoleculesShowcase() {
  return (
    <div>
      <GroupHeader
        title="Button"
        desc="One versatile control (primary / secondary / tertiary / ghost + the icon-only IconButton). It carries any atom on the left or right — an icon, a badge, a chevron, a kebab — and reads the same in a nav, a card, a dropdown, or a toolbar. All 16px squircle, one hover, one focus ring."
      />
      <ButtonShowcase />
      <GroupHeader title="Input & label" desc="The text field and its label are one pairing — a label is just the field's caption, so they live together." />
      <InputShowcase />
      <LabelShowcase />
      <GroupHeader title="Textarea" desc="The multi-line field sibling." />
      <TextareaShowcase />
      <GroupHeader title="Select" desc="The SINGLE-value dropdown: pick one, it closes and shows the value + a check on the chosen row. Same surface + rows as the dropdown below; it drops BELOW the trigger (not over it)." />
      <SelectShowcase />
      <GroupHeader title="Dropdown" desc="The same surface used for actions or multi-select: action rows (leading icon), checkbox rows (multi, stay open), an optional search header, or a bare kebab trigger. One dropdown, versatile rows." />
      <DropdownShowcase />
    </div>
  )
}

// SURFACES — the non-control layout pieces.
function SurfacesShowcase() {
  return (
    <div>
      <GroupHeader title="Card" desc="The content-area container: a gray tray (36px, hairline, 4px gutter) holding an optional header + footer and one or more white surfaces (30px, faint xs shadow). All content lives in a surface; cards group and label it. Not for modals, notifications, or menus." />
      <CardShowcase />
      <GroupHeader title="CTA row" desc="A button pairing (a molecule laid out as a row)." />
      <CtaShowcase />
      <GroupHeader title="Separator" />
      <SeparatorShowcase />
      <GroupHeader title="Scroll area" desc="The 2px reveal-on-scroll thin scrollbar." />
      <ScrollAreaShowcase />
    </div>
  )
}

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

function LayoutShowcase() {
  return (
    <div>
      <p className="mb-6 text-sm leading-relaxed text-muted-foreground">
        <b className="text-foreground">WorkspaceShell</b> is the promoted 4-column workspace: a CSS-grid with
        custom-prop tracks so every edge animates in one motion, drag-to-resize gutters, and responsive drawers
        (below 1024px the columns become off-canvas drawers — see the full-screen{" "}
        <a className="underline decoration-dotted underline-offset-2 hover:text-foreground" href="/demo.html">Demo</a>).
        It takes four <b className="text-foreground">slots</b> (primaryNav / agentHome / content / chat), each filled
        with the LayoutColumn family. The Demo and this page render the SAME components — change a metric in{" "}
        <code className="rounded bg-subtle px-1 py-0.5 text-[12px]">components/workspace.css</code> and both move. No drift.
      </p>

      <Block title="The shell — collapse · resize · open chat">
        <ShellDemo />
      </Block>

      <Block title="LayoutColumn — the column card (card · canvas · plain)">
        <LayoutColumnShowcase />
      </Block>

      <Block title="ColumnHeader + ColumnTitle">
        <ColumnHeaderShowcase />
      </Block>

      <Block title="NavList — the row gap is one token (--ws-row-gap)">
        <NavListShowcase />
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Every nav list — here, in the Demo, in the shell above — reads its row gap from{" "}
          <code className="rounded bg-subtle px-1 py-0.5 text-[12px]">--ws-row-gap</code>. Bal's "nav-row gap captured
          once": change the token in workspace.css and every list moves together.
        </p>
      </Block>

      <Block title="Contract">
        <ul className="space-y-1.5 text-xs leading-relaxed text-muted-foreground">
          <li>• <b className="text-foreground">Slots, not order.</b> The shell places primaryNav / agentHome / content / chat into the grid and splices the resize gutters between them — columns can't be misordered.</li>
          <li>• <b className="text-foreground">Controlled state.</b> Collapse booleans + the compact drawer flags flow in as props, so the host's own effects (a travelling avatar, a docked launcher) can react to them.</li>
          <li>• <b className="text-foreground">Mechanics stay in the DS.</b> The grid tracks, resize maths, drawer transforms + scrim live in the shell; the host reacts to a drag via <code className="rounded bg-subtle px-1 py-0.5 text-[12px]">onResize</code>.</li>
        </ul>
      </Block>
    </div>
  )
}

export type NavItemDef = { id: string; label: string; icon: IconName; render: () => ReactNode }
export type NavGroup = { label: string; items: NavItemDef[]; empty?: string }

export const NAV: NavGroup[] = [
  {
    label: "Foundations",
    items: [
      { id: "colors", label: "Colors", icon: "chart-pie", render: () => <ColorsShowcase /> },
      { id: "type", label: "Type", icon: "file-text", render: () => <TypeShowcase /> },
      { id: "radius", label: "Radius", icon: "help", render: () => <RadiusShowcase /> },
      { id: "spacing", label: "Spacing", icon: "chart-bar", render: () => <SpacingShowcase /> },
      { id: "elevation", label: "Elevation", icon: "copy", render: () => <ElevationShowcase /> },
      { id: "motion", label: "Motion", icon: "activity", render: () => <MotionShowcase /> },
    ],
  },
  {
    label: "Base",
    items: [
      { id: "atoms", label: "Atoms", icon: "sparkles", render: () => <AtomsShowcase /> },
      { id: "molecules", label: "Molecules", icon: "plus", render: () => <MoleculesShowcase /> },
      { id: "surfaces", label: "Surfaces", icon: "layout-dashboard", render: () => <SurfacesShowcase /> },
    ],
  },
  {
    label: "Agent",
    items: [
      { id: "card-header", label: "Agent header", icon: "users", render: () => <CardHeaderShowcase /> },
      { id: "message-row", label: "Message row", icon: "message", render: () => <MessageRowShowcase /> },
      { id: "bubbles", label: "Bubbles", icon: "file-text", render: () => <BubblesShowcase /> },
      { id: "thinking", label: "Thinking", icon: "bulb", render: () => <ThinkingShowcase /> },
      { id: "divider", label: "Conversation divider", icon: "activity", render: () => <ConversationDividerShowcase /> },
      { id: "conversation-checklist", label: "Conversation checklist", icon: "checklist", render: () => <ConversationChecklistShowcase /> },
      { id: "models", label: "Models", icon: "brain", render: () => <ModelsShowcase /> },
      { id: "choices", label: "Choices", icon: "help", render: () => <ChoicesShowcase /> },
      { id: "badge-select", label: "Badge select", icon: "bookmark", render: () => <BadgeSelectShowcase /> },
      { id: "slider", label: "Slider", icon: "trending-up", render: () => <SliderShowcase /> },
      { id: "score", label: "Score", icon: "chart-bar", render: () => <ScoreShowcase /> },
      { id: "progress", label: "Progress", icon: "chart-pie", render: () => <ProgressShowcase /> },
      { id: "checklist-item", label: "Checklist item", icon: "circle-check", render: () => <ChecklistShowcase /> },
      { id: "composer", label: "Composer", icon: "send", render: () => <ComposerShowcase /> },
      { id: "conversation", label: "Conversation (live)", icon: "sparkles", render: () => <ConversationShowcase /> },
      { id: "tooltip", label: "Tooltip", icon: "info-circle", render: () => <TooltipShowcase /> },
      { id: "resource-center", label: "Resource center", icon: "lifebuoy", render: () => <ResourceCenterShowcase /> },
    ],
  },
  {
    label: "Product",
    items: [
      { id: "nav-item", label: "Nav item", icon: "layout-dashboard", render: () => <NavItemShowcase /> },
      { id: "section", label: "Section", icon: "chevron-down", render: () => <SectionShowcase /> },
      { id: "calendar", label: "Calendar", icon: "calendar", render: () => <CalendarShowcase /> },
      { id: "launcher", label: "Launcher", icon: "sparkles", render: () => <LauncherShowcase /> },
      { id: "coach-mark", label: "Coach mark", icon: "info-circle", render: () => <CoachMarkShowcase /> },
    ],
  },
  {
    label: "Layout",
    items: [
      { id: "workspace-shell", label: "Workspace shell", icon: "layout-dashboard", render: () => <LayoutShowcase /> },
    ],
  },
  {
    label: "Web",
    items: [],
    empty: "Marketing sections (hero, quote, pricing, FAQ, footer) land here later.",
  },
]
