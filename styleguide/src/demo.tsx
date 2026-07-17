import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { Demo } from "./DemoApp"
import { installScrollReveal } from "@/lib/scroll-reveal"
import "./styleguide.css"
import "./demo.css"

installScrollReveal() // reveal the global scrollbar only while scrolling

// The DEMO — the design system + the agent in action, as a first-class full-viewport
// entry (reachable at /demo.html). It renders the whole 4-column agent workspace
// full-screen, assembled entirely from the real DS components: editing a component
// (here or in the design system) propagates to both. This is where you SEE the system.
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Demo />
  </StrictMode>
)
