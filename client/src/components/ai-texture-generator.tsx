import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Sparkles, 
  Wand2, 
  ImagePlus, 
  Layers,
  Palette,
  Shuffle,
  Download,
  RefreshCw,
  Loader2,
  Copy
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface GenerationPreset {
  name: string;
  prompt: string;
  style: string;
  negativePrompt: string;
}

export default function AITextureGenerator() {
  const [prompt, setPrompt] = useState("");
  const [style, setStyle] = useState("realistic");
  const [resolution, setResolution] = useState("256");
  const [variations, setVariations] = useState(1);
  const [seamless, setSeamless] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImages, setGeneratedImages] = useState<string[]>([]);
  const { toast } = useToast();

  const presets: GenerationPreset[] = [
    {
      name: "Stone Brick",
      prompt: "medieval stone brick wall texture, weathered, moss, seamless tileable",
      style: "realistic",
      negativePrompt: "blurry, low quality"
    },
    {
      name: "Oak Wood",
      prompt: "oak wood planks texture, natural grain, warm brown, seamless tileable",
      style: "realistic",
      negativePrompt: "painted, artificial"
    },
    {
      name: "Diamond Ore",
      prompt: "diamond ore texture, blue crystals embedded in stone, minecraft style",
      style: "stylized",
      negativePrompt: "realistic, photo"
    },
    {
      name: "Grass Block",
      prompt: "grass texture top view, lush green, small flowers, minecraft style",
      style: "stylized",
      negativePrompt: "dry, dead"
    },
    {
      name: "Nether Brick",
      prompt: "nether brick texture, dark red, hellish, cracked, lava glow",
      style: "fantasy",
      negativePrompt: "bright, cheerful"
    },
    {
      name: "Ice Block",
      prompt: "ice block texture, transparent blue, frozen, crystalline structure",
      style: "realistic",
      negativePrompt: "melted, water"
    }
  ];

  const materialTypes = [
    "Wood", "Stone", "Metal", "Fabric", "Glass", "Dirt", 
    "Sand", "Grass", "Leaves", "Water", "Lava", "Ice"
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({ 
        title: "Please enter a prompt", 
        description: "Describe the texture you want to generate",
        variant: "destructive" 
      });
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI generation
    setTimeout(() => {
      const mockImages = Array.from({ length: variations }, (_, i) => 
        `/api/placeholder/${resolution}/${resolution}?text=AI+${i+1}`
      );
      setGeneratedImages(mockImages);
      setIsGenerating(false);
      toast({ 
        title: "Textures generated!", 
        description: `Created ${variations} variation${variations > 1 ? 's' : ''}`
      });
    }, 3000);
  };

  const applyPreset = (preset: GenerationPreset) => {
    setPrompt(preset.prompt);
    setStyle(preset.style);
    toast({ title: `Applied "${preset.name}" preset` });
  };

  const enhancePrompt = () => {
    const enhanced = `${prompt}, highly detailed, ${resolution}x${resolution} resolution, ${
      seamless ? 'seamless tileable texture' : 'texture'
    }, ${style} style, game asset, high quality`;
    setPrompt(enhanced);
    toast({ title: "Prompt enhanced with quality modifiers" });
  };

  return (
    <div className="space-y-6">
      <Card className="moss-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            AI Texture Generator
          </CardTitle>
          <CardDescription>
            Generate textures from text descriptions using AI
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <Tabs defaultValue="generate" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="generate">Generate</TabsTrigger>
              <TabsTrigger value="variations">Variations</TabsTrigger>
              <TabsTrigger value="upscale">Upscale</TabsTrigger>
            </TabsList>

            <TabsContent value="generate" className="space-y-4">
              {/* Presets */}
              <div className="space-y-2">
                <Label>Quick Presets</Label>
                <div className="flex flex-wrap gap-2">
                  {presets.map((preset) => (
                    <Button
                      key={preset.name}
                      variant="outline"
                      size="sm"
                      onClick={() => applyPreset(preset)}
                      className="grow-button"
                    >
                      {preset.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Prompt Input */}
              <div className="space-y-2">
                <Label htmlFor="prompt">Texture Description</Label>
                <Textarea
                  id="prompt"
                  placeholder="Describe the texture you want to generate..."
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  rows={3}
                />
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={enhancePrompt}
                  className="grow-button"
                >
                  <Wand2 className="h-4 w-4 mr-2" />
                  Enhance Prompt
                </Button>
              </div>

              {/* Style Selection */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Art Style</Label>
                  <Select value={style} onValueChange={setStyle}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="realistic">Realistic</SelectItem>
                      <SelectItem value="stylized">Stylized</SelectItem>
                      <SelectItem value="pixelart">Pixel Art</SelectItem>
                      <SelectItem value="painted">Hand Painted</SelectItem>
                      <SelectItem value="cartoon">Cartoon</SelectItem>
                      <SelectItem value="fantasy">Fantasy</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Material Type</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select material" />
                    </SelectTrigger>
                    <SelectContent>
                      {materialTypes.map(type => (
                        <SelectItem key={type} value={type.toLowerCase()}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Generation Settings */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Resolution</Label>
                  <Select value={resolution} onValueChange={setResolution}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="16">16x16</SelectItem>
                      <SelectItem value="32">32x32</SelectItem>
                      <SelectItem value="64">64x64</SelectItem>
                      <SelectItem value="128">128x128</SelectItem>
                      <SelectItem value="256">256x256</SelectItem>
                      <SelectItem value="512">512x512</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Variations: {variations}</Label>
                  <Slider
                    value={[variations]}
                    onValueChange={([v]) => setVariations(v)}
                    min={1}
                    max={8}
                    step={1}
                  />
                </div>
              </div>

              {/* Options */}
              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={seamless}
                    onChange={(e) => setSeamless(e.target.checked)}
                    className="rounded"
                  />
                  <span className="text-sm">Seamless Tiling</span>
                </label>
              </div>

              {/* Generate Button */}
              <Button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full grow-button moss-texture"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Textures
                  </>
                )}
              </Button>
            </TabsContent>

            <TabsContent value="variations" className="space-y-4">
              <div className="text-center py-8">
                <Shuffle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">Create Variations</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Upload a texture to generate similar variations
                </p>
                <Button className="grow-button moss-texture">
                  <ImagePlus className="h-4 w-4 mr-2" />
                  Upload Reference Texture
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="upscale" className="space-y-4">
              <div className="text-center py-8">
                <Layers className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                <h3 className="text-lg font-medium mb-2">AI Upscaling</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Increase texture resolution while preserving detail
                </p>
                <Button className="grow-button moss-texture">
                  <ImagePlus className="h-4 w-4 mr-2" />
                  Upload Texture to Upscale
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Generated Images Grid */}
      {generatedImages.length > 0 && (
        <Card className="moss-card">
          <CardHeader>
            <CardTitle>Generated Textures</CardTitle>
            <CardDescription>
              Click on any texture to download or apply to your project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {generatedImages.map((img, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-lg overflow-hidden">
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      AI Texture {index + 1}
                    </div>
                  </div>
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                    <Button size="sm" variant="secondary" className="grow-button">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="secondary" className="grow-button">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="secondary" className="grow-button">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}