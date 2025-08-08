import { useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useDropzone } from 'react-dropzone';
import { Upload, Eye, Zap, Palette } from 'lucide-react';

// F0 values from the LabPBR specification
const F0_VALUES = {
  liquids: [
    { name: "Ice, Boiling Water", reflectance: 1.80, f0: 5 },
    { name: "Water, Blood, Tears, Saliva, Lubricant", reflectance: 2.10, f0: 5 },
    { name: "Beer", reflectance: 2.20, f0: 6 },
    { name: "Milk, Soda, Fruit Juice, Strong Alcohol, Hair Gel", reflectance: 2.30, f0: 6 },
    { name: "Shampoo, Liquid ~25% Sugar", reflectance: 2.50, f0: 6 },
    { name: "Fuel, Lamp Oil, Kerosene, Steak Sauce, Ketchup", reflectance: 2.70, f0: 7 },
    { name: "Concentrated Fruit Juice, Liquid ~50% Sugar", reflectance: 3.20, f0: 8 },
    { name: "Jam, Jelly, Marmalade, Vegetable Oil, Solvent", reflectance: 3.60, f0: 9 },
    { name: "Liquid Honey, Liquid ~75% Sugar", reflectance: 3.70, f0: 9 },
    { name: "Viscuous Honey, Liquid ~90% Sugar", reflectance: 4.10, f0: 10 },
    { name: "Hydraulic Fluid", reflectance: 5.10, f0: 13 },
    { name: "Liquid Mercury", reflectance: 5.60, f0: 14 }
  ],
  surfaces: [
    { name: "Teflon", reflectance: 2.30, f0: 6 },
    { name: "Skin", reflectance: 3.30, f0: 8 },
    { name: "Soft Plastic, Plant, Leaf, Grass, Leather, Cellulose", reflectance: 3.50, f0: 9 },
    { name: "Rust, Stone, Rock, Bark, Matte Surface", reflectance: 3.90, f0: 10 },
    { name: "Fabrics, Fibers, Strings, Rope", reflectance: 4.00, f0: 10 },
    { name: "Green Wood, Wood, Plastic", reflectance: 4.30, f0: 11 },
    { name: "Rough Pearl (inside), Nylon Fabric, Rubber", reflectance: 4.40, f0: 11 },
    { name: "Ivory, Moss, Teeth Dentin, Clay, Sand, Hair, Table Salt", reflectance: 4.60, f0: 12 },
    { name: "CD, DVD, Optical Disks", reflectance: 4.90, f0: 12 },
    { name: "Polystyrene, Teeth root (cementum)", reflectance: 5.00, f0: 13 },
    { name: "Teeth Enamel", reflectance: 5.80, f0: 15 },
    { name: "Glossy Surface, Polish Marble, Ceramic, Asphalt", reflectance: 6.00, f0: 15 },
    { name: "Pearly Pearl (outside), Nacre, Glitter, Sequin", reflectance: 6.60, f0: 17 },
    { name: "Lead", reflectance: 11.30, f0: 29 }
  ],
  gems: [
    { name: "Quartz", reflectance: 3.40, f0: 9 },
    { name: "Salt, Jasper", reflectance: 4.50, f0: 11 },
    { name: "Agathe, Amethyst, Amber, Sugar", reflectance: 4.70, f0: 12 },
    { name: "Emerald", reflectance: 5.10, f0: 13 },
    { name: "Topaz", reflectance: 5.60, f0: 14 },
    { name: "Jade", reflectance: 6.30, f0: 16 },
    { name: "Sapphire", reflectance: 7.60, f0: 19 },
    { name: "Crystal", reflectance: 9.20, f0: 23 },
    { name: "Ruby", reflectance: 12.40, f0: 32 },
    { name: "Fake Diamond (Cubic Zirconia)", reflectance: 13.00, f0: 33 },
    { name: "Diamond", reflectance: 17.00, f0: 43 }
  ],
  transparents: [
    { name: "Bubble", reflectance: 0.20, f0: 1 },
    { name: "Eye Lens", reflectance: 2.70, f0: 7 },
    { name: "Optical Fiber Lens, Fused Silica", reflectance: 3.50, f0: 9 },
    { name: "Cooking Glass, Pyrex, Plexiglas, Lucite, Acrylic Glass", reflectance: 3.70, f0: 9 },
    { name: "Glass, Impure Flint Glass, Optical or Crown Glass", reflectance: 4.20, f0: 11 },
    { name: "Safety Glass, Headlight Glass", reflectance: 4.80, f0: 12 },
    { name: "Optical Lens, Pure Flint Glass", reflectance: 6.10, f0: 16 },
    { name: "Crystal Glass", reflectance: 9.20, f0: 23 }
  ],
  human: [
    { name: "Tears, Eye Humors, Sweat, Saliva, Blood", reflectance: 2.10, f0: 5 },
    { name: "Eye Cornea", reflectance: 2.60, f0: 7 },
    { name: "Eye Lens", reflectance: 2.70, f0: 7 },
    { name: "Skin", reflectance: 3.30, f0: 8 },
    { name: "Teeth Dentin", reflectance: 4.50, f0: 11 },
    { name: "Hair", reflectance: 4.70, f0: 12 },
    { name: "Teeth Root (Cementum)", reflectance: 5.10, f0: 13 },
    { name: "Teeth Enamel", reflectance: 5.80, f0: 15 }
  ],
  metals: [
    { name: "Iron", reflectance: null, f0: 230 },
    { name: "Gold", reflectance: null, f0: 231 },
    { name: "Aluminum", reflectance: null, f0: 232 },
    { name: "Chrome", reflectance: null, f0: 233 },
    { name: "Copper", reflectance: null, f0: 234 },
    { name: "Lead", reflectance: null, f0: 235 },
    { name: "Platinum", reflectance: null, f0: 236 },
    { name: "Silver", reflectance: null, f0: 237 }
  ]
};

interface AnalysisResult {
  averageValue: number;
  closestMaterial: {
    name: string;
    category: string;
    f0: number;
    reflectance: number | null;
    difference: number;
  };
  valueDistribution: { [key: number]: number };
  imageDataUrl: string;
}

export default function F0Analyzer() {
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
        
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const data = imageData.data;
        
        let totalValue = 0;
        let pixelCount = 0;
        const valueDistribution: { [key: number]: number } = {};
        
        // Analyze each pixel's red channel (specular intensity)
        for (let i = 0; i < data.length; i += 4) {
          const red = data[i]; // Red channel contains specular intensity
          totalValue += red;
          pixelCount++;
          
          valueDistribution[red] = (valueDistribution[red] || 0) + 1;
        }
        
        const averageValue = totalValue / pixelCount;
        
        // Find closest material based on F0 value
        const allMaterials = [
          ...F0_VALUES.liquids.map(m => ({ ...m, category: 'Liquids' })),
          ...F0_VALUES.surfaces.map(m => ({ ...m, category: 'Surfaces' })),
          ...F0_VALUES.gems.map(m => ({ ...m, category: 'Gems' })),
          ...F0_VALUES.transparents.map(m => ({ ...m, category: 'Transparents' })),
          ...F0_VALUES.human.map(m => ({ ...m, category: 'Human' })),
          ...F0_VALUES.metals.map(m => ({ ...m, category: 'Metals' }))
        ];
        
        let closestMaterial = allMaterials[0];
        let minDifference = Math.abs(averageValue - closestMaterial.f0);
        
        allMaterials.forEach(material => {
          const difference = Math.abs(averageValue - material.f0);
          if (difference < minDifference) {
            minDifference = difference;
            closestMaterial = material;
          }
        });
        
        resolve({
          averageValue,
          closestMaterial: {
            ...closestMaterial,
            difference: minDifference
          },
          valueDistribution,
          imageDataUrl: canvas.toDataURL()
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
    } catch (error) {
      console.error('Error analyzing image:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.bmp', '.tga', '.tiff']
    },
    multiple: false
  });

  return (
    <div className="space-y-6">
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5 text-primary" />
            Specular Map F0 Analyzer
          </CardTitle>
          <CardDescription>
            Upload your specular map to analyze its F0 values and find the closest real-world material match
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
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
                  Supports PNG, JPG, TGA, and other common formats
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
                <span className="text-lg font-medium">Analyzing specular values...</span>
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
          <CardContent className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium mb-3">Specular Map Preview</h4>
                <div className="bg-muted rounded-lg p-4">
                  <img 
                    src={analysisResult.imageDataUrl} 
                    alt="Analyzed specular map"
                    className="max-w-full h-auto rounded border"
                    style={{ maxHeight: '200px', imageRendering: 'pixelated' }}
                  />
                </div>
              </div>
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Average F0 Value</h4>
                  <div className="text-3xl font-bold text-primary">
                    {Math.round(analysisResult.averageValue)}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    ({analysisResult.averageValue.toFixed(1)} exact value)
                  </p>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Closest Material Match</h4>
                  <div className="bg-muted rounded-lg p-4 space-y-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{analysisResult.closestMaterial.category}</Badge>
                      <span className="font-medium">F0: {analysisResult.closestMaterial.f0}</span>
                    </div>
                    <p className="text-sm">{analysisResult.closestMaterial.name}</p>
                    {analysisResult.closestMaterial.reflectance && (
                      <p className="text-xs text-muted-foreground">
                        Reflectance: {analysisResult.closestMaterial.reflectance}%
                      </p>
                    )}
                    <div className="flex items-center gap-2 text-xs">
                      <span className="text-muted-foreground">Accuracy:</span>
                      <Badge variant={analysisResult.closestMaterial.difference <= 5 ? "default" : "secondary"}>
                        ±{analysisResult.closestMaterial.difference.toFixed(1)} F0 units
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Material Recommendations</h4>
              <p className="text-sm text-muted-foreground mb-3">
                Based on your specular map's F0 value of {Math.round(analysisResult.averageValue)}, here are similar materials:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[...Array.from(new Set([
                  ...F0_VALUES.liquids,
                  ...F0_VALUES.surfaces,
                  ...F0_VALUES.gems,
                  ...F0_VALUES.transparents,
                  ...F0_VALUES.human
                ]))]
                  .filter(material => Math.abs(material.f0 - analysisResult.averageValue) <= 10)
                  .sort((a, b) => Math.abs(a.f0 - analysisResult.averageValue) - Math.abs(b.f0 - analysisResult.averageValue))
                  .slice(0, 6)
                  .map((material, index) => (
                    <div key={index} className="bg-muted rounded p-3 text-sm">
                      <div className="font-medium">F0: {material.f0}</div>
                      <div className="text-xs text-muted-foreground truncate" title={material.name}>
                        {material.name}
                      </div>
                      {material.reflectance && (
                        <div className="text-xs text-muted-foreground">
                          {material.reflectance}% reflectance
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}