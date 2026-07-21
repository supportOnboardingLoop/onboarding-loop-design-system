import { choiceConversation } from "./_shared"
import type { DemoPreset } from "./types"

// STUB — a finance / accounting app. Scaffolded so the picker works end-to-end.
export const financePreset: DemoPreset = {
  id: "finance",
  label: "Finance",
  tagline: "Cash flow, reports, and runway",
  pickerIcon: "chart-pie",
  status: "soon",

  brand: { mark: "L", name: "Ledger" },
  nav: [
    {
      label: "Workspace",
      count: 2,
      items: [
        { id: "Overview", icon: "sparkles", label: "Overview", badge: { text: "4", variant: "new" } },
        { id: "Accounts", icon: "chart-bar", label: "Accounts" },
      ],
    },
    {
      label: "Admin",
      count: 2,
      items: [
        { id: "Transactions", icon: "file-text", label: "Transactions" },
        { id: "Advisors", icon: "users", label: "Advisors" },
      ],
    },
  ],

  collection: {
    label: "Reports",
    itemIcon: "file-text",
    seed: [
      { id: "r1", name: "Cash Flow", count: 6 },
      { id: "r2", name: "Q2 P&L", count: 4 },
      { id: "r3", name: "Runway", count: 2 },
    ],
    saveVerb: "Save as Report",
    saveNoun: "Report",
  },
  seedSavedChats: [{ id: "saved-budget", title: "Budget Setup", firstText: "Help me set up my budget", saved: true }],
  seedRecentChats: [{ id: "seed-close", title: "Month-End Close", firstText: "Walk me through the month-end close" }],
  contextEngine: {
    label: "Context",
    items: [
      { icon: "book-2", label: "Finance policies", count: 5 },
      { icon: "brain", label: "Account memory", count: 8 },
      { icon: "chart-bar", label: "Benchmarks", count: 6 },
    ],
  },

  content: { title: "Overview", icon: "sparkles" },

  accessOptions: ["Only myself", "My team", "My accountant"],
  coaches: [
    { target: "collection", side: "left", title: "Build reports", desc: "Turn live figures into reports for yourself or your board." },
    { target: "actions", side: "top", title: "Filter, then save", desc: "Filter the period, then save it as a report." },
  ],

  conversation: choiceConversation("Let's dig into the numbers. A few ways:", [
    { value: "a", label: "Build a cash-flow report" },
    { value: "b", label: "Compare to last quarter" },
    { value: "c", label: "Summarise the top risks" },
  ]),
}
