import { useState } from "react";
import { Link } from "wouter";
import { 
  Home, Upload, Sparkles, Brush, Package, Zap, 
  LayoutDashboard, ArrowLeft 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UploadZone } from "@/components/upload-zone";
import { ConversionSettings } from "@/components/conversion-settings";
import { AdvancedProcessing } from "@/components/advanced-processing";
import ProjectDashboard from "@/components/project-dashboard";
import TextureEditor from "@/components/texture-editor";
import AITextureGenerator from "@/components/ai-texture-generator";
import TemplateLibrary from "@/components/template-library";
import BatchProcessor from "@/components/batch-processor";
import bonemeaLogo from "@assets/SkyBlock_items_enchanted_bonemeal_1752287919002.gif";

export default function Studio() {
  const [activeTab, setActiveTab] = useState("upload");

  return (
    <div className="min-h-screen bg-background organic-bg">
      {/* Header */}
      <header className="glass-card moss-texture border-b living-border px-6 py-3">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm" className="grow-button">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <div className="flex items-center space-x-2">
              <img 
                src={bonemeaLogo} 
                alt="Bonemeal" 
                className="w-6 h-6 floating"
                style={{ imageRendering: 'pixelated' }}
              />
              <span className="text-lg font-semibold text-primary">Bonemeal Studio</span>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Link href="/projects">
              <Button variant="outline" size="sm" className="grow-button">
                View Projects
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-8 glass-card moss-texture">
            <TabsTrigger value="upload" className="grow-button">
              <Upload className="h-4 w-4 mr-2" />
              Convert
            </TabsTrigger>
            <TabsTrigger value="batch" className="grow-button">
              <Zap className="h-4 w-4 mr-2" />
              Batch
            </TabsTrigger>
            <TabsTrigger value="ai" className="grow-button">
              <Sparkles className="h-4 w-4 mr-2" />
              AI Generate
            </TabsTrigger>
            <TabsTrigger value="editor" className="grow-button">
              <Brush className="h-4 w-4 mr-2" />
              Editor
            </TabsTrigger>
            <TabsTrigger value="templates" className="grow-button">
              <Package className="h-4 w-4 mr-2" />
              Templates
            </TabsTrigger>
            <TabsTrigger value="dashboard" className="grow-button">
              <LayoutDashboard className="h-4 w-4 mr-2" />
              Dashboard
            </TabsTrigger>
          </TabsList>

          <TabsContent value="upload" className="space-y-6">
            <div className="grid lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <UploadZone 
                  onJobCreated={(id) => console.log('Job created:', id)}
                  onValidationStart={() => console.log('Validation started')}
                  onValidationComplete={(results) => console.log('Validation complete:', results)}
                  onValidationError={() => console.log('Validation error')}
                />
              </div>
              <div className="space-y-6">
                <ConversionSettings onJobCreated={(id) => console.log('Job created:', id)} />
                <AdvancedProcessing onJobCreated={(id) => console.log('Job created:', id)} />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="batch">
            <BatchProcessor />
          </TabsContent>

          <TabsContent value="ai">
            <AITextureGenerator />
          </TabsContent>

          <TabsContent value="editor">
            <TextureEditor />
          </TabsContent>

          <TabsContent value="templates">
            <TemplateLibrary />
          </TabsContent>

          <TabsContent value="dashboard">
            <ProjectDashboard />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}