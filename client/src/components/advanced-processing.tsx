import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Maximize2, 
  Minimize2, 
  Zap, 
  Grid3x3, 
  Settings2, 
  Info,
  AlertTriangle
} from "lucide-react";
import { useSettings } from "@/contexts/settings-context";
import { useToast } from "@/hooks/use-toast";

interface AdvancedProcessingProps {
  onJobCreated: (jobId: number) => void;
}

const RESOLUTIONS = [16, 32, 64, 128, 256, 512, 1024, 2048];
const INTERPOLATION_METHODS = [
  { value: 'nearest', label: 'Nearest (Pixel Art)', description: 'Sharp edges, no blur' },
  { value: 'linear', label: 'Linear (Smooth)', description: 'Smooth scaling' },
  { value: 'cubic', label: 'Cubic (High Quality)', description: 'Best quality, slower' },
  { value: 'lanczos', label: 'Lanczos (Professional)', description: 'Sharpest results' }
];

export function AdvancedProcessing({ onJobCreated }: AdvancedProcessingProps) {
  const { settings, updateAdvancedSettings, triggerUpload, currentFile } = useSettings();
  const { toast } = useToast();
  
  // Initialize from global settings
  const { advancedProcessing } = settings;
  
  // Bulk Resize Settings
  const [enableBulkResize, setEnableBulkResize] = useState(advancedProcessing.enableBulkResize);
  const [baseColorResolution, setBaseColorResolution] = useState(advancedProcessing.baseColorResolution);
  const [specularResolution, setSpecularResolution] = useState(advancedProcessing.specularResolution);
  const [normalResolution, setNormalResolution] = useState(advancedProcessing.normalResolution);
  const [baseColorInterpolation, setBaseColorInterpolation] = useState(advancedProcessing.baseColorInterpolation);
  const [specularInterpolation, setSpecularInterpolation] = useState(advancedProcessing.specularInterpolation);
  const [normalInterpolation, setNormalInterpolation] = useState(advancedProcessing.normalInterpolation);

  // Compression Settings
  const [enableCompression, setEnableCompression] = useState(advancedProcessing.enableCompression);
  const [compressionQuality, setCompressionQuality] = useState([advancedProcessing.compressionQuality]);
  const [enableDithering, setEnableDithering] = useState(advancedProcessing.enableDithering);

  // CTM Settings
  const [enableCTMSplit, setEnableCTMSplit] = useState(advancedProcessing.enableCTMSplit);
  const [ctmVariations, setCTMVariations] = useState([advancedProcessing.ctmVariations]);
  
  // Update global settings when local values change
  useEffect(() => {
    updateAdvancedSettings({
      enableBulkResize,
      baseColorResolution,
      specularResolution,
      normalResolution,
      baseColorInterpolation: baseColorInterpolation as any,
      specularInterpolation: specularInterpolation as any,
      normalInterpolation: normalInterpolation as any,
      enableCompression,
      compressionQuality: compressionQuality[0],
      enableDithering,
      enableCTMSplit,
      ctmVariations: ctmVariations[0],
    });
  }, [enableBulkResize, baseColorResolution, specularResolution, normalResolution,
      baseColorInterpolation, specularInterpolation, normalInterpolation,
      enableCompression, compressionQuality, enableDithering,
      enableCTMSplit, ctmVariations, updateAdvancedSettings]);

  return (
    <div className="flex flex-col h-full">
      <div className="p-4 border-b border-border">
        <div className="flex items-center space-x-2">
          <Settings2 className="h-4 w-4 text-primary" />
          <h2 className="text-sm font-medium">Advanced Processing</h2>
          <Badge variant="outline" className="text-xs">Professional</Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          Bulk processing tools for texture optimization
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <Tabs defaultValue="resize" className="w-full">
          <TabsList className="grid w-full grid-cols-3 m-4">
            <TabsTrigger value="resize" className="text-xs">
              <Maximize2 className="h-3 w-3 mr-1" />
              Resize
            </TabsTrigger>
            <TabsTrigger value="compress" className="text-xs">
              <Minimize2 className="h-3 w-3 mr-1" />
              Compress
            </TabsTrigger>
            <TabsTrigger value="ctm" className="text-xs">
              <Grid3x3 className="h-3 w-3 mr-1" />
              CTM Split
            </TabsTrigger>
          </TabsList>

          <TabsContent value="resize" className="px-4 pb-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Bulk Texture Resizing</CardTitle>
                  <Checkbox 
                    checked={enableBulkResize}
                    onCheckedChange={(checked) => setEnableBulkResize(checked === true)}
                  />
                </div>
                <CardDescription className="text-xs">
                  Independently resize base color, specular, and normal maps with custom interpolation
                </CardDescription>
              </CardHeader>
              
              {enableBulkResize && (
                <CardContent className="space-y-4">
                  {/* Base Color */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-primary">Base Color Map</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">Resolution</Label>
                        <Select value={baseColorResolution.toString()} onValueChange={(v) => setBaseColorResolution(parseInt(v))}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {RESOLUTIONS.map(res => (
                              <SelectItem key={res} value={res.toString()}>{res}x{res}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Interpolation</Label>
                        <Select value={baseColorInterpolation} onValueChange={setBaseColorInterpolation}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {INTERPOLATION_METHODS.map(method => (
                              <SelectItem key={method.value} value={method.value}>
                                {method.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Specular */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-warning">Specular Map</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">Resolution</Label>
                        <Select value={specularResolution.toString()} onValueChange={(v) => setSpecularResolution(parseInt(v))}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {RESOLUTIONS.map(res => (
                              <SelectItem key={res} value={res.toString()}>{res}x{res}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Interpolation</Label>
                        <Select value={specularInterpolation} onValueChange={setSpecularInterpolation}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {INTERPOLATION_METHODS.map(method => (
                              <SelectItem key={method.value} value={method.value}>
                                {method.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Normal */}
                  <div className="space-y-2">
                    <Label className="text-xs font-medium text-error">Normal Map</Label>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-xs text-muted-foreground">Resolution</Label>
                        <Select value={normalResolution.toString()} onValueChange={(v) => setNormalResolution(parseInt(v))}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {RESOLUTIONS.map(res => (
                              <SelectItem key={res} value={res.toString()}>{res}x{res}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-xs text-muted-foreground">Interpolation</Label>
                        <Select value={normalInterpolation} onValueChange={setNormalInterpolation}>
                          <SelectTrigger className="h-8 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {INTERPOLATION_METHODS.map(method => (
                              <SelectItem key={method.value} value={method.value}>
                                {method.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </div>

                  <div className="bg-muted/20 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Info className="h-3 w-3 text-primary" />
                      <span className="text-xs text-muted-foreground">
                        Use different interpolation methods for optimal results at all resolutions
                      </span>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="compress" className="px-4 pb-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Texture Compression</CardTitle>
                  <Checkbox 
                    checked={enableCompression}
                    onCheckedChange={(checked) => setEnableCompression(checked === true)}
                  />
                </div>
                <CardDescription className="text-xs">
                  Reduce file size and improve game performance with smart compression
                </CardDescription>
              </CardHeader>
              
              {enableCompression && (
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-muted-foreground">Compression Quality</Label>
                      <span className="text-xs text-foreground">{compressionQuality[0]}%</span>
                    </div>
                    <Slider
                      value={compressionQuality}
                      onValueChange={setCompressionQuality}
                      max={100}
                      min={30}
                      step={5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Small file</span>
                      <span>High quality</span>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox 
                        checked={enableDithering}
                        onCheckedChange={(checked) => setEnableDithering(checked === true)}
                      />
                      <Label className="text-xs">Enable Light Diffusion Dithering</Label>
                    </div>
                    <p className="text-xs text-muted-foreground ml-6">
                      Reduces file size while maintaining visual quality and reducing FPS drops
                    </p>
                  </div>

                  <div className="bg-success/20 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Zap className="h-3 w-3 text-success" />
                      <span className="text-xs text-success">
                        Optimized for game performance - reduces GPU memory usage
                      </span>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </TabsContent>

          <TabsContent value="ctm" className="px-4 pb-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">OptiFine CTM Split</CardTitle>
                  <Checkbox 
                    checked={enableCTMSplit}
                    onCheckedChange={(checked) => setEnableCTMSplit(checked === true)}
                  />
                </div>
                <CardDescription className="text-xs">
                  Split textures into Connected Textures Mod (CTM) repeat format
                </CardDescription>
              </CardHeader>
              
              {enableCTMSplit && (
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs text-muted-foreground">CTM Variations</Label>
                      <span className="text-xs text-foreground">{ctmVariations[0]}</span>
                    </div>
                    <Slider
                      value={ctmVariations}
                      onValueChange={setCTMVariations}
                      max={47}
                      min={1}
                      step={1}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>1 tile</span>
                      <span>47 tiles (full CTM)</span>
                    </div>
                  </div>

                  <div className="bg-muted/20 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Grid3x3 className="h-3 w-3 text-primary" />
                      <span className="text-xs text-muted-foreground">
                        Creates seamless connecting textures for blocks
                      </span>
                    </div>
                  </div>

                  <div className="bg-warning/20 p-3 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="h-3 w-3 text-warning" />
                      <span className="text-xs text-warning">
                        Requires OptiFine or compatible mod to work in-game
                      </span>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Process Button */}
      <div className="p-4 border-t border-border">
        <Button 
          className="w-full bg-primary hover:bg-primary/90 text-white"
          disabled={!enableBulkResize && !enableCompression && !enableCTMSplit}
          onClick={() => {
            if (!currentFile) {
              toast({
                title: "No file selected",
                description: "Please upload a texture file or resource pack first.",
                variant: "destructive",
              });
              return;
            }
            if (!enableBulkResize && !enableCompression && !enableCTMSplit) {
              toast({
                title: "No processing options selected",
                description: "Please enable at least one advanced processing option.",
                variant: "destructive",
              });
              return;
            }
            triggerUpload();
          }}
        >
          <Settings2 className="h-4 w-4 mr-2" />
          Apply Advanced Processing
        </Button>
        {!enableBulkResize && !enableCompression && !enableCTMSplit && (
          <p className="text-xs text-muted-foreground mt-2 text-center">
            Enable at least one processing option
          </p>
        )}
      </div>
    </div>
  );
}