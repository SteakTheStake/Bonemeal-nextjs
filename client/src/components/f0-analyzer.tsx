import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useDropzone } from 'react-dropzone';
import { Upload, Eye, Zap, Palette } from 'lucide-react';

/** Helpers */
const f0Encode = (f0Percent: number) => Math.round(f0Percent * 2.55); // 0–100% -> 0–255
const f0PercentFromIOR = (n: number) => {
  const r = (n - 1) / (n + 1);
  return (r * r) * 100;
};

type BaseMaterial = {
  name: string;
  /** F0 encoded to 0–255 for LabPBR-style specular maps */
  f0: number;
  /** F0 as percent at normal incidence for a neutral/dielectric */
  f0Percent?: number | null;
  /** Index of refraction (approx, 589 nm) for dielectrics */
  ior?: number | null;
  /** Optional note about assumptions or variation */
  notes?: string;
  /** For metals: per-channel F0 encodings (0–255) approximated from visible reflectance */
  rgbF0?: { r: number; g: number; b: number };
};

type Catalog = Record<string, BaseMaterial[]>;

/** Expanded & corrected catalog (values rounded sensibly for authoring) */
const F0_VALUES: Catalog = {
  // Liquids & fluid-like
  liquids: [
    // IOR ~1.31–1.34 -> ~2.0–2.2% F0
    { name: "Water (20°C)", ior: 1.333, f0Percent: f0PercentFromIOR(1.333), f0: f0Encode(f0PercentFromIOR(1.333)), notes: "Clear fresh water" },
    { name: "Ice (−10°C)", ior: 1.31, f0Percent: f0PercentFromIOR(1.31), f0: f0Encode(f0PercentFromIOR(1.31)) },
    { name: "Milk (turbid)", ior: 1.35, f0Percent: f0PercentFromIOR(1.35), f0: f0Encode(f0PercentFromIOR(1.35)), notes: "Scattering dominates; F0 driven by base fluid" },
    { name: "Ethanol (alcohol)", ior: 1.361, f0Percent: f0PercentFromIOR(1.361), f0: f0Encode(f0PercentFromIOR(1.361)) },
    { name: "Vegetable oil", ior: 1.47, f0Percent: f0PercentFromIOR(1.47), f0: f0Encode(f0PercentFromIOR(1.47)) },
    { name: "Glycerin (~75% sugar-like)", ior: 1.473, f0Percent: f0PercentFromIOR(1.473), f0: f0Encode(f0PercentFromIOR(1.473)) },
    { name: "Sucrose solution (~50%)", ior: 1.42, f0Percent: f0PercentFromIOR(1.42), f0: f0Encode(f0PercentFromIOR(1.42)), notes: "Representative for syrups" }
  ],

  // Common surfaces (dielectrics): plastics/organics/minerals
  surfaces: [
    { name: "PTFE (Teflon)", ior: 1.35, f0Percent: f0PercentFromIOR(1.35), f0: f0Encode(f0PercentFromIOR(1.35)) },
    { name: "Human skin (epidermis)", ior: 1.50, f0Percent: f0PercentFromIOR(1.50), f0: f0Encode(f0PercentFromIOR(1.50)), notes: "Topcoat only; SSS dominates appearance" },
    { name: "Rubber", ior: 1.52, f0Percent: f0PercentFromIOR(1.52), f0: f0Encode(f0PercentFromIOR(1.52)) },
    { name: "Cellulose (paper/wood fibers)", ior: 1.47, f0Percent: f0PercentFromIOR(1.47), f0: f0Encode(f0PercentFromIOR(1.47)) },
    { name: "Polystyrene", ior: 1.59, f0Percent: f0PercentFromIOR(1.59), f0: f0Encode(f0PercentFromIOR(1.59)) },
    { name: "Nylon", ior: 1.53, f0Percent: f0PercentFromIOR(1.53), f0: f0Encode(f0PercentFromIOR(1.53)) },
    { name: "Ceramic glaze (gloss)", ior: 1.52, f0Percent: f0PercentFromIOR(1.52), f0: f0Encode(f0PercentFromIOR(1.52)) },
    { name: "Asphalt (binder)", ior: 1.52, f0Percent: f0PercentFromIOR(1.52), f0: f0Encode(f0PercentFromIOR(1.52)), notes: "Macro-rough; low spec visually" }
  ],

  // Plastics & polymers (explicit list for authoring)
  plastics: [
    { name: "PMMA (Acrylic/Plexiglas)", ior: 1.49, f0Percent: f0PercentFromIOR(1.49), f0: f0Encode(f0PercentFromIOR(1.49)) },
    { name: "Polycarbonate (PC)", ior: 1.585, f0Percent: f0PercentFromIOR(1.585), f0: f0Encode(f0PercentFromIOR(1.585)) },
    { name: "PVC", ior: 1.54, f0Percent: f0PercentFromIOR(1.54), f0: f0Encode(f0PercentFromIOR(1.54)) },
    { name: "ABS", ior: 1.54, f0Percent: f0PercentFromIOR(1.54), f0: f0Encode(f0PercentFromIOR(1.54)) },
  ],

  // Gems & crystals (dielectric IORs are well known)
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
    { name: "Diamond", ior: 2.417, f0Percent: f0PercentFromIOR(2.417), f0: f0Encode(f0PercentFromIOR(2.417)) }
  ],

  // Transparent solids (glasses)
  transparents: [
    { name: "Fused silica", ior: 1.458, f0Percent: f0PercentFromIOR(1.458), f0: f0Encode(f0PercentFromIOR(1.458)) },
    { name: "Borosilicate (Pyrex)", ior: 1.47, f0Percent: f0PercentFromIOR(1.47), f0: f0Encode(f0PercentFromIOR(1.47)) },
    { name: "Soda-lime glass", ior: 1.52, f0Percent: f0PercentFromIOR(1.52), f0: f0Encode(f0PercentFromIOR(1.52)) },
    { name: "Flint glass (dense)", ior: 1.62, f0Percent: f0PercentFromIOR(1.62), f0: f0Encode(f0PercentFromIOR(1.62)) },
    { name: "Crystal (lead glass)", ior: 1.70, f0Percent: f0PercentFromIOR(1.70), f0: f0Encode(f0PercentFromIOR(1.70)) }
  ],

  // Human-related dielectrics
  human: [
    { name: "Tears/Saliva (aqueous)", ior: 1.336, f0Percent: f0PercentFromIOR(1.336), f0: f0Encode(f0PercentFromIOR(1.336)) },
    { name: "Cornea", ior: 1.376, f0Percent: f0PercentFromIOR(1.376), f0: f0Encode(f0PercentFromIOR(1.376)) },
    { name: "Eye lens", ior: 1.406, f0Percent: f0PercentFromIOR(1.406), f0: f0Encode(f0PercentFromIOR(1.406)) },
    { name: "Tooth dentin", ior: 1.54, f0Percent: f0PercentFromIOR(1.54), f0: f0Encode(f0PercentFromIOR(1.54)) },
    { name: "Tooth enamel", ior: 1.62, f0Percent: f0PercentFromIOR(1.62), f0: f0Encode(f0PercentFromIOR(1.62)) },
    { name: "Hair (surface)", ior: 1.55, f0Percent: f0PercentFromIOR(1.55), f0: f0Encode(f0PercentFromIOR(1.55)) }
  ],

  // Building materials (helpful for environment art)
  building: [
    { name: "Concrete (binder)", ior: 1.52, f0Percent: f0PercentFromIOR(1.52), f0: f0Encode(f0PercentFromIOR(1.52)), notes: "Macro-rough, porous" },
    { name: "Granite (polished)", ior: 1.60, f0Percent: f0PercentFromIOR(1.60), f0: f0Encode(f0PercentFromIOR(1.60)) },
    { name: "Marble (polished)", ior: 1.49, f0Percent: f0PercentFromIOR(1.49), f0: f0Encode(f0PercentFromIOR(1.49)) },
    { name: "Porcelain tile (glaze)", ior: 1.52, f0Percent: f0PercentFromIOR(1.52), f0: f0Encode(f0PercentFromIOR(1.52)) }
  ],

  // Woods (finish layer drives specular)
  woods: [
    { name: "Bare wood (cellulose)", ior: 1.47, f0Percent: f0PercentFromIOR(1.47), f0: f0Encode(f0PercentFromIOR(1.47)), notes: "Finish changes gloss only" },
    { name: "Varnished wood", ior: 1.52, f0Percent: f0PercentFromIOR(1.52), f0: f0Encode(f0PercentFromIOR(1.52)) },
    { name: "Oiled wood", ior: 1.47, f0Percent: f0PercentFromIOR(1.47), f0: f0Encode(f0PercentFromIOR(1.47)) }
  ],

  // Paints & coatings (as dielectrics)
  paints: [
    { name: "Matte paint (binder)", ior: 1.52, f0Percent: f0PercentFromIOR(1.52), f0: f0Encode(f0PercentFromIOR(1.52)), notes: "Microfacet roughness high" },
    { name: "Gloss clearcoat", ior: 1.52, f0Percent: f0PercentFromIOR(1.52), f0: f0Encode(f0PercentFromIOR(1.52)) }
  ],

  // Metals (colored specular; provide RGB and a red-channel f0 for matching)
  metals: [
    { name: "Iron",      f0: 230, rgbF0: { r: 196, g: 199, b: 199 }, notes: "Gray, slightly bluish" },
    { name: "Gold",      f0: 231, rgbF0: { r: 255, g: 215, b: 0   }, notes: "Rich yellow tone" },
    { name: "Aluminum",  f0: 232, rgbF0: { r: 224, g: 223, b: 219 }, notes: "Light gray, near-white" },
    { name: "Chrome",    f0: 233, rgbF0: { r: 236, g: 236, b: 236 }, notes: "Neutral reflective silver" },
    { name: "Copper",    f0: 234, rgbF0: { r: 184, g: 115, b: 51  }, notes: "Warm reddish-brown" },
    { name: "Lead",      f0: 235, rgbF0: { r: 140, g: 140, b: 140 }, notes: "Dull gray, low reflectance" },
    { name: "Platinum",  f0: 236, rgbF0: { r: 229, g: 228, b: 226 }, notes: "Pale silvery-white" },
    { name: "Silver",    f0: 237, rgbF0: { r: 245, g: 245, b: 245 }, notes: "Bright, nearly white metal" }
  ]  
};

// Map green-channel metal codes (230–237) to names for display
const GREEN_METAL_CODES: Record<number, string> = {
  230: 'Iron',
  231: 'Gold',
  232: 'Aluminum',
  233: 'Chrome',
  234: 'Copper',
  235: 'Lead',
  236: 'Platinum',
  237: 'Silver',
};

/** ---------- Types ---------- */
interface ChannelThumbs {
  original: string;
  red: string;
  green: string;
  blue: string;
  alpha: string;
}

interface AnalysisResult {
  imageDataUrl: string;            // original
  thumbs: ChannelThumbs;

  // Red channel (Smoothness)
  avgRed: number;                  // 0–255
  avgRedPct: number;               // 0–100%

  // Green channel
  avgGreen: number;                // 0–255 raw average
  greenF0CoveragePct: number;      // % pixels in 0–229
  greenMetalCoveragePct: number;   // % pixels in 230–255
  avgF0Encoded?: number | null;    // mean of greens in 0–229
  avgF0Percent?: number | null;    // (avgF0Encoded / 255) * 100 (note: max meaningful 229 → ~89.8%)
  topMetalCode?: number | null;    // most frequent 230–255
  topMetalName?: string | null;

  // Blue channel
  avgBlue: number;                 // 0–255 raw average
  porosityCoveragePct: number;     // % pixels with 0–64
  sssCoveragePct: number;          // % pixels with 65–255
  avgPorosityPct?: number | null;  // average normalized porosity among 0–64, where 64 → 100%
  avgSSSPct?: number | null;       // average normalized SSS among 65–255, where 65 → 0%, 255 → 100%

  // Alpha channel (Emission)
  avgAlpha: number;                // 0–255 raw average
  avgEmissionPct: number;          // 0–100% using spec rule (0–254 map to 0–100; 255 → 0%)

  // Material match (based on Green F0 only when applicable)
  closestMaterial?: {
    name: string;
    category: string;
    f0: number;
    reflectance: number | null;    // F0% for UI
    difference: number;            // encoded difference (0–255)
    ior?: number | null;
    rgbF0?: { r: number; g: number; b: number };
    notes?: string;
  } | null;

  // Distribution around the mean for quick sanity (red channel buckets)
  redDistribution: { [key: number]: number };
}

/** ---------- Image analysis ---------- */
function buildChannelThumb(data: Uint8ClampedArray, w: number, h: number, pick: 'r'|'g'|'b'|'a') {
  const c = document.createElement('canvas');
  c.width = w; c.height = h;
  const ctx = c.getContext('2d')!;
  const out = ctx.createImageData(w, h);
  for (let i = 0; i < data.length; i += 4) {
    const val =
      pick === 'r' ? data[i] :
      pick === 'g' ? data[i+1] :
      pick === 'b' ? data[i+2] : data[i+3];
    out.data[i]   = val;
    out.data[i+1] = val;
    out.data[i+2] = val;
    out.data[i+3] = 255;
  }
  ctx.putImageData(out, 0, 0);
  return c.toDataURL();
}

function mostFrequentKey(map: Record<number, number>): number | null {
  let bestKey: number | null = null;
  let bestCount = -1;
  for (const [kStr, v] of Object.entries(map)) {
    const k = Number(kStr);
    if (v > bestCount) { bestCount = v; bestKey = k; }
  }
  return bestKey;
}

export default function SpecularMapAnalyzer() {
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyzeImage = async (file: File): Promise<AnalysisResult> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d')!;
      const img = new Image();

      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);

        const { data, width, height } = ctx.getImageData(0, 0, canvas.width, canvas.height);

        // Thumbs
        const original = canvas.toDataURL();
        const redThumb   = buildChannelThumb(data, width, height, 'r');
        const greenThumb = buildChannelThumb(data, width, height, 'g');
        const blueThumb  = buildChannelThumb(data, width, height, 'b');
        const alphaThumb = buildChannelThumb(data, width, height, 'a');

        // Stats
        let sumR = 0, sumG = 0, sumB = 0, sumA = 0;
        let redDist: Record<number, number> = {};
        let f0Count = 0, f0Sum = 0;
        let metalCount = 0;
        const metalBins: Record<number, number> = {};
        let porosityCount = 0, porositySumNorm = 0;   // normalized 0..1 (0..64 → 0..1)
        let sssCount = 0, sssSumNorm = 0;             // normalized 0..1 (65..255 → 0..1)

        const totalPixels = data.length / 4;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i+1];
          const b = data[i+2];
          const a = data[i+3];

          sumR += r; sumG += g; sumB += b; sumA += a;

          redDist[r] = (redDist[r] || 0) + 1;

          // Green: F0 vs Metal
          if (g <= 229) {
            f0Count++;
            f0Sum += g; // encoded 0..229
          } else {
            metalCount++;
            metalBins[g] = (metalBins[g] || 0) + 1; // 230..255
          }

          // Blue: Porosity vs SSS
          if (b <= 64) {
            porosityCount++;
            porositySumNorm += (b / 64); // 0..1
          } else {
            sssCount++;
            sssSumNorm += (b - 65) / (255 - 65); // 0..1
          }
        }

        const avgRed = sumR / totalPixels;
        const avgGreen = sumG / totalPixels;
        const avgBlue = sumB / totalPixels;
        const avgAlpha = sumA / totalPixels;

        // Green details
        const avgF0Encoded = f0Count > 0 ? (f0Sum / f0Count) : null;
        const avgF0Percent = avgF0Encoded !== null ? toPercent(avgF0Encoded, 255) : null;

        const topMetalCode = metalCount > 0 ? mostFrequentKey(metalBins) : null;
        const topMetalName = topMetalCode !== null ? (GREEN_METAL_CODES[topMetalCode] ?? "Custom/Reserved metal code") : null;

        const greenF0CoveragePct = toPercent(f0Count, totalPixels);
        const greenMetalCoveragePct = toPercent(metalCount, totalPixels);

        // Blue details
        const porosityCoveragePct = toPercent(porosityCount, totalPixels);
        const sssCoveragePct = toPercent(sssCount, totalPixels);
        const avgPorosityPct = porosityCount > 0 ? (porositySumNorm / porosityCount) * 100 : null;
        const avgSSSPct = sssCount > 0 ? (sssSumNorm / sssCount) * 100 : null;

        // Alpha emission per spec: 0..254 map to 0..100%, 255 → 0%
        const emissionPctFromA = (va: number) => (va === 255 ? 0 : (va / 254) * 100);
        const avgEmissionPct = emissionPctFromA(avgAlpha);

        // Material match (only meaningful if there is F0 region in green)
        let closestMaterial: AnalysisResult["closestMaterial"] = null;
        if (avgF0Encoded !== null) {
          const allMaterials: (BaseMaterial & { category: string })[] =
            Object.entries(F0_VALUES).flatMap(([category, arr]) => arr.map(m => ({ ...m, category })));
          let closest = allMaterials[0];
          let minDiff = Math.abs(avgF0Encoded - closest.f0);
          for (const m of allMaterials) {
            const d = Math.abs(avgF0Encoded - m.f0);
            if (d < minDiff) { minDiff = d; closest = m; }
          }
          closestMaterial = {
            name: closest.name,
            category: closest.category,
            f0: closest.f0,
            ior: closest.ior ?? null,
            rgbF0: closest.rgbF0,
            reflectance: typeof closest.f0Percent === 'number'
              ? closest.f0Percent
              : (typeof closest.ior === 'number' ? f0PercentFromIOR(closest.ior) : null),
            difference: minDiff,
            notes: closest.notes
          };
        }

        resolve({
          imageDataUrl: original,
          thumbs: { original, red: redThumb, green: greenThumb, blue: blueThumb, alpha: alphaThumb },

          avgRed,
          avgRedPct: toPercent(avgRed, 255),

          avgGreen,
          greenF0CoveragePct,
          greenMetalCoveragePct,
          avgF0Encoded,
          avgF0Percent,
          topMetalCode,
          topMetalName,

          avgBlue,
          porosityCoveragePct,
          sssCoveragePct,
          avgPorosityPct,
          avgSSSPct,

          avgAlpha,
          avgEmissionPct,

          closestMaterial,
          redDistribution: redDist
        });
      };

      img.src = URL.createObjectURL(file);
    });
  };

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    setIsAnalyzing(true);
    try {
      const result = await analyzeImage(acceptedFiles[0]);
      setAnalysisResult(result);
    } catch (e) {
      console.error("Error analyzing image:", e);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.png', '.jpg', '.jpeg', '.bmp', '.tga', '.tiff'] },
    multiple: false
  });

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Specular Map Analyzer (RGBA)
          </CardTitle>
          <CardDescription>
            Drop a specular map. We’ll analyze its channels:
            <br />
            <span className="font-medium">Red</span> = <em>Smoothness</em> (0–255),
            <span className="font-medium ml-2">Green</span> = <em>F0/Reflectance</em> (0–229, linear) or <em>Metal Code</em> (230–255),
            <span className="font-medium ml-2">Blue</span> = <em>Porosity</em> (0–64, linear) or <em>Subsurface Scattering</em> (65–255, linear),
            <span className="font-medium ml-2">Alpha</span> = <em>Emission</em> (0–254 → 0–100%; 255 → 0%).
            <br />
            Note: Green F0 max of 229 encodes ~90% (229/255), not 100%.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-4">
              <div className="p-4 rounded-full bg-primary/10">
                <Upload className="h-8 w-8 text-primary" />
              </div>
              <div>
                <p className="text-lg font-medium">
                  {isDragActive ? 'Drop your specular map here' : 'Upload Specular Map'}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Supports PNG, JPG, TGA, BMP, TIFF
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {isAnalyzing && (
        <Card className="glass-card">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex items-center gap-3">
                <Zap className="h-5 w-5 text-primary animate-pulse" />
                <span className="text-lg font-medium">Analyzing channels…</span>
              </div>
              <Progress value={undefined} className="w-full max-w-md" />
            </div>
          </CardContent>
        </Card>
      )}

      {analysisResult && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5 text-primary" />
              Analysis Results
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8">
            {/* Previews */}
            <section>
              <h4 className="font-medium mb-3">Channel Thumbnails</h4>
              <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
                <div>
                  <div className="text-sm font-medium mb-1">Original</div>
                  <img src={analysisResult.thumbs.original} alt="original" className="rounded border max-h-40 w-auto" />
                </div>
                <div>
                  <div className="text-sm font-medium mb-1">Red (Smoothness)</div>
                  <img src={analysisResult.thumbs.red} alt="red" className="rounded border max-h-40 w-auto" />
                </div>
                <div>
                  <div className="text-sm font-medium mb-1">Green (F0 / Metal)</div>
                  <img src={analysisResult.thumbs.green} alt="green" className="rounded border max-h-40 w-auto" />
                </div>
                <div>
                  <div className="text-sm font-medium mb-1">Blue (Porosity / SSS)</div>
                  <img src={analysisResult.thumbs.blue} alt="blue" className="rounded border max-h-40 w-auto" />
                </div>
                <div>
                  <div className="text-sm font-medium mb-1">Alpha (Emission)</div>
                  <img src={analysisResult.thumbs.alpha} alt="alpha" className="rounded border max-h-40 w-auto" />
                </div>
              </div>
            </section>

            {/* Red: Smoothness */}
            <section>
              <h4 className="font-medium mb-2">Red — Smoothness</h4>
              <div className="bg-muted rounded p-3 text-sm flex flex-wrap gap-3 items-center">
                <Badge variant="secondary">Avg (0–255): {Math.round(analysisResult.avgRed)}</Badge>
                <Badge>~{analysisResult.avgRedPct.toFixed(1)}%</Badge>
                <span className="text-muted-foreground">
                  Higher values → smoother microfacet distribution (sharper specular highlight).
                </span>
              </div>
            </section>

            {/* Green: F0 / Metal */}
            <section>
              <h4 className="font-medium mb-2">Green — F0 (0–229) / Metal Codes (230–255)</h4>
              <div className="bg-muted rounded p-3 text-sm space-y-2">
                <div className="flex flex-wrap gap-2 items-center">
                  <Badge variant="secondary">Avg G: {Math.round(analysisResult.avgGreen)}</Badge>
                  <Badge>F0 coverage: {analysisResult.greenF0CoveragePct.toFixed(1)}%</Badge>
                  <Badge>Metal coverage: {analysisResult.greenMetalCoveragePct.toFixed(1)}%</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  0–229 encode linear F0/reflectance. 229 means 229/255 ≈ 89.8% (not 100%).
                  230–255 are metal codes; 230–237 are standard, others custom/reserved.
                </p>

                <div className="grid md:grid-cols-2 gap-3">
                  <div className="bg-background rounded p-3">
                    <div className="font-medium mb-1">F0 Region (0–229)</div>
                    {analysisResult.avgF0Encoded !== null ? (
                      <>
                        <div className="flex flex-wrap gap-2 items-center">
                          <Badge>Avg F0 (enc): {Math.round(analysisResult.avgF0Encoded!)}</Badge>
                          <Badge variant="outline">F0%: {analysisResult.avgF0Percent!.toFixed(2)}%</Badge>
                        </div>
                        {analysisResult.closestMaterial && (
                          <div className="mt-2 text-xs">
                            <div className="flex items-center gap-2">
                              <Badge variant="secondary">{analysisResult.closestMaterial.category}</Badge>
                              <span className="font-medium">{analysisResult.closestMaterial.name}</span>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-1">
                              <Badge variant="outline">Match Δ: {analysisResult.closestMaterial.difference.toFixed(1)}</Badge>
                              {typeof analysisResult.closestMaterial.reflectance === 'number' && (
                                <Badge variant="outline">Catalog F0%: {analysisResult.closestMaterial.reflectance.toFixed(2)}%</Badge>
                              )}
                              {typeof analysisResult.closestMaterial.ior === 'number' && (
                                <Badge variant="outline">IOR: {analysisResult.closestMaterial.ior.toFixed(3)}</Badge>
                              )}
                            </div>
                            {analysisResult.closestMaterial.rgbF0 && (
                              <div className="mt-1 flex items-center gap-2">
                                <span>Metal RGB F0:</span>
                                <code>R{analysisResult.closestMaterial.rgbF0.r}</code>
                                <code>G{analysisResult.closestMaterial.rgbF0.g}</code>
                                <code>B{analysisResult.closestMaterial.rgbF0.b}</code>
                              </div>
                            )}
                            {analysisResult.closestMaterial.notes && (
                              <p className="mt-1 text-muted-foreground">{analysisResult.closestMaterial.notes}</p>
                            )}
                          </div>
                        )}
                      </>
                    ) : (
                      <p className="text-muted-foreground text-xs">No pixels in 0–229 range.</p>
                    )}
                  </div>

                  <div className="bg-background rounded p-3">
                    <div className="font-medium mb-1">Metal Codes (230–255)</div>
                    {analysisResult.topMetalCode !== null ? (
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge>Code: {analysisResult.topMetalCode}</Badge>
                        <Badge variant="secondary">{analysisResult.topMetalName}</Badge>
                        <p className="text-xs text-muted-foreground">
                          230–237 map to common metals; 238–255 may be vendor-specific.
                        </p>
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-xs">No pixels in 230–255 range.</p>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {/* Blue: Porosity / SSS */}
            <section>
              <h4 className="font-medium mb-2">Blue — Porosity (0–64) / Subsurface Scattering (65–255)</h4>
              <div className="bg-muted rounded p-3 text-sm space-y-2">
                <div className="flex flex-wrap gap-2 items-center">
                  <Badge variant="secondary">Avg B: {Math.round(analysisResult.avgBlue)}</Badge>
                  <Badge>Porosity cov.: {analysisResult.porosityCoveragePct.toFixed(1)}%</Badge>
                  <Badge>SSS cov.: {analysisResult.sssCoveragePct.toFixed(1)}%</Badge>
                </div>
                <div className="flex flex-wrap gap-2 items-center text-xs">
                  {typeof analysisResult.avgPorosityPct === 'number' && (
                    <Badge variant="outline">Avg Porosity: {analysisResult.avgPorosityPct.toFixed(1)}%</Badge>
                  )}
                  {typeof analysisResult.avgSSSPct === 'number' && (
                    <Badge variant="outline">Avg SSS: {analysisResult.avgSSSPct.toFixed(1)}%</Badge>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  Both porosity and SSS are stored linearly. Example visuals depend on your workflow; use this split to ensure
                  blue values are in the intended range for the material.
                </p>
              </div>
            </section>

            {/* Alpha: Emission */}
            <section>
              <h4 className="font-medium mb-2">Alpha — Emission</h4>
              <div className="bg-muted rounded p-3 text-sm space-y-2">
                <div className="flex flex-wrap gap-2 items-center">
                  <Badge variant="secondary">Avg A: {Math.round(analysisResult.avgAlpha)}</Badge>
                  <Badge>Avg Emission: {analysisResult.avgEmissionPct.toFixed(1)}%</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Emission mapping: values <strong>0–254</strong> represent 0–100% emissiveness linearly (value/254).
                  A value of <strong>255</strong> is a special case and also means <strong>0%</strong> emissive.
                </p>
              </div>
            </section>

            {/* Quick red distribution sample near mean (sanity for smoothness maps) */}
            <section>
              <h4 className="font-medium mb-2">Smoothness Distribution (sampled)</h4>
              <p className="text-sm text-muted-foreground">
                Non-zero buckets near the mean of the red channel to sanity-check smoothness encoding.
              </p>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {Object.entries(analysisResult.redDistribution)
                  .map(([k, v]) => ({ k: Number(k), v }))
                  .filter(({ v }) => v > 0)
                  .sort((a, b) => Math.abs(a.k - analysisResult.avgRed) - Math.abs(b.k - analysisResult.avgRed))
                  .slice(0, 8)
                  .map(({ k, v }) => (
                    <div key={k} className="bg-muted rounded p-2 text-xs flex items-center justify-between">
                      <span>Val {k}</span>
                      <span className="text-muted-foreground">px {v}</span>
                    </div>
                  ))}
              </div>
            </section>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

function toPercent(f0Count: number, totalPixels: number) {
  if (totalPixels === 0) return 0;
  return (f0Count / totalPixels) * 100;
}
