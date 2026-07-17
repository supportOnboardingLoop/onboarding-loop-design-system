import * as React from "react"

import { cn } from "@/lib/utils"
import { Icon } from "../base/icon"

// A staged card ATTACHMENT — a content card carried onto a composer (the launcher
// or the chat) and shown as a chip until the message is sent, then echoed under
// the sent message. `accent` is the card's headline figure (money / value).
// `sourceId` links the chip back to the card it came from, so that card can
// reflect an "attached" state (filled paperclip) and un-attach itself.
export type Attachment = { title: string; accent?: string; sourceId?: string }

// The chip: paperclip + optional accent + title, and (in a composer) a remove X.
// Shares the `.bp-attach` look with the engine-rendered in-message chips (chat.css).
export function AttachChip({
  att,
  onRemove,
  className,
}: {
  att: Attachment
  onRemove?: () => void
  className?: string
}) {
  return (
    <span className={cn("bp-attach", className)}>
      <span className="bp-attach__clip">
        <Icon name="paperclip" size={13} stroke={1.6} />
      </span>
      {att.accent && <span className="bp-attach__accent">{att.accent}</span>}
      <span className="bp-attach__title">{att.title}</span>
      {onRemove && (
        <button type="button" className="bp-attach__x" aria-label="Remove attachment" onClick={onRemove}>
          <Icon name="x" size={12} />
        </button>
      )}
    </span>
  )
}
