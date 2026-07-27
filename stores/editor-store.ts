"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import {
  createCustomPhotoSizeItem,
  createPhotoSizeItemFromPreset,
  findPhotoSizePreset,
} from "@/features/editor/photo-sizes/presets";
import {
  EDITOR_WORKSPACE_SESSION_KEY,
  EDITOR_WORKSPACE_SESSION_VERSION,
  createPersistedEditorWorkspace,
  parseEditorWorkspaceSessionStorage,
  parsePersistedEditorWorkspace,
  type PersistedEditorWorkspace,
} from "@/features/editor/workspace-session";
import type {
  CropMode,
  CropState,
  EditorState,
  NewPhotoSizeItem,
  PhotoSizeItem,
  PhotoSizeItemChanges,
} from "@/features/editor/types";
import { calculateLayout } from "@/lib/layout-engine/calculate-layout";
import type {
  MeasurementUnit,
  PaperOrientation,
} from "@/lib/layout-engine/types";
import {
  convertMeasurement,
  toInches,
} from "@/lib/paper/conversions";
import {
  createPaperSettingsFromPreset,
  findPaperPreset,
  paperPresets,
} from "@/lib/paper/presets";
import { calculatePrintableArea } from "@/lib/paper/printable-area";
import { paperSettingsSchema } from "@/lib/paper/schemas";
import { createEditorConfigurationFromServiceSet } from "@/lib/service-sets/apply-service-set";
import { createServiceSetConfigurationFingerprint } from "@/lib/service-sets/comparison";
import {
  createServiceSet as createServiceSetOperation,
  duplicateServiceSet as duplicateServiceSetOperation,
  moveServiceSet as moveServiceSetOperation,
  removeCustomServiceSet,
  setDefaultServiceSet as setDefaultServiceSetOperation,
  setServiceSetStatus as setServiceSetStatusOperation,
  updateCustomServiceSet,
} from "@/lib/service-sets/operations";
import { createInitialServiceSets } from "@/lib/service-sets/presets";
import { serviceSetSchema } from "@/lib/service-sets/schemas";
import type {
  BackgroundPreference,
  NewServiceSet,
  ServiceSetChanges,
  ServiceSetStatus,
} from "@/lib/service-sets/types";
import type {
  AutoArrangeMode,
  CustomPaperPreset,
  CustomPaperPresetChanges,
  NewCustomPaperPreset,
  PaperSettings,
} from "@/lib/paper/types";
import {
  measureNameplate,
} from "@/lib/nameplates/measurement";
import { createNameplateSettings } from "@/lib/nameplates/presets";
import { nameplateSettingsSchema } from "@/lib/nameplates/schemas";
import type {
  NameplatePresetType,
  NameplateSettings,
} from "@/lib/nameplates/types";
import {
  createCustomPassportPreset as createCustomPassportPresetOperation,
  duplicatePassportPreset as duplicatePassportPresetOperation,
  recordRecentPassportPreset as recordRecentPassportPresetOperation,
  removeCustomPassportPreset as removeCustomPassportPresetOperation,
  updateCustomPassportPreset as updateCustomPassportPresetOperation,
} from "@/lib/passport-presets/operations";
import { builtInPassportPresets } from "@/lib/passport-presets/presets";
import type {
  NewPassportPreset,
  PassportPresetChanges,
} from "@/lib/passport-presets/types";

type EditorActions = {
  replaceSourcePhoto: (file: File) => void;
  removeSourcePhoto: () => void;
  disposeSourcePhoto: () => void;
  setNormalizedCrop: (
    crop: Pick<CropState, "xPercent" | "yPercent" | "widthPercent" | "heightPercent">,
  ) => void;
  setCropZoom: (zoom: number) => void;
  setCropRotation: (rotation: number) => void;
  setCropMode: (mode: CropMode) => void;
  resetCrop: () => void;
  setPaperPreset: (presetId: string) => void;
  setPaperName: (name: string) => void;
  setPaperDimensions: (
    width: number,
    height: number,
    unit: MeasurementUnit,
  ) => void;
  setPaperUnit: (unit: MeasurementUnit) => void;
  setPaperOrientation: (orientation: PaperOrientation) => void;
  setPaperMargin: (margin: number) => void;
  setHorizontalSpacing: (spacing: number) => void;
  setVerticalSpacing: (spacing: number) => void;
  setCuttingGuidesEnabled: (enabled: boolean) => void;
  setSizeLabelsEnabled: (enabled: boolean) => void;
  setGlobalPhotoRotation: (enabled: boolean) => void;
  setAutoArrangeMode: (mode: AutoArrangeMode) => void;
  saveCustomPaperPreset: (preset: NewCustomPaperPreset) => string | null;
  updateCustomPaperPreset: (
    presetId: string,
    changes: CustomPaperPresetChanges,
  ) => boolean;
  duplicateCustomPaperPreset: (presetId: string) => string | null;
  removeCustomPaperPreset: (presetId: string) => void;
  applyCustomPaperPreset: (presetId: string) => void;
  resetPaperSettings: () => void;
  addPhotoSizeFromPreset: (presetId: string) => void;
  addCustomPhotoSize: (item: NewPhotoSizeItem) => void;
  updatePhotoSize: (itemId: string, changes: PhotoSizeItemChanges) => void;
  duplicatePhotoSize: (itemId: string) => void;
  removePhotoSize: (itemId: string) => void;
  setPhotoSizeQuantity: (itemId: string, quantity: number) => void;
  setPhotoSizeRotation: (itemId: string, allowRotation: boolean) => void;
  setPhotoSizeNameplate: (itemId: string, enabled: boolean) => void;
  setPhotoSizeNameplatePreset: (
    itemId: string,
    presetType: NameplatePresetType,
  ) => void;
  updatePhotoSizeNameplate: (
    itemId: string,
    changes: Partial<NameplateSettings>,
  ) => boolean;
  resetPhotoSizeNameplate: (itemId: string) => void;
  applyNameplateToAllPhotoSizes: (sourceItemId: string) => void;
  applyPassportPreset: (
    presetId: string,
    mode?: "add" | "replace",
  ) => boolean;
  togglePassportPresetFavorite: (presetId: string) => void;
  createCustomPassportPreset: (input: NewPassportPreset) => string | null;
  updateCustomPassportPreset: (
    presetId: string,
    changes: PassportPresetChanges,
  ) => boolean;
  duplicatePassportPreset: (presetId: string) => string | null;
  removeCustomPassportPreset: (presetId: string) => boolean;
  clearPhotoSizes: () => void;
  replacePhotoSizes: (photoSizes: PhotoSizeItem[]) => void;
  selectServiceSet: (serviceSetId: string) => void;
  applyServiceSet: (serviceSetId: string) => boolean;
  clearSelectedServiceSet: () => void;
  reapplySelectedServiceSet: () => boolean;
  setBackgroundPreference: (preference: BackgroundPreference) => void;
  createServiceSet: (input: NewServiceSet) => string | null;
  updateServiceSet: (
    serviceSetId: string,
    changes: ServiceSetChanges,
  ) => boolean;
  duplicateServiceSet: (serviceSetId: string) => string | null;
  removeServiceSet: (serviceSetId: string) => boolean;
  setServiceSetStatus: (
    serviceSetId: string,
    status: ServiceSetStatus,
  ) => void;
  setDefaultServiceSet: (serviceSetId: string) => boolean;
  moveServiceSet: (
    serviceSetId: string,
    direction: "up" | "down",
  ) => void;
  saveCurrentEditorAsServiceSet: (
    metadata: Pick<
      NewServiceSet,
      "name" | "description" | "price" | "currencyCode"
    >,
  ) => string | null;
  setActivePage: (pageIndex: number) => void;
  setPreviewScale: (scale: number) => void;
  restoreWorkspaceSession: () => void;
  recalculateLayout: () => void;
  resetEditor: () => void;
};

export type EditorStore = EditorState & EditorActions;

const defaultPaperPreset = paperPresets[0];
let customPaperPresetSequence = 0;
const unavailableSessionStorage = {
  getItem: (): string | null => null,
  setItem: (): void => undefined,
  removeItem: (): void => undefined,
};

function createDefaultCropState(): CropState {
  return {
    xPercent: 0,
    yPercent: 0,
    widthPercent: 100,
    heightPercent: 100,
    zoom: 1,
    rotation: 0,
  };
}

function revokeObjectUrl(objectUrl: string | null): void {
  if (objectUrl) {
    URL.revokeObjectURL(objectUrl);
  }
}

function createInitialState(): EditorState {
  return {
    sourceFile: null,
    sourceObjectUrl: null,
    crop: createDefaultCropState(),
    cropMode: "fill-frame",
    backgroundMode: "original",
    backgroundColor: "#ffffff",
    backgroundRemoved: false,
    serviceSets: createInitialServiceSets(),
    selectedServiceSetId: null,
    appliedServiceSetSnapshot: null,
    serviceSetModificationState: "unselected",
    photoSizes: [],
    paper: createPaperSettingsFromPreset(defaultPaperPreset),
    customPaperPresets: [],
    passportPresets: builtInPassportPresets.map((preset) => ({
      ...preset,
      allowedBackgroundColors: [...preset.allowedBackgroundColors],
    })),
    favoritePassportPresetIds: [],
    recentPassportPresetIds: [],
    selectedPassportPresetId: null,
    passportBackgroundRecommendation: null,
    layoutMode: "auto",
    layoutResult: null,
    layoutError: null,
    activePageIndex: 0,
    previewScale: 1,
  };
}

function calculateEditorLayout(state: EditorState): Pick<EditorState, "layoutResult" | "layoutError" | "activePageIndex"> {
  const validatedPaper = paperSettingsSchema.safeParse(state.paper);
  if (!validatedPaper.success) {
    return {
      layoutResult: state.layoutResult,
      layoutError:
        validatedPaper.error.issues[0]?.message ??
        "The paper settings are invalid.",
      activePageIndex: state.activePageIndex,
    };
  }

  const printableArea = calculatePrintableArea(state.paper);
  if (!printableArea.isValid) {
    return {
      layoutResult: state.layoutResult,
      layoutError:
        printableArea.error ?? "The paper settings are invalid.",
      activePageIndex: state.activePageIndex,
    };
  }

  try {
    const result = calculateLayout({
      paper: {
        widthInches: toInches(state.paper.width, state.paper.unit),
        heightInches: toInches(state.paper.height, state.paper.unit),
        orientation: state.paper.orientation,
      },
      marginInches: toInches(state.paper.margin, state.paper.unit),
      horizontalSpacingInches: toInches(state.paper.horizontalSpacing, state.paper.unit),
      verticalSpacingInches: toInches(state.paper.verticalSpacing, state.paper.unit),
      items: state.photoSizes.map((item) => ({
        id: item.id,
        widthInches: toInches(item.width, item.unit),
        heightInches: toInches(item.height, item.unit),
        quantity: item.quantity,
        allowRotation:
          state.paper.allowPhotoRotation && item.allowRotation,
        nameplate:
          item.nameplateEnabled && item.nameplate
            ? {
                enabled: true,
                position: item.nameplate.position,
                heightInches: measureNameplate({
                  settings: item.nameplate,
                  photoWidthInches: toInches(item.width, item.unit),
                }).totalHeightInches,
              }
            : undefined,
      })),
    });

    return {
      layoutResult: result,
      layoutError: null,
      activePageIndex: Math.min(
        state.activePageIndex,
        Math.max(result.pages.length - 1, 0),
      ),
    };
  } catch (error) {
    return {
      layoutResult: null,
      layoutError: error instanceof Error ? error.message : "The layout could not be calculated.",
      activePageIndex: 0,
    };
  }
}

function getServiceSetModificationState(
  state: EditorState,
  changes: Partial<
    Pick<
      EditorState,
      | "photoSizes"
      | "paper"
      | "backgroundMode"
      | "backgroundColor"
    >
  >,
): EditorState["serviceSetModificationState"] {
  if (!state.appliedServiceSetSnapshot) {
    return "unselected";
  }
  const fingerprint = createServiceSetConfigurationFingerprint({
    photoSizes: changes.photoSizes ?? state.photoSizes,
    paper: changes.paper ?? state.paper,
    backgroundMode: changes.backgroundMode ?? state.backgroundMode,
    backgroundColor: changes.backgroundColor ?? state.backgroundColor,
  });
  return fingerprint ===
    state.appliedServiceSetSnapshot.normalizedConfigurationHash
    ? "applied"
    : "modified";
}

function updatePaperAndLayout(
  state: EditorState,
  paper: PaperSettings,
): Partial<EditorState> {
  const candidateState: EditorState = {
    ...state,
    paper,
    activePageIndex: 0,
  };
  const validation = paperSettingsSchema.safeParse(paper);
  const printableArea = validation.success
    ? calculatePrintableArea(paper)
    : null;

  if (!validation.success || !printableArea?.isValid) {
    return {
      layoutError:
        validation.success
          ? printableArea?.error ?? "The paper settings are invalid."
          : validation.error.issues[0]?.message ??
            "The paper settings are invalid.",
    };
  }

  return {
    paper,
    serviceSetModificationState: getServiceSetModificationState(state, {
      paper,
    }),
    ...calculateEditorLayout(candidateState),
  };
}

function createCustomPaperPresetId(
  presets: EditorState["customPaperPresets"],
): string {
  let candidate: string;
  do {
    customPaperPresetSequence += 1;
    candidate = `custom-paper-${customPaperPresetSequence}`;
  } while (presets.some((preset) => preset.id === candidate));
  return candidate;
}

function hasPaperPresetNameConflict(
  presets: EditorState["customPaperPresets"],
  name: string,
  excludedId?: string,
): boolean {
  const normalizedName = name.trim().toLocaleLowerCase();
  return presets.some(
    (preset) =>
      preset.id !== excludedId &&
      preset.name.trim().toLocaleLowerCase() === normalizedName,
  );
}

function createDuplicatePaperName(
  presets: EditorState["customPaperPresets"],
  sourceName: string,
): string {
  const baseName = `${sourceName.slice(0, 45)} Copy`;
  let candidate = baseName;
  let suffix = 2;
  while (hasPaperPresetNameConflict(presets, candidate)) {
    const numericSuffix = ` ${suffix}`;
    candidate = `${baseName.slice(0, 50 - numericSuffix.length)}${numericSuffix}`;
    suffix += 1;
  }
  return candidate;
}

function customPresetToPaperSettings(
  preset: CustomPaperPreset,
): PaperSettings {
  return {
    presetId: preset.id,
    name: preset.name,
    width: preset.width,
    height: preset.height,
    unit: preset.unit,
    orientation: preset.orientation,
    margin: preset.margin,
    horizontalSpacing: preset.horizontalSpacing,
    verticalSpacing: preset.verticalSpacing,
    cuttingGuidesEnabled: preset.cuttingGuidesEnabled,
    sizeLabelsEnabled: preset.sizeLabelsEnabled,
    allowPhotoRotation: preset.allowPhotoRotation,
    autoArrangeMode: preset.autoArrangeMode,
  };
}

function updatePhotoSizesAndLayout(
  state: EditorState,
  photoSizes: PhotoSizeItem[],
): Partial<EditorState> {
  const nextState: EditorState = {
    ...state,
    photoSizes,
    activePageIndex: 0,
  };

  return {
    photoSizes,
    serviceSetModificationState: getServiceSetModificationState(state, {
      photoSizes,
    }),
    ...calculateEditorLayout(nextState),
  };
}

function clampPhotoQuantity(quantity: number, fallback: number): number {
  if (!Number.isFinite(quantity)) {
    return fallback;
  }
  return Math.max(1, Math.min(Math.trunc(quantity), 500));
}

function createDuplicateName(name: string): string {
  const suffix = " Copy";
  if (name.endsWith(suffix)) {
    return name;
  }
  return `${name.slice(0, 50 - suffix.length)}${suffix}`;
}

const initialState = createInitialState();

export const useEditorStore = create<EditorStore>()(
  persist(
    (set, get) => ({
  ...initialState,
  ...calculateEditorLayout(initialState),
  replaceSourcePhoto: (file) => {
    const objectUrl = URL.createObjectURL(file);
    const previousObjectUrl = get().sourceObjectUrl;
    set({
      sourceFile: file,
      sourceObjectUrl: objectUrl,
      crop: createDefaultCropState(),
    });
    revokeObjectUrl(previousObjectUrl);
  },
  removeSourcePhoto: () => {
    const objectUrl = get().sourceObjectUrl;
    set({
      sourceFile: null,
      sourceObjectUrl: null,
      crop: createDefaultCropState(),
    });
    revokeObjectUrl(objectUrl);
  },
  disposeSourcePhoto: () => {
    const objectUrl = get().sourceObjectUrl;
    if (!objectUrl) {
      return;
    }
    set({
      sourceFile: null,
      sourceObjectUrl: null,
      crop: createDefaultCropState(),
    });
    revokeObjectUrl(objectUrl);
  },
  setNormalizedCrop: (normalizedCrop) => {
    set((state) => ({
      crop: {
        ...state.crop,
        ...normalizedCrop,
      },
    }));
  },
  setCropZoom: (zoom) => {
    set((state) => ({
      crop: { ...state.crop, zoom: Math.max(1, Math.min(zoom, 3)) },
    }));
  },
  setCropRotation: (rotation) => {
    set((state) => ({
      crop: { ...state.crop, rotation: Math.max(-180, Math.min(rotation, 180)) },
    }));
  },
  setCropMode: (cropMode) => set({ cropMode }),
  resetCrop: () => set({ crop: createDefaultCropState() }),
  setPaperPreset: (presetId) => {
    const preset = findPaperPreset(presetId);
    if (!preset) {
      return;
    }
    set((state) =>
      updatePaperAndLayout(
        state,
        createPaperSettingsFromPreset(preset, {
          cuttingGuidesEnabled: state.paper.cuttingGuidesEnabled,
          sizeLabelsEnabled: state.paper.sizeLabelsEnabled,
          allowPhotoRotation: state.paper.allowPhotoRotation,
          autoArrangeMode: state.paper.autoArrangeMode,
        }),
      ),
    );
  },
  setPaperName: (name) => {
    set((state) => {
      if (state.paper.name === name) {
        return {};
      }
      return updatePaperAndLayout(state, {
        ...state.paper,
        presetId: null,
        name,
      });
    });
  },
  setPaperDimensions: (width, height, unit) => {
    set((state) => {
      if (
        state.paper.width === width &&
        state.paper.height === height &&
        state.paper.unit === unit
      ) {
        return {};
      }
      return updatePaperAndLayout(state, {
        ...state.paper,
        presetId: null,
        width,
        height,
        unit,
      });
    });
  },
  setPaperUnit: (unit) => {
    set((state) => {
      if (state.paper.unit === unit) {
        return {};
      }
      const fromUnit = state.paper.unit;
      return updatePaperAndLayout(state, {
        ...state.paper,
        width: convertMeasurement(state.paper.width, fromUnit, unit),
        height: convertMeasurement(state.paper.height, fromUnit, unit),
        margin: convertMeasurement(state.paper.margin, fromUnit, unit),
        horizontalSpacing: convertMeasurement(
          state.paper.horizontalSpacing,
          fromUnit,
          unit,
        ),
        verticalSpacing: convertMeasurement(
          state.paper.verticalSpacing,
          fromUnit,
          unit,
        ),
        unit,
      });
    });
  },
  setPaperOrientation: (orientation) => {
    set((state) =>
      updatePaperAndLayout(state, {
        ...state.paper,
        orientation,
      }),
    );
  },
  setPaperMargin: (margin) => {
    set((state) =>
      updatePaperAndLayout(state, {
        ...state.paper,
        margin,
      }),
    );
  },
  setHorizontalSpacing: (horizontalSpacing) => {
    set((state) =>
      updatePaperAndLayout(state, {
        ...state.paper,
        horizontalSpacing,
      }),
    );
  },
  setVerticalSpacing: (verticalSpacing) => {
    set((state) =>
      updatePaperAndLayout(state, {
        ...state.paper,
        verticalSpacing,
      }),
    );
  },
  setCuttingGuidesEnabled: (cuttingGuidesEnabled) => {
    set((state) => ({
      paper: { ...state.paper, cuttingGuidesEnabled },
      serviceSetModificationState: getServiceSetModificationState(state, {
        paper: { ...state.paper, cuttingGuidesEnabled },
      }),
    }));
  },
  setSizeLabelsEnabled: (sizeLabelsEnabled) => {
    set((state) => ({
      paper: { ...state.paper, sizeLabelsEnabled },
      serviceSetModificationState: getServiceSetModificationState(state, {
        paper: { ...state.paper, sizeLabelsEnabled },
      }),
    }));
  },
  setGlobalPhotoRotation: (allowPhotoRotation) => {
    set((state) =>
      updatePaperAndLayout(state, {
        ...state.paper,
        allowPhotoRotation,
      }),
    );
  },
  setAutoArrangeMode: (autoArrangeMode) => {
    set((state) =>
      updatePaperAndLayout(state, {
        ...state.paper,
        autoArrangeMode,
      }),
    );
  },
  saveCustomPaperPreset: (preset) => {
    const parsedPreset = paperSettingsSchema.safeParse({
      ...preset,
      presetId: null,
    });
    const state = get();
    if (
      !parsedPreset.success ||
      hasPaperPresetNameConflict(state.customPaperPresets, preset.name)
    ) {
      return null;
    }

    const id = createCustomPaperPresetId(state.customPaperPresets);
    const timestamp = new Date().toISOString();
    const savedPreset: CustomPaperPreset = {
      ...parsedPreset.data,
      id,
      presetId: null,
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    set((currentState) => {
      const paper = {
        ...parsedPreset.data,
        presetId: id,
      };
      return {
        customPaperPresets: [
          ...currentState.customPaperPresets,
          savedPreset,
        ],
        ...updatePaperAndLayout(currentState, paper),
      };
    });
    return id;
  },
  updateCustomPaperPreset: (presetId, changes) => {
    const state = get();
    const preset = state.customPaperPresets.find(
      (item) => item.id === presetId,
    );
    if (!preset) {
      return false;
    }
    const candidate = {
      ...preset,
      ...changes,
      presetId: null,
    };
    const parsedPreset = paperSettingsSchema.safeParse(candidate);
    if (
      !parsedPreset.success ||
      hasPaperPresetNameConflict(
        state.customPaperPresets,
        candidate.name,
        presetId,
      )
    ) {
      return false;
    }

    const updatedAt = new Date().toISOString();
    set((currentState) => {
      const customPaperPresets: CustomPaperPreset[] =
        currentState.customPaperPresets.map(
        (item) =>
          item.id === presetId
            ? {
                ...item,
                ...parsedPreset.data,
                presetId: null,
                updatedAt,
              }
            : item,
        );
      const paper =
        currentState.paper.presetId === presetId
          ? { ...parsedPreset.data, presetId }
          : currentState.paper;
      return {
        customPaperPresets,
        ...updatePaperAndLayout(currentState, paper),
      };
    });
    return true;
  },
  duplicateCustomPaperPreset: (presetId) => {
    const state = get();
    const source = state.customPaperPresets.find(
      (item) => item.id === presetId,
    );
    if (!source) {
      return null;
    }
    const id = createCustomPaperPresetId(state.customPaperPresets);
    const timestamp = new Date().toISOString();
    const duplicate = {
      ...source,
      id,
      name: createDuplicatePaperName(
        state.customPaperPresets,
        source.name,
      ),
      createdAt: timestamp,
      updatedAt: timestamp,
    };
    set({
      customPaperPresets: [...state.customPaperPresets, duplicate],
    });
    return id;
  },
  removeCustomPaperPreset: (presetId) => {
    set((state) => ({
      customPaperPresets: state.customPaperPresets.filter(
        (preset) => preset.id !== presetId,
      ),
      paper:
        state.paper.presetId === presetId
          ? { ...state.paper, presetId: null }
          : state.paper,
    }));
  },
  applyCustomPaperPreset: (presetId) => {
    set((state) => {
      const preset = state.customPaperPresets.find(
        (item) => item.id === presetId,
      );
      if (!preset) {
        return {};
      }
      return updatePaperAndLayout(
        state,
        customPresetToPaperSettings(preset),
      );
    });
  },
  resetPaperSettings: () => {
    set((state) =>
      updatePaperAndLayout(
        state,
        createPaperSettingsFromPreset(defaultPaperPreset),
      ),
    );
  },
  addPhotoSizeFromPreset: (presetId) => {
    const preset = findPhotoSizePreset(presetId);
    if (!preset || preset.category === "custom") {
      return;
    }
    set((state) => {
      const existingIds = state.photoSizes.map((item) => item.id);
      return updatePhotoSizesAndLayout(state, [
        ...state.photoSizes,
        createPhotoSizeItemFromPreset(
          preset,
          preset.defaultQuantity,
          existingIds,
        ),
      ]);
    });
  },
  addCustomPhotoSize: (item) => {
    set((state) => {
      const existingIds = state.photoSizes.map(
        (photoSize) => photoSize.id,
      );
      return updatePhotoSizesAndLayout(state, [
        ...state.photoSizes,
        createCustomPhotoSizeItem(item, existingIds),
      ]);
    });
  },
  updatePhotoSize: (itemId, changes) => {
    set((state) =>
      updatePhotoSizesAndLayout(
        state,
        state.photoSizes.map((item) =>
          item.id === itemId ? { ...item, ...changes } : item,
        ),
      ),
    );
  },
  duplicatePhotoSize: (itemId) => {
    set((state) => {
      const sourceIndex = state.photoSizes.findIndex(
        (item) => item.id === itemId,
      );
      if (sourceIndex < 0) {
        return {};
      }
      const sourceItem = state.photoSizes[sourceIndex];
      const duplicate = createCustomPhotoSizeItem(
        {
          source: sourceItem.source,
          presetId: sourceItem.presetId,
          passportPresetId: sourceItem.passportPresetId,
          name: createDuplicateName(sourceItem.name),
          width: sourceItem.width,
          height: sourceItem.height,
          unit: sourceItem.unit,
          quantity: sourceItem.quantity,
          allowRotation: sourceItem.allowRotation,
          nameplateEnabled: sourceItem.nameplateEnabled,
          nameplate: sourceItem.nameplate
            ? { ...sourceItem.nameplate }
            : undefined,
        },
        state.photoSizes.map((item) => item.id),
      );
      const photoSizes = [...state.photoSizes];
      photoSizes.splice(sourceIndex + 1, 0, duplicate);
      return updatePhotoSizesAndLayout(state, photoSizes);
    });
  },
  removePhotoSize: (itemId) => {
    set((state) =>
      updatePhotoSizesAndLayout(
        state,
        state.photoSizes.filter((item) => item.id !== itemId),
      ),
    );
  },
  setPhotoSizeQuantity: (itemId, quantity) => {
    set((state) =>
      updatePhotoSizesAndLayout(
        state,
        state.photoSizes.map((item) =>
          item.id === itemId
            ? {
                ...item,
                quantity: clampPhotoQuantity(quantity, item.quantity),
              }
            : item,
        ),
      ),
    );
  },
  setPhotoSizeRotation: (itemId, allowRotation) => {
    set((state) =>
      updatePhotoSizesAndLayout(
        state,
        state.photoSizes.map((item) =>
          item.id === itemId ? { ...item, allowRotation } : item,
        ),
      ),
    );
  },
  setPhotoSizeNameplate: (itemId, nameplateEnabled) => {
    set((state) =>
      updatePhotoSizesAndLayout(
        state,
        state.photoSizes.map((item) =>
          item.id === itemId
            ? {
                ...item,
                nameplateEnabled,
                nameplate: {
                  ...(item.nameplate ?? createNameplateSettings()),
                  enabled: nameplateEnabled,
                },
              }
            : item,
        ),
      ),
    );
  },
  setPhotoSizeNameplatePreset: (itemId, presetType) => {
    set((state) =>
      updatePhotoSizesAndLayout(
        state,
        state.photoSizes.map((item) =>
          item.id === itemId
            ? {
                ...item,
                nameplateEnabled: true,
                nameplate: createNameplateSettings(presetType),
              }
            : item,
        ),
      ),
    );
  },
  updatePhotoSizeNameplate: (itemId, changes) => {
    const source = get().photoSizes.find((item) => item.id === itemId);
    if (!source) {
      return false;
    }
    const candidate = nameplateSettingsSchema.safeParse({
      ...(source.nameplate ?? createNameplateSettings()),
      ...changes,
    });
    if (!candidate.success) {
      return false;
    }
    set((state) =>
      updatePhotoSizesAndLayout(
        state,
        state.photoSizes.map((item) =>
          item.id === itemId
            ? {
                ...item,
                nameplateEnabled: candidate.data.enabled,
                nameplate: candidate.data,
              }
            : item,
        ),
      ),
    );
    return true;
  },
  resetPhotoSizeNameplate: (itemId) => {
    set((state) =>
      updatePhotoSizesAndLayout(
        state,
        state.photoSizes.map((item) =>
          item.id === itemId
            ? {
                ...item,
                nameplateEnabled: false,
                nameplate: {
                  ...createNameplateSettings(),
                  enabled: false,
                },
              }
            : item,
        ),
      ),
    );
  },
  applyNameplateToAllPhotoSizes: (sourceItemId) => {
    const source = get().photoSizes.find(
      (item) => item.id === sourceItemId,
    );
    if (!source?.nameplate) {
      return;
    }
    set((state) =>
      updatePhotoSizesAndLayout(
        state,
        state.photoSizes.map((item) => ({
          ...item,
          nameplateEnabled: source.nameplateEnabled,
          nameplate: { ...source.nameplate! },
        })),
      ),
    );
  },
  applyPassportPreset: (presetId, mode = "add") => {
    const state = get();
    const preset = state.passportPresets.find(
      (candidate) => candidate.id === presetId,
    );
    if (!preset) {
      return false;
    }
    const existingIds = state.photoSizes.map((item) => item.id);
    const passportItem: PhotoSizeItem = {
      id: createCustomPhotoSizeItem(
        {
          source: "passport",
          passportPresetId: preset.id,
          name: preset.name,
          width: preset.width,
          height: preset.height,
          unit: preset.unit,
          quantity: 1,
          allowRotation: false,
          nameplateEnabled: false,
          nameplate: {
            ...createNameplateSettings(),
            enabled: false,
          },
        },
        existingIds,
      ).id,
      source: "passport",
      passportPresetId: preset.id,
      name: preset.name,
      width: preset.width,
      height: preset.height,
      unit: preset.unit,
      quantity: 1,
      allowRotation: false,
      nameplateEnabled: false,
      nameplate: {
        ...createNameplateSettings(),
        enabled: false,
      },
    };
    const photoSizes =
      mode === "replace"
        ? [
            ...state.photoSizes.filter(
              (item) => !item.passportPresetId,
            ),
            passportItem,
          ]
        : [...state.photoSizes, passportItem];
    const backgroundColor =
      preset.defaultBackgroundColor ?? state.backgroundColor;
    const candidateState: EditorState = {
      ...state,
      photoSizes,
      selectedPassportPresetId: preset.id,
      passportBackgroundRecommendation:
        preset.defaultBackgroundColor ?? null,
      recentPassportPresetIds: recordRecentPassportPresetOperation(
        state.recentPassportPresetIds,
        preset.id,
      ),
      backgroundMode: preset.defaultBackgroundColor
        ? "solid"
        : state.backgroundMode,
      backgroundColor,
    };
    set({
      photoSizes,
      selectedPassportPresetId: preset.id,
      passportBackgroundRecommendation:
        preset.defaultBackgroundColor ?? null,
      recentPassportPresetIds: candidateState.recentPassportPresetIds,
      backgroundMode: candidateState.backgroundMode,
      backgroundColor,
      ...calculateEditorLayout(candidateState),
    });
    return true;
  },
  togglePassportPresetFavorite: (presetId) => {
    set((state) => {
      if (!state.passportPresets.some((preset) => preset.id === presetId)) {
        return {};
      }
      const isFavorite =
        state.favoritePassportPresetIds.includes(presetId);
      const favoritePassportPresetIds = isFavorite
        ? state.favoritePassportPresetIds.filter((id) => id !== presetId)
        : [...state.favoritePassportPresetIds, presetId];
      return {
        favoritePassportPresetIds,
        passportPresets: state.passportPresets.map((preset) =>
          preset.id === presetId
            ? { ...preset, isFavorite: !isFavorite }
            : preset,
        ),
      };
    });
  },
  createCustomPassportPreset: (input) => {
    const created = createCustomPassportPresetOperation(
      get().passportPresets,
      input,
    );
    if (!created) {
      return null;
    }
    set((state) => ({
      passportPresets: [...state.passportPresets, created],
      favoritePassportPresetIds: created.isFavorite
        ? [...state.favoritePassportPresetIds, created.id]
        : state.favoritePassportPresetIds,
    }));
    return created.id;
  },
  updateCustomPassportPreset: (presetId, changes) => {
    const passportPresets = updateCustomPassportPresetOperation(
      get().passportPresets,
      presetId,
      changes,
    );
    if (!passportPresets) {
      return false;
    }
    const updatedPreset = passportPresets.find(
      (preset) => preset.id === presetId,
    );
    set((state) => ({
      passportPresets,
      favoritePassportPresetIds: updatedPreset?.isFavorite
        ? [
            ...state.favoritePassportPresetIds.filter(
              (id) => id !== presetId,
            ),
            presetId,
          ]
        : state.favoritePassportPresetIds.filter(
            (id) => id !== presetId,
          ),
    }));
    return true;
  },
  duplicatePassportPreset: (presetId) => {
    const duplicate = duplicatePassportPresetOperation(
      get().passportPresets,
      presetId,
    );
    if (!duplicate) {
      return null;
    }
    set((state) => ({
      passportPresets: [...state.passportPresets, duplicate],
    }));
    return duplicate.id;
  },
  removeCustomPassportPreset: (presetId) => {
    const passportPresets = removeCustomPassportPresetOperation(
      get().passportPresets,
      presetId,
    );
    if (!passportPresets) {
      return false;
    }
    set((state) => ({
      passportPresets,
      favoritePassportPresetIds:
        state.favoritePassportPresetIds.filter((id) => id !== presetId),
      recentPassportPresetIds:
        state.recentPassportPresetIds.filter((id) => id !== presetId),
      selectedPassportPresetId:
        state.selectedPassportPresetId === presetId
          ? null
          : state.selectedPassportPresetId,
    }));
    return true;
  },
  clearPhotoSizes: () => {
    set((state) => updatePhotoSizesAndLayout(state, []));
  },
  replacePhotoSizes: (photoSizes) => {
    set((state) => updatePhotoSizesAndLayout(state, photoSizes));
  },
  selectServiceSet: (serviceSetId) => {
    get().applyServiceSet(serviceSetId);
  },
  applyServiceSet: (serviceSetId) => {
    const state = get();
    const serviceSet = state.serviceSets.find(
      (item) => item.id === serviceSetId,
    );
    const parsed = serviceSetSchema.safeParse(serviceSet);
    if (
      !serviceSet ||
      serviceSet.status === "disabled" ||
      !parsed.success
    ) {
      return false;
    }
    try {
      const configuration =
        createEditorConfigurationFromServiceSet(parsed.data);
      const candidateState: EditorState = {
        ...state,
        ...configuration,
        selectedServiceSetId: serviceSetId,
        activePageIndex: 0,
      };
      const normalizedConfigurationHash =
        createServiceSetConfigurationFingerprint(configuration);
      set({
        ...configuration,
        selectedServiceSetId: serviceSetId,
        appliedServiceSetSnapshot: {
          serviceSetId,
          serviceSetName: serviceSet.name,
          price: serviceSet.price,
          currencyCode: serviceSet.currencyCode,
          normalizedConfigurationHash,
          appliedAt: new Date().toISOString(),
        },
        serviceSetModificationState: "applied",
        ...calculateEditorLayout(candidateState),
      });
      return true;
    } catch {
      return false;
    }
  },
  clearSelectedServiceSet: () =>
    set({
      selectedServiceSetId: null,
      appliedServiceSetSnapshot: null,
      serviceSetModificationState: "unselected",
    }),
  reapplySelectedServiceSet: () => {
    const serviceSetId = get().selectedServiceSetId;
    return serviceSetId ? get().applyServiceSet(serviceSetId) : false;
  },
  setBackgroundPreference: (preference) => {
    set((state) => {
      const backgroundMode = preference.mode;
      const backgroundColor =
        preference.mode === "solid" ? preference.color : "#ffffff";
      return {
        backgroundMode,
        backgroundColor,
        serviceSetModificationState: getServiceSetModificationState(
          state,
          { backgroundMode, backgroundColor },
        ),
      };
    });
  },
  createServiceSet: (input) => {
    try {
      const result = createServiceSetOperation(get().serviceSets, input);
      set({ serviceSets: result.serviceSets });
      return result.created.id;
    } catch {
      return null;
    }
  },
  updateServiceSet: (serviceSetId, changes) => {
    const serviceSets = updateCustomServiceSet(
      get().serviceSets,
      serviceSetId,
      changes,
    );
    if (!serviceSets) {
      return false;
    }
    set({ serviceSets });
    return true;
  },
  duplicateServiceSet: (serviceSetId) => {
    const result = duplicateServiceSetOperation(
      get().serviceSets,
      serviceSetId,
    );
    if (!result) {
      return null;
    }
    set({ serviceSets: result.serviceSets });
    return result.duplicate.id;
  },
  removeServiceSet: (serviceSetId) => {
    const state = get();
    const serviceSets = removeCustomServiceSet(
      state.serviceSets,
      serviceSetId,
    );
    if (!serviceSets) {
      return false;
    }
    set({
      serviceSets,
      ...(state.selectedServiceSetId === serviceSetId
        ? {
            selectedServiceSetId: null,
            appliedServiceSetSnapshot: null,
            serviceSetModificationState: "unselected" as const,
          }
        : {}),
    });
    return true;
  },
  setServiceSetStatus: (serviceSetId, status) => {
    set((state) => ({
      serviceSets: setServiceSetStatusOperation(
        state.serviceSets,
        serviceSetId,
        status,
      ),
    }));
  },
  setDefaultServiceSet: (serviceSetId) => {
    const serviceSets = setDefaultServiceSetOperation(
      get().serviceSets,
      serviceSetId,
    );
    if (!serviceSets) {
      return false;
    }
    set({ serviceSets });
    return true;
  },
  moveServiceSet: (serviceSetId, direction) => {
    set((state) => ({
      serviceSets: moveServiceSetOperation(
        state.serviceSets,
        serviceSetId,
        direction,
      ),
    }));
  },
  saveCurrentEditorAsServiceSet: (metadata) => {
    const state = get();
    const paperPreset = state.paper.presetId
      ? findPaperPreset(state.paper.presetId)
      : undefined;
    const paper = paperPreset
      ? {
          source: "preset" as const,
          presetId: paperPreset.id,
          orientation: state.paper.orientation,
          margin: state.paper.margin,
          horizontalSpacing: state.paper.horizontalSpacing,
          verticalSpacing: state.paper.verticalSpacing,
          unit: state.paper.unit,
        }
      : {
          source: "custom" as const,
          name: state.paper.name,
          width: state.paper.width,
          height: state.paper.height,
          unit: state.paper.unit,
          orientation: state.paper.orientation,
          margin: state.paper.margin,
          horizontalSpacing: state.paper.horizontalSpacing,
          verticalSpacing: state.paper.verticalSpacing,
        };
    return get().createServiceSet({
      ...metadata,
      status: "enabled",
      isDefault: false,
      photoItems: state.photoSizes.map((item) => ({
        id: item.id,
        photoSizePresetId: item.presetId,
        passportPresetId: item.passportPresetId,
        name: item.name,
        width: item.width,
        height: item.height,
        unit: item.unit,
        quantity: item.quantity,
        allowRotation: item.allowRotation,
        nameplateEnabled: item.nameplateEnabled,
        nameplate: item.nameplate ? { ...item.nameplate } : undefined,
      })),
      paper,
      background:
        state.backgroundMode === "solid"
          ? { mode: "solid", color: state.backgroundColor }
          : { mode: state.backgroundMode },
      cuttingGuidesEnabled: state.paper.cuttingGuidesEnabled,
      sizeLabelsEnabled: state.paper.sizeLabelsEnabled,
      allowPhotoRotation: state.paper.allowPhotoRotation,
    });
  },
  setActivePage: (pageIndex) => {
    const pageCount = get().layoutResult?.pages.length ?? 0;
    set({
      activePageIndex: Math.max(0, Math.min(pageIndex, Math.max(pageCount - 1, 0))),
    });
  },
  setPreviewScale: (scale) =>
    set({ previewScale: Math.max(0.5, Math.min(scale, 3)) }),
  restoreWorkspaceSession: () => {
    if (typeof window === "undefined") {
      return;
    }
    const restoredWorkspace = parseEditorWorkspaceSessionStorage(
      window.sessionStorage.getItem(EDITOR_WORKSPACE_SESSION_KEY),
    );
    if (!restoredWorkspace) {
      return;
    }
    set({
      ...restoredWorkspace,
      sourceFile: null,
      sourceObjectUrl: null,
      crop: createDefaultCropState(),
      layoutError: null,
    });
    get().recalculateLayout();
  },
  recalculateLayout: () => set((state) => calculateEditorLayout(state)),
  resetEditor: () => {
    const objectUrl = get().sourceObjectUrl;
    const customPaperPresets = get().customPaperPresets;
    const serviceSets = get().serviceSets;
    const passportPresets = get().passportPresets;
    const favoritePassportPresetIds =
      get().favoritePassportPresetIds;
    const recentPassportPresetIds = get().recentPassportPresetIds;
    const nextState = createInitialState();
    nextState.customPaperPresets = customPaperPresets;
    nextState.serviceSets = serviceSets;
    nextState.passportPresets = passportPresets;
    nextState.favoritePassportPresetIds =
      favoritePassportPresetIds;
    nextState.recentPassportPresetIds = recentPassportPresetIds;
    set({ ...nextState, ...calculateEditorLayout(nextState) });
    revokeObjectUrl(objectUrl);
  },
    }),
    {
      name: EDITOR_WORKSPACE_SESSION_KEY,
      version: EDITOR_WORKSPACE_SESSION_VERSION,
      storage: createJSONStorage<PersistedEditorWorkspace>(
        () =>
          typeof window === "undefined"
            ? unavailableSessionStorage
            : window.sessionStorage,
      ),
      partialize: (state) => createPersistedEditorWorkspace(state),
      merge: (persistedState, currentState) => {
        const restoredWorkspace =
          parsePersistedEditorWorkspace(persistedState);
        if (!restoredWorkspace) {
          return currentState;
        }
        return {
          ...currentState,
          ...restoredWorkspace,
          sourceFile: null,
          sourceObjectUrl: null,
          crop: createDefaultCropState(),
          layoutResult: currentState.layoutResult,
          layoutError: null,
        };
      },
      skipHydration: true,
      onRehydrateStorage: () => (state, error) => {
        if (!error) {
          state?.recalculateLayout();
        }
      },
    },
  ),
);
