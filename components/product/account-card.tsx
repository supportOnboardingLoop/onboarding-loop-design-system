import * as React from "react"

import { cn } from "@/lib/utils"

// Ported from the starter layout (.acct): the account row at the foot of the
// primary nav — a 38px avatar disc with an online status dot, plus name + email.
// Collapses to just the disc on the icon rail.
function AccountCard({
  name,
  email,
  initials,
  avatarSrc,
  online = true,
  collapsed = false,
  className,
  ...props
}: React.ComponentProps<"div"> & {
  name: React.ReactNode
  email?: React.ReactNode
  initials?: string
  avatarSrc?: string
  online?: boolean
  collapsed?: boolean
}) {
  return (
    <div
      data-slot="account-card"
      className={cn(
        "flex cursor-pointer items-center gap-2 rounded-lg transition-colors hover:bg-fill",
        collapsed ? "mx-auto w-10 justify-center p-0" : "mt-1.5 p-2.5",
        className
      )}
      {...props}
    >
      <span className="relative grid size-[38px] shrink-0 place-items-center rounded-full [corner-shape:round] border border-border-strong bg-subtle text-xs font-semibold text-muted-foreground dark:bg-white/8">
        {avatarSrc ? (
          <img src={avatarSrc} alt="" className="size-full rounded-full [corner-shape:round] object-cover" />
        ) : (
          initials
        )}
        {online && (
          <span className="absolute -top-px -right-px size-2.5 rounded-full border-[1.5px] border-card [corner-shape:round] bg-success" />
        )}
      </span>
      {!collapsed && (
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-sm font-semibold">{name}</span>
          {email && <span className="truncate text-[13px] text-muted-foreground">{email}</span>}
        </span>
      )}
    </div>
  )
}

export { AccountCard }
