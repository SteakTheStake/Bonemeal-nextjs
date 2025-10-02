export type BaseMaterial = {
  name: string;
  f0: number;
  f0Percent?: number | null;
  ior?: number | null;
  notes?: string;
  rgbF0?: { r: number; g: number; b: number };
};

export type Catalog = Record<string, BaseMaterial[]>;

export const f0Encode = (f0Percent: number) => Math.round(f0Percent * 2.55);

export const f0PercentFromIOR = (n: number) => {
  const r = (n - 1) / (n + 1);
  return (r * r) * 100;
};

export const GREEN_METAL_CODES: Record<number, string> = {
  230: "Iron",
  231: "Gold",
  232: "Aluminum",
  233: "Chrome",
  234: "Copper",
  235: "Lead",
  236: "Platinum",
  237: "Silver",
};

export const F0_VALUES: Catalog = {
  liquids: [
    { name: "Water (20°C)", ior: 1.333, f0Percent: f0PercentFromIOR(1.333), f0: f0Encode(f0PercentFromIOR(1.333)), notes: "Clear fresh water" },
    { name: "Ice (−10°C)", ior: 1.31, f0Percent: f0PercentFromIOR(1.31), f0: f0Encode(f0PercentFromIOR(1.31)) },
    { name: "Milk (turbid)", ior: 1.35, f0Percent: f0PercentFromIOR(1.35), f0: f0Encode(f0PercentFromIOR(1.35)), notes: "Scattering dominates; F0 driven by base fluid" },
    { name: "Ethanol (alcohol)", ior: 1.361, f0Percent: f0PercentFromIOR(1.361), f0: f0Encode(f0PercentFromIOR(1.361)) },
    { name: "Vegetable oil", ior: 1.47, f0Percent: f0PercentFromIOR(1.47), f0: f0Encode(f0PercentFromIOR(1.47)) },
    { name: "Glycerin (~75% sugar-like)", ior: 1.473, f0Percent: f0PercentFromIOR(1.473), f0: f0Encode(f0PercentFromIOR(1.473)) },
    { name: "Sucrose solution (~50%)", ior: 1.42, f0Percent: f0PercentFromIOR(1.42), f0: f0Encode(f0PercentFromIOR(1.42)), notes: "Representative for syrups" },
  ],
  surfaces: [
    { name: "PTFE (Teflon)", ior: 1.35, f0Percent: f0PercentFromIOR(1.35), f0: f0Encode(f0PercentFromIOR(1.35)) },
    { name: "Human skin (epidermis)", ior: 1.50, f0Percent: f0PercentFromIOR(1.50), f0: f0Encode(f0PercentFromIOR(1.50)), notes: "Topcoat only; SSS dominates appearance" },
    { name: "Rubber", ior: 1.52, f0Percent: f0PercentFromIOR(1.52), f0: f0Encode(f0PercentFromIOR(1.52)) },
    { name: "Cellulose (paper/wood fibers)", ior: 1.47, f0Percent: f0PercentFromIOR(1.47), f0: f0Encode(f0PercentFromIOR(1.47)) },
    { name: "Polystyrene", ior: 1.59, f0Percent: f0PercentFromIOR(1.59), f0: f0Encode(f0PercentFromIOR(1.59)) },
    { name: "Nylon", ior: 1.53, f0Percent: f0PercentFromIOR(1.53), f0: f0Encode(f0PercentFromIOR(1.53)) },
    { name: "Ceramic glaze (gloss)", ior: 1.52, f0Percent: f0PercentFromIOR(1.52), f0: f0Encode(f0PercentFromIOR(1.52)) },
    { name: "Asphalt (binder)", ior: 1.52, f0Percent: f0PercentFromIOR(1.52), f0: f0Encode(f0PercentFromIOR(1.52)), notes: "Macro-rough; low spec visually" },
  ],
  plastics: [
    { name: "PMMA (Acrylic/Plexiglas)", ior: 1.49, f0Percent: f0PercentFromIOR(1.49), f0: f0Encode(f0PercentFromIOR(1.49)) },
    { name: "Polycarbonate (PC)", ior: 1.585, f0Percent: f0PercentFromIOR(1.585), f0: f0Encode(f0PercentFromIOR(1.585)) },
    { name: "PVC", ior: 1.54, f0Percent: f0PercentFromIOR(1.54), f0: f0Encode(f0PercentFromIOR(1.54)) },
    { name: "ABS", ior: 1.54, f0Percent: f0PercentFromIOR(1.54), f0: f0Encode(f0PercentFromIOR(1.54)) },
  ],
  gems: [
    { name: "Quartz (SiO₂)", ior: 1.544, f0Percent: f0PercentFromIOR(1.544), f0: f0Encode(f0PercentFromIOR(1.544)) },
    { name: "Halite (rock salt)", ior: 1.544, f0Percent: f0PercentFromIOR(1.544), f0: f0Encode(f0PercentFromIOR(1.544)) },
    { name: "Amethyst (quartz)", ior: 1.544, f0Percent: f0PercentFromIOR(1.544), f0: f0Encode(f0PercentFromIOR(1.544)) },
    { name: "Amber", ior: 1.55, f0Percent: f0PercentFromIOR(1.55), f0: f0Encode(f0PercentFromIOR(1.55)) },
    { name: "Jadeite", ior: 1.66, f0Percent: f0PercentFromIOR(1.66), f0: f0Encode(f0PercentFromIOR(1.66)) },
    { name: "Emerald (beryl)", ior: 1.58, f0Percent: f0PercentFromIOR(1.58), f0: f0Encode(f0PercentFromIOR(1.58)) },
    { name: "Sapphire (corundum)", ior: 1.76, f0Percent: f0PercentFromIOR(1.76), f0: f0Encode(f0PercentFromIOR(1.76)) },
    { name: "Ruby (corundum)", ior: 1.76, f0Percent: f0PercentFromIOR(1.76), f0: f0Encode(f0PercentFromIOR(1.76)) },
    { name: "Topaz", ior: 1.62, f0Percent: f0PercentFromIOR(1.62), f0: f0Encode(f0PercentFromIOR(1.62)) },
    { name: "Cubic zirconia", ior: 2.15, f0Percent: f0PercentFromIOR(2.15), f0: f0Encode(f0PercentFromIOR(2.15)) },
    { name: "Diamond", ior: 2.417, f0Percent: f0PercentFromIOR(2.417), f0: f0Encode(f0PercentFromIOR(2.417)) },
  ],
  transparents: [
    { name: "Fused silica", ior: 1.458, f0Percent: f0PercentFromIOR(1.458), f0: f0Encode(f0PercentFromIOR(1.458)) },
    { name: "Borosilicate (Pyrex)", ior: 1.47, f0Percent: f0PercentFromIOR(1.47), f0: f0Encode(f0PercentFromIOR(1.47)) },
    { name: "Soda-lime glass", ior: 1.52, f0Percent: f0PercentFromIOR(1.52), f0: f0Encode(f0PercentFromIOR(1.52)) },
    { name: "Flint glass (dense)", ior: 1.62, f0Percent: f0PercentFromIOR(1.62), f0: f0Encode(f0PercentFromIOR(1.62)) },
    { name: "Crystal (lead glass)", ior: 1.70, f0Percent: f0PercentFromIOR(1.70), f0: f0Encode(f0PercentFromIOR(1.70)) },
  ],
  human: [
    { name: "Tears/Saliva (aqueous)", ior: 1.336, f0Percent: f0PercentFromIOR(1.336), f0: f0Encode(f0PercentFromIOR(1.336)) },
    { name: "Cornea", ior: 1.376, f0Percent: f0PercentFromIOR(1.376), f0: f0Encode(f0PercentFromIOR(1.376)) },
    { name: "Eye lens", ior: 1.406, f0Percent: f0PercentFromIOR(1.406), f0: f0Encode(f0PercentFromIOR(1.406)) },
    { name: "Tooth dentin", ior: 1.54, f0Percent: f0PercentFromIOR(1.54), f0: f0Encode(f0PercentFromIOR(1.54)) },
    { name: "Tooth enamel", ior: 1.62, f0Percent: f0PercentFromIOR(1.62), f0: f0Encode(f0PercentFromIOR(1.62)) },
    { name: "Hair (surface)", ior: 1.55, f0Percent: f0PercentFromIOR(1.55), f0: f0Encode(f0PercentFromIOR(1.55)) },
  ],
  building: [
    { name: "Concrete (binder)", ior: 1.52, f0Percent: f0PercentFromIOR(1.52), f0: f0Encode(f0PercentFromIOR(1.52)), notes: "Macro-rough, porous" },
    { name: "Granite (polished)", ior: 1.60, f0Percent: f0PercentFromIOR(1.60), f0: f0Encode(f0PercentFromIOR(1.60)) },
    { name: "Marble (polished)", ior: 1.49, f0Percent: f0PercentFromIOR(1.49), f0: f0Encode(f0PercentFromIOR(1.49)) },
    { name: "Porcelain tile (glaze)", ior: 1.52, f0Percent: f0PercentFromIOR(1.52), f0: f0Encode(f0PercentFromIOR(1.52)) },
  ],
  woods: [
    { name: "Bare wood (cellulose)", ior: 1.47, f0Percent: f0PercentFromIOR(1.47), f0: f0Encode(f0PercentFromIOR(1.47)), notes: "Finish changes gloss only" },
    { name: "Varnished wood", ior: 1.52, f0Percent: f0PercentFromIOR(1.52), f0: f0Encode(f0PercentFromIOR(1.52)) },
    { name: "Oiled wood", ior: 1.47, f0Percent: f0PercentFromIOR(1.47), f0: f0Encode(f0PercentFromIOR(1.47)) },
  ],
  paints: [
    { name: "Matte paint (binder)", ior: 1.52, f0Percent: f0PercentFromIOR(1.52), f0: f0Encode(f0PercentFromIOR(1.52)), notes: "Microfacet roughness high" },
    { name: "Gloss clearcoat", ior: 1.52, f0Percent: f0PercentFromIOR(1.52), f0: f0Encode(f0PercentFromIOR(1.52)) },
  ],
  metals: [
    { name: "Iron", f0: 230, rgbF0: { r: 196, g: 199, b: 199 }, notes: "Gray, slightly bluish" },
    { name: "Gold", f0: 231, rgbF0: { r: 255, g: 215, b: 0 }, notes: "Rich yellow tone" },
    { name: "Aluminum", f0: 232, rgbF0: { r: 224, g: 223, b: 219 }, notes: "Light gray, near-white" },
    { name: "Chrome", f0: 233, rgbF0: { r: 236, g: 236, b: 236 }, notes: "Neutral reflective silver" },
    { name: "Copper", f0: 234, rgbF0: { r: 184, g: 115, b: 51 }, notes: "Warm reddish-brown" },
    { name: "Lead", f0: 235, rgbF0: { r: 140, g: 140, b: 140 }, notes: "Dull gray, low reflectance" },
    { name: "Platinum", f0: 236, rgbF0: { r: 229, g: 228, b: 226 }, notes: "Pale silvery-white" },
    { name: "Silver", f0: 237, rgbF0: { r: 245, g: 245, b: 245 }, notes: "Bright, nearly white metal" },
  ],
};
