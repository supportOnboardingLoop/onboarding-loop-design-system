import * as React from "react"

import { cn } from "@/lib/utils"
import { Icon, type IconName } from "../base/icon"
import { Checkmark } from "../base/checkmark"

// The "models" treatment: how the agent shows and picks which model it is running.
// Two forms, both neutral (the picker is chrome, not an accent moment):
//   <ModelChip>   — a compact inline badge that annotates a reply with the model
//                   that produced it (drops onto the "Thought for Ns" divider or
//                   sits under a bubble).
//   <ModelPicker> — a small trigger + dropdown to switch models. Each row carries
//                   a name, a one-line tagline, and a reveal-check on the current
//                   one (the same select-affordance the Choices widget uses).

export type Model = { id: string; name: string; tagline?: string; glyph?: IconName }

export const DEFAULT_MODELS: Model[] = [
  { id: "haiku", name: "Haiku 4.5", tagline: "Fast, everyday answers", glyph: "activity" },
  { id: "sonnet", name: "Sonnet 5", tagline: "Balanced speed and depth", glyph: "sparkles" },
  { id: "opus", name: "Opus 4.8", tagline: "Deepest reasoning", glyph: "brain" },
]

// ---------- the inline annotation chip ----------
function ModelChip({
  model,
  glyph = "sparkles",
  className,
  ...props
}: React.ComponentProps<"span"> & { model: React.ReactNode; glyph?: IconName }) {
  return (
    <span
      data-slot="model-chip"
      className={cn(
        "inline-flex h-[22px] shrink-0 items-center gap-1 rounded-md border border-border-strong bg-card px-1.5 text-xs font-semibold text-muted-foreground [corner-shape:squircle]",
        className
      )}
      {...props}
    >
      <Icon name={glyph} size={12} stroke={1.5} className="opacity-70" />
      {model}
    </span>
  )
}

// ---------- the picker dropdown ----------
type ModelPickerProps = {
  models?: Model[]
  value?: string
  defaultValue?: string
  onValueChange?: (id: string) => void
  className?: string
}

function ModelPicker({ models = DEFAULT_MODELS, value, defaultValue, onValueChange, className }: ModelPickerProps) {
  const [internal, setInternal] = React.useState(defaultValue ?? models[0]?.id)
  const current = value !== undefined ? value : internal
  const [open, setOpen] = React.useState(false)
  const rootRef = React.useRef<HTMLDivElement>(null)

  const selected = models.find((m) => m.id === current) ?? models[0]
  const pick = (id: string) => {
    if (value === undefined) setInternal(id)
    onValueChange?.(id)
    setOpen(false)
  }

  React.useEffect(() => {
    if (!open) return
    const onDown = (e: PointerEvent) => {
      if (rootRef.current && !rootRef.current.contains(e.target as Node)) setOpen(false)
    }
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false)
    document.addEventListener("pointerdown", onDown)
    document.addEventListener("keydown", onKey)
    return () => {
      document.removeEventListener("pointerdown", onDown)
      document.removeEventListener("keydown", onKey)
    }
  }, [open])

  return (
    <div ref={rootRef} data-slot="model-picker" className={cn("relative inline-block", className)}>
      <button
        type="button"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "group/mp inline-flex h-8 items-center gap-1.5 rounded-lg border bg-card px-2.5 text-sm font-semibold text-foreground transition-[border-color,background] [corner-shape:squircle]",
          open ? "border-border-strong bg-fill" : "border-border-strong hover:bg-fill"
        )}
      >
        <Icon name={selected?.glyph ?? "sparkles"} size={15} stroke={1.5} className="text-muted-foreground" />
        {selected?.name}
        <Icon
          name="chevron-down"
          size={14}
          stroke={1.5}
          className={cn("text-muted-foreground transition-transform duration-200", open && "rotate-180")}
        />
      </button>

      {open && (
        <div
          role="listbox"
          className="absolute left-0 z-50 mt-1.5 w-64 overflow-hidden rounded-lg border border-border-strong bg-popover p-1.5 shadow-pop [corner-shape:squircle]"
        >
          {models.map((m) => {
            const on = m.id === current
            return (
              <button
                key={m.id}
                type="button"
                role="option"
                aria-selected={on}
                onClick={() => pick(m.id)}
                className={cn(
                  "flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left transition-colors [corner-shape:squircle]",
                  on ? "bg-accent-tint" : "hover:bg-fill"
                )}
              >
                <Icon name={m.glyph ?? "sparkles"} size={17} stroke={1.5} className="mt-px shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1">
                  <span className="block text-base font-semibold text-foreground">{m.name}</span>
                  {m.tagline && <span className="block text-xs leading-[16px] text-muted-foreground">{m.tagline}</span>}
                </span>
                <span className="mt-0.5 flex w-[18px] shrink-0 justify-center">
                  {on && <Checkmark filled size={18} />}
                </span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

export { ModelPicker, ModelChip }
export type { ModelPickerProps }
