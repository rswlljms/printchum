import type { PaperPreset } from "../types";

export const paperPresets: PaperPreset[] = [
  { id: "letter", name: "Letter / Short bond", width: 8.5, height: 11, unit: "in" },
  { id: "legal", name: "Legal", width: 8.5, height: 14, unit: "in" },
  { id: "a4", name: "A4", width: 210, height: 297, unit: "mm" },
  { id: "a3", name: "A3", width: 297, height: 420, unit: "mm" },
  { id: "4r", name: "4R", width: 4, height: 6, unit: "in" },
  { id: "5r", name: "5R", width: 5, height: 7, unit: "in" },
  { id: "custom", name: "Custom", width: 8.5, height: 11, unit: "in" },
];
