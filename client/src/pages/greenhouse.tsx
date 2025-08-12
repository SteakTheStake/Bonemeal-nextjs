import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearch } from "wouter";
import { Box, HelpCircle, Settings, Plus, FolderOpen, Sparkles, Brush, Package, Zap, Home, Leaf, Minimize2, Maximize2, PanelLeft, PanelRight, PanelTop, PanelBottom } from "lucide-react";

import { Button } from "@/components/ui/button";
import { UploadZone } from "@/components/upload-zone";
import { ConversionSettings } from "@/components/conversion-settings";
import { AdvancedProcessing } from "@/components/advanced-processing";
import { AdvancedInterpolation } from "@/components/advanced-interpolation";
import { ProgressPanel } from "@/components/progress-panel";
import { ValidationPanel } from "@/components/validation-panel";
import { BatchPanel } from "@/components/batch-panel";
import { FilesPanel } from "@/components/files-panel";
import EnhancedProjectDashboard from "@/components/enhanced-project-dashboard";
import TextureEditor from "@/components/texture-editor";
import AITextureGenerator from "@/components/ai-texture-generator";
import TemplateLibrary from "@/components/template-library";
import BatchProcessor from "@/components/batch-processor";
import TextureQualityAnalyzer from "@/components/texture-quality-analyzer";
import FavoritesPanel from "@/components/favorites-panel";
import PresetsManager from "@/components/presets-manager";
import { TexturePreview } from "@/components/texture-preview";
import { UploadedContent } from "@/components/uploaded-content";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from "@/components/ui/resizable";
import { type ConversionJob } from "@shared/schema";
import bonemeaLogo from "@assets/SkyBlock_items_enchanted_bonemeal_1752287919002.gif";
import { SettingsProvider } from "@/contexts/settings-context";

export default function Greenhouse() {
  const searchParams = useSearch();
  const projectId = searchParams ? parseInt(searchParams.replace('?project=', '')) : undefined;
  const [activeJob, setActiveJob] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("progress");
  const [validationResults, setValidationResults] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [mainView, setMainView] = useState<'convert' | 'dashboard' | 'editor' | 'ai' | 'templates' | 'batch' | 'quality' | 'library'>('convert');
  const [previewTexture, setPreviewTexture] = useState<{url: string, name: string, type: string} | null>(null);
  
  // Panel management state
  const [panelStates, setPanelStates] = useState({
    leftPanel: { collapsed: false, size: 25 },
    centerPanel: { collapsed: false, size: 50 },
    rightPanel: { collapsed: false, size: 25 },
    bottomPanel: { collapsed: false, size: 30 }
  });
  
  const togglePanel = (panel: keyof typeof panelStates) => {
    setPanelStates(prev => ({
      ...prev,
      [panel]: { ...prev[panel], collapsed: !prev[panel].collapsed }
    }));
  };

  const { data: jobs } = useQuery<ConversionJob[]>({
    queryKey: ["/api/jobs"],
    refetchInterval: 1000,
  });

  const { data: job } = useQuery<ConversionJob>({
    queryKey: ["/api/jobs", activeJob],
    enabled: !!activeJob,
    refetchInterval: 1000,
  });

  const { data: processingStatus } = useQuery({
    queryKey: ["/api/jobs", activeJob, "status"],
    enabled: !!activeJob,
    refetchInterval: 1000,
  });

  const { data: textureFiles = [] } = useQuery({
    queryKey: ["/api/jobs", activeJob, "files"],
    enabled: !!activeJob,
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (jobs && jobs.length > 0 && !activeJob) {
      setActiveJob(jobs[0].id);
    }
  }, [jobs, activeJob]);

  const navigationItems = [
    { key: 'convert', label: 'Convert', icon: Zap, description: 'Upload & convert textures' },
    { key: 'dashboard', label: 'Projects', icon: FolderOpen, description: 'Manage your projects' },
    { key: 'library', label: 'Library', icon: Box, description: 'Your uploaded content' },
    { key: 'editor', label: 'Editor', icon: Brush, description: 'Visual texture editing' },
    { key: 'ai', label: 'AI Generate', icon: Sparkles, description: 'AI-powered generation' },
    { key: 'templates', label: 'Templates', icon: Package, description: 'Material templates' },
    { key: 'batch', label: 'Batch', icon: Box, description: 'Bulk processing' },
    { key: 'quality', label: 'Quality', icon: Settings, description: 'Texture quality analysis' },
  ];

  return (
    <SettingsProvider>
      <div className="h-screen flex flex-col bg-background text-foreground organic-bg vine-texture transition-colors duration-300 no-horizontal-scroll">
        {/* Top Menu Bar */}
        <header className="glass-card moss-texture border-b living-border px-4 py-2 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <img 
                src={bonemeaLogo} 
                alt="Bonemeal" 
                className="w-6 h-6 floating" 
                style={{ imageRendering: 'pixelated' }}
              />
              <span className="text-lg font-semibold text-primary">Greenhouse</span>
            </div>
            <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
              <Leaf className="w-3 h-3" />
              <span>Flexible texture workspace</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Link href="/projects">
              <Button variant="outline" size="sm" className="glass-card">
                <FolderOpen className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Projects</span>
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm" className="glass-card">
                <Home className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">Home</span>
              </Button>
            </Link>
          </div>
        </header>

        {/* Main Navigation */}
        <div className="border-b border-border/40 bg-background/80 backdrop-blur-sm flex-shrink-0">
          <div className="container mx-auto px-4">
            <div className="flex items-center gap-1 py-2 greenhouse-scroll overflow-x-auto">
              {navigationItems.map(({ key, label, icon: Icon, description }) => (
                <Button
                  key={key}
                  variant={mainView === key ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setMainView(key as any)}
                  className={`flex-shrink-0 flex items-center gap-2 transition-all duration-200 px-3 ${
                    mainView === key 
                      ? "bg-primary/20 text-primary border border-primary/30" 
                      : "hover:bg-accent/10 text-muted-foreground hover:text-foreground"
                  }`}
                  title={description}
                >
                  <Icon className="w-4 h-4" />
                  <span className="text-sm">{label}</span>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Resizable Workspace */}
        <div className="flex-1 overflow-hidden">
          <ResizablePanelGroup direction="vertical" className="h-full">
            {/* Main Horizontal Panel Group */}
            <ResizablePanel defaultSize={70} minSize={50}>
              <ResizablePanelGroup direction="horizontal" className="h-full">
                
                {/* Left Panel - Tools & Navigation */}
                {!panelStates.leftPanel.collapsed && (
                  <>
                    <ResizablePanel defaultSize={25} minSize={15} maxSize={40} className="relative">
                      <div className="h-full flex flex-col bg-card/50 border-r border-border/40">
                        <div className="flex items-center justify-between p-2 border-b border-border/40 bg-background/60">
                          <div className="flex items-center gap-2">
                            <PanelLeft className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Tools</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => togglePanel('leftPanel')}
                            className="p-1 h-6 w-6"
                          >
                            <Minimize2 className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="h-full greenhouse-scroll overflow-y-auto p-2">
                            <div className="space-y-2">
                              {navigationItems.map(({ key, label, icon: Icon, description }) => (
                                <Button
                                  key={key}
                                  variant={mainView === key ? "default" : "ghost"}
                                  size="sm"
                                  onClick={() => setMainView(key as any)}
                                  className={`w-full justify-start gap-2 transition-all duration-200 ${
                                    mainView === key 
                                      ? "moss-texture border-primary/30" 
                                      : "hover:bg-accent/10"
                                  }`}
                                  title={description}
                                >
                                  <Icon className="w-4 h-4" />
                                  <span className="text-sm">{label}</span>
                                </Button>
                              ))}
                            </div>
                            <div className="mt-4 pt-4 border-t border-border/40">
                              <FavoritesPanel />
                              <div className="mt-4">
                                <PresetsManager />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </ResizablePanel>
                    <ResizableHandle withHandle />
                  </>
                )}
                
                {/* Center Panel - Main Content */}
                <ResizablePanel defaultSize={panelStates.leftPanel.collapsed ? 75 : 50} minSize={30}>
                  <div className="h-full flex flex-col bg-background">
                    <div className="flex items-center justify-between p-2 border-b border-border/40 bg-card/30">
                      <div className="flex items-center gap-2">
                        {panelStates.leftPanel.collapsed && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => togglePanel('leftPanel')}
                            className="p-1 h-6 w-6"
                          >
                            <PanelLeft className="w-3 h-3" />
                          </Button>
                        )}
                        <span className="text-sm font-medium capitalize">{mainView} Workspace</span>
                      </div>
                      <div className="flex items-center gap-1">
                        {panelStates.rightPanel.collapsed && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => togglePanel('rightPanel')}
                            className="p-1 h-6 w-6"
                          >
                            <PanelRight className="w-3 h-3" />
                          </Button>
                        )}
                        {panelStates.bottomPanel.collapsed && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => togglePanel('bottomPanel')}
                            className="p-1 h-6 w-6"
                          >
                            <PanelBottom className="w-3 h-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="h-full greenhouse-scroll overflow-auto p-4">
                        {/* Main View Content */}
                        {mainView === 'convert' && (
                          <div className="space-y-4">
                            <UploadZone 
                              onFileProcessed={setActiveJob}
                              projectId={projectId}
                            />
                            <ConversionSettings />
                            <AdvancedProcessing />
                            <AdvancedInterpolation />
                          </div>
                        )}
                        {mainView === 'dashboard' && <EnhancedProjectDashboard />}
                        {mainView === 'library' && <UploadedContent />}
                        {mainView === 'editor' && <TextureEditor />}
                        {mainView === 'ai' && <AITextureGenerator />}
                        {mainView === 'templates' && <TemplateLibrary />}
                        {mainView === 'batch' && <BatchProcessor />}
                        {mainView === 'quality' && <TextureQualityAnalyzer />}
                      </div>
                    </div>
                  </div>
                </ResizablePanel>
                
                {/* Right Panel - Preview & Settings */}
                {!panelStates.rightPanel.collapsed && (
                  <>
                    <ResizableHandle withHandle />
                    <ResizablePanel defaultSize={25} minSize={15} maxSize={40}>
                      <div className="h-full flex flex-col bg-card/50 border-l border-border/40">
                        <div className="flex items-center justify-between p-2 border-b border-border/40 bg-background/60">
                          <div className="flex items-center gap-2">
                            <PanelRight className="w-4 h-4 text-muted-foreground" />
                            <span className="text-sm font-medium">Preview</span>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => togglePanel('rightPanel')}
                            className="p-1 h-6 w-6"
                          >
                            <Minimize2 className="w-3 h-3" />
                          </Button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                          <div className="h-full greenhouse-scroll overflow-y-auto p-2">
                            <TexturePreview 
                              texture={previewTexture}
                              onClose={() => setPreviewTexture(null)}
                            />
                            {activeJob && (
                              <div className="mt-4 space-y-4">
                                <ValidationPanel 
                                  validationResults={validationResults}
                                  isValidating={isValidating}
                                  onValidate={() => {}}
                                />
                                <FilesPanel 
                                  textureFiles={textureFiles}
                                  onPreview={setPreviewTexture}
                                />
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </ResizablePanel>
                  </>
                )}
              </ResizablePanelGroup>
            </ResizablePanel>
            
            {/* Bottom Panel - Progress & Logs */}
            {!panelStates.bottomPanel.collapsed && (
              <>
                <ResizableHandle withHandle />
                <ResizablePanel defaultSize={30} minSize={20} maxSize={50}>
                  <div className="h-full flex flex-col bg-card/30 border-t border-border/40">
                    <div className="flex items-center justify-between p-2 border-b border-border/40 bg-background/60">
                      <div className="flex items-center gap-2">
                        <PanelBottom className="w-4 h-4 text-muted-foreground" />
                        <span className="text-sm font-medium">Progress & Logs</span>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => togglePanel('bottomPanel')}
                        className="p-1 h-6 w-6"
                      >
                        <Minimize2 className="w-3 h-3" />
                      </Button>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
                        <TabsList className="grid grid-cols-3 m-2">
                          <TabsTrigger value="progress">Progress</TabsTrigger>
                          <TabsTrigger value="batch">Batch</TabsTrigger>
                          <TabsTrigger value="validation">Validation</TabsTrigger>
                        </TabsList>
                        <div className="flex-1 overflow-hidden">
                          <TabsContent value="progress" className="h-full m-0">
                            <div className="h-full greenhouse-scroll overflow-auto p-2">
                              <ProgressPanel 
                                job={job}
                                processingStatus={processingStatus}
                              />
                            </div>
                          </TabsContent>
                          <TabsContent value="batch" className="h-full m-0">
                            <div className="h-full greenhouse-scroll overflow-auto p-2">
                              <BatchPanel />
                            </div>
                          </TabsContent>
                          <TabsContent value="validation" className="h-full m-0">
                            <div className="h-full greenhouse-scroll overflow-auto p-2">
                              <ValidationPanel 
                                validationResults={validationResults}
                                isValidating={isValidating}
                                onValidate={() => {}}
                              />
                            </div>
                          </TabsContent>
                        </div>
                      </Tabs>
                    </div>
                  </div>
                </ResizablePanel>
              </>
            )}
          </ResizablePanelGroup>
        </div>
      </div>
    </SettingsProvider>
  );
}