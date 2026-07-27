import type { CropMode, CropState } from "@/features/editor/types";
import {
  containDestinationRectangle,
  coverSourceRectangle,
  keepPhysicalSizeDestinationRectangle,
  normalizedCropToSourceRectangle,
  type Rectangle,
} from "@/lib/canvas/crop-geometry";
import { PdfExportError } from "@/lib/pdf/errors";
import type {
  PdfImageMimeType,
  PdfOutputQuality,
} from "@/lib/pdf/types";

export type ProcessedPdfImage = {
  bytes: Uint8Array;
  format: "jpeg" | "png";
};

export type ProcessPhotoInput = {
  image: CanvasImageSource;
  sourceWidth: number;
  sourceHeight: number;
  crop: CropState;
  cropMode: CropMode;
  widthInches: number;
  heightInches: number;
  referenceWidthInches: number;
  itemRotation: 0 | 90;
  backgroundMode: "original" | "transparent" | "solid";
  backgroundColor: string;
  backgroundRemoved: boolean;
  includeBackground: boolean;
  quality: PdfOutputQuality;
  jpegQuality: number;
};

export type DecodedPdfImage = {
  image: CanvasImageSource;
  width: number;
  height: number;
  close: () => void;
};

function createCanvas(width: number, height: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(Math.round(width), 1);
  canvas.height = Math.max(Math.round(height), 1);
  return canvas;
}

export function chooseEmbeddedImageFormat(
  sourceMimeType: PdfImageMimeType,
  preserveTransparency: boolean,
): "jpeg" | "png" {
  if (preserveTransparency || sourceMimeType === "image/png") {
    return "png";
  }
  return sourceMimeType === "image/jpeg" ? "jpeg" : "png";
}

export async function decodePdfImage(
  file: File,
  objectUrl: string,
): Promise<DecodedPdfImage> {
  if ("createImageBitmap" in globalThis) {
    try {
      const bitmap = await createImageBitmap(file);
      return {
        image: bitmap,
        width: bitmap.width,
        height: bitmap.height,
        close: () => bitmap.close(),
      };
    } catch {
      // The HTML image fallback supports browsers with partial bitmap decoding.
    }
  }
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () =>
      resolve({
        image,
        width: image.naturalWidth,
        height: image.naturalHeight,
        close: () => {
          image.src = "";
        },
      });
    image.onerror = () =>
      reject(
        new PdfExportError(
          "IMAGE_DECODE_FAILED",
          "The photo could not be decoded for export. Try another image.",
        ),
      );
    image.src = objectUrl;
  });
}

function prepareRotatedSource(
  image: CanvasImageSource,
  width: number,
  height: number,
  rotation: number,
): { image: CanvasImageSource; width: number; height: number } {
  if (rotation === 0) {
    return { image, width, height };
  }
  const radians = rotation * Math.PI / 180;
  const cosine = Math.abs(Math.cos(radians));
  const sine = Math.abs(Math.sin(radians));
  const rotatedWidth = Math.max(
    Math.ceil(width * cosine + height * sine),
    1,
  );
  const rotatedHeight = Math.max(
    Math.ceil(width * sine + height * cosine),
    1,
  );
  const canvas = createCanvas(rotatedWidth, rotatedHeight);
  const context = canvas.getContext("2d");
  if (!context) {
    throw new PdfExportError(
      "PDF_GENERATION_FAILED",
      "The browser could not prepare the photo for export.",
    );
  }
  context.translate(rotatedWidth / 2, rotatedHeight / 2);
  context.rotate(radians);
  context.drawImage(image, -width / 2, -height / 2, width, height);
  return { image: canvas, width: rotatedWidth, height: rotatedHeight };
}

function drawProcessedPhoto(
  context: CanvasRenderingContext2D,
  sourceImage: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  crop: CropState,
  cropMode: CropMode,
  destination: Rectangle,
  referenceWidthInches: number,
  pixelsPerInch: number,
): void {
  const cropRectangle = normalizedCropToSourceRectangle(
    sourceWidth,
    sourceHeight,
    crop,
  );
  let source = cropRectangle;
  let target = destination;
  if (cropMode === "fill-frame") {
    source = coverSourceRectangle(
      cropRectangle,
      destination.width / destination.height,
    );
  } else if (cropMode === "fit-with-padding") {
    target = containDestinationRectangle(cropRectangle, destination);
  } else {
    target = keepPhysicalSizeDestinationRectangle(
      cropRectangle,
      destination,
      referenceWidthInches,
      pixelsPerInch,
    );
  }
  context.drawImage(
    sourceImage,
    source.x,
    source.y,
    source.width,
    source.height,
    target.x,
    target.y,
    target.width,
    target.height,
  );
}

function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: "image/jpeg" | "image/png",
  quality?: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(
            new PdfExportError(
              "PDF_GENERATION_FAILED",
              "The browser could not encode the photo for export.",
            ),
          );
        }
      },
      type,
      quality,
    );
  });
}

export async function processPhotoForPdf(
  input: ProcessPhotoInput,
): Promise<ProcessedPdfImage> {
  const pixelsPerInch = input.quality === "high" ? 300 : 150;
  const localWidth = Math.max(
    Math.round(input.widthInches * pixelsPerInch),
    1,
  );
  const localHeight = Math.max(
    Math.round(input.heightInches * pixelsPerInch),
    1,
  );
  const localCanvas = createCanvas(localWidth, localHeight);
  const localContext = localCanvas.getContext("2d");
  if (!localContext) {
    throw new PdfExportError(
      "PDF_GENERATION_FAILED",
      "The browser could not create an export canvas.",
    );
  }
  const transparentAvailable =
    input.backgroundMode === "transparent" && input.backgroundRemoved;
  if (input.includeBackground && input.backgroundMode === "solid") {
    localContext.fillStyle = input.backgroundColor;
    localContext.fillRect(0, 0, localWidth, localHeight);
  } else if (!transparentAvailable && input.cropMode === "fit-with-padding") {
    localContext.fillStyle = "#ffffff";
    localContext.fillRect(0, 0, localWidth, localHeight);
  }

  const prepared = prepareRotatedSource(
    input.image,
    input.sourceWidth,
    input.sourceHeight,
    input.crop.rotation,
  );
  drawProcessedPhoto(
    localContext,
    prepared.image,
    prepared.width,
    prepared.height,
    input.crop,
    input.cropMode,
    { x: 0, y: 0, width: localWidth, height: localHeight },
    input.referenceWidthInches,
    pixelsPerInch,
  );

  let outputCanvas = localCanvas;
  if (input.itemRotation === 90) {
    outputCanvas = createCanvas(localHeight, localWidth);
    const outputContext = outputCanvas.getContext("2d");
    if (!outputContext) {
      throw new PdfExportError(
        "PDF_GENERATION_FAILED",
        "The browser could not rotate the export photo.",
      );
    }
    outputContext.translate(outputCanvas.width, 0);
    outputContext.rotate(Math.PI / 2);
    outputContext.drawImage(localCanvas, 0, 0);
  }

  const preserveTransparency =
    !input.includeBackground || transparentAvailable;
  const format = preserveTransparency ? "png" : "jpeg";
  const blob = await canvasToBlob(
    outputCanvas,
    format === "png" ? "image/png" : "image/jpeg",
    format === "jpeg" ? input.jpegQuality : undefined,
  );
  return {
    bytes: new Uint8Array(await blob.arrayBuffer()),
    format,
  };
}
