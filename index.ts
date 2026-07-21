// Barrel entry for the Loop Design System.
// Re-exports every component; the public API stays flat even though the source
// is organized into Base / Product / Web buckets.

// --- Base: shared primitives ---
export * from "./components/base/badge"
export * from "./components/base/button"
export * from "./components/base/card"
export * from "./components/base/checkbox"
export * from "./components/base/checkmark"
export * from "./components/base/icon"
export * from "./components/base/icon-button"
export * from "./components/base/input"
export * from "./components/base/label"
export * from "./components/base/scroll-area"
export * from "./components/base/segmented-control"
export * from "./components/base/select"
export * from "./components/base/separator"
export * from "./components/base/textarea"

// --- Layout: the workspace shell + column primitives + shared chrome ---
export * from "./components/product/workspace-shell"
export * from "./components/product/layout-column"
export * from "./components/product/brand-mark"
export * from "./components/product/agent-home-header"
export * from "./components/product/travelling-avatar"
export * from "./components/product/compact-bar"

// --- Product: app / onboarding components (ported from the kit) ---
export * from "./components/product/nav-item"
export * from "./components/product/chip"
export * from "./components/product/section"
export * from "./components/product/section-header"
export * from "./components/product/account-card"
export * from "./components/product/dropdown"
export * from "./components/product/color-picker"
export * from "./components/product/launcher"
export * from "./components/product/chat-panel"
export * from "./components/product/cta"
export * from "./components/product/progress"
export * from "./components/product/score"
export * from "./components/product/composer"
export * from "./components/product/checklist-item"
export * from "./components/product/card-header"
export * from "./components/product/choices"
export * from "./components/product/badge-select"
export * from "./components/product/slider"
export * from "./components/product/tooltip"
export * from "./components/product/resource-center"
export * from "./components/product/calendar"
export * from "./components/product/charts"

// --- Agent tier: the conversation surface (static chrome + the live engine) ---
export * from "./components/product/message-row"
export * from "./components/product/thinking"
export * from "./components/product/conversation-divider"
export * from "./components/product/conversation-checklist"
export * from "./components/product/model-picker"
export * from "./components/product/conversation"

// --- Product: app / onboarding components (ported from the kit in Phase 3) ---
// --- Web: marketing sections (built later) ---
