import * as React from "react"

import { cn } from "@/lib/utils"
import { IconButton } from "./icon-button"

/* ============================================================================
   Content Card: the base container for everything in the content area.

   It is a nesting of two surfaces:

     Card         the outer gray TRAY (recessed): 36px squircle, hairline
                  border, 4px padding. Never holds content directly.
       CardHeader   optional row on the tray gray; a title (or an agent
                    identity) on the left, actions / close on the right.
       CardSurface  one or MORE white WELLS (raised): 30px squircle, hairline
                    border, the faint xs shadow. This is where content lives.
       CardFooter   optional row on the tray gray; mirror of the header
                    (label / identity + pagination or buttons).

   Every child is separated by a uniform 4px gray gutter, so the tray reads as
   one 4px grid around and between all surfaces. The header / footer carry
   symmetric vertical padding, so with the 4px gutter + gap their content sits
   with even space above and below. Today's "simple card" is just the
   degenerate case: a Card with a single CardSurface and no header/footer.

   Rule of thumb: all content sits in a CardSurface; Cards group and label it.
   Only for the content area, not modals, notifications, or menus.
   ========================================================================== */

// The tray. bg-canvas keeps the "surface is raised above a slightly darker
// tray" relationship true in dark mode too (where subtle would invert lighter).
function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card"
      className={cn(
        "flex flex-col gap-1 rounded-[var(--radius-card)] border border-border bg-canvas p-1 text-foreground",
        className
      )}
      {...props}
    />
  )
}

// The white content well. Raised over the tray with a hairline + the xs shadow.
// overflow-hidden so full-bleed content (charts, media) clips to the squircle;
// pass `padded={false}` for that bleed and set your own insets.
function CardSurface({
  className,
  padded = true,
  ...props
}: React.ComponentProps<"div"> & { padded?: boolean }) {
  return (
    <div
      data-slot="card-surface"
      className={cn(
        "flex flex-col gap-3 overflow-hidden rounded-[var(--radius-surface)] border border-border bg-surface shadow-xs",
        padded && "p-6",
        className
      )}
      {...props}
    />
  )
}

// Shared identity cluster (avatar + name + role) for the header / footer.
// `stacked` = name over role (header); inline = name · role on one line (footer).
function Identity({
  avatar,
  name,
  role,
  stacked,
}: {
  avatar?: React.ReactNode
  name?: React.ReactNode
  role?: React.ReactNode
  stacked?: boolean
}) {
  if (!avatar && !name && !role) return null
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2">
      {avatar &&
        (typeof avatar === "string" ? (
          <img src={avatar} alt="" className="size-9 shrink-0 rounded-full [corner-shape:round] object-cover" />
        ) : (
          <span className="grid size-9 shrink-0 place-items-center">{avatar}</span>
        ))}
      <div
        className={cn(
          "flex min-w-0 flex-1 gap-x-1.5 text-sm leading-tight",
          stacked ? "flex-col" : "items-baseline"
        )}
      >
        {name && <span className="shrink-0 font-semibold whitespace-nowrap text-foreground">{name}</span>}
        {role && <span className="min-w-0 truncate font-normal text-muted-foreground">{role}</span>}
      </div>
    </div>
  )
}

type CardChromeProps = React.ComponentProps<"div"> & {
  /** plain-title mode: heading text on the left (ignored if name/avatar given) */
  title?: React.ReactNode
  /** identity mode: avatar + name + role on the left */
  avatar?: React.ReactNode
  name?: React.ReactNode
  role?: React.ReactNode
  /** right-hand cluster: buttons, pagination, a menu */
  action?: React.ReactNode
  /** show a close button on the far right */
  onClose?: () => void
}

// Top row on the tray gray. Title (16/600) OR an identity, then actions + close.
function CardHeader({
  title,
  avatar,
  name,
  role,
  action,
  onClose,
  className,
  children,
  ...props
}: CardChromeProps) {
  const identity = avatar || name || role
  return (
    <div
      data-slot="card-header"
      className={cn("flex items-center gap-3 px-4 py-2", className)}
      {...props}
    >
      {children ??
        (identity ? (
          <Identity avatar={avatar} name={name} role={role} stacked />
        ) : (
          <div className="min-w-0 flex-1 truncate text-md leading-6 font-semibold text-foreground">{title}</div>
        ))}
      {action && <div className="flex shrink-0 items-center gap-3">{action}</div>}
      {onClose && <IconButton icon="x" motion="rotate" size={32} onClick={onClose} aria-label="Close" className="-mr-1.5" />}
    </div>
  )
}

// Bottom row on the tray gray; mirror of the header. Label / identity + actions.
function CardFooter({
  title,
  avatar,
  name,
  role,
  action,
  onClose,
  className,
  children,
  ...props
}: CardChromeProps) {
  const identity = avatar || name || role
  return (
    <div
      data-slot="card-footer"
      className={cn("flex items-center gap-3 px-4 py-2", className)}
      {...props}
    >
      {children ??
        (identity ? (
          <Identity avatar={avatar} name={name} role={role} />
        ) : (
          <div className="min-w-0 flex-1 truncate text-base font-medium text-muted-foreground">{title}</div>
        ))}
      {action && <div className="ml-auto flex shrink-0 items-center gap-3">{action}</div>}
      {onClose && <IconButton icon="x" motion="rotate" size={32} onClick={onClose} aria-label="Close" className="-mr-1.5" />}
    </div>
  )
}

/* ---- in-surface text helpers (a section header for content in a Surface) ---- */

// Title for a block of content inside a Surface (16/600).
function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("text-md leading-6 font-semibold text-foreground", className)}
      {...props}
    />
  )
}

// Supporting line under a title (14/regular, muted).
function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-base leading-5 text-muted-foreground", className)}
      {...props}
    />
  )
}

// Body copy inside a Surface.
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("text-base leading-normal text-foreground", className)}
      {...props}
    />
  )
}

export { Card, CardSurface, CardHeader, CardFooter, CardTitle, CardDescription, CardContent }
export type { CardChromeProps }
