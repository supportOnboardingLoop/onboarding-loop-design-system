import type { ReactNode } from "react"
import { Button } from "@/components/base/button"
import { Input } from "@/components/base/input"
import { Label } from "@/components/base/label"
import { Textarea } from "@/components/base/textarea"
import { Separator } from "@/components/base/separator"
import { Badge } from "@/components/base/badge"
import { Checkbox } from "@/components/base/checkbox"
import { Checkmark } from "@/components/base/checkmark"
import { Icon, BP_ICONS, type IconName } from "@/components/base/icon"
import { ScrollArea } from "@/components/base/scroll-area"
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter, CardAction } from "@/components/base/card"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, SelectGroup, SelectLabel } from "@/components/base/select"
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

/* ---------------- shared layout bits ---------------- */

function Block({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="mb-10">
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

const neutralRoles = ["background", "card", "secondary", "muted", "accent", "border", "input", "muted-foreground", "foreground", "primary"]
const statusRoles = ["success", "warning", "destructive", "info"]

function Swatch({ role }: { role: string }) {
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
      <Block title="Neutral"><div className="flex flex-wrap gap-3">{neutralRoles.map((r) => <Swatch key={r} role={r} />)}</div></Block>
      <Block title="Status · functional (the only hues)"><div className="flex flex-wrap gap-3">{statusRoles.map((r) => <Swatch key={r} role={r} />)}</div></Block>
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

function CardShowcase() {
  return (
    <Demo className="space-y-4">
      <Card className="max-w-sm">
        <CardHeader>
          <CardTitle>Weekly digest</CardTitle>
          <CardDescription>A summary of what shipped this week.</CardDescription>
          <CardAction><Button size="sm" variant="secondary">Open</Button></CardAction>
        </CardHeader>
        <CardContent>Cards use the neutral surface, a crisp border, 18px padding, and the 3-layer soft shadow.</CardContent>
        <CardFooter><Button size="sm">Publish</Button><Button size="sm" variant="tertiary">Discard</Button></CardFooter>
      </Card>
      <Card variant="interactive" className="max-w-sm"><CardTitle>Interactive card</CardTitle><CardContent>The whole card is a target. Hover to see it lift.</CardContent></Card>
      <Card variant="flat" className="max-w-sm"><CardTitle>Flat card</CardTitle><CardContent>No shadow, just the hairline.</CardContent></Card>
    </Demo>
  )
}
function BadgeShowcase() {
  return <Demo><div className="flex flex-wrap gap-2"><Badge variant="neutral">Neutral</Badge><Badge variant="success">Active</Badge><Badge variant="warning">Pending</Badge><Badge variant="error">Failed</Badge></div></Demo>
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
  return <Demo><ScrollArea className="h-40 w-64 rounded-lg border border-border-strong"><div className="space-y-2 p-3 text-xs">{Array.from({ length: 20 }).map((_, i) => <p key={i}>Scrollable line {i + 1}</p>)}</div></ScrollArea></Demo>
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
  return <Demo className="max-w-md"><Score options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]} value={8} ends={["Not likely", "Very likely"]} /></Demo>
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

function ChoicesShowcase() {
  return (
    <Demo className="max-w-md">
      <Choices
        defaultValue="b"
        options={[
          { value: "a", label: "Do it for me end to end" },
          { value: "b", label: "Guide me step by step" },
          { value: "c", label: "Just point me to the docs" },
        ]}
      />
    </Demo>
  )
}
function BadgeSelectShowcase() {
  return (
    <Demo className="max-w-md">
      <BadgeSelect
        defaultValue={["email", "chat"]}
        confirmLabel="Confirm channels"
        options={[
          { value: "email", label: "Email" },
          { value: "chat", label: "Live chat" },
          { value: "sms", label: "SMS" },
          { value: "social", label: "Social" },
          { value: "phone", label: "Phone" },
        ]}
      />
    </Demo>
  )
}
function SliderShowcase() {
  const labels = ["Do it myself", "Mostly me", "A mix", "Mostly you", "Just get the result"]
  return (
    <Demo className="max-w-md space-y-8">
      <div className="space-y-2"><p className="text-xs text-muted-foreground">Sentiment</p><Slider defaultValue={70} /></div>
      <div className="space-y-2"><p className="text-xs text-muted-foreground">Plain (neutral scale)</p><Slider plain defaultValue={50} readFor={(v) => labels[Math.min(4, Math.floor(v / 20))]} /></div>
    </Demo>
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

function ChipShowcase() {
  return (
    <Demo className="space-y-6">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Count chips</p>
        <div className="flex flex-wrap items-center gap-3">
          <Chip>4</Chip>
          <Chip variant="new">3</Chip>
          <Chip variant="new">Healthy</Chip>
          <Chip variant="warn">2</Chip>
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Status badges (dot)</p>
        <div className="flex flex-wrap items-center gap-3">
          <StatusBadge tone="success">Online</StatusBadge>
          <StatusBadge tone="warning">Needs review</StatusBadge>
          <StatusBadge tone="info">Syncing</StatusBadge>
          <StatusBadge tone="destructive">Offline</StatusBadge>
        </div>
      </div>
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Nav tails, in context</p>
        <div className="max-w-xs space-y-0.5">
          <NavItem icon="sparkles" current tail={<Chip variant="new">4</Chip>}>Overview</NavItem>
          <NavItem icon="chart-bar" tail={<Chip variant="new">Healthy</Chip>}>Portfolio</NavItem>
          <NavItem icon="layout-dashboard" tail={<Chip>7</Chip>}>Client memory</NavItem>
        </div>
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

/* ---------------- nav ---------------- */

export type NavItemDef = { id: string; label: string; icon: IconName; render: () => ReactNode }
export type NavGroup = { label: string; items: NavItemDef[]; empty?: string }

export const NAV: NavGroup[] = [
  {
    label: "Foundations",
    items: [
      { id: "colors", label: "Colors", icon: "chart-pie", render: () => <ColorsShowcase /> },
      { id: "icons", label: "Icons", icon: "sparkles", render: () => <IconsShowcase /> },
    ],
  },
  {
    label: "Base",
    items: [
      { id: "button", label: "Button", icon: "plus", render: () => <ButtonShowcase /> },
      { id: "input", label: "Input", icon: "pencil", render: () => <InputShowcase /> },
      { id: "textarea", label: "Textarea", icon: "file-text", render: () => <TextareaShowcase /> },
      { id: "label", label: "Label", icon: "bookmark", render: () => <LabelShowcase /> },
      { id: "select", label: "Select", icon: "chevron-down", render: () => <SelectShowcase /> },
      { id: "card", label: "Card", icon: "layout-dashboard", render: () => <CardShowcase /> },
      { id: "badge", label: "Badge", icon: "bell", render: () => <BadgeShowcase /> },
      { id: "checkbox", label: "Checkbox", icon: "checklist", render: () => <CheckboxShowcase /> },
      { id: "checkmark", label: "Checkmark", icon: "circle-check", render: () => <CheckmarkShowcase /> },
      { id: "separator", label: "Separator", icon: "activity", render: () => <SeparatorShowcase /> },
      { id: "scroll-area", label: "Scroll area", icon: "copy", render: () => <ScrollAreaShowcase /> },
    ],
  },
  {
    label: "Product",
    items: [
      { id: "nav-item", label: "Nav item", icon: "layout-dashboard", render: () => <NavItemShowcase /> },
      { id: "section", label: "Section", icon: "chevron-down", render: () => <SectionShowcase /> },
      { id: "chip", label: "Chip & badge", icon: "bell", render: () => <ChipShowcase /> },
      { id: "cta", label: "CTA row", icon: "arrow-right", render: () => <CtaShowcase /> },
      { id: "progress", label: "Progress", icon: "activity", render: () => <ProgressShowcase /> },
      { id: "score", label: "Score", icon: "chart-bar", render: () => <ScoreShowcase /> },
      { id: "composer", label: "Composer", icon: "message", render: () => <ComposerShowcase /> },
      { id: "checklist-item", label: "Checklist item", icon: "checklist", render: () => <ChecklistShowcase /> },
      { id: "card-header", label: "Card header", icon: "users", render: () => <CardHeaderShowcase /> },
      { id: "calendar", label: "Calendar", icon: "calendar", render: () => <CalendarShowcase /> },
      { id: "choices", label: "Choices", icon: "help", render: () => <ChoicesShowcase /> },
      { id: "badge-select", label: "Badge select", icon: "bookmark", render: () => <BadgeSelectShowcase /> },
      { id: "slider", label: "Slider", icon: "trending-up", render: () => <SliderShowcase /> },
      { id: "tooltip", label: "Tooltip", icon: "info-circle", render: () => <TooltipShowcase /> },
      { id: "resource-center", label: "Resource center", icon: "lifebuoy", render: () => <ResourceCenterShowcase /> },
    ],
  },
  {
    label: "Web",
    items: [],
    empty: "Marketing sections (hero, quote, pricing, FAQ, footer) land here later.",
  },
]
