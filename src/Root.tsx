import { Composition } from "remotion";
import { HelloEdit } from "./HelloEdit";

export const RemotionRoot: React.FC = () => {
  return (
    <>
      {/* 16:9 landscape — YouTube, web */}
      <Composition
        id="HelloEdit"
        component={HelloEdit}
        durationInFrames={150}
        fps={30}
        width={1920}
        height={1080}
        defaultProps={{ title: "Sweet Animated Edits", subtitle: "made with Remotion" }}
      />
      {/* 9:16 vertical — Reels, TikTok, Shorts */}
      <Composition
        id="VerticalPromo"
        component={HelloEdit}
        durationInFrames={150}
        fps={30}
        width={1080}
        height={1920}
        defaultProps={{ title: "Your Hook Here", subtitle: "swipe up for more" }}
      />
    </>
  );
};
