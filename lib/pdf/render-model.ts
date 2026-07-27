import type { CropMode, CropState, PhotoSizeItem } from "@/features/editor/types";
import type { LayoutItem, LayoutResult } from "@/lib/layout-engine/types";
import { orientPaper } from "@/lib/layout-engine/paper-sizes";
import type { NameplateSettings } from "@/lib/nameplates/types";
import type { PaperSettings } from "@/lib/paper/types";
import { toInches } from "@/lib/paper/conversions";

export type PhysicalRectangle = {
  xInches: number;
  yInches: number;
  widthInches: number;
  heightInches: number;
};

export type RenderItemModel = {
  id: string;
  sourceItemId: string;
  sourcePhotoId?: string;
  pageIndex: number;
  placement: PhysicalRectangle;
  photoRect: PhysicalRectangle;
  nameplateRect?: PhysicalRectangle;
  rotation: 0 | 90;
  crop: CropState;
  cropMode: CropMode;
  sizeLabel: string;
  nameplate?: NameplateSettings;
};

export type RenderPhotoSource = {
  id: string;
  crop: CropState;
  cropMode: CropMode;
};

export type RenderPageModel = {
  pageIndex: number;
  widthInches: number;
  heightInches: number;
  items: RenderItemModel[];
};

function transformLocalRectangle(
  placement: PhysicalRectangle,
  local: PhysicalRectangle,
  rotation: 0 | 90,
): PhysicalRectangle {
  if (rotation === 0) {
    return {
      xInches: placement.xInches + local.xInches,
      yInches: placement.yInches + local.yInches,
      widthInches: local.widthInches,
      heightInches: local.heightInches,
    };
  }
  return {
    xInches:
      placement.xInches +
      placement.widthInches -
      local.yInches -
      local.heightInches,
    yInches: placement.yInches + local.xInches,
    widthInches: local.heightInches,
    heightInches: local.widthInches,
  };
}

function formatDimension(value: number): string {
  return Number(value.toFixed(3)).toString();
}

function createRenderItem(
  item: LayoutItem,
  source: PhotoSizeItem,
  crop: CropState,
  cropMode: CropMode,
  sourcePhotoId?: string,
): RenderItemModel {
  const placement: PhysicalRectangle = {
    xInches: item.xInches,
    yInches: item.yInches,
    widthInches: item.widthInches,
    heightInches: item.heightInches,
  };
  const localWidth =
    item.rotation === 90 ? item.heightInches : item.widthInches;
  const localHeight =
    item.rotation === 90 ? item.widthInches : item.heightInches;
  const photoWidth = Math.min(
    item.photoWidthInches ?? localWidth,
    localWidth,
  );
  const photoHeight = Math.min(
    item.photoHeightInches ?? localHeight,
    localHeight,
  );
  const nameplateHeight = Math.max(item.nameplateHeightInches ?? 0, 0);
  const position = item.nameplatePosition;
  const outside = position?.endsWith("-outside") ?? false;
  const top = position?.startsWith("top-") ?? false;
  const localPhoto: PhysicalRectangle = {
    xInches: 0,
    yInches: outside && top ? nameplateHeight : 0,
    widthInches: photoWidth,
    heightInches: photoHeight,
  };
  const localNameplate =
    source.nameplateEnabled &&
    source.nameplate?.enabled &&
    position &&
    nameplateHeight > 0
      ? {
          xInches: 0,
          yInches: outside
            ? top
              ? 0
              : localPhoto.yInches + localPhoto.heightInches
            : top
              ? localPhoto.yInches
              : localPhoto.yInches +
                Math.max(localPhoto.heightInches - nameplateHeight, 0),
          widthInches: localPhoto.widthInches,
          heightInches: Math.min(
            nameplateHeight,
            outside
              ? Math.max(localHeight - (
                  top ? 0 : localPhoto.yInches + localPhoto.heightInches
                ), 0)
              : localPhoto.heightInches,
          ),
        }
      : undefined;

  return {
    id: item.id,
    sourceItemId: item.sourceItemId,
    sourcePhotoId,
    pageIndex: item.pageIndex,
    placement,
    photoRect: transformLocalRectangle(
      placement,
      localPhoto,
      item.rotation,
    ),
    nameplateRect: localNameplate
      ? transformLocalRectangle(placement, localNameplate, item.rotation)
      : undefined,
    rotation: item.rotation,
    crop,
    cropMode,
    sizeLabel: `${formatDimension(source.width)} × ${formatDimension(source.height)} ${source.unit}`,
    nameplate:
      source.nameplateEnabled && source.nameplate?.enabled
        ? source.nameplate
        : undefined,
  };
}

export function createRenderPages(
  layoutResult: LayoutResult,
  paper: PaperSettings,
  photoSizes: PhotoSizeItem[],
  crop: CropState,
  cropMode: CropMode,
  photoSources: RenderPhotoSource[] = [],
): RenderPageModel[] {
  const paperSize = orientPaper(
    toInches(paper.width, paper.unit),
    toInches(paper.height, paper.unit),
    paper.orientation,
  );
  const sourceItems = new Map(photoSizes.map((item) => [item.id, item]));
  const sourcePhotos = new Map(
    photoSources.map((source) => [source.id, source]),
  );
  return layoutResult.pages.map((page) => ({
    pageIndex: page.pageIndex,
    widthInches: paperSize.widthInches,
    heightInches: paperSize.heightInches,
    items: page.items.flatMap((item) => {
      const source = sourceItems.get(item.sourceItemId);
      if (!source) {
        return [];
      }
      const sourcePhoto = source.sourcePhotoId
        ? sourcePhotos.get(source.sourcePhotoId)
        : undefined;
      return [
        createRenderItem(
          item,
          source,
          sourcePhoto?.crop ?? crop,
          sourcePhoto?.cropMode ?? cropMode,
          sourcePhoto?.id,
        ),
      ];
    }),
  }));
}
