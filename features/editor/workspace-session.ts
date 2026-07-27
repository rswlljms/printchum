import { z } from "zod";

import type {
  CropMode,
  EditorState,
  PhotoSizeItem,
} from "@/features/editor/types";
import { paperSettingsSchema } from "@/lib/paper/schemas";
import { fromInches } from "@/lib/paper/conversions";
import { findPaperPreset } from "@/lib/paper/presets";
import { nameplateSettingsSchema } from "@/lib/nameplates/schemas";
import type {
  CustomPaperPreset,
  PaperSettings,
} from "@/lib/paper/types";

export type PersistedEditorWorkspace = Pick<
  EditorState,
  | "selectedServiceSetId"
  | "photoSizes"
  | "paper"
  | "customPaperPresets"
  | "cropMode"
  | "activePageIndex"
  | "previewScale"
>;

export const EDITOR_WORKSPACE_SESSION_KEY =
  "printchum-editor-workspace";
export const EDITOR_WORKSPACE_SESSION_VERSION = 2;

const photoSizeItemSessionSchema = z.object({
  id: z.string().min(1),
  source: z
    .enum(["standard", "custom", "service-set"])
    .optional(),
  presetId: z.string().min(1).optional(),
  name: z.string().trim().min(1).max(50),
  width: z.number().finite().positive(),
  height: z.number().finite().positive(),
  unit: z.enum(["in", "cm", "mm"]),
  quantity: z.number().int().min(1).max(500),
  allowRotation: z.boolean(),
  nameplateEnabled: z.boolean(),
  nameplate: nameplateSettingsSchema.optional(),
});

const customPaperMetadataSchema = z.object({
  id: z.string().min(1),
  presetId: z.null(),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
});

const paperSessionMetadataSchema = z.object({
  presetId: z.string().min(1).nullable(),
});

const workspaceSessionEnvelopeSchema = z.object({
  selectedServiceSetId: z.string().nullable(),
  photoSizes: z.array(photoSizeItemSessionSchema).max(500),
  paper: z.unknown(),
  customPaperPresets: z.array(z.unknown()).max(100),
  cropMode: z.enum([
    "keep-head-size",
    "fill-frame",
    "fit-with-padding",
  ]),
  activePageIndex: z.number().int().min(0),
  previewScale: z.number().finite().min(0.5).max(3),
});

const persistedStorageEnvelopeSchema = z.object({
  state: z.unknown(),
  version: z.union([
    z.literal(1),
    z.literal(EDITOR_WORKSPACE_SESSION_VERSION),
  ]),
});

export function migrateLegacyGuideSpacing(
  workspace: PersistedEditorWorkspace,
): PersistedEditorWorkspace {
  if (
    !workspace.paper.cuttingGuidesEnabled ||
    workspace.paper.horizontalSpacing !== 0 ||
    workspace.paper.verticalSpacing !== 0
  ) {
    return workspace;
  }

  const preset = workspace.paper.presetId
    ? findPaperPreset(workspace.paper.presetId)
    : undefined;
  return {
    ...workspace,
    paper: {
      ...workspace.paper,
      horizontalSpacing:
        preset?.defaultHorizontalSpacing ??
        fromInches(0.1, workspace.paper.unit),
      verticalSpacing:
        preset?.defaultVerticalSpacing ??
        fromInches(0.1, workspace.paper.unit),
    },
  };
}

function parseCustomPaperPreset(
  value: unknown,
): CustomPaperPreset | null {
  const metadata = customPaperMetadataSchema.safeParse(value);
  const paper = paperSettingsSchema.safeParse(value);
  if (!metadata.success || !paper.success) {
    return null;
  }

  return {
    ...paper.data,
    ...metadata.data,
  };
}

export function createPersistedEditorWorkspace(
  state: EditorState,
): PersistedEditorWorkspace {
  return {
    selectedServiceSetId: state.selectedServiceSetId,
    photoSizes: state.photoSizes.map((item) => {
      const photoSize: PhotoSizeItem = { ...item };
      delete photoSize.sourcePhotoId;
      return photoSize;
    }),
    paper: state.paper,
    customPaperPresets: state.customPaperPresets,
    cropMode: state.cropMode,
    activePageIndex: state.activePageIndex,
    previewScale: state.previewScale,
  };
}

export function parsePersistedEditorWorkspace(
  value: unknown,
): PersistedEditorWorkspace | null {
  const envelope = workspaceSessionEnvelopeSchema.safeParse(value);
  if (!envelope.success) {
    return null;
  }

  const paper = paperSettingsSchema.safeParse(envelope.data.paper);
  const paperMetadata = paperSessionMetadataSchema.safeParse(
    envelope.data.paper,
  );
  if (!paper.success || !paperMetadata.success) {
    return null;
  }

  const photoSizeIds = new Set<string>();
  for (const photoSize of envelope.data.photoSizes) {
    if (photoSizeIds.has(photoSize.id)) {
      return null;
    }
    photoSizeIds.add(photoSize.id);
  }

  const customPaperPresets: CustomPaperPreset[] = [];
  const customPresetIds = new Set<string>();
  for (const candidate of envelope.data.customPaperPresets) {
    const preset = parseCustomPaperPreset(candidate);
    if (!preset || customPresetIds.has(preset.id)) {
      return null;
    }
    customPresetIds.add(preset.id);
    customPaperPresets.push(preset);
  }

  return {
    selectedServiceSetId: envelope.data.selectedServiceSetId,
    photoSizes: envelope.data.photoSizes as PhotoSizeItem[],
    paper: {
      ...paper.data,
      ...paperMetadata.data,
    } as PaperSettings,
    customPaperPresets,
    cropMode: envelope.data.cropMode as CropMode,
    activePageIndex: envelope.data.activePageIndex,
    previewScale: envelope.data.previewScale,
  };
}

export function parseEditorWorkspaceSessionStorage(
  serializedValue: string | null,
): PersistedEditorWorkspace | null {
  if (!serializedValue) {
    return null;
  }

  try {
    const serializedEnvelope: unknown = JSON.parse(serializedValue);
    const envelope =
      persistedStorageEnvelopeSchema.safeParse(serializedEnvelope);
    if (!envelope.success) {
      return null;
    }
    const workspace = parsePersistedEditorWorkspace(envelope.data.state);
    if (!workspace) {
      return null;
    }
    return envelope.data.version === 1
      ? migrateLegacyGuideSpacing(workspace)
      : workspace;
  } catch {
    return null;
  }
}
