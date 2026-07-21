# DS agent / chat component map (reference for the agent-led animation)

All paths under `~/Desktop/code/ds-web`. Two layers: an imperative engine
(`components/product/convo-engine.ts`) that owns a `.bp-chat` DOM container and
builds message rows, wrapped by React `conversation.tsx` (declarative `script`
prop OR host-driven `apiRef`). Every static atom emits the SAME `bp-` markup the
engine emits. CSS: `components/chat.css` (all visuals/anim), `components/kit.css`
(icons/scrollbar), `components/workspace.css` (ChatPanel chrome + avatars). The
`--bp-*` token bridge is in `theme.css`. All this CSS is ALREADY imported by the
marketing site (via `theme.css` -> global.css). Squircle via `corner-shape`.

## Conversation (`components/product/conversation.tsx`)
Props: `avatar, name?, role?, userName?, script?: ConvoStep[], thinking?: "bulb"|"dots",
apiRef?: Ref<ConversationHandle>, controls?, className?, chatClassName?`.
Renders `<div flex min-h-0 flex-col>` -> inner `.bp-chat scroll-thin ... overflow-y-auto`.

`ConversationHandle` (imperative):
- `clear()`
- `user(text, attachments?)` -> right-side chip/bubble
- `say(paras: string|string[])` -> agent bubble now
- `think(paras, {loops?}) : Promise<void>` -> thinking->reply morph on ONE node; resolves when reply DOM + line reveal start (the chaining hook). loops default 1; dwell = loops*700+500 ms.
- `ask(render:(done:(echo:string)=>void)=>ReactNode, {echo?:boolean}) : Promise<string>` -> mounts a widget under the last bubble (`.bp-answer`); resolves when the widget calls done(echo); unless echo:false it echoes the pick as a user chip.
- `snapshot():string` / `restore(html)` -> freeze/restore thread
- `scrollToBottom()`

Declarative `ConvoStep[]`:
```
{ role:"user", text }
{ role:"agent", say:string|string[] }
{ role:"agent", think, loops? }
{ role:"agent", think, loops?, widget:(done)=>ReactNode }
```

## ChatPanel (`components/product/chat-panel.tsx`) — HAS the header + footer the animation is missing
It is: a `ColumnHeader` (title + Options `Dropdown` + close `IconButton`) over a
host-driven `<Conversation apiRef thinking="bulb" chatClassName="ws-chat__body">`,
over a `.ws-chat__foot` composer (auto-grow `<textarea>` <=3 lines, Enter-to-send,
`Button variant="secondary" revealLabel="Send"`).
Props: `agent:{avatar,name?,role?}, title, saved?, onClose, onSend, onOption?,
attachments?, onRemoveAttachment?, apiRef?, className?`. `ChatPanelOption = "save"|"unsave"|"rename"|"archive"`.
=> For the animation's right panel, the header+footer either come from ChatPanel
or a small new "AgentChat" surface (header identity + Conversation + composer).
The DS may not have a standalone chat-card header/footer yet — design it in the
web layer, then consider promoting to the DS (Bal's call).

## Visual atoms (props / what they render)
- `message-row.tsx`: `MessageRow{side?,avatar?,name?,role?,time?}`, `Bubble{side?}`,
  `AgentAvatar{src,alt?}` -> `.bp-fig-avatar` (floating PNG), `UserAvatar{initials="ME"}`
  -> `.bp-msg__avatar--empty` (initials circle, border-radius 50%). NOTE: the marketing
  global `.ol-web *{corner-shape:squircle}` is squircling this circle — must exempt it.
- `thinking.tsx`: `Thinking{variant?:"bulb"|"dots", label?}`.
- `choices.tsx`: `Choices{options:{value,label,key?}[], value?, defaultValue?, onValueChange?}`
  -> lettered A/B/C buttons with reveal check (outline ring -> accent disc on select).
- `conversation-checklist.tsx`: `ConversationChecklist{items:{id?,label,done?}[], title?, onChange?}`
  -> titled card of Checkbox rows + running count (state internal; drive `items[].done` to auto-fill).
- `conversation-divider.tsx`: `ConversationDivider{animated?}` -> "Thought for Ns" hairline separator.
- `travelling-avatar.tsx`: `TravellingAgentAvatar` (rAF-lerps a PNG between two slots).
- `agent-home-header.tsx`: `AgentHomeHeader{name,role,avatarSrc,slotRef?,onCollapse?,children?}`
  -> `.ws-agent-hdr` identity block (workspace.css).
- `composer.tsx`: `Chatbar{placeholder?}` (compact input+mic+send), `Composer` (Input + reveal-label Send),
  `SuggestionChips`, `SuggestionChip`.

## How to script (imperative — the pattern the presets use)
```
api.user("Where are we leaking the most revenue?")
api.think(intro,{loops:1})
  .then(()=> api.ask((done)=> <Choices options={OPTS} onValueChange={v=>done(label)} />))
  .then((echo)=>{ api.think("Building your "+echo+" now…",{loops:1})
    .then(()=> api.ask(()=> <SelfFillingWidget onDone={...}/>, {echo:false})) })
```
Self-filling widget reference: `styleguide/src/presets/analytics-reports.tsx` `ReportBuild`
(rAF fills a bar 0->100% over 2200ms, then swaps to a ready CTA).
Standalone Conversation showcase: `styleguide/src/showcases.tsx` `ConversationShowcase` / `LIVE_SCRIPT` (~line 889).
Full host-driven example: `styleguide/src/DemoApp.tsx` (chatApi ref + presets `respond(api, text, actions)`).

## Reference / parity target
The canonical DS agent (Wilson) runs at `http://localhost:5199/demo.html` (the
styleguide demo, started from ds-web via `npm run dev -- --port 5199`). The
floating launcher morph ("Ask Wilson" -> input) is `components/product/launcher.tsx`
+ `launcher-engine.ts` (PORT-BRIEF Stage 6). Avatars copied to `site/public/avatars/`
(bal/jaimie/wilson/blank .svg). The animation uses Jaimie (`/avatars/jaimie.svg`).
