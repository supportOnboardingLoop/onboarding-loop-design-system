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
import { HamburgerButton, AgentDrawerButton } from "@/components/product/compact-bar"
import { IconButton } from "@/components/base/icon-button"
import { NavItem } from "@/components/product/nav-item"
import { CollapsibleSection } from "@/components/product/section"
import { AccountCard } from "@/components/product/account-card"
import { SearchLauncher } from "./search/SearchLauncher"
import { TravellingAgentAvatar, type TravellingAvatarHandle } from "@/components/product/travelling-avatar"
import { Icon } from "@/components/base/icon"
import { NAV } from "./showcases"
import { useSkinState, NEUTRAL_SKIN, CustomizePanel } from "./customize"

// Build-time timestamp injected by Vite (see vite.config.ts). On Vercel every
// deploy is a fresh build, so this is the last time the site went live.
declare const __BUILD_DATE__: string
const LAST_UPDATED = new Date(__BUILD_DATE__).toLocaleDateString("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
})

// The styleguide home, built ON the design system — the SAME <WorkspaceShell> +
// column primitives (LayoutColumn / ColumnHeader / ColumnTitle / ColumnBody /
// ColumnFooter / NavList) + shared chrome (BrandMark, IconButton toggles, the
// compact-bar triggers) the Demo uses, so the two frames can't drift: a layout
// change reaches both, and both get the responsive drawers. Here the shell hosts a
// 3-column DOCS layout — a primary nav card + a live re-skin sub-nav (font / theme /
// avatar / client-logo) + the grey docs canvas with a docked launcher pill.

export default function App() {
  const flat = NAV.flatMap((e) => (e.kind === "group" ? e.pages : [e.page]))
  const [selected, setSelected] = useState(() => flat.find((p) => p.id === "introduction")?.id ?? flat[0]?.id)
  const [navCollapsed, setNavCollapsed] = useState(false)
  const [subCollapsed, setSubCollapsed] = useState(false)
  const [navOpen, setNavOpen] = useState(false) // compact primary-nav sheet
  const [agentOpen, setAgentOpen] = useState(false) // compact re-skin drawer
  // the live re-skin state (theme / font / agent / light-dark), shared with the
  // demo via the same hook + panel. Ephemeral here (no persistKey): the
  // styleguide always boots to the neutral default, exactly as before.
  const skin = useSkinState(NEUTRAL_SKIN)

  // sub-nav "on this page": the anchorable sections rendered on the current page
  // (each GroupHeader carries [data-section-anchor]); clicking one scrolls the
  // content pane to it, and a light scroll-spy marks the section you're in.
  const contentBodyRef = useRef<HTMLDivElement>(null)
  const contentWrapRef = useRef<HTMLDivElement>(null)
  // the "on this page" rail is now a TWO-TIER tree: tier-1 subsections
  // (data-section-anchor="group") become accordions, each holding its tier-2
  // sub-subsections (data-section-anchor="item") as links. `flatAnchors` is the
  // flattened order used by the scroll-spy + tail spacer.
  const [subGroups, setSubGroups] = useState<{ id: string; title: string; items: { id: string; title: string }[] }[]>([])
  const [flatAnchors, setFlatAnchors] = useState<{ id: string; title: string }[]>([])
  const [activeSection, setActiveSection] = useState<string | null>(null)
  // a trailing spacer so EVERY section (even the last) can scroll its title to the
  // top of the pane, and a lock so the scroll-spy doesn't fight a click mid-animation.
  const [tailSpacer, setTailSpacer] = useState(0)
  const spyLock = useRef(false)
  // a section to scroll to once the NEXT page has rendered its anchors (search jumps
  // that cross pages set this; the anchor effect below reads + clears it).
  const pendingSectionRef = useRef<string | null>(null)

  // the shared travelling agent avatar (same wiring as the Demo): rides the sub-nav
  // header slot while open, slides to the content-header slot on collapse, wiggles on
  // hover. A fixed sibling of the shell; the two slots below are its landing targets.
  const subSlotRef = useRef<HTMLSpanElement>(null)
  const contentSlotRef = useRef<HTMLSpanElement>(null)
  const avRef = useRef<TravellingAvatarHandle | null>(null)
  const firstShift = useRef(true)

  // (skin state + its :root effects + the logo compositor now live in useSkinState)

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
      // build the tier tree: each "group" opens a subsection accordion; each "item"
      // (or a loose "block") nests under the most recent group. A group with no items
      // renders as a plain link; a page with no groups falls back to a flat list.
      const groups: { id: string; title: string; items: { id: string; title: string }[] }[] = []
      const flatA: { id: string; title: string }[] = []
      for (const n of nodes) {
        const entry = { id: n.id, title: n.dataset.sectionTitle ?? n.textContent ?? "" }
        flatA.push(entry)
        if (n.dataset.sectionAnchor === "group") {
          groups.push({ ...entry, items: [] })
        } else {
          const g = groups[groups.length - 1]
          if (g) g.items.push(entry)
          else groups.push({ ...entry, items: [] }) // loose item before any group → its own plain link
        }
      }
      setSubGroups(groups)
      setFlatAnchors(flatA)
      // land at the top of each newly-opened page — UNLESS a search jump asked for a
      // specific section (the pending-scroll effect below handles that after commit).
      if (!pendingSectionRef.current) root.scrollTop = 0
    })
    return () => cancelAnimationFrame(raf)
  }, [selected])

  // light scroll-spy: mark the section currently at the top of the content pane.
  // Skips while a click-driven scroll is animating (spyLock) so the clicked item
  // stays selected instead of flickering to whatever passes under the top mid-scroll.
  useEffect(() => {
    const root = contentBodyRef.current
    if (!root || flatAnchors.length === 0) { setActiveSection(null); return }
    const compute = () => {
      if (spyLock.current) return
      const rootTop = root.getBoundingClientRect().top
      let cur = flatAnchors[0]?.id ?? null
      for (const s of flatAnchors) {
        const el = root.querySelector<HTMLElement>("#" + CSS.escape(s.id))
        if (el && el.getBoundingClientRect().top - rootTop <= 24) cur = s.id
      }
      setActiveSection(cur)
    }
    compute()
    root.addEventListener("scroll", compute, { passive: true })
    return () => root.removeEventListener("scroll", compute)
  }, [flatAnchors])

  // size the trailing spacer so the LAST section's title can still reach the top of
  // the pane (with a little blank space below). Measured against the natural content
  // height (contentWrapRef, which excludes the spacer) so it converges without looping.
  useEffect(() => {
    const root = contentBodyRef.current
    const wrap = contentWrapRef.current
    if (!root || !wrap) return
    const recompute = () => {
      if (flatAnchors.length === 0) { setTailSpacer(0); return }
      const lastEl = root.querySelector<HTMLElement>("#" + CSS.escape(flatAnchors[flatAnchors.length - 1].id))
      if (!lastEl) { setTailSpacer(0); return }
      const anchorPos = lastEl.getBoundingClientRect().top - root.getBoundingClientRect().top + root.scrollTop
      const needed = Math.max(0, Math.ceil(anchorPos - 12 + root.clientHeight - wrap.offsetHeight))
      setTailSpacer((prev) => (prev === needed ? prev : needed))
    }
    const raf = requestAnimationFrame(recompute)
    window.addEventListener("resize", recompute)
    return () => { cancelAnimationFrame(raf); window.removeEventListener("resize", recompute) }
  }, [flatAnchors])

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

  // a search result was chosen: switch page (if needed) + scroll to its section. When
  // the target is on the current page we scroll now; otherwise we stash the section and
  // the pending-scroll effect fires once the new page's anchors exist.
  const navigateTo = (pageId: string, secId?: string) => {
    if (pageId === selected) {
      if (secId) scrollToSection(secId)
      return
    }
    pendingSectionRef.current = secId ?? null
    setSelected(pageId)
  }

  // scroll to a cross-page search target once its anchors are in the DOM
  useEffect(() => {
    const secId = pendingSectionRef.current
    if (!secId) return
    pendingSectionRef.current = null
    scrollToSection(secId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [flatAnchors])

  const current = flat.find((i) => i.id === selected)
  // the resolved agent identity + avatar (name/role, and the Blank agent's logo
  // disc) come from the shared skin state; the header, launcher pill and avatar
  // alt all read the same values.
  const agent = skin.agent
  const agentSrc = skin.agentSrc

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
            {!navCollapsed && (
              // the Onboarding Loop wordmark (light/dark variants swap with the theme)
              <div className="flex min-w-0 items-center">
                <img src="/brand/onboarding-loop.png" alt="Onboarding Loop" className="h-[22px] w-auto shrink-0 dark:hidden" />
                <img src="/brand/onboarding-loop-dark.png" alt="Onboarding Loop" className="hidden h-[22px] w-auto shrink-0 dark:block" />
              </div>
            )}
            <IconButton
              icon={navCollapsed ? "chevrons-right" : "chevrons-left"}
              motion={navCollapsed ? "arrow-right" : "arrow-left"}
              className={cn(!navCollapsed && "ml-auto")}
              aria-label={navCollapsed ? "Expand navigation" : "Collapse navigation"}
              onClick={() => setNavCollapsed((c) => !c)}
            />
          </ColumnHeader>

          <ColumnBody>
            {NAV.map((entry, gi) => {
              // top-level nav is a mix of standalone pages (Links, Downloads, Style
              // Guide) and one "Components" accordion group.
              const pages = entry.kind === "group" ? entry.pages : [entry.page]
              const key = entry.kind === "group" ? entry.label : entry.page.id
              if (navCollapsed) {
                return (
                  <div key={key}>
                    {entry.kind === "group" && gi > 0 && <div className="mx-auto my-3.5 h-px w-9 bg-border" />}
                    <div className="flex flex-col items-center gap-0.5">
                      {pages.map((item) => (
                        <NavItem key={item.id} icon={item.icon} collapsed current={selected === item.id} title={item.label} onClick={() => setSelected(item.id)}>
                          {item.label}
                        </NavItem>
                      ))}
                    </div>
                  </div>
                )
              }
              if (entry.kind === "page") {
                return (
                  <NavItem key={key} icon={entry.page.icon} current={selected === entry.page.id} onClick={() => setSelected(entry.page.id)}>
                    {entry.page.label}
                  </NavItem>
                )
              }
              return (
                <CollapsibleSection key={key} label={entry.label} count={entry.pages.length} className={gi > 0 ? "mt-2" : undefined}>
                  <NavList>
                    {entry.pages.length === 0 ? (
                      <div className="px-2.5 pb-2 text-[11px] leading-snug text-muted-foreground/60">{entry.empty}</div>
                    ) : (
                      entry.pages.map((item) => (
                        <NavItem key={item.id} icon={item.icon} current={selected === item.id} onClick={() => setSelected(item.id)}>
                          {item.label}
                        </NavItem>
                      ))
                    )}
                  </NavList>
                </CollapsibleSection>
              )
            })}
          </ColumnBody>

          {/* the "created by" credit, styled as the demo's account card (components/product/
              account-card): the real profile photo (online dot off), "Created by Bal Sieber",
              and a smaller "Last updated {date}" line, with the LinkedIn glyph trailing. The
              WHOLE card is one link to Bal's LinkedIn, so the account-card hover reads as a real
              affordance (glyph darkens with it). Collapsed nav shows just the avatar, centered. */}
          <ColumnFooter divider className={cn(navCollapsed ? "px-3 py-3" : "px-2.5 py-2.5")}>
            <a
              href="https://www.linkedin.com/in/balsieber/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Bal Sieber on LinkedIn"
              className="group block"
            >
              <AccountCard
                className="mt-0"
                avatarSrc="/brand/profile-bal.png"
                online={false}
                collapsed={navCollapsed}
                name="Created by Bal Sieber"
                email={<span className="text-[11px]">Last updated {LAST_UPDATED}</span>}
                trailing={
                  <svg
                    width="18"
                    height="18"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden
                    className="shrink-0 text-muted-foreground transition-colors group-hover:text-foreground"
                  >
                    <path d="M18.5195 0H1.47656C0.660156 0 0 0.644531 0 1.44141V18.5547C0 19.3516 0.660156 20 1.47656 20H18.5195C19.3359 20 20 19.3516 20 18.5586V1.44141C20 0.644531 19.3359 0 18.5195 0ZM5.93359 17.043H2.96484V7.49609H5.93359V17.043ZM4.44922 6.19531C3.49609 6.19531 2.72656 5.42578 2.72656 4.47656C2.72656 3.52734 3.49609 2.75781 4.44922 2.75781C5.39844 2.75781 6.16797 3.52734 6.16797 4.47656C6.16797 5.42188 5.39844 6.19531 4.44922 6.19531ZM17.043 17.043H14.0781V12.4023C14.0781 11.2969 14.0586 9.87109 12.5352 9.87109C10.9922 9.87109 10.7578 11.0781 10.7578 12.3242V17.043H7.79688V7.49609H10.6406V8.80078H10.6797C11.0742 8.05078 12.043 7.25781 13.4844 7.25781C16.4883 7.25781 17.043 9.23438 17.043 11.8047V17.043Z" />
                  </svg>
                }
              />
            </a>
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
            {/* agent identity — the disc + name/role + collapse toggle. Height matches
                the shared AgentHomeHeader idrow (102px) so the gap below the identity to
                the Customize accordion equals the accordion's 16px left/right padding. */}
            <div className="relative h-[102px] shrink-0">
              {/* the shared travelling avatar rides into this slot on desktop; a static
                  <img> takes its place inside the compact drawer (workspace.css .ws-agent-hdr*) */}
              <span className="ws-agent-hdr__slot" ref={subSlotRef} />
              <img className="ws-agent-hdr__av" src={agentSrc} alt="" />
              {/* right-[48px] clears the collapse toggle; a long custom name/role is
                  clipped with an ellipsis rather than spilling off the header edge */}
              <div className="absolute top-[53.5px] right-[48px] left-[100px] flex -translate-y-1/2 flex-col items-start gap-px whitespace-nowrap">
                <b className="max-w-full truncate text-[15px] leading-[1.35] font-bold">{agent.name}</b>
                <span className="max-w-full truncate text-[13px] leading-[1.35] text-muted-foreground">{agent.role}</span>
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
            {/* pb-4 = 16px below the accordion to the divider (matches its 16px L/R). The
                -mt-1.5 nudges the whole accordion up 6px: the avatar sits in a disc, whose
                curved bottom optically reads higher than a flat edge, so a geometrically
                equal gap looks top-heavy. Measured so the space above the "Customize" row
                reads even with the space below it. */}
            <div className="-mt-1.5 px-4 pb-4">
              <CustomizePanel skin={skin} />
            </div>
          </header>

          {/* below the header divider: a sub-nav of the sections ON the current page —
              click one to slide the content pane to that card (scroll-spy marks the
              section you're in). This is the per-page contents rail for longer pages. */}
          <ColumnBody>
            {subGroups.length > 0 ? (
              <>
                <div className="flex flex-col gap-1">
                  {subGroups.map((g) =>
                    g.items.length > 0 ? (
                      // a subsection with sub-subsections → an accordion of anchor links
                      <CollapsibleSection key={g.id} label={g.title} count={g.items.length}>
                        <NavList>
                          {g.items.map((s) => (
                            <NavItem key={s.id} current={activeSection === s.id} onClick={() => scrollToSection(s.id)}>
                              {s.title}
                            </NavItem>
                          ))}
                        </NavList>
                      </CollapsibleSection>
                    ) : (
                      // a leaf subsection (e.g. a foundation) → a plain jump link
                      <NavItem key={g.id} current={activeSection === g.id} onClick={() => scrollToSection(g.id)}>
                        {g.title}
                      </NavItem>
                    )
                  )}
                </div>
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

          <ColumnBody ref={contentBodyRef} className="[scrollbar-gutter:stable]">
            {/* full-width docs column, flush with the content header. The scroll
                gutter is reserved (scrollbar-gutter: stable) so the 8px DS scrollbar
                doesn't inset the content; the right padding is then 4px (= the
                header's 12px minus that 8px gutter) so the content's right edge lands
                on the header's right edge. Left stays 14px (pl-3.5) to match the icon. */}
            <div ref={contentWrapRef} className="pt-8 pb-28 pr-1 pl-3.5">{current?.render()}</div>
            {/* trailing room so the last section can scroll to the top (see tailSpacer) */}
            <div aria-hidden style={{ height: tailSpacer }} />
          </ColumnBody>
          {/* the docked launcher (now a global SEARCH command-palette) is a fixed sibling
              of the shell — see <SearchLauncher> below, docked to this content body. */}
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

    {/* the docked launcher, run as the styleguide's global SEARCH command-palette: hover
        (or ⌘K) opens it into a search field, typing filters the whole design system, and
        a result jumps to the page / section anchor. It's the launcher-agent with a search
        capability — same component the demo agent uses. Suppressed on the Product page,
        which renders its own <Launcher> showcase. */}
    {selected !== "product" && (
      <SearchLauncher
        agentName={agent.name}
        avatarSrc={agentSrc}
        dockRef={contentBodyRef}
        regionRef={contentBodyRef}
        scrollRef={contentBodyRef}
        onNavigate={navigateTo}
      />
    )}
    </>
  )
}
