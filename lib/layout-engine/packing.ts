import { createLayoutPage } from "./pagination";
import {
  LayoutCalculationError,
  type ExpandedLayoutItem,
  type LayoutItem,
  type LayoutPage,
} from "./types";

const FLOATING_POINT_EPSILON = 1e-9;

type PackingArea = {
  paperWidthInches: number;
  paperHeightInches: number;
  marginInches: number;
  horizontalSpacingInches: number;
  verticalSpacingInches: number;
};

type CandidateDimensions = {
  widthInches: number;
  heightInches: number;
  rotation: 0 | 90;
};

function fits(value: number, available: number): boolean {
  return value <= available + FLOATING_POINT_EPSILON;
}

function chooseCandidate(
  item: ExpandedLayoutItem,
  availableWidth: number,
  availableHeight: number,
): CandidateDimensions | null {
  if (
    fits(item.widthInches, availableWidth) &&
    fits(item.heightInches, availableHeight)
  ) {
    return {
      widthInches: item.widthInches,
      heightInches: item.heightInches,
      rotation: 0,
    };
  }

  if (
    item.allowRotation &&
    fits(item.heightInches, availableWidth) &&
    fits(item.widthInches, availableHeight)
  ) {
    return {
      widthInches: item.heightInches,
      heightInches: item.widthInches,
      rotation: 90,
    };
  }

  return null;
}

function assertItemFitsPrintableArea(
  item: ExpandedLayoutItem,
  printableWidth: number,
  printableHeight: number,
): void {
  if (chooseCandidate(item, printableWidth, printableHeight) === null) {
    throw new LayoutCalculationError(
      "ITEM_DOES_NOT_FIT",
      `Item "${item.sourceItemId}" does not fit within the printable area.`,
      item.sourceItemId,
    );
  }
}

export function packItemsOnPages(
  items: ExpandedLayoutItem[],
  area: PackingArea,
): LayoutPage[] {
  if (items.length === 0) {
    return [];
  }

  const printableWidth =
    area.paperWidthInches - area.marginInches * 2;
  const printableHeight =
    area.paperHeightInches - area.marginInches * 2;

  const pages: LayoutPage[] = [createLayoutPage(0)];
  let pageIndex = 0;
  let cursorX = area.marginInches;
  let cursorY = area.marginInches;
  let rowHeight = 0;

  for (const item of items) {
    assertItemFitsPrintableArea(item, printableWidth, printableHeight);

    let candidate = chooseCandidate(
      item,
      area.paperWidthInches - area.marginInches - cursorX,
      area.paperHeightInches - area.marginInches - cursorY,
    );

    if (candidate === null && rowHeight > 0) {
      cursorX = area.marginInches;
      cursorY += rowHeight + area.verticalSpacingInches;
      rowHeight = 0;
      candidate = chooseCandidate(
        item,
        printableWidth,
        area.paperHeightInches - area.marginInches - cursorY,
      );
    }

    if (candidate === null) {
      pageIndex += 1;
      pages.push(createLayoutPage(pageIndex));
      cursorX = area.marginInches;
      cursorY = area.marginInches;
      rowHeight = 0;
      candidate = chooseCandidate(item, printableWidth, printableHeight);
    }

    if (candidate === null) {
      throw new LayoutCalculationError(
        "ITEM_DOES_NOT_FIT",
        `Item "${item.sourceItemId}" does not fit within the printable area.`,
        item.sourceItemId,
      );
    }

    const placedItem: LayoutItem = {
      id: item.instanceId,
      sourceItemId: item.sourceItemId,
      pageIndex,
      xInches: cursorX,
      yInches: cursorY,
      widthInches: candidate.widthInches,
      heightInches: candidate.heightInches,
      rotation: candidate.rotation,
    };

    pages[pageIndex].items.push(placedItem);
    cursorX += candidate.widthInches + area.horizontalSpacingInches;
    rowHeight = Math.max(rowHeight, candidate.heightInches);
  }

  return pages;
}
