import { AGENTS } from "../skins"
import { choiceConversation } from "./_shared"
import type { DemoPreset } from "./types"

// STUB — a CRM / sales SaaS. Scaffolded so the picker works end-to-end.
export const crmPreset: DemoPreset = {
  id: "crm",
  label: "CRM",
  tagline: "Pipeline, deals, and accounts",
  pickerIcon: "users",
  status: "soon",
  skin: { theme: "HubSpot", font: "Poppins", agent: { name: "Casey", role: "Sales copilot", src: AGENTS.Bal.src } },

  brand: { mark: "R", name: "Relate" },
  nav: [
    {
      label: "Workspace",
      count: 2,
      items: [
        { id: "Overview", icon: "sparkles", label: "Overview", badge: { text: "5", variant: "new" } },
        { id: "Pipeline", icon: "chart-bar", label: "Pipeline", badge: { text: "Hot", variant: "new" } },
      ],
    },
    {
      label: "Admin",
      count: 2,
      items: [
        { id: "Tasks", icon: "checklist", label: "Tasks" },
        { id: "Contacts", icon: "users", label: "Contacts" },
      ],
    },
  ],

  collection: {
    label: "Views",
    itemIcon: "layout-dashboard",
    seed: [
      { id: "v1", name: "Enterprise Pipeline", count: 18 },
      { id: "v2", name: "New Leads", count: 24 },
      { id: "v3", name: "At-Risk Accounts", count: 6 },
    ],
    saveVerb: "Save as View",
    saveNoun: "View",
  },
  seedSavedChats: [{ id: "saved-territory", title: "Territory Plan", firstText: "Help me plan my territory", saved: true }],
  seedRecentChats: [{ id: "seed-deal", title: "Deal Review", firstText: "Review my open deals" }],
  contextEngine: {
    label: "Context",
    items: [
      { icon: "book-2", label: "Sales playbook", count: 7 },
      { icon: "brain", label: "Account memory", count: 12 },
      { icon: "chart-bar", label: "Benchmarks", count: 5 },
    ],
  },

  content: { title: "Overview", icon: "sparkles" },

  accessOptions: ["Only myself", "My team", "My manager"],
  coaches: [
    { target: "collection", side: "left", title: "Save views", desc: "Slice the pipeline into saved views for you or the team." },
    { target: "actions", side: "top", title: "Filter, then save", desc: "Filter the pipeline, then save it as a view." },
  ],

  conversation: choiceConversation("On it. A few ways to work the pipeline:", [
    { value: "a", label: "Pull an at-risk report" },
    { value: "b", label: "Compare to last quarter" },
    { value: "c", label: "Summarise the top deals" },
  ]),
}
