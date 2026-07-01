import type { Swatch } from "./paletteExtractor";

type HslSwatch = Swatch & { h: number; s: number; l: number };

function hexToHsl(hex: string): { h: number; s: number; l: number } {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16) / 255;
  const g = parseInt(clean.slice(2, 4), 16) / 255;
  const b = parseInt(clean.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;

  let h = 0;
  let s = 0;
  if (d !== 0) {
    s = d / (1 - Math.abs(2 * l - 1));
    switch (max) {
      case r:
        h = ((g - b) / d) % 6;
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      default:
        h = (r - g) / d + 4;
    }
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h, s, l };
}

export type GridInsights = {
  accent: Swatch;
  muted: Swatch;
  caption: string;
};

/**
 * Lightweight color-theory read on a palette: which swatch reads as the
 * "accent" (most saturated) vs. the "quiet" one (least saturated), plus a
 * one-line caption for the grid mockup.
 */
export function getGridInsights(swatches: Swatch[]): GridInsights | null {
  if (swatches.length === 0) return null;

  const withHsl: HslSwatch[] = swatches.map((s) => ({ ...s, ...hexToHsl(s.hex) }));
  const bySaturation = [...withHsl].sort((a, b) => b.s - a.s);
  const accent = bySaturation[0];
  const muted = bySaturation[bySaturation.length - 1];

  const caption =
    swatches.length > 1
      ? `Lead your next posts with these tones — use ${accent.name} as a recurring accent tile and ${muted.name} for the quieter, negative-space shots in between.`
      : `Use ${accent.name} as a recurring accent tile across your next few posts.`;

  return { accent, muted, caption };
}
