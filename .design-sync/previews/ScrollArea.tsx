import { ScrollArea, Separator } from "@onboarding-loop/design-system"

const members = [
  "Ada Lovelace",
  "Grace Hopper",
  "Alan Turing",
  "Katherine Johnson",
  "Margaret Hamilton",
  "Dennis Ritchie",
  "Barbara Liskov",
  "Donald Knuth",
  "Radia Perlman",
  "Ken Thompson",
]

export const MemberList = () => (
  <ScrollArea
    style={{
      height: 180,
      width: 240,
      border: "1px solid var(--border)",
      borderRadius: 16,
      background: "var(--card)",
    }}
  >
    <div style={{ padding: 12 }}>
      {members.map((m, i) => (
        <div key={m}>
          <div style={{ fontSize: 13, padding: "6px 4px", color: "var(--foreground)" }}>{m}</div>
          {i < members.length - 1 ? <Separator /> : null}
        </div>
      ))}
    </div>
  </ScrollArea>
)
