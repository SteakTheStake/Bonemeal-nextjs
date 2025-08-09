import { useState, useEffect } from "react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { ChevronRight, Play } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { useSettings } from "@/contexts/settings-context";
import { useToast } from "@/hooks/use-toast";

interface ConversionSettingsProps {
  onJobCreated: (jobId: number) => void;
}

export function ConversionSettings({ onJobCreated }: ConversionSettingsProps) {
  const { settings, updateSettings, triggerUpload, currentFile } = useSettings();
  const { toast } = useToast();
  
  const [inputType, setInputType] = useState(settings.inputType);
  const [generateBaseColor, setGenerateBaseColor] = useState(settings.generateBaseColor);
  const [generateRoughness, setGenerateRoughness] = useState(settings.generateRoughness);
  const [generateNormal, setGenerateNormal] = useState(settings.generateNormal);
  const [generateHeight, setGenerateHeight] = useState(settings.generateHeight);
  const [generateAO, setGenerateAO] = useState(settings.generateAO);
  
  const [baseColorContrast, setBaseColorContrast] = useState([settings.baseColorContrast]);
  const [roughnessIntensity, setRoughnessIntensity] = useState([settings.roughnessIntensity]);
  const [roughnessInvert, setRoughnessInvert] = useState(settings.roughnessInvert);
  const [normalStrength, setNormalStrength] = useState([settings.normalStrength]);
  const [heightDepth, setHeightDepth] = useState([settings.heightDepth]);
  const [aoRadius, setAoRadius] = useState([settings.aoRadius]);
  
  const [showAdvanced, setShowAdvanced] = useState(false);
  
  // Update global settings when local values change
  useEffect(() => {
    updateSettings({
      inputType: inputType as any,
      generateBaseColor,
      generateRoughness,
      generateNormal,
      generateHeight,
      generateAO,
      baseColorContrast: baseColorContrast[0],
      roughnessIntensity: roughnessIntensity[0],
      roughnessInvert,
      normalStrength: normalStrength[0],
      heightDepth: heightDepth[0],
      aoRadius: aoRadius[0],
    });
  }, [inputType, generateBaseColor, generateRoughness, generateNormal, generateHeight, generateAO,
      baseColorContrast, roughnessIntensity, roughnessInvert, normalStrength, heightDepth, aoRadius, updateSettings]);

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
              onCheckedChange={(checked) => setGenerateBaseColor(checked === true)}
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
              onCheckedChange={(checked) => setGenerateRoughness(checked === true)}
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
                  onCheckedChange={(checked) => setRoughnessInvert(checked === true)}
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
              onCheckedChange={(checked) => setGenerateNormal(checked === true)}
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
              onCheckedChange={(checked) => setGenerateHeight(checked === true)}
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
              onCheckedChange={(checked) => setGenerateAO(checked === true)}
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
        <Button 
          className="w-full bg-success hover:bg-success/90 text-white"
          onClick={() => {
            if (!currentFile) {
              toast({
                title: "No file selected",
                description: "Please upload a texture file or resource pack first.",
                variant: "destructive",
              });
              return;
            }
            triggerUpload();
          }}
        >
          <Play className="h-4 w-4 mr-2" />
          Generate Textures
        </Button>
      </div>
    </div>
  );
}
