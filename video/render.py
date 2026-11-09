"""Render the At Her Pace brand video from the site's own watercolor artwork.

Usage:  python3 video/render.py [--square]
Output: video/out/at-her-pace-reel.mp4 (1080x1920) or -square.mp4 (1080x1080)

Frames are drawn with Pillow and piped to ffmpeg. No audio track is added:
the cut is caption-led so it works muted (the way most people watch, and the
safer way for someone whose phone may be watched). Add licensed music or the
voiceover in video/SCRIPT.md in an editor if wanted.
"""
import math
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent
IMG = ROOT.parent / "site" / "images"
SQUARE = "--square" in sys.argv
W, H = (1080, 1080) if SQUARE else (1080, 1920)
FPS = 30
OUT = ROOT / "out" / ("at-her-pace-square.mp4" if SQUARE else "at-her-pace-reel.mp4")

INK = (69, 77, 58)
RUST = (138, 82, 55)
PAPER = (252, 249, 242)
MUTED = (89, 99, 79)

def font(size, italic=False, weight=b"Regular"):
    f = ImageFont.truetype(str(ROOT / "fonts" / ("Lora-Italic.ttf" if italic else "Lora.ttf")), size)
    f.set_variation_by_axes([{b"Regular": 400, b"Medium": 500, b"SemiBold": 600, b"Bold": 700}[weight]])
    return f

path_img = Image.open(IMG / "garden-path.jpg").convert("RGB")
women_img = Image.open(IMG / "women-garden.jpg").convert("RGB")
logo = Image.open(IMG / "logo.png").convert("RGBA")

def ease(t):
    t = max(0.0, min(1.0, t))
    return t * t * (3 - 2 * t)

def ken_burns(img, t, z0, z1, c0, c1):
    """Crop a W:H window from img. z = window height as fraction of image
    height; c = window centre (fx, fy) in 0..1. Interpolated by t."""
    e = ease(t)
    z = z0 + (z1 - z0) * e
    cx = c0[0] + (c1[0] - c0[0]) * e
    cy = c0[1] + (c1[1] - c0[1]) * e
    iw, ih = img.size
    ch = ih * z
    cw = ch * W / H
    if cw > iw:  # window wider than image: shrink both
        cw = iw
        ch = cw * H / W
    x = min(max(cx * iw - cw / 2, 0), iw - cw)
    y = min(max(cy * ih - ch / 2, 0), ih - ch)
    return img.resize((W, H), Image.LANCZOS, box=(x, y, x + cw, y + ch))

def paper_wash(frame, top, bottom, strength=0.82):
    """Soft paper-coloured gradient band behind text so it stays legible."""
    band = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(band)
    mid = (top + bottom) / 2
    half = (bottom - top) / 2
    for y in range(max(0, int(top - half)), min(H, int(bottom + half))):
        a = max(0.0, 1 - abs(y - mid) / (half * 1.6))
        d.line([(0, y), (W, y)], fill=PAPER + (int(255 * strength * min(1, a * 1.4)),))
    frame.alpha_composite(band)

def text_block(frame, lines, cy, alpha, rise=0):
    """lines: list of (text, font, colour). Centred block around cy."""
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(layer)
    heights = []
    for txt, f, _ in lines:
        b = d.textbbox((0, 0), txt, font=f)
        heights.append(int(f.size * 1.28))
    y = cy - sum(heights) / 2 + rise
    for (txt, f, col), h in zip(lines, heights):
        tw = d.textlength(txt, font=f)
        d.text(((W - tw) / 2, y), txt, font=f, fill=col + (int(255 * alpha),))
        y += h
    frame.alpha_composite(layer)

def fade(t, start, end, fin=0.6, fout=0.6):
    if t < start or t > end:
        return 0.0
    return ease(min((t - start) / fin, (end - t) / fout, 1.0))

S = 1.0 if not SQUARE else 0.82  # type scale
BIG = font(int(84 * S), weight=b"Medium")
BIG_I = font(int(84 * S), italic=True, weight=b"Medium")
MED = font(int(58 * S))
MED_I = font(int(58 * S), italic=True)
SMALL = font(int(38 * S))
TINY = font(int(34 * S))

TEXT_Y = int(H * (0.25 if not SQUARE else 0.22))

# (start, end, background fn, captions)
SCENES = [
    (0.0, 6.0, lambda t: ken_burns(path_img, t, 1.0, 0.80, (0.30, 0.5), (0.55, 0.6)),
     [(0.4, 5.6, [("You don't have to", MED, INK), ("know what to call it.", MED_I, RUST)])]),
    (6.0, 11.5, lambda t: ken_burns(path_img, t, 0.80, 0.62, (0.55, 0.6), (0.72, 0.55)),
     [(6.3, 11.2, [("Or what", MED, INK), ("comes next.", MED_I, RUST)])]),
    (11.5, 18.5, lambda t: ken_burns(women_img, t, 1.0, 0.92, (0.25, 0.5), (0.72, 0.5)),
     [(11.9, 18.1, [("Support starts with", MED, INK), ("being heard.", MED_I, RUST)], 0.80)]),
    (18.5, 25.0, lambda t: ken_burns(path_img, t, 0.70, 0.55, (0.62, 0.5), (0.76, 0.45)),
     [(18.8, 21.4, [("You can look.", BIG, INK)]),
      (21.5, 24.3, [("You can pause.", BIG, INK), ("You can come back.", BIG_I, RUST)])]),
]
END_START, END = 25.0, 32.0

def end_card(t):
    frame = Image.new("RGBA", (W, H), PAPER + (255,))
    a = ease((t - END_START) / 0.8)
    lw = int(W * (0.78 if not SQUARE else 0.58))
    lg = logo.resize((lw, int(logo.height * lw / logo.width)), Image.LANCZOS)
    lg.putalpha(lg.getchannel("A").point(lambda v: int(v * a)))
    ly = int(H * (0.24 if not SQUARE else 0.08))
    frame.alpha_composite(lg, ((W - lw) // 2, ly))
    b = ease((t - END_START - 0.7) / 0.8)
    cy = ly + lg.height + int(170 * S)
    text_block(frame, [("Find support.", BIG, INK), ("At your pace.", BIG_I, RUST)], cy, b)
    c = ease((t - END_START - 1.5) / 0.8)
    cy2 = cy + int(250 * S)
    text_block(frame, [("Free resources in all 50 states + DC.", SMALL, MUTED),
                       ("No personal story required.", SMALL, MUTED)], cy2, c)
    text_block(frame, [("atherpace.org", font(int(60 * S), weight=b"SemiBold"), INK)], cy2 + int(170 * S), c)
    d = ease((t - END_START - 2.3) / 0.8)
    text_block(frame, [("24/7 National Domestic Violence Hotline", TINY, MUTED),
                       ("Call 800-799-7233  ·  Text START to 88788", TINY, MUTED)],
               H - int(H * (0.11 if not SQUARE else 0.09)), d)
    return frame

def frame_at(t):
    if t >= END_START - 0.7:
        base = None
        for s, e, bg, caps in SCENES:
            if s <= t < e:
                base = bg((t - s) / (e - s)).convert("RGBA")
        if base is not None:  # crossfade last scene into the end card
            k = ease((t - (END_START - 0.7)) / 0.7)
            return Image.blend(base, Image.new("RGBA", (W, H), PAPER + (255,)), k)
        return end_card(t)
    for i, (s, e, bg, caps) in enumerate(SCENES):
        if s <= t < e:
            frame = bg((t - s) / (e - s)).convert("RGBA")
            # crossfade from previous scene over 0.7s
            if i > 0 and t < s + 0.7:
                ps, pe, pbg, _ = SCENES[i - 1]
                prev = pbg(1.0).convert("RGBA")
                frame = Image.blend(prev, frame, ease((t - s) / 0.7))
            # caption: (start, end, lines[, y as fraction of height])
            active = [(c[0], c[1], c[2], int(H * c[3]) if len(c) > 3 else TEXT_Y)
                      for c in caps if c[0] <= t <= c[1]]
            if active:
                strength = max(fade(t, cs, ce) for cs, ce, _, _ in active)
                y = active[0][3]
                paper_wash(frame, y - 150 * S, y + 150 * S, 0.80 * strength)
            for cs, ce, lines, y in active:
                a = fade(t, cs, ce)
                text_block(frame, lines, y, a, rise=int((1 - a) * 14))
            return frame
    return Image.new("RGBA", (W, H), PAPER + (255,))

def main():
    OUT.parent.mkdir(exist_ok=True)
    proc = subprocess.Popen(
        ["ffmpeg", "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
         "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
         "-c:v", "libx264", "-preset", "slow", "-crf", "20", "-pix_fmt", "yuv420p",
         "-movflags", "+faststart", str(OUT)],
        stdin=subprocess.PIPE)
    n = int(END * FPS)
    for i in range(n):
        proc.stdin.write(frame_at(i / FPS).convert("RGB").tobytes())
    proc.stdin.close()
    proc.wait()
    print(OUT)

if __name__ == "__main__":
    if "--still" in sys.argv:
        t = float(sys.argv[sys.argv.index("--still") + 1])
        frame_at(t).convert("RGB").save(sys.argv[sys.argv.index("--still") + 2])
    else:
        main()
