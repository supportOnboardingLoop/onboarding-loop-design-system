import * as React from "react"

import { cn } from "@/lib/utils"

// Ported from the kit (kit/chat.css .bp-chat__elapsed / .bp-elapsed). The quiet
// "Thought for 3s" divider between a user turn and the agent's considered reply:
// a centred label with a hairline running out each side. It doubles as the
// carrier for the models treatment (e.g. "Thought for 3s · Opus 4.8").
//
//   animated={false}  static — base hairlines via ::before/::after (always shown)
//   animated={true}   the sequenced build: the hairline draws out from centre,
//                      then the label pops in (used by the live engine)

type ConversationDividerProps = React.ComponentProps<"div"> & {
  animated?: boolean
}

function ConversationDivider({ animated = false, className, children, ...props }: ConversationDividerProps) {
  const [build, setBuild] = React.useState(false)
  React.useEffect(() => {
    if (!animated) return
    const id = requestAnimationFrame(() => setBuild(true))
    return () => cancelAnimationFrame(id)
  }, [animated])

  if (!animated) {
    return (
      <div data-slot="conversation-divider" className={cn("bp-chat__elapsed", className)} {...props}>
        {children}
      </div>
    )
  }
  return (
    <div
      data-slot="conversation-divider"
      className={cn("bp-chat__elapsed bp-elapsed", build && "is-build", className)}
      {...props}
    >
      <span className="bp-elapsed__line" />
      <span className="bp-elapsed__txt">{children}</span>
      <span className="bp-elapsed__line" />
    </div>
  )
}

export { ConversationDivider }
export type { ConversationDividerProps }
