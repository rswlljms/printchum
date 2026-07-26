import type { CropMode, CropState } from "@/features/editor/types";
import {
  containDestinationRectangle,
  coverSourceRectangle,
  keepPhysicalSizeDestinationRectangle,
  normalizedCropToSourceRectangle,
  type Rectangle,
} from "@/lib/canvas/crop-geometry";
import type { LayoutItem, LayoutResult } from "@/lib/layout-engine/types";

export type PreviewPhoto = {
  image: CanvasImageSource;
  sourceWidth: number;
  sourceHeight: number;
  crop: CropState;
  cropMode: CropMode;
  referenceWidthInches: number;
};

export type DrawLayoutPreviewInput = {
  context: CanvasRenderingContext2D;
  viewportWidth: number;
  viewportHeight: number;
  paperWidthInches: number;
  paperHeightInches: number;
  marginInches: number;
  layoutResult: LayoutResult;
  activePageIndex: number;
  previewScale: number;
  panOffsetX?: number;
  panOffsetY?: number;
  photo: PreviewPhoto | null;
  cuttingGuides: boolean;
  sizeLabels: boolean;
  itemLabels: Readonly<Record<string, string>>;
};

type PreparedPhoto = {
  image: CanvasImageSource;
  width: number;
  height: number;
  crop: CropState;
  cropMode: CropMode;
  referenceWidthInches: number;
};

type PreparedImage = {
  image: CanvasImageSource;
  width: number;
  height: number;
};

const PAPER_PADDING = 32;
const rotatedImageCache = new WeakMap<
  object,
  PreparedImage & { rotation: number }
>();

function prepareRotatedPhoto(photo: PreviewPhoto): PreparedPhoto {
  if (photo.crop.rotation === 0) {
    return {
      image: photo.image,
      width: photo.sourceWidth,
      height: photo.sourceHeight,
      crop: photo.crop,
      cropMode: photo.cropMode,
      referenceWidthInches: photo.referenceWidthInches,
    };
  }

  const cachedImage = rotatedImageCache.get(photo.image as object);
  if (cachedImage?.rotation === photo.crop.rotation) {
    return {
      image: cachedImage.image,
      width: cachedImage.width,
      height: cachedImage.height,
      crop: photo.crop,
      cropMode: photo.cropMode,
      referenceWidthInches: photo.referenceWidthInches,
    };
  }

  const radians = photo.crop.rotation * Math.PI / 180;
  const cosine = Math.abs(Math.cos(radians));
  const sine = Math.abs(Math.sin(radians));
  const width = Math.max(
    Math.ceil(photo.sourceWidth * cosine + photo.sourceHeight * sine),
    1,
  );
  const height = Math.max(
    Math.ceil(photo.sourceWidth * sine + photo.sourceHeight * cosine),
    1,
  );
  const rotationCanvas = document.createElement("canvas");
  rotationCanvas.width = width;
  rotationCanvas.height = height;
  const rotationContext = rotationCanvas.getContext("2d");

  if (!rotationContext) {
    return {
      image: photo.image,
      width: photo.sourceWidth,
      height: photo.sourceHeight,
      crop: photo.crop,
      cropMode: photo.cropMode,
      referenceWidthInches: photo.referenceWidthInches,
    };
  }

  rotationContext.translate(width / 2, height / 2);
  rotationContext.rotate(radians);
  rotationContext.drawImage(
    photo.image,
    -photo.sourceWidth / 2,
    -photo.sourceHeight / 2,
    photo.sourceWidth,
    photo.sourceHeight,
  );
  rotatedImageCache.set(photo.image as object, {
    image: rotationCanvas,
    width,
    height,
    rotation: photo.crop.rotation,
  });

  return {
    image: rotationCanvas,
    width,
    height,
    crop: photo.crop,
    cropMode: photo.cropMode,
    referenceWidthInches: photo.referenceWidthInches,
  };
}

function drawScreenPaper(
  context: CanvasRenderingContext2D,
  paper: Rectangle,
): void {
  // The ground shadow belongs only to this screen preview renderer.
  context.save();
  context.shadowColor = "rgba(15, 23, 42, 0.15)";
  context.shadowBlur = 24;
  context.shadowOffsetY = 8;
  context.fillStyle = "#ffffff";
  context.fillRect(paper.x, paper.y, paper.width, paper.height);
  context.restore();

  context.strokeStyle = "#cbd5e1";
  context.lineWidth = 1;
  context.strokeRect(
    paper.x + 0.5,
    paper.y + 0.5,
    paper.width - 1,
    paper.height - 1,
  );
}

function drawPhoto(
  context: CanvasRenderingContext2D,
  photo: PreparedPhoto,
  destination: Rectangle,
  pixelsPerInch: number,
): void {
  const cropRectangle = normalizedCropToSourceRectangle(
    photo.width,
    photo.height,
    photo.crop,
  );
  let source = cropRectangle;
  let target = destination;

  if (photo.cropMode === "fill-frame") {
    source = coverSourceRectangle(
      cropRectangle,
      destination.width / destination.height,
    );
  } else if (photo.cropMode === "fit-with-padding") {
    target = containDestinationRectangle(cropRectangle, destination);
  } else {
    target = keepPhysicalSizeDestinationRectangle(
      cropRectangle,
      destination,
      photo.referenceWidthInches,
      pixelsPerInch,
    );
  }

  context.save();
  context.beginPath();
  context.rect(
    destination.x,
    destination.y,
    destination.width,
    destination.height,
  );
  context.clip();
  context.fillStyle = "#ffffff";
  context.fillRect(
    destination.x,
    destination.y,
    destination.width,
    destination.height,
  );
  context.drawImage(
    photo.image,
    source.x,
    source.y,
    source.width,
    source.height,
    target.x,
    target.y,
    target.width,
    target.height,
  );
  context.restore();
}

function drawPhotoPlaceholder(
  context: CanvasRenderingContext2D,
  destination: Rectangle,
): void {
  context.fillStyle = "#eeeeee";
  context.fillRect(
    destination.x,
    destination.y,
    destination.width,
    destination.height,
  );
}

function drawSizeLabel(
  context: CanvasRenderingContext2D,
  destination: Rectangle,
  label: string,
): void {
  const fontSize = Math.max(8, Math.min(11, destination.width / 9));
  const labelHeight = fontSize + 7;
  context.fillStyle = "rgba(255, 255, 255, 0.88)";
  context.fillRect(
    destination.x,
    destination.y + destination.height - labelHeight,
    destination.width,
    labelHeight,
  );
  context.fillStyle = "#171717";
  context.font = `${fontSize}px ui-monospace, monospace`;
  context.textAlign = "center";
  context.textBaseline = "middle";
  context.fillText(
    label,
    destination.x + destination.width / 2,
    destination.y + destination.height - labelHeight / 2,
    Math.max(destination.width - 6, 0),
  );
}

function drawPlacedItem(
  context: CanvasRenderingContext2D,
  item: LayoutItem,
  paperX: number,
  paperY: number,
  pixelsPerInch: number,
  photo: PreparedPhoto | null,
  sizeLabel: string,
  showSizeLabel: boolean,
): Rectangle {
  const placedRectangle = {
    x: paperX + item.xInches * pixelsPerInch,
    y: paperY + item.yInches * pixelsPerInch,
    width: item.widthInches * pixelsPerInch,
    height: item.heightInches * pixelsPerInch,
  };

  context.save();
  if (item.rotation === 90) {
    context.translate(
      placedRectangle.x + placedRectangle.width,
      placedRectangle.y,
    );
    context.rotate(Math.PI / 2);
  } else {
    context.translate(placedRectangle.x, placedRectangle.y);
  }

  const localRectangle = {
    x: 0,
    y: 0,
    width: item.rotation === 90
      ? placedRectangle.height
      : placedRectangle.width,
    height: item.rotation === 90
      ? placedRectangle.width
      : placedRectangle.height,
  };

  if (photo) {
    drawPhoto(context, photo, localRectangle, pixelsPerInch);
  } else {
    drawPhotoPlaceholder(context, localRectangle);
  }

  if (showSizeLabel) {
    drawSizeLabel(context, localRectangle, sizeLabel);
  }
  context.restore();

  context.strokeStyle = "#737373";
  context.lineWidth = 1;
  context.strokeRect(
    placedRectangle.x + 0.5,
    placedRectangle.y + 0.5,
    Math.max(placedRectangle.width - 1, 0),
    Math.max(placedRectangle.height - 1, 0),
  );

  return placedRectangle;
}

function drawCuttingGuides(
  context: CanvasRenderingContext2D,
  rectangle: Rectangle,
): void {
  const markLength = 6;
  context.save();
  context.strokeStyle = "#171717";
  context.lineWidth = 0.75;
  context.beginPath();

  for (const x of [rectangle.x, rectangle.x + rectangle.width]) {
    context.moveTo(x, rectangle.y - markLength);
    context.lineTo(x, rectangle.y + markLength);
    context.moveTo(x, rectangle.y + rectangle.height - markLength);
    context.lineTo(x, rectangle.y + rectangle.height + markLength);
  }

  for (const y of [rectangle.y, rectangle.y + rectangle.height]) {
    context.moveTo(rectangle.x - markLength, y);
    context.lineTo(rectangle.x + markLength, y);
    context.moveTo(rectangle.x + rectangle.width - markLength, y);
    context.lineTo(rectangle.x + rectangle.width + markLength, y);
  }

  context.stroke();
  context.restore();
}

export function drawLayoutPreview({
  context,
  viewportWidth,
  viewportHeight,
  paperWidthInches,
  paperHeightInches,
  marginInches,
  layoutResult,
  activePageIndex,
  previewScale,
  panOffsetX = 0,
  panOffsetY = 0,
  photo,
  cuttingGuides,
  sizeLabels,
  itemLabels,
}: DrawLayoutPreviewInput): void {
  context.clearRect(0, 0, viewportWidth, viewportHeight);

  const fitScale = Math.min(
    (viewportWidth - PAPER_PADDING * 2) / paperWidthInches,
    (viewportHeight - PAPER_PADDING * 2) / paperHeightInches,
  );
  const pixelsPerInch = Math.max(fitScale * previewScale, 1);
  const paper = {
    x:
      (viewportWidth - paperWidthInches * pixelsPerInch) / 2 +
      panOffsetX,
    y:
      (viewportHeight - paperHeightInches * pixelsPerInch) / 2 +
      panOffsetY,
    width: paperWidthInches * pixelsPerInch,
    height: paperHeightInches * pixelsPerInch,
  };

  drawScreenPaper(context, paper);

  const marginPixels = marginInches * pixelsPerInch;
  context.save();
  context.setLineDash([4, 4]);
  context.strokeStyle = "#cbd5e1";
  context.strokeRect(
    paper.x + marginPixels,
    paper.y + marginPixels,
    paper.width - marginPixels * 2,
    paper.height - marginPixels * 2,
  );
  context.restore();

  const page = layoutResult.pages[activePageIndex];
  if (!page) {
    return;
  }

  const preparedPhoto = photo ? prepareRotatedPhoto(photo) : null;
  for (const item of page.items) {
    const rectangle = drawPlacedItem(
      context,
      item,
      paper.x,
      paper.y,
      pixelsPerInch,
      preparedPhoto,
      itemLabels[item.sourceItemId] ?? item.sourceItemId,
      sizeLabels,
    );
    if (cuttingGuides) {
      drawCuttingGuides(context, rectangle);
    }
  }
}
