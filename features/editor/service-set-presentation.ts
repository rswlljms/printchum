import { formatPhotoDimensions } from "@/features/editor/photo-sizes/conversions";
import type { ServiceSet } from "@/lib/service-sets/types";

export type ServiceSetItemSummary = {
  key: string;
  text: string;
};

export function formatServiceSetPrice(
  serviceSet: Pick<ServiceSet, "currencyCode" | "price">,
): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: serviceSet.currencyCode,
    minimumFractionDigits: 2,
  }).format(serviceSet.price);
}

export function summarizeServiceSetItems(
  serviceSet: ServiceSet,
): ServiceSetItemSummary[] {
  return serviceSet.photoItems.map((item) => ({
    key: item.id,
    text: `${item.quantity} ${
      item.quantity === 1 ? "pc" : "pcs"
    } · ${formatPhotoDimensions(item.width, item.height, item.unit)}`,
  }));
}
