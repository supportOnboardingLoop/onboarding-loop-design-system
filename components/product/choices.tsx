import * as React from "react"

import { cn } from "@/lib/utils"
import { maskStyle } from "../base/checkmark"

// Ported from the kit (kit/widgets.css .bp-choices / .bp-choice): lettered A/B/C
// options, single-select. A choice carries a small squircle key badge, a label,
// and a reveal check flush-right that RESTS as an outline ring (revealed on
// hover) and fills to an accent disc once the row is chosen.
const LETTERS = "ABCDEFGHIJ"

export type Choice = { value: string; label: React.ReactNode; key?: string }

type ChoicesProps = Omit<React.ComponentProps<"div">, "onChange"> & {
  options: Choice[]
  value?: string | null
  defaultValue?: string | null
  onValueChange?: (value: string) => void
}

function Choices({ options, value, defaultValue = null, onValueChange, className, ...props }: ChoicesProps) {
  const [internal, setInternal] = React.useState<string | null>(defaultValue)
  const current = value !== undefined ? value : internal
  const pick = (v: string) => {
    if (value === undefined) setInternal(v)
    onValueChange?.(v)
  }
  return (
    <div data-slot="choices" className={cn("flex w-full flex-col gap-2", className)} {...props}>
      {options.map((opt, i) => {
        const selected = current === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            data-selected={selected || undefined}
            onClick={() => pick(opt.value)}
            className={cn(
              "group/choice flex w-full items-center gap-2 rounded-lg border px-3 py-2.5 text-left transition-[border-color,background]",
              selected
                ? "border-primary bg-accent-tint"
                : "border-border-strong bg-card hover:bg-[color-mix(in_oklab,var(--foreground)_4%,transparent)]"
            )}
          >
            <span
              className={cn(
                "box-border grid h-[22px] min-w-[22px] shrink-0 place-items-center rounded-sm border px-[5px] text-xs leading-none font-semibold transition-[border-color,color,background]",
                selected
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border-strong text-muted-foreground"
              )}
            >
              {opt.key ?? LETTERS[i]}
            </span>
            <span className="min-w-0 flex-1 text-base leading-5 font-semibold text-foreground">{opt.label}</span>
            <span className="flex w-0 shrink-0 items-center justify-center overflow-hidden opacity-0 transition-[width,opacity,margin] duration-200 [transition-timing-function:var(--ease-emphasized)] group-hover/choice:ml-2 group-hover/choice:w-5 group-hover/choice:opacity-100 group-data-[selected]/choice:ml-2 group-data-[selected]/choice:w-5 group-data-[selected]/choice:opacity-100">
              <span
                aria-hidden="true"
                className="relative block size-5 shrink-0 rounded-full [corner-shape:round] bg-transparent shadow-[inset_0_0_0_1.5px_var(--border-strong)] transition-[background,box-shadow] group-data-[selected]/choice:bg-primary group-data-[selected]/choice:shadow-none"
              >
                <span className="absolute inset-0 bg-muted-foreground transition-colors group-data-[selected]/choice:bg-[var(--primary-foreground)]" style={maskStyle(12)} />
              </span>
            </span>
          </button>
        )
      })}
    </div>
  )
}

export { Choices }
export type { ChoicesProps }
