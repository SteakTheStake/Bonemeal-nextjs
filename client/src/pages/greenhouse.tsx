import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearch } from "wouter";
import { Box, HelpCircle, Settings, Plus, FolderOpen, Sparkles, Brush, Package, Zap, Home, Leaf } from "lucide-react";
import { useDeviceType } from "@/hooks/useDeviceType";
import MobileNotice from "@/components/mobile-notice";
import { Button } from "@/components/ui/button";
import { UploadZone } from "@/components/upload-zone";
import { TexturePreview } from "@/components/texture-preview";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type ConversionJob } from "@shared/schema";
import bonemeaLogo from "@assets/SkyBlock_items_enchanted_bonemeal_1752287919002.gif";

export default function Greenhouse() {
  const { isMobile } = useDeviceType();
  const searchParams = useSearch();
  const projectId = searchParams ? parseInt(searchParams.replace('?project=', '')) : undefined;
  const [activeJob, setActiveJob] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("progress");
  const [validationResults, setValidationResults] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [mainView, setMainView] = useState<'convert' | 'dashboard' | 'editor' | 'ai' | 'templates' | 'batch' | 'quality'>('convert');

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

  // Full navigation for desktop
  const desktopNavigationItems = [
    { key: 'convert', label: 'Convert', icon: Zap, description: 'Upload & convert textures' },
    { key: 'dashboard', label: 'Projects', icon: FolderOpen, description: 'Manage your projects' },
    { key: 'editor', label: 'Editor', icon: Brush, description: 'Visual texture editing' },
    { key: 'ai', label: 'AI Generate', icon: Sparkles, description: 'AI-powered generation' },
    { key: 'templates', label: 'Templates', icon: Package, description: 'Material templates' },
    { key: 'batch', label: 'Batch', icon: Box, description: 'Bulk processing' },
    { key: 'quality', label: 'Quality', icon: Settings, description: 'Texture quality analysis' },
  ];

  // Simplified navigation for mobile - focused on viewing
  const mobileNavigationItems = [
    { key: 'dashboard', label: 'Projects', icon: FolderOpen, description: 'View your projects' },
    { key: 'quality', label: 'Quality', icon: Settings, description: 'Texture analysis' },
  ];

  const navigationItems = isMobile ? mobileNavigationItems : desktopNavigationItems;

  // Override default view for mobile to focus on projects
  useEffect(() => {
    if (isMobile && mainView === 'convert') {
      setMainView('dashboard');
    }
  }, [isMobile, mainView]);

  return (
    <div className="h-screen flex flex-col bg-background text-foreground organic-bg vine-texture transition-colors duration-300">
      {/* Top Menu Bar */}
      <header className="glass-card moss-texture border-b living-border px-4 py-2 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <img 
              src={bonemeaLogo} 
              alt="Bonemeal" 
              className="w-6 h-6 floating" 
              style={{ imageRendering: 'pixelated' }}
            />
            <span className="text-lg font-semibold text-primary">Greenhouse</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <Leaf className="w-3 h-3" />
            <span>Where textures grow and flourish</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Link href="/projects">
            <Button variant="outline" size="sm" className="glass-card">
              <FolderOpen className="w-4 h-4 mr-2" />
              Projects
            </Button>
          </Link>
          <Link href="/">
            <Button variant="outline" size="sm" className="glass-card">
              <Home className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Navigation */}
      <div className="border-b border-border/40 bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="flex items-center space-x-1 py-2">
            {navigationItems.map(({ key, label, icon: Icon, description }) => (
              <Button
                key={key}
                variant={mainView === key ? "default" : "ghost"}
                size="sm"
                onClick={() => setMainView(key as any)}
                className={`flex items-center space-x-2 transition-all duration-200 ${
                  mainView === key 
                    ? "bg-primary/20 text-primary border border-primary/30" 
                    : "hover:bg-accent/10 text-muted-foreground hover:text-foreground"
                }`}
                title={description}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{label}</span>
              </Button>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile Notice */}
      {isMobile && (
        <div className="px-4 py-2 bg-amber-50/5 dark:bg-amber-900/10">
          <MobileNotice 
            feature="advanced texture processing tools" 
            showDesktopButton={false}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar - Favorites Panel */}
        {!isMobile && (
          <div className="w-64 border-r border-border/40 bg-background/60 backdrop-blur-sm">
            <div className="p-4 h-full overflow-auto">
              <div className="space-y-6">
                <FavoritesPanel 
                  onNavigateToSection={setMainView} 
                  currentSection={mainView} 
                />
                <PresetsManager />
              </div>
            </div>
          </div>
        )}

        {/* Main View */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {mainView === 'convert' && !isMobile && (
            <div className="flex-1 p-4 overflow-auto">
              <div className="max-w-4xl mx-auto space-y-6">
                <div className="text-center space-y-2">
                  <h1 className="text-2xl font-bold text-foreground">Texture Converter</h1>
                  <p className="text-muted-foreground">Transform your textures into LabPBR format</p>
                </div>
                
                <UploadZone
                  onJobCreated={(jobId) => setActiveJob(jobId)}
                  onValidationStart={() => setIsValidating(true)}
                  onValidationComplete={(results) => {
                    setValidationResults(results);
                    setIsValidating(false);
                  }}
                  onValidationError={() => setIsValidating(false)}
                />

                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="glass-card p-4">
                      <ConversionSettings onJobCreated={(jobId) => setActiveJob(jobId)} />
                    </div>
                    <div className="glass-card p-4">
                      <AdvancedProcessing onJobCreated={(jobId) => setActiveJob(jobId)} />
                    </div>
                  </div>
                  <AdvancedInterpolation onSettingsChange={(settings) => console.log('Advanced settings:', settings)} />
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
        </div>

        {/* Right Panel - Progress & Tools */}
        {!isMobile && (
          <div className="w-80 border-l border-border/40 bg-background/60 backdrop-blur-sm flex flex-col">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-4 m-2">
              <TabsTrigger value="progress" className="text-xs">
                Progress
              </TabsTrigger>
              <TabsTrigger value="validation" className="text-xs">
                Validate
              </TabsTrigger>
              <TabsTrigger value="batch" className="text-xs">
                Batch
              </TabsTrigger>
              <TabsTrigger value="files" className="text-xs">
                Files
              </TabsTrigger>
            </TabsList>

            <div className="flex-1 overflow-hidden">
              <TabsContent value="progress" className="h-full m-0">
                <div className="h-full">
                  <ProgressPanel
                    job={job}
                    processingStatus={processingStatus as any}
                  />
                </div>
              </TabsContent>

              <TabsContent value="validation" className="h-full m-0">
                <div className="h-full">
                  <ValidationPanel
                    job={job}
                    textureFiles={textureFiles as any}
                  />
                </div>
              </TabsContent>

              <TabsContent value="batch" className="h-full m-0">
                <div className="h-full">
                  <BatchPanel
                    jobs={jobs || []}
                    onJobSelect={(jobId) => setActiveJob(jobId)}
                    activeJob={activeJob}
                  />
                </div>
              </TabsContent>

              <TabsContent value="files" className="h-full m-0">
                <div className="h-full">
                  <FilesPanel
                    selectedJob={job || null}
                    validationResults={validationResults}
                    isValidating={isValidating}
                  />
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>
        )}
      </div>
    </div>
  );
}