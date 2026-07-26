import type {
  PhotoSizePreset,
  ServiceSet,
} from "@/features/editor/types";
import { formatPhotoDimensions } from "@/features/editor/photo-sizes/conversions";

export type ServiceSetItemSummary = {
  key: string;
  text: string;
};

const philippinePesoFormatter = new Intl.NumberFormat("en-PH", {
  style: "currency",
  currency: "PHP",
  minimumFractionDigits: 2,
});

export function formatServiceSetPrice(
  serviceSet: Pick<ServiceSet, "currency" | "price">,
): string {
  return philippinePesoFormatter.format(serviceSet.price);
}

export function summarizeServiceSetItems(
  serviceSet: ServiceSet,
  photoSizePresets: readonly PhotoSizePreset[],
): ServiceSetItemSummary[] {
  return serviceSet.items.map((item, index) => {
    const preset = photoSizePresets.find(
      (candidate) => candidate.id === item.sizePresetId,
    );
    const pieceLabel = item.quantity === 1 ? "pc" : "pcs";

    return {
      key: `${item.sizePresetId}-${index}`,
      text: `${item.quantity} ${pieceLabel} · ${
        preset
          ? formatPhotoDimensions(preset.width, preset.height, preset.unit)
          : "Unknown size"
      }`,
    };
  });
}
