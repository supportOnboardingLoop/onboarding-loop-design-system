import * as React from "react"

import { cn } from "@/lib/utils"
import { Icon } from "../base/icon"

// Ported from the kit (kit/header.css .bp-header): the top section every agent
// card state shares — a persistent avatar + name/role, an optional close, a
// heading, a subhead, and an optional progress bar + count chip.
//   variant="accent"  fill = brand accent (checklist, resource center)
//   variant="plain"   fill = white surface + a hairline (the explainer tooltip)

type PanelHeaderProps = React.ComponentProps<"div"> & {
  variant?: "accent" | "plain"
  avatar?: React.ReactNode
  name?: React.ReactNode
  role?: React.ReactNode
  heading?: React.ReactNode
  onClose?: () => void
  /** progress bar + count chip, e.g. { value: 40, count: "2/5" } */
  progress?: { value: number; count: React.ReactNode }
}

function PanelHeader({
  variant = "accent",
  avatar,
  name,
  role,
  heading,
  onClose,
  progress,
  className,
  children,
  ...props
}: PanelHeaderProps) {
  const accent = variant === "accent"
  return (
    <div
      data-slot="panel-header"
      className={cn(
        "flex flex-col gap-3",
        accent
          ? "bg-primary p-4 text-primary-foreground"
          : "border-b border-[rgba(17,24,39,0.06)] bg-card px-5 pt-4 pb-3 text-foreground",
        className
      )}
      {...props}
    >
      {(avatar || name || onClose) && (
        <div className="flex items-center gap-2">
          {avatar &&
            (typeof avatar === "string" ? (
              <img src={avatar} alt="" className="size-8 shrink-0 rounded-full [corner-shape:round] object-cover" />
            ) : (
              <span className="size-8 shrink-0 overflow-hidden rounded-full [corner-shape:round]">{avatar}</span>
            ))}
          {(name || role) && (
            <div className="flex min-w-0 flex-[0_1_auto] items-baseline gap-1.5 text-xs leading-[18px]">
              {name && <span className="shrink-0 font-semibold whitespace-nowrap">{name}</span>}
              {role && (
                <span
                  className={cn(
                    "min-w-0 flex-[0_1_auto] truncate font-normal",
                    accent ? "opacity-[0.64]" : "text-muted-foreground"
                  )}
                >
                  {role}
                </span>
              )}
            </div>
          )}
          {onClose && (
            <button
              type="button"
              aria-label="Close"
              onClick={onClose}
              className={cn(
                "group/close ml-auto grid size-7 shrink-0 place-items-center rounded-lg border border-transparent bg-transparent transition-[border-color,background]",
                accent
                  ? "hover:border-white/12 active:border-white/24 active:bg-white/16"
                  : "hover:border-[rgba(17,24,39,0.12)] active:border-[rgba(17,24,39,0.16)] active:bg-[rgba(17,24,39,0.08)]"
              )}
            >
              <Icon
                name="x"
                size={14}
                className="opacity-[0.64] transition-[opacity,transform] duration-200 group-hover/close:rotate-90 group-hover/close:opacity-100 motion-reduce:group-hover/close:rotate-0"
              />
            </button>
          )}
        </div>
      )}

      {heading && <div className="text-md leading-6 font-semibold">{heading}</div>}
      {children}

      {progress && (
        <div className="flex h-6 items-center gap-3.5">
          <div className={cn("h-3 flex-1 overflow-hidden rounded-full", accent ? "bg-black/16" : "bg-border")}>
            <div
              className={cn("h-full rounded-full transition-[width] duration-[400ms]", accent ? "bg-white" : "bg-primary")}
              style={{ width: `${Math.max(0, Math.min(100, progress.value))}%` }}
            />
          </div>
          <span className="inline-flex h-[22px] shrink-0 items-center rounded-full bg-card px-2 text-xs font-semibold text-primary">
            {progress.count}
          </span>
        </div>
      )}
    </div>
  )
}

// Media / video header (kit .bp-media): a thumbnail that sits ABOVE a plain
// header. A brand-colour wash re-hues it to the accent; a blurred dark play disc
// with a white glyph scales up on hover.
function MediaHeader({
  src,
  alt = "",
  onPlay,
  className,
  children,
  ...props
}: React.ComponentProps<"div"> & { src?: string; alt?: string; onPlay?: () => void }) {
  return (
    <div
      data-slot="media-header"
      className={cn("relative overflow-hidden bg-primary [corner-shape:squircle]", className)}
      {...props}
    >
      {src ? <img src={src} alt={alt} className="block h-auto w-full" /> : children}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 z-[1] bg-primary [mix-blend-mode:color]"
      />
      <button
        type="button"
        aria-label="Play"
        onClick={onPlay}
        className="absolute top-1/2 left-1/2 z-[2] grid size-14 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full [corner-shape:round] bg-black/32 text-white backdrop-blur-md transition-transform duration-150 hover:scale-[1.08]"
      >
        <Icon name="play" size={24} className="fill-white" />
      </button>
    </div>
  )
}

export { PanelHeader, MediaHeader }
export type { PanelHeaderProps }
