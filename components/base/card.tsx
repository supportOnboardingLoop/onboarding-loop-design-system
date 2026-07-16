import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// Ported to the kit surface (kit/card.css .bp-card): 24px squircle, crisp
// border, uniform 18px pad, 12px gap, the 3-layer soft card shadow. Title
// 15/700/-.01em; body 14/1.5/muted. `flat` drops the shadow; `interactive`
// makes the whole card a target that lifts on hover.
const cardVariants = cva(
  "group/card flex flex-col gap-3 rounded-xl border border-border-strong bg-card p-[18px] text-card-foreground",
  {
    variants: {
      variant: {
        default: "shadow-card",
        flat: "shadow-none",
        interactive:
          "cursor-pointer text-left shadow-card transition-[border-color,box-shadow,transform] duration-[180ms] outline-none hover:-translate-y-px hover:border-primary hover:shadow-pop focus-visible:border-primary focus-visible:shadow-[0_0_0_3px_var(--accent-tint)] active:translate-y-0 active:shadow-card",
      },
    },
    defaultVariants: { variant: "default" },
  }
)

function Card({
  className,
  variant = "default",
  ...props
}: React.ComponentProps<"div"> & VariantProps<typeof cardVariants>) {
  return <div data-slot="card" className={cn(cardVariants({ variant }), className)} {...props} />
}

// Header groups the title + description with an optional top-right action.
function CardHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-header"
      className={cn(
        "grid auto-rows-min items-start gap-1 has-data-[slot=card-action]:grid-cols-[1fr_auto]",
        className
      )}
      {...props}
    />
  )
}

function CardTitle({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-title"
      className={cn("text-[15px] leading-5 font-bold tracking-[-0.01em] text-card-foreground", className)}
      {...props}
    />
  )
}

function CardDescription({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-description"
      className={cn("text-base leading-normal text-muted-foreground", className)}
      {...props}
    />
  )
}

function CardAction({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-action"
      className={cn("col-start-2 row-span-2 row-start-1 self-start justify-self-end", className)}
      {...props}
    />
  )
}

// Body copy (kit .bp-card__body).
function CardContent({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-content"
      className={cn("text-base leading-normal text-muted-foreground", className)}
      {...props}
    />
  )
}

// Actions row (kit .bp-card__actions): buttons share the row, wrap if needed.
function CardFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="card-footer"
      className={cn("mt-0.5 flex flex-wrap items-center gap-2 [.border-t]:mt-1 [.border-t]:pt-3", className)}
      {...props}
    />
  )
}

export { Card, CardHeader, CardFooter, CardTitle, CardAction, CardDescription, CardContent, cardVariants }
