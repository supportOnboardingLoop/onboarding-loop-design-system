import { mergeProps } from "@base-ui/react/merge-props"
import { useRender } from "@base-ui/react/use-render"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

// OL: badges are SEMANTIC STATUS, not brand variants.
// Leading dot inherits the text colour; pass an <svg> to replace it visually.
const badgeVariants = cva(
  "inline-flex h-5 w-fit shrink-0 items-center justify-center gap-1.5 overflow-hidden rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap transition-all before:size-1.5 before:shrink-0 before:rounded-full before:bg-current [&>svg]:pointer-events-none [&>svg]:size-2.5!",
  {
    variants: {
      variant: {
        neutral: "bg-secondary text-muted-foreground",
        success:
          "bg-[color-mix(in_oklab,var(--color-success)_15%,transparent)] text-[color-mix(in_oklab,var(--color-success),black_24%)]",
        warning:
          "bg-[color-mix(in_oklab,var(--color-warning)_16%,transparent)] text-[color-mix(in_oklab,var(--color-warning),black_26%)]",
        error:
          "bg-[color-mix(in_oklab,var(--color-destructive)_13%,transparent)] text-destructive",
      },
    },
    defaultVariants: {
      variant: "neutral",
    },
  }
)

function Badge({
  className,
  variant = "neutral",
  render,
  ...props
}: useRender.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return useRender({
    defaultTagName: "span",
    props: mergeProps<"span">(
      {
        className: cn(badgeVariants({ variant }), className),
      },
      props
    ),
    render,
    state: {
      slot: "badge",
      variant,
    },
  })
}

export { Badge, badgeVariants }
