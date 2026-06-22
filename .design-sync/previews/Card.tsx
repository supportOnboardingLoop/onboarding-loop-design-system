import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
  Button,
  Badge,
} from "@onboarding-loop/design-system"

export const Default = () => (
  <Card style={{ maxWidth: 360 }}>
    <CardHeader>
      <CardTitle>Onboarding progress</CardTitle>
      <CardDescription>3 of 5 setup steps complete</CardDescription>
      <CardAction>
        <Badge variant="success">On track</Badge>
      </CardAction>
    </CardHeader>
    <CardContent>
      Guide new teammates through workspace setup, then hand off to their first
      live project.
    </CardContent>
    <CardFooter style={{ gap: 8 }}>
      <Button size="sm">Continue</Button>
      <Button size="sm" variant="ghost">
        Skip for now
      </Button>
    </CardFooter>
  </Card>
)

export const Compact = () => (
  <Card size="sm" style={{ maxWidth: 280 }}>
    <CardHeader>
      <CardTitle>Seats used</CardTitle>
      <CardDescription>8 of 10 included</CardDescription>
    </CardHeader>
    <CardContent>Add more seats from billing when your team grows.</CardContent>
  </Card>
)
