"use client";

import { create } from "zustand";

import { photoSizePresets, createPhotoSizeItem } from "@/features/editor/mock-data/photo-size-presets";
import { paperPresets } from "@/features/editor/mock-data/paper-presets";
import { serviceSets } from "@/features/editor/mock-data/service-sets";
import type {
  CropMode,
  CropState,
  EditorState,
  PaperPreset,
  PhotoSizeItem,
} from "@/features/editor/types";
import { calculateLayout } from "@/lib/layout-engine/calculate-layout";
import { convertMeasurement, toInches } from "@/lib/layout-engine/units";

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
  selectPaperPreset: (preset: PaperPreset) => void;
  setPaperOrientation: (orientation: "portrait" | "landscape") => void;
  setCuttingGuides: (enabled: boolean) => void;
  setSizeLabels: (enabled: boolean) => void;
  replacePhotoSizes: (photoSizes: PhotoSizeItem[]) => void;
  selectServiceSet: (serviceSetId: string) => void;
  setActivePage: (pageIndex: number) => void;
  setPreviewScale: (scale: number) => void;
  recalculateLayout: () => void;
  resetEditor: () => void;
};

export type EditorStore = EditorState & EditorActions;

const defaultPaperPreset = paperPresets[0];
const defaultPhotoPreset = photoSizePresets.find((preset) => preset.id === "2x2") ?? photoSizePresets[0];

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
    photoSizes: [createPhotoSizeItem(defaultPhotoPreset, 8)],
    paper: {
      ...defaultPaperPreset,
      orientation: "portrait",
      margin: 0.25,
      horizontalSpacing: 0.125,
      verticalSpacing: 0.125,
      cuttingGuides: true,
      sizeLabels: false,
      allowPhotoRotation: false,
      autoArrangeMode: "shelf",
    },
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
        id: item.instanceId,
        widthInches: toInches(item.width, item.unit),
        heightInches: toInches(item.height, item.unit),
        quantity: item.quantity,
        allowRotation: item.allowRotation || state.paper.allowPhotoRotation,
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

const initialState = createInitialState();

export const useEditorStore = create<EditorStore>((set, get) => ({
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
  selectPaperPreset: (preset) => {
    set((state) => {
      const nextState = {
        ...state,
        paper: {
          ...state.paper,
          ...preset,
          margin: convertMeasurement(
            state.paper.margin,
            state.paper.unit,
            preset.unit,
          ),
          horizontalSpacing: convertMeasurement(
            state.paper.horizontalSpacing,
            state.paper.unit,
            preset.unit,
          ),
          verticalSpacing: convertMeasurement(
            state.paper.verticalSpacing,
            state.paper.unit,
            preset.unit,
          ),
        },
        activePageIndex: 0,
      };
      return { ...nextState, ...calculateEditorLayout(nextState) };
    });
  },
  setPaperOrientation: (orientation) => {
    set((state) => {
      const nextState = {
        ...state,
        paper: { ...state.paper, orientation },
        activePageIndex: 0,
      };
      return { ...nextState, ...calculateEditorLayout(nextState) };
    });
  },
  setCuttingGuides: (cuttingGuides) => {
    set((state) => ({
      paper: { ...state.paper, cuttingGuides },
    }));
  },
  setSizeLabels: (sizeLabels) => {
    set((state) => ({
      paper: { ...state.paper, sizeLabels },
    }));
  },
  replacePhotoSizes: (photoSizes) => {
    set((state) => {
      const nextState = { ...state, photoSizes, activePageIndex: 0 };
      return { ...nextState, ...calculateEditorLayout(nextState) };
    });
  },
  selectServiceSet: (serviceSetId) => {
    const serviceSet = serviceSets.find((item) => item.id === serviceSetId);
    if (!serviceSet) {
      return;
    }
    const photoSizes = serviceSet.items.flatMap((item, index) => {
      const preset = photoSizePresets.find((candidate) => candidate.id === item.sizePresetId);
      if (!preset) {
        return [];
      }
      return [{
        ...createPhotoSizeItem(preset, item.quantity),
        instanceId: `${preset.id}-selection-${index + 1}`,
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
  setPreviewScale: (scale) => set({ previewScale: Math.max(0.5, Math.min(scale, 1.5)) }),
  recalculateLayout: () => set((state) => calculateEditorLayout(state)),
  resetEditor: () => {
    const objectUrl = get().sourceObjectUrl;
    const nextState = createInitialState();
    set({ ...nextState, ...calculateEditorLayout(nextState) });
    revokeObjectUrl(objectUrl);
  },
}));
