import { useState, useEffect, useRef } from "react"
import { cn } from "@/lib/utils"
import { WorkspaceShell } from "@/components/product/workspace-shell"
import {
  LayoutColumn,
  ColumnHeader,
  ColumnTitle,
  ColumnBody,
  ColumnFooter,
  NavList,
} from "@/components/product/layout-column"
import { BrandMark } from "@/components/product/brand-mark"
import { HamburgerButton, AgentDrawerButton } from "@/components/product/compact-bar"
import { IconButton } from "@/components/base/icon-button"
import { NavItem } from "@/components/product/nav-item"
import { CollapsibleSection } from "@/components/product/section"
import { AccountCard } from "@/components/product/account-card"
import { LauncherPill } from "@/components/product/launcher"
import { TravellingAgentAvatar, type TravellingAvatarHandle } from "@/components/product/travelling-avatar"
import { Icon } from "@/components/base/icon"
import { Label } from "@/components/base/label"
import { Input } from "@/components/base/input"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/base/select"
import { NAV } from "./showcases"
import { FONTS, THEMES, AGENTS, applyTheme, blankDiscWithLogo } from "./skins"

// The styleguide home, built ON the design system — the SAME <WorkspaceShell> +
// column primitives (LayoutColumn / ColumnHeader / ColumnTitle / ColumnBody /
// ColumnFooter / NavList) + shared chrome (BrandMark, IconButton toggles, the
// compact-bar triggers) the Demo uses, so the two frames can't drift: a layout
// change reaches both, and both get the responsive drawers. Here the shell hosts a
// 3-column DOCS layout — a primary nav card + a live re-skin sub-nav (font / theme /
// avatar / client-logo) + the grey docs canvas with a docked launcher pill.

export default function App() {
  const flat = NAV.flatMap((g) => g.items)
  const [selected, setSelected] = useState(flat[0]?.id)
  const [navCollapsed, setNavCollapsed] = useState(false)
  const [subCollapsed, setSubCollapsed] = useState(false)
  const [navOpen, setNavOpen] = useState(false) // compact primary-nav sheet
  const [agentOpen, setAgentOpen] = useState(false) // compact re-skin drawer
  const [dark, setDark] = useState(false)
  const [font, setFont] = useState("Inter")
  const [theme, setTheme] = useState("Neutral")
  const [hex, setHex] = useState("")
  const [tintHex, setTintHex] = useState("")
  const [agentKey, setAgentKey] = useState("Wilson")
  const [logoSrc, setLogoSrc] = useState<string | null>(null)

  // sub-nav "on this page": the anchorable sections rendered on the current page
  // (each GroupHeader carries [data-section-anchor]); clicking one scrolls the
  // content pane to it, and a light scroll-spy marks the section you're in.
  const contentBodyRef = useRef<HTMLDivElement>(null)
  const contentWrapRef = useRef<HTMLDivElement>(null)
  const [sections, setSections] = useState<{ id: string; title: string }[]>([])
  const [activeSection, setActiveSection] = useState<string | null>(null)
  // a trailing spacer so EVERY section (even the last) can scroll its title to the
  // top of the pane, and a lock so the scroll-spy doesn't fight a click mid-animation.
  const [tailSpacer, setTailSpacer] = useState(0)
  const spyLock = useRef(false)

  // the shared travelling agent avatar (same wiring as the Demo): rides the sub-nav
  // header slot while open, slides to the content-header slot on collapse, wiggles on
  // hover. A fixed sibling of the shell; the two slots below are its landing targets.
  const subSlotRef = useRef<HTMLSpanElement>(null)
  const contentSlotRef = useRef<HTMLSpanElement>(null)
  const avRef = useRef<TravellingAvatarHandle | null>(null)
  const firstShift = useRef(true)

  // Client-side only: read the picked image, downscale to 256px (keeps the data
  // URL small + strips metadata), then composite it into the blank disc. Nothing
  // is ever uploaded to a server; safe for a public, playable styleguide.
  function handleLogoFile(file: File) {
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
  }

  useEffect(() => {
    document.documentElement.classList.toggle("dark", dark)
  }, [dark])
  useEffect(() => {
    document.documentElement.style.setProperty("--font-family", FONTS[font])
  }, [font])
  useEffect(() => {
    applyTheme(theme, hex)
  }, [theme, hex])
  useEffect(() => {
    // optional override: steer the neutral tint somewhere other than the brand
    // (e.g. a warm complement to a cool brand). Empty → greys follow --primary.
    const s = document.documentElement.style
    if (/^#([0-9a-f]{6})$/i.test(tintHex)) s.setProperty("--tint", tintHex)
    else s.removeProperty("--tint")
  }, [tintHex])

  // the avatar travels on sub-collapse itself (handled inside <TravellingAgentAvatar>);
  // here we only ask it to FOLLOW its slot when the primary nav collapses — that grid
  // shift slides the header slots sideways under it.
  useEffect(() => {
    if (firstShift.current) {
      firstShift.current = false
      return
    }
    avRef.current?.follow(440)
  }, [navCollapsed])

  // rebuild the "on this page" list whenever the page changes: read the section
  // anchors the freshly-rendered content emitted (a frame later, after commit).
  useEffect(() => {
    const root = contentBodyRef.current
    if (!root) return
    const raf = requestAnimationFrame(() => {
      const nodes = Array.from(root.querySelectorAll<HTMLElement>("[data-section-anchor]"))
      // prefer the top-level GroupHeaders; fall back to titled Blocks on pages that
      // have none (so nested Blocks under a GroupHeader don't clutter the rail).
      const groups = nodes.filter((n) => n.dataset.sectionAnchor === "group")
      const picked = groups.length ? groups : nodes
      setSections(picked.map((n) => ({ id: n.id, title: n.dataset.sectionTitle ?? n.textContent ?? "" })))
      root.scrollTop = 0 // land at the top of each newly-opened page
    })
    return () => cancelAnimationFrame(raf)
  }, [selected])

  // light scroll-spy: mark the section currently at the top of the content pane.
  // Skips while a click-driven scroll is animating (spyLock) so the clicked item
  // stays selected instead of flickering to whatever passes under the top mid-scroll.
  useEffect(() => {
    const root = contentBodyRef.current
    if (!root || sections.length === 0) { setActiveSection(null); return }
    const compute = () => {
      if (spyLock.current) return
      const rootTop = root.getBoundingClientRect().top
      let cur = sections[0]?.id ?? null
      for (const s of sections) {
        const el = root.querySelector<HTMLElement>("#" + CSS.escape(s.id))
        if (el && el.getBoundingClientRect().top - rootTop <= 24) cur = s.id
      }
      setActiveSection(cur)
    }
    compute()
    root.addEventListener("scroll", compute, { passive: true })
    return () => root.removeEventListener("scroll", compute)
  }, [sections])

  // size the trailing spacer so the LAST section's title can still reach the top of
  // the pane (with a little blank space below). Measured against the natural content
  // height (contentWrapRef, which excludes the spacer) so it converges without looping.
  useEffect(() => {
    const root = contentBodyRef.current
    const wrap = contentWrapRef.current
    if (!root || !wrap) return
    const recompute = () => {
      if (sections.length === 0) { setTailSpacer(0); return }
      const lastEl = root.querySelector<HTMLElement>("#" + CSS.escape(sections[sections.length - 1].id))
      if (!lastEl) { setTailSpacer(0); return }
      const anchorPos = lastEl.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop
      const needed = Math.max(0, Math.ceil(anchorPos - 12 + root.clientHeight - wrap.offsetHeight))
      setTailSpacer((prev) => (prev === needed ? prev : needed))
    }
    const raf = requestAnimationFrame(recompute)
    window.addEventListener("resize", recompute)
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", recompute) }
  }, [sections])

  // scroll the content pane so a section's TITLE lands at the top (rect-based, robust
  // to offsetParent). Selecting is immediate — whatever you click is marked active,
  // held past the smooth-scroll by spyLock — so it never depends on the spy catching up.
  const scrollToSection = (id: string) => {
    const root = contentBodyRef.current
    if (!root) return
    const el = root.querySelector<HTMLElement>("#" + CSS.escape(id))
    if (!el) return
    setActiveSection(id)
    spyLock.current = true
    const top = root.scrollTop + (el.getBoundingClientRect().top - root.getBoundingClientRect().top) - 12
    root.scrollTo({ top, behavior: "smooth" })
    window.setTimeout(() => { spyLock.current = false }, 650)
  }

  const current = flat.find((i) => i.id === selected)
  const agent = AGENTS[agentKey]
  // the Blank agent shows the uploaded-logo disc once a logo is loaded
  const agentSrc = agentKey === "Blank" && logoSrc ? logoSrc : agent.src

  return (
    <>
    <WorkspaceShell
      navCollapsed={navCollapsed}
      subCollapsed={subCollapsed}
      navOpen={navOpen}
      agentOpen={agentOpen}
      onNavOpenChange={setNavOpen}
      onAgentOpenChange={setAgentOpen}
      onResize={() => avRef.current?.travel(0)}
      /* ================= COLUMN 1: primary nav ================= */
      primaryNav={
        <LayoutColumn as="aside" variant="card">
          <ColumnHeader className={cn("gap-2.5", navCollapsed ? "justify-center" : "pr-3 pl-5")}>
            {!navCollapsed && <BrandMark mark="L">Loop DS</BrandMark>}
            <IconButton
              icon={navCollapsed ? "chevrons-right" : "chevrons-left"}
              motion={navCollapsed ? "arrow-right" : "arrow-left"}
              className={cn(!navCollapsed && "ml-auto")}
              aria-label={navCollapsed ? "Expand navigation" : "Collapse navigation"}
              onClick={() => setNavCollapsed((c) => !c)}
            />
          </ColumnHeader>

          <ColumnBody>
            {/* jump to the full-viewport DEMO (the design system + agent in action) */}
            <div className={cn("pb-2", navCollapsed && "flex justify-center")}>
              <NavItem
                icon="layout-dashboard"
                collapsed={navCollapsed}
                title="Demo"
                onClick={() => window.location.assign("/demo.html")}
              >
                Demo
              </NavItem>
            </div>
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
                <CollapsibleSection key={grp.label} label={grp.label} count={grp.items.length} defaultCollapsed className={gi > 0 ? "mt-2" : undefined}>
                  <NavList>
                    {grp.items.length === 0 ? (
                      <div className="px-2.5 pb-2 text-[11px] leading-snug text-muted-foreground/60">{grp.empty}</div>
                    ) : (
                      grp.items.map((item) => (
                        <NavItem key={item.id} icon={item.icon} current={selected === item.id} onClick={() => setSelected(item.id)}>
                          {item.label}
                        </NavItem>
                      ))
                    )}
                  </NavList>
                </CollapsibleSection>
              )
            )}
          </ColumnBody>

          {/* the account is its own area: a full-width divider on top (flush L/R like the
              header) and even padding above + below it (py-3, and the card's own mt-0). */}
          <ColumnFooter divider className={cn("flex flex-col gap-0.5 py-3", navCollapsed ? "items-center px-3" : "px-4")}>
            <AccountCard name="Bal Sieber" email="bal@onboardingloop.ai" initials="BS" online collapsed={navCollapsed} className="mt-0" />
          </ColumnFooter>
        </LayoutColumn>
      }
      /* ================= COLUMN 2: DS-tools sub-nav (live re-skin rail) =================
         The agent-identity header uses the SHARED travelling-avatar slots (.ws-agent-hdr__*
         + <TravellingAgentAvatar> below), same as the Demo, so the avatar travels + wiggles
         identically in both. The identity layout is kept local because this column also
         hosts the live re-skin controls (disc-fill SVG + client-logo upload). */
      agentHome={
        <LayoutColumn as="aside" variant="card">
          {/* the header owns the identity + the Customize accordion; it grows as the
              accordion opens and, on a short viewport, scrolls internally so no control
              is ever clipped. The bottom border is the dividing line, always below it. */}
          <header className="relative flex max-h-full shrink-0 flex-col overflow-y-auto border-b border-border">
            {/* agent identity — the disc + name/role + collapse toggle. Height trimmed so
                the gap below the avatar to the Customize button matches the gap below that
                button to the divider (symmetric ~17px). */}
            <div className="relative h-[99px] shrink-0">
              {/* the shared travelling avatar rides into this slot on desktop; a static
                  <img> takes its place inside the compact drawer (workspace.css .ws-agent-hdr*) */}
              <span className="ws-agent-hdr__slot" ref={subSlotRef} />
              <img className="ws-agent-hdr__av" src={agentSrc} alt="" />
              <div className="absolute top-[53.5px] left-[100px] flex -translate-y-1/2 flex-col items-start gap-px whitespace-nowrap">
                <b className="text-[15px] leading-[1.35] font-bold">{agent.name}</b>
                <span className="text-[13px] leading-[1.35] text-muted-foreground">{agent.role}</span>
              </div>
              <IconButton
                icon="chevrons-left"
                motion="arrow-left"
                className="absolute top-3.5 right-3"
                aria-label="Collapse tools"
                onClick={() => setSubCollapsed(true)}
              />
            </div>

            {/* Customize — the live re-skin controls folded into a header accordion (the
                same <CollapsibleSection> the main nav uses). Collapsed by default; opening
                it pushes the header down + animates the controls open, and the header
                divider (below) rides down with it. De-facto rule: anything living in the
                header uses the SAME left/right padding as the content area below (px-4), so
                the trigger + controls line up flush with the "On this page" rail. */}
            <div className="px-4 pb-2.5">
              <CollapsibleSection label="Customize" defaultCollapsed>
                <div className="space-y-5 px-2.5 pt-1.5 pb-1">
                  <div className="space-y-1.5">
                    <Label>Brand</Label>
                    <Select value={theme} onValueChange={(v) => { setHex(""); setTheme(String(v)); setTintHex(THEMES[String(v)]?.neutralTint ?? "") }}>
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
                    <Label>Neutral tint</Label>
                    <Input value={tintHex} onChange={(e) => setTintHex(e.target.value)} placeholder="auto — follows brand" className="font-normal" />
                    <p className="text-[11px] leading-relaxed text-muted-foreground/70">
                      The color the greys borrow. Empty = they follow the brand. Some presets prefill their own (Anthropic uses warm Manila); edit or clear it to taste.
                    </p>
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
                          <img src={key === "Blank" && logoSrc ? logoSrc : a.src} alt="" className="h-12 w-12 object-contain" />
                          <span className="text-xs font-semibold">{a.name}</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {agentKey === "Blank" && (
                    <div className="space-y-1.5">
                      <Label>Logo</Label>
                      <div className="grid grid-cols-2 gap-2">
                        <label className="flex h-9 cursor-pointer items-center justify-center gap-1.5 rounded-lg [corner-shape:squircle] border border-border-strong bg-card text-sm font-semibold transition-[border-color,background] hover:bg-fill">
                          <input
                            type="file"
                            accept="image/png,image/jpeg,image/webp"
                            className="sr-only"
                            onChange={(e) => { const f = e.target.files?.[0]; if (f) handleLogoFile(f); e.currentTarget.value = "" }}
                          />
                          <Icon name="upload" size={16} stroke={1.5} />
                          {logoSrc ? "Replace" : "Upload"}
                        </label>
                        <button
                          type="button"
                          disabled={!logoSrc}
                          onClick={() => setLogoSrc(null)}
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
                  )}

                  <div className="space-y-2">
                    <Label>Appearance</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {([["Light", false], ["Dark", true]] as const).map(([lbl, val]) => (
                        <button
                          key={lbl}
                          type="button"
                          onClick={() => setDark(val)}
                          className={cn(
                            "flex h-9 items-center justify-center gap-1.5 rounded-lg [corner-shape:squircle] border text-sm font-semibold transition-[border-color,background]",
                            dark === val ? "border-primary bg-accent-tint" : "border-border-strong bg-card hover:bg-fill"
                          )}
                        >
                          <Icon name={val ? "cloud" : "bulb"} size={16} stroke={1.5} />
                          {lbl}
                        </button>
                      ))}
                    </div>
                  </div>

                  <p className="text-[11px] leading-relaxed text-muted-foreground/70">
                    These controls re-skin the styleguide live. A brand hue is preview-only — the system's own brand is the neutral gray.
                  </p>
                </div>
              </CollapsibleSection>
            </div>
          </header>

          {/* below the header divider: a sub-nav of the sections ON the current page —
              click one to slide the content pane to that card (scroll-spy marks the
              section you're in). This is the per-page contents rail for longer pages. */}
          <ColumnBody>
            {sections.length > 0 ? (
              <>
                {/* the card inset (--ws-card-inset) already sets the gap below the divider;
                    the label just insets its text to align with the rows (px-2.5). */}
                <div className="px-2.5 pb-2 text-xs leading-[1.4] font-medium text-icon">On this page</div>
                <NavList>
                  {sections.map((s) => (
                    <NavItem key={s.id} current={activeSection === s.id} onClick={() => scrollToSection(s.id)}>
                      {s.title}
                    </NavItem>
                  ))}
                </NavList>
              </>
            ) : (
              <p className="px-2.5 text-[11px] leading-relaxed text-muted-foreground/60">
                This page has no sections to jump to.
              </p>
            )}
          </ColumnBody>
        </LayoutColumn>
      }
      /* ================= COLUMN 3: docs content canvas ================= */
      content={
        <LayoutColumn as="main" variant="canvas">
          <ColumnHeader hairline={false} className="gap-0 pr-3 pl-3.5">
            {/* compact-only: opens the re-skin drawer */}
            <AgentDrawerButton
              src={agentSrc}
              aria-label="Open tools"
              onClick={() => { setAgentOpen((o) => !o); setNavOpen(false) }}
            />
            {/* the travelling avatar rides into this slot when the sub-nav collapses;
                clicking the avatar reopens it (see <TravellingAgentAvatar onReopen>) */}
            <span className="ws-agent-slot" ref={contentSlotRef} />
            <span className="mr-2 grid size-5 shrink-0 place-items-center text-foreground">
              <Icon name={current?.icon ?? "sparkles"} size={20} stroke={1.5} />
            </span>
            <ColumnTitle>{current?.label}</ColumnTitle>
            <HamburgerButton onClick={() => { setNavOpen((o) => !o); setAgentOpen(false) }} />
          </ColumnHeader>

          <ColumnBody ref={contentBodyRef}>
            <div ref={contentWrapRef} className="mx-auto max-w-3xl px-10 pt-8 pb-28">{current?.render()}</div>
            {/* trailing room so the last section can scroll to the top (see tailSpacer) */}
            <div aria-hidden style={{ height: tailSpacer }} />
          </ColumnBody>

          {/* docked resting pill — the entry point to the agent layer. The Launcher /
              Coach mark pages render the full <Launcher> morph machine themselves, so
              suppress this static pill there to avoid a duplicate. */}
          {selected !== "launcher" && selected !== "coach-mark" && (
            <div className="pointer-events-none absolute inset-x-0 bottom-5 flex justify-center">
              <LauncherPill agentName={agent.name} avatarSrc={agentSrc} className="pointer-events-auto" />
            </div>
          )}
        </LayoutColumn>
      }
    />

    {/* the ONE travelling agent avatar (desktop): a fixed sibling that rides between
        the sub-nav identity header and the content header on collapse, and wiggles on
        hover while docked in the content header. Shared with the Demo, verbatim. */}
    <TravellingAgentAvatar
      ref={avRef}
      src={agentSrc}
      alt={agent.name}
      collapsed={subCollapsed}
      openSlotRef={subSlotRef}
      collapsedSlotRef={contentSlotRef}
      onReopen={() => setSubCollapsed(false)}
    />
    </>
  )
}
