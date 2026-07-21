/* /demo — the live demo inside the marketing chrome. PageShell supplies the
   shared TopBar + Footer; this island fills the content area with a bordered
   SURFACE that frames the demo, a toolbar hugging its top (agent · color · font ·
   light/dark, plus device size · load-a-SaaS · open-in-new-tab), and a gutter of
   whitespace around the surface. Picking tablet/mobile shrinks the surface itself.

   The demo is the SAME app deployed at demo.onboardingloop.ai, framed in `?embed=1`
   mode: it hides its own Customize accordion + SaaS picker and applies what this
   page posts down. This page holds the skin + SaaS choice (skin is inert — it never
   re-skins the marketing site) and relays every change into the frame over
   postMessage; the handshake (`ol-demo` "ready" → push) covers the frame loading
   after us. */
import * as React from "react"

import { cn } from "@/lib/utils"
import { DemoToolbar, type DeviceKey } from "@/components/web/DemoToolbar"
import { useSkinState, NEUTRAL_SKIN } from "@/styleguide/src/customize"
import { DEFAULT_PRESET_ID } from "@/styleguide/src/presets"

// The demo app's origin. In dev it's the Vite styleguide server (serves
// /demo.html); in prod the middleware serves the demo at the clean root. A
// `?demoPort=` escape hatch covers a styleguide dev server on a non-default port.
function resolveDemo() {
  const params = new URLSearchParams(window.location.search)
  if (import.meta.env.DEV) {
    const base = `http://localhost:${params.get("demoPort") || "5173"}`
    return { base, embedSrc: `${base}/demo.html?embed=1`, openBase: `${base}/demo.html` }
  }
  const base = "https://demo.onboardingloop.ai"
  return { base, embedSrc: `${base}/?embed=1`, openBase: `${base}/` }
}

export default function DemoPage() {
  const demo = React.useMemo(resolveDemo, [])
  const [device, setDevice] = React.useState<DeviceKey>("desktop")
  const [saas, setSaas] = React.useState(DEFAULT_PRESET_ID)

  // the frame boots to the default SaaS (in the src, once); later switches relay
  // over postMessage so the frame never reloads
  const src = React.useMemo(() => `${demo.embedSrc}&saas=${DEFAULT_PRESET_ID}`, [demo])
  // "open in new tab" -> the FULL demo (not embedded), on the SaaS in view
  const openUrl = `${demo.openBase}?saas=${saas}`

  // inert skin state: it holds the choice and derives the agent/color, but never
  // writes the marketing site's :root (enabled: false). The demo frame is the
  // only thing it skins, via the postMessage relay below.
  const skin = useSkinState(NEUTRAL_SKIN, { enabled: false })

  const frameRef = React.useRef<HTMLIFrameElement>(null)
  const rootRef = React.useRef<HTMLDivElement>(null)

  // the content area fills from below the sticky header to the viewport bottom.
  // Measure the header rather than hard-coding its height, so it stays flush.
  React.useEffect(() => {
    const header = document.querySelector("header.bar")
    const root = rootRef.current
    if (!header || !root) return
    const set = () => root.style.setProperty("--demo-bar-h", `${header.getBoundingClientRect().height}px`)
    set()
    const ro = new ResizeObserver(set)
    ro.observe(header)
    window.addEventListener("resize", set)
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", set)
    }
  }, [])

  const post = React.useCallback((msg: object) => {
    frameRef.current?.contentWindow?.postMessage(msg, "*")
  }, [])

  const { theme, font, hex, dark, agentKey } = skin
  const pushSkin = React.useCallback(
    () => post({ source: "ol-demo-host", type: "skin", skin: { theme, font, hex, dark, agentKey } }),
    [post, theme, font, hex, dark, agentKey]
  )
  const pushSaas = React.useCallback(() => post({ source: "ol-demo-host", type: "saas", saas }), [post, saas])

  // live relay: push whenever the skin or SaaS changes
  React.useEffect(() => {
    pushSkin()
  }, [pushSkin])
  React.useEffect(() => {
    pushSaas()
  }, [pushSaas])

  // ...and re-push everything on the frame's "ready" handshake (it loads after us)
  React.useEffect(() => {
    const onMsg = (e: MessageEvent) => {
      const d = e.data as { source?: string; type?: string } | null
      if (d?.source === "ol-demo" && d.type === "ready") {
        pushSkin()
        pushSaas()
      }
    }
    window.addEventListener("message", onMsg)
    return () => window.removeEventListener("message", onMsg)
  }, [pushSkin, pushSaas])

  const onFrameLoad = () => {
    pushSkin()
    pushSaas()
  }

  // The CHROME (website header + content area) is the INVERSE of the demo: by
  // default the demo is light, so the chrome goes dark to set it off; when the
  // visitor flips the demo to dark, the chrome goes light. `.dark` on the page
  // re-skins the toolbar controls; `data-bar` + the header's `is-dark` class dark
  // the marketing header (the same class its own scroll sampler would set).
  const chromeDark = !dark
  React.useEffect(() => {
    const header = document.querySelector("header.bar")
    if (!header) return
    header.classList.toggle("is-dark", chromeDark)
    return () => header.classList.remove("is-dark")
  }, [chromeDark])

  // the toolbar (controls) hugs the demo but sits OUTSIDE the surface, in the page
  // content area; the surface's border wraps only the demo. Both live in .dv-stack,
  // which shrinks to the device width so they stay aligned when the demo shrinks.
  return (
    <div className={cn("dv-page", chromeDark && "dark")} data-bar={chromeDark ? "dark" : "white"} ref={rootRef}>
      <div className="dv-stack" data-device={device}>
        <DemoToolbar
          skin={skin}
          device={device}
          onDeviceChange={setDevice}
          avatarBase={demo.base}
          saas={saas}
          onSaasChange={setSaas}
          openUrl={openUrl}
        />
        <div className="dv-surface">
          <iframe
            ref={frameRef}
            className="dv-frame"
            src={src}
            title="The Onboarding Loop live demo"
            onLoad={onFrameLoad}
            allow="clipboard-write"
          />
        </div>
      </div>
    </div>
  )
}
