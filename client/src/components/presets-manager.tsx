import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { 
  Save, 
  Star, 
  Trash2, 
  Settings, 
  Download, 
  Upload, 
  MoreVertical,
  Plus,
  Check,
  X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { type UserPreset } from "@shared/schema";

interface PresetsManagerProps {
  category: string;
  currentSettings: any;
  onLoadPreset: (settings: any) => void;
  presetCategories?: string[];
}

export default function PresetsManager({ 
  category, 
  currentSettings, 
  onLoadPreset,
  presetCategories = ['conversion', 'processing', 'ai', 'editor', 'batch']
}: PresetsManagerProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [presetName, setPresetName] = useState("");
  const [presetDescription, setPresetDescription] = useState("");
  const [selectedCategory, setSelectedCategory] = useState(category);
  const [isDefault, setIsDefault] = useState(false);

  // Fetch user presets
  const { data: presets = [] } = useQuery<UserPreset[]>({
    queryKey: ["/api/presets"],
    enabled: !!user,
  });

  // Save preset mutation
  const savePresetMutation = useMutation({
    mutationFn: async (data: {
      name: string;
      description?: string;
      category: string;
      settings: any;
      isDefault: boolean;
    }) => {
      await apiRequest("POST", "/api/presets", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/presets"] });
      setShowSaveDialog(false);
      setPresetName("");
      setPresetDescription("");
      setIsDefault(false);
      toast({
        title: "Preset saved",
        description: "Your settings have been saved as a preset",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to save preset",
        variant: "destructive",
      });
    },
  });

  // Delete preset mutation
  const deletePresetMutation = useMutation({
    mutationFn: async (presetId: number) => {
      await apiRequest("DELETE", `/api/presets/${presetId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/presets"] });
      toast({
        title: "Preset deleted",
        description: "The preset has been removed",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete preset",
        variant: "destructive",
      });
    },
  });

  // Set default preset mutation
  const setDefaultMutation = useMutation({
    mutationFn: async (presetId: number) => {
      await apiRequest("POST", `/api/presets/${presetId}/default`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/presets"] });
      toast({
        title: "Default preset set",
        description: "This preset will be loaded automatically",
      });
    },
  });

  const handleSavePreset = () => {
    if (!presetName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a preset name",
        variant: "destructive",
      });
      return;
    }

    savePresetMutation.mutate({
      name: presetName.trim(),
      description: presetDescription.trim() || undefined,
      category: selectedCategory,
      settings: currentSettings,
      isDefault,
    });
  };

  const handleLoadPreset = (preset: UserPreset) => {
    onLoadPreset(preset.settings);
    toast({
      title: "Preset loaded",
      description: `Loaded settings from "${preset.name}"`,
    });
  };

  const handleExportPreset = (preset: UserPreset) => {
    const exportData = {
      name: preset.name,
      description: preset.description,
      category: preset.category,
      settings: preset.settings,
      version: "1.0",
      exportedAt: new Date().toISOString(),
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${preset.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_preset.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImportPreset = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target?.result as string);
        if (importData.settings) {
          onLoadPreset(importData.settings);
          toast({
            title: "Preset imported",
            description: `Loaded settings from "${importData.name || 'imported preset'}"`,
          });
        }
      } catch (error) {
        toast({
          title: "Import failed",
          description: "Invalid preset file format",
          variant: "destructive",
        });
      }
    };
    reader.readAsText(file);
    event.target.value = "";
  };

  const filteredPresets = presets.filter(preset => preset.category === selectedCategory);
  const defaultPreset = filteredPresets.find(preset => preset.isDefault);

  if (!user) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p>Sign in to save and manage presets</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with actions */}
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Presets</h3>
        <div className="flex items-center gap-2">
          <Dialog open={showSaveDialog} onOpenChange={setShowSaveDialog}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="glass-card">
                <Save className="h-3 w-3 mr-1" />
                Save
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card">
              <DialogHeader>
                <DialogTitle>Save Preset</DialogTitle>
                <DialogDescription>
                  Save your current settings as a reusable preset
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="preset-name">Name</Label>
                  <Input
                    id="preset-name"
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    placeholder="My custom settings"
                  />
                </div>
                <div>
                  <Label htmlFor="preset-description">Description (optional)</Label>
                  <Textarea
                    id="preset-description"
                    value={presetDescription}
                    onChange={(e) => setPresetDescription(e.target.value)}
                    placeholder="Describe what makes this preset special..."
                    rows={2}
                  />
                </div>
                <div>
                  <Label htmlFor="preset-category">Category</Label>
                  <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {presetCategories.map(cat => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="is-default"
                    checked={isDefault}
                    onChange={(e) => setIsDefault(e.target.checked)}
                    className="rounded"
                  />
                  <Label htmlFor="is-default" className="text-sm">
                    Set as default for this category
                  </Label>
                </div>
                <div className="flex gap-2">
                  <Button onClick={handleSavePreset} disabled={savePresetMutation.isPending}>
                    {savePresetMutation.isPending ? "Saving..." : "Save Preset"}
                  </Button>
                  <Button variant="outline" onClick={() => setShowSaveDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>

          <input
            type="file"
            accept=".json"
            onChange={handleImportPreset}
            className="hidden"
            id="import-preset"
          />
          <Button size="sm" variant="outline" className="glass-card" asChild>
            <label htmlFor="import-preset" className="cursor-pointer">
              <Upload className="h-3 w-3 mr-1" />
              Import
            </label>
          </Button>
        </div>
      </div>

      {/* Category tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="conversion">Convert</TabsTrigger>
          <TabsTrigger value="processing">Process</TabsTrigger>
          <TabsTrigger value="ai">AI</TabsTrigger>
        </TabsList>
        
        {presetCategories.map(cat => (
          <TabsContent key={cat} value={cat} className="mt-4">
            <ScrollArea className="h-48">
              <div className="space-y-2">
                {presets.filter(preset => preset.category === cat).map(preset => (
                  <Card key={preset.id} className="glass-card">
                    <CardContent className="p-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-medium">{preset.name}</h4>
                            {preset.isDefault && (
                              <Badge variant="outline" className="text-xs">
                                <Star className="h-2 w-2 mr-1" />
                                Default
                              </Badge>
                            )}
                          </div>
                          {preset.description && (
                            <p className="text-xs text-muted-foreground mb-2">
                              {preset.description}
                            </p>
                          )}
                          <div className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleLoadPreset(preset)}
                            >
                              <Download className="h-3 w-3 mr-1" />
                              Load
                            </Button>
                            {!preset.isDefault && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setDefaultMutation.mutate(preset.id)}
                              >
                                <Star className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                        
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleExportPreset(preset)}>
                              <Download className="h-3 w-3 mr-2" />
                              Export
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => deletePresetMutation.mutate(preset.id)}
                              className="text-destructive"
                            >
                              <Trash2 className="h-3 w-3 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                
                {presets.filter(preset => preset.category === cat).length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No presets in this category</p>
                    <p className="text-xs">Save your current settings to create one</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        ))}
      </Tabs>

      {/* Default preset indicator */}
      {defaultPreset && (
        <div className="text-xs text-muted-foreground text-center">
          Default: <span className="text-primary">{defaultPreset.name}</span>
        </div>
      )}
    </div>
  );
}