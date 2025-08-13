import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { 
  Upload, Settings, Eye, FolderOpen, Sparkles, Brush, Package, 
  Zap, Home, ChevronLeft, ChevronRight, Menu, X, Play, Pause,
  CheckCircle, AlertCircle, Clock, ArrowUp, ArrowDown, User
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
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
import { TexturePreview } from "@/components/texture-preview";
import { UploadedContent } from "@/components/uploaded-content";
import MobileHome from "@/components/mobile-home";
import AuthTooltip, { MobileAuthNotification } from "@/components/auth-tooltip";
import { useAuth } from "@/hooks/useAuth";
import { type ConversionJob } from "@shared/schema";
import bonemeaLogo from "@assets/SkyBlock_items_enchanted_bonemeal_1752287919002.gif";

interface MobileLayoutProps {
  children?: React.ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  const [location, setLocation] = useLocation();
  const { user, isLoading } = useAuth();
  const [activeJob, setActiveJob] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [previewTexture, setPreviewTexture] = useState<{url: string, name: string, type: string} | null>(null);

  const { data: jobs } = useQuery<ConversionJob[]>({
    queryKey: ["/api/jobs"],
    refetchInterval: 1000,
  });

  const { data: job } = useQuery<ConversionJob>({
    queryKey: ["/api/jobs", activeJob],
    enabled: !!activeJob,
    refetchInterval: 1000,
  });

  useEffect(() => {
    if (jobs && jobs.length > 0 && !activeJob) {
      setActiveJob(jobs[0].id);
    }
  }, [jobs, activeJob]);

  const steps = [
    { 
      key: 'upload', 
      title: 'Upload', 
      icon: Upload, 
      description: 'Choose your textures',
      component: <UploadZone onJobCreated={setActiveJob} />
    },
    { 
      key: 'settings', 
      title: 'Settings', 
      icon: Settings, 
      description: 'Configure conversion',
      component: <ConversionSettings onJobCreated={setActiveJob} />
    },
    { 
      key: 'advanced', 
      title: 'Advanced', 
      icon: Zap, 
      description: 'Fine-tune processing',
      component: <AdvancedProcessing onJobCreated={setActiveJob} />
    },
    { 
      key: 'preview', 
      title: 'Preview', 
      icon: Eye, 
      description: 'Review results',
      component: <TexturePreview 
        imageUrl={previewTexture?.url}
        imageName={previewTexture?.name}
        imageType={previewTexture?.type as any}
        onClose={() => setPreviewTexture(null)} 
      />
    }
  ];

  const navigationItems = [
    { key: 'convert', path: '/greenhouse', label: 'Convert', icon: Zap, description: 'Upload & convert textures' },
    { key: 'projects', path: '/projects', label: 'Projects', icon: FolderOpen, description: 'Manage projects' },
    { key: 'library', path: '/greenhouse?view=library', label: 'Library', icon: Package, description: 'Your content' },
    { key: 'editor', path: '/greenhouse?view=editor', label: 'Editor', icon: Brush, description: 'Visual editing' },
    { key: 'ai', path: '/greenhouse?view=ai', label: 'AI Tools', icon: Sparkles, description: 'AI generation' },
  ];

  const getCurrentStep = () => steps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === steps.length - 1;

  const nextStep = () => {
    if (!isLastStep) setCurrentStep(prev => prev + 1);
  };

  const prevStep = () => {
    if (!isFirstStep) setCurrentStep(prev => prev - 1);
  };

  const goToStep = (index: number) => {
    setCurrentStep(index);
  };

  return (
    <div className="min-h-screen bg-background text-foreground organic-bg flex flex-col mobile-safe-area">
      {/* Mobile Header */}
      <header className="mobile-glass border-b living-border px-4 py-3 flex items-center justify-between sticky top-0 z-50 mobile-landscape-header">
        <div className="flex items-center gap-3">
          <img 
            src={bonemeaLogo} 
            alt="Bonemeal" 
            className="w-8 h-8 floating" 
            style={{ imageRendering: 'pixelated' }}
          />
          <div>
            <h1 className="text-lg font-bold text-primary">Bonemeal</h1>
            <p className="text-xs text-muted-foreground">
              {user ? `Welcome, ${(user as any).username}` : 'Mobile Texture Lab'}
            </p>
          </div>
        </div>
        
        <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="sm" className="p-2">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80 glass-card">
            <SheetHeader>
              <SheetTitle className="flex items-center gap-2">
                <img src={bonemeaLogo} alt="" className="w-5 h-5" style={{ imageRendering: 'pixelated' }} />
                Navigation
              </SheetTitle>
            </SheetHeader>
            <div className="mt-6 space-y-4">
              {navigationItems.map(({ key, path, label, icon: Icon, description }) => (
                <Button
                  key={key}
                  variant={location === path ? "default" : "ghost"}
                  className="w-full justify-start gap-3 h-12"
                  onClick={() => {
                    setLocation(path);
                    setIsMenuOpen(false);
                  }}
                >
                  <Icon className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">{label}</div>
                    <div className="text-xs text-muted-foreground">{description}</div>
                  </div>
                </Button>
              ))}
              <hr className="border-border/40" />
              <Link href="/">
                <Button variant="outline" className="w-full justify-start gap-3 h-12">
                  <Home className="w-5 h-5" />
                  <div className="text-left">
                    <div className="font-medium">Home</div>
                    <div className="text-xs text-muted-foreground">Back to main site</div>
                  </div>
                </Button>
              </Link>
              
              {user ? (
                <a href="/api/auth/logout">
                  <Button variant="outline" className="w-full justify-start gap-3 h-12 text-red-500 hover:text-red-600">
                    <X className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium">Logout</div>
                      <div className="text-xs text-muted-foreground">Sign out of account</div>
                    </div>
                  </Button>
                </a>
              ) : (
                <Link href="/login">
                  <Button className="w-full justify-start gap-3 h-12 moss-texture">
                    <User className="w-5 h-5" />
                    <div className="text-left">
                      <div className="font-medium">Login</div>
                      <div className="text-xs text-muted-foreground">Access all features</div>
                    </div>
                  </Button>
                </Link>
              )}
            </div>
          </SheetContent>
        </Sheet>
      </header>

      {/* Step Progress Indicator */}
      {location === '/greenhouse' && (
        <div className="glass-card border-b border-border/40 px-4 py-3">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-foreground">Texture Conversion</h2>
            <Badge variant="outline" className="text-xs">
              Step {currentStep + 1} of {steps.length}
            </Badge>
          </div>
          
          {/* Step Dots */}
          <div className="flex items-center gap-2 mb-3">
            {steps.map((step, index) => (
              <button
                key={step.key}
                onClick={() => goToStep(index)}
                className={`flex-1 h-2 rounded-full transition-all duration-300 ${
                  index <= currentStep 
                    ? 'bg-primary' 
                    : index === currentStep + 1 
                      ? 'bg-primary/30' 
                      : 'bg-border/40'
                }`}
              />
            ))}
          </div>
          
          {/* Current Step Info */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {(() => {
                const StepIcon = steps[currentStep].icon;
                return <StepIcon className="w-4 h-4 text-primary" />;
              })()}
              <span className="text-sm font-medium">{steps[currentStep].title}</span>
            </div>
            <p className="text-xs text-muted-foreground">{steps[currentStep].description}</p>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 overflow-hidden">
        {location === '/' ? (
          <MobileHome />
        ) : location === '/greenhouse' ? (
          <div className="h-full flex flex-col">
            {/* Step Content */}
            <div className="flex-1 overflow-y-auto p-4 mobile-scroll">
              <div className="max-w-lg mx-auto pb-20">
                {steps[currentStep].component}
              </div>
            </div>

            {/* Step Navigation */}
            <div className="mobile-glass border-t border-border/40 p-4 flex items-center justify-between mobile-safe-area">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={isFirstStep}
                className="flex items-center gap-2"
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              
              <div className="flex items-center gap-2">
                {job?.status && (
                  <div className="flex items-center gap-1">
                    {job.status === 'completed' && <CheckCircle className="w-4 h-4 text-green-500" />}
                    {job.status === 'processing' && <Clock className="w-4 h-4 text-yellow-500" />}
                    {job.status === 'failed' && <AlertCircle className="w-4 h-4 text-red-500" />}
                    <span className="text-xs text-muted-foreground capitalize">{job.status}</span>
                  </div>
                )}
              </div>
              
              <Button
                onClick={nextStep}
                disabled={isLastStep}
                className="flex items-center gap-2 moss-texture"
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        ) : (
          children
        )}
        
        {/* Mobile Auth Notification */}
        <MobileAuthNotification />
      </main>

      {/* Bottom Tab Bar for Quick Access */}
      <nav className="mobile-glass border-t living-border px-2 py-2 flex items-center justify-around mobile-safe-area">
        {navigationItems.slice(0, 5).map(({ key, path, icon: Icon }) => (
          <Button
            key={key}
            variant="ghost"
            size="sm"
            className={`flex flex-col items-center gap-1 p-2 min-w-0 ${
              location === path ? 'text-primary' : 'text-muted-foreground'
            }`}
            onClick={() => setLocation(path)}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs">{key === 'convert' ? 'Convert' : key}</span>
          </Button>
        ))}
      </nav>

      {/* Floating Action Button for Quick Upload */}
      {location === '/greenhouse' && currentStep === 0 && (
        <div className="mobile-floating right-4">
          <AuthTooltip message="Login to save your converted textures and access advanced features">
            <Button
              size="lg"
              className="rounded-full w-14 h-14 moss-texture floating"
              onClick={() => {
                if (user) {
                  // Trigger upload zone focus
                  const uploadInput = document.querySelector('input[type="file"]') as HTMLElement;
                  uploadInput?.click();
                }
              }}
            >
              <Upload className="w-6 h-6" />
            </Button>
          </AuthTooltip>
        </div>
      )}

      {/* Active Job Status Card */}
      {job && (
        <div className="mobile-floating left-4 right-20">
          <Card className="mobile-glass border border-primary/30 mobile-card">
            <CardContent className="p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {job.status === 'processing' && <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse" />}
                  {job.status === 'completed' && <div className="w-2 h-2 bg-green-500 rounded-full" />}
                  {job.status === 'failed' && <div className="w-2 h-2 bg-red-500 rounded-full" />}
                  <span className="text-sm font-medium">Job #{job.id}</span>
                </div>
                <Badge variant="outline" className="text-xs capitalize">{job.status}</Badge>
              </div>
              {job.status === 'processing' && (
                <Progress value={75} className="h-1" />
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}