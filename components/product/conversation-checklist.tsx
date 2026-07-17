import * as React from "react"

import { cn } from "@/lib/utils"
import { Checkbox } from "../base/checkbox"

// A lightweight checklist the agent posts INSIDE the conversation (modelled on
// the starter-layout .bp-check-row): a small titled card of checkable rows that
// tick off in place, with a running count. Distinct from the onboarding
// <ChecklistItem> (the big accent rings) — this is a compact to-do the agent
// surfaces mid-thread, so it sits as a conversation child under a bot bubble.

export type ChecklistRow = { id?: string; label: React.ReactNode; done?: boolean }

type ConversationChecklistProps = Omit<React.ComponentProps<"div">, "onChange"> & {
  items: ChecklistRow[]
  title?: React.ReactNode
  onChange?: (doneIds: string[]) => void
}

function ConversationChecklist({ items, title, onChange, className, ...props }: ConversationChecklistProps) {
  const keyed = React.useMemo(() => items.map((it, i) => ({ ...it, key: it.id ?? String(i) })), [items])
  const [done, setDone] = React.useState<Set<string>>(
    () => new Set(keyed.filter((it) => it.done).map((it) => it.key))
  )
  const toggle = (key: string) => {
    setDone((prev) => {
      const next = new Set(prev)
      next.has(key) ? next.delete(key) : next.add(key)
      onChange?.([...next])
      return next
    })
  }
  const total = keyed.length
  const count = keyed.filter((it) => done.has(it.key)).length

  return (
    <div
      data-slot="conversation-checklist"
      className={cn(
        "w-full overflow-hidden rounded-lg border border-border-strong bg-card [corner-shape:squircle]",
        className
      )}
      {...props}
    >
      {(title || total > 0) && (
        <div className="flex items-center gap-2 border-b border-border px-3 py-2">
          {title && <span className="min-w-0 flex-1 truncate text-sm font-semibold text-foreground">{title}</span>}
          <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
            {count}/{total}
          </span>
        </div>
      )}
      <div className="flex flex-col gap-0.5 p-1.5">
        {keyed.map((it) => {
          const checked = done.has(it.key)
          return (
            <button
              key={it.key}
              type="button"
              onClick={() => toggle(it.key)}
              className="group/row flex w-full items-center gap-2.5 rounded-lg px-2.5 py-2 text-left transition-colors [corner-shape:squircle] hover:bg-fill"
            >
              <Checkbox
                checked={checked}
                onCheckedChange={() => toggle(it.key)}
                onClick={(e) => e.stopPropagation()}
                className="group-hover/row:border-muted-foreground data-[checked]:group-hover/row:border-primary"
              />
              <span
                className={cn(
                  "min-w-0 flex-1 truncate text-base font-medium transition-colors",
                  checked ? "text-done line-through" : "text-foreground"
                )}
              >
                {it.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

export { ConversationChecklist }
export type { ConversationChecklistProps }
