import { AGENTS } from "../skins"
import { choiceConversation } from "./_shared"
import type { DemoPreset } from "./types"

// STUB — a project-management SaaS. Scaffolded so the picker works end-to-end;
// content gets fleshed out after Analytics lands.
export const projectMgmtPreset: DemoPreset = {
  id: "project-mgmt",
  label: "Project Mgmt",
  tagline: "Boards, sprints, and delivery",
  pickerIcon: "layout-dashboard",
  status: "soon",
  skin: { theme: "Stripe", font: "DM Sans", agent: { name: "Ada", role: "Delivery lead", src: AGENTS.Jaimie.src } },

  brand: { mark: "P", name: "Projects" },
  nav: [
    {
      label: "Workspace",
      count: 2,
      items: [
        { id: "Overview", icon: "sparkles", label: "Overview", badge: { text: "3", variant: "new" } },
        { id: "Boards", icon: "layout-dashboard", label: "Boards" },
      ],
    },
    {
      label: "Admin",
      count: 2,
      items: [
        { id: "Tasks", icon: "checklist", label: "Tasks" },
        { id: "Team", icon: "users", label: "Team" },
      ],
    },
  ],

  collection: {
    label: "Boards",
    itemIcon: "folder",
    seed: [
      { id: "b1", name: "Website Revamp", count: 12 },
      { id: "b2", name: "Mobile App", count: 8 },
      { id: "b3", name: "Q3 Roadmap", count: 5 },
    ],
    saveVerb: "Save as Board",
    saveNoun: "Board",
  },
  seedSavedChats: [{ id: "saved-kickoff", title: "Sprint Kickoff", firstText: "Help me plan the next sprint", saved: true }],
  seedRecentChats: [{ id: "seed-standup", title: "Daily Standup Notes", firstText: "Summarize today's standup" }],
  contextEngine: {
    label: "Context",
    items: [
      { icon: "book-2", label: "Team playbook", count: 5 },
      { icon: "brain", label: "Project memory", count: 9 },
      { icon: "file-text", label: "Templates", count: 6 },
    ],
  },

  content: { title: "Overview", icon: "sparkles" },

  accessOptions: ["Only myself", "My team", "Everyone"],
  coaches: [
    { target: "collection", side: "left", title: "Organize boards", desc: "Group work into boards for yourself or the whole team." },
    { target: "actions", side: "top", title: "Filter, then save", desc: "Filter the view, then save it as a board." },
  ],

  conversation: choiceConversation("Happy to help plan that. A few ways to slice it:", [
    { value: "a", label: "Draft a sprint timeline" },
    { value: "b", label: "Break it into tasks" },
    { value: "c", label: "Summarise the blockers" },
  ]),
}
