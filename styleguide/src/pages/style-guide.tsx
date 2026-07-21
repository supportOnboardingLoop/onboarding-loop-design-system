import { PageSection, PageItem, Example, PageIntro } from "../page-kit"

/* ---------------- Color ---------------- */

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

/* ---------------- token scales ---------------- */

const typeScale = [
  ["3xl", 36, 700], ["2xl", 28, 700], ["xl", 22, 700], ["lg", 18, 600],
  ["md", 16, 600], ["base", 14, 500], ["sm", 13, 500], ["xs", 12, 500],
] as const
const radii = [["sm", 8], ["base", 12], ["lg", 16], ["xl", 24], ["pill", 9999]] as const
const spaces = [["1", 4], ["2", 8], ["3", 12], ["4", 16], ["5", 20], ["6", 24], ["8", 32]] as const
const elevations = [["control", "shadow-control", "Raised buttons, dropdown triggers"], ["pop", "shadow-pop", "Popovers, floating menus"], ["card", "shadow-card", "Cards, surfaces (3-layer)"]] as const
const eases = [["ease-back", "cubic-bezier(.68,-.6,.32,1.6)", "Build in / out (bounce both ends)"], ["ease-emphasized", "cubic-bezier(.22,1,.36,1)", "Reveals, width expands"], ["ease-standard", "cubic-bezier(.2,.8,.2,1)", "House ease-out"]] as const

/* ---------------- the page ---------------- */

export function StyleGuidePage() {
  return (
    <>
      <PageIntro>
        The foundations the whole system is built on: one neutral scale that the brand tints, the type ramp, and the
        radius / spacing / elevation / motion tokens. Change the Brand in the sidebar to watch the palette move.
      </PageIntro>

      <PageSection title="Color" desc="One ordered neutral ramp plus the readable role vocabulary layered on top. The brand is the only role that carries hue on purpose.">
        <PageItem title="Neutral scale" desc="One ordered ramp, light → dark. Each step holds a fixed lightness and borrows its hue from the brand, so a grey brand stays perfectly neutral and a coloured brand leans the whole ramp a hair its way.">
          <Example>
            <div className="flex flex-wrap gap-2">{neutralScale.map((t) => <ScaleChip key={t} token={t} />)}</div>
          </Example>
        </PageItem>
        <PageItem title="Surface roles" desc="The readable names for surfaces and lines, each pointing at one scale step.">
          <Example>
            <div className="grid gap-4 sm:grid-cols-2">{surfaceRoles.map(([t, u]) => <RoleSwatch key={t} token={t} use={u} />)}</div>
            <p className="mt-5 border-t border-border pt-4 text-[11px] leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">Depth.</span> The page background is the lightest step; a card's
              tray + footer sit one step darker (<span className="font-mono">canvas</span>) and its content wells are white
              (<span className="font-mono">surface</span>), so a card reads as a recessed tray holding raised wells. A row's
              hover borrows the background (lighter); the selected row borrows canvas (a step darker).
            </p>
          </Example>
        </PageItem>
        <PageItem title="Text roles" desc="Icons, meta, body ink, and the brand.">
          <Example>
            <div className="grid gap-4 sm:grid-cols-2">{textRoles.map(([t, u]) => <RoleSwatch key={t} token={t} use={u} />)}</div>
            <p className="mt-5 border-t border-border pt-4 text-[11px] leading-relaxed text-muted-foreground">
              <span className="font-semibold text-foreground">Aliases</span> (kept for utilities): {aliases}
            </p>
          </Example>
        </PageItem>
        <PageItem title="Status" desc="The only functional hues, reserved for state, never for brand.">
          <Example>
            <div className="flex flex-wrap gap-3">{statusRoles.map((r) => <StatusSwatch key={r} role={r} />)}</div>
          </Example>
        </PageItem>
      </PageSection>

      <PageSection title="Tokens" desc="The measurement and motion scales the whole UI is built on: type, radius, spacing, elevation, and easing.">
        <PageItem title="Typography" desc="Inter. base 14 = default body / control / label. Weights: control 500, field label 600, card title 700.">
          <Example>
            <div className="space-y-3">
              {typeScale.map(([name, px, wt]) => (
                <div key={name} className="flex items-baseline gap-5 border-b border-border pb-3 last:border-b-0">
                  <span className="w-16 shrink-0 text-xs text-muted-foreground tabular-nums">{name} · {px}</span>
                  <span style={{ fontSize: px, fontWeight: wt, letterSpacing: px >= 22 ? "-0.02em" : px >= 15 ? "-0.01em" : 0 }}>Agent-led design</span>
                </div>
              ))}
            </div>
          </Example>
        </PageItem>

        <PageItem title="Radius" desc="Squircle on rects (controls 16, cards 24). Circles stay round.">
          <Example>
            <div className="flex flex-wrap items-end gap-6">
              {radii.map(([name, r]) => (
                <div key={name} className="text-center">
                  <div className="size-20 border border-border-strong bg-fill [corner-shape:squircle]" style={{ borderRadius: r === 9999 ? 9999 : r }} />
                  <div className="mt-1.5 text-[11px] font-medium">{name}</div>
                  <div className="text-[10px] text-muted-foreground tabular-nums">{r === 9999 ? "pill" : `${r}px`}</div>
                </div>
              ))}
            </div>
          </Example>
        </PageItem>

        <PageItem title="Spacing" desc="4px base. Default gap 8, card gap 12 / pad 18, header pad 16.">
          <Example>
            <div className="space-y-2.5">
              {spaces.map(([name, px]) => (
                <div key={name} className="flex items-center gap-4">
                  <span className="w-14 shrink-0 text-xs text-muted-foreground tabular-nums">space-{name}</span>
                  <div className="h-4 rounded-sm bg-primary" style={{ width: px }} />
                  <span className="text-[11px] text-muted-foreground tabular-nums">{px}px</span>
                </div>
              ))}
            </div>
          </Example>
        </PageItem>

        <PageItem title="Elevation" desc="Three shadows: control, popover, and the card lift.">
          <Example>
            <div className="flex flex-wrap gap-8">
              {elevations.map(([name, cls, desc]) => (
                <div key={name} className="w-52">
                  <div className={`flex h-20 items-center justify-center rounded-xl border border-border bg-card text-sm font-semibold ${cls}`}>{name}</div>
                  <div className="mt-2 text-[11px] text-muted-foreground">{desc}</div>
                </div>
              ))}
            </div>
          </Example>
        </PageItem>

        <PageItem title="Motion" desc="Hover a track to run its curve. Snap duration .3s.">
          <Example>
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
          </Example>
        </PageItem>
      </PageSection>
    </>
  )
}
