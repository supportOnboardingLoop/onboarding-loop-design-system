/* ============================================================
   SystemGraphic — the "loop levels" visual: four isometric cubes stacked (Cue,
   Action, Reward, Habit loop), a colour-matched label glued to each, joined by
   dashed downward arrows. The cubes/labels/arrows all read --spread (set by the
   section's scroll scrub) through the identical (1.5 - --si)*--spread offset, so
   they fan out and tighten in lockstep. The cube SVG is kept as raw markup
   (verbatim from the source) so the exact geometry + per-cube --si survive.
   ============================================================ */
import * as React from "react"

// four cubes, bottom (si 0, grey) to top (si 3, gold); dashed inner facets at 0.6 opacity
const BLOCKS = `
<g class="sblk" style="--si:0">
  <path d="M8.47133 238.863L70.5964 208.416C71.8119 207.821 73.1471 207.513 74.5001 207.513C75.8531 207.513 77.1882 207.821 78.4038 208.416L140.529 238.863C143.469 240.302 145.322 243.232 145.322 246.438V270.688C145.322 273.889 143.469 276.824 140.529 278.263L78.4094 308.705C77.1939 309.299 75.8587 309.608 74.5057 309.608C73.1527 309.608 71.8176 309.299 70.602 308.705L8.47133 278.263C7.04208 277.576 5.83481 276.501 4.98728 275.16C4.13975 273.82 3.6861 272.268 3.6781 270.682V246.438C3.6781 243.232 5.5308 240.302 8.47133 238.863Z" fill="#838383" stroke="black" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <g opacity="0.6"><path d="M6.51099 241.888L74.5001 276.268L142.489 241.882M74.5001 308.84V276.279" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="4 4"/></g>
</g>
<g class="sblk" style="--si:1">
  <path d="M8.47133 170.863L70.5964 140.416C71.8119 139.821 73.1471 139.513 74.5001 139.513C75.8531 139.513 77.1882 139.821 78.4038 140.416L140.529 170.863C143.469 172.302 145.322 175.232 145.322 178.438V202.688C145.322 205.889 143.469 208.824 140.529 210.263L78.4094 240.705C77.1939 241.299 75.8587 241.608 74.5057 241.608C73.1527 241.608 71.8176 241.299 70.602 240.705L8.47133 210.263C7.04208 209.576 5.83481 208.501 4.98728 207.16C4.13975 205.82 3.6861 204.268 3.6781 202.682V178.438C3.6781 175.232 5.5308 172.302 8.47133 170.863Z" fill="#F0744B" stroke="black" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <g opacity="0.6"><path d="M6.51099 173.888L74.5001 208.268L142.489 173.882M74.5001 240.84V208.279" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="4 4"/></g>
</g>
<g class="sblk" style="--si:2">
  <path d="M8.47133 102.863L70.5964 72.4156C71.8119 71.8214 73.1471 71.5126 74.5001 71.5126C75.8531 71.5126 77.1882 71.8214 78.4038 72.4156L140.529 102.863C143.469 104.302 145.322 107.232 145.322 110.438V134.688C145.322 137.889 143.469 140.824 140.529 142.263L78.4094 172.705C77.1939 173.299 75.8587 173.608 74.5057 173.608C73.1527 173.608 71.8176 173.299 70.602 172.705L8.47133 142.263C7.04208 141.576 5.83481 140.501 4.98728 139.16C4.13975 137.82 3.6861 136.268 3.6781 134.682V110.438C3.6781 107.232 5.5308 104.302 8.47133 102.863Z" fill="#F59552" stroke="black" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <g opacity="0.6"><path d="M6.51099 105.888L74.5001 140.268L142.489 105.882M74.5001 172.84V140.279" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="4 4"/></g>
</g>
<g class="sblk" style="--si:3">
  <path d="M8.47133 34.6347L70.5907 4.18692C71.8062 3.59277 73.1414 3.28394 74.4944 3.28394C75.8474 3.28394 77.1825 3.59277 78.3981 4.18692L140.523 34.6347C143.464 36.0738 145.316 39.003 145.316 42.2098V66.4592C145.316 69.6604 143.464 72.5953 140.523 74.0344L78.4094 104.476C77.1939 105.071 75.8587 105.379 74.5057 105.379C73.1527 105.379 71.8176 105.071 70.602 104.476L8.47133 74.0344C7.04295 73.3475 5.83625 72.2733 4.98878 70.9339C4.14131 69.5946 3.68716 68.0441 3.6781 66.4592V42.2098C3.6781 39.003 5.5308 36.0738 8.47133 34.6347Z" fill="#EDC77F" stroke="black" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
  <g opacity="0.6"><path d="M6.51099 37.6672L74.5001 72.0527L142.489 37.6672M74.5001 104.625V72.0697" stroke="black" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="4 4"/></g>
</g>
`

// labels glued to each cube centre (--cy), coloured to its cube; --si drives the lockstep offset
const LABELS = [
  { cy: "45.1px", si: 3, color: "#edc77f", text: "Cue" },
  { cy: "113.3px", si: 2, color: "#f59552", text: "Action" },
  { cy: "181.3px", si: 1, color: "#f0744b", text: "Reward" },
  { cy: "249.3px", si: 0, color: "#838383", text: "Habit loop" },
]
// arrows descend from each label to the next, coloured by the source label
const ARROWS = [
  { cy: "45.1px", si: 3, ac: "#edc77f" },
  { cy: "113.3px", si: 2, ac: "#f59552" },
  { cy: "181.3px", si: 1, ac: "#f0744b" },
]

export function SystemGraphic({ ref }: { ref?: React.Ref<HTMLDivElement> }) {
  return (
    <div className="sys-graphic" ref={ref}>
      {ARROWS.map((a, i) => (
        <span key={i} className="sys-arrow" style={{ "--cy": a.cy, "--si": a.si, "--ac": a.ac } as React.CSSProperties} />
      ))}
      {LABELS.map((l, i) => (
        <span key={i} className="sys-label" style={{ "--cy": l.cy, "--si": l.si, color: l.color } as React.CSSProperties}>
          {l.text}
        </span>
      ))}
      <svg
        className="system-blocks"
        width="149"
        height="314"
        viewBox="0 0 149 314"
        fill="none"
        role="img"
        aria-label="Stacked loop levels"
        dangerouslySetInnerHTML={{ __html: BLOCKS }}
      />
    </div>
  )
}
