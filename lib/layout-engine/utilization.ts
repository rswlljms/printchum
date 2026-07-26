import type { LayoutPage } from "./types";

export function calculateUtilizationPercent(
  pages: LayoutPage[],
  printableWidthInches: number,
  printableHeightInches: number,
): number {
  if (
    pages.length === 0 ||
    printableWidthInches <= 0 ||
    printableHeightInches <= 0
  ) {
    return 0;
  }

  const occupiedArea = pages.reduce(
    (pageTotal, page) =>
      pageTotal +
      page.items.reduce(
        (itemTotal, item) =>
          itemTotal + item.widthInches * item.heightInches,
        0,
      ),
    0,
  );
  const availableArea =
    printableWidthInches * printableHeightInches * pages.length;

  return (occupiedArea / availableArea) * 100;
}
