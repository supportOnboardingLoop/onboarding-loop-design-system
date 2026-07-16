import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { NavItem } from "@/components/product/nav-item"
import { CollapsibleSection } from "@/components/product/section"
import { AccountCard } from "@/components/product/account-card"
import { LauncherPill } from "@/components/product/launcher"
import { Icon } from "@/components/base/icon"
import { Label } from "@/components/base/label"
import { Input } from "@/components/base/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/base/select"
import { NAV } from "./showcases"

// The styleguide home, built ON the design system: the starter-layout card shell,
// mapped to a 3-column docs frame — primary nav card + a DS-customization sub-nav
// card (live font/theme/avatar re-skin) + the grey content canvas holding the docs
// and the docked agent launcher.

const FONTS: Record<string, string> = {
  Inter: '"Inter", system-ui, sans-serif',
  Poppins: '"Poppins", system-ui, sans-serif',
  "DM Sans": '"DM Sans", system-ui, sans-serif',
  Manrope: '"Manrope", system-ui, sans-serif',
}
const THEMES: Record<string, { primary: string; tint: string } | null> = {
  Neutral: null,
  Heatmap: { primary: "#10b068", tint: "#e7fdef" },
  LinkedIn: { primary: "#0068c9", tint: "#e6f0fb" },
}
const AGENTS: Record<string, { name: string; role: string; src: string }> = {
  Wilson: { name: "Wilson", role: "Heatmap agent", src: "/avatars/heatmap-agent.png" },
  Bal: { name: "Bal", role: "Onboarding guide", src: "/avatars/bal-agent.png" },
}

function applyTheme(name: string, hex: string) {
  const s = document.documentElement.style
  const clear = () => {
    s.removeProperty("--primary")
    s.removeProperty("--accent-tint")
    s.removeProperty("--primary-foreground")
  }
  if (/^#([0-9a-f]{6})$/i.test(hex)) {
    s.setProperty("--primary", hex)
    s.setProperty("--accent-tint", `color-mix(in srgb, ${hex} 12%, white)`)
    s.setProperty("--primary-foreground", "#fff")
    return
  }
  const t = THEMES[name]
  if (!t) return clear()
  s.setProperty("--primary", t.primary)
  s.setProperty("--accent-tint", t.tint)
  s.setProperty("--primary-foreground", "#fff")
}

export default function App() {
  const flat = NAV.flatMap((g) => g.items)
  const [selected, setSelected] = useState(flat[0]?.id)
  const [navCollapsed, setNavCollapsed] = useState(false)
  const [subCollapsed, setSubCollapsed] = useState(false)
  const [dark, setDark] = useState(false)
  const [font, setFont] = useState("Inter")
  const [theme, setTheme] = useState("Neutral")
  const [hex, setHex] = useState("")
  const [agentKey, setAgentKey] = useState("Wilson")

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])
  useEffect(() => {
    document.documentElement.style.setProperty("--font-family", FONTS[font])
  }, [font])
  useEffect(() => {
    applyTheme(theme, hex)
  }, [theme, hex])

  const current = flat.find((i) => i.id === selected)
  const group = NAV.find((g) => g.items.some((i) => i.id === selected))
  const agent = AGENTS[agentKey]

  return (
    <div
      className="grid h-screen gap-0 bg-card p-1 transition-[grid-template-columns] duration-[380ms] ease-[cubic-bezier(0.2,0.8,0.2,1)]"
      style={{
        gridTemplateColumns: `${navCollapsed ? 68 : 272}px 4px ${subCollapsed ? 0 : 272}px ${subCollapsed ? 0 : 4}px minmax(0,1fr)`,
      }}
    >
      {/* ================= COLUMN 1: primary nav card ================= */}
      <aside className="col-start-1 flex flex-col overflow-hidden rounded-3xl [corner-shape:squircle] border border-border bg-card">
        <header className={cn("relative flex h-[60px] shrink-0 items-center gap-2.5 px-3", navCollapsed ? "justify-center" : "pr-3 pl-5")}>
          {!navCollapsed && (
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="grid size-8 shrink-0 place-items-center rounded-[9px] [corner-shape:squircle] bg-primary text-[15px] font-extrabold text-primary-foreground">L</span>
              <span className="truncate text-base font-bold tracking-[-0.01em]">Loop DS</span>
            </div>
          )}
          <button
            type="button"
            aria-label={navCollapsed ? "Expand navigation" : "Collapse navigation"}
            onClick={() => setNavCollapsed((c) => !c)}
            className={cn("grid size-7 shrink-0 place-items-center rounded-lg [corner-shape:squircle] text-foreground transition-colors hover:bg-fill", !navCollapsed && "ml-auto")}
          >
            <Icon name={navCollapsed ? "chevrons-right" : "chevrons-left"} size={16} stroke={1.5} />
          </button>
          <span className="absolute inset-x-0 bottom-0 h-px bg-border" />
        </header>

        <nav className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto px-4 pt-3">
          {NAV.map((grp, gi) =>
            navCollapsed ? (
              <div key={grp.label}>
                {gi > 0 && <div className="mx-auto my-3.5 h-px w-9 bg-border" />}
                <div className="flex flex-col items-center gap-0.5">
                  {grp.items.map((item) => (
                    <NavItem key={item.id} icon={item.icon} collapsed current={selected === item.id} title={item.label} onClick={() => setSelected(item.id)}>
                      {item.label}
                    </NavItem>
                  ))}
                </div>
              </div>
            ) : (
              <CollapsibleSection key={grp.label} label={grp.label} count={grp.items.length} className={gi > 0 ? "mt-2" : undefined}>
                <div className="flex flex-col gap-0.5 pb-1">
                  {grp.items.length === 0 ? (
                    <div className="px-2.5 pb-2 text-[11px] leading-snug text-muted-foreground/60">{grp.empty}</div>
                  ) : (
                    grp.items.map((item) => (
                      <NavItem key={item.id} icon={item.icon} current={selected === item.id} onClick={() => setSelected(item.id)}>
                        {item.label}
                      </NavItem>
                    ))
                  )}
                </div>
              </CollapsibleSection>
            )
          )}
        </nav>

        <footer className={cn("flex shrink-0 flex-col gap-0.5 p-4 pt-3", navCollapsed && "items-center")}>
          <NavItem icon="bulb" collapsed={navCollapsed} title="Toggle theme" onClick={() => setDark((d) => !d)}>
            {dark ? "Light mode" : "Dark mode"}
          </NavItem>
          <AccountCard name="Bal Sieber" email="bal@onboardingloop.ai" initials="BS" online collapsed={navCollapsed} />
        </footer>
      </aside>

      {/* ================= COLUMN 2: DS-tools sub-nav card ================= */}
      {!subCollapsed && (
        <aside className="col-start-3 flex flex-col overflow-hidden rounded-3xl [corner-shape:squircle] border border-border bg-card">
          <header className="relative h-[108px] shrink-0">
            <img src={agent.src} alt="" className="absolute top-3.5 left-4 block h-[78px] w-[76px] object-contain" />
            <div className="absolute top-[53.5px] left-[100px] flex -translate-y-1/2 flex-col items-start gap-px whitespace-nowrap">
              <b className="text-[15px] leading-[1.35] font-bold">{agent.name}</b>
              <span className="text-[13px] leading-[1.35] text-muted-foreground">{agent.role}</span>
            </div>
            <button
              type="button"
              aria-label="Collapse tools"
              onClick={() => setSubCollapsed(true)}
              className="absolute top-3.5 right-3 grid size-7 place-items-center rounded-lg [corner-shape:squircle] text-foreground transition-colors hover:bg-fill"
            >
              <Icon name="chevrons-left" size={15} stroke={1.4} />
            </button>
            <span className="absolute inset-x-0 bottom-0 h-px bg-border" />
          </header>

          <div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4">
            <div className="space-y-1.5">
              <Label>Brand</Label>
              <Select value={theme} onValueChange={(v) => { setHex(""); setTheme(String(v)) }}>
                <SelectTrigger><SelectValue placeholder="Neutral" /></SelectTrigger>
                <SelectContent>
                  {Object.keys(THEMES).map((t) => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input value={hex} onChange={(e) => setHex(e.target.value)} placeholder="#hex (preview)" className="font-normal" />
            </div>

            <div className="space-y-1.5">
              <Label>Typeface</Label>
              <Select value={font} onValueChange={(v) => setFont(String(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.keys(FONTS).map((f) => (
                    <SelectItem key={f} value={f}>{f}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Agent</Label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(AGENTS).map(([key, a]) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setAgentKey(key)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-xl [corner-shape:squircle] border p-2 transition-[border-color,background]",
                      agentKey === key ? "border-primary bg-accent-tint" : "border-border-strong bg-card hover:bg-fill"
                    )}
                  >
                    <img src={a.src} alt="" className="h-12 w-12 object-contain" />
                    <span className="text-xs font-semibold">{a.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[11px] leading-relaxed text-muted-foreground/70">
              These controls re-skin the styleguide live. A brand hue is preview-only — the system's own brand is the neutral gray.
            </p>
          </div>
        </aside>
      )}

      {/* ================= COLUMN 3: content canvas ================= */}
      <main className="col-start-5 relative flex min-h-0 flex-col overflow-hidden rounded-3xl [corner-shape:squircle] bg-canvas">
        <header className="flex h-[60px] shrink-0 items-center gap-0 px-3.5">
          {subCollapsed && (
            <button
              type="button"
              aria-label="Open tools"
              onClick={() => setSubCollapsed(false)}
              className="mr-1 grid size-[46px] shrink-0 place-items-center"
            >
              <img src={agent.src} alt="" className="w-[46px] object-contain" />
            </button>
          )}
          <span className="mr-2 grid size-5 shrink-0 place-items-center text-foreground">
            <Icon name={current?.icon ?? "sparkles"} size={20} stroke={1.5} />
          </span>
          <h1 className="min-w-0 flex-1 truncate text-base font-bold tracking-[-0.01em]">{current?.label}</h1>
          <div className="ml-auto flex items-center gap-2">
            <span className="text-[13px] text-muted-foreground">{group?.label}</span>
            <button
              type="button"
              aria-label="Toggle dark mode"
              onClick={() => setDark((d) => !d)}
              className="grid size-8 place-items-center rounded-lg [corner-shape:squircle] border border-border-strong text-muted-foreground transition-colors hover:text-foreground"
            >
              <Icon name="bulb" size={16} stroke={1.5} />
            </button>
          </div>
        </header>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-10 pt-8 pb-28">{current?.render()}</div>
        </div>

        {/* docked launcher (default pill; the morph engine is a later stage) */}
        <div className="pointer-events-none absolute inset-x-0 bottom-5 flex justify-center">
          <LauncherPill agentName={agent.name} avatarSrc={agent.src} className="pointer-events-auto" />
        </div>
      </main>
    </div>
  )
}
