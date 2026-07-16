import * as React from "react"

import { cn } from "@/lib/utils"

// Ported from the starter layout (.launcher, DEFAULT state): the agent launcher
// docked bottom-centre of the content area — one fixed card + a floating agent
// PNG breaking out the top-left, an "Ask <agent>" CTA and a ⌘K key hint. The
// full morph state machine (input/modal/saving/notif/coach) is the deferred
// follow-up; this is the resting pill.
function LauncherPill({
  agentName = "Wilson",
  avatarSrc,
  kbd = "⌘K",
  className,
  ...props
}: React.ComponentProps<"button"> & { agentName?: string; avatarSrc?: string; kbd?: string }) {
  return (
    <button
      type="button"
      data-slot="launcher"
      className={cn(
        "relative inline-flex h-[68px] cursor-pointer items-center rounded-[34px] [corner-shape:squircle] border border-border bg-card pr-4 pl-[70px] shadow-card transition-shadow hover:shadow-lift",
        className
      )}
      {...props}
    >
      {avatarSrc && (
        <img src={avatarSrc} alt="" className="pointer-events-none absolute top-2 left-[14px] block w-[51px]" />
      )}
      <span className="inline-flex items-center gap-2.5 whitespace-nowrap">
        <span className="text-base font-semibold tracking-[-0.01em] text-foreground">Ask {agentName}</span>
        <span className="inline-flex h-6 items-center justify-center rounded-xl [corner-shape:squircle] border border-border-strong px-[9px] text-xs font-medium text-muted-foreground">
          {kbd}
        </span>
      </span>
    </button>
  )
}

export { LauncherPill }
