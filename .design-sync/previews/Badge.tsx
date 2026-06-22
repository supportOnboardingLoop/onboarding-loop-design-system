import { Badge } from "@onboarding-loop/design-system"

export const Statuses = () => (
  <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
    <Badge variant="neutral">Draft</Badge>
    <Badge variant="success">Active</Badge>
    <Badge variant="warning">Pending</Badge>
    <Badge variant="error">Failed</Badge>
  </div>
)
