export type Rectangle = {
  x: number;
  y: number;
  width: number;
  height: number;
};

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

export function normalizedCropToSourceRectangle(
  sourceWidth: number,
  sourceHeight: number,
  crop: {
    xPercent: number;
    yPercent: number;
    widthPercent: number;
    heightPercent: number;
  },
): Rectangle {
  const x = clamp(crop.xPercent, 0, 100) / 100 * sourceWidth;
  const y = clamp(crop.yPercent, 0, 100) / 100 * sourceHeight;
  const availableWidth = Math.max(sourceWidth - x, 0);
  const availableHeight = Math.max(sourceHeight - y, 0);
  const width = Math.min(
    clamp(crop.widthPercent, 0, 100) / 100 * sourceWidth,
    availableWidth,
  );
  const height = Math.min(
    clamp(crop.heightPercent, 0, 100) / 100 * sourceHeight,
    availableHeight,
  );

  return {
    x,
    y,
    width: Math.max(width, 1),
    height: Math.max(height, 1),
  };
}

export function coverSourceRectangle(
  source: Rectangle,
  targetAspect: number,
): Rectangle {
  const sourceAspect = source.width / source.height;

  if (sourceAspect > targetAspect) {
    const width = source.height * targetAspect;
    return {
      x: source.x + (source.width - width) / 2,
      y: source.y,
      width,
      height: source.height,
    };
  }

  const height = source.width / targetAspect;
  return {
    x: source.x,
    y: source.y + (source.height - height) / 2,
    width: source.width,
    height,
  };
}

export function containDestinationRectangle(
  source: Rectangle,
  destination: Rectangle,
): Rectangle {
  const scale = Math.min(
    destination.width / source.width,
    destination.height / source.height,
  );
  const width = source.width * scale;
  const height = source.height * scale;

  return {
    x: destination.x + (destination.width - width) / 2,
    y: destination.y + (destination.height - height) / 2,
    width,
    height,
  };
}

export function keepPhysicalSizeDestinationRectangle(
  source: Rectangle,
  destination: Rectangle,
  referenceWidthInches: number,
  pixelsPerInch: number,
): Rectangle {
  const width = referenceWidthInches * pixelsPerInch;
  const height = width * source.height / source.width;

  return {
    x: destination.x + (destination.width - width) / 2,
    y: destination.y + (destination.height - height) / 2,
    width,
    height,
  };
}
