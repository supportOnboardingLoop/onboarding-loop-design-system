import { Textarea, Label } from "@onboarding-loop/design-system"

export const WithLabel = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 320 }}>
    <Label>Welcome message</Label>
    <Textarea defaultValue="Hi there — thanks for joining! Tell us what you're hoping to set up first and we'll tailor your onboarding." />
  </div>
)

export const Placeholder = () => (
  <div style={{ maxWidth: 320 }}>
    <Textarea placeholder="Add a note for your teammates…" />
  </div>
)
