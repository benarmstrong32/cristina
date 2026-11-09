# At Her Pace: brand video kit

## What the brand is (from atherpace.org)

- **What it is:** A free, independent directory of domestic violence resources for all 50 states and DC. It "centers women navigating abuse" and welcomes anyone who finds the resources useful.
- **Core promise:** *Find support. At your pace.* There is no timeline and no pressure. You don't need a label or a story, and you don't have to be ready to leave.
- **Voice:** Calm, permission-giving, second person, and plain. Short sentences in pairs: "You can look. You can pause. You can come back."
- **Look:** Soft watercolor illustration in sage, cream, peach and rust. It uses Georgia/serif headlines with an italic rust accent. The site labels its imagery as illustration, not photographs of service users.
- **Safety-first design:** Quick-exit button, a neutral page title ("Resource guide"), no location requests, no forms, and no saved selections.

The video has to carry the same safety-first approach as the site.

## Safety and creative guardrails (non-negotiable)

1. **Never depict abuse.** No bruises, raised hands, crying, slammed doors, phones being snatched, shadowy men or other trauma imagery. The brand sells calm and choice, not fear.
2. **Illustration, not realistic people.** Keep the watercolor style. Don't use photoreal AI "survivors" or AI faces presented as real clients, and don't add testimonials.
3. **Muted-first.** All meaning must be in the on-screen captions. Many viewers watch silently, and some are near a person who monitors them.
4. **Soft cover.** The first frames show a garden path, so a glance at a shared screen doesn't announce "domestic violence". The word appears only in the end-card hotline line.
5. **Accurate claims only.** The directory is free to access. Services are not promised to be free, available, or confidential. Never say "safe", "anonymous" or "untraceable" about the viewer's browsing.
6. **Always include the 24/7 Hotline** on the end card: 800-799-7233, or text START to 88788.

## The cut that's built (`out/at-her-pace-reel.mp4`, `out/at-her-pace-square.mp4`)

32 seconds. 9:16 for Reels, Stories and TikTok, and 1:1 for the feed. No audio track. Rebuild with `python3 video/render.py` (add `--square` for 1:1).

| Time | Visual | On-screen text |
|---|---|---|
| 0–6s | Garden path, slow push-in | You don't have to / *know what to call it.* |
| 6–11.5s | Path drifts toward the horizon | Or what / *comes next.* |
| 11.5–18.5s | Three women talking on a garden bench, slow pan | Support starts with / *being heard.* |
| 18.5–25s | Path into sunrise | You can look. → You can pause. / *You can come back.* |
| 25–32s | Paper end card + logo | Find support. / *At your pace.* · Free resources in all 50 states + DC. No personal story required. · **atherpace.org** · 24/7 Hotline: Call 800-799-7233 · Text START to 88788 |

## Optional voiceover (warm, unhurried female voice, ~75 wpm)

> You don't have to know what to call it. Or what comes next.
> Support starts with being heard.
> You can look. You can pause. You can come back.
> At Her Pace. Free resources in every state. Find support, at your pace.

If you use an AI voice (e.g. ElevenLabs), pick a calm, mid-low voice with no "ad read" energy. Leave long pauses between lines. Under it, use soft piano or ambient strings at about -24 LUFS, from a licensed library.

## Prompts for AI video generators (Veo, Sora, Runway, Kling)

Use these to make extra B-roll in the same style. Attach `site/images/garden-path.jpg` or `women-garden.jpg` as the **style/first-frame reference** for each.

**Style suffix to append to every prompt:**
> soft hand-painted watercolor illustration, cream paper texture, muted sage green, warm peach and dusty rust accents, gentle morning light, calm and unhurried, slow camera movement, no text, no logos, illustrated not photorealistic

1. **Path reveal:** "Slow forward dolly along a winding stone garden path through wildflowers toward rolling hills at sunrise; petals drift gently in a light breeze."
2. **Opening flower:** "Extreme close-up of a single pale peach blossom slowly opening, soft focus leaves behind it, dew catching the light."
3. **Gate:** "A weathered wooden garden gate, slightly open, swaying gently; warm light and a flowering path beyond it; camera slowly pushes toward the opening."
4. **Bench conversation:** "Three women of different ages and backgrounds sitting on a low stone garden wall, listening to each other, relaxed and attentive; gentle head nods; leaves moving softly in the foreground." (Keep faces non-specific. Do not prompt for tears or distress.)
5. **Window light:** "A cup of tea on a windowsill beside a small potted plant, morning light slowly moving across the sill, curtains stirring."
6. **Map of the US in watercolor:** "Soft watercolor map of the United States with small flowers blooming one by one across each state, cream paper background." (This visualizes "all 50 states + DC".)

**Negative prompt / avoid:** violence, injury, bruises, crying, dark shadows, men looming, phones, police, sirens, hospitals, photorealism, text artifacts, distorted hands.

## Ad copy to pair with it (Meta)

- **Primary text:** You don't have to know what to call it, or be ready to decide anything. At Her Pace is a free directory of support in every state. No forms. No personal story required.
- **Headline:** Find support. At your pace.
- **CTA button:** Learn More → https://atherpace.org

Meta treats domestic violence ads as a sensitive category. Avoid copy that implies you know the viewer's situation (e.g. "Are you being abused?"), because that violates Meta's personal-attributes policy. The copy above is written to stay clear of that.
