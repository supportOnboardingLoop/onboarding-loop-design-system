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
        // secondary: whisper white->#f7f7f7 gradient + gray border + tiny lift
        // (surface is permanently light, so the ink is a fixed dark, not the theme fg)
        secondary:
          "text-[#26262a] border-[#dcdcdc] shadow-[0_1px_2px_rgba(10,13,18,0.05)] bg-[linear-gradient(180deg,#ffffff,#f7f7f7)] hover:border-[#cfcfcf] hover:bg-[linear-gradient(180deg,#ffffff,#f1f1f1)] active:translate-y-[0.5px] active:bg-[linear-gradient(180deg,#f7f7f7,#ededed)]",
        // tertiary: flat gray outline, quiet hover fill
        tertiary:
          "text-[#6b7280] border-[rgba(17,24,39,0.16)] hover:border-[rgba(17,24,39,0.22)] hover:bg-[rgba(17,24,39,0.04)] active:translate-y-[0.5px] active:bg-[rgba(17,24,39,0.07)]",
        // ghost: no outline until hover
        ghost:
          "text-[#6b7280] hover:border-[rgba(17,24,39,0.16)] active:translate-y-[0.5px] active:border-[rgba(17,24,39,0.16)] active:bg-[rgba(17,24,39,0.05)]",
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
        icon: "h-[34px] w-[34px] px-0 [&_svg:not([class*='size-'])]:size-5",
        "icon-sm": "h-[32px] w-[32px] px-0 [&_svg:not([class*='size-'])]:size-[18px]",
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
  const iconSize = size === "sm" || size === "icon-sm" ? 18 : 20

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
