import type { LayoutResult } from "@/lib/layout-engine/types";

export type DrawLayoutPreviewInput = {
  context: CanvasRenderingContext2D;
  viewportWidth: number;
  viewportHeight: number;
  paperWidthInches: number;
  paperHeightInches: number;
  marginInches: number;
  layoutResult: LayoutResult;
  activePageIndex: number;
  previewScale: number;
};

const FRAME_COLORS = ["#dbeafe", "#e0e7ff", "#e2e8f0", "#cffafe"];

function getFrameColor(sourceItemId: string): string {
  const codeTotal = [...sourceItemId].reduce((total, character) => total + character.charCodeAt(0), 0);
  return FRAME_COLORS[codeTotal % FRAME_COLORS.length];
}

export function drawLayoutPreview({
  context,
  viewportWidth,
  viewportHeight,
  paperWidthInches,
  paperHeightInches,
  marginInches,
  layoutResult,
  activePageIndex,
  previewScale,
}: DrawLayoutPreviewInput): void {
  context.clearRect(0, 0, viewportWidth, viewportHeight);

  const pagePadding = 32;
  const fitScale = Math.min(
    (viewportWidth - pagePadding * 2) / paperWidthInches,
    (viewportHeight - pagePadding * 2) / paperHeightInches,
  );
  const pixelsPerInch = Math.max(fitScale * previewScale, 1);
  const paperWidth = paperWidthInches * pixelsPerInch;
  const paperHeight = paperHeightInches * pixelsPerInch;
  const paperX = (viewportWidth - paperWidth) / 2;
  const paperY = (viewportHeight - paperHeight) / 2;

  context.save();
  context.shadowColor = "rgba(15, 23, 42, 0.15)";
  context.shadowBlur = 24;
  context.shadowOffsetY = 8;
  context.fillStyle = "#ffffff";
  context.fillRect(paperX, paperY, paperWidth, paperHeight);
  context.restore();

  context.strokeStyle = "#cbd5e1";
  context.lineWidth = 1;
  context.strokeRect(paperX + 0.5, paperY + 0.5, paperWidth - 1, paperHeight - 1);

  const marginPixels = marginInches * pixelsPerInch;
  context.save();
  context.setLineDash([4, 4]);
  context.strokeStyle = "#cbd5e1";
  context.strokeRect(
    paperX + marginPixels,
    paperY + marginPixels,
    paperWidth - marginPixels * 2,
    paperHeight - marginPixels * 2,
  );
  context.restore();

  const page = layoutResult.pages[activePageIndex];
  if (!page) {
    return;
  }

  for (const item of page.items) {
    const x = paperX + item.xInches * pixelsPerInch;
    const y = paperY + item.yInches * pixelsPerInch;
    const width = item.widthInches * pixelsPerInch;
    const height = item.heightInches * pixelsPerInch;

    context.fillStyle = getFrameColor(item.sourceItemId);
    context.fillRect(x, y, width, height);
    context.strokeStyle = "#60a5fa";
    context.strokeRect(x + 0.5, y + 0.5, width - 1, height - 1);

    context.fillStyle = "#1e3a8a";
    context.font = `${Math.max(9, Math.min(12, width / 8))}px ui-sans-serif, system-ui`;
    context.textAlign = "center";
    context.textBaseline = "middle";
    context.fillText(
      item.sourceItemId.replace("-selection", ""),
      x + width / 2,
      y + height / 2,
      Math.max(width - 8, 0),
    );
  }
}
