export type MeasurementUnit = "in" | "cm" | "mm";
export type PaperOrientation = "portrait" | "landscape";

export type NameplateLayoutConfig = {
  heightInches: number;
  placement: "inside" | "outside";
};

export type LayoutInput = {
  paper: {
    widthInches: number;
    heightInches: number;
    orientation: PaperOrientation;
  };
  marginInches: number;
  horizontalSpacingInches: number;
  verticalSpacingInches: number;
  items: Array<{
    id: string;
    widthInches: number;
    heightInches: number;
    quantity: number;
    allowRotation: boolean;
    nameplate?: NameplateLayoutConfig;
  }>;
};

export type LayoutItem = {
  id: string;
  sourceItemId: string;
  pageIndex: number;
  xInches: number;
  yInches: number;
  widthInches: number;
  heightInches: number;
  rotation: 0 | 90;
};

export type LayoutPage = {
  pageIndex: number;
  items: LayoutItem[];
};

export type LayoutResult = {
  pages: LayoutPage[];
  totalItems: number;
  placedItems: number;
  unplacedItems: UnplacedLayoutItem[];
  utilizationPercent: number;
};

export type LayoutErrorCode =
  | "INVALID_INPUT"
  | "INVALID_PRINTABLE_AREA";

export class LayoutCalculationError extends Error {
  constructor(
    public readonly code: LayoutErrorCode,
    message: string,
    public readonly sourceItemId?: string,
  ) {
    super(message);
    this.name = "LayoutCalculationError";
  }
}

export type ExpandedLayoutItem = {
  instanceId: string;
  sourceItemId: string;
  widthInches: number;
  heightInches: number;
  allowRotation: boolean;
};

export type UnplacedLayoutItem = {
  id: string;
  sourceItemId: string;
  widthInches: number;
  heightInches: number;
  allowRotation: boolean;
  reason: "ITEM_DOES_NOT_FIT";
  message: string;
};

export type MeasuredValue = {
  value: number;
  unit: MeasurementUnit;
};

export type MeasuredLayoutInput = {
  paper: {
    width: number;
    height: number;
    unit: MeasurementUnit;
    orientation: PaperOrientation;
  };
  margin: MeasuredValue;
  horizontalSpacing: MeasuredValue;
  verticalSpacing: MeasuredValue;
  items: Array<{
    id: string;
    width: number;
    height: number;
    unit: MeasurementUnit;
    quantity: number;
    allowRotation: boolean;
    nameplate?: NameplateLayoutConfig;
  }>;
};
