import { Separator } from "@onboarding-loop/design-system"

export const Horizontal = () => (
  <div style={{ maxWidth: 280, fontSize: 13, color: "var(--foreground)" }}>
    <div style={{ paddingBottom: 12 }}>Account</div>
    <Separator />
    <div style={{ paddingTop: 12 }}>Workspace</div>
  </div>
)

export const Vertical = () => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, height: 24, fontSize: 13 }}>
    <span>Profile</span>
    <Separator orientation="vertical" />
    <span>Billing</span>
    <Separator orientation="vertical" />
    <span>Members</span>
  </div>
)
