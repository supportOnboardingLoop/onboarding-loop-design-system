import * as React from "react"

import { cn } from "@/lib/utils"
import { Icon, type IconName } from "./icon"

// A small icon-only button — the close / expand-collapse family. Reads like a
// quiet tertiary button (transparent, an outline on hover, a soft fill on press)
// but square and compact, with a 16px squircle. The icon is held at 64% and
// animates on hover, chosen by `motion`:
//   • "rotate"      — a quarter-turn (the X close)
//   • "arrow-left"  — the double chevron bounces left  (collapse)
//   • "arrow-right" — the double chevron bounces right (expand)
// The animation lives in kit.css so every consumer inherits it.
type IconButtonProps = React.ComponentProps<"button"> & {
  icon: IconName
  /** button box size in px (default 28) */
  size?: number
  /** icon size in px (default 16) */
  iconSize?: number
  motion?: "rotate" | "arrow-left" | "arrow-right"
}

function IconButton({ icon, size = 28, iconSize = 16, motion = "rotate", className, style, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      data-slot="icon-button"
      data-motion={motion}
      style={{ width: size, height: size, ...style }}
      className={cn(
        "bp-icon-btn grid shrink-0 cursor-pointer place-items-center rounded-lg [corner-shape:squircle] border border-transparent text-foreground outline-none transition-colors",
        "hover:border-[color-mix(in_oklab,var(--foreground)_12%,transparent)]",
        "active:border-[color-mix(in_oklab,var(--foreground)_18%,transparent)] active:bg-[color-mix(in_oklab,var(--foreground)_8%,transparent)]",
        "focus-visible:shadow-[0_0_0_3px_var(--accent-tint)]",
        className
      )}
      {...props}
    >
      <Icon name={icon} size={iconSize} stroke={1.5} className="bp-icon-btn__ic" />
    </button>
  )
}

export { IconButton }
export type { IconButtonProps }
