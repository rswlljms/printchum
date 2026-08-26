import { createPdfExportInputFromEditorState } from "@/lib/pdf/export-input";
import { downloadPdfResult } from "@/lib/pdf/download";
import { PdfExportError } from "@/lib/pdf/errors";
import { pdfExportService } from "@/lib/pdf/export-pdf";
import { paperPresets } from "@/lib/paper/presets";
import { nameplatePresets } from "@/lib/nameplates/presets";
import { useEditorStore } from "@/stores/editor-store";
import { useWorkspaceUiStore } from "@/stores/workspace-ui-store";

import {
  addPhotoSizeSchema,
  applyServiceSetSchema,
  configureNameplateSchema,
  configurePaperSchema,
  exportPdfSchema,
  getEditorSummarySchema,
  listNameplatePresetsSchema,
  listPaperPresetsSchema,
  listPhotoSizePresetsSchema,
  listServiceSetsSchema,
  openPrintDialogSchema,
  removePhotoSizeSchema,
  saveServiceSetSchema,
  setBackgroundSchema,
  setCropModeSchema,
  setPreviewPageSchema,
  updatePhotoSizeSchema,
} from "./input-schemas";
import { photoSizePresets } from "@/features/editor/photo-sizes/presets";
import type { PhotoSizeItem } from "@/features/editor/types";
import type { z } from "zod";

export type EditorToolResult =
  | ({ ok: true } & Record<string, unknown>)
  | ({ ok: false; error: string } & Record<string, unknown>);

function toolError(
  error: string,
  details?: Record<string, unknown>,
): EditorToolResult {
  return { ok: false, error, ...details };
}

function resultWithLayout(
  payload: Record<string, unknown>,
): EditorToolResult {
  const layoutError = useEditorStore.getState().layoutError;
  if (layoutError) {
    return { ok: false, error: layoutError, ...payload };
  }
  return { ok: true, ...payload };
}

function parseSchema<S extends z.ZodType>(
  schema: S,
  input: unknown,
):
  | { success: true; data: z.output<S> }
  | { success: false; error: EditorToolResult } {
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const path = issue?.path?.length ? `${issue.path.join(".")}: ` : "";
    return {
      success: false,
      error: toolError(
        `Invalid input. ${path}${issue?.message ?? "Unknown validation failure."}`,
        { received: typeof input === "object" && input !== null ? Object.keys(input) : [] },
      ),
    };
  }
  return { success: true, data: parsed.data };
}

function describeLayout(): Record<string, unknown> {
  const state = useEditorStore.getState();
  return {
    layout: state.layoutResult
      ? {
          pageCount: state.layoutResult.pages.length,
          totalItems: state.layoutResult.totalItems,
          placedItems: state.layoutResult.placedItems,
          utilizationPercent: state.layoutResult.utilizationPercent,
          activePageIndex: state.activePageIndex,
          unplacedCount: state.layoutResult.unplacedItems.length,
        }
      : null,
    layoutError: state.layoutError,
  };
}

function requirePhotoSizeItem(
  itemId: string,
): { item: PhotoSizeItem } | { failure: EditorToolResult } {
  const state = useEditorStore.getState();
  const item = state.photoSizes.find((candidate) => candidate.id === itemId);
  if (!item) {
    return {
      failure: toolError(`No photo size item with id "${itemId}".`, {
        availableItemIds: state.photoSizes.map((candidate) => candidate.id),
      }),
    };
  }
  return { item };
}

export function getEditorSummaryHandler(input: unknown): EditorToolResult {
  const parsed = parseSchema(getEditorSummarySchema, input);
  if (!parsed.success) {
    return parsed.error;
  }
  const state = useEditorStore.getState();
  const selectedSnapshot = state.appliedServiceSetSnapshot;
  return {
    ok: true,
    hasSourcePhoto: state.sourcePhotos.length > 0,
    photoCount: state.sourcePhotos.length,
    paper: {
      name: state.paper.name,
      presetId: state.paper.presetId,
      width: state.paper.width,
      height: state.paper.height,
      unit: state.paper.unit,
      orientation: state.paper.orientation,
      margin: state.paper.margin,
      horizontalSpacing: state.paper.horizontalSpacing,
      verticalSpacing: state.paper.verticalSpacing,
      cuttingGuidesEnabled: state.paper.cuttingGuidesEnabled,
      sizeLabelsEnabled: state.paper.sizeLabelsEnabled,
    },
    photoSizes: state.photoSizes.map((item) => ({
      id: item.id,
      name: item.name,
      width: item.width,
      height: item.height,
      unit: item.unit,
      quantity: item.quantity,
      allowRotation: item.allowRotation,
      nameplateEnabled: item.nameplateEnabled && Boolean(item.nameplate?.enabled),
    })),
    selectedServiceSet: selectedSnapshot
      ? {
          id: selectedSnapshot.serviceSetId,
          name: selectedSnapshot.serviceSetName,
          modificationState: state.serviceSetModificationState,
        }
      : null,
    unplacedItems: state.layoutResult?.unplacedItems.map((item) => ({
      sourceItemId: item.sourceItemId,
      reason: item.reason,
      message: item.message,
    })) ?? [],
    ...describeLayout(),
  };
}

export function listPaperPresetsHandler(input: unknown): EditorToolResult {
  const parsed = parseSchema(listPaperPresetsSchema, input);
  if (!parsed.success) {
    return parsed.error;
  }
  const state = useEditorStore.getState();
  return {
    ok: true,
    presets: paperPresets
      .filter((preset) => preset.category !== "custom")
      .map((preset) => ({
        id: preset.id,
        name: preset.name,
        description: preset.description ?? null,
        width: preset.width,
        height: preset.height,
        unit: preset.unit,
        defaultOrientation: preset.defaultOrientation,
      })),
    customPresets: state.customPaperPresets.map((preset) => ({
      id: preset.id,
      name: preset.name,
      width: preset.width,
      height: preset.height,
      unit: preset.unit,
      orientation: preset.orientation,
    })),
  };
}

export function listPhotoSizePresetsHandler(input: unknown): EditorToolResult {
  const parsed = parseSchema(listPhotoSizePresetsSchema, input);
  if (!parsed.success) {
    return parsed.error;
  }
  return {
    ok: true,
    presets: photoSizePresets
      .filter((preset) => preset.category !== "custom")
      .map((preset) => ({
        id: preset.id,
        name: preset.name,
        description: preset.description ?? null,
        width: preset.width,
        height: preset.height,
        unit: preset.unit,
        defaultQuantity: preset.defaultQuantity,
      })),
  };
}

export function listServiceSetsHandler(input: unknown): EditorToolResult {
  const parsed = parseSchema(listServiceSetsSchema, input);
  if (!parsed.success) {
    return parsed.error;
  }
  const state = useEditorStore.getState();
  return {
    ok: true,
    serviceSets: state.serviceSets.map((serviceSet) => ({
      id: serviceSet.id,
      name: serviceSet.name,
      description: serviceSet.description ?? null,
      price: serviceSet.price,
      currencyCode: serviceSet.currencyCode,
      status: serviceSet.status,
      isDefault: serviceSet.isDefault,
      isBuiltIn: serviceSet.isBuiltIn,
    })),
  };
}

export function configurePaperHandler(input: unknown): EditorToolResult {
  const parsed = parseSchema(configurePaperSchema, input);
  if (!parsed.success) {
    return parsed.error;
  }
  const args = parsed.data;
  const store = useEditorStore.getState();

  if (args.presetId !== undefined) {
    const preset = paperPresets.find(
      (candidate) =>
        candidate.id === args.presetId && candidate.category !== "custom",
    );
    if (!preset) {
      return toolError(`Unknown paper preset "${args.presetId}".`, {
        availablePresetIds: paperPresets
          .filter((candidate) => candidate.category !== "custom")
          .map((candidate) => candidate.id),
      });
    }
    store.setPaperPreset(preset.id);
  }

  if (
    args.width !== undefined &&
    args.height !== undefined &&
    args.unit !== undefined
  ) {
    useEditorStore.getState().setPaperDimensions(
      args.width,
      args.height,
      args.unit,
    );
  }

  const current = useEditorStore.getState();
  if (args.orientation !== undefined) {
    current.setPaperOrientation(args.orientation);
  }
  if (args.margin !== undefined) {
    useEditorStore.getState().setPaperMargin(args.margin);
  }
  if (args.horizontalSpacing !== undefined) {
    useEditorStore.getState().setHorizontalSpacing(args.horizontalSpacing);
  }
  if (args.verticalSpacing !== undefined) {
    useEditorStore.getState().setVerticalSpacing(args.verticalSpacing);
  }
  if (args.cuttingGuidesEnabled !== undefined) {
    useEditorStore
      .getState()
      .setCuttingGuidesEnabled(args.cuttingGuidesEnabled);
  }

  const finalState = useEditorStore.getState();
  return resultWithLayout({
    paper: finalState.paper,
    ...describeLayout(),
  });
}

export function addPhotoSizeHandler(input: unknown): EditorToolResult {
  const parsed = parseSchema(addPhotoSizeSchema, input);
  if (!parsed.success) {
    return parsed.error;
  }
  const args = parsed.data;
  const store = useEditorStore.getState();
  const existingIds = new Set(store.photoSizes.map((item) => item.id));

  if (args.presetId !== undefined) {
    const preset = photoSizePresets.find(
      (candidate) =>
        candidate.id === args.presetId && candidate.category !== "custom",
    );
    if (!preset) {
      return toolError(`Unknown photo size preset "${args.presetId}".`, {
        availablePresetIds: photoSizePresets
          .filter((candidate) => candidate.category !== "custom")
          .map((candidate) => candidate.id),
      });
    }
    store.addPhotoSizeFromPreset(preset.id);
  } else if (
    args.width !== undefined &&
    args.height !== undefined &&
    args.unit !== undefined
  ) {
    useEditorStore.getState().addCustomPhotoSize({
      name: `${args.width} × ${args.height}`,
      width: args.width,
      height: args.height,
      unit: args.unit,
      quantity: args.quantity ?? 1,
      allowRotation: args.allowRotation ?? false,
      nameplateEnabled: false,
    });
  }

  const nextState = useEditorStore.getState();
  const added = nextState.photoSizes.filter(
    (item) => !existingIds.has(item.id),
  );
  const addedItem = added[added.length - 1];

  if (!addedItem) {
    // Adding a preset that already exists only bumps its quantity.
    const activePhotoId = nextState.activeSourcePhotoId;
    const bumped = nextState.photoSizes.find(
      (item) =>
        args.presetId !== undefined &&
        item.presetId === args.presetId &&
        (item.sourcePhotoId === activePhotoId ||
          item.sourcePhotoId === undefined),
    );
    if (bumped && args.quantity !== undefined) {
      useEditorStore.getState().setPhotoSizeQuantity(bumped.id, args.quantity);
    }
    if (!bumped) {
      return toolError("The photo size could not be added.");
    }
    return finishAdd(bumped.id, undefined);
  }
  return finishAdd(addedItem.id, args.quantity);
}

function finishAdd(
  itemId: string,
  quantity: number | undefined,
): EditorToolResult {
  if (quantity !== undefined) {
    useEditorStore.getState().setPhotoSizeQuantity(itemId, quantity);
  }
  const item = useEditorStore
    .getState()
    .photoSizes.find((candidate) => candidate.id === itemId);
  if (!item) {
    return toolError("The photo size could not be added.");
  }
  return summarizeItem(item);
}

function summarizeItem(item: PhotoSizeItem): EditorToolResult {
  return resultWithLayout({
    item: {
      id: item.id,
      name: item.name,
      width: item.width,
      height: item.height,
      unit: item.unit,
      quantity: item.quantity,
      allowRotation: item.allowRotation,
      nameplateEnabled: item.nameplateEnabled,
    },
    ...describeLayout(),
  });
}

export function updatePhotoSizeHandler(input: unknown): EditorToolResult {
  const parsed = parseSchema(updatePhotoSizeSchema, input);
  if (!parsed.success) {
    return parsed.error;
  }
  const args = parsed.data;
  const found = requirePhotoSizeItem(args.itemId);
  if ("failure" in found) {
    return found.failure;
  }

  const store = useEditorStore.getState();
  if (args.quantity !== undefined) {
    store.setPhotoSizeQuantity(args.itemId, args.quantity);
  }
  if (args.allowRotation !== undefined) {
    useEditorStore.getState().setPhotoSizeRotation(args.itemId, args.allowRotation);
  }
  if (args.nameplateEnabled !== undefined) {
    useEditorStore
      .getState()
      .setPhotoSizeNameplate(args.itemId, args.nameplateEnabled);
  }

  const item = useEditorStore
    .getState()
    .photoSizes.find((candidate) => candidate.id === args.itemId);
  if (!item) {
    return toolError("The photo size item disappeared during update.");
  }
  return summarizeItem(item);
}

export function removePhotoSizeHandler(input: unknown): EditorToolResult {
  const parsed = parseSchema(removePhotoSizeSchema, input);
  if (!parsed.success) {
    return parsed.error;
  }
  const args = parsed.data;
  const found = requirePhotoSizeItem(args.itemId);
  if ("failure" in found) {
    return found.failure;
  }
  useEditorStore.getState().removePhotoSize(args.itemId);
  const state = useEditorStore.getState();
  return {
    ok: true,
    removedItemId: args.itemId,
    remainingItemCount: state.photoSizes.length,
    ...describeLayout(),
  };
}

export function applyServiceSetHandler(input: unknown): EditorToolResult {
  const parsed = parseSchema(applyServiceSetSchema, input);
  if (!parsed.success) {
    return parsed.error;
  }
  const args = parsed.data;
  const state = useEditorStore.getState();
  const serviceSet = state.serviceSets.find(
    (candidate) => candidate.id === args.serviceSetId,
  );
  if (!serviceSet) {
    return toolError(
      `No service set with id "${args.serviceSetId}".`,
      {
        availableServiceSetIds: state.serviceSets.map(
          (candidate) => candidate.id,
        ),
      },
    );
  }
  if (serviceSet.status === "disabled") {
    return toolError(
      `The service set "${serviceSet.name}" is disabled and cannot be applied.`,
    );
  }
  const applied = useEditorStore.getState().applyServiceSet(serviceSet.id);
  if (!applied) {
    return toolError("The service set configuration could not be applied.");
  }
  const nextState = useEditorStore.getState();
  return {
    ok: true,
    appliedServiceSet: {
      id: serviceSet.id,
      name: serviceSet.name,
    },
    photoSizeCount: nextState.photoSizes.length,
    ...describeLayout(),
  };
}

export function configureNameplateHandler(input: unknown): EditorToolResult {
  const parsed = parseSchema(configureNameplateSchema, input);
  if (!parsed.success) {
    return parsed.error;
  }
  const args = parsed.data;
  const found = requirePhotoSizeItem(args.itemId);
  if ("failure" in found) {
    return found.failure;
  }

  const {
    itemId,
    presetId,
    primaryText,
    secondaryText,
    thirdLineText,
    ...styleChanges
  } = args;

  if (presetId !== undefined) {
    useEditorStore
      .getState()
      .setPhotoSizeNameplatePreset(itemId, presetId);
  } else {
    useEditorStore.getState().setPhotoSizeNameplate(itemId, true);
  }

  const textChanges: Record<string, string> = {};
  if (primaryText !== undefined) {
    textChanges.primaryText = primaryText;
  }
  if (secondaryText !== undefined) {
    textChanges.secondaryText = secondaryText;
  }
  if (thirdLineText !== undefined) {
    textChanges.thirdLineText = thirdLineText;
  }
  const changes = { ...textChanges, ...styleChanges };

  if (Object.keys(changes).length > 0) {
    const updated = useEditorStore
      .getState()
      .updatePhotoSizeNameplate(itemId, changes);
    if (!updated) {
      return toolError(
        "The nameplate settings are invalid for this photo size.",
      );
    }
  }
  const state = useEditorStore.getState();
  const item = state.photoSizes.find((candidate) => candidate.id === itemId);
  const nameplate = item?.nameplate;
  return resultWithLayout({
    nameplate: nameplate
      ? {
          enabled: item?.nameplateEnabled ?? false,
          primaryText: nameplate.primaryText,
          secondaryText: nameplate.secondaryText ?? null,
          thirdLineText: nameplate.thirdLineText ?? null,
          position: nameplate.position,
          fontSizePoints: nameplate.fontSizePoints,
        }
      : null,
    ...describeLayout(),
  });
}

export async function exportPdfHandler(
  input: unknown,
): Promise<EditorToolResult> {
  const parsed = parseSchema(exportPdfSchema, input);
  if (!parsed.success) {
    return parsed.error;
  }
  const args = parsed.data;
  const state = useEditorStore.getState();
  if (!state.layoutResult || state.layoutResult.placedItems === 0) {
    return toolError(
      "There is no layout ready to export. Add at least one photo size that fits on the paper.",
    );
  }
  if (state.sourcePhotos.length === 0) {
    return toolError(
      "No photo is loaded. Ask the user to upload a photo in the editor; uploads are intentionally a manual step.",
    );
  }
  const exportInput = createPdfExportInputFromEditorState(state, {
    quality: args.quality ?? "high",
    filename: args.filename,
    pageIndexes: Array.from(
      { length: state.layoutResult.pages.length },
      (_, index) => index,
    ),
  });
  if (!exportInput) {
    return toolError("The layout is not ready to export.");
  }
  try {
    const result = await pdfExportService.exportLayout(exportInput);
    downloadPdfResult(result);
    return {
      ok: true,
      downloadedFilename: result.filename,
      pageCount: result.pageCount,
      byteLength: result.byteLength,
    };
  } catch (error) {
    if (error instanceof PdfExportError) {
      return toolError(error.userMessage);
    }
    return toolError("The PDF could not be generated. Try again.");
  }
}

export function openPrintDialogHandler(input: unknown): EditorToolResult {
  const parsed = parseSchema(openPrintDialogSchema, input);
  if (!parsed.success) {
    return parsed.error;
  }
  const state = useEditorStore.getState();
  const outputReady =
    Boolean(state.layoutResult) &&
    (state.layoutResult?.placedItems ?? 0) > 0 &&
    state.sourcePhotos.length > 0;
  if (!outputReady) {
    return toolError(
      "Nothing is ready to print yet. Load a photo and place at least one photo size first.",
    );
  }
  useWorkspaceUiStore.getState().setPrintDialogOpen(true);
  return {
    ok: true,
    message:
      "The print options dialog is now open for the user. The user must confirm printer settings such as Actual Size scaling.",
  };
}

export function setPreviewPageHandler(input: unknown): EditorToolResult {
  const parsed = parseSchema(setPreviewPageSchema, input);
  if (!parsed.success) {
    return parsed.error;
  }
  const args = parsed.data;
  const pageCount = useEditorStore.getState().layoutResult?.pages.length ?? 0;
  if (pageCount === 0) {
    return toolError(
      "There is no layout yet. Add at least one photo size to generate pages.",
    );
  }
  if (args.pageNumber > pageCount) {
    return toolError(
      `Page ${args.pageNumber} is out of range. This layout has ${pageCount} ${pageCount === 1 ? "page" : "pages"}.`,
      { pageCount },
    );
  }
  useEditorStore.getState().setActivePage(args.pageNumber - 1);
  return {
    ok: true,
    activePageNumber: args.pageNumber,
    pageCount,
    ...describeLayout(),
  };
}

export function setBackgroundHandler(input: unknown): EditorToolResult {
  const parsed = parseSchema(setBackgroundSchema, input);
  if (!parsed.success) {
    return parsed.error;
  }
  const args = parsed.data;
  useEditorStore
    .getState()
    .setBackgroundPreference(
      args.mode === "solid"
        ? { mode: "solid", color: args.color ?? "#ffffff" }
        : { mode: args.mode },
    );
  const state = useEditorStore.getState();
  return {
    ok: true,
    backgroundMode: state.backgroundMode,
    backgroundColor: state.backgroundColor,
    ...(args.mode === "transparent" && !state.backgroundRemoved
      ? {
          note: "Transparent output takes effect once the photo background has been removed; the original background is used until then.",
        }
      : {}),
  };
}

export function setCropModeHandler(input: unknown): EditorToolResult {
  const parsed = parseSchema(setCropModeSchema, input);
  if (!parsed.success) {
    return parsed.error;
  }
  const args = parsed.data;
  if (!useEditorStore.getState().activeSourcePhotoId) {
    return toolError(
      "No photo is loaded. Ask the user to upload a photo first; crop settings apply to the active photo.",
    );
  }
  useEditorStore.getState().setCropMode(args.mode);
  return {
    ok: true,
    cropMode: useEditorStore.getState().cropMode,
  };
}

export function listNameplatePresetsHandler(input: unknown): EditorToolResult {
  const parsed = parseSchema(listNameplatePresetsSchema, input);
  if (!parsed.success) {
    return parsed.error;
  }
  return {
    ok: true,
    presets: nameplatePresets.map((preset) => ({
      id: preset.id,
      name: preset.name,
      description: preset.description,
    })),
  };
}

export function saveServiceSetHandler(input: unknown): EditorToolResult {
  const parsed = parseSchema(saveServiceSetSchema, input);
  if (!parsed.success) {
    return parsed.error;
  }
  const args = parsed.data;
  const state = useEditorStore.getState();
  const activePhotoSizes = state.activeSourcePhotoId
    ? state.photoSizes.filter(
        (item) => item.sourcePhotoId === state.activeSourcePhotoId,
      )
    : state.photoSizes;
  if (activePhotoSizes.length === 0) {
    return toolError(
      "There are no photo sizes to save. Add at least one photo size first.",
    );
  }
  const currencyCode =
    args.currencyCode ?? state.serviceSets[0]?.currencyCode ?? "PHP";
  const serviceSetId = useEditorStore
    .getState()
    .saveCurrentEditorAsServiceSet({
      name: args.name,
      description: args.description,
      price: args.price ?? 0,
      currencyCode,
    });
  if (!serviceSetId) {
    return toolError("The service set could not be saved. Try again.");
  }
  const created = useEditorStore
    .getState()
    .serviceSets.find((candidate) => candidate.id === serviceSetId);
  return {
    ok: true,
    serviceSetId,
    name: created?.name ?? args.name,
    serviceSetCount: useEditorStore.getState().serviceSets.length,
  };
}
