"use client"

import * as React from "react"
import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip"

import { cn } from "@/lib/utils"

// Ported from the kit (kit/tooltip.css .bp-tooltip): the agent popover that
// points AT something and gives a one-line hint. Brand-coloured surface (same
// fill as the accent header) so it reads as the assistant talking; the agent
// lockup matches the header (32px avatar + name/role inline). Base UI Tooltip
// drives anchored placement; the notch shares the popover fill.
export const TooltipProvider = TooltipPrimitive.Provider

type AgentTooltipProps = {
  children: React.ReactNode
  content: React.ReactNode
  avatar?: React.ReactNode
  name?: React.ReactNode
  role?: React.ReactNode
  side?: "top" | "bottom" | "left" | "right"
  open?: boolean
  defaultOpen?: boolean
  onOpenChange?: (open: boolean) => void
}

function AgentTooltip({
  children,
  content,
  avatar,
  name,
  role,
  side = "top",
  open,
  defaultOpen,
  onOpenChange,
}: AgentTooltipProps) {
  return (
    <TooltipPrimitive.Root open={open} defaultOpen={defaultOpen} onOpenChange={onOpenChange} delay={80} hoverable>
      <TooltipPrimitive.Trigger render={<span className="inline-flex cursor-pointer" />}>{children}</TooltipPrimitive.Trigger>
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Positioner side={side} sideOffset={12} align="center" className="isolate z-50">
          <TooltipPrimitive.Popup
            data-slot="agent-tooltip"
            className={cn(
              "max-w-[270px] rounded-xl bg-primary px-4 py-3.5 text-primary-foreground shadow-card outline-none",
              "origin-[var(--transform-origin)] transition-[transform,opacity] duration-200 data-[starting-style]:scale-95 data-[starting-style]:opacity-0 data-[ending-style]:scale-95 data-[ending-style]:opacity-0"
            )}
          >
            {(avatar || name) && (
              <div className="mb-2 flex items-center gap-2">
                {avatar && <span className="size-8 shrink-0 overflow-hidden rounded-full [corner-shape:round]">{avatar}</span>}
                <div className="flex min-w-0 items-baseline gap-1.5 text-xs leading-[18px]">
                  {name && <span className="shrink-0 font-semibold whitespace-nowrap">{name}</span>}
                  {role && <span className="min-w-0 truncate font-normal opacity-[0.64]">{role}</span>}
                </div>
              </div>
            )}
            <div className="text-base leading-[1.45]">{content}</div>
            <TooltipPrimitive.Arrow className="z-[-1] data-[side=bottom]:top-[-6px] data-[side=top]:bottom-[-6px] data-[side=left]:right-[-6px] data-[side=right]:left-[-6px]">
              <span className="block size-3 rotate-45 rounded-[2px] bg-primary" />
            </TooltipPrimitive.Arrow>
          </TooltipPrimitive.Popup>
        </TooltipPrimitive.Positioner>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  )
}

export { AgentTooltip }
export type { AgentTooltipProps }
