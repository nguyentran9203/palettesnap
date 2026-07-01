import { nearestColorName } from "./colorNames";

export type Swatch = { hex: string; name: string };

type Rgb = { r: number; g: number; b: number };

function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (n: number) => Math.max(0, Math.min(255, Math.round(n)));
  return (
    "#" +
    [clamp(r), clamp(g), clamp(b)]
      .map((n) => n.toString(16).padStart(2, "0"))
      .join("")
      .toUpperCase()
  );
}

function rgbDistance(a: Rgb, b: Rgb): number {
  return (a.r - b.r) ** 2 + (a.g - b.g) ** 2 + (a.b - b.b) ** 2;
}

function loadImage(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Could not load that image."));
    };
    img.src = url;
  });
}

/**
 * Extracts a small, visually distinct palette from an image file by
 * downscaling it, bucketing pixels into coarse color cells, and picking
 * the most common cells that are still far enough apart to look distinct.
 */
export async function extractPalette(file: File, count = 5): Promise<Swatch[]> {
  const img = await loadImage(file);

  const maxDim = 200;
  const scale = Math.min(1, maxDim / Math.max(img.naturalWidth, img.naturalHeight));
  const width = Math.max(1, Math.round(img.naturalWidth * scale));
  const height = Math.max(1, Math.round(img.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");
  ctx.drawImage(img, 0, 0, width, height);

  const { data } = ctx.getImageData(0, 0, width, height);

  const bucketSize = 24;
  const buckets = new Map<string, { r: number; g: number; b: number; count: number }>();

  for (let i = 0; i < data.length; i += 4) {
    const alpha = data[i + 3];
    if (alpha < 128) continue;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const key = `${Math.round(r / bucketSize)}_${Math.round(g / bucketSize)}_${Math.round(b / bucketSize)}`;
    const bucket = buckets.get(key);
    if (bucket) {
      bucket.r += r;
      bucket.g += g;
      bucket.b += b;
      bucket.count += 1;
    } else {
      buckets.set(key, { r, g, b, count: 1 });
    }
  }

  if (buckets.size === 0) {
    throw new Error("Couldn't find any visible colors in that image.");
  }

  const clusters: Rgb[] = Array.from(buckets.values())
    .sort((a, b) => b.count - a.count)
    .map((b) => ({ r: b.r / b.count, g: b.g / b.count, b: b.b / b.count }));

  const minDistance = 40 * 40;
  const picked: Rgb[] = [];
  for (const cluster of clusters) {
    if (picked.length >= count) break;
    const tooClose = picked.some((p) => rgbDistance(p, cluster) < minDistance);
    if (!tooClose) picked.push(cluster);
  }
  for (const cluster of clusters) {
    if (picked.length >= count) break;
    if (!picked.includes(cluster)) picked.push(cluster);
  }

  return picked.slice(0, count).map((c) => {
    const hex = rgbToHex(c.r, c.g, c.b);
    return { hex, name: nearestColorName(hex) };
  });
}
