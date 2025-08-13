import { Link } from "wouter";
import { Upload, Zap, FolderOpen, Sparkles, ArrowRight, Star, Users, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import bonemeaLogo from "@assets/SkyBlock_items_enchanted_bonemeal_1752287919002.gif";

export default function MobileHome() {
  const features = [
    {
      icon: Upload,
      title: "Quick Upload",
      description: "Drag & drop textures instantly",
      color: "text-green-500"
    },
    {
      icon: Zap,
      title: "Fast Conversion",
      description: "LabPBR processing in seconds",
      color: "text-yellow-500"
    },
    {
      icon: Sparkles,
      title: "AI Enhancement",
      description: "Smart texture optimization",
      color: "text-purple-500"
    }
  ];

  const stats = [
    { label: "Textures Processed", value: "10K+" },
    { label: "Active Users", value: "2.5K" },
    { label: "Success Rate", value: "99.9%" }
  ];

  return (
    <div className="min-h-screen bg-background organic-bg">
      {/* Hero Section */}
      <section className="px-4 py-12 text-center">
        <div className="max-w-md mx-auto space-y-6">
          <div className="flex justify-center">
            <img 
              src={bonemeaLogo} 
              alt="Bonemeal" 
              className="w-20 h-20 floating" 
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
          
          <div className="space-y-3">
            <h1 className="text-3xl font-bold text-foreground">
              Bonemeal
            </h1>
            <p className="text-lg text-primary font-medium">
              Texture Lab in Your Pocket
            </p>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Convert standard Minecraft textures to LabPBR format with professional-grade processing tools optimized for mobile.
            </p>
          </div>

          <div className="flex flex-col gap-3 pt-4">
            <Link href="/greenhouse">
              <Button size="lg" className="w-full moss-texture h-14 text-lg">
                <Upload className="w-5 h-5 mr-2" />
                Start Converting
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </Link>
            
            <Link href="/projects">
              <Button variant="outline" size="lg" className="w-full h-12 glass-card">
                <FolderOpen className="w-5 h-5 mr-2" />
                View Projects
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="grid grid-cols-3 gap-4">
            {stats.map((stat, index) => (
              <Card key={index} className="glass-card text-center">
                <CardContent className="p-4">
                  <div className="text-2xl font-bold text-primary">{stat.value}</div>
                  <div className="text-xs text-muted-foreground mt-1">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 py-8">
        <div className="max-w-md mx-auto space-y-4">
          <h2 className="text-xl font-semibold text-center mb-6">
            Mobile-First Features
          </h2>
          
          {features.map((feature, index) => (
            <Card key={index} className="glass-card">
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <div className={`p-2 rounded-lg bg-background/60 ${feature.color}`}>
                    <feature.icon className="w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-foreground">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{feature.description}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="px-4 py-8">
        <div className="max-w-md mx-auto">
          <h2 className="text-lg font-semibold mb-4 text-center">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-3">
            <Link href="/greenhouse?view=ai">
              <Card className="glass-card hover:bg-accent/10 transition-colors cursor-pointer">
                <CardContent className="p-4 text-center">
                  <Sparkles className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                  <div className="text-sm font-medium">AI Tools</div>
                  <div className="text-xs text-muted-foreground">Generate textures</div>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/greenhouse?view=batch">
              <Card className="glass-card hover:bg-accent/10 transition-colors cursor-pointer">
                <CardContent className="p-4 text-center">
                  <Zap className="w-8 h-8 mx-auto text-yellow-500 mb-2" />
                  <div className="text-sm font-medium">Batch Process</div>
                  <div className="text-xs text-muted-foreground">Multiple files</div>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/greenhouse?view=editor">
              <Card className="glass-card hover:bg-accent/10 transition-colors cursor-pointer">
                <CardContent className="p-4 text-center">
                  <Upload className="w-8 h-8 mx-auto text-green-500 mb-2" />
                  <div className="text-sm font-medium">Editor</div>
                  <div className="text-xs text-muted-foreground">Visual editing</div>
                </CardContent>
              </Card>
            </Link>
            
            <Link href="/greenhouse?view=templates">
              <Card className="glass-card hover:bg-accent/10 transition-colors cursor-pointer">
                <CardContent className="p-4 text-center">
                  <Download className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                  <div className="text-sm font-medium">Templates</div>
                  <div className="text-xs text-muted-foreground">Ready presets</div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section className="px-4 py-8 mb-20">
        <div className="max-w-md mx-auto">
          <h2 className="text-lg font-semibold mb-4 text-center">Recent Activity</h2>
          <Card className="glass-card">
            <CardContent className="p-4">
              <div className="text-center text-muted-foreground">
                <Upload className="w-12 h-12 mx-auto opacity-50 mb-3" />
                <p className="text-sm">No recent conversions</p>
                <p className="text-xs mt-1">Start your first texture conversion!</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </div>
  );
}