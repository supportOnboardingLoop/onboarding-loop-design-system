import * as React from "react"

import { cn } from "@/lib/utils"
import { Icon } from "@/components/base/icon"
import { Button, buttonVariants } from "@/components/base/button"
import { Select, SelectTrigger, SelectContent, SelectItem } from "@/components/base/select"
import { ColorPicker } from "@/components/product/color-picker"
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem } from "@/components/product/dropdown"
import { SegmentedControl } from "@/components/base/segmented-control"
import { AGENTS, THEMES, FONTS, themeLabel } from "@/styleguide/src/skins"
import { PRESET_LIST, PRESETS, DEFAULT_PRESET_ID } from "@/styleguide/src/presets"
import type { SkinState } from "@/styleguide/src/customize"

// ============================================================================
// DemoToolbar — the strip hugging the top of the framed demo on /demo. It lifts
// the demo's own Customize accordion (agent · color · font · light or dark) out
// into a bar, and adds, on the right, the device toggle (desktop · tablet ·
// mobile), the "load a SaaS" picker (also lifted out of the demo), and an
// "Open in New Tab" link. It drives the SAME SkinState the demo uses; the host
// page relays each change into the iframe over postMessage (see DemoPage).
//
// Avatars are served by the demo app's origin, not the marketing site (which
// only carries a subset), so they resolve against `avatarBase` — the same origin
// as the framed demo — and always match what the frame renders.
// ============================================================================

export type DeviceKey = "desktop" | "tablet" | "mobile"

const HEX6 = /^#([0-9a-f]{6})$/i
const NEUTRAL_SWATCH = "var(--muted-foreground)"

// resolve an agent avatar path against the demo origin (data / absolute URLs pass through)
const withBase = (base: string, src: string) => (/^(data:|https?:)/.test(src) ? src : base + src)

const Swatch = ({ color }: { color: string }) => (
  <span
    aria-hidden
    className="size-4 shrink-0 rounded-full [corner-shape:round] ring-1 ring-black/10 ring-inset"
    style={{ background: color }}
  />
)

export function DemoToolbar({
  skin,
  device,
  onDeviceChange,
  avatarBase,
  saas,
  onSaasChange,
  openUrl,
  className,
}: {
  skin: SkinState
  device: DeviceKey
  onDeviceChange: (d: DeviceKey) => void
  avatarBase: string
  saas: string
  onSaasChange: (id: string) => void
  openUrl: string
  className?: string
}) {
  // the five real agents (drop the "Custom" client-logo slot — it needs an upload
  // UI that doesn't belong in a top bar)
  const agentEntries = Object.entries(AGENTS).filter(([key]) => key !== "Blank")

  const hexActive = HEX6.test(skin.hex)
  const colorSwatch = hexActive ? skin.hex : THEMES[skin.theme]?.primary ?? NEUTRAL_SWATCH
  const colorLabel = hexActive ? "Custom" : themeLabel(skin.theme)

  const activePreset = PRESETS[saas] ?? PRESETS[DEFAULT_PRESET_ID]

  return (
    <div className={cn("dv-tb", className)}>
      {/* the skin controls (agent · color · font). Grouped so they can hide as a
          unit on tablet/mobile, where only appearance / device / open remain. */}
      <div className="dv-tb__custom">
      {/* Agent — the trigger always reads "Agent"; the current pick shows as the
          checked row inside */}
      <Select value={skin.agentKey} onValueChange={skin.setAgentKey}>
        <SelectTrigger aria-label="Agent" className="w-[104px]">
          <span className="min-w-0 flex-1 truncate text-left">Agent</span>
        </SelectTrigger>
        <SelectContent className="min-w-[196px]" positionerClassName="z-[80]">
          {agentEntries.map(([key, a]) => (
            <SelectItem
              key={key}
              value={key}
              leading={<img src={withBase(avatarBase, a.src)} alt="" className="size-7 shrink-0 object-contain" />}
            >
              <span className="flex flex-col leading-tight">
                <span className="font-semibold">{a.name}</span>
                <span className="text-xs font-normal text-muted-foreground">{a.role}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Color — a named brand preset, or a custom hue from the picker (which
          overrides it, exactly as the Customize accordion pairs them) */}
      <div className="dv-tb__cluster">
        <Select
          value={skin.theme}
          onValueChange={(v) => {
            skin.setHex("")
            skin.setTheme(String(v))
          }}
        >
          <SelectTrigger aria-label="Brand color" className="w-[150px]">
            <Swatch color={colorSwatch} />
            <span className="min-w-0 flex-1 truncate text-left">{colorLabel}</span>
          </SelectTrigger>
          <SelectContent className="min-w-[196px]" positionerClassName="z-[80]">
            {Object.keys(THEMES).map((t) => (
              <SelectItem key={t} value={t} leading={<Swatch color={THEMES[t]?.primary ?? NEUTRAL_SWATCH} />}>
                {themeLabel(t)}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <ColorPicker
          value={skin.hex}
          onValueChange={skin.setHex}
          fallback={skin.pickerColor}
          placeholder="Custom"
          className="w-[132px]"
          positionerClassName="z-[80]"
        />
      </div>

      {/* Font */}
      <Select value={skin.font} onValueChange={(v) => skin.setFont(String(v))}>
        <SelectTrigger aria-label="Typeface" className="w-[132px]">
          <span className="min-w-0 flex-1 truncate text-left">{skin.font}</span>
        </SelectTrigger>
        <SelectContent className="min-w-[160px]" positionerClassName="z-[80]">
          {Object.keys(FONTS).map((f) => (
            <SelectItem key={f} value={f}>
              {f}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      </div>

      {/* Light or dark — survives into tablet (hidden only on mobile) */}
      <SegmentedControl
        size="sm"
        ariaLabel="Appearance"
        className="dv-tb__appearance"
        value={skin.dark ? "dark" : "light"}
        onValueChange={(v) => skin.setDark(v === "dark")}
        options={[
          { value: "light", icon: "bulb", label: "Light" },
          { value: "dark", icon: "cloud", label: "Dark" },
        ]}
      />

      {/* right group: device size · load a SaaS · open in new tab */}
      <div className="dv-tb__right">
        <SegmentedControl
          size="sm"
          ariaLabel="Preview size"
          value={device}
          onValueChange={(v) => onDeviceChange(v as DeviceKey)}
          options={[
            { value: "desktop", icon: "device-desktop", title: "Desktop" },
            { value: "tablet", icon: "device-tablet", title: "Tablet" },
            { value: "mobile", icon: "device-mobile", title: "Mobile" },
          ]}
        />

        {/* SaaS picker — lifted out of the demo (was its bottom-right chrome). The
            trigger is the DS secondary Button styling (same control family as the
            selects); the menu is the DS Dropdown. Only Analytics is live; the rest
            are locked (a lock glyph, disabled — clicking does nothing). */}
        <div className="dv-tb__saas">
          <Dropdown>
            <DropdownTrigger aria-label="Load a SaaS" className={cn(buttonVariants({ variant: "secondary", size: "sm" }), "min-w-[136px]")}>
              <Icon name={activePreset.pickerIcon} size={16} stroke={1.75} className="text-[var(--ctl-icon)]" />
              <span className="min-w-0 flex-1 truncate text-left">{activePreset.label}</span>
              <Icon
                name="chevron-down"
                size={16}
                className="text-muted-foreground transition-transform duration-200 group-data-[popup-open]/button:rotate-180"
              />
            </DropdownTrigger>
            <DropdownContent align="end" className="min-w-[248px]">
              {PRESET_LIST.map((p) => {
                const locked = p.status === "soon"
                return (
                  <DropdownItem
                    key={p.id}
                    icon={p.pickerIcon}
                    disabled={locked}
                    onClick={() => onSaasChange(p.id)}
                    className={cn("py-2", p.id === saas && "bg-[var(--ctl-hover)]", locked && "opacity-60")}
                    trailing={locked ? <Icon name="lock" size={15} className="text-muted-foreground" /> : null}
                  >
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="font-semibold text-foreground">{p.label}</span>
                      <span className="truncate text-xs font-normal text-muted-foreground">{p.tagline}</span>
                    </span>
                  </DropdownItem>
                )
              })}
            </DropdownContent>
          </Dropdown>
        </div>

        {/* Open the full demo in a new tab — the DS secondary Button rendered as a
            link. The arrow points up-right at 45°, and flies a touch on hover. */}
        <Button
          variant="secondary"
          size="sm"
          render={<a href={openUrl} target="_blank" rel="noopener noreferrer" />}
        >
          Open in New Tab
          <Icon
            name="arrow-right"
            size={16}
            className="-rotate-45 transition-transform duration-200 group-hover/button:translate-x-[2px] group-hover/button:-translate-y-[2px]"
          />
        </Button>
      </div>
    </div>
  )
}
