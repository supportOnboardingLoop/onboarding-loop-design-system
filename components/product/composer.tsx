import * as React from "react"

import { cn } from "@/lib/utils"
import { Icon } from "../base/icon"
import { Input } from "../base/input"
import { Button } from "../base/button"

// Ported from the kit (kit/chat.css). Three chat-input parts:
//   Chatbar   — the compact input, mic + send nested in one box
//   Composer  — the field + a reveal-label Send button outside it
//   SuggestionChips / SuggestionChip — quick-reply chips

function Chatbar({
  placeholder = "Ask me anything…",
  className,
  ...props
}: React.ComponentProps<"div"> & { placeholder?: string }) {
  return (
    <div
      data-slot="chatbar"
      className={cn(
        "flex items-center gap-2 rounded-md border border-border-strong bg-card py-2 pr-2 pl-3.5 transition-colors focus-within:border-primary",
        className
      )}
      {...props}
    >
      <input
        placeholder={placeholder}
        className="min-w-0 flex-1 border-none bg-transparent text-base text-foreground outline-none placeholder:text-muted-foreground"
      />
      <button
        type="button"
        aria-label="Voice"
        className="grid size-9 shrink-0 place-items-center rounded-sm text-muted-foreground transition-colors hover:bg-[color-mix(in_oklab,var(--foreground)_5%,transparent)]"
      >
        <Icon name="microphone" size={18} />
      </button>
      <button
        type="button"
        aria-label="Send"
        className="grid size-9 shrink-0 place-items-center rounded-sm border text-primary transition-transform hover:-translate-y-px"
        style={{ background: "var(--accent-tint)", borderColor: "color-mix(in srgb, var(--primary) 30%, white)" }}
      >
        <Icon name="send" size={18} />
      </button>
    </div>
  )
}

function Composer({
  placeholder = "Follow up…",
  className,
  ...props
}: React.ComponentProps<"div"> & { placeholder?: string }) {
  return (
    <div data-slot="composer" className={cn("flex items-center gap-2", className)} {...props}>
      <Input placeholder={placeholder} className="flex-1" />
      <Button variant="secondary" size="icon" revealLabel="Send" aria-label="Send" className="bp-ico-host">
        <Icon name="send" size={20} loop="fly" />
      </Button>
    </div>
  )
}

function SuggestionChips({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="suggestions"
      className={cn("flex flex-wrap justify-center gap-2", className)}
      {...props}
    />
  )
}

function SuggestionChip({ className, ...props }: React.ComponentProps<"button">) {
  return (
    <button
      type="button"
      data-slot="suggestion"
      className={cn(
        "inline-flex h-9 items-center rounded-md border border-border-strong bg-card px-3.5 text-sm font-semibold text-foreground transition-colors hover:bg-[color-mix(in_oklab,var(--foreground)_4%,transparent)]",
        className
      )}
      {...props}
    />
  )
}

export { Chatbar, Composer, SuggestionChips, SuggestionChip }
