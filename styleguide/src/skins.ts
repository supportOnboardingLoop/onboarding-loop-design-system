// ============================================================================
// Skins — the single source of truth for the demo/styleguide "look": brand
// theme, typeface, and agent identity.
//
// BOTH surfaces read from here so a skin is defined exactly once:
//   • the styleguide's live re-skin panel  (App.tsx "Customize")
//   • the demo's SaaS presets              (presets/*.tsx)
//
// A "skin" is only the visual layer (colors + font + agent identity). The
// CONTENT of a demo (nav, sub-nav, cards, conversation) lives in a DemoPreset
// (presets/types.ts); a preset carries a Skin plus its content.
// ============================================================================

export const FONTS: Record<string, string> = {
  Inter: '"Inter", system-ui, sans-serif',
  Poppins: '"Poppins", system-ui, sans-serif',
  "DM Sans": '"DM Sans", system-ui, sans-serif',
  Manrope: '"Manrope", system-ui, sans-serif',
}

// `tint` = the selected-item fill (--accent-tint). `neutralTint` (optional) = the
// hue the greys borrow (--tint); omit it and the greys just follow the brand.
// Anthropic's terracotta reads pink on the greys, so it borrows warm Manila instead.
export type ThemeDef = { primary: string; tint: string; neutralTint?: string }

// null = the system's own neutral brand (no hue). Named brands set a preview hue.
export const THEMES: Record<string, ThemeDef | null> = {
  Neutral: null,
  // Greens read minty when the greys borrow their own hue, so they borrow warm
  // Manila instead. Cool brands + orange look good self-tinted, so no override.
  Heatmap: { primary: "#10b068", tint: "#e7fdef", neutralTint: "#ebdbbc" },
  LinkedIn: { primary: "#0068c9", tint: "#e6f0fb" },
  Anthropic: { primary: "#d97757", tint: "color-mix(in srgb, #d97757 12%, white)", neutralTint: "#ebdbbc" },
  Spotify: { primary: "#1db954", tint: "color-mix(in srgb, #1db954 12%, white)", neutralTint: "#ebdbbc" },
  Stripe: { primary: "#635bff", tint: "color-mix(in srgb, #635bff 12%, white)" },
  Twitch: { primary: "#9146ff", tint: "color-mix(in srgb, #9146ff 12%, white)" },
  HubSpot: { primary: "#ff7a59", tint: "color-mix(in srgb, #ff7a59 12%, white)" },
}

export type AgentDef = { name: string; role: string; src: string }
export const AGENTS: Record<string, AgentDef> = {
  Wilson: { name: "Wilson", role: "Heatmap agent", src: "/avatars/wilson.svg" },
  Bal: { name: "Bal", role: "Onboarding guide", src: "/avatars/bal.svg" },
  Jaimie: { name: "Jaimie", role: "AI assistant", src: "/avatars/jaimie.svg" },
  Blank: { name: "Custom", role: "Client logo", src: "/avatars/blank.svg" },
}

// A resolved skin: which theme / font / agent a surface wears. `neutralTint`
// optionally steers the greys somewhere other than the brand (empty = follow it).
export type Skin = {
  theme: string // key into THEMES
  font: string // key into FONTS
  agent: AgentDef // resolved agent identity (name/role/avatar)
  neutralTint?: string // optional #hex override for --tint
}

const HEX6 = /^#([0-9a-f]{6})$/i

// ---- application helpers (write CSS custom properties on :root) -------------

// Brand hue. Pass a valid #hex to preview an arbitrary color; otherwise the
// named theme is applied (Neutral clears the vars back to the neutral brand).
export function applyTheme(name: string, hex = "") {
  const s = document.documentElement.style
  const clear = () => {
    s.removeProperty("--primary")
    s.removeProperty("--accent-tint")
    s.removeProperty("--primary-foreground")
  }
  if (HEX6.test(hex)) {
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

// The hue the greys borrow. Empty → greys follow --primary.
export function applyNeutralTint(tintHex = "") {
  const s = document.documentElement.style
  if (HEX6.test(tintHex)) s.setProperty("--tint", tintHex)
  else s.removeProperty("--tint")
}

export function applyFont(font: string) {
  document.documentElement.style.setProperty("--font-family", FONTS[font] ?? FONTS.Inter)
}

// Apply a whole Skin at once (used by the demo when a preset loads). The neutral
// tint defaults to the theme's own preference, then to following the brand.
export function applySkin(skin: Skin) {
  applyTheme(skin.theme)
  applyFont(skin.font)
  applyNeutralTint(skin.neutralTint ?? THEMES[skin.theme]?.neutralTint ?? "")
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
