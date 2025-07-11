import { useState } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ChevronRight, Play } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

interface ConversionSettingsProps {
  onJobCreated: (jobId: number) => void;
}

export function ConversionSettings({ onJobCreated }: ConversionSettingsProps) {
  const [inputType, setInputType] = useState("single");
  const [generateBaseColor, setGenerateBaseColor] = useState(true);
  const [generateRoughness, setGenerateRoughness] = useState(true);
  const [generateNormal, setGenerateNormal] = useState(true);
  const [generateHeight, setGenerateHeight] = useState(true);
  const [generateAO, setGenerateAO] = useState(true);
  
  const [baseColorContrast, setBaseColorContrast] = useState([1.2]);
  const [roughnessIntensity, setRoughnessIntensity] = useState([0.8]);
  const [roughnessInvert, setRoughnessInvert] = useState(false);
  const [normalStrength, setNormalStrength] = useState([1.0]);
  const [heightDepth, setHeightDepth] = useState([0.25]);
  const [aoRadius, setAoRadius] = useState([0.5]);
  
  const [showAdvanced, setShowAdvanced] = useState(false);

  return (
    <div className="flex flex-col h-full">
      {/* Input Sources */}
      <div className="p-4 border-b border-border">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Input Source</h2>
        <RadioGroup value={inputType} onValueChange={setInputType}>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="single" id="single" />
            <Label htmlFor="single" className="text-sm">Single Image</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="sequence" id="sequence" />
            <Label htmlFor="sequence" className="text-sm">Image Sequence</Label>
          </div>
          <div className="flex items-center space-x-2">
            <RadioGroupItem value="resourcepack" id="resourcepack" />
            <Label htmlFor="resourcepack" className="text-sm">Resource Pack</Label>
          </div>
        </RadioGroup>
      </div>

      {/* Generation Settings */}
      <div className="p-4 border-b border-border flex-1 overflow-y-auto">
        <h2 className="text-sm font-medium text-muted-foreground mb-3">Generation Settings</h2>
        
        {/* Base Color */}
        <div className="mb-4">
          <Label className="text-xs text-muted-foreground">Base Color</Label>
          <div className="flex items-center space-x-2 mt-2">
            <Checkbox 
              checked={generateBaseColor}
              onCheckedChange={setGenerateBaseColor}
            />
            <span className="text-sm">Generate</span>
          </div>
          {generateBaseColor && (
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Contrast</span>
                <span className="text-xs text-foreground">{baseColorContrast[0]}</span>
              </div>
              <Slider
                value={baseColorContrast}
                onValueChange={setBaseColorContrast}
                max={2}
                min={0}
                step={0.1}
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Roughness */}
        <div className="mb-4">
          <Label className="text-xs text-muted-foreground">Roughness</Label>
          <div className="flex items-center space-x-2 mt-2">
            <Checkbox 
              checked={generateRoughness}
              onCheckedChange={setGenerateRoughness}
            />
            <span className="text-sm">Generate</span>
          </div>
          {generateRoughness && (
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Intensity</span>
                <span className="text-xs text-foreground">{roughnessIntensity[0]}</span>
              </div>
              <Slider
                value={roughnessIntensity}
                onValueChange={setRoughnessIntensity}
                max={1}
                min={0}
                step={0.1}
                className="w-full"
              />
              <div className="flex items-center space-x-2">
                <Checkbox 
                  checked={roughnessInvert}
                  onCheckedChange={setRoughnessInvert}
                />
                <span className="text-xs text-muted-foreground">Invert</span>
              </div>
            </div>
          )}
        </div>

        {/* Normal Map */}
        <div className="mb-4">
          <Label className="text-xs text-muted-foreground">Normal Map (DirectX)</Label>
          <div className="flex items-center space-x-2 mt-2">
            <Checkbox 
              checked={generateNormal}
              onCheckedChange={setGenerateNormal}
            />
            <span className="text-sm">Generate</span>
          </div>
          {generateNormal && (
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Strength</span>
                <span className="text-xs text-foreground">{normalStrength[0]}</span>
              </div>
              <Slider
                value={normalStrength}
                onValueChange={setNormalStrength}
                max={3}
                min={0}
                step={0.1}
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Height/Displacement */}
        <div className="mb-4">
          <Label className="text-xs text-muted-foreground">Height/Displacement</Label>
          <div className="flex items-center space-x-2 mt-2">
            <Checkbox 
              checked={generateHeight}
              onCheckedChange={setGenerateHeight}
            />
            <span className="text-sm">Generate</span>
          </div>
          {generateHeight && (
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Depth</span>
                <span className="text-xs text-foreground">{heightDepth[0]}</span>
              </div>
              <Slider
                value={heightDepth}
                onValueChange={setHeightDepth}
                max={1}
                min={0}
                step={0.01}
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* AO */}
        <div className="mb-4">
          <Label className="text-xs text-muted-foreground">Ambient Occlusion</Label>
          <div className="flex items-center space-x-2 mt-2">
            <Checkbox 
              checked={generateAO}
              onCheckedChange={setGenerateAO}
            />
            <span className="text-sm">Generate</span>
          </div>
          {generateAO && (
            <div className="mt-2 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Radius</span>
                <span className="text-xs text-foreground">{aoRadius[0]}</span>
              </div>
              <Slider
                value={aoRadius}
                onValueChange={setAoRadius}
                max={1}
                min={0}
                step={0.1}
                className="w-full"
              />
            </div>
          )}
        </div>

        {/* Advanced Settings */}
        <div className="mb-4">
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger className="w-full text-left text-xs text-muted-foreground hover:text-foreground transition-colors">
              <ChevronRight className={`inline h-3 w-3 mr-1 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} />
              Advanced Settings
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-2">
              <div className="text-xs text-muted-foreground">
                Advanced texture generation options will be available here.
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      </div>

      {/* Process Button */}
      <div className="p-4 border-t border-border">
        <Button className="w-full bg-success hover:bg-success/90 text-white">
          <Play className="h-4 w-4 mr-2" />
          Generate Textures
        </Button>
      </div>
    </div>
  );
}
