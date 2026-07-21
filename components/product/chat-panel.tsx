"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { Icon } from "../base/icon"
import { Button } from "../base/button"
import { IconButton } from "../base/icon-button"
import { Conversation, type ConversationHandle } from "./conversation"
import { ColumnHeader, ColumnTitle } from "./layout-column"
import { Dropdown, DropdownTrigger, DropdownContent, DropdownItem } from "./dropdown"
import { AttachChip, type Attachment } from "./attach-chip"

// The col-4 AI chat side panel: a header (title + Options menu + close) over the
// live <Conversation> (host-driven), with a follow-up composer footer. A thin,
// reusable shell — the SUBSTANCE is the shared conversation engine + the DS
// Button; the host drives turns and history through the forwarded apiRef, and
// owns what the agent says (kept out of the DS). Promoted from the starter's
// col-4 so every agent surface can dock a chat.

export type ChatPanelOption = "save" | "unsave" | "rename" | "archive"

type ChatPanelProps = {
  agent: { avatar: string; name?: string; role?: string }
  title: string
  /** show the "Un-save chat" (filled bookmark) treatment instead of "Save chat" */
  saved?: boolean
  onClose: () => void
  onSend: (text: string) => void
  onOption?: (act: ChatPanelOption) => void
  /** staged card attachments shown as chips above the composer (host-owned) */
  attachments?: Attachment[]
  onRemoveAttachment?: (index: number) => void
  /** the ConversationHandle, forwarded so the host can drive turns + history */
  apiRef?: React.Ref<ConversationHandle>
  className?: string
}

function ChatPanel({ agent, title, saved, onClose, onSend, onOption, attachments = [], onRemoveAttachment, apiRef, className }: ChatPanelProps) {
  const [text, setText] = React.useState("")
  const taRef = React.useRef<HTMLTextAreaElement>(null)
  const canSend = text.trim().length > 0 || attachments.length > 0

  // auto-grow the composer to <=3 lines, then scroll its own overflow
  React.useEffect(() => {
    const ta = taRef.current
    if (!ta) return
    if (!ta.value) {
      ta.style.height = "40px"
      return
    }
    ta.style.height = "auto"
    ta.style.height = Math.min(ta.scrollHeight, 80) + "px"
    ta.scrollTop = ta.scrollHeight
  }, [text])

  const submit = () => {
    const t = text.trim()
    if (!t && attachments.length === 0) return // allow send with attachments + no text
    setText("")
    onSend(t)
  }

  return (
    <div className={cn("flex h-full min-h-0 flex-col", className)}>
      <ColumnHeader className="gap-2.5 pr-3 pl-5">
        <ColumnTitle as="h2">{title}</ColumnTitle>
        <Dropdown>
          <DropdownTrigger className="bp-chev-host inline-flex h-8 shrink-0 items-center gap-1 rounded-[var(--ctl-radius)] [corner-shape:squircle] border border-border-strong bg-[linear-gradient(180deg,var(--ctl-face),var(--ctl-face-2))] pr-2 pl-2.5 text-sm font-medium text-[var(--ctl-ink)] shadow-[0_1px_2px_rgba(10,13,18,0.05)] outline-none transition-colors hover:border-[var(--ctl-line-hover)] data-[popup-open]:border-primary data-[popup-open]:shadow-[0_0_0_3px_var(--accent-tint)]">
            Options
            <Icon name="chevron-down" size={16} className="bp-chev text-muted-foreground" />
          </DropdownTrigger>
          <DropdownContent>
            <DropdownItem icon="bookmark" iconFilled={saved} onClick={() => onOption?.(saved ? "unsave" : "save")}>
              {saved ? "Un-save chat" : "Save chat"}
            </DropdownItem>
            <DropdownItem icon="pencil" onClick={() => onOption?.("rename")}>
              Rename
            </DropdownItem>
            <DropdownItem icon="archive" onClick={() => onOption?.("archive")}>
              Archive
            </DropdownItem>
          </DropdownContent>
        </Dropdown>
        <IconButton icon="x" motion="rotate" onClick={onClose} aria-label="Close chat" />
      </ColumnHeader>

      <Conversation
        apiRef={apiRef}
        avatar={agent.avatar}
        name={agent.name}
        role={agent.role}
        userName="You"
        thinking="bulb"
        className="min-h-0 flex-1"
        chatClassName="ws-chat__body"
      />

      <div className="ws-chat__foot">
        {attachments.length > 0 && (
          <div className="mb-2 flex flex-wrap gap-1.5">
            {attachments.map((a, i) => (
              <AttachChip key={i} att={a} onRemove={() => onRemoveAttachment?.(i)} />
            ))}
          </div>
        )}
        <div className="flex items-start gap-3">
          <div className="min-w-0 flex-1 rounded-2xl [corner-shape:squircle] border border-border-strong bg-card transition-colors focus-within:border-primary">
            <textarea
              ref={taRef}
              rows={1}
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault()
                  submit()
                }
              }}
              placeholder="Follow up…"
              className="block max-h-20 min-h-[40px] w-full resize-none bg-transparent px-3.5 py-2.5 text-base leading-5 text-foreground outline-none [scrollbar-width:none] placeholder:text-muted-foreground"
            />
          </div>
          <Button
            variant="secondary"
            revealLabel="Send"
            aria-label="Send"
            disabled={!canSend}
            onClick={submit}
            className="ws-chat__send bp-ico-host"
          >
            <Icon name="send" size={20} loop="fly" />
          </Button>
        </div>
      </div>
    </div>
  )
}

export { ChatPanel }
export type { ChatPanelProps }
