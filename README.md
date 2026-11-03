# Cristina — Remotion video edits

Animated videos written in React with [Remotion](https://www.remotion.dev).

## Setup (once)

```bash
npm install
```

## Edit with live preview

```bash
npm run dev
```

Opens Remotion Studio in your browser. Edit files in `src/` and the preview updates live.

## Render to MP4

```bash
npm run render            # 1920x1080 -> out/hello-edit.mp4
npm run render:vertical   # 1080x1920 (Reels/TikTok) -> out/vertical-promo.mp4
```

## Where things live

- `src/Root.tsx` — list of compositions (size, fps, length, default text)
- `src/HelloEdit.tsx` — the starter animation (word pop-in, gradient, fade out)
- `public/` — drop images, video clips, music here; use with `staticFile("name.mp4")`

Note: Remotion is free for individuals and small companies (≤3 people); larger companies need a company license — see remotion.dev/license.
