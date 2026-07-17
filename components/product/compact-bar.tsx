import * as React from "react"

import { cn } from "@/lib/utils"

// The compact-bar triggers shown in the content header below 1024px (hidden on
// desktop via components/workspace.css). Shared so the Demo and the styleguide
// frame get the same responsive affordances:
//   • HamburgerButton  — two lines that rotate into an X (driven by the shell's
//                        .is-nav-open ancestor); opens the primary-nav TOP sheet.
//   • AgentDrawerButton — the agent avatar; opens the agent-home LEFT drawer.

type HamburgerButtonProps = React.ComponentProps<"button">

function HamburgerButton({ className, "aria-label": ariaLabel = "Open menu", ...props }: HamburgerButtonProps) {
  return (
    <button type="button" data-slot="hamburger" aria-label={ariaLabel} className={cn("ws-hamburger", className)} {...props}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round">
        <line className="l1" x1="3" y1="12" x2="21" y2="12" />
        <line className="l2" x1="3" y1="12" x2="21" y2="12" />
      </svg>
    </button>
  )
}

type AgentDrawerButtonProps = React.ComponentProps<"button"> & { src: string }

function AgentDrawerButton({ src, className, "aria-label": ariaLabel = "Open agent", ...props }: AgentDrawerButtonProps) {
  return (
    <button type="button" data-slot="agent-drawer-button" aria-label={ariaLabel} className={cn("ws-agentbtn", className)} {...props}>
      <img src={src} alt="" />
    </button>
  )
}

export { HamburgerButton, AgentDrawerButton }
export type { HamburgerButtonProps, AgentDrawerButtonProps }
