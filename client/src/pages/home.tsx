import { Link } from "wouter";
import { ArrowRight, Zap, Shield, Palette, Package, Sparkles, Cpu, FileCheck, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import bonemeaLogo from "@assets/SkyBlock_items_enchanted_bonemeal_1752287919002.gif";

export default function Home() {
  const features = [
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "LabPBR Validation",
      description: "Instant compliance checking with detailed error reporting and suggestions"
    },
    {
      icon: <Palette className="h-8 w-8 text-primary" />,
      title: "Advanced Processing",
      description: "Bulk resize, smart interpolation, and compression with quality control"
    },
    {
      icon: <Package className="h-8 w-8 text-primary" />,
      title: "Resource Pack Support",
      description: "Process entire resource packs up to 200MB with batch operations"
    },
    {
      icon: <Sparkles className="h-8 w-8 text-primary" />,
      title: "PBR Map Generation",
      description: "Automatic normal, roughness, and ambient occlusion map creation"
    },
    {
      icon: <Cpu className="h-8 w-8 text-primary" />,
      title: "CTM Split Processing",
      description: "Generate up to 47 OptiFine Connected Textures variations"
    },
    {
      icon: <FileCheck className="h-8 w-8 text-primary" />,
      title: "Smart File Naming",
      description: "Automatic LabPBR naming conventions (_n, _s suffixes)"
    }
  ];

  const stats = [
    { label: "Texture Formats", value: "5+", description: "PNG, JPG, TIFF, TGA, ZIP" },
    { label: "Processing Speed", value: "< 2s", description: "Per texture average" },
    { label: "Max File Size", value: "200MB", description: "Resource pack limit" },
    { label: "Resolution Support", value: "16x-2048x", description: "All standard sizes" }
  ];

  return (
    <div className="min-h-screen bg-background organic-bg">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-accent/10" />
        <div className="container mx-auto px-6 py-24 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex justify-center mb-6">
              <img 
                src={bonemeaLogo} 
                alt="Bonemeal" 
                className="w-24 h-24 floating"
                style={{ imageRendering: 'pixelated' }}
              />
            </div>
            <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Bonemeal
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              Grow your Minecraft texture productivity with automated LabPBR conversion
            </p>
            <p className="text-lg mb-8 text-foreground/80">
              Transform standard textures into shader-ready LabPBR format with professional-grade tools.
              Perfect for resource pack creators and shader enthusiasts.
            </p>
            <div className="flex gap-4 justify-center">
              <Link href="/projects">
                <Button size="lg" className="grow-button moss-texture">
                  <Zap className="mr-2 h-5 w-5" />
                  Start Converting
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
              <Link href="/converter">
                <Button size="lg" variant="outline" className="grow-button">
                  Quick Convert
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Professional Texture Processing</h2>
            <p className="text-lg text-muted-foreground">
              Everything you need to create shader-compatible resource packs
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card key={index} className="moss-card hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="mb-3">{feature.icon}</div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-sm">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-primary mb-2">{stat.value}</div>
                <div className="text-sm font-medium mb-1">{stat.label}</div>
                <div className="text-xs text-muted-foreground">{stat.description}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Workflow Section */}
      <section className="py-20 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Simple Three-Step Process</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">1</span>
              </div>
              <h3 className="font-semibold mb-2">Upload Textures</h3>
              <p className="text-sm text-muted-foreground">
                Drag and drop individual textures or entire resource packs
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">2</span>
              </div>
              <h3 className="font-semibold mb-2">Configure Settings</h3>
              <p className="text-sm text-muted-foreground">
                Adjust processing parameters or use smart defaults
              </p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-primary">3</span>
              </div>
              <h3 className="font-semibold mb-2">Download Pack</h3>
              <p className="text-sm text-muted-foreground">
                Get your shader-ready resource pack with proper structure
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Enhance Your Textures?</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join texture artists who trust Bonemeal for their LabPBR conversion needs.
            Start with a free project today.
          </p>
          <Link href="/projects">
            <Button size="lg" className="grow-button moss-texture">
              <Download className="mr-2 h-5 w-5" />
              Create Your First Project
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 px-6">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <img 
              src={bonemeaLogo} 
              alt="Bonemeal" 
              className="w-6 h-6"
              style={{ imageRendering: 'pixelated' }}
            />
            <span className="text-sm text-muted-foreground">
              © 2025 Bonemeal - LabPBR Texture Converter
            </span>
          </div>
          <div className="flex space-x-4 text-sm text-muted-foreground">
            <Link href="/converter" className="hover:text-primary">
              Quick Convert
            </Link>
            <Link href="/projects" className="hover:text-primary">
              Projects
            </Link>
            <a href="https://github.com/sp614x/optifine/blob/master/OptiFineDoc/doc/shaders.txt" 
               target="_blank" 
               rel="noopener noreferrer"
               className="hover:text-primary">
              LabPBR Docs
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}