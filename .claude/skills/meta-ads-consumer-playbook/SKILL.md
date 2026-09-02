---
name: meta-ads-consumer-playbook
description: Playbook for planning, writing, structuring, or reviewing paid Meta (Facebook/Instagram) ad campaigns aimed at consumers — covers 2026-era Advantage+ campaign structure, budget/scaling rules, creative-angle and hook-script frameworks, local/geo-radius targeting for delivery or service-area businesses, and retention/repeat-purchase strategy. Use this any time the user asks to build a Meta/Facebook/Instagram ad campaign, write ad copy or video hooks, set campaign structure or budgets, pick an audience or geo-radius, plan a creative test, or diagnose why a Meta campaign is underperforming for any client account — even if they just say "let's set up ads for [client]" or "what should our Facebook ads look like" without naming Meta explicitly. Always consult this before giving Meta ads advice to a client, since the platform's mechanics (Advantage+, Andromeda ranking) changed substantially in 2026 and pre-2026 conventional wisdom about manual audience targeting is now frequently wrong.
---

# Meta Ads Consumer Playbook

Meta's ranking system (Andromeda, generalized in 2026) now evaluates vastly more ad candidates per auction than it used to, and Advantage+ is the default flow for new campaigns. The practical upshot: **creative diversity is now the primary performance lever, not audience targeting.** An account with narrow, well-tuned interest targeting but one ad will consistently lose to an account with broad targeting and eight distinct creative angles. Every recommendation below follows from that shift.

Use this playbook whenever you're setting up a new client's Meta ads, writing creative for an existing account, or someone asks why a campaign isn't performing. Read the reference files for the deep detail — this file is the checklist and the reasoning.

## 1. Start with the client's actual situation

Before applying any rule below, get three things right, because they change everything downstream:

- **Is this a delivery/service-area business (local radius matters) or a nationwide e-commerce brand?** → see `references/local-and-retention.md` if local.
- **Does the business run on repeat/reorder purchases with no forced subscription, or is it mostly one-time/high-consideration?** → repeat-order businesses need a retention layer (see §5), not just acquisition.
- **What's the realistic daily budget?** Advantage+ needs roughly 50 conversion events per week per ad set to exit the learning phase. Below ~$100/day, most consumer accounts never leave learning and every metric will look noisy and bad — say so up front rather than letting a client judge results from an underfunded test.

## 2. Campaign structure: Test → Scale → Challenger

Don't dump five untested creatives into one Advantage+ campaign and hope. Use a three-stage structure so a new, unproven idea never drags down a campaign that's already working:

1. **Test campaign** — small daily budget, one ad per ad set, several distinct creative *angles* (not just visual variants of one angle). Goal is to find which angles even work, not to optimize spend efficiency yet.
2. **Core scale campaign** — an Advantage+ Shopping/Sales campaign holding only creative that's already proven itself in Test. This is where most of the budget lives.
3. **Challenger campaign** — a small parallel Advantage+ campaign for new creative that hasn't earned a spot in Core yet. When something in Challenger beats the Core average on your pre-defined winner metric, promote it into Core; retire the weakest Core ad to make room.

This gives you continuous creative refresh without ever risking the stable campaign's learning phase. See `references/budget-and-testing.md` for exact budget levels and the scaling cadence.

**Never edit a live, spending ad set's creative, budget, or audience mid-flight** — each edit resets its learning phase and throws away the signal it had accumulated. Duplicate the ad set instead if you want to test a change.

## 3. Creative: angles first, then hooks, then polish

**Angles before variants.** For any offer, write 3–5 genuinely different *angles* — different pain points, different customer awareness levels, different emotional hooks — before making visual variations of any single one. A client who says "just make a few versions of this ad" usually means variants; push for angles instead, because Andromeda needs distinct options to match message to viewer intent, not five paintjobs on the same message. `references/creative-angles-and-hooks.md` has the awareness-level framework and an angle worksheet.

**Format defaults for 2026, not absolutes:**
- Reels is the highest-reach placement — always include a vertical, full-screen-native version of every video ad.
- Raw, phone-shot, UGC-style video reliably beats polished studio video on cost-per-result, especially for local and everyday-consumer brands. It reads as a post, not an ad. Default to this look unless the brand has a specific reason to look premium/produced.
- For process content (making something, building something, preparing something), show the process — it holds watch time far better than a static finished-product shot.
- Don't assume video always wins: for pure direct-response with a clear, simple offer, a static image with bold offer text and a CTA can outconvert video because it gets to the point in zero seconds.
- If the brand's organic Instagram/Facebook posts already have engagement, run the existing post as an ad (via its post ID) instead of only building fresh ad units — it carries its social proof and comment count into the ad unit.

**The hook is the single highest-leverage 3 seconds in the ad.** Use the Hook → Value/Validation → Body → CTA structure for every video script. Never say the brand name in the first second — it's the fastest way to signal "advertisement" and get scrolled past. Full formula, a hook-line bank, and target hook-rate/hold-rate benchmarks are in `references/creative-angles-and-hooks.md`.

**Fight fatigue with volume.** One ad, or even one hook, is not a testing plan in 2026 — accounts that hold up over months are cycling through many hook variations against the same underlying angles. Budget creative production accordingly; this is now a content-volume game, not a one-shot production.

**Decide the winner metric before you launch the test**, not after you see results (post-hoc "this one looks better" reasoning is how accounts end up scaling the wrong ad). Pick one primary metric (usually CPA or ROAS, sometimes hook rate for a pure-awareness test) and a threshold, write it down, then launch.

## 4. Offers and copy

- Write distinct copy for different awareness levels (someone who's never heard of the problem vs. someone comparing solutions vs. someone who already knows the brand) rather than one generic ad for everyone — see the worksheet in `references/creative-angles-and-hooks.md`.
- Always run a limited-time/urgency variant of an offer alongside the evergreen version and let the data decide; urgency copy frequently outperforms by a wide margin, but not universally, so test it rather than assuming.

## 5. Local, geo-radius, and delivery-area businesses

If the client has a physical service area (restaurant, meal delivery, home services, any brick-and-mortar with a delivery or service radius), don't just turn on a broad Advantage+ Audience and walk away — a tight geo-radius often doesn't give Advantage+'s AI enough room to explore, and it can silently over-deliver outside your radius if you're not watching the location breakdown. Layer a dedicated geo+interest ad set, use "living in" rather than "living in or recently in" to avoid paying for commuters and travelers, and anchor creative with local landmarks/neighborhood names. Full radius guidance by business category is in `references/local-and-retention.md`.

## 6. Retention: the layer most accounts skip

If the client's model is repeat/reorder without a forced subscription (most local food, meal delivery, and consumer-goods repeat-purchase businesses), a warm retargeting campaign to past purchasers — new menu items, seasonal offers, simple "time to reorder" reminders — is usually underinvested relative to cold acquisition, and it's cheap, high-intent traffic. Set this up as its own campaign, not an afterthought inside the acquisition budget. If there's a product catalog/feed, use dynamic catalog ads here so returning visitors see relevant items automatically. Details in `references/local-and-retention.md`.

## 7. Where Meta fits vs. other platforms

Meta wins for direct response, warm-audience conversion, and fast iterative creative testing. If a client asks about YouTube or Google as well, frame it accurately: those platforms are comparatively stronger for upper-funnel brand awareness and research-phase product education, not for driving today's purchase — don't let a client redirect a direct-response budget there expecting Meta-like CPAs.

## Reference files

- `references/creative-angles-and-hooks.md` — awareness-level framework, angle worksheet, Hook-Value-Body-CTA formula, hook-line bank, hook-rate/hold-rate benchmarks.
- `references/budget-and-testing.md` — budget minimums by stage, scaling-cadence rules, the Test→Scale→Challenger mechanics in detail, defining winner criteria.
- `references/local-and-retention.md` — geo-radius ranges by business category, location-setting pitfalls, retention/catalog campaign setup.
