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

## Deploy map

One repo, one primary Vercel project, host-based routing off the same build.
`npm run build:styleguide` (Vite) emits two pages into `styleguide/dist`:
`index.html` (the styleguide) and `demo.html` (the demo).

- `system.onboardingloop.ai` -> serves `index.html` (the design system, public).
- `demo.onboardingloop.ai` -> serves `demo.html` (the public demo).
- Client domains -> serve `demo.html?saas=<client>`, but pinned to that client's
  branch, not to `main` (see below).

`main` is always-latest and drives the two public URLs. Push to `main`, the system
and demo redeploy. Do not push work to `main` that you do not want live on the
public system and demo. Keep unfinished work on a branch.

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
