import { GREEN_METAL_CODES, F0_VALUES, f0PercentFromIOR } from "./labpbr-data";

export interface LabPBRMaterialMatch {
  name: string;
  category: string;
  f0: number;
  reflectance: number | null;
  ior?: number | null;
  rgbF0?: { r: number; g: number; b: number };
  difference: number;
  notes?: string;
}

export interface LabPBRReport {
  width: number;
  height: number;
  avgRed: number;
  avgRedPct: number;
  avgGreen: number;
  avgBlue: number;
  avgAlpha: number;
  greenF0CoveragePct: number;
  greenMetalCoveragePct: number;
  avgF0Encoded: number | null;
  avgF0Percent: number | null;
  topMetalCode: number | null;
  topMetalName: string | null;
  porosityCoveragePct: number;
  sssCoveragePct: number;
  avgPorosityPct: number | null;
  avgSSSPct: number | null;
  avgEmissionPct: number;
  closestMaterial: LabPBRMaterialMatch | null;
  redDistribution: Record<number, number>;
  warnings: string[];
}

const toPercent = (value: number, max: number) => {
  if (max === 0) return 0;
  return (value / max) * 100;
};

const emissionPctFromAlpha = (value: number) => (value === 255 ? 0 : (value / 254) * 100);

export function analyzeLabPBRImageData(imageData: ImageData): LabPBRReport {
  const { data, width, height } = imageData;
  const totalPixels = data.length / 4;

  let sumR = 0;
  let sumG = 0;
  let sumB = 0;
  let sumA = 0;

  let f0Count = 0;
  let f0Sum = 0;
  let metalCount = 0;
  const metalBins: Record<number, number> = {};

  let porosityCount = 0;
  let porositySumNorm = 0;
  let sssCount = 0;
  let sssSumNorm = 0;

  const redDistribution: Record<number, number> = {};

  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    sumR += r;
    sumG += g;
    sumB += b;
    sumA += a;

    redDistribution[r] = (redDistribution[r] || 0) + 1;

    if (g <= 229) {
      f0Count++;
      f0Sum += g;
    } else {
      metalCount++;
      metalBins[g] = (metalBins[g] || 0) + 1;
    }

    if (b <= 64) {
      porosityCount++;
      porositySumNorm += b / 64;
    } else {
      sssCount++;
      sssSumNorm += (b - 65) / (255 - 65);
    }
  }

  const avgRed = totalPixels > 0 ? sumR / totalPixels : 0;
  const avgGreen = totalPixels > 0 ? sumG / totalPixels : 0;
  const avgBlue = totalPixels > 0 ? sumB / totalPixels : 0;
  const avgAlpha = totalPixels > 0 ? sumA / totalPixels : 0;

  const avgF0Encoded = f0Count > 0 ? f0Sum / f0Count : null;
  const avgF0Percent = avgF0Encoded !== null ? toPercent(avgF0Encoded, 255) : null;

  let topMetalCode: number | null = null;
  let topMetalCount = -1;
  for (const [key, count] of Object.entries(metalBins)) {
    const code = Number(key);
    if (count > topMetalCount) {
      topMetalCount = count;
      topMetalCode = code;
    }
  }
  const topMetalName = topMetalCode !== null ? GREEN_METAL_CODES[topMetalCode] ?? null : null;

  const greenF0CoveragePct = toPercent(f0Count, totalPixels);
  const greenMetalCoveragePct = toPercent(metalCount, totalPixels);

  const porosityCoveragePct = toPercent(porosityCount, totalPixels);
  const sssCoveragePct = toPercent(sssCount, totalPixels);
  const avgPorosityPct = porosityCount > 0 ? (porositySumNorm / porosityCount) * 100 : null;
  const avgSSSPct = sssCount > 0 ? (sssSumNorm / sssCount) * 100 : null;
  const avgEmissionPct = emissionPctFromAlpha(avgAlpha);

  let closestMaterial: LabPBRMaterialMatch | null = null;
  if (avgF0Encoded !== null) {
    const allMaterials = Object.entries(F0_VALUES).flatMap(([category, materials]) =>
      materials.map((material) => ({ ...material, category }))
    );

    let best = allMaterials[0];
    let minDiff = Math.abs(avgF0Encoded - best.f0);
    for (const candidate of allMaterials) {
      const diff = Math.abs(avgF0Encoded - candidate.f0);
      if (diff < minDiff) {
        best = candidate;
        minDiff = diff;
      }
    }

    closestMaterial = {
      name: best.name,
      category: best.category,
      f0: best.f0,
      reflectance:
        typeof best.f0Percent === "number"
          ? best.f0Percent
          : typeof best.ior === "number"
            ? f0PercentFromIOR(best.ior)
            : null,
      ior: best.ior ?? null,
      rgbF0: best.rgbF0,
      difference: minDiff,
      notes: best.notes,
    };
  }

  const warnings: string[] = [];

  if (greenF0CoveragePct === 0 && greenMetalCoveragePct === 0) {
    warnings.push("Green channel has no LabPBR content (expected F0 or metal codes).");
  }

  if (greenF0CoveragePct > 0 && greenMetalCoveragePct > 0) {
    warnings.push("Texture mixes dielectric F0 and metal codes; ensure masks are intentional.");
  }

  if (topMetalCode !== null && (topMetalCode < 230 || topMetalCode > 237)) {
    warnings.push("Green channel uses metal codes outside the standard 230–237 range.");
  }

  if (avgF0Encoded !== null && avgF0Encoded > 229) {
    warnings.push("Average F0 exceeds dielectric range; clamp to 0–229 for non-metals.");
  }

  if (avgAlpha >= 250 && avgAlpha !== 255) {
    warnings.push("High alpha values imply strong emission; verify emission intent.");
  }

  if (sssCoveragePct > 0 && porosityCoveragePct > 0) {
    warnings.push("Blue channel mixes porosity and SSS; verify masks are separated.");
  }

  if (totalPixels === 0) {
    warnings.push("Texture has no pixel data.");
  }

  return {
    width,
    height,
    avgRed,
    avgRedPct: toPercent(avgRed, 255),
    avgGreen,
    avgBlue,
    avgAlpha,
    greenF0CoveragePct,
    greenMetalCoveragePct,
    avgF0Encoded,
    avgF0Percent,
    topMetalCode,
    topMetalName,
    porosityCoveragePct,
    sssCoveragePct,
    avgPorosityPct,
    avgSSSPct,
    avgEmissionPct,
    closestMaterial,
    redDistribution,
    warnings,
  };
}
