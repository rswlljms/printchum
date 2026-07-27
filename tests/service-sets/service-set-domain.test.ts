import { describe, expect, it } from "vitest";

import { createEditorConfigurationFromServiceSet } from "@/lib/service-sets/apply-service-set";
import { createServiceSetConfigurationFingerprint } from "@/lib/service-sets/comparison";
import {
  createServiceSet,
  duplicateServiceSet,
  moveServiceSet,
  removeServiceSet,
  setDefaultServiceSet,
  setServiceSetStatus,
  updateCustomServiceSet,
} from "@/lib/service-sets/operations";
import {
  builtInServiceSets,
  createInitialServiceSets,
} from "@/lib/service-sets/presets";
import { serviceSetSchema } from "@/lib/service-sets/schemas";

describe("Service Set domain", () => {
  it("provides six valid built-in sets with unique IDs and nested IDs", () => {
    expect(builtInServiceSets).toHaveLength(6);
    expect(new Set(builtInServiceSets.map((set) => set.id)).size).toBe(6);
    for (const serviceSet of builtInServiceSets) {
      expect(serviceSetSchema.safeParse(serviceSet).success).toBe(true);
      expect(
        new Set(serviceSet.photoItems.map((item) => item.id)).size,
      ).toBe(serviceSet.photoItems.length);
    }
  });

  it("rejects invalid price, currency, empty items, duplicate IDs, and invalid paper", () => {
    const source = builtInServiceSets[0];
    expect(
      serviceSetSchema.safeParse({ ...source, price: -1 }).success,
    ).toBe(false);
    expect(
      serviceSetSchema.safeParse({ ...source, currencyCode: "peso" }).success,
    ).toBe(false);
    expect(
      serviceSetSchema.safeParse({ ...source, photoItems: [] }).success,
    ).toBe(false);
    expect(
      serviceSetSchema.safeParse({
        ...source,
        photoItems: [source.photoItems[0], source.photoItems[0]],
      }).success,
    ).toBe(false);
    expect(
      serviceSetSchema.safeParse({
        ...source,
        paper: { ...source.paper, margin: 100 },
      }).success,
    ).toBe(false);
  });

  it("applies quantities, paper, background, guides, labels, and rotation", () => {
    let sequence = 0;
    const configuration = createEditorConfigurationFromServiceSet(
      builtInServiceSets[4],
      () => {
        sequence += 1;
        return `editor-item-${sequence}`;
      },
    );
    expect(configuration.photoSizes).toHaveLength(2);
    expect(configuration.photoSizes.map((item) => item.quantity)).toEqual([
      2, 2,
    ]);
    expect(configuration.paper).toMatchObject({
      presetId: "5r",
      orientation: "landscape",
      cuttingGuidesEnabled: true,
      sizeLabelsEnabled: true,
      allowPhotoRotation: true,
    });
    expect(configuration.backgroundMode).toBe("original");
  });

  it("converts custom paper directly into valid editor settings", () => {
    const customPaperSet = {
      ...builtInServiceSets[0],
      paper: {
        source: "custom" as const,
        name: "Studio card",
        width: 10,
        height: 15,
        unit: "cm" as const,
        orientation: "landscape" as const,
        margin: 1,
        horizontalSpacing: 0.5,
        verticalSpacing: 0.75,
      },
    };
    const configuration =
      createEditorConfigurationFromServiceSet(customPaperSet);
    expect(configuration.paper).toMatchObject({
      presetId: null,
      name: "Studio card",
      width: 10,
      height: 15,
      unit: "cm",
      orientation: "landscape",
    });
  });

  it("creates deterministic fingerprints independent of runtime item IDs", () => {
    const first = createEditorConfigurationFromServiceSet(
      builtInServiceSets[1],
      () => "runtime-a",
    );
    const second = createEditorConfigurationFromServiceSet(
      builtInServiceSets[1],
      () => "runtime-b",
    );
    expect(createServiceSetConfigurationFingerprint(first)).toBe(
      createServiceSetConfigurationFingerprint(second),
    );
  });

  it("creates and duplicates custom sets with regenerated IDs", () => {
    const sourceSets = createInitialServiceSets();
    const input = {
      ...builtInServiceSets[0],
      isDefault: false,
    };
    const createdResult = createServiceSet(sourceSets, {
      name: "Studio package",
      description: input.description,
      status: input.status,
      isDefault: input.isDefault,
      price: input.price,
      currencyCode: input.currencyCode,
      photoItems: input.photoItems,
      paper: input.paper,
      background: input.background,
      cuttingGuidesEnabled: input.cuttingGuidesEnabled,
      sizeLabelsEnabled: input.sizeLabelsEnabled,
      allowPhotoRotation: input.allowPhotoRotation,
    });
    const duplicateResult = duplicateServiceSet(
      createdResult.serviceSets,
      createdResult.created.id,
    );
    expect(duplicateResult).not.toBeNull();
    expect(duplicateResult?.duplicate.id).not.toBe(createdResult.created.id);
    expect(duplicateResult?.duplicate.photoItems[0].id).not.toBe(
      createdResult.created.photoItems[0].id,
    );
    expect(duplicateResult?.duplicate.isBuiltIn).toBe(false);
  });

  it("protects built-ins from edits while allowing their removal", () => {
    const sets = createInitialServiceSets();
    expect(updateCustomServiceSet(sets, sets[0].id, { name: "Changed" })).toBeNull();
    expect(removeServiceSet(sets, sets[0].id)).toHaveLength(
      sets.length - 1,
    );
  });

  it("enforces a single enabled default and clears default on disable", () => {
    const sets = createInitialServiceSets();
    const secondDefault = setDefaultServiceSet(sets, sets[1].id);
    expect(secondDefault?.filter((set) => set.isDefault)).toHaveLength(1);
    expect(secondDefault?.find((set) => set.isDefault)?.id).toBe(sets[1].id);
    const disabled = setServiceSetStatus(
      secondDefault ?? sets,
      sets[1].id,
      "disabled",
    );
    expect(disabled[1]).toMatchObject({
      status: "disabled",
      isDefault: false,
    });
    expect(setDefaultServiceSet(disabled, sets[1].id)).toBeNull();
  });

  it("reorders sets deterministically", () => {
    const sets = createInitialServiceSets();
    const moved = moveServiceSet(sets, sets[2].id, "up");
    expect(moved.map((set) => set.id).slice(0, 3)).toEqual([
      sets[0].id,
      sets[2].id,
      sets[1].id,
    ]);
    expect(moved.map((set) => set.displayOrder)).toEqual([0, 1, 2, 3, 4, 5]);
  });
});
