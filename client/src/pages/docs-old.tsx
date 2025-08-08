import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
// Removed tabs import as we're using anchor navigation
import { 
  BookOpen, 
  Download, 
  ExternalLink, 
  FileImage, 
  Palette, 
  Layers,
  Eye,
  Zap,
  Target,
  CheckCircle,
  AlertTriangle,
  Info,
  Code,
  Lightbulb,
  GitBranch,
  Database,
  Brush,
  Box,
  Sparkles,
  FolderOpen
} from "lucide-react";

export default function DocsPage() {
  const labpbrFeatures = [
    {
      title: "Physically Based Rendering",
      description: "Accurate material representation with realistic lighting and reflections",
      icon: Eye,
      color: "bg-blue-500"
    },
    {
      title: "Advanced Material Maps",
      description: "Specular, roughness, metallic, emission, normal, and height maps",
      icon: Layers,
      color: "bg-green-500"
    },
    {
      title: "Optimized Performance",
      description: "Efficient texture packing and GPU-friendly formats",
      icon: Zap,
      color: "bg-yellow-500"
    },
    {
      title: "Wide Compatibility",
      description: "Works with OptiFine, Iris, and major shader packs",
      icon: Target,
      color: "bg-purple-500"
    }
  ];

  const textureTypes = [
    {
      name: "Albedo (Base Color)",
      suffix: "_n",
      description: "The base color texture without lighting information",
      channels: "RGB",
      format: "Standard color texture"
    },
    {
      name: "Normal Map",
      suffix: "_n",
      description: "Surface detail information for bump mapping",
      channels: "RGB (X, Y, Z vectors)",
      format: "DirectX format (red=X, green=Y)"
    },
    {
      name: "Specular Map",
      suffix: "_s",
      description: "Combined material properties in a single texture",
      channels: "R=Smoothness, G=Metallic, B=Porosity, A=Subsurface Scattering",
      format: "RGBA packed format"
    },
    {
      name: "Emission Map",
      suffix: "_e",
      description: "Self-illuminating parts of the texture",
      channels: "RGB (emission color)",
      format: "Standard color texture"
    },
    {
      name: "Height Map",
      suffix: "_h",
      description: "Displacement information for parallax mapping",
      channels: "Grayscale (height values)",
      format: "Single channel heightmap"
    }
  ];

  const validationRules = [
    {
      rule: "Texture Resolution",
      requirement: "Must be power of 2 (16x16, 32x32, 64x64, etc.)",
      severity: "error",
      icon: AlertTriangle
    },
    {
      rule: "File Format",
      requirement: "PNG format recommended for quality and compatibility",
      severity: "warning",
      icon: Info
    },
    {
      rule: "Naming Convention",
      requirement: "Follow LabPBR suffix conventions (_n, _s, _e, _h)",
      severity: "error",
      icon: AlertTriangle
    },
    {
      rule: "Channel Usage",
      requirement: "Correct channel assignments for specular maps",
      severity: "error",
      icon: AlertTriangle
    },
    {
      rule: "Alpha Channel",
      requirement: "Remove unnecessary alpha channels to reduce file size",
      severity: "info",
      icon: Lightbulb
    }
  ];

  const workflowSteps = [
    {
      step: 1,
      title: "Prepare Source Textures",
      description: "Gather your base color textures and reference materials",
      icon: FileImage
    },
    {
      step: 2,
      title: "Generate Material Maps",
      description: "Create or convert normal, specular, and height maps",
      icon: Palette
    },
    {
      step: 3,
      title: "Validate & Convert",
      description: "Use Bonemeal to validate and convert to LabPBR format",
      icon: CheckCircle
    },
    {
      step: 4,
      title: "Test in Game",
      description: "Load your resource pack and test with compatible shaders",
      icon: Eye
    }
  ];

  return (
    <div className="container mx-auto px-6 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-12">
        <div className="flex items-center justify-center gap-3 mb-4">
          <BookOpen className="h-12 w-12 text-green-400" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-green-400 to-emerald-600 bg-clip-text text-transparent">
            LabPBR 1.3 Documentation
          </h1>
        </div>
        <p className="text-xl text-foreground/90 dark:text-muted-foreground max-w-3xl mx-auto">
          Complete guide to the LabPBR material format for Minecraft resource packs. 
          Learn how to create physically accurate materials for enhanced visual quality.
        </p>
        <div className="flex items-center justify-center gap-4 mt-6">
          <Badge variant="secondary" className="bg-green-500/10 text-green-400 border-green-500/20">
            LabPBR 1.3 Specification
          </Badge>
          <Badge variant="secondary" className="bg-blue-500/10 text-blue-400 border-blue-500/20">
            Resource Pack Format
          </Badge>
        </div>
      </div>

      {/* Anchor Navigation */}
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur-sm border-b border-border/40 mb-8">
        <div className="flex justify-center gap-4 py-4">
          <button
            onClick={() => document.getElementById('overview')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors"
          >
            Overview
          </button>
          <button
            onClick={() => document.getElementById('textures')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors"
          >
            Texture Types
          </button>
          <button
            onClick={() => document.getElementById('workflow')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors"
          >
            Workflow
          </button>
          <button
            onClick={() => document.getElementById('validation')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors"
          >
            Validation
          </button>
          <button
            onClick={() => document.getElementById('reference')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors"
          >
            Reference
          </button>
        </div>
      </div>

      <div className="space-y-16">

        {/* Overview Section */}
        <section id="overview" className="space-y-8 scroll-mt-20">
          <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-3 text-[#60a5fa]">
                <Info className="h-6 w-6 text-blue-400" />
                What is LabPBR?
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                LabPBR (Physically Based Rendering for Labs) is a material format specification designed for Minecraft resource packs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground/95 dark:text-muted-foreground">
                LabPBR 1.3 defines how to create realistic materials using multiple texture maps that describe surface properties 
                like roughness, metallic response, normal details, and emission. This enables shaders to render materials with 
                physically accurate lighting, reflections, and surface interactions.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {labpbrFeatures.map((feature, index) => (
                  <Card key={index} className="bg-zinc-800/30 border-zinc-700/30">
                    <CardContent className="pt-6">
                      <div className={`w-12 h-12 rounded-lg ${feature.color}/20 flex items-center justify-center mb-4`}>
                        <feature.icon className={`h-6 w-6 ${feature.color.replace('bg-', 'text-')}`} />
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.description}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-2xl font-semibold leading-none tracking-tight flex items-center gap-3 text-[#b17ce5]">
                <Database className="h-6 w-6 text-purple-400" />
                Key Benefits for Resource Pack Creators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-green-400">Enhanced Visual Quality</h4>
                  <ul className="space-y-2 text-zinc-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                      Realistic material responses to lighting
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                      Accurate reflections and refractions
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400 mt-0.5 flex-shrink-0" />
                      Enhanced surface detail and depth
                    </li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-blue-400">Technical Advantages</h4>
                  <ul className="space-y-2 text-zinc-300">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      Optimized texture packing for performance
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      Wide compatibility with popular shaders
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-400 mt-0.5 flex-shrink-0" />
                      Standardized format for consistent results
                    </li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Texture Types Section */}
        <section id="textures" className="space-y-8 scroll-mt-20">
          <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Layers className="h-6 w-6 text-green-400" />
                LabPBR Texture Types
              </CardTitle>
              <CardDescription>
                Understanding the different texture maps and their roles in LabPBR materials
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {textureTypes.map((texture, index) => (
                  <div key={index} className="border border-zinc-700/30 rounded-lg p-6 bg-zinc-800/20">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-foreground">{texture.name}</h3>
                        <code className="text-sm text-green-400 bg-green-500/10 px-2 py-1 rounded mt-2 inline-block">
                          texture{texture.suffix}.png
                        </code>
                      </div>
                      <Badge variant="outline" className="border-border text-foreground">
                        {texture.format}
                      </Badge>
                    </div>
                    <p className="text-foreground/90 mb-4">{texture.description}</p>
                    <div className="bg-zinc-900/50 rounded p-4">
                      <h4 className="text-sm font-semibold text-muted-foreground mb-2">Channel Information:</h4>
                      <p className="text-sm text-foreground font-mono">{texture.channels}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Code className="h-6 w-6 text-blue-400" />
                Specular Map Channel Guide
              </CardTitle>
              <CardDescription>
                Detailed breakdown of the RGBA channels in LabPBR specular maps
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
                    <h4 className="font-semibold text-red-400 mb-2">Red Channel - Smoothness</h4>
                    <p className="text-sm text-foreground/90">
                      Controls surface roughness. White = smooth/glossy, Black = rough/matte
                    </p>
                  </div>
                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
                    <h4 className="font-semibold text-green-400 mb-2">Green Channel - Metallic</h4>
                    <p className="text-sm text-foreground/90">
                      Defines metallic properties. White = metal, Black = non-metal (dielectric)
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-400 mb-2">Blue Channel - Porosity</h4>
                    <p className="text-sm text-foreground/90">
                      Controls subsurface scattering. White = porous, Black = solid
                    </p>
                  </div>
                  <div className="bg-purple-500/10 border border-purple-500/20 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-400 mb-2">Alpha Channel - SSS Amount</h4>
                    <p className="text-sm text-foreground/90">
                      Subsurface scattering intensity. Controls light penetration depth
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Workflow Section */}
        <section id="workflow" className="space-y-8 scroll-mt-20">
          <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <GitBranch className="h-6 w-6 text-green-400" />
                LabPBR Creation Workflow
              </CardTitle>
              <CardDescription>
                Step-by-step process for creating LabPBR materials from scratch
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-8">
                {workflowSteps.map((step, index) => (
                  <div key={index} className="flex gap-6">
                    <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold">
                      {step.step}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <step.icon className="h-5 w-5 text-green-400" />
                        <h3 className="text-lg font-semibold text-foreground">{step.title}</h3>
                      </div>
                      <p className="text-foreground/90">{step.description}</p>
                      {index < workflowSteps.length - 1 && (
                        <div className="w-px h-8 bg-gradient-to-b from-green-500 to-transparent ml-6 mt-4"></div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Lightbulb className="h-6 w-6 text-yellow-400" />
                Best Practices & Tips
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-yellow-400">Texture Creation</h4>
                  <ul className="space-y-2 text-foreground/90 text-sm">
                    <li>• Start with high-quality base textures (1024x1024 or higher)</li>
                    <li>• Use consistent lighting in your source materials</li>
                    <li>• Remove baked-in lighting and shadows from albedo maps</li>
                    <li>• Ensure normal maps use the correct coordinate system</li>
                    <li>• Pack specular channels efficiently to reduce file size</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-blue-400">Performance Tips</h4>
                  <ul className="space-y-2 text-foreground/90 text-sm">
                    <li>• Use appropriate texture resolutions for the surface scale</li>
                    <li>• Optimize PNG compression without quality loss</li>
                    <li>• Remove unnecessary alpha channels where possible</li>
                    <li>• Test performance impact in-game with target hardware</li>
                    <li>• Consider using texture atlases for small elements</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Validation Section */}
        <section id="validation" className="space-y-8 scroll-mt-20">
          <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <CheckCircle className="h-6 w-6 text-green-400" />
                Validation Rules & Requirements
              </CardTitle>
              <CardDescription>
                Ensure your LabPBR textures meet quality and compatibility standards
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {validationRules.map((rule, index) => (
                  <div key={index} className={`border rounded-lg p-4 ${
                    rule.severity === 'error' ? 'border-red-500/30 bg-red-500/5' :
                    rule.severity === 'warning' ? 'border-yellow-500/30 bg-yellow-500/5' :
                    'border-blue-500/30 bg-blue-500/5'
                  }`}>
                    <div className="flex items-start gap-3">
                      <rule.icon className={`h-5 w-5 mt-0.5 ${
                        rule.severity === 'error' ? 'text-red-400' :
                        rule.severity === 'warning' ? 'text-yellow-400' :
                        'text-blue-400'
                      }`} />
                      <div className="flex-1">
                        <h4 className="font-semibold text-white mb-1">{rule.rule}</h4>
                        <p className="text-sm text-zinc-300">{rule.requirement}</p>
                        <Badge 
                          variant="outline" 
                          className={`mt-2 text-xs ${
                            rule.severity === 'error' ? 'border-red-500/50 text-red-400' :
                            rule.severity === 'warning' ? 'border-yellow-500/50 text-yellow-400' :
                            'border-blue-500/50 text-blue-400'
                          }`}
                        >
                          {rule.severity.toUpperCase()}
                        </Badge>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Target className="h-6 w-6 text-purple-400" />
                Automated Validation with Bonemeal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-zinc-300">
                Bonemeal automatically validates your textures against LabPBR 1.3 specifications, checking for:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-zinc-800/30 rounded-lg p-4">
                  <h4 className="font-semibold text-green-400 mb-2">Format Compliance</h4>
                  <p className="text-sm text-zinc-400">Resolution, naming conventions, and file formats</p>
                </div>
                <div className="bg-zinc-800/30 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-400 mb-2">Channel Validation</h4>
                  <p className="text-sm text-zinc-400">Correct channel usage and data ranges</p>
                </div>
                <div className="bg-zinc-800/30 rounded-lg p-4">
                  <h4 className="font-semibold text-purple-400 mb-2">Performance Analysis</h4>
                  <p className="text-sm text-zinc-400">File size optimization and compression quality</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reference Tab */}
        <TabsContent value="reference" className="space-y-8">
          <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <ExternalLink className="h-6 w-6 text-blue-400" />
                External Resources & Tools
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-blue-400">Official Resources</h4>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start gap-3 border-zinc-700 hover:bg-zinc-800" asChild>
                      <a href="https://shaderlabs.org/wiki/LabPBR_Material_Standard" target="_blank" rel="noopener noreferrer">
                        <BookOpen className="h-4 w-4" />
                        LabPBR 1.3 Specification
                      </a>
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-3 border-zinc-700 hover:bg-zinc-800" asChild>
                      <a href="https://github.com/rre36/lab-pbr" target="_blank" rel="noopener noreferrer">
                        <GitBranch className="h-4 w-4" />
                        LabPBR GitHub Repository
                      </a>
                    </Button>
                  </div>
                </div>
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-green-400">Creation Tools</h4>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start gap-3 border-zinc-700 hover:bg-zinc-800">
                      <Palette className="h-4 w-4" />
                      Adobe Photoshop + Plugins
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-3 border-zinc-700 hover:bg-zinc-800">
                      <FileImage className="h-4 w-4" />
                      GIMP (Free Alternative)
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-3 border-zinc-700 hover:bg-zinc-800">
                      <Code className="h-4 w-4" />
                      Substance Painter/Designer
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Download className="h-6 w-6 text-green-400" />
                Quick Reference Downloads
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Button className="bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 text-green-400">
                  <Download className="h-4 w-4 mr-2" />
                  Naming Convention Guide
                </Button>
                <Button className="bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400">
                  <Download className="h-4 w-4 mr-2" />
                  Channel Packing Templates
                </Button>
                <Button className="bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-400">
                  <Download className="h-4 w-4 mr-2" />
                  Example Resource Pack
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Reference Tab */}
        <TabsContent value="reference" className="space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-600 bg-clip-text text-transparent">
              Essential Tools & Resources
            </h2>
            <p className="text-xl text-foreground/90 dark:text-muted-foreground max-w-3xl mx-auto">
              Professional software and automation tools for creating high-quality LabPBR textures and streamlining your workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* GIMP */}
            <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 border-zinc-700/50 backdrop-blur-sm hover:scale-105 transition-transform">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mb-4">
                  <Brush className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-foreground">GIMP</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Free, open-source image editor with advanced texture editing capabilities and plugin support.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80 text-sm mb-4">
                  Professional-grade image editing with layer support, custom brushes, and extensive filter options perfect for texture creation and modification.
                </p>
                <Button asChild className="w-full">
                  <a href="https://www.gimp.org/downloads/" target="_blank" rel="noopener noreferrer">
                    Download GIMP
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Substance Designer */}
            <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 border-zinc-700/50 backdrop-blur-sm hover:scale-105 transition-transform">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center mb-4">
                  <Box className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-foreground">Substance Designer</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Node-based texture authoring tool for creating seamless, procedural materials.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80 text-sm mb-4">
                  Industry-standard tool for creating tileable textures with automatic PBR map generation and parametric controls.
                </p>
                <Button asChild className="w-full">
                  <a href="https://www.adobe.com/products/substance3d/apps/designer.html" target="_blank" rel="noopener noreferrer">
                    View Designer
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Substance Painter */}
            <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 border-zinc-700/50 backdrop-blur-sm hover:scale-105 transition-transform">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mb-4">
                  <Brush className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-foreground">Substance Painter</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  3D painting software for texturing models with real-time PBR preview.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80 text-sm mb-4">
                  Paint directly on 3D models with smart materials, procedural effects, and automatic PBR channel generation.
                </p>
                <Button asChild className="w-full">
                  <a href="https://www.adobe.com/products/substance3d/apps/painter.html" target="_blank" rel="noopener noreferrer">
                    View Painter
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* PhotoGIMP */}
            <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 border-zinc-700/50 backdrop-blur-sm hover:scale-105 transition-transform">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-500 rounded-lg flex items-center justify-center mb-4">
                  <Sparkles className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-foreground">PhotoGIMP</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Photoshop-style interface mod for GIMP with familiar tools and workflows.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80 text-sm mb-4">
                  Transform GIMP into a Photoshop-like experience with familiar UI, shortcuts, and tool arrangements for easier transition.
                </p>
                <Button asChild className="w-full">
                  <a href="https://github.com/Diolinux/PhotoGIMP" target="_blank" rel="noopener noreferrer">
                    Get PhotoGIMP
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Bulk Rename Utility */}
            <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 border-zinc-700/50 backdrop-blur-sm hover:scale-105 transition-transform">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-lg flex items-center justify-center mb-4">
                  <FolderOpen className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-foreground">Bulk Rename Utility</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Powerful file renaming tool for organizing texture files with pattern matching.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80 text-sm mb-4">
                  Rename hundreds of texture files at once using regex patterns, perfect for organizing LabPBR texture sets.
                </p>
                <Button asChild className="w-full">
                  <a href="https://www.bulkrenameutility.co.uk/" target="_blank" rel="noopener noreferrer">
                    Download Tool
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Substance Sampler */}
            <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 border-zinc-700/50 backdrop-blur-sm hover:scale-105 transition-transform">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-500 rounded-lg flex items-center justify-center mb-4">
                  <Target className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-foreground">Substance Sampler</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Convert photos into seamless, tileable PBR materials using AI-powered analysis.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80 text-sm mb-4">
                  Turn real-world photos into high-quality PBR materials with automatic tiling and material extraction.
                </p>
                <Button asChild className="w-full">
                  <a href="https://www.adobe.com/products/substance3d/apps/sampler.html" target="_blank" rel="noopener noreferrer">
                    View Sampler
                  </a>
                </Button>
              </CardContent>
            </Card>

            {/* Python Automation */}
            <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 border-zinc-700/50 backdrop-blur-sm hover:scale-105 transition-transform">
              <CardHeader>
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-blue-600 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-foreground">Python Automation</CardTitle>
                <CardDescription className="text-sm text-muted-foreground">
                  Automate texture processing with custom interpolation methods and batch operations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-foreground/80 text-sm mb-4">
                  Script complex texture workflows including file renaming, resizing with specific pixel interpolations for different texture types, and batch processing.
                </p>
                <Button asChild className="w-full">
                  <a href="https://www.geeksforgeeks.org/python/python-automation/" target="_blank" rel="noopener noreferrer">
                    Learn Automation
                  </a>
                </Button>
              </CardContent>
            </Card>
          </div>
        </section>
      </div>
    </div>
  );
}