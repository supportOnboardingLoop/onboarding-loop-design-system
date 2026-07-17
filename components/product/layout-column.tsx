import * as React from "react"

import { cn } from "@/lib/utils"

// The column primitives that fill a <WorkspaceShell> slot (and dogfood in the
// styleguide's Layout showcase). Structural only — the SUBSTANCE inside a column
// (nav rows, agent identity, the docked launcher) is a real DS component or
// host content. All the layout metrics live in components/workspace.css (ws-*),
// so a change there moves every column the same way, everywhere. See
// [[loop-shared-components]]: change one, changes everywhere.

/* ---- LayoutColumn: one column card (a flex-column). `card` is the bordered
   surface (nav / agent-home / chat); `canvas` is the borderless grey content
   pane. `plain` is bare (no chrome) for a custom column. ---- */
type LayoutColumnProps = React.ComponentProps<"div"> & {
  variant?: "card" | "canvas" | "plain"
  as?: "div" | "aside" | "main" | "section"
}

const LayoutColumn = React.forwardRef<HTMLDivElement, LayoutColumnProps>(function LayoutColumn(
  { variant = "card", as: Tag = "div", className, ...props },
  ref
) {
  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      data-slot="layout-column"
      className={cn(
        "ws-col",
        variant === "card" && "ws-col--card",
        variant === "canvas" && "ws-col--canvas",
        className
      )}
      {...props}
    />
  )
})

/* ---- ColumnHeader: the fixed header bar at the top of a column (60px, a bottom
   hairline). Padding + gap are supplied by the caller (Tailwind wins over the
   unlayered ws- CSS), so the same bar serves the brand header, the content
   header, and the chat header. `hairline={false}` drops the divider. ---- */
type ColumnHeaderProps = React.ComponentProps<"header"> & { hairline?: boolean }

function ColumnHeader({ hairline = true, className, ...props }: ColumnHeaderProps) {
  return (
    <header
      data-slot="column-header"
      className={cn("ws-col__hdr", !hairline && "ws-col__hdr--flush", className)}
      {...props}
    />
  )
}

/* ---- ColumnTitle: the truncating header title (16px/700). ---- */
type ColumnTitleProps = React.ComponentProps<"h1"> & { as?: "h1" | "h2" | "h3" }

function ColumnTitle({ as: Tag = "h1", className, ...props }: ColumnTitleProps) {
  return <Tag data-slot="column-title" className={cn("ws-col__title", className)} {...props} />
}

/* ---- ColumnBody: the scrolling middle of a column. `scroll={false}` for a
   non-scrolling body (e.g. the content pane that docks the launcher). Padding is
   the caller's (px-4 pt-3 for nav lists). ---- */
type ColumnBodyProps = React.ComponentProps<"div"> & { scroll?: boolean }

const ColumnBody = React.forwardRef<HTMLDivElement, ColumnBodyProps>(function ColumnBody(
  { scroll = true, className, ...props },
  ref
) {
  return (
    <div
      ref={ref}
      data-slot="column-body"
      className={cn("ws-col__body", scroll && "scroll-thin", className)}
      {...props}
    />
  )
})

/* ---- ColumnFooter: the pinned bottom of a column. `divider` adds a top
   hairline (the agent-home / context footer). Padding + gap are the caller's. ---- */
type ColumnFooterProps = React.ComponentProps<"div"> & { divider?: boolean }

function ColumnFooter({ divider = false, className, ...props }: ColumnFooterProps) {
  return (
    <div
      data-slot="column-footer"
      className={cn("ws-col__foot", divider && "ws-col__foot--divider", className)}
      {...props}
    />
  )
}

/* ---- NavList: a vertical list of NavItems. The row gap is the shared
   --ws-row-gap token (Bal's "nav-row gap captured once"); change it in
   workspace.css and every list moves. ---- */
type NavListProps = React.ComponentProps<"div">

function NavList({ className, ...props }: NavListProps) {
  return <div data-slot="nav-list" className={cn("ws-navlist", className)} {...props} />
}

export { LayoutColumn, ColumnHeader, ColumnTitle, ColumnBody, ColumnFooter, NavList }
export type { LayoutColumnProps, ColumnHeaderProps, ColumnTitleProps, ColumnBodyProps, ColumnFooterProps, NavListProps }
