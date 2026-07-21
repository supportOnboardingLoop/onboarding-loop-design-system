import * as React from "react"

import { cn } from "@/lib/utils"
import { Icon } from "@/components/base/icon"
import { Label } from "@/components/base/label"
import { Input } from "@/components/base/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/base/select"
import { ColorPicker } from "@/components/product/color-picker"
import { CollapsibleSection } from "@/components/product/section"
import {
  FONTS,
  THEMES,
  AGENTS,
  applyTheme,
  applyFont,
  applyNeutralTint,
  resolveNeutralTint,
  themeLabel,
  blankDiscWithLogo,
  type AgentDef,
} from "./skins"

// ============================================================================
// Customize — the live re-skin controls (agent / primary color / typeface /
// appearance), extracted so the styleguide (App.tsx) and the demo (DemoApp.tsx)
// render the SAME panel and share ONE skin-state hook, rather than two copies.
//
//   • useSkinState — owns the skin choice (theme / font / agent / light-dark),
//     applies it to :root, and (optionally) persists it to localStorage. Lives
//     ABOVE any preset remount so switching SaaS never wipes the visitor's skin.
//   • CustomizePanel — the accordion body, driven entirely by that state.
//
// Branding is a property of the DEPLOY: the public demo lets the visitor drive
// this; a client build applies a fixed brand (clients.ts) and does NOT render
// this panel at all.
// ============================================================================

const HEX6 = /^#([0-9a-f]{6})$/i

// The customizable skin choice (public / styleguide). A client build is NOT a
// SkinChoice; it applies a fixed brand directly (see DemoApp client mode).
export type SkinChoice = {
  theme: string // key into THEMES
  font: string // key into FONTS
  hex: string // one-off #hex that overrides the named theme ("" = none)
  dark: boolean
  agentKey: string // key into AGENTS ("Blank" = the custom client-logo agent)
  customName: string // the Blank agent's typed name
  customRole: string // the Blank agent's typed role
  logoSrc: string | null // the Blank agent's composited logo disc (data URL)
}

// The neutral default the public demo and the styleguide both boot to.
export const NEUTRAL_SKIN: SkinChoice = {
  theme: "Neutral",
  font: "Inter",
  hex: "",
  dark: false,
  agentKey: "Bal",
  customName: "",
  customRole: "",
  logoSrc: null,
}

export type SkinState = ReturnType<typeof useSkinState>

type UseSkinStateOpts = {
  // when set, changes are saved here and restored by the caller at boot
  persistKey?: string
  // false = the hook is inert (a client build owns the skin directly); it still
  // holds state but never writes :root or localStorage
  enabled?: boolean
}

// Own the skin choice, apply it live, and optionally persist it. Called once,
// high enough that a preset remount below it can't reset the choice.
export function useSkinState(initial: SkinChoice, opts: UseSkinStateOpts = {}) {
  const { persistKey, enabled = true } = opts

  const [dark, setDark] = React.useState(initial.dark)
  const [font, setFont] = React.useState(initial.font)
  const [theme, setTheme] = React.useState(initial.theme)
  const [hex, setHex] = React.useState(initial.hex)
  const [agentKey, setAgentKey] = React.useState(initial.agentKey)
  const [logoSrc, setLogoSrc] = React.useState<string | null>(initial.logoSrc)
  // the Custom agent's typed identity — kept across agent switches so flipping
  // away and back doesn't wipe them; an empty field falls back to AGENTS.Blank.
  const [customName, setCustomName] = React.useState(initial.customName)
  const [customRole, setCustomRole] = React.useState(initial.customRole)

  // ---- apply to :root (skipped when inert) ----
  React.useEffect(() => {
    if (!enabled) return
    document.documentElement.classList.toggle("dark", dark)
  }, [enabled, dark])
  React.useEffect(() => {
    if (!enabled) return
    applyFont(font)
  }, [enabled, font])
  React.useEffect(() => {
    if (!enabled) return
    applyTheme(theme, hex)
    // The neutral tint is derived, never typed: a custom hex gets an automatic
    // complement, a named theme keeps its hand-picked override, else follow --primary.
    applyNeutralTint(resolveNeutralTint(theme, hex))
  }, [enabled, theme, hex])

  // ---- persist the choice (public mode only) ----
  React.useEffect(() => {
    if (!enabled || !persistKey) return
    const choice: SkinChoice = { theme, font, hex, dark, agentKey, customName, customRole, logoSrc }
    try {
      window.localStorage.setItem(persistKey, JSON.stringify(choice))
    } catch {
      /* storage full / blocked — the demo still works, it just won't remember */
    }
  }, [enabled, persistKey, theme, font, hex, dark, agentKey, customName, customRole, logoSrc])

  // Client-side only: read the picked image, downscale to 256px (keeps the data
  // URL small + strips metadata), then composite it into the blank disc. Nothing
  // is ever uploaded to a server; safe for a public, playable surface.
  const handleLogoFile = React.useCallback((file: File) => {
    const reader = new FileReader()
    reader.onload = () => {
      const img = new Image()
      img.onload = () => {
        const max = 256
        const scale = Math.min(1, max / Math.max(img.width, img.height))
        const w = Math.max(1, Math.round(img.width * scale))
        const h = Math.max(1, Math.round(img.height * scale))
        const canvas = document.createElement("canvas")
        canvas.width = w
        canvas.height = h
        const ctx = canvas.getContext("2d")
        if (!ctx) return
        ctx.drawImage(img, 0, 0, w, h)
        setLogoSrc(blankDiscWithLogo(canvas.toDataURL("image/png")))
      }
      img.src = reader.result as string
    }
    reader.readAsDataURL(file)
  }, [])

  // the Custom (Blank) agent wears its typed name/role; every other agent uses
  // its fixed identity. Resolved once so header, launcher pill and avatar match.
  const baseAgent: AgentDef = AGENTS[agentKey] ?? AGENTS.Bal
  const agent: AgentDef =
    agentKey === "Blank"
      ? { ...baseAgent, name: customName.trim() || baseAgent.name, role: customRole.trim() || baseAgent.role }
      : baseAgent
  // the Blank agent shows the uploaded-logo disc once a logo is loaded
  const agentSrc = agentKey === "Blank" && logoSrc ? logoSrc : agent.src
  // the swatch always opens on the color currently in play, so the picker + hex
  // field read as two views of one control rather than two competing inputs
  const pickerColor = HEX6.test(hex) ? hex : THEMES[theme]?.primary ?? "#737373"

  return {
    dark, font, theme, hex, agentKey, logoSrc, customName, customRole,
    setDark, setFont, setTheme, setHex, setAgentKey, setLogoSrc, setCustomName, setCustomRole,
    agent, agentSrc, pickerColor, handleLogoFile,
  }
}

// The Customize accordion — the SAME control set the styleguide and the demo
// wear. Collapsed by default; every control drives the shared skin state. Pass
// `className` to add spacing at a call site (e.g. below the demo's Context Engine).
export function CustomizePanel({ skin, className }: { skin: SkinState; className?: string }) {
  return (
    <CollapsibleSection label="Customize" defaultCollapsed className={className}>
      <div className="space-y-5 px-2.5 pt-1.5 pb-1">
        <div className="space-y-2">
          <Label>Agent</Label>
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(AGENTS).map(([key, a]) => (
              <button
                key={key}
                type="button"
                onClick={() => skin.setAgentKey(key)}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl [corner-shape:squircle] border p-2 transition-[border-color,background]",
                  skin.agentKey === key ? "border-primary bg-accent-tint" : "border-border-strong bg-card hover:bg-fill"
                )}
              >
                <img src={key === "Blank" && skin.logoSrc ? skin.logoSrc : a.src} alt="" className="h-12 w-12 object-contain" />
                <span className="text-xs font-semibold">{a.name}</span>
              </button>
            ))}
          </div>
        </div>

        {skin.agentKey === "Blank" && (
          <div className="space-y-4">
            {/* the Custom agent's identity: what it's called and the role shown
                under the avatar. Empty falls back to the placeholder. */}
            <div className="space-y-1.5">
              <Label>Agent name</Label>
              <Input
                value={skin.customName}
                onChange={(e) => skin.setCustomName(e.target.value)}
                placeholder="Your name"
                aria-label="Agent name"
                maxLength={24}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Agent role</Label>
              <Input
                value={skin.customRole}
                onChange={(e) => skin.setCustomRole(e.target.value)}
                placeholder="Your role"
                aria-label="Agent role"
                maxLength={32}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Logo</Label>
              <div className="grid grid-cols-2 gap-2">
                <label className="flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg [corner-shape:squircle] border border-border-strong bg-card text-sm font-semibold transition-[border-color,background] hover:bg-fill">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    className="sr-only"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) skin.handleLogoFile(f); e.currentTarget.value = "" }}
                  />
                  <Icon name="upload" size={16} stroke={1.5} />
                  {skin.logoSrc ? "Replace" : "Upload"}
                </label>
                <button
                  type="button"
                  disabled={!skin.logoSrc}
                  onClick={() => skin.setLogoSrc(null)}
                  className="flex h-9 items-center justify-center gap-1.5 rounded-lg [corner-shape:squircle] border border-border-strong bg-card text-sm font-semibold transition-[border-color,background] hover:bg-fill disabled:pointer-events-none disabled:opacity-40"
                >
                  <Icon name="trash" size={16} stroke={1.5} />
                  Remove
                </button>
              </div>
              <p className="text-[11px] leading-relaxed text-muted-foreground/70">
                Drops a PNG or JPG into the disc to preview a client's brand. Stays in your browser; nothing is uploaded.
              </p>
            </div>
          </div>
        )}

        {/* Primary color: a named brand, OR a one-off color from the picker below
            it (which owns the hex field, so there is one control per way in). The
            greys' tint is derived from whatever lands here, so there is no
            neutral-tint input to keep in sync. */}
        <div className="space-y-1.5">
          <Label>Primary color</Label>
          <Select value={skin.theme} onValueChange={(v) => { skin.setHex(""); skin.setTheme(String(v)) }}>
            <SelectTrigger><SelectValue placeholder="Neutral" /></SelectTrigger>
            <SelectContent>
              {Object.keys(THEMES).map((t) => (
                <SelectItem key={t} value={t}>{themeLabel(t)}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2 py-0.5">
            <span className="h-px flex-1 bg-border" />
            <span className="text-[11px] leading-none text-muted-foreground/70">or</span>
            <span className="h-px flex-1 bg-border" />
          </div>
          <ColorPicker value={skin.hex} onValueChange={skin.setHex} fallback={skin.pickerColor} />
          <p className="text-[11px] leading-relaxed text-muted-foreground/70">
            A custom color overrides the brand above. The greys automatically borrow a complementary neutral tint.
          </p>
        </div>

        <div className="space-y-1.5">
          <Label>Typeface</Label>
          <Select value={skin.font} onValueChange={(v) => skin.setFont(String(v))}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {Object.keys(FONTS).map((f) => (
                <SelectItem key={f} value={f}>{f}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Appearance</Label>
          <div className="grid grid-cols-2 gap-2">
            {([["Light", false], ["Dark", true]] as const).map(([lbl, val]) => (
              <button
                key={lbl}
                type="button"
                onClick={() => skin.setDark(val)}
                className={cn(
                  "flex h-9 items-center justify-center gap-1.5 rounded-lg [corner-shape:squircle] border text-sm font-semibold transition-[border-color,background]",
                  skin.dark === val ? "border-primary bg-accent-tint" : "border-border-strong bg-card hover:bg-fill"
                )}
              >
                <Icon name={val ? "cloud" : "bulb"} size={16} stroke={1.5} />
                {lbl}
              </button>
            ))}
          </div>
        </div>

        <p className="text-[11px] leading-relaxed text-muted-foreground/70">
          These controls re-skin the interface live. A brand hue is preview-only — the system's own brand is the neutral gray.
        </p>
      </div>
    </CollapsibleSection>
  )
}
