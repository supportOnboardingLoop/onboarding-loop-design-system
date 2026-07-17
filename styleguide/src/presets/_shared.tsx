import * as React from "react"

import { Choices } from "@/components/product/choices"
import type { DemoPreset } from "./types"

// The standard scripted AGENT reply shared by every preset: think, offer three
// lettered choices, then acknowledge the pick. The renderer already emitted the
// user turn (with attachments), so respond does NOT clear or echo the user.
// Presets differ only in the intro line + the three options.
export function choiceConversation(
  intro: string,
  options: { value: string; label: string }[]
): DemoPreset["conversation"] {
  return {
    respond: (api) => {
      api
        .think(intro, { loops: 1 })
        .then(() =>
          api.ask((done) => (
            <Choices
              options={options}
              onValueChange={(v) => done(options.find((o) => o.value === v)?.label ?? v)}
            />
          ))
        )
        .then((echo) => {
          if (echo) api.think("Got it, let me pull that together for you.", { loops: 1 })
        })
    },
  }
}
