# design-sync notes — @onboarding-loop/design-system

Source-only shadcn-style package: **no `dist/`, no build script**. The sync
generates a bundle + TypeScript declarations from a barrel entry (`index.ts`),
and compiles a static Tailwind v4 stylesheet for `cssEntry`. Shape: `package`.

## Repo files this sync added (committed, durable)
- `index.ts` — barrel re-exporting all components (bundle + types entry; `cfg.entry`).
- `tsconfig.json` — path aliases (`@/* → ./*`) so esbuild + tsc resolve `@/lib/utils`.
- `.design-sync/tsconfig.build.json` — emits in-place `.d.ts` (declaration-only).
- `.design-sync/tw-build.css` + `.design-sync/safelist.txt` — Tailwind build entry that
  widens content to components + a design-agent utility safelist.
- `.design-sync/{config.json, conventions.md, previews/}` — standard durable set.

## Generated (gitignored — regenerate before every build/re-sync)
- `index.d.ts`, `components/*.d.ts`, `lib/*.d.ts` (from tsconfig.build.json)
- `.design-sync/ol-compiled.css`, `.design-sync/ol-styles.css` (the `cssEntry`)

## Re-sync pre-build sequence (run from repo root, in order)
1. `npm install`  (no lockfile)
2. Dev tools are NOT in package.json — install no-save:
   `npm install --no-save @tailwindcss/cli@^4 typescript@^5 @types/react@^19 @types/react-dom@^19`
3. Compile CSS, then prepend the Inter webfont import:
   `npx @tailwindcss/cli -i .design-sync/tw-build.css -o .design-sync/ol-compiled.css`
   `{ printf '@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap");\n'; cat .design-sync/ol-compiled.css; } > .design-sync/ol-styles.css`
4. Emit declarations in place:
   `./node_modules/.bin/tsc -p .design-sync/tsconfig.build.json`  (uses `noEmitOnError:false`)
5. Then the driver: `node .ds-sync/resync.mjs --config .design-sync/config.json --node-modules ./node_modules --entry ./index.ts --out ./ds-bundle [--remote .design-sync/.cache/remote-sync.json]`

## Decisions
- **9 component cards.** Compound subparts (Card*, Select*, ScrollBar) are excluded
  from separate cards via `componentSrcMap: null` but REMAIN bundle exports on
  `window.OnboardingLoop` for composition (Card/Select previews compose them).
- **dtsPropsFor for base-ui components** (Button/Badge/Separator/ScrollArea/Select):
  base-ui `*.Props` flatten to references to undefined internal types
  (`ButtonState`, `ComponentRenderFn`, `Multiple`, `Group`…). Hand-written tidy
  bodies replace them. Re-verify these if `@base-ui/react` is upgraded.
- **Select** uses `cardMode:"single"` + `primaryStory:"Open"` (overlay/portal). base-ui
  Select needs `items` + `defaultValue` for `<SelectValue>` to show a label.
- **Fonts:** Inter loads via a remote Google Fonts `@import` — `[FONT_REMOTE]`, by
  design (mirrors the repo's own `preview/index.html`). Not a missing font.

## Known render warns (expected — not new)
- `[FONT_REMOTE] "Inter"` — remote webfont import; loads at runtime.
- `[CSS_RUNTIME]`/`.d.ts parse check skipped — typescript not in node_modules` — the
  validator couldn't resolve `typescript`; non-blocking (a full `--no-render-check`
  parse run reported all `.d.ts` clean). Install `typescript` in repo node_modules
  to enable the in-line parse check.

## Re-sync risks (watch list)
- Generated CSS + `.d.ts` MUST be regenerated before the driver, or the bundle ships
  stale types / missing utilities. Steps 3–4 above are mandatory, not optional.
- Tailwind tree-shakes: utilities ship only if used by a component OR listed in
  `safelist.txt`. If the design agent needs more layout utilities in designs, extend
  `safelist.txt` and recompile — don't assume arbitrary Tailwind classes resolve.
- If `@base-ui/react` upgrades, re-check the `dtsPropsFor` bodies and the Select API
  (`items`/`defaultValue`) used in `previews/Select.tsx`.
- Brand dividers/borders are intentionally low-contrast ivory; a "thin/invisible
  separator" warning is expected, not a regression.
