// ============================================================================
// Skins — the single source of truth for the "look": brand theme, typeface, and
// agent identity, plus the helpers that apply them to :root.
//
// The Customize panel (customize.tsx, shared by the styleguide and the demo)
// reads these lists so the picker is defined exactly once. Branding is NOT a
// property of a preset: a preset (presets/*) is content only, and the demo's
// brand comes from the visitor's Customize choices (public) or a client record
// (clients.ts, a client build). Client-only brands (their raw hex, their agent)
// live in clients.ts, not here, so the public picker never offers them.
//
// A "skin" is only the visual layer (colors + font + agent identity). The
// CONTENT of a demo (nav, sub-nav, cards, conversation) lives in a DemoPreset
// (presets/types.ts).
// ============================================================================

export const FONTS: Record<string, string> = {
  Inter: '"Inter", system-ui, sans-serif',
  Poppins: '"Poppins", system-ui, sans-serif',
  "DM Sans": '"DM Sans", system-ui, sans-serif',
  Manrope: '"Manrope", system-ui, sans-serif',
}

// `neutralTint` (optional) = the hue the greys borrow (--tint); omit it and the
// greys just follow the brand. Anthropic's terracotta reads pink on the greys,
// so it borrows warm Manila instead. `color` = the plain-English name of the
// hue, shown in brackets in the picker ("Spotify (Green)").
//
// There is no `tint` here anymore: the selected-item fill (--accent-tint) is
// derived from --primary per color-scheme in tokens.css, which is what lets it
// stay legible in dark mode. One color in, both modes out.
export type ThemeDef = { primary: string; color: string; neutralTint?: string }

// null = the system's own neutral brand (no hue). Named brands set a preview hue.
// This is a PUBLIC showcase palette; client-only brands live in clients.ts as a
// raw hex (applyTheme supports that), never here, so they never reach the picker.
export const THEMES: Record<string, ThemeDef | null> = {
  Neutral: null,
  // Greens read minty when the greys borrow their own hue, so they borrow warm
  // Manila instead. Cool brands + orange look good self-tinted, so no override.
  LinkedIn: { primary: "#0068c9", color: "Blue" },
  Anthropic: { primary: "#d97757", color: "Terracotta", neutralTint: "#ebdbbc" },
  Spotify: { primary: "#1db954", color: "Green", neutralTint: "#ebdbbc" },
  Stripe: { primary: "#635bff", color: "Indigo" },
  Twitch: { primary: "#9146ff", color: "Purple" },
  HubSpot: { primary: "#ff7a59", color: "Orange" },
}

// Label for the primary-color picker: "Neutral" has no hue to name, every brand
// carries its color in brackets.
export function themeLabel(name: string): string {
  const t = THEMES[name]
  return t ? `${name} (${t.color})` : name
}

export type AgentDef = { name: string; role: string; src: string }
// Order matters; this is the order the avatar picker renders. Bal is the default
// and leads; "Custom" (the client-logo disc) always sits last. This is the PUBLIC
// list; a client-only agent (e.g. Heatmap's Wilson) lives in its client record
// (clients.ts), never here, so the public picker never offers it.
export const AGENTS: Record<string, AgentDef> = {
  Bal: { name: "Bal", role: "Founder", src: "/avatars/bal.svg" },
  Angel: { name: "Angel", role: "Onboarding guide", src: "/avatars/angel.svg" },
  Murph: { name: "Murph", role: "Onboarding guide", src: "/avatars/murph.svg" },
  Jaimie: { name: "Jaimie", role: "Onboarding guide", src: "/avatars/jaimie.svg" },
  Casey: { name: "Casey", role: "Onboarding guide", src: "/avatars/casey.svg" },
  Blank: { name: "Custom", role: "Client logo", src: "/avatars/blank.svg" },
}

const HEX6 = /^#([0-9a-f]{6})$/i

// ---- application helpers (write CSS custom properties on :root) -------------

// Brand hue. Pass a valid #hex to preview an arbitrary color; otherwise the
// named theme is applied (Neutral clears the vars back to the neutral brand).
//
// This writes ONLY the brand source, never --primary / --primary-foreground /
// --accent-tint. Those are derived per color-scheme in tokens.css, and an inline
// style on <html> outranks the .dark rules: setting them here is what used to
// strand dark mode on the light-mode brand (and on a light selection tint that
// left selected states at ~1:1 against their own label).
//
// --brand-lift is the same color raised to a fixed oklch lightness so it reads
// off the dark canvas and can carry dark ink. The two are written and cleared
// together, so the neutral brand keeps its own --ink in both modes.
export function applyTheme(name: string, hex = "") {
  const s = document.documentElement.style
  const set = (color: string) => {
    s.setProperty("--brand", color)
    s.setProperty("--brand-lift", `oklch(from ${color} 0.78 calc(c * 0.95) h)`)
  }
  const clear = () => {
    s.removeProperty("--brand")
    s.removeProperty("--brand-lift")
  }
  if (HEX6.test(hex)) return set(hex)
  const t = THEMES[name]
  if (!t) return clear()
  set(t.primary)
}

// ---- automatic neutral tint ------------------------------------------------

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const n = parseInt(hex.slice(1), 16)
  const r = ((n >> 16) & 255) / 255
  const g = ((n >> 8) & 255) / 255
  const b = (n & 255) / 255
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const d = max - min
  const l = (max + min) / 2
  if (d === 0) return { h: 0, s: 0, l }
  const s = d / (1 - Math.abs(2 * l - 1))
  const h =
    max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4
  return { h: ((h * 60) % 360 + 360) % 360, s, l }
}

function hslToHex(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1))
  const m = l - c / 2
  const seg = Math.floor(h / 60) % 6
  const [r, g, b] = [
    [c, x, 0], [x, c, 0], [0, c, x], [0, x, c], [x, 0, c], [c, 0, x],
  ][seg]
  const to = (v: number) => Math.round((v + m) * 255).toString(16).padStart(2, "0")
  return `#${to(r)}${to(g)}${to(b)}`
}

// The shortest signed distance from angle `a` to angle `b`, in degrees.
function hueDelta(a: number, b: number) {
  return ((b - a + 540) % 360) - 180
}

// Pick the neutral tint that COMPLEMENTS an arbitrary brand hex, so the greys
// never just echo the brand (a green brand self-tinted goes minty; a terracotta
// one goes pink). We take the true complement, then snap it into whichever of
// the two grey-safe bands is nearer (warm Manila ~42° or cool slate ~214°),
// keeping a little of the complement's own character inside that band. Warm
// brands land on cool greys and vice versa, which is what "complementary" buys
// us. Saturation stays low and lightness high so the result reads as a tinted
// grey, not a color.
const BANDS = [
  { center: 42, sat: 0.55 }, // warm Manila: the tint used by the green presets
  { center: 214, sat: 0.3 }, // cool slate: needs less chroma to still read grey
]

export function complementaryNeutralTint(hex: string): string {
  if (!HEX6.test(hex)) return ""
  const { h, s } = hexToHsl(hex)
  // A brand with no chroma of its own (pure grey/black/white) has no complement
  // worth borrowing, so let the greys stay neutral.
  if (s < 0.08) return ""
  const comp = (h + 180) % 360
  const band = BANDS.reduce((best, b) =>
    Math.abs(hueDelta(comp, b.center)) < Math.abs(hueDelta(comp, best.center)) ? b : best
  )
  // drift up to ±14° inside the band so distinct brands get distinct tints
  const drift = Math.max(-14, Math.min(14, hueDelta(band.center, comp) * 0.15))
  return hslToHex((band.center + drift + 360) % 360, band.sat, 0.83)
}

// The neutral tint a given (theme, hex) pair should wear: a custom hex derives
// its complement automatically, a named theme keeps its hand-picked override.
export function resolveNeutralTint(theme: string, hex = ""): string {
  if (HEX6.test(hex)) return complementaryNeutralTint(hex)
  return THEMES[theme]?.neutralTint ?? ""
}

// The hue the greys borrow. Empty → greys follow --primary.
export function applyNeutralTint(tintHex = "") {
  const s = document.documentElement.style
  if (HEX6.test(tintHex)) s.setProperty("--tint", tintHex)
  else s.removeProperty("--tint")
}

export function applyFont(font: string) {
  document.documentElement.style.setProperty("--font-family", FONTS[font] ?? FONTS.Inter)
}

// ---- client-logo compositor (styleguide "Custom" agent) --------------------

// Composite an uploaded logo into the blank disc, returning an SVG data-URL that
// drops into every avatar slot exactly like the other characters (canonical
// canvas: viewBox 0 -11 64 75, disc Ø64 bottom-anchored). The logo is *contained*
// (xMidYMid meet) inside a padded square well inside the ring, so wordmarks and
// rectangular logos are never circle-cropped; the clip is a spill guard.
export function blankDiscWithLogo(logoDataUrl: string): string {
  const svg =
    '<svg xmlns="http://www.w3.org/2000/svg" width="64" height="75" viewBox="0 -11 64 75" fill="none">' +
    '<circle cx="32" cy="32" r="32" fill="white"/>' +
    '<circle cx="32" cy="32" r="30.5" stroke="black" stroke-opacity="0.05" stroke-width="3"/>' +
    '<clipPath id="disc"><circle cx="32" cy="32" r="30.5"/></clipPath>' +
    '<image href="' + logoDataUrl + '" x="14" y="14" width="36" height="36" ' +
    'preserveAspectRatio="xMidYMid meet" clip-path="url(#disc)"/>' +
    '</svg>'
  return "data:image/svg+xml;base64," + btoa(svg)
}
