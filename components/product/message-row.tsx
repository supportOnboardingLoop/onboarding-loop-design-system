import * as React from "react"

import { cn } from "@/lib/utils"

// Ported from the kit (kit/chat.css .bp-msg / .bp-bubble). A conversation turn:
// an avatar, a small head row (name · role · time), and a bubble. The agent sits
// on the left with its avatar a standalone floating PNG (the head pokes out the
// top of the circle, never clipped into a disc); the user sits on the right with
// an initials circle. Speakers read by side + tail, not by a loud fill.

// The agent avatar: a floating illustration in a 38px footprint, top overflowing.
function AgentAvatar({ src, alt = "", className }: { src: string; alt?: string; className?: string }) {
  return (
    <span className={cn("bp-fig-avatar", className)}>
      <img src={src} alt={alt} />
    </span>
  )
}

// The user avatar: an initials circle with a hairline ring (no photo).
function UserAvatar({ initials = "ME", className }: { initials?: string; className?: string }) {
  return <span className={cn("bp-msg__avatar bp-msg__avatar--empty", className)}>{initials}</span>
}

type MessageRowProps = React.ComponentProps<"div"> & {
  side?: "agent" | "user"
  /** the avatar node — <AgentAvatar> for the agent, <UserAvatar> for the user */
  avatar?: React.ReactNode
  name?: React.ReactNode
  role?: React.ReactNode
  time?: React.ReactNode
}

function MessageRow({ side = "agent", avatar, name, role, time, className, children, ...props }: MessageRowProps) {
  const user = side === "user"
  return (
    <div data-slot="message-row" className={cn("bp-msg", user && "bp-msg--user", className)} {...props}>
      {avatar}
      <div className="bp-msg__content">
        {(name || role || time) && (
          <div className="bp-msg__head">
            <span className="bp-msg__who">
              {name && <span className="bp-msg__name">{name}</span>}
              {role && <span className="bp-msg__role">{role}</span>}
            </span>
            {time && <span className="bp-msg__time">{time}</span>}
          </div>
        )}
        {children}
      </div>
    </div>
  )
}

// The bubble on its own — squared toward the tail, neutral grey for the bot, a
// hair more ink for the user. Wrap text in <p> so the p+p spacing lands.
function Bubble({
  side = "agent",
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { side?: "agent" | "user" }) {
  return (
    <div
      data-slot="bubble"
      className={cn("bp-bubble", side === "user" && "bp-bubble--user", className)}
      {...props}
    >
      {typeof children === "string" ? <p>{children}</p> : children}
    </div>
  )
}

export { MessageRow, Bubble, AgentAvatar, UserAvatar }
export type { MessageRowProps }
