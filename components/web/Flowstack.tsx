/* ============================================================
   Flowstack — the LEFT panel markup ("the agent does the work"): the rolling
   two-step window of step cards, connectors and card-outline draws. PORTED
   VERBATIM from protocol-stack/index.html (the `.flowcol` subtree, lines
   2222-2389): same ids, classes, inline SVGs and copy, so the ported CSS +
   flowstack-engine drive it exactly as the vanilla page. Only SVG attributes
   were camelCased for JSX and the repeated glyphs factored into local atoms
   (identical output). The engine (flowstack-engine.ts) mutates this subtree by
   id; do not rename ids.
   ============================================================ */
import * as React from "react"

/* ---- inline glyphs (verbatim paths) ---- */
const RouteIcon = () => (
  <svg className="icon" viewBox="0 0 20 20" fill="none">
    <path
      d="M2.5 2.5V11C2.5 12.4001 2.5 13.1002 2.77248 13.635C3.01217 14.1054 3.39462 14.4878 3.86502 14.7275C4.3998 15 5.09987 15 6.5 15H12.5M12.5 15C12.5 16.3807 13.6193 17.5 15 17.5C16.3807 17.5 17.5 16.3807 17.5 15C17.5 13.6193 16.3807 12.5 15 12.5C13.6193 12.5 12.5 13.6193 12.5 15ZM2.5 6.66667L12.5 6.66667M12.5 6.66667C12.5 8.04738 13.6193 9.16667 15 9.16667C16.3807 9.16667 17.5 8.04738 17.5 6.66667C17.5 5.28595 16.3807 4.16667 15 4.16667C13.6193 4.16667 12.5 5.28596 12.5 6.66667Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
const MagicIcon = () => (
  <svg className="icon" viewBox="0 0 24 24" fill="none">
    <path
      d="M16 8V5L19 2L20 4L22 5L19 8H16ZM16 8L12 11.9999M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2M17 12C17 14.7614 14.7614 17 12 17C9.23858 17 7 14.7614 7 12C7 9.23858 9.23858 7 12 7"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
const CheckCircleIcon = () => (
  <svg className="icon" viewBox="0 0 16 16" fill="none">
    <path
      d="M14.6667 7.39048V8.00382C14.6658 9.44143 14.2003 10.8403 13.3396 11.9917C12.4788 13.1431 11.2689 13.9855 9.89024 14.3931C8.51162 14.8007 7.03817 14.7517 5.68965 14.2535C4.34112 13.7553 3.18977 12.8345 2.40731 11.6285C1.62484 10.4225 1.25319 8.99586 1.34778 7.56136C1.44237 6.12686 1.99814 4.76137 2.93219 3.66853C3.86624 2.5757 5.12852 1.81407 6.53079 1.49725C7.93306 1.18042 9.40018 1.32537 10.7133 1.91048M14.6667 2.66667L8 9.34L6 7.34"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
const LightningIcon = () => (
  <svg className="icon" viewBox="0 0 16 16" fill="none">
    <path
      d="M8.66667 1.33334L2.72904 8.45849C2.49647 8.73758 2.38019 8.87712 2.37841 8.99497C2.37686 9.09742 2.42252 9.19488 2.50224 9.25927C2.59393 9.33334 2.77557 9.33334 3.13885 9.33334H8L7.33333 14.6667L13.271 7.54152C13.5035 7.26243 13.6198 7.12288 13.6216 7.00504C13.6231 6.90259 13.5775 6.80513 13.4978 6.74074C13.4061 6.66667 13.2244 6.66667 12.8611 6.66667H8L8.66667 1.33334Z"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
)
const CogIcon = ({ cls, sw }: { cls: string; sw: number }) => (
  <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
)

const TabRow = ({ n }: { n: number }) => (
  <div className="tabrow">
    <div className="tab bel slidex">
      <RouteIcon />
      <span className="lbl">Step {n}:</span>
    </div>
    <div className="badges bel slidex">
      <span className="ala-badge done">
        <CheckCircleIcon />
        Completed
      </span>
      <span className="ala-badge trig">
        <LightningIcon />
        Triggered
      </span>
      <span className="ala-badge pend">Pending</span>
    </div>
  </div>
)

const Cardline = ({ id }: { id: string }) => (
  <svg className="cardline" id={id} aria-hidden="true">
    <path className="cl-b" />
    <path className="cl-g" />
    <circle className="cl-head" r="3.5" />
  </svg>
)

const Connector = ({ blk, line, arrow, chip, label }: { blk: string; line: string; arrow: string; chip: string; label: string }) => (
  <div className="blk conn" id={blk}>
    <div className="connrow">
      <svg width="334" height="64" viewBox="0 0 334 64">
        <path className="gray-line" d="M167,0 L167,98" />
        <path className="draw" id={line} pathLength="100" d="M167,0 L167,98" />
        <path className="arrow green" id={arrow} d="M160.5,91 L167,98 L173.5,91" />
      </svg>
      <span className="connchip" id={chip}>
        {label}
      </span>
    </div>
  </div>
)

const QOpt = ({ id, label }: { id: string; label: string }) => (
  <div className="qopt bel2" id={id}>
    <span className="ck" aria-hidden="true">
      <svg className="cko" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="10" cy="10" r="7.25" />
      </svg>
      <svg className="ckx" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="10" cy="10" r="7.25" />
        <path d="M6.4 10.2 L9 12.7 L13.7 7.3" />
      </svg>
    </span>
    {label}
  </div>
)

export function Flowstack() {
  return (
    <div className="flowcol">
      <p className="ala-panel-label">The agent does the work.</p>
      <div className="flowlane">
        <div className="flowstack" id="flowstack">
          {/* STEP 1 */}
          <div className="blk" id="blk-s1">
            <div className="step" id="s1">
              <TabRow n={1} />
              <div className="ala-card">
                <div className="titlerow">
                  <div className="titleleft bel">
                    <MagicIcon />
                    <h3>Ask setup intent</h3>
                  </div>
                  <span className="typechip bel">Question</span>
                </div>
                <div className="divider bel growx" />
                <p className="bel">In-app question: 'What kind of work is this?'</p>
                <div className="qbody bel" id="s1qbody">
                  <div className="qstate compose hide" id="s1compose">
                    <span className="pencilslot" aria-hidden="true">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17 3a2.83 2.83 0 0 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" />
                      </svg>
                    </span>
                    Preparing question…
                  </div>
                  <div className="qstate opts hide" id="s1opts">
                    <QOpt id="qoptA" label="Client work" />
                    <QOpt id="qoptB" label="Internal team" />
                    <QOpt id="qoptC" label="Just exploring" />
                  </div>
                </div>
              </div>
              <div className="dotwrap">
                <span className="ala-dot" />
              </div>
              <Cardline id="s1line" />
            </div>
          </div>

          <Connector blk="blk-c1" line="line1" arrow="arrow1" chip="chip1" label="Answered" />

          {/* STEP 2 */}
          <div className="blk" id="blk-s2">
            <div className="step" id="s2">
              <TabRow n={2} />
              <div className="ala-card">
                <div className="titlerow">
                  <div className="titleleft bel">
                    <MagicIcon />
                    <h3>Build the workspace</h3>
                  </div>
                  <span className="typechip bel">Action</span>
                </div>
                <div className="divider bel growx" />
                <div className="bodyswap bel">
                  <div className="bstate" id="s2wait">
                    <p>Runs when the answer comes in.</p>
                  </div>
                  <div className="bstate hide" id="s2proc">
                    <div className="procrow">
                      <span className="cogs" aria-hidden="true">
                        <CogIcon cls="cog-a" sw={1.6} />
                        <CogIcon cls="cog-b" sw={1.9} />
                      </span>
                      <p>Processing answer…</p>
                    </div>
                  </div>
                  <div className="bstate hide" id="s2build">
                    <div className="progresswrap">
                      <div className="progresstitle">
                        <b id="s2label">Building project</b>
                        <span id="s2pct">0% complete</span>
                      </div>
                      <div className="pbar">
                        <i id="s2bar" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="dotwrap">
                <span className="ala-dot" />
              </div>
              <Cardline id="s2line" />
            </div>
          </div>

          <Connector blk="blk-c2" line="line2" arrow="arrow2" chip="chip2" label="Built" />

          {/* STEP 3 — terminal (no exit node) */}
          <div className="blk" id="blk-s3">
            <div className="step step--terminal" id="s3">
              <TabRow n={3} />
              <div className="ala-card">
                <div className="titlerow">
                  <div className="titleleft bel">
                    <MagicIcon />
                    <h3>Ask to add team</h3>
                  </div>
                  <span className="typechip bel">Question</span>
                </div>
                <div className="divider bel growx" />
                <p className="bel">In-app question: 'Want to add a teammate?'</p>
                <div className="workrow bel" id="s3work">
                  <span className="wk await hide" id="s3await">
                    <span className="dots" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                    </span>
                    Awaiting response…
                  </span>
                </div>
              </div>
              <div className="dotwrap">
                <span className="ala-dot" />
              </div>
              <Cardline id="s3line" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
