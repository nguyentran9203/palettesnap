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

function isWarm(h: number): boolean {
  return h < 90 || h >= 300;
}

/**
 * Rule-based Instagram grid/layout suggestions derived from the palette's
 * hue, saturation, and lightness spread — no ML, just simple color theory.
 */
export function generateInstagramTips(swatches: Swatch[]): string[] {
  if (swatches.length === 0) return [];

  const withHsl: HslSwatch[] = swatches.map((s) => ({ ...s, ...hexToHsl(s.hex) }));

  const byLightness = [...withHsl].sort((a, b) => b.l - a.l);
  const lightest = byLightness[0];
  const darkest = byLightness[byLightness.length - 1];

  const bySaturation = [...withHsl].sort((a, b) => b.s - a.s);
  const mostVibrant = bySaturation[0];
  const mostMuted = bySaturation[bySaturation.length - 1];

  const warm = withHsl.filter((c) => isWarm(c.h));
  const cool = withHsl.filter((c) => !isWarm(c.h));

  const tips: string[] = [];

  tips.push(
    `Arrange your next ${withHsl.length} posts from lightest to darkest — start with ${lightest.name} and end on ${darkest.name} — so scrolling your grid feels like one smooth gradient instead of a jumble.`
  );

  tips.push(
    `Use ${mostVibrant.name} as your "pop" post. Place it roughly every 3rd or 4th tile in the grid so it anchors the feed without a wall of high-contrast photos fighting each other.`
  );

  tips.push(
    `Let ${mostMuted.name} carry the quiet posts — pair it with photos that have lots of negative space so the eye gets a breather between busier tiles.`
  );

  if (warm.length && cool.length) {
    const warmNames = warm.map((c) => c.name).join(", ");
    const coolNames = cool.map((c) => c.name).join(", ");
    tips.push(
      `This palette splits into warm (${warmNames}) and cool (${coolNames}) tones. Alternate them by row in a 3-wide grid — one warm row, one cool row — instead of scattering them randomly, so the feed reads as intentional.`
    );
  } else {
    tips.push(
      `This palette leans entirely ${warm.length ? "warm" : "cool"}. Vary lightness and saturation between tiles instead of hue, or the rows will blur into a single flat block when viewed from the profile grid.`
    );
  }

  tips.push(
    `For Highlight covers or Story templates, use ${darkest.name} as the background and ${lightest.name} for text/icons — that pairing has the most contrast, so covers stay legible and still match the feed.`
  );

  return tips;
}
