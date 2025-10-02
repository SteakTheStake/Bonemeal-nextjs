import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { AlertTriangle, Settings2, Zap, ArrowUp, ArrowDown, Cpu, Wand2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface AdvancedInterpolationProps {
  onSettingsChange: (settings: any) => void;
}

export function AdvancedInterpolation({ onSettingsChange }: AdvancedInterpolationProps) {
  const [enableAdvancedProcessing, setEnableAdvancedProcessing] = useState(true);
  const [enableAIUpscaling, setEnableAIUpscaling] = useState(false);
  const [aiServerIP, setAiServerIP] = useState("");
  const [aiServerPort, setAiServerPort] = useState("7860");
  const [maxUpscaleSize, setMaxUpscaleSize] = useState(1024);
  const [blendOpacity, setBlendOpacity] = useState(50);

  const interpolationMethods = {
    albedo: {
      primary: "Lanczos",
      secondary: "None (Pixel Perfect)",
      blend: true,
      description: "High-quality scaling with pixel-perfect details preserved"
    },
    normal: {
      primary: "Bilinear",
      secondary: null,
      blend: false,
      description: "Smooth interpolation preserving directional data"
    },
    specular: {
      primary: "Lanczos",
      secondary: null, 
      blend: false,
      description: "High-quality scaling for material properties"
    }
  };

  const handleSettingsUpdate = () => {
    const settings = {
      enableAdvancedProcessing,
      interpolationMethods,
      blendOpacity,
      aiUpscaling: {
        enabled: enableAIUpscaling,
        serverIP: aiServerIP,
        serverPort: aiServerPort,
        maxSize: maxUpscaleSize
      }
    };
    onSettingsChange(settings);
  };

  return (
    <div className="space-y-6">
      {/* Advanced Processing Toggle */}
      <Card className="glass-card moss-texture border living-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Settings2 className="h-5 w-5 text-green-400" />
              <CardTitle>Advanced Image Processing</CardTitle>
            </div>
            <Switch
              checked={enableAdvancedProcessing}
              onCheckedChange={(checked) => {
                setEnableAdvancedProcessing(checked);
                handleSettingsUpdate();
              }}
            />
          </div>
          <CardDescription>
            Enhanced texture processing with specialized interpolation methods for different texture types
          </CardDescription>
        </CardHeader>
        {enableAdvancedProcessing && (
          <CardContent className="space-y-6">
            {/* Interpolation Methods */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <Cpu className="h-4 w-4" />
                Interpolation Methods by Texture Type
              </h4>
              
              {Object.entries(interpolationMethods).map(([type, config]) => (
                <div key={type} className="p-4 rounded-lg bg-background/50 border border-border">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="capitalize">
                        {type}
                      </Badge>
                      <span className="text-sm font-medium">{config.primary}</span>
                      {config.blend && (
                        <>
                          <span className="text-muted-foreground">+</span>
                          <span className="text-sm">{config.secondary}</span>
                          <Badge variant="secondary" className="text-xs">
                            {blendOpacity}% Blend
                          </Badge>
                        </>
                      )}
                    </div>
                    {type === "albedo" && config.blend && (
                      <ArrowDown className="h-4 w-4 text-green-400" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{config.description}</p>
                </div>
              ))}

              {/* Blend Opacity Control */}
              <div className="space-y-2">
                <Label htmlFor="blend-opacity" className="text-sm font-medium">
                  Albedo Blend Opacity: {blendOpacity}%
                </Label>
                <Input
                  id="blend-opacity"
                  type="range"
                  min="0"
                  max="100"
                  value={blendOpacity}
                  onChange={(e) => {
                    setBlendOpacity(parseInt(e.target.value));
                    handleSettingsUpdate();
                  }}
                  className="w-full"
                />
                <p className="text-xs text-muted-foreground">
                  Controls how much pixel-perfect detail is preserved in albedo textures
                </p>
              </div>
            </div>
          </CardContent>
        )}
      </Card>

      {/* AI Upscaling */}
      <Card className="glass-card moss-texture border living-border">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Wand2 className="h-5 w-5 text-purple-400" />
              <CardTitle>AI-Powered Upscaling</CardTitle>
            </div>
            <Switch
              checked={enableAIUpscaling}
              onCheckedChange={(checked) => {
                setEnableAIUpscaling(checked);
                handleSettingsUpdate();
              }}
            />
          </div>
          <CardDescription>
            Stable Diffusion AI upscaling with LabPBR compliance and seamless tiling
          </CardDescription>
        </CardHeader>
        {enableAIUpscaling && (
          <CardContent className="space-y-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Requires Stable Diffusion installed locally with public IP access. 
                AI upscaling maintains LabPBR standards, vector data, and seamless tiling.
              </AlertDescription>
            </Alert>

            {/* Server Configuration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="ai-ip">Public IP Address</Label>
                <Input
                  id="ai-ip"
                  placeholder="192.168.1.100"
                  value={aiServerIP}
                  onChange={(e) => {
                    setAiServerIP(e.target.value);
                    handleSettingsUpdate();
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Your computer's public IP running Stable Diffusion
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="ai-port">Port</Label>
                <Input
                  id="ai-port"
                  placeholder="7860"
                  value={aiServerPort}
                  onChange={(e) => {
                    setAiServerPort(e.target.value);
                    handleSettingsUpdate();
                  }}
                />
                <p className="text-xs text-muted-foreground">
                  Default Stable Diffusion web UI port
                </p>
              </div>
            </div>

            {/* Upscaling Settings */}
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="max-size">Maximum Output Size</Label>
                <div className="flex items-center gap-2">
                  <Input
                    id="max-size"
                    type="number"
                    min="512"
                    max="2048"
                    step="256"
                    value={maxUpscaleSize}
                    onChange={(e) => {
                      setMaxUpscaleSize(parseInt(e.target.value));
                      handleSettingsUpdate();
                    }}
                    className="w-24"
                  />
                  <span className="text-sm text-muted-foreground">× {maxUpscaleSize} pixels</span>
                  <ArrowUp className="h-4 w-4 text-purple-400" />
                </div>
                <p className="text-xs text-muted-foreground">
                  AI upscaling target resolution (recommended: 1024×1024)
                </p>
              </div>

              {/* LabPBR Compliance Features */}
              <div className="p-4 rounded-lg bg-background/50 border border-border space-y-2">
                <h5 className="text-sm font-semibold text-foreground">LabPBR Compliance Features</h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs text-muted-foreground">
                  <div className="flex items-center gap-2">
                    <Zap className="h-3 w-3 text-green-400" />
                    Seamless tiling preservation
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-3 w-3 text-blue-400" />
                    Normal map XYZ vector integrity
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-3 w-3 text-purple-400" />
                    Specular channel precision
                  </div>
                  <div className="flex items-center gap-2">
                    <Zap className="h-3 w-3 text-yellow-400" />
                    LabPBR format validation
                  </div>
                </div>
              </div>
            </div>

            {/* Connection Test */}
            <div className="text-xs text-muted-foreground">
              Connection testing will be available once the external AI bridge is ready.
              For now, ensure your Stable Diffusion endpoint is reachable manually before enabling AI upscaling.
            </div>
          </CardContent>
        )}
      </Card>
    </div>
  );
}