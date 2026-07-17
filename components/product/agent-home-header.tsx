import * as React from "react"

import { cn } from "@/lib/utils"
import { IconButton } from "../base/icon-button"

// The agent-identity header atop the agent-home column (the "who is this agent"
// block: a 76px avatar + name + role, with a collapse toggle). Shared so the Demo
// and the styleguide frame render it identically. The avatar is a SLOT that the
// travelling avatar (a fixed sibling) rides into while the column is open; a
// static <img> is shown only on compact, inside the drawer. Layout lives in
// components/workspace.css (.ws-agent-hdr*).
type AgentHomeHeaderProps = {
  name: React.ReactNode
  role: React.ReactNode
  /** the agent avatar PNG — used for the static (compact-drawer) avatar */
  avatarSrc: string
  /** the landing slot the travelling avatar rides into while the column is open */
  slotRef?: React.RefObject<HTMLSpanElement | null>
  onCollapse?: () => void
  className?: string
  /** extra content carried inside the gray header, below the identity row (e.g. a
   *  Context Engine accordion). The header grows to fit it. */
  children?: React.ReactNode
}

function AgentHomeHeader({ name, role, avatarSrc, slotRef, onCollapse, className, children }: AgentHomeHeaderProps) {
  return (
    <header data-slot="agent-home-header" className={cn("ws-agent-hdr", className)}>
      <div className="ws-agent-hdr__idrow">
        <span className="ws-agent-hdr__slot" ref={slotRef} />
        <img className="ws-agent-hdr__av" src={avatarSrc} alt="" />
        <span className="ws-agent-hdr__id">
          <b>{name}</b>
          <span>{role}</span>
        </span>
        {onCollapse && (
          <IconButton
            icon="chevrons-left"
            motion="arrow-left"
            className="ws-agent-hdr__toggle"
            aria-label="Collapse agent home"
            onClick={onCollapse}
          />
        )}
      </div>
      {children && <div className="ws-agent-hdr__extra">{children}</div>}
    </header>
  )
}

export { AgentHomeHeader }
export type { AgentHomeHeaderProps }
