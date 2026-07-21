import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"
import { Icon, type IconName } from "./icon"

// Ported to match the Blueprint kit's .bp-btn (kit/button.css):
// 34px / 14px-500 / 16px squircle, gradient + shadow tiers, 3px accent focus.
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-2 rounded-lg border border-transparent leading-none font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:shadow-[0_0_0_3px_color-mix(in_srgb,var(--primary)_32%,transparent)] disabled:pointer-events-none disabled:opacity-45 aria-invalid:border-destructive aria-invalid:shadow-[0_0_0_3px_color-mix(in_srgb,var(--destructive)_25%,transparent)] [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // primary: accent gradient (lighter top, darker bottom) + border + control shadow
        primary:
          "border-primary text-primary-foreground shadow-control bg-[linear-gradient(180deg,color-mix(in_srgb,var(--primary)_90%,white),color-mix(in_srgb,var(--primary)_90%,black))] hover:bg-[linear-gradient(180deg,var(--primary),color-mix(in_srgb,var(--primary)_82%,black))] active:translate-y-[0.5px] active:shadow-[0_1px_2px_rgba(10,13,18,0.12)] active:bg-[linear-gradient(180deg,color-mix(in_srgb,var(--primary)_84%,black),color-mix(in_srgb,var(--primary)_72%,black))]",
        // secondary: whisper control-face gradient + edge + tiny lift. The face
        // is a TOKEN, not a literal: it inverts with the color scheme, so in dark
        // mode this reads as a raised dark control rather than a white slab that
        // out-shouts the primary button.
        secondary:
          "text-[var(--ctl-ink)] border-[var(--ctl-line)] shadow-[0_1px_2px_rgba(10,13,18,0.05)] bg-[linear-gradient(180deg,var(--ctl-face),var(--ctl-face-2))] hover:border-[var(--ctl-line-hover)] hover:bg-[linear-gradient(180deg,var(--ctl-face),var(--ctl-face-hover))] active:translate-y-[0.5px] active:bg-[linear-gradient(180deg,var(--ctl-face-2),var(--ctl-face-press))]",
        // tertiary: flat gray outline, quiet hover fill
        tertiary:
          "text-[var(--ctl-ink-quiet)] border-[var(--ctl-outline)] hover:border-[var(--ctl-outline-hover)] hover:bg-[var(--ctl-wash)] active:translate-y-[0.5px] active:bg-[var(--ctl-wash-strong)]",
        // ghost: no outline until hover
        ghost:
          "text-[var(--ctl-ink-quiet)] hover:border-[var(--ctl-outline)] active:translate-y-[0.5px] active:border-[var(--ctl-outline)] active:bg-[var(--ctl-wash)]",
        // destructive: functional red, tinted fill
        destructive:
          "text-destructive bg-[color-mix(in_oklab,var(--destructive)_12%,transparent)] hover:bg-[color-mix(in_oklab,var(--destructive)_18%,transparent)] active:translate-y-[0.5px]",
        // nav: quiet, full-width left-aligned sidebar/menu row (soft fill hover, accent-tint active)
        nav: "w-full min-h-8 justify-start gap-2 rounded-sm px-2.5 py-[7px] text-sm font-medium text-foreground hover:bg-[color-mix(in_oklab,currentColor_8%,transparent)] active:bg-[color-mix(in_oklab,currentColor_12%,transparent)] data-[current=true]:bg-accent-tint data-[current=true]:font-semibold data-[current=true]:text-foreground",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-[34px] px-4 text-base [&_svg:not([class*='size-'])]:size-5",
        sm: "h-[32px] px-3 text-sm [&_svg:not([class*='size-'])]:size-[18px]",
        // lg: 48px tall so the 24px control radius (--radius-lg) shows in FULL —
        // 34px controls clamp it to ~17px, this one is the only place it reads at
        // its true value. Roomier padding + 16px text keep it proportional.
        lg: "h-12 px-5 text-md [&_svg:not([class*='size-'])]:size-[22px]",
        icon: "h-[34px] w-[34px] px-0 [&_svg:not([class*='size-'])]:size-5",
        "icon-sm": "h-[32px] w-[32px] px-0 [&_svg:not([class*='size-'])]:size-[18px]",
        "icon-lg": "h-12 w-12 px-0 [&_svg:not([class*='size-'])]:size-[22px]",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
)

type ButtonProps = ButtonPrimitive.Props &
  VariantProps<typeof buttonVariants> & {
    /** Trailing (or leading) icon that stays collapsed until hover, then slides
     *  in + draws itself. Bal's "primary hover icon". */
    revealIcon?: IconName
    revealIconSide?: "leading" | "trailing"
    /** Turn an icon-only button into one that grows this label on hover (Send). */
    revealLabel?: string
  }

function Button({
  className,
  variant = "primary",
  size = "default",
  revealIcon,
  revealIconSide = "trailing",
  revealLabel,
  children,
  ...props
}: ButtonProps) {
  const iconSize = size === "sm" || size === "icon-sm" ? 18 : size === "lg" || size === "icon-lg" ? 22 : 20

  // reveal-label: icon-only button (children = the icon) that grows a label
  if (revealLabel) {
    return (
      <ButtonPrimitive
        data-slot="button"
      data-variant={variant}
        className={cn(buttonVariants({ variant, size, className }), "bp-reveal-label")}
        {...props}
      >
        <span className="bp-reveal-label__txt">{revealLabel}</span>
        {children}
      </ButtonPrimitive>
    )
  }

  // reveal-icon: label + a trailing/leading icon that draws in on hover
  if (revealIcon) {
    const slot = (
      <span
        className={cn(
          "bp-reveal-slot",
          revealIconSide === "leading" ? "bp-reveal-slot--lead" : "bp-reveal-slot--trail",
          (size === "sm" || size === "icon-sm") && "bp-reveal-slot--sm"
        )}
      >
        <Icon name={revealIcon} size={iconSize} className="bp-reveal-ico" />
      </span>
    )
    return (
      <ButtonPrimitive
        data-slot="button"
      data-variant={variant}
        className={cn(buttonVariants({ variant, size, className }), "gap-0")}
        {...props}
      >
        {revealIconSide === "leading" && slot}
        {children}
        {revealIconSide === "trailing" && slot}
      </ButtonPrimitive>
    )
  }

  return (
    <ButtonPrimitive
      data-slot="button"
      data-variant={variant}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    >
      {children}
    </ButtonPrimitive>
  )
}

export { Button, buttonVariants }
export type { ButtonProps }
