import React from "react";
import {Composition} from "remotion";
import {Film, TOTAL} from "./Film";

export const RemotionRoot: React.FC = () => {
  return (
    <Composition id="HospitalVagabundos" component={Film} durationInFrames={TOTAL} fps={24} width={1920} height={1080} />
  );
};
