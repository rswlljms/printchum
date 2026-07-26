"use client";

import { create } from "zustand";

import { photoSizePresets, createPhotoSizeItem } from "@/features/editor/mock-data/photo-size-presets";
import { paperPresets } from "@/features/editor/mock-data/paper-presets";
import { serviceSets } from "@/features/editor/mock-data/service-sets";
import type {
  EditorState,
  PaperPreset,
  PhotoSizeItem,
} from "@/features/editor/types";
import { calculateLayout } from "@/lib/layout-engine/calculate-layout";
import { convertMeasurement, toInches } from "@/lib/layout-engine/units";

type EditorActions = {
  selectPaperPreset: (preset: PaperPreset) => void;
  setPaperOrientation: (orientation: "portrait" | "landscape") => void;
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

function createInitialState(): EditorState {
  return {
    sourceFile: null,
    sourceObjectUrl: null,
    crop: {
      xPercent: 0,
      yPercent: 0,
      widthPercent: 100,
      heightPercent: 100,
      zoom: 1,
      rotation: 0,
    },
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
    const nextState = createInitialState();
    set({ ...nextState, ...calculateEditorLayout(nextState) });
  },
}));
