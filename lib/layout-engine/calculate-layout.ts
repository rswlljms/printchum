import { orientPaper } from "./paper-sizes";
import { packItemsOnPages } from "./packing";
import {
  LayoutCalculationError,
  type ExpandedLayoutItem,
  type LayoutInput,
  type LayoutResult,
} from "./types";
import { calculateUtilizationPercent } from "./utilization";

function assertFinitePositive(value: number, label: string): void {
  if (!Number.isFinite(value) || value <= 0) {
    throw new LayoutCalculationError(
      "INVALID_INPUT",
      `${label} must be a finite positive number.`,
    );
  }
}

function validateInput(input: LayoutInput): void {
  assertFinitePositive(input.paper.widthInches, "Paper width");
  assertFinitePositive(input.paper.heightInches, "Paper height");

  for (const [label, value] of [
    ["Margin", input.marginInches],
    ["Horizontal spacing", input.horizontalSpacingInches],
    ["Vertical spacing", input.verticalSpacingInches],
  ] as const) {
    if (!Number.isFinite(value) || value < 0) {
      throw new LayoutCalculationError(
        "INVALID_INPUT",
        `${label} must be a finite non-negative number.`,
      );
    }
  }

  const sourceIds = new Set<string>();
  for (const item of input.items) {
    if (!item.id || sourceIds.has(item.id)) {
      throw new LayoutCalculationError(
        "INVALID_INPUT",
        "Layout item IDs must be non-empty and unique.",
        item.id,
      );
    }
    sourceIds.add(item.id);
    assertFinitePositive(item.widthInches, "Item width");
    assertFinitePositive(item.heightInches, "Item height");
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new LayoutCalculationError(
        "INVALID_INPUT",
        "Item quantity must be a positive integer.",
        item.id,
      );
    }
  }
}

function expandItems(input: LayoutInput): ExpandedLayoutItem[] {
  return input.items.flatMap((item) =>
    Array.from({ length: item.quantity }, (_, index) => ({
      instanceId: `${item.id}-${index + 1}`,
      sourceItemId: item.id,
      widthInches: item.widthInches,
      heightInches: item.heightInches,
      allowRotation: item.allowRotation,
    })),
  );
}

export function calculateLayout(input: LayoutInput): LayoutResult {
  validateInput(input);

  const paper = orientPaper(
    input.paper.widthInches,
    input.paper.heightInches,
    input.paper.orientation,
  );
  const printableWidth = paper.widthInches - input.marginInches * 2;
  const printableHeight = paper.heightInches - input.marginInches * 2;

  if (printableWidth <= 0 || printableHeight <= 0) {
    throw new LayoutCalculationError(
      "INVALID_PRINTABLE_AREA",
      "Margins leave no printable area on the selected paper.",
    );
  }

  const pages = packItemsOnPages(expandItems(input), {
    paperWidthInches: paper.widthInches,
    paperHeightInches: paper.heightInches,
    marginInches: input.marginInches,
    horizontalSpacingInches: input.horizontalSpacingInches,
    verticalSpacingInches: input.verticalSpacingInches,
  });

  return {
    pages,
    totalItems: pages.reduce((total, page) => total + page.items.length, 0),
    utilizationPercent: calculateUtilizationPercent(
      pages,
      printableWidth,
      printableHeight,
    ),
  };
}
