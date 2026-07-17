import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import App from "./App"
import { installScrollReveal } from "@/lib/scroll-reveal"
import "./styleguide.css"

installScrollReveal() // reveal the global scrollbar only while scrolling
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
)
