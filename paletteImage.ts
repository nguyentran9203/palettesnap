import type { Swatch } from "./paletteExtractor";

const CARD_WIDTH = 480;
const STRIP_HEIGHT = 260;
const ROW_HEIGHT = 56;
const PADDING = 24;
const EXPORT_SCALE = 2;

function drawRoundedRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Renders the palette card (color strip + name/hex rows) as a PNG blob. */
export async function renderPaletteImage(swatches: Swatch[]): Promise<Blob> {
  if (swatches.length === 0) throw new Error("There's no palette to export yet.");

  const width = CARD_WIDTH;
  const height = STRIP_HEIGHT + PADDING * 2 + swatches.length * ROW_HEIGHT;

  const canvas = document.createElement("canvas");
  canvas.width = width * EXPORT_SCALE;
  canvas.height = height * EXPORT_SCALE;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas is not supported in this browser.");
  ctx.scale(EXPORT_SCALE, EXPORT_SCALE);

  ctx.fillStyle = "#ffffff";
  drawRoundedRect(ctx, 0, 0, width, height, 20);
  ctx.fill();

  ctx.save();
  drawRoundedRect(ctx, 0, 0, width, height, 20);
  ctx.clip();

  const colWidth = width / swatches.length;
  swatches.forEach((s, i) => {
    ctx.fillStyle = s.hex;
    ctx.fillRect(i * colWidth, 0, colWidth + 1, STRIP_HEIGHT);
  });
  ctx.restore();

  ctx.textBaseline = "middle";
  swatches.forEach((s, i) => {
    const rowY = STRIP_HEIGHT + PADDING + i * ROW_HEIGHT;
    const centerY = rowY + ROW_HEIGHT / 2;
    const sq = 20;

    ctx.fillStyle = s.hex;
    ctx.fillRect(PADDING, centerY - sq / 2, sq, sq);
    ctx.strokeStyle = "#e6e4dc";
    ctx.lineWidth = 1;
    ctx.strokeRect(PADDING, centerY - sq / 2, sq, sq);

    ctx.fillStyle = "#111111";
    ctx.font = "600 16px system-ui, -apple-system, sans-serif";
    ctx.textAlign = "left";
    ctx.fillText(s.name, PADDING + sq + 12, centerY);

    ctx.fillStyle = "#8a8a85";
    ctx.font = "13px ui-monospace, SFMono-Regular, monospace";
    ctx.textAlign = "right";
    ctx.fillText(s.hex.toUpperCase(), width - PADDING, centerY);
  });

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Could not generate the palette image."));
    }, "image/png");
  });
}

function slugify(name: string): string {
  const base = name.replace(/\.[^/.]+$/, "");
  const slug = base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
  return slug || "palette";
}

/** Renders the palette as a PNG and triggers a browser download. */
export async function downloadPaletteAsPng(swatches: Swatch[], sourceName: string): Promise<void> {
  const blob = await renderPaletteImage(swatches);
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${slugify(sourceName)}-palette.png`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
