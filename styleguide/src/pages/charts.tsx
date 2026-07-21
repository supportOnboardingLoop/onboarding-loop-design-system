import { PageIntro, PageSection, PageItem, Caption } from "../page-kit"
import { IconButton } from "@/components/base/icon-button"
import { Button } from "@/components/base/button"
import { Icon } from "@/components/base/icon"
import { Card, CardSurface } from "@/components/base/card"
import {
  ChartCard,
  StatTile,
  BarList,
  ColumnChart,
  TrendChart,
  DonutChart,
  StackedBar,
  FunnelChart,
  DistributionChart,
  Meter,
  Gauge,
  MultiLineChart,
  StackedColumns,
  Heatmap,
} from "@/components/product/charts"

// activity by weekday × time-of-day (relative volume) for the heatmap sample
const ACTIVITY = [
  [2, 5, 9, 14, 18, 12, 6],
  [4, 10, 22, 30, 26, 14, 7],
  [3, 12, 28, 40, 34, 18, 9],
  [3, 9, 20, 27, 24, 12, 6],
  [1, 4, 8, 11, 9, 5, 3],
]

// a bell-ish, right-skewed distribution (freq per comp bucket) for the samples
const SALARY = [8, 10, 12, 15, 20, 27, 36, 47, 58, 70, 80, 88, 94, 98, 100, 99, 96, 92, 86, 79, 71, 62, 53, 44, 36, 29, 23, 18, 14, 10]
const SALARY_UX = [6, 9, 13, 19, 28, 40, 55, 72, 88, 97, 100, 95, 84, 70, 56, 43, 32, 23, 16, 11]

/* ============================================================================
   Charts — the analytics chart kit page.

   Every chart sits in a real <ChartCard> (title in the grey header, plot in the
   white surface). The kit is prop-driven, so one component renders many stories;
   the samples below are the shapes an analytics report is built from. Each grid
   uses auto-fill so the same chart proves it reads as a wide hero card and as a
   small tile side by side — and on mobile.
   ========================================================================== */

// a subtle header affordance, to show the ChartCard action slot
const MoreAction = <IconButton icon="dots-vertical" size={32} aria-label="Chart options" />

// responsive grids
const gridSmall = "grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(280px,1fr))]"
const gridWide = "grid gap-4 [grid-template-columns:repeat(auto-fill,minmax(440px,1fr))]"

export function ChartsPage() {
  return (
    <div className="flex flex-col">
      <PageIntro>
        A flexible set of analytics charts, each built on the Card system: the title rides the grey header, the plot
        lives in the white surface. Single-series and comparison charts carry the brand hue, so they re-skin with the
        client; part-to-whole charts use a curated, colorblind-checked categorical palette. Every chart is fluid and
        re-lays-out to its card, from a full-width hero down to a small tile on mobile.
      </PageIntro>

      {/* ============================= STAT & TREND ============================= */}
      <PageSection title="Stat & trend" desc="Lead a report with the headline number, then the shape of the change over time.">
        <PageItem title="Stat tiles" desc="A label, a hero value, an optional signed delta and inline sparkline. The delta colors by whether the movement is good, not merely by its sign.">
          <div className={gridSmall}>
            <ChartCard title="Total sales">
              <StatTile label="Last 30 days" value={250000} fmt={{ currency: "$" }} delta={42} period="vs prior 30 days" spark={[6, 6.5, 5, 7, 6.2, 8, 9, 7.4, 8.6, 9.4, 8.8, 9.6]} />
            </ChartCard>
            <ChartCard title="New customers">
              <StatTile label="Last 30 days" value={1284} delta={8.2} period="vs prior 30 days" spark={[3, 3.4, 3.2, 4, 4.6, 4.2, 5, 5.4, 5.1, 5.8, 6, 6.4]} />
            </ChartCard>
            <ChartCard title="Refund rate">
              <StatTile label="Last 30 days" value="2.4%" delta={-0.6} period="vs prior 30 days" goodWhen="down" spark={[4, 3.8, 4.1, 3.6, 3.4, 3.5, 3.1, 3.2, 2.9, 2.8, 2.6, 2.4]} />
            </ChartCard>
          </div>
          <Caption>StatTile · number-only KPI. Refund rate uses goodWhen="down", so a decrease reads green.</Caption>
        </PageItem>

        <PageItem title="Trend" desc="A line/area over time with an optional comparison period (same hue, lightened and dashed) and a hero stat above the plot.">
          <ChartCard title="Total sales" action={MoreAction}>
            <TrendChart
              stat={{ label: "Jun 6–Jul 5, 2023", value: 250000, delta: 42, period: "vs prior period" }}
              fmt={{ currency: "$" }}
              labels={["Jun 6", "Jun 10", "Jun 14", "Jun 18", "Jun 22", "Jun 26", "Jun 30", "Jul 5"]}
              series={[
                { name: "Jun 6–Jul 5, 2023", values: [6800, 8600, 6200, 9000, 4200, 6600, 7200, 5800], variant: "brand", area: true },
                { name: "May 7–Jun 5, 2023", values: [4600, 3800, 5200, 3000, 4200, 2600, 5400, 8800], variant: "compare" },
              ]}
            />
          </ChartCard>
        </PageItem>
      </PageSection>

      {/* ============================= BAR CHARTS ============================= */}
      <PageSection title="Bar charts" desc="Compare magnitudes across categories, in either orientation.">
        <PageItem title="Horizontal bars" desc="Ranked magnitude — length carries the value, the value sits at the tip. A single series, so it takes the brand gradient. Shown wide, then as a compact tile.">
          <div className={gridWide}>
            <ChartCard title="Gross sales by country" action={MoreAction}>
              <BarList
                fmt={{ currency: "$" }}
                data={[
                  { label: "United States", value: 10000 },
                  { label: "Canada", value: 8000 },
                  { label: "France", value: 7500 },
                  { label: "United Kingdom", value: 7000 },
                  { label: "Mexico", value: 6000 },
                ]}
              />
            </ChartCard>
            <ChartCard title="Top referrers">
              <BarList
                data={[
                  { label: "Google", value: 4820 },
                  { label: "Direct", value: 3110 },
                  { label: "Instagram", value: 1940 },
                  { label: "Newsletter", value: 1220 },
                ]}
              />
            </ChartCard>
          </div>
        </PageItem>

        <PageItem title="Columns & comparison" desc="Vertical columns over a time axis. Add a comparison series and the current period stays brand while the comparison lightens; a legend appears automatically.">
          <ChartCard title="Sessions over time" action={MoreAction}>
            <ColumnChart
              series={["Jun 6–Jul 5, 2023", "Apr 22–Apr 28, 2024"]}
              data={[
                { label: "Jun 6", value: 9000, compare: 6300 },
                { label: "Jun 14", value: 5400, compare: 7700 },
                { label: "Jun 22", value: 7200, compare: 4500 },
                { label: "Jul 5", value: 6300, compare: 8600 },
              ]}
            />
          </ChartCard>
        </PageItem>
      </PageSection>

      {/* ============================= PART-TO-WHOLE ============================= */}
      <PageSection title="Part-to-whole" desc="Show composition — how a total splits across categories — with the curated categorical palette.">
        <PageItem title="Donut" desc="A ring with the total in the hole and a value legend beside it. Overflow beyond the legend cap folds into “+N more”. The legend wraps under the ring on a narrow card.">
          <div className={gridWide}>
            <ChartCard title="Sessions by device" action={MoreAction}>
              <DonutChart
                centerLabel="Sessions"
                data={[
                  { label: "Mobile", value: 35000 },
                  { label: "Desktop", value: 32000 },
                  { label: "Tablet", value: 26000 },
                  { label: "Other", value: 9000 },
                  { label: "Bot", value: 3000 },
                ]}
              />
            </ChartCard>
            <ChartCard title="Revenue by channel">
              <DonutChart
                centerLabel="Revenue"
                fmt={{ currency: "$" }}
                data={[
                  { label: "Organic", value: 48200 },
                  { label: "Paid", value: 31500 },
                  { label: "Email", value: 18900 },
                  { label: "Social", value: 12400 },
                ]}
              />
            </ChartCard>
          </div>
        </PageItem>

        <PageItem title="Stacked bar" desc="A single 100%-width bar split into its parts, with a value legend above. 2px surface gaps separate the segments; the tail folds into “+N more”.">
          <ChartCard title="Sales by product name" action={MoreAction}>
            <StackedBar
              fmt={{ currency: "$" }}
              data={[
                { label: "Wool cap", value: 5000 },
                { label: "Crewneck", value: 3000 },
                { label: "Blouse", value: 2000 },
                { label: "T-shirt", value: 900 },
                { label: "Long sleeve", value: 900 },
                { label: "Beanie", value: 600 },
                { label: "Scarf", value: 500 },
                { label: "Socks", value: 300 },
              ]}
            />
          </ChartCard>
        </PageItem>
      </PageSection>

      {/* ============================= FUNNEL ============================= */}
      <PageSection title="Funnel" desc="Stage-to-stage conversion: each column scales to the top of the funnel, and the light region carries the drop-off from the prior stage.">
        <ChartCard title="Email publishing funnel" action={MoreAction}>
          <FunnelChart
            summary={[
              { label: "Total conversion rate", value: "1.61%" },
              { label: "Average conversion time", value: "43d 3m" },
            ]}
            steps={[
              { label: "Companies with email access", value: 682 },
              { label: "Added domain", value: 140 },
              { label: "Verified domain", value: 93 },
              { label: "Email address added", value: 44 },
              { label: "Email created", value: 22 },
              { label: "Email published", value: 11 },
            ]}
          />
        </ChartCard>
      </PageSection>

      {/* ============================= DISTRIBUTION ============================= */}
      <PageSection title="Distribution" desc="A histogram of thin pill columns forming a curve, with LOW / MEDIAN / HIGH markers and min/median/max captions. Colour is a sequential brand ramp light→dark across the range, so it re-skins with the client.">
        <PageItem title="Salary explorer" desc="The distribution in context: a rich card header (breadcrumb, region, median comp, filters) over the chart in the surface. Everything but the plot is neutral and re-skins; drive the whole thing from one data array.">
          <Card>
            {/* rich header on the tray gray */}
            <div className="flex flex-col gap-4 px-3 pt-2.5 pb-1.5">
              <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-3">
                <div className="flex flex-col gap-2">
                  <span className="text-sm text-muted-foreground">Salary Explorer <span className="px-1 text-border-strong">/</span></span>
                  <div className="flex items-center gap-2.5">
                    <span className="text-[26px] leading-none" aria-hidden>🇦🇱</span>
                    <h3 className="text-2xl font-bold tracking-[-0.02em] text-foreground">Albania</h3>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2 text-right">
                  <span className="text-sm text-muted-foreground">Annual median total comp.</span>
                  <span className="text-2xl font-bold tracking-[-0.02em] text-foreground">
                    $45,000 <span className="text-xl font-semibold text-muted-foreground">USD</span>
                  </span>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
                <div className="flex items-center gap-1.5">
                  <Button variant="secondary" size="sm">All</Button>
                  <Button variant="ghost" size="sm">UX</Button>
                  <Button variant="ghost" size="sm">PM</Button>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="secondary" size="sm">USD <Icon name="chevron-down" size={16} /></Button>
                  <Button size="sm">Add salary</Button>
                </div>
              </div>
            </div>
            <CardSurface className="px-5 pt-7 pb-4">
              <DistributionChart
                data={SALARY}
                range={[22000, 72000]}
                fmt={{ currency: "$" }}
                low={{ caption: "22k" }}
                median={{ caption: "45k" }}
                high={{ caption: "72k" }}
              />
            </CardSurface>
          </Card>
          <Caption>DistributionChart · one array of frequencies + low/median/high captions. The bars carry the brand hue as a light→dark ramp; the median pill and its leader are the emphasis.</Caption>
        </PageItem>

        <PageItem title="Compact" desc="The same component in a small tile — fewer buckets, shorter plot — to show it holds up at any size.">
          <div className={gridWide}>
            <ChartCard title="UX designers · comp spread">
              <DistributionChart
                data={SALARY_UX}
                range={[28000, 61000]}
                fmt={{ currency: "$" }}
                height={180}
                low={{ caption: "28k" }}
                median={{ caption: "42k" }}
                high={{ caption: "61k" }}
              />
            </ChartCard>
          </div>
        </PageItem>
      </PageSection>

      {/* ============================= PROGRESS & METERS ============================= */}
      <PageSection title="Progress & meters" desc="A single metric against a target: a linear meter (fill carries the value or a severity tone), an optional target tick for a bullet-style goal, and a radial gauge.">
        <PageItem title="Meters" desc="Fill = value, track = the quiet well. Pass a tone for severity, or a target to draw the goal tick.">
          <div className={gridWide}>
            <ChartCard title="This month">
              <div className="flex flex-col gap-5">
                <Meter label="Revenue goal" value={82000} max={100000} fmt={{ currency: "$" }} target={90000} />
                <Meter label="Active seats" value={214} max={250} />
                <Meter label="Storage used" value={8.6} max={10} tone="warning" />
                <Meter label="Error budget spent" value={96} max={100} tone="danger" />
              </div>
            </ChartCard>
            <ChartCard title="Onboarding completion">
              <div className="flex flex-col gap-5">
                <Meter label="Profile" value={100} tone="success" />
                <Meter label="First workflow" value={100} tone="success" />
                <Meter label="Invited team" value={40} />
                <Meter label="Connected data" value={0} />
              </div>
            </ChartCard>
          </div>
          <Caption>Meter · tone = brand · success · warning · danger. A `target` prop adds the bullet-style goal tick.</Caption>
        </PageItem>

        <PageItem title="Gauges" desc="The radial variant: a 270° dial with the percentage in the middle. Same tones.">
          <ChartCard title="Service health">
            <div className="flex flex-wrap items-start justify-around gap-6">
              <Gauge label="Uptime" value={99} />
              <Gauge label="CPU load" value={68} tone="warning" />
              <Gauge label="Disk" value={92} tone="danger" />
              <Gauge label="Cache hit" value={84} tone="success" />
            </div>
          </ChartCard>
        </PageItem>
      </PageSection>

      {/* ============================= TRENDS & COMPOSITION ============================= */}
      <PageSection title="Trends & composition" desc="Several entities over time, and how a total breaks down over time.">
        <PageItem title="Multi-series line" desc="3–5 distinct series in the categorical palette, with a legend and a crosshair that reads every series at once. This is where the categorical palette earns its keep on a time axis.">
          <ChartCard title="Sessions by channel" action={MoreAction}>
            <MultiLineChart
              labels={["Wk 1", "Wk 2", "Wk 3", "Wk 4", "Wk 5", "Wk 6", "Wk 7", "Wk 8"]}
              series={[
                { name: "Organic", values: [4200, 4600, 4400, 5200, 5600, 6100, 5900, 6800] },
                { name: "Paid", values: [3100, 3400, 3900, 3600, 4200, 4000, 4600, 4400] },
                { name: "Email", values: [1800, 2100, 2000, 2600, 2400, 2900, 3200, 3000] },
                { name: "Social", values: [900, 1200, 1600, 1400, 2100, 1900, 2400, 2600] },
              ]}
            />
          </ChartCard>
        </PageItem>

        <PageItem title="Stacked columns" desc="Composition over time: each column split into categorical segments (2px surface gaps), summing to the period total. Hover a column for the full breakdown.">
          <ChartCard title="Revenue by product" action={MoreAction}>
            <StackedColumns
              fmt={{ currency: "$" }}
              series={["Core", "Pro", "Enterprise", "Add-ons"]}
              data={[
                { label: "Jan", values: [42000, 28000, 18000, 9000] },
                { label: "Feb", values: [45000, 31000, 22000, 10000] },
                { label: "Mar", values: [47000, 34000, 26000, 12000] },
                { label: "Apr", values: [51000, 38000, 31000, 14000] },
                { label: "May", values: [54000, 42000, 35000, 15000] },
                { label: "Jun", values: [58000, 47000, 41000, 17000] },
              ]}
            />
          </ChartCard>
        </PageItem>
      </PageSection>

      {/* ============================= HEATMAP ============================= */}
      <PageSection title="Heatmap" desc="Value on a grid, shaded on the sequential brand ramp (light→dark = low→high). Activity day×hour, cohort retention, correlation matrices.">
        <ChartCard title="Activity by day & time" action={MoreAction}>
          <Heatmap
            rows={["Morning", "Midday", "Afternoon", "Evening", "Night"]}
            cols={["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]}
            data={ACTIVITY}
            fmt={{ unit: "k" }}
          />
        </ChartCard>
      </PageSection>
    </div>
  )
}
