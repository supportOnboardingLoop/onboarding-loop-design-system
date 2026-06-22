import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectGroup,
  SelectLabel,
  SelectItem,
} from "@onboarding-loop/design-system"

const items = [
  { label: "Daily digest", value: "daily" },
  { label: "Weekly summary", value: "weekly" },
  { label: "Never", value: "never" },
]

export const Selected = () => (
  <Select items={items} defaultValue="weekly">
    <SelectTrigger style={{ width: 220 }}>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="daily">Daily digest</SelectItem>
      <SelectItem value="weekly">Weekly summary</SelectItem>
      <SelectItem value="never">Never</SelectItem>
    </SelectContent>
  </Select>
)

export const Placeholder = () => (
  <Select items={items}>
    <SelectTrigger style={{ width: 220 }}>
      <SelectValue placeholder="Notification frequency…" />
    </SelectTrigger>
    <SelectContent>
      <SelectItem value="daily">Daily digest</SelectItem>
      <SelectItem value="weekly">Weekly summary</SelectItem>
      <SelectItem value="never">Never</SelectItem>
    </SelectContent>
  </Select>
)

export const Open = () => (
  <Select items={items} defaultValue="weekly" defaultOpen>
    <SelectTrigger style={{ width: 220 }}>
      <SelectValue />
    </SelectTrigger>
    <SelectContent>
      <SelectGroup>
        <SelectLabel>Frequency</SelectLabel>
        <SelectItem value="daily">Daily digest</SelectItem>
        <SelectItem value="weekly">Weekly summary</SelectItem>
        <SelectItem value="never">Never</SelectItem>
      </SelectGroup>
    </SelectContent>
  </Select>
)
