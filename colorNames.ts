export type NamedColor = { name: string; hex: string };

// Curated name bank used to label extracted colors by nearest match.
// Organized roughly by hue family; names follow the site's "material/place" voice.
export const COLOR_NAMES: NamedColor[] = [
  // Neutrals / blacks / whites
  { name: "Ink Alley", hex: "#0D0D12" },
  { name: "Onyx", hex: "#161616" },
  { name: "Charcoal Slate", hex: "#2B2B2E" },
  { name: "Graphite", hex: "#3F3F42" },
  { name: "Storm Grey", hex: "#5A5A5E" },
  { name: "Pewter", hex: "#7C7C7F" },
  { name: "Ash", hex: "#9C9C97" },
  { name: "Fog", hex: "#C2C2BC" },
  { name: "Vapor", hex: "#F5F5F0" },
  { name: "Linen Mist", hex: "#F4F1EA" },
  { name: "Bone White", hex: "#F7F6F2" },
  { name: "Stucco", hex: "#F7F6F2" },
  { name: "Chalk", hex: "#EDEAE2" },
  { name: "Driftwood", hex: "#F1E3D3" },

  // Blues / navies
  { name: "Twilight Navy", hex: "#2B3A55" },
  { name: "Slate Tide", hex: "#1F2A33" },
  { name: "Deep Tyrrhenian", hex: "#0F4C5C" },
  { name: "Midnight Harbor", hex: "#122B3A" },
  { name: "Denim Wash", hex: "#3B5773" },
  { name: "Steel Blue", hex: "#46728C" },
  { name: "Sea Glass", hex: "#9DB4C0" },
  { name: "Cloud Blue", hex: "#BBD3DE" },
  { name: "Powder Sky", hex: "#D6E6EC" },
  { name: "Cobalt Spark", hex: "#1E5FBF" },
  { name: "Electric Blue", hex: "#3D7DFF" },

  // Teals / cyans
  { name: "Teal Glow", hex: "#00C2A8" },
  { name: "Lagoon", hex: "#1F8A83" },
  { name: "Deep Teal", hex: "#0E4F4A" },
  { name: "Aqua Mist", hex: "#9FE0D6" },
  { name: "Sea Foam", hex: "#C9EDE4" },

  // Greens
  { name: "Pine Shadow", hex: "#1A2620" },
  { name: "Forest Floor", hex: "#243B2C" },
  { name: "Fern Hollow", hex: "#4A6B52" },
  { name: "Moss Path", hex: "#6B8E4E" },
  { name: "Olive Grove", hex: "#7C8B4A" },
  { name: "Sage", hex: "#A3B18A" },
  { name: "Lichen", hex: "#C2C9B6" },
  { name: "Mint Whisper", hex: "#D7E8D0" },
  { name: "Citron Spark", hex: "#C6FF00" },
  { name: "Chartreuse Zing", hex: "#AEEA00" },

  // Yellows / golds
  { name: "Sun Quartz", hex: "#E8A33D" },
  { name: "Lemon Rind", hex: "#E9C46A" },
  { name: "Rice Paper", hex: "#E8D5A0" },
  { name: "Honey Wheat", hex: "#D9A441" },
  { name: "Golden Hour", hex: "#F2B441" },
  { name: "Butter Cream", hex: "#F3E1B5" },
  { name: "Sanded Almond", hex: "#E8C5A0" },

  // Oranges / terracottas / browns
  { name: "Terracotta", hex: "#F4A261" },
  { name: "Persimmon", hex: "#C66B3D" },
  { name: "Bluff Clay", hex: "#D98E73" },
  { name: "Roast Bean", hex: "#3A1F12" },
  { name: "Earth Brown", hex: "#6B5A42" },
  { name: "Umber", hex: "#5C4632" },
  { name: "Saddle Leather", hex: "#7A4B2E" },
  { name: "Bleached Sand", hex: "#F2EDE6" },
  { name: "Camel", hex: "#C89666" },
  { name: "Cinnamon", hex: "#A85C32" },

  // Reds / pinks / wines
  { name: "Sign Pink", hex: "#FF2E63" },
  { name: "Mulberry Wine", hex: "#7A2E3A" },
  { name: "Brick Red", hex: "#9C3B2E" },
  { name: "Rust", hex: "#B04A2E" },
  { name: "Rose Clay", hex: "#C97C6D" },
  { name: "Blush", hex: "#E8B9B0" },
  { name: "Coral Flush", hex: "#F08A6C" },
  { name: "Crimson Depth", hex: "#7A1330" },

  // Purples / lavenders / magentas
  { name: "Prickly Pear", hex: "#8A3D5B" },
  { name: "Plum Shadow", hex: "#4A2E42" },
  { name: "Mauve", hex: "#8E6B7C" },
  { name: "Lavender Haze", hex: "#B9A3C9" },
  { name: "Orchid Glow", hex: "#B15FBF" },
  { name: "Violet Ink", hex: "#4B2E7A" },

  // Extra neutrals used elsewhere on the site
  { name: "Ink", hex: "#111111" },
  { name: "Citron Ink", hex: "#1A1A00" },
  { name: "Hairline Grey", hex: "#E6E4DC" },
  { name: "Muted Clay", hex: "#8A8A85" },
];

function hexToRgb(hex: string): [number, number, number] {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  return [r, g, b];
}

function distance(a: [number, number, number], b: [number, number, number]): number {
  return (a[0] - b[0]) ** 2 + (a[1] - b[1]) ** 2 + (a[2] - b[2]) ** 2;
}

export function nearestColorName(hex: string): string {
  const target = hexToRgb(hex);
  let best = COLOR_NAMES[0];
  let bestDist = Infinity;
  for (const candidate of COLOR_NAMES) {
    const d = distance(target, hexToRgb(candidate.hex));
    if (d < bestDist) {
      bestDist = d;
      best = candidate;
    }
  }
  return best.name;
}
