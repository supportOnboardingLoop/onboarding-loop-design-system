import type { ReactNode } from "react"
import { Button } from "@/components/button"
import { Input } from "@/components/input"
import { Label } from "@/components/label"
import { Badge } from "@/components/badge"
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  CardAction,
} from "@/components/card"
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/select"

const variants = ["default", "outline", "secondary", "ghost", "destructive", "link"] as const
const sizes = ["xs", "sm", "default", "lg"] as const

// charts parked as a neutral gray ramp (real categorical palette is a later decision)
const charts = [
  { n: 1, hex: "#262626" },
  { n: 2, hex: "#666666" },
  { n: 3, hex: "#919191" },
  { n: 4, hex: "#bfbfbf" },
  { n: 5, hex: "#e5e5e5" },
]
const bars = [62, 90, 45, 78, 55]

function Row({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex items-center gap-4 border-b border-border py-3 last:border-b-0">
      <div className="w-28 shrink-0 text-xs font-medium text-muted-foreground">{label}</div>
      <div className="flex flex-wrap items-center gap-3">{children}</div>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-12">
      <h2 className="mb-3 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{title}</h2>
      <div className="rounded-lg border border-border bg-card px-5 shadow-sm">{children}</div>
    </section>
  )
}

export default function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-3xl px-8 py-14">
        <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Loop Design System · Styleguide
        </p>
        <h1 className="mb-1 text-3xl font-semibold tracking-tight">Base primitives</h1>
        <p className="mb-12 max-w-prose text-sm text-muted-foreground">
          The real components exported from the library, on Base UI and the neutral tokens. One neutral
          system; only functional status colors carry hue.
        </p>

        <Section title="Button · variants">
          {variants.map((v) => (
            <Row key={v} label={v}>
              <Button variant={v}>Button</Button>
              <Button variant={v}>Get started</Button>
            </Row>
          ))}
        </Section>

        <Section title="Button · sizes">
          {sizes.map((s) => (
            <Row key={s} label={s}>
              <Button size={s}>Button</Button>
              <Button size={s} variant="outline">
                Outline
              </Button>
            </Row>
          ))}
        </Section>

        <Section title="Button · states">
          <Row label="default">
            <Button>Button</Button>
          </Row>
          <Row label="disabled">
            <Button disabled>Button</Button>
          </Row>
          <Row label="invalid">
            <Button aria-invalid>Button</Button>
          </Row>
        </Section>

        <Section title="Input &amp; Label">
          <div className="max-w-sm space-y-4 py-6">
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="you@example.com" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="disabled-input">Disabled</Label>
              <Input id="disabled-input" placeholder="Disabled" disabled />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="invalid-input">Invalid</Label>
              <Input id="invalid-input" defaultValue="not-an-email" aria-invalid />
            </div>
          </div>
        </Section>

        <Section title="Select">
          <div className="py-6">
            <Select defaultValue="Apple">
              <SelectTrigger className="w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Apple">Apple</SelectItem>
                <SelectItem value="Banana">Banana</SelectItem>
                <SelectItem value="Cherry">Cherry</SelectItem>
                <SelectItem value="Dragonfruit">Dragonfruit</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </Section>

        <Section title="Card">
          <div className="py-6">
            <Card className="max-w-sm">
              <CardHeader>
                <CardTitle>Weekly digest</CardTitle>
                <CardDescription>A summary of what shipped this week.</CardDescription>
                <CardAction>
                  <Button size="sm" variant="outline">
                    Open
                  </Button>
                </CardAction>
              </CardHeader>
              <CardContent className="text-muted-foreground">
                Cards use the neutral surface, a hairline border, and the small shadow token.
              </CardContent>
              <CardFooter className="border-t">
                <span className="text-muted-foreground">Updated just now</span>
              </CardFooter>
            </Card>
          </div>
        </Section>

        <Section title="Badge · status">
          <div className="flex flex-wrap gap-2 py-6">
            <Badge variant="neutral">Neutral</Badge>
            <Badge variant="success">Active</Badge>
            <Badge variant="warning">Pending</Badge>
            <Badge variant="error">Failed</Badge>
          </div>
        </Section>

        <Section title="Charts · neutral (parked)">
          <div className="flex flex-wrap items-end gap-12 py-7">
            <div className="flex gap-3">
              {charts.map((c) => (
                <div key={c.n} className="text-center">
                  <div
                    className="h-14 w-14 rounded-md border border-border"
                    style={{ background: `var(--chart-${c.n})` }}
                  />
                  <div className="mt-1.5 text-[11px] font-medium">chart-{c.n}</div>
                  <div className="text-[10px] tabular-nums text-muted-foreground">{c.hex}</div>
                </div>
              ))}
            </div>
            <div className="flex h-32 items-end gap-2.5">
              {bars.map((h, i) => (
                <div
                  key={i}
                  className="w-11 rounded-t-md"
                  style={{ height: `${h}%`, background: `var(--chart-${i + 1})` }}
                />
              ))}
            </div>
          </div>
        </Section>
      </div>
    </div>
  )
}
