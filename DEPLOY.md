# Delivery model: system, demo, and client work

How this repo ships. Read this before wiring a new deploy, adding a client, or
touching the Vercel setup. It exists so the client-delivery model has one written
source and future builds do not re-derive it.

## The one-line version

Everything lives in this one repo. The design system, the public demo, and every
client deliverable are the same codebase built on the same components. A client
build is not a separate project; it is a preset (a "state") of the demo. Git
branches, not folders, decide what each URL shows.

## Repos and folders

- `onboarding-loop-design-system` (this repo) is the single source of truth:
  tokens, theme, base + product components, the styleguide, and the demo.
- `archive/loop-design-system-legacy` is the retired HTML/CSS kit. Superseded by
  this repo. Corebee was built on it. Do not build anything new against it.
- `blueprint-deliverables/corebee-activation` is a delivered static site on the
  legacy kit, its own repo and Vercel project, frozen. If Corebee is ever
  reopened, it gets rebuilt in this system as a preset, not resynced to legacy.

## Presets are states

A "state" is a `DemoPreset` in `styleguide/src/presets/`. A preset is content plus
a skin and owns no behavior. `DemoApp.tsx` is the single renderer and owns all app
state and behavior; it is identical across every preset. So a component change
reaches every preset automatically, and a new build is a new data file, not a fork.

- The demo is `demo.html`, which reads `?saas=<id>` to pick a preset.
- `styleguide/src/presets/index.ts` holds the picker list, the default, and the
  aliases. `analytics` is the flagship and default; the `heatmap` alias resolves
  to it, so `?saas=heatmap` loads the analytics preset.
- Adding a client or product (Loop OS, the next client) means adding one preset
  file and registering it. Nothing else forks.

### listed vs unlisted

The public demo's picker should show showcase presets only. A client preset gets
its own URL but should not appear in the public picker, or it leaks client
specifics to anyone browsing the demo. Keep client presets unlisted; only
showcase states go in the picker list.

## Two kinds of preset: showcase vs product

Not every preset is the same thing.

- **Showcase / client presets** (e.g. `analytics` = Heatmap) are mockups. They
  live only in the demo, run on seeded fake data, and never become a real app.
  This is client deliverable work.
- **Product presets** (e.g. `crm` -> Loop OS pipeline, `project-mgmt` -> Loop OS
  projects) are previews of REAL Loop OS pages. The page UI is a shared component
  in this design system; the demo renders it with fake data, Loop OS renders the
  same component with real data.

The demo is where you design pages, for clients and for Loop OS alike. Loop OS is
the working app. The rule that keeps that sane: the demo holds layout and
components on fake data; real data and behavior live only in Loop OS.

## Product presets: one page, shared with Loop OS

A product page is three layers. Only the first is shared.

1. **Presentational component** — lives here, in `components/product/` (e.g.
   `components/product/projects-page.tsx`). Pure UI. It takes ALL its data and
   callbacks as props. It never fetches, never touches the vault, never routes.
   Mark it `"use client"` if interactive. This is the single source for the page's
   look and layout.
2. **Demo consumer** — the product preset imports the component and feeds it
   seeded fake data (and no-op or local-state callbacks). This is what shows in
   the demo.
3. **Loop OS consumer** — Loop OS imports the SAME component (it already pulls
   this repo as a dependency) and feeds it real data from the vault plus real
   callbacks (write, reorder, GitHub sync).

The contract between design and data is a props type defined here, next to the
component. Both consumers satisfy it.

```tsx
// design system: components/product/projects-page.tsx
export type ProjectsPageProps = {
  projects: ProjectRow[]
  onReorder?: (from: number, to: number) => void
  onEditTask?: (id: string, patch: Partial<Task>) => void
}
export function ProjectsPage(props: ProjectsPageProps) {
  /* pure UI: layout, cards, nav. no data fetching, no vault, no router. */
}

// demo preset (project-mgmt): fake data, look only
<ProjectsPage projects={SEED_PROJECTS} />

// loop os route: real data + real behavior
<ProjectsPage
  projects={realProjects}
  onReorder={writeReorderToVault}
  onEditTask={writeTaskToVault}
/>
```

**Propagation.** Change `projects-page.tsx`, push. The demo picks it up (same
repo). Loop OS picks it up when you pull this dependency (`npm update
@onboarding-loop/design-system` or bump the git ref). That pull is the "update
Loop OS if I ask it to." One source for the UI, two data feeds.

**Boundary rules (do not break):**
- The shared component takes data in via props and sends events out via
  callbacks. It never fetches, never reads the vault, never routes.
- Fake data (demo) and real data (Loop OS) both conform to the same props type.
- Behavior (persistence, sync, routing) lives in the Loop OS consumer only, never
  in the shared component or the preset.

**Migration.** Loop OS's existing projects/pipeline pages were built separately in
Cursor on shadcn. Adopting this means refactoring each to render the shared
component, page by page. New pages: design them in the demo as the shared
component first, then wire Loop OS to it. New is clean; existing is a migration.

## Deploy map

One repo, one primary Vercel project, host-based routing off the same build.
`npm run build:styleguide` (Vite) emits two pages into `styleguide/dist`:
`index.html` (the styleguide) and `demo.html` (the demo).

- `demo.onboardingloop.ai` -> serves `demo.html`. This is the ONE public surface:
  the real "see it working". Marketing points here.
- `system.onboardingloop.ai` -> the GATED product (the Onboarding Loop system /
  DIY kit). Serves the kit, access-gated by magic link (Supabase + a Stripe
  webhook; see strategy.md 2026-07-17 and the future auth brief). NOT public. Do
  not attach this domain or ship it publicly until the gate is built. Until then,
  `index.html` is the styleguide for internal/dev use only.
- Client domains -> serve `demo.html?saas=<client>`, but pinned to that client's
  branch, not to `main` (see below).

`main` is always-latest and drives the public demo (and, once built, the gated
system). Push to `main`, they redeploy. Do not push work to `main` that you do not
want live on the public demo. Keep unfinished work on a branch.

## Client lifecycle

An active client is a branch, not `main`. This is what keeps your in-progress
system commits off the client's live link.

1. Active build: create `client/<name>` (e.g. `client/heatmap`). Assign the
   client's domain to that branch in Vercel. The domain serves that branch's
   latest deployment.
2. Show the client an update: merge `main` into `client/<name>` when you have a
   version you want them to see. That is the only time their URL moves. This is
   "push the latest when I want them to see it," made literal.
3. Deliver / freeze: at sign-off, stop merging into the branch (or tag the commit
   and pin the domain to the tag). The URL sits at the approved state and unrelated
   system work never disturbs it.
4. Update a delivered client intentionally: merge `main` into their branch again on
   purpose, redeploy, done.

Propagation still flows both ways because it is one codebase: system changes reach
clients when you merge, and improvements made while building a client land in the
system when you merge back to `main`. The merge is the intentional gate.

## Current state (2026-07-17)

- Heatmap: active, live client. Lives as the analytics preset. Runs on a
  `client/heatmap` branch; `heatmap.onboardingloop.ai` points at that branch.
  Merge `main` into it to push the client an update.
- Corebee: delivered, frozen, on the legacy static repo. Left as-is. Rebuild in
  this system if reopened.
- `blueprint-deliverables/heatmap-agency-portal`: the old duplicated static build.
  Superseded by the heatmap preset here. Retire its repo and Vercel project once
  the new deploy is verified.

## Adding a new build (the recipe)

1. Add `styleguide/src/presets/<name>.tsx` (copy an existing preset as the shape).
2. Register it in `index.ts`. Showcase state: add to the picker list. Client
   state: keep it unlisted, add an alias if the client link wants a natural name.
3. Client work only: branch `client/<name>`, assign the domain to the branch,
   merge `main` in when ready.
