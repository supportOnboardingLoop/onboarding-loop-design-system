import { AGENTS } from "../skins"
import { choiceConversation } from "./_shared"
import type { DemoPreset } from "./types"

// STUB — a health / wellness app. Scaffolded so the picker works end-to-end.
export const healthPreset: DemoPreset = {
  id: "health",
  label: "Health",
  tagline: "Programs, plans, and vitals",
  pickerIcon: "heart",
  status: "soon",
  skin: { theme: "LinkedIn", font: "Manrope", agent: { name: "Remy", role: "Health coach", src: AGENTS.Bal.src } },

  brand: { mark: "V", name: "Vitals" },
  nav: [
    {
      label: "Workspace",
      count: 2,
      items: [
        { id: "Today", icon: "sparkles", label: "Today", badge: { text: "2", variant: "new" } },
        { id: "Programs", icon: "heart", label: "Programs" },
      ],
    },
    {
      label: "Admin",
      count: 2,
      items: [
        { id: "Logs", icon: "activity", label: "Logs" },
        { id: "Care team", icon: "users", label: "Care team" },
      ],
    },
  ],

  collection: {
    label: "Programs",
    itemIcon: "activity",
    seed: [
      { id: "p1", name: "Sleep Reset", count: 4 },
      { id: "p2", name: "Marathon Plan", count: 12 },
      { id: "p3", name: "Nutrition", count: 3 },
    ],
    saveVerb: "Save as Program",
    saveNoun: "Program",
  },
  seedSavedChats: [{ id: "saved-intake", title: "Intake Review", firstText: "Walk me through my intake", saved: true }],
  seedRecentChats: [{ id: "seed-week", title: "This Week's Check-in", firstText: "How did I do this week?" }],
  contextEngine: {
    label: "Context",
    items: [
      { icon: "book-2", label: "Care guidelines", count: 6 },
      { icon: "brain", label: "Health history", count: 11 },
      { icon: "chart-bar", label: "Labs & benchmarks", count: 7 },
    ],
  },

  content: { title: "Today", icon: "sparkles" },

  accessOptions: ["Only myself", "My care team", "My clinician"],
  coaches: [
    { target: "collection", side: "left", title: "Build programs", desc: "Turn goals into repeatable programs and plans." },
    { target: "actions", side: "top", title: "Filter, then save", desc: "Filter the view, then save it as a program." },
  ],

  conversation: choiceConversation("Let's look after that. A few directions:", [
    { value: "a", label: "Build a weekly plan" },
    { value: "b", label: "Review last week" },
    { value: "c", label: "Summarise my metrics" },
  ]),
}
