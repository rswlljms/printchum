import type { ServiceSet } from "../types";

export const serviceSets: ServiceSet[] = [
  { id: "set-a", name: "Set A", description: "Six 1 × 1 photos", price: 40, currency: "PHP", items: [{ sizePresetId: "1x1", quantity: 6 }] },
  { id: "set-b", name: "Set B", description: "Four 2 × 2 photos", price: 40, currency: "PHP", items: [{ sizePresetId: "2x2", quantity: 4 }] },
  { id: "set-c", name: "Set C", description: "Passport photo sheet", price: 40, currency: "PHP", items: [{ sizePresetId: "passport", quantity: 8 }] },
  { id: "set-d", name: "Set D", description: "Wallet photo set", price: 40, currency: "PHP", items: [{ sizePresetId: "wallet", quantity: 4 }] },
  { id: "set-e", name: "Set E", description: "Mixed ID package", price: 40, currency: "PHP", items: [{ sizePresetId: "1x1", quantity: 4 }, { sizePresetId: "2x2", quantity: 4 }] },
  { id: "set-f", name: "Set F", description: "Studio portrait package", price: 40, currency: "PHP", items: [{ sizePresetId: "2r", quantity: 2 }, { sizePresetId: "1.5x1.5", quantity: 4 }] },
];
