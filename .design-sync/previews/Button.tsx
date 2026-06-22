import { Button } from "@onboarding-loop/design-system"

export const Variants = () => (
  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
    <Button>Save changes</Button>
    <Button variant="outline">Cancel</Button>
    <Button variant="secondary">Secondary</Button>
    <Button variant="ghost">Ghost</Button>
    <Button variant="destructive">Delete</Button>
    <Button variant="link">Learn more</Button>
  </div>
)

export const Sizes = () => (
  <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>
    <Button size="sm">Small</Button>
    <Button>Default</Button>
    <Button size="lg">Large</Button>
  </div>
)

export const Disabled = () => (
  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
    <Button disabled>Save changes</Button>
    <Button variant="outline" disabled>
      Cancel
    </Button>
  </div>
)
