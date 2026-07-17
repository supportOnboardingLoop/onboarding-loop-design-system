import * as React from "react"

import { cn } from "@/lib/utils"
import { Icon } from "../base/icon"

// Ported from the kit (kit/chat.css .bp-thinking). The pause between a user turn
// and the agent's reply, so a wait reads as working, not broken. Two forms:
//   variant="bulb"  — the lightbulb glyph, gently breathing (the product default;
//                     a Lottie doodle can later drop into the same slot)
//   variant="dots"  — three pulsing dots, the guaranteed fallback contract
// The live conversation engine mounts this as a bubble variant that then morphs
// into the reply on one persistent node.

type ThinkingProps = React.ComponentProps<"div"> & {
  variant?: "bulb" | "dots"
  label?: React.ReactNode
}

function Thinking({ variant = "bulb", label = "Thinking…", className, ...props }: ThinkingProps) {
  return (
    <div data-slot="thinking" className={cn("bp-thinking", className)} {...props}>
      {variant === "dots" ? (
        <span className="bp-dots" aria-hidden="true">
          <i /><i /><i />
        </span>
      ) : (
        <span className="bp-thinking__bulb bp-thinking__bulb--pulse" aria-hidden="true">
          <Icon name="bulb" size={26} stroke={1.6} />
        </span>
      )}
      {label && <span className="bp-thinklbl">{label}</span>}
    </div>
  )
}

export { Thinking }
export type { ThinkingProps }
