export type CropBox = { x: number; y: number; width: number; height: number };

export type PixelCrop = { left: number; top: number; width: number; height: number };

// Model crops are 0–1. Stored suggestion crops are thousandths. Anything larger is pixels.
export function pixelCrop(
  crop: CropBox,
  imageWidth: number,
  imageHeight: number,
): PixelCrop | null {
  if (imageWidth < 1 || imageHeight < 1) return null;
  const vals = [crop.x, crop.y, crop.width, crop.height];
  if (vals.some((n) => !Number.isFinite(n) || n < 0)) return null;

  let left: number;
  let top: number;
  let width: number;
  let height: number;
  if (vals.every((n) => n <= 1)) {
    left = crop.x * imageWidth;
    top = crop.y * imageHeight;
    width = crop.width * imageWidth;
    height = crop.height * imageHeight;
  } else if (vals.every((n) => n <= 1000)) {
    left = (crop.x / 1000) * imageWidth;
    top = (crop.y / 1000) * imageHeight;
    width = (crop.width / 1000) * imageWidth;
    height = (crop.height / 1000) * imageHeight;
  } else {
    left = crop.x;
    top = crop.y;
    width = crop.width;
    height = crop.height;
  }

  const x = Math.min(Math.max(0, Math.round(left)), imageWidth - 1);
  const y = Math.min(Math.max(0, Math.round(top)), imageHeight - 1);
  const w = Math.min(Math.max(1, Math.round(width)), imageWidth - x);
  const h = Math.min(Math.max(1, Math.round(height)), imageHeight - y);
  if (w < 8 || h < 8) return null;
  if (x === 0 && y === 0 && w === imageWidth && h === imageHeight) return null;
  return { left: x, top: y, width: w, height: h };
}
