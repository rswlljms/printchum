import type { PaperOrientation } from "./types";

export type OrientedPaperDimensions = {
  widthInches: number;
  heightInches: number;
};

export function orientPaper(
  widthInches: number,
  heightInches: number,
  orientation: PaperOrientation,
): OrientedPaperDimensions {
  const shortEdge = Math.min(widthInches, heightInches);
  const longEdge = Math.max(widthInches, heightInches);

  return orientation === "portrait"
    ? { widthInches: shortEdge, heightInches: longEdge }
    : { widthInches: longEdge, heightInches: shortEdge };
}
