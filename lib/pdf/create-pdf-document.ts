import {
  PDFDocument,
  StandardFonts,
} from "pdf-lib";

import { toInches } from "@/lib/paper/conversions";
import {
  PdfExportError,
  throwIfExportCancelled,
} from "@/lib/pdf/errors";
import {
  decodePdfImage,
  processPhotoForPdf,
  type ProcessedPdfImage,
} from "@/lib/pdf/image-processing";
import { createRenderPages } from "@/lib/pdf/render-model";
import {
  renderPdfCuttingGuides,
  renderPdfSizeLabel,
} from "@/lib/pdf/render-marks";
import { renderPdfNameplate } from "@/lib/pdf/render-nameplate";
import type {
  PdfExportContext,
  PdfExportInput,
} from "@/lib/pdf/types";
import {
  inchesToPdfPoints,
  topLeftToPdfCoordinates,
} from "@/lib/pdf/units";
import { validatePdfExport } from "@/lib/pdf/validation";

async function yieldToBrowser(): Promise<void> {
  await new Promise<void>((resolve) => {
    if (typeof requestAnimationFrame === "function") {
      requestAnimationFrame(() => resolve());
    } else {
      setTimeout(resolve, 0);
    }
  });
}

function createVariantKey(
  sourcePhotoId: string,
  widthInches: number,
  heightInches: number,
  rotation: 0 | 90,
  crop: PdfExportInput["crop"],
  cropMode: PdfExportInput["cropMode"],
  input: PdfExportInput,
): string {
  return [
    sourcePhotoId,
    widthInches.toFixed(5),
    heightInches.toFixed(5),
    rotation,
    cropMode,
    crop.xPercent,
    crop.yPercent,
    crop.widthPercent,
    crop.heightPercent,
    crop.rotation,
    input.backgroundMode,
    input.backgroundColor,
    input.options.includeBackground,
    input.options.outputQuality,
    input.options.jpegQuality,
  ].join("|");
}

export async function createPdfDocument(
  input: PdfExportInput,
  context: PdfExportContext = {},
): Promise<Uint8Array> {
  validatePdfExport(input);
  throwIfExportCancelled(context.signal);
  const sources =
    input.imageSources && input.imageSources.length > 0
      ? input.imageSources
      : input.imageSource
        ? [
            {
              ...input.imageSource,
              id: "legacy-source",
              crop: input.crop,
              cropMode: input.cropMode,
            },
          ]
        : [];
  if (sources.length === 0) {
    throw new PdfExportError(
      "IMAGE_MISSING",
      "Choose a photo before exporting the layout.",
    );
  }
  const selectedIndexes = new Set(input.options.pageIndexes);
  const renderPages = createRenderPages(
    input.layoutResult,
    input.paper,
    input.photoSizes,
    input.crop,
    input.cropMode,
    sources,
  ).filter((page) => selectedIndexes.has(page.pageIndex));
  const totalPages = renderPages.length;
  context.onProgress?.({
    status: "preparing-images",
    currentPage: 0,
    totalPages,
  });

  const decodedSources = new Map(
    await Promise.all(
      sources.map(async (source) => [
        source.id,
        {
          source,
          decoded: await decodePdfImage(source.file, source.objectUrl),
        },
      ] as const),
    ),
  );
  const document = await PDFDocument.create();
  const regularFont = await document.embedFont(StandardFonts.Helvetica);
  const boldFont = await document.embedFont(StandardFonts.HelveticaBold);
  const processedCache = new Map<string, Promise<ProcessedPdfImage>>();
  const embeddedCache = new Map<
    string,
    Awaited<ReturnType<typeof document.embedPng>>
  >();
  const sourceItems = new Map(
    input.photoSizes.map((item) => [item.id, item]),
  );

  try {
    for (let pageOffset = 0; pageOffset < renderPages.length; pageOffset += 1) {
      throwIfExportCancelled(context.signal);
      const model = renderPages[pageOffset];
      context.onProgress?.({
        status: "rendering-pages",
        currentPage: pageOffset + 1,
        totalPages,
      });
      const pageWidthPoints = inchesToPdfPoints(model.widthInches);
      const pageHeightPoints = inchesToPdfPoints(model.heightInches);
      const page = document.addPage([pageWidthPoints, pageHeightPoints]);

      for (const item of model.items) {
        throwIfExportCancelled(context.signal);
        const sourceId = item.sourcePhotoId ?? sources[0]?.id;
        const sourceEntry = sourceId
          ? decodedSources.get(sourceId)
          : undefined;
        if (!sourceEntry) {
          throw new PdfExportError(
            "IMAGE_MISSING",
            "A photo used by this layout is no longer available.",
          );
        }
        const sourceItem = sourceItems.get(item.sourceItemId);
        const referenceWidthInches = sourceItem
          ? toInches(sourceItem.width, sourceItem.unit)
          : 1;
        const localWidth =
          item.rotation === 90
            ? item.photoRect.heightInches
            : item.photoRect.widthInches;
        const localHeight =
          item.rotation === 90
            ? item.photoRect.widthInches
            : item.photoRect.heightInches;
        const key = createVariantKey(
          sourceEntry.source.id,
          localWidth,
          localHeight,
          item.rotation,
          item.crop,
          item.cropMode,
          input,
        );
        let processedPromise = processedCache.get(key);
        if (!processedPromise) {
          processedPromise = processPhotoForPdf({
            image: sourceEntry.decoded.image,
            sourceWidth: sourceEntry.decoded.width,
            sourceHeight: sourceEntry.decoded.height,
            crop: item.crop,
            cropMode: item.cropMode,
            widthInches: localWidth,
            heightInches: localHeight,
            referenceWidthInches,
            itemRotation: item.rotation,
            backgroundMode: input.backgroundMode,
            backgroundColor: input.backgroundColor,
            backgroundRemoved: input.backgroundRemoved,
            includeBackground: input.options.includeBackground,
            quality: input.options.outputQuality,
            jpegQuality: input.options.jpegQuality,
          });
          processedCache.set(key, processedPromise);
        }
        const processed = await processedPromise;
        let embedded = embeddedCache.get(key);
        if (!embedded) {
          embedded =
            processed.format === "jpeg"
              ? await document.embedJpg(processed.bytes)
              : await document.embedPng(processed.bytes);
          embeddedCache.set(key, embedded);
        }

        const photoWidth = inchesToPdfPoints(item.photoRect.widthInches);
        const photoHeight = inchesToPdfPoints(item.photoRect.heightInches);
        const photoPosition = topLeftToPdfCoordinates(
          pageHeightPoints,
          inchesToPdfPoints(item.photoRect.xInches),
          inchesToPdfPoints(item.photoRect.yInches),
          photoHeight,
        );
        page.drawImage(embedded, {
          ...photoPosition,
          width: photoWidth,
          height: photoHeight,
        });

        if (
          input.options.includeNameplates &&
          item.nameplateRect &&
          item.nameplate
        ) {
          renderPdfNameplate(
            page,
            pageHeightPoints,
            item.nameplateRect,
            item.nameplate,
            regularFont,
            boldFont,
            item.rotation,
          );
        }
        if (input.options.includeSizeLabels) {
          renderPdfSizeLabel(
            page,
            pageHeightPoints,
            item.photoRect,
            item.sizeLabel,
            regularFont,
          );
        }
        if (input.options.includeCuttingGuides) {
          renderPdfCuttingGuides(
            page,
            pageHeightPoints,
            item.placement,
          );
        }
      }
      await yieldToBrowser();
    }

    throwIfExportCancelled(context.signal);
    context.onProgress?.({
      status: "finalizing",
      currentPage: totalPages,
      totalPages,
    });
    return await document.save();
  } finally {
    processedCache.clear();
    embeddedCache.clear();
    decodedSources.forEach(({ decoded }) => decoded.close());
  }
}
