import {
  AbsoluteFill,
  interpolate,
  Sequence,
  spring,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";

type Props = { title: string; subtitle: string };

const Word: React.FC<{ word: string; index: number }> = ({ word, index }) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const pop = spring({ frame: frame - index * 5, fps, config: { damping: 12 } });
  return (
    <span
      style={{
        display: "inline-block",
        marginRight: "0.3em",
        transform: `translateY(${(1 - pop) * 80}px) scale(${pop})`,
        opacity: pop,
      }}
    >
      {word}
    </span>
  );
};

export const HelloEdit: React.FC<Props> = ({ title, subtitle }) => {
  const frame = useCurrentFrame();
  const { durationInFrames, width } = useVideoConfig();

  // Slowly rotating gradient background
  const hue = interpolate(frame, [0, durationInFrames], [260, 340]);
  // Fade everything out over the last 15 frames
  const outro = interpolate(frame, [durationInFrames - 15, durationInFrames], [1, 0], {
    extrapolateLeft: "clamp",
  });
  const subtitleIn = interpolate(frame, [30, 50], [0, 1], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });

  return (
    <AbsoluteFill
      style={{
        background: `linear-gradient(135deg, hsl(${hue},80%,45%), hsl(${hue + 60},90%,55%))`,
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "Helvetica, Arial, sans-serif",
        color: "white",
        opacity: outro,
        textAlign: "center",
        padding: 60,
      }}
    >
      <h1 style={{ fontSize: width * 0.075, fontWeight: 900, margin: 0 }}>
        {title.split(" ").map((w, i) => (
          <Word key={i} word={w} index={i} />
        ))}
      </h1>
      <Sequence from={30} layout="none">
        <p
          style={{
            fontSize: width * 0.03,
            marginTop: 30,
            opacity: subtitleIn,
            letterSpacing: interpolate(subtitleIn, [0, 1], [20, 4]),
            textTransform: "uppercase",
          }}
        >
          {subtitle}
        </p>
      </Sequence>
    </AbsoluteFill>
  );
};
