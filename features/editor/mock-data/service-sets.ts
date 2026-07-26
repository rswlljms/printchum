import type { ServiceSet } from "../types";

export const serviceSets: ServiceSet[] = [
  { id: "set-a", name: "Set A", description: "Six 1 × 1 photos", price: 3, currency: "USD", items: [{ sizePresetId: "1x1", quantity: 6 }] },
  { id: "set-b", name: "Set B", description: "Four 2 × 2 photos", price: 4, currency: "USD", items: [{ sizePresetId: "2x2", quantity: 4 }] },
  { id: "set-c", name: "Set C", description: "Passport photo sheet", price: 5, currency: "USD", items: [{ sizePresetId: "passport", quantity: 8 }] },
  { id: "set-d", name: "Set D", description: "Wallet photo set", price: 6, currency: "USD", items: [{ sizePresetId: "wallet", quantity: 4 }] },
  { id: "set-e", name: "Set E", description: "Mixed ID package", price: 7, currency: "USD", items: [{ sizePresetId: "1x1", quantity: 4 }, { sizePresetId: "2x2", quantity: 4 }] },
  { id: "set-f", name: "Set F", description: "Studio portrait package", price: 9, currency: "USD", items: [{ sizePresetId: "2r", quantity: 2 }, { sizePresetId: "1.5x1.5", quantity: 4 }] },
];
