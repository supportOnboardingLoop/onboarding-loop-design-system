import type { ReactNode } from "react"
import type { IconName } from "@/components/base/icon"
import { IntroductionPage } from "./pages/introduction"
import {
  ActivationProtocolPage,
  RetentionProtocolPage,
  ExpansionProtocolPage,
  LevelDesignPatternsPage,
} from "./pages/protocol"
import { LinksPage } from "./pages/links"
import { ToolkitPage } from "./pages/toolkit"
import { StyleGuidePage } from "./pages/style-guide"
import { BasePage } from "./pages/base"
import { ChartsPage } from "./pages/charts"
import { AgentPage } from "./pages/agent"
import { ProductPage } from "./pages/product"
import { WebPage } from "./pages/web"

/* ============================================================================
   The nav model for the Onboarding Loop System.

   Top level is a MIX: a standalone Introduction page (no accordion), then the
   accordion groups — System (Links / Toolkit), Protocols (the method:
   Activation / Retention / Expansion + Level Design Patterns) and Design (Style
   Guide / Base / Agent / Product / Web). Each page is one long page; its sections
   (PageSection / PageItem) become the two-tier "on this page" accordion in the
   sub-nav (see App.tsx). The protocol pages render their Toolkit Markdown
   straight onto the page-kit (see ./pages/protocol.tsx); the rest live under
   ./pages/*.
   ========================================================================== */

export type NavPage = { id: string; label: string; icon: IconName; render: () => ReactNode }
export type NavEntry =
  | { kind: "page"; page: NavPage }
  | { kind: "group"; label: string; pages: NavPage[]; empty?: string }

export const NAV: NavEntry[] = [
  {
    kind: "page",
    page: { id: "introduction", label: "Introduction", icon: "info-circle", render: () => <IntroductionPage /> },
  },
  {
    kind: "group",
    label: "System",
    pages: [
      { id: "links", label: "Links", icon: "external-link", render: () => <LinksPage /> },
      { id: "toolkit", label: "Toolkit", icon: "download", render: () => <ToolkitPage /> },
    ],
  },
  {
    kind: "group",
    label: "Protocols",
    pages: [
      { id: "activation", label: "Activation Protocol", icon: "bulb", render: () => <ActivationProtocolPage /> },
      { id: "retention", label: "Retention Protocol", icon: "refresh", render: () => <RetentionProtocolPage /> },
      { id: "expansion", label: "Expansion Protocol", icon: "trending-up", render: () => <ExpansionProtocolPage /> },
      { id: "level-design", label: "Level Design Patterns", icon: "brain", render: () => <LevelDesignPatternsPage /> },
    ],
  },
  {
    kind: "group",
    label: "Design",
    pages: [
      { id: "style-guide", label: "Style Guide", icon: "book-2", render: () => <StyleGuidePage /> },
      { id: "base", label: "Base", icon: "sparkles", render: () => <BasePage /> },
      { id: "charts", label: "Charts", icon: "chart-bar", render: () => <ChartsPage /> },
      { id: "agent", label: "Agent", icon: "message", render: () => <AgentPage /> },
      { id: "product", label: "Product", icon: "building-store", render: () => <ProductPage /> },
      { id: "web", label: "Web", icon: "cloud", render: () => <WebPage /> },
    ],
  },
]
