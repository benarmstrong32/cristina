# Budget, structure, and testing mechanics

## Why structure matters more than it used to

Since Meta unified the manual and Advantage+ campaign flows (Feb 2026), AI-driven optimization is the default for every new campaign, and it needs both budget and creative volume to work with. Underfeed it on either axis and you get noisy, unreliable results that look like "Meta doesn't work for us" but are actually "we never gave the system enough to learn from."

## Budget minimums and cadence

- **Learning-phase floor:** a rule of thumb is roughly 50 conversion events per ad set per week to exit the learning phase reliably. For most small/medium consumer accounts this means a practical minimum around **$100/day** per active Advantage+ campaign — below that, expect volatile CPAs for weeks, not days.
- **Recommended starting range** for a small-to-medium consumer brand: **$150–300/day** split across the Test and Core campaigns described below.
- **Scaling cadence:** increase budget in increments of **no more than ~20% every 3–4 days**. Bigger or more frequent jumps reset the learning phase and you lose the stability you just built.
- **Never edit a live ad set's creative, budget, or audience mid-flight.** Every one of those resets learning. If you want to change something on a spending ad set, duplicate it with the change and let the new one learn in parallel, then pause the old one once the new one is stable — don't edit in place.
- Feed the system clean data: Conversions API plus deduplicated Pixel events matter more under Advantage+ than they used to, because the targeting AI reads directly off that signal. Broken or duplicated event tracking quietly caps performance in a way that's easy to miss — check event match quality and dedup status before troubleshooting anything else.

## Test → Scale → Challenger, in detail

**Stage 1 — Test campaign**
- Purpose: find which creative *angles* work at all, cheaply, before committing real budget.
- Structure: one ad per ad set, small daily budget per ad set (enough to get meaningful data, not enough to hurt if it fails — a few multiples of target CPA is a reasonable floor).
- Duration: run until each ad set has enough spend/conversions to judge against your pre-set winner metric — resist calling it early.
- Output: a short list of angles (not just single ads) that clear the bar.

**Stage 2 — Core scale campaign**
- Purpose: where the real budget lives, running only creative that already proved itself in Test.
- Structure: Advantage+ Shopping/Sales campaign, budget scaled per the cadence above.
- This campaign should feel boring — it's not where you experiment.

**Stage 3 — Challenger campaign**
- Purpose: keep a pipeline of new creative moving without ever putting the Core campaign's stability at risk.
- Structure: a smaller, parallel Advantage+ campaign holding new creative that hasn't earned a Core slot yet.
- Promotion rule: when a Challenger ad beats the Core campaign's average on your primary metric over a real sample size, promote it into Core and retire the weakest current Core ad. This keeps Core's creative roster rotating without a single risky in-place edit.

## Defining a winner before you test

Pick, in writing, before launch:
1. The single primary metric (CPA and ROAS are the usual defaults for direct response; hook rate or CPM can be the right call for a pure top-of-funnel/awareness test).
2. The threshold that counts as a pass.
3. The minimum spend or conversion count before a result counts as real, not noise.

Skipping this step is how accounts end up scaling whichever ad the team liked best rather than the one the data actually supports.
