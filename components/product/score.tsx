import * as React from "react"

import { cn } from "@/lib/utils"

// Ported from the kit (kit/widgets.css .bp-score): a 1-N segmented score. The
// row reads like a secondary button (white gradient, gray border, control
// shadow); the selected cell reads like a primary (accent gradient + white).
type ScoreProps = Omit<React.ComponentProps<"div">, "onChange"> & {
  options: (string | number)[]
  value?: string | number | null
  onValueChange?: (value: string | number) => void
  ends?: [React.ReactNode, React.ReactNode]
}

function Score({ options, value, onValueChange, ends, className, ...props }: ScoreProps) {
  const [internal, setInternal] = React.useState<string | number | null>(value ?? null)
  const current = value !== undefined ? value : internal
  const pick = (v: string | number) => {
    if (value === undefined) setInternal(v)
    onValueChange?.(v)
  }
  return (
    <div data-slot="score" className={cn("flex w-full flex-col gap-1.5", className)} {...props}>
      <div className="flex overflow-hidden rounded-lg border border-[var(--ctl-line-hover)] shadow-control">
        {options.map((opt) => {
          const selected = String(current) === String(opt)
          return (
            <button
              key={String(opt)}
              type="button"
              data-selected={selected || undefined}
              onClick={() => pick(opt)}
              className={cn(
                "grid h-10 flex-1 cursor-pointer place-items-center border-r border-[var(--ctl-line)] text-base font-semibold transition-[background,color] duration-[120ms] last:border-r-0",
                selected
                  ? "text-primary-foreground bg-[linear-gradient(180deg,color-mix(in_srgb,var(--primary)_90%,white),color-mix(in_srgb,var(--primary)_90%,black))]"
                  : "text-[var(--ctl-ink)] bg-[linear-gradient(180deg,var(--ctl-face),var(--ctl-face-2))] hover:bg-[linear-gradient(180deg,var(--ctl-face),var(--ctl-face-hover))]"
              )}
            >
              {opt}
            </button>
          )
        })}
      </div>
      {ends && (
        <div className="flex justify-between text-xs leading-[18px] font-semibold text-foreground">
          <span>{ends[0]}</span>
          <span>{ends[1]}</span>
        </div>
      )}
    </div>
  )
}

export { Score }
export type { ScoreProps }
