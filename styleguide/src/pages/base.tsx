import { useState, type ReactNode } from "react"
import { Button } from "@/components/base/button"
import { IconButton } from "@/components/base/icon-button"
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
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/base/select"
import { SegmentedControl } from "@/components/base/segmented-control"
import {
  Dropdown,
  DropdownTrigger,
  DropdownContent,
  DropdownItem,
  DropdownCheckItem,
  DropdownSearch,
  DropdownEmpty,
} from "@/components/product/dropdown"
import { NavItem } from "@/components/product/nav-item"
import { CtaRow } from "@/components/product/cta"
import { Chip, StatusBadge } from "@/components/product/chip"
import { PageSection, PageItem, Example, ExampleRows, ExampleRow, Caption } from "../page-kit"

/* A tier-3 label inside a PageItem (no anchor) — groups a few examples under one
   sub-subsection, e.g. Button → Variants / Sizes / States. */
function Group({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <div>
      {label && <p className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">{label}</p>}
      {children}
    </div>
  )
}

/* ---------------- Atoms ---------------- */

function IconsShowcase() {
  const names = Object.keys(BP_ICONS) as IconName[]
  return (
    <Example>
      <p className="text-xs text-muted-foreground">
        Tabler outline set, ported from <code className="text-foreground">kit/icons.js</code>. Hover a cell to draw the strokes in.
      </p>
      <div className="grid grid-cols-[repeat(auto-fill,minmax(88px,1fr))] gap-2">
        {names.map((n) => (
          <div key={n} className="bp-ico-host flex flex-col items-center gap-2 rounded-lg border border-border p-3 text-center transition-colors hover:border-border-strong">
            <Icon name={n} size={22} draw className="text-foreground" />
            <span className="text-[10px] text-muted-foreground">{n}</span>
          </div>
        ))}
      </div>
    </Example>
  )
}

function CheckboxShowcase() {
  // the card-header treatment: a live atom rides the header, the states sit on the surface
  return (
    <Card className="max-w-md">
      <CardHeader title="States" action={<Checkbox defaultChecked aria-label="Checkbox" />} />
      <CardSurface>
        <div className="flex flex-wrap items-center gap-6">
          <label className="flex items-center gap-2 text-base"><Checkbox defaultChecked /> Checked</label>
          <label className="flex items-center gap-2 text-base"><Checkbox /> Unchecked</label>
          <label className="flex items-center gap-2 text-base"><Checkbox disabled /> Disabled</label>
        </div>
      </CardSurface>
    </Card>
  )
}

function CheckmarkShowcase() {
  return (
    <Example tray="max-w-md">
      <div className="flex flex-wrap items-center gap-8">
        <div className="flex flex-col items-center gap-2"><Checkmark filled /><span className="text-[11px] text-muted-foreground">filled disc</span></div>
        <div className="flex flex-col items-center gap-2"><Checkmark filled={false} /><span className="text-[11px] text-muted-foreground">outline ring</span></div>
      </div>
    </Example>
  )
}

function BadgeShowcase() {
  return (
    <Example>
      <Group label="Status pills">
        <div className="flex flex-wrap gap-2"><Badge variant="neutral">Neutral</Badge><Badge variant="success">Active</Badge><Badge variant="warning">Pending</Badge><Badge variant="error">Failed</Badge></div>
      </Group>
      <Group label="Status badges (dot)">
        <div className="flex flex-wrap items-center gap-3"><StatusBadge tone="success">Online</StatusBadge><StatusBadge tone="warning">Needs review</StatusBadge><StatusBadge tone="info">Syncing</StatusBadge><StatusBadge tone="destructive">Offline</StatusBadge></div>
      </Group>
      <Group label="Count chips">
        <div className="flex flex-wrap items-center gap-3"><Chip>4</Chip><Chip variant="new">3</Chip><Chip variant="new">Healthy</Chip><Chip variant="warn">2</Chip></div>
      </Group>
      <Group label="Nav tails, in context">
        <div className="max-w-xs space-y-0.5">
          <NavItem icon="sparkles" current tail={<Chip variant="new">4</Chip>}>Overview</NavItem>
          <NavItem icon="chart-bar" tail={<Chip variant="new">Healthy</Chip>}>Portfolio</NavItem>
          <NavItem icon="checklist" tail={<StatusBadge tone="success">Online</StatusBadge>}>Settings</NavItem>
        </div>
      </Group>
    </Example>
  )
}

/* ---------------- Molecules ---------------- */

const variants = ["primary", "secondary", "tertiary", "ghost", "destructive", "link"] as const

function ButtonShowcase() {
  return (
    <>
      <Group label="Variants">
        <ExampleRows>{variants.map((v) => <ExampleRow key={v} label={v}><Button variant={v}>Button</Button><Button variant={v}>Get started</Button></ExampleRow>)}</ExampleRows>
      </Group>
      <Group label="Sizes">
        <ExampleRows>
          <ExampleRow label="sm"><Button size="sm">Button</Button><Button size="sm" variant="secondary">Secondary</Button></ExampleRow>
          <ExampleRow label="default"><Button>Button</Button><Button variant="secondary">Secondary</Button></ExampleRow>
          <ExampleRow label="lg"><Button size="lg">Button</Button><Button size="lg" variant="secondary">Secondary</Button></ExampleRow>
          <ExampleRow label="icon"><Button size="icon" aria-label="Add"><Icon name="plus" /></Button><Button size="icon-sm" variant="secondary" aria-label="Add"><Icon name="plus" /></Button><Button size="icon-lg" variant="secondary" aria-label="Add"><Icon name="plus" /></Button></ExampleRow>
        </ExampleRows>
      </Group>
      <Group label="Icon behaviors (hover me)">
        <ExampleRows>
          <ExampleRow label="reveal icon"><Button revealIcon="arrow-right">Continue</Button><Button variant="secondary" revealIcon="arrow-right">Next step</Button></ExampleRow>
          <ExampleRow label="reveal · leading"><Button variant="secondary" revealIcon="arrow-left" revealIconSide="leading">Previous</Button></ExampleRow>
          <ExampleRow label="reveal label"><Button size="icon" revealLabel="Send" aria-label="Send" className="bp-ico-host"><Icon name="send" loop="fly" /></Button><Button variant="secondary" size="icon" revealLabel="Save" aria-label="Save" className="bp-ico-host"><Icon name="device-floppy" /></Button></ExampleRow>
          <ExampleRow label="nav tier"><div className="w-52"><Button variant="nav" data-current>Dashboard</Button><Button variant="nav">Settings</Button></div></ExampleRow>
        </ExampleRows>
      </Group>
      <Group label="Icon button (close / expand, hover me)">
        <ExampleRows>
          <ExampleRow label="close"><IconButton icon="x" motion="rotate" aria-label="Close" /></ExampleRow>
          <ExampleRow label="collapse / expand"><IconButton icon="chevrons-left" motion="arrow-left" aria-label="Collapse" /><IconButton icon="chevrons-right" motion="arrow-right" aria-label="Expand" /></ExampleRow>
        </ExampleRows>
      </Group>
      <Group label="States">
        <ExampleRows>
          <ExampleRow label="disabled"><Button disabled>Button</Button><Button variant="secondary" disabled>Secondary</Button></ExampleRow>
          <ExampleRow label="invalid"><Button aria-invalid>Button</Button></ExampleRow>
        </ExampleRows>
      </Group>
    </>
  )
}

function InputShowcase() {
  return (
    <Example>
      <div className="max-w-sm space-y-4">
        <div className="space-y-1.5"><Label htmlFor="email">Email</Label><Input id="email" type="email" placeholder="you@example.com" /></div>
        <div className="space-y-1.5"><Label htmlFor="filled">Filled (600)</Label><Input id="filled" defaultValue="Ada Lovelace" placeholder="Name" /></div>
        <div className="space-y-1.5"><Label htmlFor="disabled-input">Disabled</Label><Input id="disabled-input" placeholder="Disabled" disabled /></div>
        <div className="space-y-1.5"><Label htmlFor="invalid-input">Invalid</Label><Input id="invalid-input" defaultValue="not-an-email" aria-invalid /></div>
      </div>
    </Example>
  )
}

function LabelShowcase() {
  return (
    <Example>
      <div className="max-w-sm space-y-1.5">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" placeholder="Ada Lovelace" />
        <p className="text-xs text-muted-foreground">Labels are 14px, 600, and pair with any control.</p>
      </div>
    </Example>
  )
}

function TextareaShowcase() {
  return (
    <Example>
      <div className="max-w-sm space-y-4"><Textarea placeholder="Write something…" /><Textarea placeholder="Disabled" disabled /><Textarea defaultValue="Invalid value" aria-invalid /></div>
    </Example>
  )
}

function SelectShowcase() {
  return (
    <Example>
      <div className="flex flex-wrap items-start gap-8">
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
      </div>
    </Example>
  )
}

function SegmentedControlShowcase() {
  const [appearance, setAppearance] = useState("light")
  const [device, setDevice] = useState("desktop")
  const [range, setRange] = useState("30d")
  return (
    <Example>
      <ExampleRows>
        <ExampleRow label="icon + label">
          <SegmentedControl
            ariaLabel="Appearance"
            value={appearance}
            onValueChange={setAppearance}
            options={[
              { value: "light", icon: "bulb", label: "Light" },
              { value: "dark", icon: "cloud", label: "Dark" },
            ]}
          />
        </ExampleRow>
        <ExampleRow label="icon only">
          <SegmentedControl
            ariaLabel="Preview size"
            value={device}
            onValueChange={setDevice}
            options={[
              { value: "desktop", icon: "device-desktop", title: "Desktop" },
              { value: "tablet", icon: "device-tablet", title: "Tablet" },
              { value: "mobile", icon: "device-mobile", title: "Mobile" },
            ]}
          />
        </ExampleRow>
        <ExampleRow label="text · sm">
          <SegmentedControl
            size="sm"
            ariaLabel="Date range"
            value={range}
            onValueChange={setRange}
            options={[
              { value: "7d", label: "7 days" },
              { value: "30d", label: "30 days" },
              { value: "90d", label: "90 days" },
            ]}
          />
        </ExampleRow>
      </ExampleRows>
    </Example>
  )
}

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
    <>
      <Group label="One dropdown, versatile rows (open them)">
        <Example>
          <div className="flex flex-wrap items-start gap-3">
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
          </div>
        </Example>
      </Group>
      <Group label="The contract">
        <Example>
          <p className="text-sm leading-relaxed text-muted-foreground">
            One surface, one row. The leading slot is an <b className="font-semibold text-foreground">icon</b> (action
            rows) or a <b className="font-semibold text-foreground">checkbox</b> (multi-select, stays open); an optional{" "}
            <b className="font-semibold text-foreground">search</b> field sits on top. Every part (surface, rows, and
            search) is 16px squircle (<code className="text-[13px]">--ctl-radius</code>) with the same light hover
            (<code className="text-[13px]">--ctl-hover</code>), the same soft card shadow, and always drops below the
            trigger. The three-dot kebab is the same dropdown with a span trigger.
          </p>
        </Example>
      </Group>
    </>
  )
}

/* ---------------- Surfaces ---------------- */

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

// The Card component shows itself: real Cards on the page grey (no wrapping surface),
// so the tray reads against the background exactly as it does in production.
function CardShowcase() {
  return (
    <div className="flex flex-col gap-8">
      {/* Full anatomy: header + one surface + footer */}
      <div className="max-w-xl">
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

      {/* Wide: a surface holding a big chart */}
      <div>
        <Card>
          <CardHeader title="Active users" onClose={() => {}} action={<IconButton icon="pin-filled" motion="rotate" size={36} iconSize={18} aria-label="Pin" />} />
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
      </div>
    </div>
  )
}

function CtaShowcase() {
  return (
    <Example tray="max-w-sm">
      <div className="space-y-4">
        <CtaRow><Button variant="secondary">Skip</Button><Button>Start</Button></CtaRow>
        <CtaRow split><Button variant="ghost">Back</Button><Button revealIcon="arrow-right">Next</Button></CtaRow>
      </div>
    </Example>
  )
}

function SeparatorShowcase() {
  return (
    <Example>
      <div className="max-w-sm text-xs">
        <p className="py-1">Section one</p><Separator /><p className="py-1">Section two</p><Separator strong /><p className="py-1">After a strong divider</p>
        <div className="mt-4 flex h-8 items-center gap-4"><span>Left</span><Separator orientation="vertical" /><span>Middle</span><Separator orientation="vertical" /><span>Right</span></div>
      </div>
    </Example>
  )
}

function ScrollAreaShowcase() {
  return (
    <Example>
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
    </Example>
  )
}

/* ---------------- the page ---------------- */

export function BasePage() {
  return (
    <>
      <PageSection title="Atoms" desc="The parts that go inside controls: icons, the checkbox, the reveal-checkmark, and the badges / chips that ride as a trailing atom.">
        <PageItem title="Icons" desc="The Tabler set, one stroke, with the draw-in + hover treatments. These drop into a button, a dropdown row, a field, or a nav item.">
          <IconsShowcase />
        </PageItem>
        <PageItem title="Checkbox" desc="The tick that rides in a multi-select dropdown row or a checklist.">
          <CheckboxShowcase />
        </PageItem>
        <PageItem title="Checkmark" desc="The standalone reveal-check (the disc that fills on a selected choice / select row).">
          <CheckmarkShowcase />
        </PageItem>
        <PageItem title="Badges & chips" desc="Count chips + status badges: a trailing atom on a nav row or a dropdown item.">
          <BadgeShowcase />
        </PageItem>
      </PageSection>

      <PageSection title="Molecules" desc="The button / input family: one versatile control that carries atoms on either side, in every variant, plus the field siblings and the one dropdown.">
        <PageItem title="Button" desc="One versatile control (primary / secondary / tertiary / ghost + the icon-only IconButton). It carries any atom on the left or right and reads the same in a nav, a card, a dropdown, or a toolbar. All 16px squircle, one hover, one focus ring.">
          <ButtonShowcase />
        </PageItem>
        <PageItem title="Input & label" desc="The text field and its label are one pairing; a label is just the field's caption, so they live together.">
          <InputShowcase />
          <LabelShowcase />
        </PageItem>
        <PageItem title="Textarea" desc="The multi-line field sibling.">
          <TextareaShowcase />
        </PageItem>
        <PageItem title="Select" desc="The single-value dropdown: pick one, it closes and shows the value + a check on the chosen row. Same surface + rows as the dropdown; it drops below the trigger.">
          <SelectShowcase />
        </PageItem>
        <PageItem title="Segmented control" desc="A compact tabbed button group: pick one and the selection slides between segments. For a small view / size or setting toggle, icon-only or icon + label. Built on tabs, so arrow keys move between segments.">
          <SegmentedControlShowcase />
        </PageItem>
        <PageItem title="Dropdown" desc="The same surface used for actions or multi-select: action rows (leading icon), checkbox rows (multi, stay open), an optional search header, or a bare kebab trigger. One dropdown, versatile rows.">
          <DropdownShowcase />
        </PageItem>
      </PageSection>

      <PageSection title="Surfaces" desc="The non-control layout pieces: the content Card itself, the CTA row, dividers, and the scroll area.">
        <PageItem title="Card" desc="The content-area container: a gray tray (36px, hairline, 4px gutter) holding an optional header + footer and one or more white surfaces (30px, faint xs shadow). All content lives in a surface; cards group and label it. Not for modals, notifications, or menus.">
          <CardShowcase />
        </PageItem>
        <PageItem title="CTA row" desc="A button pairing (a molecule laid out as a row).">
          <CtaShowcase />
        </PageItem>
        <PageItem title="Separator">
          <SeparatorShowcase />
        </PageItem>
        <PageItem title="Scroll area" desc="The 2px reveal-on-scroll thin scrollbar.">
          <ScrollAreaShowcase />
        </PageItem>
      </PageSection>
    </>
  )
}
