import { Input, Label } from "@onboarding-loop/design-system"

export const WithLabel = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 280 }}>
    <Label>Work email</Label>
    <Input type="email" placeholder="you@company.com" />
  </div>
)

export const Filled = () => (
  <div style={{ maxWidth: 280 }}>
    <Input defaultValue="ada@onboardingloop.com" />
  </div>
)

export const Invalid = () => (
  <div style={{ display: "flex", flexDirection: "column", gap: 6, maxWidth: 280 }}>
    <Label>Work email</Label>
    <Input type="email" aria-invalid defaultValue="not-an-email" />
  </div>
)

export const Disabled = () => (
  <div style={{ maxWidth: 280 }}>
    <Input disabled placeholder="Unavailable" />
  </div>
)
