/* ============================================================
   agent-widgets — the answer/build widgets the DS <Conversation> mounts in the
   agent-led animation. They are thin wrappers over the real DS agent widgets
   (Choices, and a self-building progress card in the ReportBuild shape), auto
   driven since the scene is watch-only: the choice auto-picks after a dwell (as
   if the user clicked), the build fills itself and reports progress so the left
   workspace panel can move in lockstep. `fast` collapses all delays for the
   reduced-motion / finished-state render.
   ============================================================ */
import * as React from "react"
import { useEffect, useState } from "react"

import { Button } from "@/components/base/button"
import { Icon } from "@/components/base/icon"
import { Choices } from "@/components/product/choices"

export const WORK_OPTS = [
  { value: "a", label: "Client work" },
  { value: "b", label: "Internal team" },
  { value: "c", label: "Just exploring" },
]

const labelOf = (v: string) => WORK_OPTS.find((o) => o.value === v)?.label ?? v

/** DS Choices that auto-selects `autoPick` after a dwell (showing the reveal
 *  check), then resolves the ask with the picked label. A real hover/click still
 *  works, but the frame is pointer-events:none, so it's watch-only. */
export function AutoChoices({
  autoPick,
  fast,
  onDone,
  onHover,
}: {
  autoPick: string
  fast?: boolean
  onDone: (echo: string) => void
  onHover?: () => void
}) {
  const [value, setValue] = useState<string | undefined>()
  useEffect(() => {
    if (fast) {
      setValue(autoPick)
      onDone(labelOf(autoPick))
      return
    }
    const t1 = setTimeout(() => onHover?.(), 1000)
    const t2 = setTimeout(() => setValue(autoPick), 1400) // show the pick + check
    const t3 = setTimeout(() => onDone(labelOf(autoPick)), 1900) // resolve after the check reads
    return () => {
      clearTimeout(t1)
      clearTimeout(t2)
      clearTimeout(t3)
    }
  }, [autoPick, fast, onDone, onHover])
  return (
    <Choices
      options={WORK_OPTS}
      value={value}
      onValueChange={(v) => {
        setValue(v)
        onDone(labelOf(v))
      }}
    />
  )
}

/** In-chat build widget (the ReportBuild shape): a titled progress card that
 *  fills 0->100% over ~2.3s, reporting progress so the left panel syncs, then
 *  settles to a "Workspace built" row. */
export function WorkspaceBuild({
  fast,
  onProgress,
  onDone,
}: {
  fast?: boolean
  onProgress?: (p: number) => void
  onDone?: () => void
}) {
  const [pct, setPct] = useState(0)
  const [ready, setReady] = useState(false)
  useEffect(() => {
    if (fast) {
      setPct(100)
      onProgress?.(1)
      setReady(true)
      onDone?.()
      return
    }
    let raf = 0
    let t0 = 0
    const dur = 2300
    const step = (ts: number) => {
      if (!t0) t0 = ts
      const e = Math.min(1, (ts - t0) / dur)
      setPct(Math.round(e * 100))
      onProgress?.(e)
      if (e < 1) raf = requestAnimationFrame(step)
      else raf = window.setTimeout(() => { setReady(true); onDone?.() }, 300) as unknown as number
    }
    raf = requestAnimationFrame(step)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(raf)
    }
  }, [fast, onProgress, onDone])

  if (ready) {
    return (
      <div className="rgen flex items-center gap-2.5 rounded-2xl [corner-shape:squircle] border border-border-strong bg-card p-3 shadow-xs">
        <span className="grid size-8 shrink-0 place-items-center rounded-full bg-success text-white">
          <Icon name="check" size={16} stroke={2.4} />
        </span>
        <span className="text-sm font-semibold text-foreground">Workspace built</span>
      </div>
    )
  }
  return (
    <div className="rgen flex flex-col gap-2 rounded-2xl [corner-shape:squircle] border border-border bg-card p-3.5">
      <div className="flex items-center justify-between text-sm font-medium">
        <span className="text-foreground">Building your workspace</span>
        <span className="tabular-nums text-muted-foreground">{pct}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-border">
        <div className="h-full rounded-full bg-primary transition-none" style={{ width: `${pct}%` }} />
      </div>
    </div>
  )
}

/** The handoff CTAs the agent offers once the workspace is built. Decorative in
 *  the watch-only scene; real DS Buttons so they match the product. Auto-resolves
 *  its ask after a dwell so the scene can settle + loop. */
export function HandoffCtas({ fast, onDone }: { fast?: boolean; onDone?: (echo: string) => void }) {
  useEffect(() => {
    const t = setTimeout(() => onDone?.(""), fast ? 0 : 1300)
    return () => clearTimeout(t)
  }, [fast, onDone])
  return (
    <div className="mt-1 flex flex-wrap gap-2">
      <Button variant="secondary" size="sm">
        Add teammate
      </Button>
      <Button variant="primary" size="sm">
        View project
      </Button>
    </div>
  )
}
