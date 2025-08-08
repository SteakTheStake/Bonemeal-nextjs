import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { 
  Package, 
  Download, 
  Star, 
  Clock, 
  Search,
  Filter,
  Sparkles,
  Flame,
  Snowflake,
  Leaf,
  Sun,
  Moon,
  Cloud,
  Mountain,
  Trees
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Template {
  id: string;
  name: string;
  category: string;
  description: string;
  downloads: number;
  rating: number;
  icon: React.ReactNode;
  presets: {
    roughness: number;
    metallic: number;
    normalStrength: number;
    aoRadius: number;
  };
  tags: string[];
}

export default function TemplateLibrary() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();

  const templates: Template[] = [
    {
      id: "stone-realistic",
      name: "Realistic Stone",
      category: "materials",
      description: "High-quality stone textures with realistic PBR values",
      downloads: 1234,
      rating: 4.8,
      icon: <Mountain className="h-8 w-8" />,
      presets: { roughness: 0.9, metallic: 0, normalStrength: 1.2, aoRadius: 0.6 },
      tags: ["stone", "realistic", "building"]
    },
    {
      id: "wood-oak",
      name: "Oak Wood Pack",
      category: "materials",
      description: "Complete oak wood texture set with planks and logs",
      downloads: 2341,
      rating: 4.9,
      icon: <Trees className="h-8 w-8" />,
      presets: { roughness: 0.7, metallic: 0, normalStrength: 0.8, aoRadius: 0.4 },
      tags: ["wood", "oak", "natural"]
    },
    {
      id: "nether-pack",
      name: "Nether Dimension",
      category: "themed",
      description: "Hellish textures for nether blocks and materials",
      downloads: 892,
      rating: 4.6,
      icon: <Flame className="h-8 w-8 text-red-500" />,
      presets: { roughness: 0.6, metallic: 0.1, normalStrength: 1.5, aoRadius: 0.8 },
      tags: ["nether", "hell", "lava"]
    },
    {
      id: "winter-theme",
      name: "Winter Wonderland",
      category: "seasonal",
      description: "Snowy and icy textures for winter builds",
      downloads: 567,
      rating: 4.7,
      icon: <Snowflake className="h-8 w-8 text-blue-400" />,
      presets: { roughness: 0.3, metallic: 0.2, normalStrength: 0.5, aoRadius: 0.3 },
      tags: ["winter", "snow", "ice"]
    },
    {
      id: "autumn-leaves",
      name: "Autumn Foliage",
      category: "seasonal",
      description: "Warm autumn colors for leaves and vegetation",
      downloads: 445,
      rating: 4.5,
      icon: <Leaf className="h-8 w-8 text-orange-500" />,
      presets: { roughness: 0.5, metallic: 0, normalStrength: 0.6, aoRadius: 0.4 },
      tags: ["autumn", "leaves", "seasonal"]
    },
    {
      id: "ctm-glass",
      name: "Connected Glass",
      category: "ctm",
      description: "Seamless connected textures for glass blocks",
      downloads: 1567,
      rating: 4.9,
      icon: <Sparkles className="h-8 w-8 text-cyan-400" />,
      presets: { roughness: 0.1, metallic: 0, normalStrength: 0.2, aoRadius: 0.1 },
      tags: ["glass", "ctm", "connected"]
    },
    {
      id: "emissive-ores",
      name: "Glowing Ores",
      category: "emissive",
      description: "Ores with emissive properties for shader packs",
      downloads: 2100,
      rating: 4.8,
      icon: <Star className="h-8 w-8 text-yellow-400" />,
      presets: { roughness: 0.4, metallic: 0.8, normalStrength: 1.0, aoRadius: 0.5 },
      tags: ["ores", "emissive", "glowing"]
    },
    {
      id: "sky-pack",
      name: "Sky & Clouds",
      category: "environment",
      description: "Custom sky textures and cloud patterns",
      downloads: 890,
      rating: 4.6,
      icon: <Cloud className="h-8 w-8 text-blue-300" />,
      presets: { roughness: 0.2, metallic: 0, normalStrength: 0.3, aoRadius: 0.2 },
      tags: ["sky", "clouds", "environment"]
    }
  ];

  const categories = [
    { id: "all", name: "All Templates", count: templates.length },
    { id: "materials", name: "Materials", count: 2 },
    { id: "seasonal", name: "Seasonal", count: 2 },
    { id: "themed", name: "Themed Packs", count: 1 },
    { id: "ctm", name: "CTM Patterns", count: 1 },
    { id: "emissive", name: "Emissive", count: 1 },
    { id: "environment", name: "Environment", count: 1 }
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesCategory = selectedCategory === "all" || template.category === selectedCategory;
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          template.tags.some(tag => tag.includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const applyTemplate = (template: Template) => {
    toast({
      title: `Applied "${template.name}" template`,
      description: "PBR settings have been updated"
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="moss-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            Template Library
          </CardTitle>
          <CardDescription>
            Pre-configured texture templates and material presets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Categories */}
      <div className="flex gap-2 flex-wrap">
        {categories.map(category => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? "default" : "outline"}
            size="sm"
            onClick={() => setSelectedCategory(category.id)}
            className="grow-button"
          >
            {category.name}
            <Badge variant="secondary" className="ml-2">
              {category.count}
            </Badge>
          </Button>
        ))}
      </div>

      {/* Templates Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTemplates.map(template => (
          <Card key={template.id} className="moss-card hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  {template.icon}
                  <div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex items-center">
                        <Star className="h-3 w-3 text-yellow-500 mr-1" />
                        <span className="text-xs">{template.rating}</span>
                      </div>
                      <div className="flex items-center">
                        <Download className="h-3 w-3 text-muted-foreground mr-1" />
                        <span className="text-xs">{template.downloads}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-3">
                {template.description}
              </p>
              
              {/* PBR Presets Preview */}
              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Roughness:</span>
                  <span className="font-mono">{template.presets.roughness}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Metallic:</span>
                  <span className="font-mono">{template.presets.metallic}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Normal:</span>
                  <span className="font-mono">{template.presets.normalStrength}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">AO:</span>
                  <span className="font-mono">{template.presets.aoRadius}</span>
                </div>
              </div>

              {/* Tags */}
              <div className="flex flex-wrap gap-1 mb-3">
                {template.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              {/* Action Button */}
              <Button 
                onClick={() => applyTemplate(template)}
                className="w-full grow-button moss-texture"
              >
                Apply Template
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Animation Templates Section */}
      <Card className="moss-card">
        <CardHeader>
          <CardTitle>Animation Templates</CardTitle>
          <CardDescription>
            Pre-configured animated texture settings
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="h-5 w-5 text-orange-500" />
                <span className="font-medium">Fire Animation</span>
              </div>
              <p className="text-xs text-muted-foreground">
                8 frames, 100ms delay, loop
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-5 w-5 text-blue-500" />
                <span className="font-medium">Water Flow</span>
              </div>
              <p className="text-xs text-muted-foreground">
                32 frames, 50ms delay, seamless
              </p>
            </div>
            <div className="p-4 border rounded-lg hover:bg-accent/50 transition-colors cursor-pointer">
              <div className="flex items-center gap-2 mb-2">
                <Sun className="h-5 w-5 text-yellow-500" />
                <span className="font-medium">Portal Effect</span>
              </div>
              <p className="text-xs text-muted-foreground">
                16 frames, 75ms delay, reverse
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}