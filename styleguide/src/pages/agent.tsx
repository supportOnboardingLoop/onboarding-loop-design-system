import { useState, type ReactNode } from "react"
import { Button } from "@/components/base/button"
import { CtaRow } from "@/components/product/cta"
import { Progress } from "@/components/product/progress"
import { Score } from "@/components/product/score"
import { Chatbar, Composer, SuggestionChips, SuggestionChip } from "@/components/product/composer"
import { ChecklistItem } from "@/components/product/checklist-item"
import { PanelHeader } from "@/components/product/card-header"
import { Choices } from "@/components/product/choices"
import { BadgeSelect } from "@/components/product/badge-select"
import { Slider } from "@/components/product/slider"
import { AgentTooltip } from "@/components/product/tooltip"
import { ResourceCenter } from "@/components/product/resource-center"
import { MessageRow, Bubble, AgentAvatar, UserAvatar } from "@/components/product/message-row"
import { Thinking } from "@/components/product/thinking"
import { ConversationDivider } from "@/components/product/conversation-divider"
import { ConversationChecklist } from "@/components/product/conversation-checklist"
import { ModelPicker, ModelChip } from "@/components/product/model-picker"
import { Conversation, type ConvoStep } from "@/components/product/conversation"
import { PageSection, PageItem, Example } from "../page-kit"

/* A tier-3 label inside a PageItem (no anchor) — groups a few examples under one
   sub-subsection, e.g. Score → Standalone / In a conversation. */
function Group({ label, children }: { label?: string; children: ReactNode }) {
  return (
    <div>
      {label && <p className="mb-3 text-xs font-semibold tracking-widest text-muted-foreground uppercase">{label}</p>}
      {children}
    </div>
  )
}

/* ---------- agent-tier shared bits ---------- */

const avatarW = <span className="grid size-8 place-items-center rounded-full bg-secondary text-xs font-bold text-foreground">W</span>

// Wilson, the reference agent (matches the docs + starter layout). The avatar is
// a standalone floating illustration on the standardized 64x75 canvas (disc full
// width, bottom-anchored, head overflows up); the .bp-fig-avatar slot never clips it.
const AGENT_AV = "/avatars/wilson.svg"

// The canonical "answer widget as a conversation child" pattern: the agent asks
// in a bubble, the widget sits under it, and answering echoes the pick back as
// the user's own chip below — exactly what the live engine does with user().
function EchoDemo({ question, render }: { question: string; render: (echo: (t: string) => void) => ReactNode }) {
  const [reply, setReply] = useState<string | null>(null)
  return (
    <div className="bp-chat mx-auto w-full max-w-md">
      <MessageRow side="agent" avatar={<AgentAvatar src={AGENT_AV} />} name="Wilson" role="CRO expert" time="now">
        <Bubble>{question}</Bubble>
        <div className="bp-answer">{render(setReply)}</div>
      </MessageRow>
      {reply && (
        <MessageRow side="user" avatar={<UserAvatar />} name="You" time="now">
          <Bubble side="user">{reply}</Bubble>
        </MessageRow>
      )}
    </div>
  )
}

const SENTIMENT = ["Do it myself", "Mostly me", "A mix", "Mostly you", "Just get the result"]
const readSentiment = (v: number) => SENTIMENT[Math.min(4, Math.floor(v / 20))]

// the slider answer needs a confirm (a slider has no discrete tap-to-pick)
function SliderAnswer({ onConfirm }: { onConfirm: (t: string) => void }) {
  const [v, setV] = useState(70)
  return (
    <div className="space-y-3">
      <Slider plain value={v} onValueChange={setV} readFor={readSentiment} />
      <Button className="w-full" revealIcon="arrow-right" onClick={() => onConfirm(readSentiment(v))}>Lock it in</Button>
    </div>
  )
}

const CHOICE_OPTS = [
  { value: "a", label: "Do it for me end to end" },
  { value: "b", label: "Guide me step by step" },
  { value: "c", label: "Just point me to the docs" },
]

const CHANNEL_OPTS = [
  { value: "email", label: "Email" },
  { value: "chat", label: "Live chat" },
  { value: "sms", label: "SMS" },
  { value: "social", label: "Social" },
  { value: "phone", label: "Phone" },
]

/* ---------- Conversation ---------- */

function MessageRowShowcase() {
  return (
    <>
      <Group label="A turn each way">
        <Example>
          <div className="bp-chat mx-auto w-full max-w-md">
            <MessageRow side="agent" avatar={<AgentAvatar src={AGENT_AV} />} name="Wilson" role="CRO expert" time="Monday 9:41am">
              <Bubble>Want me to set up your first heatmap?</Bubble>
            </MessageRow>
            <MessageRow side="user" avatar={<UserAvatar />} name="You" time="Monday 9:41am">
              <Bubble side="user">Yes please.</Bubble>
            </MessageRow>
          </div>
        </Example>
      </Group>
      <p className="text-xs leading-relaxed text-muted-foreground">
        A row is an avatar, a small head (name · role · time), and a bubble. The agent sits left with its
        avatar a floating illustration; you sit right with an initials circle. Speakers read by side and tail,
        never by a loud fill.
      </p>
    </>
  )
}

function BubblesShowcase() {
  return (
    <>
      <Group label="Bot · user · chip">
        <Example>
          <div className="mx-auto flex w-full max-w-md flex-col gap-3">
            <Bubble>A bot bubble: neutral grey, squared toward the avatar on the left.</Bubble>
            <Bubble side="user">A user bubble: a shade darker, squared toward the right.</Bubble>
            <Bubble side="user">Guide me step by step</Bubble>
          </div>
        </Example>
      </Group>
      <p className="text-xs leading-relaxed text-muted-foreground">
        The third is the same user bubble used as a "chip" — the short echo the engine drops in when you pick an
        answer widget. Both bubbles run full width so their edges line up with the timestamp and any widget below.
      </p>
    </>
  )
}

function ThinkingShowcase() {
  return (
    <>
      <Group label="Bulb (product) · dots (fallback)">
        <Example>
          <div className="flex flex-col items-start gap-4">
            <Thinking />
            <Thinking variant="dots" />
          </div>
        </Example>
      </Group>
      <p className="text-xs leading-relaxed text-muted-foreground">
        The pause that reads as working, not broken. The bulb glyph gently breathes (a Lottie doodle can drop into
        the same slot later); the three dots are the guaranteed fallback contract. In the live engine this same
        bubble morphs into the reply. Both hold still under reduced motion.
      </p>
    </>
  )
}

function ConversationDividerShowcase() {
  return (
    <>
      <Group label='"Thought for" divider'>
        <Example>
          <div className="bp-chat mx-auto w-full max-w-md">
            <MessageRow side="user" avatar={<UserAvatar />} name="You" time="now">
              <Bubble side="user">Where are we leaking the most revenue?</Bubble>
            </MessageRow>
            <ConversationDivider>Thought for 3s</ConversationDivider>
            <MessageRow side="agent" avatar={<AgentAvatar src={AGENT_AV} />} name="Wilson" role="CRO expert" time="now">
              <Bubble>Checkout drop-off is the biggest one. Here are the top three.</Bubble>
            </MessageRow>
          </div>
        </Example>
      </Group>
      <p className="text-xs leading-relaxed text-muted-foreground">
        A quiet label with a hairline out each side, sitting between a question and the considered reply. In the
        live engine it leads the turn with a ticking present-tense counter, then flips to the past tense as the
        reply morphs in. It also carries the model annotation (see Models).
      </p>
    </>
  )
}

function ModelsShowcase() {
  return (
    <>
      <Group label="Pick a model">
        <Example><ModelPicker defaultValue="sonnet" /></Example>
      </Group>
      <Group label="Shown on a reply">
        <Example>
          <div className="bp-chat mx-auto w-full max-w-md">
            <ConversationDivider>
              <span className="inline-flex items-center gap-2">Thought for 3s <ModelChip model="Opus 4.8" glyph="brain" /></span>
            </ConversationDivider>
            <MessageRow side="agent" avatar={<AgentAvatar src={AGENT_AV} />} name="Wilson" role="CRO expert" time="now">
              <Bubble>I went deep on this one — here's the full breakdown.</Bubble>
            </MessageRow>
          </div>
        </Example>
      </Group>
      <p className="text-xs leading-relaxed text-muted-foreground">
        How the agent shows and picks which model it is running. Neutral chrome, never an accent moment: a small
        trigger with a name + tagline menu to switch, and an inline chip that annotates a reply with the model that
        produced it (dropped onto the "Thought for" divider).
      </p>
    </>
  )
}

const LEAK_OPTS = [
  { value: "a", label: "Pull the full revenue-leak report" },
  { value: "b", label: "Compare it against last quarter" },
  { value: "c", label: "Just summarise the top 3 issues" },
]
// module-scope so the reference stays stable (the Conversation replays if `script` changes)
const LIVE_SCRIPT: ConvoStep[] = [
  { role: "user", text: "Where are we leaking the most revenue?" },
  {
    role: "agent",
    think: "Great question. Here are a few ways I can dig into that:",
    loops: 1,
    widget: (done) => (
      <Choices options={LEAK_OPTS} onValueChange={(v) => done(String(LEAK_OPTS.find((o) => o.value === v)?.label))} />
    ),
  },
  { role: "agent", think: "On it. Pulling the top three issues together now.", loops: 1 },
]
function ConversationShowcase() {
  return (
    <>
      <Group label="Live build-out">
        <Example padded={false}>
          <Conversation
            avatar={AGENT_AV}
            name="Wilson"
            role="CRO expert"
            script={LIVE_SCRIPT}
            controls
            className="h-[460px]"
          />
        </Example>
      </Group>
      <p className="text-xs leading-relaxed text-muted-foreground">
        The whole surface assembling itself: each atomic part builds in on a staggered wave (avatar → name → time →
        bubble), bot copy reveals line by line, the thinking bubble morphs into the reply on one persistent node
        (measured before/after), and the answer widget is a real component whose pick echoes back as your chip. The
        view sticks to the newest turn. Reduced motion collapses it all to an instant swap. Hit Replay to watch again.
      </p>
    </>
  )
}

/* ---------- Answer widgets ---------- */

function ChoicesShowcase() {
  return (
    <>
      <Group label="Standalone">
        <Example tray="max-w-md"><Choices defaultValue="b" options={CHOICE_OPTS} /></Example>
      </Group>
      <Group label="In a conversation (echoes the pick as your chip)">
        <Example>
          <EchoDemo
            question="How hands-on do you want me to be?"
            render={(echo) => (
              <Choices options={CHOICE_OPTS} onValueChange={(v) => echo(String(CHOICE_OPTS.find((o) => o.value === v)?.label))} />
            )}
          />
        </Example>
      </Group>
    </>
  )
}

function BadgeSelectShowcase() {
  return (
    <>
      <Group label="Standalone">
        <Example tray="max-w-md"><BadgeSelect defaultValue={["email", "chat"]} confirmLabel="Confirm channels" options={CHANNEL_OPTS} /></Example>
      </Group>
      <Group label="In a conversation (echoes the picks as your chip)">
        <Example>
          <EchoDemo
            question="Which channels should I set up? Pick all that apply."
            render={(echo) => (
              <BadgeSelect
                options={CHANNEL_OPTS}
                confirmLabel="Confirm channels"
                onConfirm={(vals) => echo(vals.map((v) => CHANNEL_OPTS.find((o) => o.value === v)?.label).join(", "))}
              />
            )}
          />
        </Example>
      </Group>
    </>
  )
}

function SliderShowcase() {
  return (
    <>
      <Group label="Standalone">
        <Example tray="max-w-md">
          <div className="space-y-8">
            <div className="space-y-2"><p className="text-xs text-muted-foreground">Sentiment</p><Slider defaultValue={70} /></div>
            <div className="space-y-2"><p className="text-xs text-muted-foreground">Plain (neutral scale)</p><Slider plain defaultValue={50} readFor={readSentiment} /></div>
          </div>
        </Example>
      </Group>
      <Group label="In a conversation (echoes the reading as your chip)">
        <Example>
          <EchoDemo question="How much of this should I handle for you?" render={(echo) => <SliderAnswer onConfirm={echo} />} />
        </Example>
      </Group>
    </>
  )
}

function ScoreShowcase() {
  return (
    <>
      <Group label="Standalone">
        <Example tray="max-w-md"><Score options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]} value={8} ends={["Not likely", "Very likely"]} /></Example>
      </Group>
      <Group label="In a conversation (echoes the score as your chip)">
        <Example>
          <EchoDemo
            question="How likely are you to recommend us, 1 to 10?"
            render={(echo) => (
              <Score options={[1, 2, 3, 4, 5, 6, 7, 8, 9, 10]} ends={["Not likely", "Very likely"]} onValueChange={(v) => echo(`${v} out of 10`)} />
            )}
          />
        </Example>
      </Group>
    </>
  )
}

function ProgressShowcase() {
  return (
    <Example tray="max-w-sm">
      <div className="space-y-6">
        <Progress label="Building your dashboard" value={40} />
        <Progress label="Done" value={100} />
      </div>
    </Example>
  )
}

function ConversationChecklistShowcase() {
  return (
    <>
      <Group label="A to-do the agent posts inline">
        <Example>
          <div className="mx-auto max-w-md">
            <ConversationChecklist
              title="Before we launch"
              items={[
                { label: "Connect your store", done: true },
                { label: "Install the tracking snippet" },
                { label: "Capture a first session" },
                { label: "Invite a teammate" },
              ]}
            />
          </div>
        </Example>
      </Group>
      <p className="text-xs leading-relaxed text-muted-foreground">
        A compact, checkable list the agent surfaces mid-thread, with a running count. Distinct from the onboarding
        Checklist item (the big accent rings) — this sits as a conversation child under a bot bubble. Rows tick off
        in place and strike through.
      </p>
    </>
  )
}

function ChecklistShowcase() {
  return (
    <Example tray="max-w-sm" className="px-0">
      <ChecklistItem state="done" label="Connect your store" />
      <ChecklistItem state="open" label="Invite your team" description="Add teammates so they can pick up conversations with you." action={<CtaRow><Button size="sm" variant="secondary">Skip</Button><Button size="sm">Start</Button></CtaRow>} />
      <ChecklistItem state="todo" label="Set your goals" />
      <ChecklistItem state="todo" label="Publish your first campaign" />
    </Example>
  )
}

function ComposerShowcase() {
  return (
    <Example tray="max-w-md">
      <div className="space-y-5">
        <Chatbar placeholder="Ask me anything…" />
        <Composer />
        <SuggestionChips><SuggestionChip>Show me an example</SuggestionChip><SuggestionChip>What can you do?</SuggestionChip><SuggestionChip>Skip</SuggestionChip></SuggestionChips>
      </div>
    </Example>
  )
}

/* ---------- Agent chrome ---------- */

function CardHeaderShowcase() {
  const avatar = <span className="grid size-8 place-items-center rounded-full bg-secondary text-xs font-bold text-foreground">W</span>
  return (
    <Example>
      <div className="space-y-5">
        <div className="max-w-xs overflow-hidden rounded-xl border border-border-strong shadow-card">
          <PanelHeader variant="accent" avatar={avatar} name="Wilson" role="Onboarding guide" heading="Let's get you set up" onClose={() => {}} progress={{ value: 40, count: "2/5" }} />
          <div className="p-4 text-sm text-muted-foreground">Body content goes here.</div>
        </div>
        <div className="max-w-xs overflow-hidden rounded-xl border border-border-strong shadow-card">
          <PanelHeader variant="plain" avatar={avatar} name="Wilson" role="Onboarding guide" heading="Click the settings icon" onClose={() => {}} />
          <div className="px-5 py-4 text-sm text-muted-foreground">A plain (white) header for the explainer tooltip.</div>
        </div>
      </div>
    </Example>
  )
}

function TooltipShowcase() {
  return (
    <Example className="overflow-visible">
      <div className="flex min-h-52 items-center justify-center">
        <AgentTooltip defaultOpen side="top" avatar={avatarW} name="Wilson" role="Onboarding guide" content="Click the settings icon to connect your first data source.">
          <span className="inline-flex h-9 items-center rounded-lg border border-border-strong bg-card px-3 text-sm font-medium">Anchor element</span>
        </AgentTooltip>
      </div>
    </Example>
  )
}

function ResourceCenterShowcase() {
  return (
    <Example>
      <div className="flex justify-center">
        <ResourceCenter
          avatar={avatarW}
          name="Wilson"
          role="Onboarding guide"
          heading="How can I help?"
          onClose={() => {}}
          sections={[
            { label: "Get started", options: [{ icon: "book-2", label: "Read the quickstart" }, { icon: "checklist", label: "Finish setup" }] },
            { label: "Learn more", options: [{ icon: "users", label: "Join the academy" }, { icon: "lifebuoy", label: "Contact support", trailing: "external-link" }] },
          ]}
        />
      </div>
    </Example>
  )
}

/* ---------------- the page ---------------- */

export function AgentPage() {
  return (
    <>
      <PageSection title="Conversation" desc="The conversation surface: the message row, the two bubbles, the thinking pause, the 'Thought for' divider, the model chrome, and the whole thing assembling itself live.">
        <PageItem title="Message row" desc="An avatar, a small head (name · role · time), and a bubble. The agent sits left with a floating illustration; you sit right with an initials circle.">
          <MessageRowShowcase />
        </PageItem>
        <PageItem title="Bubbles" desc="The bot bubble (neutral grey), the user bubble (a shade darker), and the same user bubble reused as the echo chip.">
          <BubblesShowcase />
        </PageItem>
        <PageItem title="Thinking" desc="The pause that reads as working, not broken: a breathing bulb (product), with three dots as the guaranteed fallback.">
          <ThinkingShowcase />
        </PageItem>
        <PageItem title="Conversation divider" desc="A quiet label with a hairline out each side, sitting between a question and the considered reply. It also carries the model annotation.">
          <ConversationDividerShowcase />
        </PageItem>
        <PageItem title="Models" desc="How the agent shows and picks which model it is running: a name + tagline picker, and an inline chip that annotates a reply.">
          <ModelsShowcase />
        </PageItem>
        <PageItem title="Conversation (live)" desc="The whole surface assembling itself: staggered build-in, line-by-line reveal, the thinking bubble morphing into the reply, and a real answer widget echoing your pick.">
          <ConversationShowcase />
        </PageItem>
      </PageSection>

      <PageSection title="Answer widgets" desc="The real components the agent drops under a bubble as a conversation child. Standalone, or in a conversation where answering echoes the pick back as your own chip.">
        <PageItem title="Choices" desc="Single-select option rows. Standalone, or in a conversation where the pick echoes back as your chip.">
          <ChoicesShowcase />
        </PageItem>
        <PageItem title="Badge select" desc="Multi-select pills with a confirm. Standalone, or in a conversation where the picks echo back as your chip.">
          <BadgeSelectShowcase />
        </PageItem>
        <PageItem title="Slider" desc="A sentiment / amount slider, accent or plain (neutral scale). In a conversation it needs a confirm, then echoes the reading back.">
          <SliderShowcase />
        </PageItem>
        <PageItem title="Score" desc="A 1-to-10 scale with end labels. In a conversation the score echoes back as your chip.">
          <ScoreShowcase />
        </PageItem>
        <PageItem title="Progress" desc="A labeled progress bar for a running task (building a dashboard, finishing setup).">
          <ProgressShowcase />
        </PageItem>
        <PageItem title="Conversation checklist" desc="A compact, checkable to-do the agent surfaces mid-thread, with a running count. Rows tick off in place and strike through.">
          <ConversationChecklistShowcase />
        </PageItem>
        <PageItem title="Checklist item" desc="The onboarding checklist row (the big accent rings): done / open / to-do states, with an optional description + CTA.">
          <ChecklistShowcase />
        </PageItem>
        <PageItem title="Composer" desc="The chat input family: the resting chatbar, the expanded composer, and the suggestion chips.">
          <ComposerShowcase />
        </PageItem>
      </PageSection>

      <PageSection title="Agent chrome" desc="The frame around the conversation: the agent identity header, the explainer tooltip, and the resource center.">
        <PageItem title="Agent header" desc="The panel header carrying the agent identity (avatar · name · role) + heading, in an accent or plain variant, with optional progress.">
          <CardHeaderShowcase />
        </PageItem>
        <PageItem title="Tooltip" desc="The agent explainer tooltip: an identity head + copy, pointing at an anchor element.">
          <TooltipShowcase />
        </PageItem>
        <PageItem title="Resource center" desc="The help menu: an agent header over grouped option rows (get started / learn more).">
          <ResourceCenterShowcase />
        </PageItem>
      </PageSection>
    </>
  )
}
