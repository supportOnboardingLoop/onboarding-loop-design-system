import {
  Card,
  CardHeader,
  CardSurface,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
  Button,
  Badge,
} from "@onboarding-loop/design-system"

// A full content card: tray with a header + footer wrapping one white surface.
export const Default = () => (
  <Card style={{ maxWidth: 380 }}>
    <CardHeader title="Onboarding progress" action={<Badge variant="success">On track</Badge>} />
    <CardSurface>
      <CardTitle>3 of 5 steps complete</CardTitle>
      <CardDescription>
        Guide new teammates through workspace setup, then hand off to their first live project.
      </CardDescription>
    </CardSurface>
    <CardFooter
      action={
        <>
          <Button size="sm" variant="secondary">Skip for now</Button>
          <Button size="sm">Continue</Button>
        </>
      }
    />
  </Card>
)

// The degenerate case: a tray around a single surface, no header or footer.
export const Simple = () => (
  <Card style={{ maxWidth: 300 }}>
    <CardSurface>
      <CardTitle>Seats used</CardTitle>
      <CardDescription>8 of 10 included</CardDescription>
      <CardContent>Add more seats from billing when your team grows.</CardContent>
    </CardSurface>
  </Card>
)
