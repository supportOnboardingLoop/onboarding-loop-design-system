import { Label, Input } from "@onboarding-loop/design-system"

export const WithInput = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 280 }}>
    <Label>Full name</Label>
    <Input placeholder="Ada Lovelace" />
  </div>
)
