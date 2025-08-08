import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useSearch } from "wouter";
import { Box, HelpCircle, Settings, Plus, FolderOpen, Sparkles, Brush, Package, Zap, Home } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadZone } from "@/components/upload-zone";
import { TexturePreview } from "@/components/texture-preview";
import { ConversionSettings } from "@/components/conversion-settings";
import { AdvancedProcessing } from "@/components/advanced-processing";
import { ProgressPanel } from "@/components/progress-panel";
import { ValidationPanel } from "@/components/validation-panel";
import { BatchPanel } from "@/components/batch-panel";
import { FilesPanel } from "@/components/files-panel";
import ProjectDashboard from "@/components/project-dashboard";
import TextureEditor from "@/components/texture-editor";
import AITextureGenerator from "@/components/ai-texture-generator";
import TemplateLibrary from "@/components/template-library";
import BatchProcessor from "@/components/batch-processor";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { type ConversionJob } from "@shared/schema";
import bonemeaLogo from "@assets/SkyBlock_items_enchanted_bonemeal_1752287919002.gif";

export default function Converter() {
  const searchParams = useSearch();
  const projectId = searchParams ? parseInt(searchParams.replace('?project=', '')) : undefined;
  const [activeJob, setActiveJob] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState("progress");
  const [validationResults, setValidationResults] = useState<any>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [mainView, setMainView] = useState<'convert' | 'dashboard' | 'editor' | 'ai' | 'templates' | 'batch'>('convert');

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

  const { data: textureFiles } = useQuery({
    queryKey: ["/api/jobs", activeJob, "files"],
    enabled: !!activeJob,
    refetchInterval: 5000,
  });

  useEffect(() => {
    if (jobs && jobs.length > 0 && !activeJob) {
      setActiveJob(jobs[0].id);
    }
  }, [jobs, activeJob]);

  return (
    <div className="h-screen flex flex-col bg-background text-foreground organic-bg vine-texture">
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
            <span className="text-lg font-semibold text-primary">Bonemeal</span>
          </div>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <span>v1.3</span>
            <span>•</span>
            <span>LabPBR Converter</span>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" className="text-primary hover:bg-primary/20 grow-button">
            <HelpCircle className="h-4 w-4 mr-1 branch-sway" />
            Help
          </Button>
          <Button variant="ghost" size="sm" className="grow-button">
            <Settings className="h-4 w-4 mr-1 branch-sway" />
            Settings
          </Button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Sidebar */}
        <aside className="w-80 glass-card moss-texture border-r living-border flex flex-col">
          {/* Project Panel */}
          <div className="p-4 border-b living-border">
            <h2 className="text-sm font-medium text-muted-foreground mb-3">🌱 Project</h2>
            <div className="space-y-2">
              <Button className="w-full grow-button moss-texture" size="sm">
                <Plus className="h-4 w-4 mr-2 branch-sway" />
                New Project
              </Button>
              <Button variant="secondary" className="w-full grow-button moss-texture" size="sm">
                <FolderOpen className="h-4 w-4 mr-2 branch-sway" />
                Open Project
              </Button>
            </div>
          </div>

          {/* Settings Tabs */}
          <div className="flex-1 overflow-y-auto">
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-2 m-4 glass-card moss-texture">
                <TabsTrigger value="basic" className="text-xs grow-button">🌿 Basic</TabsTrigger>
                <TabsTrigger value="advanced" className="text-xs grow-button">🔬 Advanced</TabsTrigger>
              </TabsList>
              
              <TabsContent value="basic" className="mt-0">
                <ConversionSettings 
                  onJobCreated={setActiveJob}
                />
              </TabsContent>
              
              <TabsContent value="advanced" className="mt-0">
                <AdvancedProcessing 
                  onJobCreated={setActiveJob}
                />
              </TabsContent>
            </Tabs>
          </div>
        </aside>

        {/* Main Workspace */}
        <main className="flex-1 flex flex-col">
          {!activeJob ? (
            <UploadZone 
              onJobCreated={setActiveJob}
              onValidationStart={() => setIsValidating(true)}
              onValidationComplete={(results) => {
                setValidationResults(results);
                setIsValidating(false);
                setActiveTab("files");
              }}
              onValidationError={() => setIsValidating(false)}
            />
          ) : (
            <TexturePreview 
              job={job}
              textureFiles={textureFiles}
            />
          )}
        </main>

        {/* Right Panel */}
        <aside className="w-80 glass-card moss-texture border-l living-border flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className="grid w-full grid-cols-3 glass-card moss-texture">
              <TabsTrigger value="progress" className="grow-button">🌿 Progress</TabsTrigger>
              <TabsTrigger value="files" className="grow-button">📁 Files</TabsTrigger>
              <TabsTrigger value="batch" className="grow-button">🎯 Batch</TabsTrigger>
            </TabsList>
            
            <TabsContent value="progress" className="flex-1 overflow-y-auto">
              <ProgressPanel 
                job={job}
                processingStatus={processingStatus}
              />
            </TabsContent>
            
            <TabsContent value="files" className="flex-1 overflow-y-auto">
              <FilesPanel 
                selectedJob={job}
                validationResults={validationResults}
                isValidating={isValidating}
              />
            </TabsContent>
            
            <TabsContent value="batch" className="flex-1 overflow-y-auto">
              <BatchPanel 
                jobs={jobs}
                activeJob={activeJob}
                onJobSelect={setActiveJob}
              />
            </TabsContent>
          </Tabs>
        </aside>
      </div>

      {/* Bottom Status Bar */}
      <footer className="surface border-t border-border px-4 py-2 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-success rounded-full"></div>
            <span className="text-muted-foreground">
              {job?.status === 'processing' ? 'Processing...' : 'Ready'}
            </span>
          </div>
          <span className="text-muted-foreground">Memory: 1.2GB / 8.0GB</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-muted-foreground">LabPBR v1.3 Compatible</span>
          <Button variant="ghost" size="sm" className="text-primary hover:text-primary/80">
            <HelpCircle className="h-4 w-4" />
          </Button>
        </div>
      </footer>
    </div>
  );
}
