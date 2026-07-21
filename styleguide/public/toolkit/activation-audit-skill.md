---
name: activation-audit
description: >-
  Bal's Activation Audit: the framework for diagnosing a B2B SaaS product's
  onboarding and activation. Load this whenever the work is auditing,
  scoring, or tearing down a product's onboarding flow, whether for a public
  LinkedIn teardown video (Mobbin screens of a well-known product) or for a
  client / ICP (the real product's screens). Triggers include "audit this
  product", "score this onboarding", "run the activation audit", "tear down
  [product]", "prep a teardown", "how good is [product]'s onboarding",
  "private audit before the call", even when the word "audit" isn't used but
  the task is clearly evaluating an onboarding flow against the framework.
  This skill holds no rubric of its own; it loads the canonical framework and
  production recipe live from Bal's vault so there is only ever one source to
  maintain.
---

# Activation Audit (Onboarding Loop)

This is a loader, not the rubric. The framework, scoring math, output
structure, and production recipe live in exactly one place, Bal's vault, so
there is nothing here to drift. When the task is auditing a product's
onboarding, this skill's job is to load the live framework before you start.

Bal's vault is the connected workspace folder, normally
`/Users/balsieber/Desktop/workspace`. All paths below are relative to it.

## Step 0: confirm the vault is connected, or stop

This skill only works when the vault is connected. Before doing anything,
read `onboarding-loop/playbooks/activation-audit.md`.

If that read fails (the folder isn't connected), do not run the audit from
memory and do not invent the rubric. Stop and tell Bal plainly: "Your vault
isn't connected, so I can't load the audit framework. Connect the workspace
folder and I'll run it." A loud stop is correct; a guessed rubric is not.

## Step 1: load the framework

Read `onboarding-loop/playbooks/activation-audit.md`. It is the single source
of truth and carries everything: the 11 rules across 3 sections, the scoring
math and tier thresholds, the weakest-link logic, the fix-selection logic,
the full output structure, the annotation/overlay rules, the voice
guidelines, the two production modes, and the past-audit reference list.
Apply it exactly. Do not restate or paraphrase the rubric from this file;
read the live one.

The voice memories (no em dashes, AI-tell blocklist, etc.) load via
MEMORY.md and apply to any words that go out in Bal's name.

## Step 2: pick the mode

The framework is identical in both; only the screen source and the
deliverable differ. Confirm which one before starting if it isn't obvious.

- **Public / Mobbin mode (reach).** A well-known product, for a public
  LinkedIn teardown video. Screens come from Mobbin (filter to onboarding,
  Download all at high-res; the Mobbin MCP connector only returns ~768px
  previews, so high-res comes from Mobbin's own Download). Deliverable is a
  per-screen video script plus the LinkedIn caption.
- **Client / ICP mode (precision or paid).** The real product. Screens come
  from the actual onboarding (client provides screenshots plus optional
  walkthrough and product description, or Bal captures them). Deliverable is
  usually the private written audit report, sometimes a call-prep summary.

## Step 3: run the audit

Score the screens against the 11 rules, compute the section scores and
overall, set the tier, find the weakest link, and derive the three
highest-impact fixes, all per the framework file. Reference the product by
name; never use the word "loop" in audit output.

## Step 4: produce the deliverable for the mode

- **Public mode:** write the per-screen script and caption. The script
  bookends with a short self-intro plus a score tease at the top and a CTA
  for the 2026 Activation Audit (audit.onboardingloop.com) at the end, fresh
  each time. Follow the production recipe in the framework file (Mobbin
  download-all, the chromeless slideshow with a live-audit final slide, Loom
  window plus camera, no drawn markup). Script lives in Apple Notes.
- **Client mode:** write the full audit report in the framework's output
  structure (score, diagnosis, why-this-matters, per-screen notes, three
  fixes, rule-by-rule, what-good-looks-like).

## Compose with bal-voice, don't restate it

Any words other people will read as Bal (the script, the caption, the
client report) are voice work. Let [[bal-voice]] carry the tone; this skill
carries the rubric and the process. They stack. Do not duplicate voice rules
here.
