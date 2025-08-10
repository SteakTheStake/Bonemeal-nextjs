import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearch } from "wouter";
import { Box, HelpCircle, Settings, Plus, FolderOpen, Sparkles, Brush, Package, Zap, Home, Leaf } from "lucide-react";
import { useDeviceType } from "@/hooks/useDeviceType";
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
import { type ConversionJob } from "@shared/schema";
import bonemeaLogo from "@assets/SkyBlock_items_enchanted_bonemeal_1752287919002.gif";
import { SettingsProvider } from "@/contexts/settings-context";

export default function Greenhouse() {
  const { isMobile } = useDeviceType();
  const searchParams = useSearch();
  const projectId = searchParams ? parseInt(searchParams.replace('?project=', '')) : undefined;
  const [activeJob, setActiveJob] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("progress");
  const [validationResults, setValidationResults] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [mainView, setMainView] = useState<'convert' | 'dashboard' | 'editor' | 'ai' | 'templates' | 'batch' | 'quality' | 'library'>('convert');
  const [previewTexture, setPreviewTexture] = useState<{url: string, name: string, type: string} | null>(null);

  const { data: jobs } = useQuery<ConversionJob[]>({
    queryKey: ["/api/jobs"],
    refetchInterval: 1000, // Refresh every second for live updates
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

  // All navigation items available for both desktop and mobile
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
      <div className="h-screen flex flex-col bg-background text-foreground organic-bg vine-texture transition-colors duration-300">
      {/* Top Menu Bar */}
      <header className="glass-card moss-texture border-b living-border px-2 sm:px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2 sm:gap-4">
          <div className="flex items-center gap-1 sm:gap-2">
            <img 
              src={bonemeaLogo} 
              alt="Bonemeal" 
              className="w-5 h-5 sm:w-6 sm:h-6 floating" 
              style={{ imageRendering: 'pixelated' }}
            />
            <span className="text-sm sm:text-lg font-semibold text-primary">Greenhouse</span>
          </div>
          <div className="hidden sm:flex items-center gap-1 text-xs text-muted-foreground">
            <Leaf className="w-3 h-3" />
            <span>Where textures grow</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1 sm:gap-2">
          <Link href="/projects">
            <Button variant="outline" size="sm" className="glass-card px-2 sm:px-3">
              <FolderOpen className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Projects</span>
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="sm" className="glass-card px-2 sm:px-3">
              <Home className="w-4 h-4 sm:mr-2" />
              <span className="hidden sm:inline">Home</span>
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Navigation */}
      <div className="border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-2 sm:px-4">
          <div className="flex items-center gap-1 py-2 overflow-x-auto scrollbar-thin">
            {navigationItems.map(({ key, label, icon: Icon, description }) => (
              <Button
                key={key}
                variant={mainView === key ? "default" : "ghost"}
                size="sm"
                onClick={() => setMainView(key as any)}
                className={`flex-shrink-0 flex items-center gap-1 sm:gap-2 transition-all duration-200 px-2 sm:px-3 ${
                  mainView === key 
                    ? "bg-primary/20 text-primary border border-primary/30" 
                    : "hover:bg-accent/10 text-muted-foreground hover:text-foreground"
                }`}
                title={description}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline text-xs sm:text-sm">{label}</span>
                <span className="sm:hidden text-xs">{label.slice(0, 3)}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>



      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main View */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {mainView === 'convert' && (
            <div className="flex-1 flex flex-col lg:flex-row">
              {/* Mobile/Tablet Layout: Stack Panels */}
              <div className="lg:hidden flex-1 flex flex-col">
                <Tabs defaultValue="upload" className="flex-1 flex flex-col">
                  <TabsList className="grid grid-cols-3 m-2">
                    <TabsTrigger value="upload">Upload</TabsTrigger>
                    <TabsTrigger value="settings">Settings</TabsTrigger>
                    <TabsTrigger value="preview">Preview</TabsTrigger>
                  </TabsList>
                  
                  <div className="flex-1 overflow-hidden">
                    <TabsContent value="upload" className="h-full m-0 p-4">
                      <UploadZone
                        onJobCreated={(jobId) => setActiveJob(jobId)}
                        onValidationStart={() => setIsValidating(true)}
                        onValidationComplete={(results) => {
                          setValidationResults(results);
                          setIsValidating(false);
                          if (results?.files?.length > 0) {
                            const firstFile = results.files[0];
                            setPreviewTexture({
                              url: firstFile.url || '',
                              name: firstFile.name || 'Texture',
                              type: firstFile.type || 'albedo'
                            });
                          }
                        }}
                        onValidationError={() => setIsValidating(false)}
                      />
                    </TabsContent>
                    
                    <TabsContent value="settings" className="h-full m-0">
                      <Tabs defaultValue="basic" className="flex-1 flex flex-col">
                        <TabsList className="grid w-full grid-cols-3 m-2">
                          <TabsTrigger value="basic">Basic</TabsTrigger>
                          <TabsTrigger value="advanced">Advanced</TabsTrigger>
                          <TabsTrigger value="interpolation">Interp.</TabsTrigger>
                        </TabsList>
                        
                        <div className="flex-1 overflow-hidden">
                          <TabsContent value="basic" className="h-full m-0">
                            <ConversionSettings onJobCreated={(jobId) => setActiveJob(jobId)} />
                          </TabsContent>
                          
                          <TabsContent value="advanced" className="h-full m-0">
                            <AdvancedProcessing onJobCreated={(jobId) => setActiveJob(jobId)} />
                          </TabsContent>
                          
                          <TabsContent value="interpolation" className="h-full m-0">
                            <div className="p-4">
                              <AdvancedInterpolation onSettingsChange={(settings) => {/* Advanced settings updated */}} />
                            </div>
                          </TabsContent>
                        </div>
                      </Tabs>
                    </TabsContent>
                    
                    <TabsContent value="preview" className="h-full m-0">
                      <TexturePreview
                        imageUrl={previewTexture?.url}
                        imageName={previewTexture?.name}
                        imageType={previewTexture?.type as any}
                        onClose={() => setPreviewTexture(null)}
                      />
                    </TabsContent>
                  </div>
                </Tabs>
              </div>

              {/* Desktop Layout: Side by Side */}
              <div className="hidden lg:flex flex-1">
                {/* Left Panel - Upload & Settings */}
                <div className="flex-1 flex flex-col border-r border-border/40">
                  <div className="p-4 overflow-auto">
                    <UploadZone
                      onJobCreated={(jobId) => setActiveJob(jobId)}
                      onValidationStart={() => setIsValidating(true)}
                      onValidationComplete={(results) => {
                        setValidationResults(results);
                        setIsValidating(false);
                        if (results?.files?.length > 0) {
                          const firstFile = results.files[0];
                          setPreviewTexture({
                            url: firstFile.url || '',
                            name: firstFile.name || 'Texture',
                            type: firstFile.type || 'albedo'
                          });
                        }
                      }}
                      onValidationError={() => setIsValidating(false)}
                    />
                  </div>
                </div>

                {/* Middle Panel - Settings & Processing */}
                <div className="w-96 flex flex-col border-r border-border/40 bg-background/60">
                  <Tabs defaultValue="basic" className="flex-1 flex flex-col">
                    <TabsList className="grid w-full grid-cols-3 m-2">
                      <TabsTrigger value="basic">Basic</TabsTrigger>
                      <TabsTrigger value="advanced">Advanced</TabsTrigger>
                      <TabsTrigger value="interpolation">Interpolation</TabsTrigger>
                    </TabsList>
                    
                    <div className="flex-1 overflow-hidden">
                      <TabsContent value="basic" className="h-full m-0">
                        <ConversionSettings onJobCreated={(jobId) => setActiveJob(jobId)} />
                      </TabsContent>
                      
                      <TabsContent value="advanced" className="h-full m-0">
                        <AdvancedProcessing onJobCreated={(jobId) => setActiveJob(jobId)} />
                      </TabsContent>
                      
                      <TabsContent value="interpolation" className="h-full m-0">
                        <div className="p-4">
                          <AdvancedInterpolation onSettingsChange={(settings) => {/* Advanced settings updated */}} />
                        </div>
                      </TabsContent>
                    </div>
                  </Tabs>
                </div>

                {/* Right Panel - Preview */}
                <div className="flex-1 flex flex-col">
                  <TexturePreview
                    imageUrl={previewTexture?.url}
                    imageName={previewTexture?.name}
                    imageType={previewTexture?.type as any}
                    onClose={() => setPreviewTexture(null)}
                  />
                </div>
              </div>
            </div>
          )}

          {mainView === 'dashboard' && (
            <div className="flex-1 p-4 overflow-auto">
              <EnhancedProjectDashboard />
            </div>
          )}

          {mainView === 'editor' && (
            <div className="flex-1 p-4 overflow-auto">
              <TextureEditor />
            </div>
          )}

          {mainView === 'ai' && (
            <div className="flex-1 p-4 overflow-auto">
              <AITextureGenerator />
            </div>
          )}

          {mainView === 'templates' && (
            <div className="flex-1 p-4 overflow-auto">
              <TemplateLibrary />
            </div>
          )}

          {mainView === 'batch' && (
            <div className="flex-1 p-4 overflow-auto">
              <BatchProcessor />
            </div>
          )}

          {mainView === 'quality' && (
            <div className="flex-1 p-4 overflow-auto">
              <div className="max-w-4xl mx-auto">
                <div className="text-center space-y-2 mb-8">
                  <h1 className="text-2xl font-bold text-foreground">Quality Analyzer</h1>
                  <p className="text-muted-foreground">Analyze texture quality and get optimization recommendations</p>
                </div>
                <TextureQualityAnalyzer />
              </div>
            </div>
          )}

          {mainView === 'library' && (
            <div className="flex-1 overflow-hidden">
              <UploadedContent />
            </div>
          )}
        </div>

        {/* Right Sidebar - Status & Tools (Desktop only) */}
        {mainView === 'convert' && (
          <div className="hidden xl:flex w-80 border-l border-border/40 bg-background/60 backdrop-blur-sm flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
              <TabsList className="grid w-full grid-cols-4 m-2">
                <TabsTrigger value="progress" className="text-xs">Progress</TabsTrigger>
                <TabsTrigger value="validation" className="text-xs">Validate</TabsTrigger>
                <TabsTrigger value="batch" className="text-xs">Batch</TabsTrigger>
                <TabsTrigger value="files" className="text-xs">Files</TabsTrigger>
              </TabsList>

              <div className="flex-1 overflow-hidden">
                <TabsContent value="progress" className="h-full m-0">
                  <ProgressPanel
                    job={job}
                    processingStatus={processingStatus as any}
                  />
                </TabsContent>

                <TabsContent value="validation" className="h-full m-0">
                  <ValidationPanel
                    job={job}
                    textureFiles={textureFiles as any}
                  />
                </TabsContent>

                <TabsContent value="batch" className="h-full m-0">
                  <BatchPanel
                    jobs={jobs || []}
                    onJobSelect={(jobId) => setActiveJob(jobId)}
                    activeJob={activeJob}
                  />
                </TabsContent>

                <TabsContent value="files" className="h-full m-0">
                  <FilesPanel
                    selectedJob={job || null}
                    validationResults={validationResults}
                    isValidating={isValidating}
                  />
                </TabsContent>
              </div>
            </Tabs>

            {/* Favorites Quick Access */}
            <div className="border-t border-border/40 p-4">
              <FavoritesPanel 
                onNavigateToSection={(sectionId) => setMainView(sectionId as any)} 
                currentSection={mainView} 
              />
            </div>
          </div>
        )}
      </div>
    </div>
    </SettingsProvider>
  );
}