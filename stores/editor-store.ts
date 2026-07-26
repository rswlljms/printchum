"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import { serviceSets } from "@/features/editor/mock-data/service-sets";
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
import type {
  AutoArrangeMode,
  CustomPaperPreset,
  CustomPaperPresetChanges,
  NewCustomPaperPreset,
  PaperSettings,
} from "@/lib/paper/types";

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
  clearPhotoSizes: () => void;
  replacePhotoSizes: (photoSizes: PhotoSizeItem[]) => void;
  selectServiceSet: (serviceSetId: string) => void;
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
    selectedServiceSetId: null,
    photoSizes: [],
    paper: createPaperSettingsFromPreset(defaultPaperPreset),
    customPaperPresets: [],
    nameplate: {
      enabled: false,
      primaryText: "",
      secondaryText: "",
      thirdLine: "",
    },
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
  selectedServiceSetId: string | null = null,
): Partial<EditorState> {
  const nextState: EditorState = {
    ...state,
    photoSizes,
    selectedServiceSetId,
    activePageIndex: 0,
  };

  return {
    photoSizes,
    selectedServiceSetId,
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
    }));
  },
  setSizeLabelsEnabled: (sizeLabelsEnabled) => {
    set((state) => ({
      paper: { ...state.paper, sizeLabelsEnabled },
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
          presetId: sourceItem.presetId,
          name: createDuplicateName(sourceItem.name),
          width: sourceItem.width,
          height: sourceItem.height,
          unit: sourceItem.unit,
          quantity: sourceItem.quantity,
          allowRotation: sourceItem.allowRotation,
          nameplateEnabled: sourceItem.nameplateEnabled,
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
          item.id === itemId ? { ...item, nameplateEnabled } : item,
        ),
      ),
    );
  },
  clearPhotoSizes: () => {
    set((state) => updatePhotoSizesAndLayout(state, []));
  },
  replacePhotoSizes: (photoSizes) => {
    set((state) => updatePhotoSizesAndLayout(state, photoSizes));
  },
  selectServiceSet: (serviceSetId) => {
    const serviceSet = serviceSets.find((item) => item.id === serviceSetId);
    if (!serviceSet) {
      return;
    }
    const photoSizes = serviceSet.items.flatMap((item) => {
      const preset = findPhotoSizePreset(item.sizePresetId);
      if (!preset) {
        return [];
      }
      return [{
        ...createPhotoSizeItemFromPreset(preset, item.quantity),
      }];
    });
    set((state) => {
      const nextState = {
        ...state,
        selectedServiceSetId: serviceSetId,
        photoSizes,
        activePageIndex: 0,
      };
      return { ...nextState, ...calculateEditorLayout(nextState) };
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
    const nextState = createInitialState();
    nextState.customPaperPresets = customPaperPresets;
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
