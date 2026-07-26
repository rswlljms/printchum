import type {
  NewServiceSet,
  ServiceSet,
  ServiceSetStatus,
} from "@/lib/service-sets/types";
import { serviceSetSchema } from "@/lib/service-sets/schemas";

let serviceSetSequence = 0;
let serviceSetPhotoItemSequence = 0;

function uniqueServiceSetId(existingIds: readonly string[]): string {
  let id: string;
  do {
    serviceSetSequence += 1;
    id = `custom-service-set-${serviceSetSequence}`;
  } while (existingIds.includes(id));
  return id;
}

function uniquePhotoItemId(existingIds: readonly string[]): string {
  let id: string;
  do {
    serviceSetPhotoItemSequence += 1;
    id = `service-set-photo-${serviceSetPhotoItemSequence}`;
  } while (existingIds.includes(id));
  return id;
}

function normalizeOrder(serviceSets: ServiceSet[]): ServiceSet[] {
  return serviceSets.map((serviceSet, displayOrder) => ({
    ...serviceSet,
    displayOrder,
  }));
}

export function createServiceSet(
  serviceSets: readonly ServiceSet[],
  input: NewServiceSet,
  now = new Date().toISOString(),
): { serviceSets: ServiceSet[]; created: ServiceSet } {
  const id = uniqueServiceSetId(serviceSets.map((set) => set.id));
  const nestedIds: string[] = [];
  const candidate: ServiceSet = {
    ...input,
    id,
    isBuiltIn: false,
    displayOrder: serviceSets.length,
    createdAt: now,
    updatedAt: now,
    photoItems: input.photoItems.map((item) => {
      const nestedId = uniquePhotoItemId(nestedIds);
      nestedIds.push(nestedId);
      return { ...item, id: nestedId };
    }),
  };
  const parsed = serviceSetSchema.parse(candidate);
  const next = parsed.isDefault
    ? serviceSets.map((set) => ({ ...set, isDefault: false }))
    : [...serviceSets];
  return { serviceSets: [...next, parsed], created: parsed };
}

export function duplicateServiceSet(
  serviceSets: readonly ServiceSet[],
  serviceSetId: string,
  now = new Date().toISOString(),
): { serviceSets: ServiceSet[]; duplicate: ServiceSet } | null {
  const sourceIndex = serviceSets.findIndex((set) => set.id === serviceSetId);
  if (sourceIndex < 0) {
    return null;
  }
  const source = serviceSets[sourceIndex];
  const id = uniqueServiceSetId(serviceSets.map((set) => set.id));
  const nestedIds: string[] = [];
  const duplicate: ServiceSet = {
    ...source,
    id,
    name: `${source.name.slice(0, 55)} Copy`,
    isBuiltIn: false,
    isDefault: false,
    displayOrder: source.displayOrder + 1,
    createdAt: now,
    updatedAt: now,
    photoItems: source.photoItems.map((item) => {
      const nestedId = uniquePhotoItemId(nestedIds);
      nestedIds.push(nestedId);
      return { ...item, id: nestedId };
    }),
    paper: { ...source.paper },
    background: { ...source.background },
  };
  const next = [...serviceSets];
  next.splice(sourceIndex + 1, 0, duplicate);
  return { serviceSets: normalizeOrder(next), duplicate };
}

export function updateCustomServiceSet(
  serviceSets: readonly ServiceSet[],
  serviceSetId: string,
  changes: Partial<ServiceSet>,
  now = new Date().toISOString(),
): ServiceSet[] | null {
  const source = serviceSets.find((set) => set.id === serviceSetId);
  if (!source || source.isBuiltIn) {
    return null;
  }
  const candidate = serviceSetSchema.safeParse({
    ...source,
    ...changes,
    id: source.id,
    isBuiltIn: false,
    createdAt: source.createdAt,
    updatedAt: now,
  });
  if (!candidate.success) {
    return null;
  }
  return serviceSets.map((set) => {
    if (set.id === serviceSetId) {
      return candidate.data;
    }
    return candidate.data.isDefault ? { ...set, isDefault: false } : set;
  });
}

export function removeCustomServiceSet(
  serviceSets: readonly ServiceSet[],
  serviceSetId: string,
): ServiceSet[] | null {
  const source = serviceSets.find((set) => set.id === serviceSetId);
  if (!source || source.isBuiltIn) {
    return null;
  }
  return normalizeOrder(serviceSets.filter((set) => set.id !== serviceSetId));
}

export function setServiceSetStatus(
  serviceSets: readonly ServiceSet[],
  serviceSetId: string,
  status: ServiceSetStatus,
): ServiceSet[] {
  return serviceSets.map((set) =>
    set.id === serviceSetId
      ? {
          ...set,
          status,
          isDefault: status === "disabled" ? false : set.isDefault,
          updatedAt: new Date().toISOString(),
        }
      : set,
  );
}

export function setDefaultServiceSet(
  serviceSets: readonly ServiceSet[],
  serviceSetId: string,
): ServiceSet[] | null {
  const target = serviceSets.find((set) => set.id === serviceSetId);
  if (!target || target.status === "disabled") {
    return null;
  }
  return serviceSets.map((set) => ({
    ...set,
    isDefault: set.id === serviceSetId,
  }));
}

export function moveServiceSet(
  serviceSets: readonly ServiceSet[],
  serviceSetId: string,
  direction: "up" | "down",
): ServiceSet[] {
  const ordered = [...serviceSets].sort(
    (left, right) => left.displayOrder - right.displayOrder,
  );
  const sourceIndex = ordered.findIndex((set) => set.id === serviceSetId);
  const targetIndex = direction === "up" ? sourceIndex - 1 : sourceIndex + 1;
  if (
    sourceIndex < 0 ||
    targetIndex < 0 ||
    targetIndex >= ordered.length
  ) {
    return normalizeOrder(ordered);
  }
  [ordered[sourceIndex], ordered[targetIndex]] = [
    ordered[targetIndex],
    ordered[sourceIndex],
  ];
  return normalizeOrder(ordered);
}

export function formatServiceSetPrice(
  serviceSet: Pick<ServiceSet, "price" | "currencyCode">,
): string {
  return new Intl.NumberFormat("en-PH", {
    style: "currency",
    currency: serviceSet.currencyCode,
    minimumFractionDigits: 2,
  }).format(serviceSet.price);
}
