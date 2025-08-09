import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  FolderOpen,
  FlaskConical,
  Gem,
  Droplets,
  User,
  Shield,
  Search
} from "lucide-react";
import F0Analyzer from "@/components/f0-analyzer";

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
      title: "Performance Optimized",
      description: "Efficient texture packing and compression for optimal game performance",
      icon: Zap,
      color: "bg-yellow-500"
    },
    {
      title: "Shader Compatibility",
      description: "Works with popular Minecraft shaders like BSL, SEUS, and Complementary",
      icon: Sparkles,
      color: "bg-purple-500"
    }
  ];

  const textureTypes = [
    {
      name: "Albedo (Diffuse)",
      file: "no suffix",
      format: "RGB",
      description: "Base color and diffuse lighting information without shadows or highlights",
      channels: "RGB: Color information"
    },
    {
      name: "Specular",
      file: "_s.png", 
      format: "RGBA",
      description: "Surface material properties including smoothness, metallic response, and subsurface scattering",
      channels: "R: Smoothness, G: Metallic, B: Porosity, A: SSS Amount"
    },
    {
      name: "Normal",
      file: "_n.png",
      format: "RGB(A)",
      description: "Surface normal vectors for detailed bump mapping and micro-surface geometry",
      channels: "RG: XY Normal vectors, B: Z Normal (calculated), A: Height (optional)"
    },
    {
      name: "Emission",
      file: "_e.png", 
      format: "RGB(A)",
      description: "Self-illumination and glow effects for light-emitting surfaces",
      channels: "RGB: Emission color and intensity, A: Opacity (optional)"
    }
  ];

  const validationRules = [
    {
      rule: "Texture Resolution",
      requirement: "Must be power of 2 (16x16, 32x32, 64x64, 128x128, 256x256, 512x512, 1024x1024)",
      severity: "error"
    },
    {
      rule: "File Format",
      requirement: "PNG format required for all texture maps",
      severity: "error"
    },
    {
      rule: "Naming Convention",
      requirement: "Follow LabPBR naming: texture_s.png, texture_n.png, texture_e.png",
      severity: "warning"
    },
    {
      rule: "Alpha Channel Usage",
      requirement: "Only use alpha channels when required (height maps, emission opacity)",
      severity: "info"
    },
    {
      rule: "Normal Map Format",
      requirement: "Use DirectX format (green channel inverted) or OpenGL format consistently",
      severity: "warning"
    },
    {
      rule: "Specular Channel Ranges",
      requirement: "Smoothness: 0-255, Metallic: 0 or 255 only, Porosity: 0-255, SSS: 0-255",
      severity: "error"
    }
  ];

  const workflowSteps = [
    {
      step: 1,
      title: "Prepare Source Materials",
      description: "Gather high-quality textures and references for your material",
      icon: FolderOpen
    },
    {
      step: 2,
      title: "Create Individual Maps",
      description: "Generate albedo, specular, normal, and emission textures",
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

  const referenceTools = [
    {
      name: "GIMP",
      description: "Free, open-source image editor perfect for texture creation and editing. Supports layers, advanced brushes, and plugin ecosystem.",
      category: "Image Editor",
      url: "https://www.gimp.org/",
      icon: Brush,
      color: "bg-purple-500"
    },
    {
      name: "Substance Designer",
      description: "Industry-standard procedural texture creation tool. Generate seamless materials with node-based workflow.",
      category: "Procedural",
      url: "https://www.adobe.com/products/substance3d-designer.html",
      icon: Box,
      color: "bg-orange-500"
    },
    {
      name: "Substance Painter",
      description: "3D painting application for texturing assets. Paint directly on 3D models with realistic material preview.",
      category: "3D Painting",
      url: "https://www.adobe.com/products/substance3d-painter.html",
      icon: Palette,
      color: "bg-red-500"
    },
    {
      name: "Substance Sampler",
      description: "Turn any image into a tileable material. AI-powered material generation from photographs.",
      category: "AI Generation",
      url: "https://www.adobe.com/products/substance3d-sampler.html",
      icon: Sparkles,
      color: "bg-blue-500"
    },
    {
      name: "PhotoGIMP",
      description: "GIMP configured to work like Photoshop. Familiar interface for Photoshop users transitioning to free tools.",
      category: "Image Editor",
      url: "https://github.com/Diolinux/PhotoGIMP",
      icon: FileImage,
      color: "bg-green-500"
    },
    {
      name: "Bulk Rename Utility",
      description: "Rename multiple files quickly with flexible naming patterns. Essential for organizing texture files.",
      category: "File Management",
      url: "https://www.bulkrenameutility.co.uk/",
      icon: FolderOpen,
      color: "bg-yellow-500"
    },
    {
      name: "Python Automation",
      description: "Automate texture processing with Python scripts. Batch resize, convert, and validate textures programmatically.",
      category: "Automation",
      url: "https://pillow.readthedocs.io/",
      icon: Code,
      color: "bg-cyan-500"
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
          <button
            onClick={() => document.getElementById('f0-values')?.scrollIntoView({ behavior: 'smooth' })}
            className="px-4 py-2 rounded-lg bg-primary/10 hover:bg-primary/20 text-primary font-medium transition-colors"
          >
            F0 Values
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
              <CardDescription>
                LabPBR (Physically Based Rendering for Labs) is a material format specification designed for Minecraft resource packs.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-foreground/95 dark:text-muted-foreground">
                LabPBR 1.3 defines how to create realistic materials using multiple texture maps that describe surface properties 
                like roughness, metallic response, normal details, and emission. This enables shaders to render materials with 
                physically accurate lighting, reflections, and surface interactions.
              </p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                {labpbrFeatures.map((feature, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
                    <div className={`${feature.color} p-2 rounded-lg`}>
                      <feature.icon className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-white mb-1">{feature.title}</h3>
                      <p className="text-sm text-zinc-300">{feature.description}</p>
                    </div>
                  </div>
                ))}
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
                Texture Map Types
              </CardTitle>
              <CardDescription>
                Understanding the different texture maps and their roles in LabPBR materials.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {textureTypes.map((texture, index) => (
                <div key={index} className="border border-zinc-700/50 rounded-lg p-6 bg-zinc-800/20">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white">{texture.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="border-border text-foreground">
                        {texture.file}
                      </Badge>
                      <Badge variant="outline" className="border-border text-foreground">
                        {texture.format}
                      </Badge>
                    </div>
                  </div>
                  <p className="text-foreground/90 mb-4">{texture.description}</p>
                  <div className="bg-zinc-900/50 rounded p-4">
                    <h4 className="text-sm font-semibold text-muted-foreground mb-2">Channel Information:</h4>
                    <p className="text-sm text-foreground font-mono">{texture.channels}</p>
                  </div>
                </div>
              ))}

              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 border border-blue-500/20 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-blue-400 mb-3">Specular Map Channel Breakdown</h3>
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
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Workflow Section */}
        <section id="workflow" className="space-y-8 scroll-mt-20">
          <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Target className="h-6 w-6 text-orange-400" />
                Texture Creation Workflow
              </CardTitle>
              <CardDescription>
                Step-by-step guide to creating LabPBR-compliant textures.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-6">
                {workflowSteps.map((step, index) => (
                  <div key={index} className="flex items-start gap-4">
                    <div className="flex items-center justify-center w-8 h-8 bg-green-500 text-white font-bold rounded-full text-sm">
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

              <Separator />

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
                Validation Rules & Standards
              </CardTitle>
              <CardDescription>
                Essential requirements for LabPBR 1.3 compliance and optimal performance.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                {validationRules.map((rule, index) => (
                  <div key={index} className="flex items-start gap-4 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
                    <div className="flex-shrink-0 mt-1">
                      {rule.severity === 'error' && <AlertTriangle className="h-5 w-5 text-red-400" />}
                      {rule.severity === 'warning' && <AlertTriangle className="h-5 w-5 text-yellow-400" />}
                      {rule.severity === 'info' && <Info className="h-5 w-5 text-blue-400" />}
                    </div>
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
        </section>

        {/* Reference Section */}
        <section id="reference" className="space-y-8 scroll-mt-20">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-600 bg-clip-text text-transparent">
              Essential Tools & Resources
            </h2>
            <p className="text-xl text-foreground/90 dark:text-muted-foreground max-w-3xl mx-auto">
              Professional software and automation tools for creating high-quality LabPBR textures and streamlining your workflow.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {referenceTools.map((tool, index) => (
              <Card key={index} className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 border-zinc-700/50 backdrop-blur-sm hover:border-zinc-600/50 transition-colors">
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3 mb-2">
                    <div className={`${tool.color} p-2 rounded-lg`}>
                      <tool.icon className="h-5 w-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg text-white">{tool.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs mt-1">
                        {tool.category}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-zinc-300 mb-4">{tool.description}</p>
                  <Button variant="outline" className="w-full border-zinc-700 hover:bg-zinc-800" asChild>
                    <a href={tool.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                      <ExternalLink className="h-4 w-4" />
                      Learn More
                    </a>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <ExternalLink className="h-6 w-6 text-blue-400" />
                External Resources & Links
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
                  <h4 className="text-lg font-semibold text-green-400">Community Resources</h4>
                  <div className="space-y-3">
                    <Button variant="outline" className="w-full justify-start gap-3 border-zinc-700 hover:bg-zinc-800" asChild>
                      <a href="https://www.reddit.com/r/Minecraft/" target="_blank" rel="noopener noreferrer">
                        <Database className="h-4 w-4" />
                        r/Minecraft on Reddit
                      </a>
                    </Button>
                    <Button variant="outline" className="w-full justify-start gap-3 border-zinc-700 hover:bg-zinc-800" asChild>
                      <a href="https://discord.com/invite/RpzWN9S" target="_blank" rel="noopener noreferrer">
                        <Lightbulb className="h-4 w-4" />
                        ShaderLabs Discord Server
                      </a>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* F0 Values Section */}
        <section id="f0-values" className="space-y-8 scroll-mt-20">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-600 bg-clip-text text-transparent">
              LabPBR F0 Reference Values
            </h2>
            <p className="text-xl text-foreground/90 dark:text-muted-foreground max-w-3xl mx-auto">
              Comprehensive material reference table and specular map analyzer for physically accurate texture creation.
            </p>
          </div>

          {/* F0 Analyzer */}
          <F0Analyzer />

          {/* Material Reference Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Liquids */}
            <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Droplets className="h-6 w-6 text-blue-400" />
                  Liquids
                </CardTitle>
                <CardDescription>
                  F0 values for various liquid materials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  <div className="grid grid-cols-3 gap-2 text-xs font-medium text-muted-foreground border-b pb-1">
                    <span>Material</span>
                    <span>Reflectance</span>
                    <span>F0</span>
                  </div>
                  {[
                    { name: "Ice, Boiling Water", reflectance: "1.80%", f0: 5 },
                    { name: "Water, Blood, Tears", reflectance: "2.10%", f0: 5 },
                    { name: "Beer", reflectance: "2.20%", f0: 6 },
                    { name: "Milk, Soda, Juice", reflectance: "2.30%", f0: 6 },
                    { name: "Shampoo, Sugar 25%", reflectance: "2.50%", f0: 6 },
                    { name: "Fuel, Lamp Oil", reflectance: "2.70%", f0: 7 },
                    { name: "Juice Concentrate", reflectance: "3.20%", f0: 8 },
                    { name: "Vegetable Oil", reflectance: "3.60%", f0: 9 },
                    { name: "Liquid Honey", reflectance: "3.70%", f0: 9 },
                    { name: "Viscous Honey", reflectance: "4.10%", f0: 10 },
                    { name: "Hydraulic Fluid", reflectance: "5.10%", f0: 13 },
                    { name: "Liquid Mercury", reflectance: "5.60%", f0: 14 }
                  ].map((material, index) => (
                    <div key={index} className="grid grid-cols-3 gap-2 text-xs py-1 hover:bg-zinc-800/30 rounded px-2">
                      <span className="text-white truncate" title={material.name}>{material.name}</span>
                      <span className="text-blue-400">{material.reflectance}</span>
                      <span className="text-green-400 font-mono">{material.f0}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Surfaces */}
            <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Shield className="h-6 w-6 text-green-400" />
                  Surfaces
                </CardTitle>
                <CardDescription>
                  F0 values for common surface materials
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  <div className="grid grid-cols-3 gap-2 text-xs font-medium text-muted-foreground border-b pb-1">
                    <span>Material</span>
                    <span>Reflectance</span>
                    <span>F0</span>
                  </div>
                  {[
                    { name: "Teflon", reflectance: "2.30%", f0: 6 },
                    { name: "Skin", reflectance: "3.30%", f0: 8 },
                    { name: "Plastic, Plant, Leaf", reflectance: "3.50%", f0: 9 },
                    { name: "Rust, Stone, Rock", reflectance: "3.90%", f0: 10 },
                    { name: "Fabrics, Fibers", reflectance: "4.00%", f0: 10 },
                    { name: "Wood, Plastic", reflectance: "4.30%", f0: 11 },
                    { name: "Pearl, Nylon, Rubber", reflectance: "4.40%", f0: 11 },
                    { name: "Ivory, Teeth, Clay", reflectance: "4.60%", f0: 12 },
                    { name: "CD, DVD, Optical", reflectance: "4.90%", f0: 12 },
                    { name: "Polystyrene", reflectance: "5.00%", f0: 13 },
                    { name: "Teeth Enamel", reflectance: "5.80%", f0: 15 },
                    { name: "Ceramic, Asphalt", reflectance: "6.00%", f0: 15 },
                    { name: "Pearl, Glitter", reflectance: "6.60%", f0: 17 },
                    { name: "Lead", reflectance: "11.30%", f0: 29 }
                  ].map((material, index) => (
                    <div key={index} className="grid grid-cols-3 gap-2 text-xs py-1 hover:bg-zinc-800/30 rounded px-2">
                      <span className="text-white truncate" title={material.name}>{material.name}</span>
                      <span className="text-blue-400">{material.reflectance}</span>
                      <span className="text-green-400 font-mono">{material.f0}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Gems */}
            <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Gem className="h-6 w-6 text-purple-400" />
                  Gems & Crystals
                </CardTitle>
                <CardDescription>
                  F0 values for precious stones and crystals
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  <div className="grid grid-cols-3 gap-2 text-xs font-medium text-muted-foreground border-b pb-1">
                    <span>Material</span>
                    <span>Reflectance</span>
                    <span>F0</span>
                  </div>
                  {[
                    { name: "Quartz", reflectance: "3.40%", f0: 9 },
                    { name: "Salt, Jasper", reflectance: "4.50%", f0: 11 },
                    { name: "Agate, Amethyst", reflectance: "4.70%", f0: 12 },
                    { name: "Emerald", reflectance: "5.10%", f0: 13 },
                    { name: "Topaz", reflectance: "5.60%", f0: 14 },
                    { name: "Jade", reflectance: "6.30%", f0: 16 },
                    { name: "Sapphire", reflectance: "7.60%", f0: 19 },
                    { name: "Crystal", reflectance: "9.20%", f0: 23 },
                    { name: "Ruby", reflectance: "12.40%", f0: 32 },
                    { name: "Cubic Zirconia", reflectance: "13.00%", f0: 33 },
                    { name: "Diamond", reflectance: "17.00%", f0: 43 }
                  ].map((material, index) => (
                    <div key={index} className="grid grid-cols-3 gap-2 text-xs py-1 hover:bg-zinc-800/30 rounded px-2">
                      <span className="text-white truncate" title={material.name}>{material.name}</span>
                      <span className="text-blue-400">{material.reflectance}</span>
                      <span className="text-green-400 font-mono">{material.f0}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Metals */}
            <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <FlaskConical className="h-6 w-6 text-yellow-400" />
                  Metals
                </CardTitle>
                <CardDescription>
                  F0 values for metallic materials (use metallic channel)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2 text-xs font-medium text-muted-foreground border-b pb-1">
                    <span>Metal</span>
                    <span>F0 Value</span>
                  </div>
                  {[
                    { name: "Iron", f0: 230 },
                    { name: "Gold", f0: 231 },
                    { name: "Aluminum", f0: 232 },
                    { name: "Chrome", f0: 233 },
                    { name: "Copper", f0: 234 },
                    { name: "Lead", f0: 235 },
                    { name: "Platinum", f0: 236 },
                    { name: "Silver", f0: 237 }
                  ].map((material, index) => (
                    <div key={index} className="grid grid-cols-2 gap-2 text-xs py-1 hover:bg-zinc-800/30 rounded px-2">
                      <span className="text-white">{material.name}</span>
                      <span className="text-yellow-400 font-mono">{material.f0}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-yellow-900/20 rounded-lg border border-yellow-700/30">
                  <p className="text-xs text-yellow-300">
                    <Info className="h-3 w-3 inline mr-1" />
                    Metals use F0 values 230-237 with the metallic channel enabled
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Usage Guidelines */}
          <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/50 border-zinc-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-3">
                <Search className="h-6 w-6 text-cyan-400" />
                Using F0 Values in Your Textures
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-cyan-400">Specular Map Creation</h4>
                  <ul className="space-y-2 text-foreground/90 text-sm">
                    <li>• Use the red channel for F0 values (0-255)</li>
                    <li>• Convert percentage to 8-bit: F0_value * 255/100</li>
                    <li>• For wood (F0=11): red channel = 11</li>
                    <li>• For metals: use values 230-237 with metallic=true</li>
                    <li>• Avoid values above 43 for non-metals</li>
                  </ul>
                </div>
                <div className="space-y-4">
                  <h4 className="text-lg font-semibold text-orange-400">Physical Accuracy</h4>
                  <ul className="space-y-2 text-foreground/90 text-sm">
                    <li>• Match materials to their real-world reflectance</li>
                    <li>• Use the F0 analyzer to check existing textures</li>
                    <li>• Most dielectrics have F0 values 5-20</li>
                    <li>• Water-based materials typically use F0=5-7</li>
                    <li>• High F0 values (&gt;30) are rare in nature</li>
                  </ul>
                </div>
              </div>
              
              <div className="bg-zinc-800/30 rounded-lg p-4 border border-zinc-700/50">
                <h4 className="font-semibold text-white mb-2">Quick Reference Formula</h4>
                <div className="bg-black/50 rounded p-3 font-mono text-sm">
                  <div className="text-green-400">// Convert reflectance percentage to F0 value</div>
                  <div className="text-white">F0_red_channel = reflectance_percentage * 255 / 100</div>
                  <div className="text-blue-400 mt-2">// Example: 4% reflectance = 4 * 255 / 100 ≈ 10</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}