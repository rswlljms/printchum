import type {
  LayoutInput,
  MeasuredLayoutInput,
  NameplateLayoutConfig,
} from "./types";
import { toInches } from "./units";

function normalizeNameplate(
  nameplate: NameplateLayoutConfig | undefined,
): NameplateLayoutConfig | undefined {
  return nameplate ? { ...nameplate } : undefined;
}

export function normalizeLayoutInput(
  input: MeasuredLayoutInput,
): LayoutInput {
  return {
    paper: {
      widthInches: toInches(input.paper.width, input.paper.unit),
      heightInches: toInches(input.paper.height, input.paper.unit),
      orientation: input.paper.orientation,
    },
    marginInches: toInches(input.margin.value, input.margin.unit),
    horizontalSpacingInches: toInches(
      input.horizontalSpacing.value,
      input.horizontalSpacing.unit,
    ),
    verticalSpacingInches: toInches(
      input.verticalSpacing.value,
      input.verticalSpacing.unit,
    ),
    items: input.items.map((item) => ({
      id: item.id,
      widthInches: toInches(item.width, item.unit),
      heightInches: toInches(item.height, item.unit),
      quantity: item.quantity,
      allowRotation: item.allowRotation,
      nameplate: normalizeNameplate(item.nameplate),
    })),
  };
}
