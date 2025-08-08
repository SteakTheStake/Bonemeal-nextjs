import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  FolderOpen, 
  Calendar, 
  FileText, 
  Settings, 
  CheckCircle,
  Clock,
  AlertTriangle,
  Eye,
  BarChart3,
  Grid3X3,
  List,
  FileImage,
  Folder,
  ChevronRight,
  Home,
  AlertCircle,
  Info,
  XCircle,
  TrendingUp,
  Activity,
  Database,
  Image as ImageIcon,
  Search,
  Filter,
  Download,
  Upload,
  Layers,
  Zap
} from "lucide-react";
import { type Project, type ConversionJob } from "@shared/schema";
import { format } from "date-fns";

interface ProjectFile {
  id: string;
  name: string;
  path: string;
  type: 'texture' | 'pack' | 'folder';
  size: number;
  lastModified: Date;
  status: 'pending' | 'processing' | 'completed' | 'error';
  preview?: string;
  errorMessage?: string;
  validationScore?: number;
}

interface ValidationIssue {
  id: string;
  level: 'error' | 'warning' | 'info';
  message: string;
  file: string;
  line?: number;
  suggestion?: string;
}

interface ProjectStats {
  totalFiles: number;
  completedFiles: number;
  errorFiles: number;
  processingFiles: number;
  totalSize: string;
  averageScore: number;
  lastActivity: Date;
}

export default function EnhancedProjectDashboard({ projectId }: { projectId?: number }) {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [currentPath, setCurrentPath] = useState('/');
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  // Mock data - replace with real API calls
  const mockProject: Project = {
    id: 1,
    name: "Medieval Resource Pack",
    description: "Complete medieval themed texture pack with LabPBR support",
    createdAt: new Date('2024-01-15'),
    updatedAt: new Date(),
    userId: "user123"
  };

  const mockFiles: ProjectFile[] = [
    {
      id: "1",
      name: "textures",
      path: "/textures",
      type: "folder",
      size: 0,
      lastModified: new Date(),
      status: "completed"
    },
    {
      id: "2", 
      name: "stone.png",
      path: "/textures/blocks/stone.png",
      type: "texture",
      size: 45678,
      lastModified: new Date(),
      status: "completed",
      preview: "/api/placeholder/64/64",
      validationScore: 92
    },
    {
      id: "3",
      name: "stone_s.png", 
      path: "/textures/blocks/stone_s.png",
      type: "texture",
      size: 34567,
      lastModified: new Date(),
      status: "error",
      errorMessage: "Invalid specular channel format",
      validationScore: 45
    },
    {
      id: "4",
      name: "wood.png",
      path: "/textures/blocks/wood.png", 
      type: "texture",
      size: 67890,
      lastModified: new Date(),
      status: "processing",
      validationScore: 78
    }
  ];

  const mockIssues: ValidationIssue[] = [
    {
      id: "1",
      level: "error",
      message: "Specular map has invalid metallic channel values",
      file: "stone_s.png",
      line: 1,
      suggestion: "Use only 0 or 255 values for metallic channel (green)"
    },
    {
      id: "2", 
      level: "warning",
      message: "Texture resolution is not power of 2",
      file: "dirt.png",
      suggestion: "Resize to 64x64, 128x128, or 256x256 for optimal performance"
    },
    {
      id: "3",
      level: "info", 
      message: "Normal map uses DirectX format",
      file: "stone_n.png",
      suggestion: "Consider converting to OpenGL format for broader compatibility"
    }
  ];

  const mockStats: ProjectStats = {
    totalFiles: 156,
    completedFiles: 142,
    errorFiles: 8,
    processingFiles: 6,
    totalSize: "23.4 MB",
    averageScore: 87,
    lastActivity: new Date()
  };

  const breadcrumbPaths = currentPath.split('/').filter(Boolean);

  const filteredFiles = mockFiles.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'processing': return <Clock className="h-4 w-4 text-blue-400 animate-spin" />;
      case 'error': return <XCircle className="h-4 w-4 text-red-400" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getIssueIcon = (level: string) => {
    switch (level) {
      case 'error': return <XCircle className="h-4 w-4 text-red-400" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'info': return <Info className="h-4 w-4 text-blue-400" />;
      default: return <Info className="h-4 w-4 text-gray-400" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Project Header */}
      <Card className="glass-card">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-xl">
                <FolderOpen className="h-6 w-6 text-primary" />
                {mockProject.name}
              </CardTitle>
              <CardDescription className="mt-2">
                {mockProject.description}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Upload className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Statistics Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Database className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-muted-foreground">Total Files</span>
            </div>
            <div className="text-2xl font-bold text-foreground">{mockStats.totalFiles}</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="h-4 w-4 text-green-400" />
              <span className="text-sm text-muted-foreground">Completed</span>
            </div>
            <div className="text-2xl font-bold text-green-400">{mockStats.completedFiles}</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <XCircle className="h-4 w-4 text-red-400" />
              <span className="text-sm text-muted-foreground">Errors</span>
            </div>
            <div className="text-2xl font-bold text-red-400">{mockStats.errorFiles}</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-4 w-4 text-blue-400" />
              <span className="text-sm text-muted-foreground">Processing</span>
            </div>
            <div className="text-2xl font-bold text-blue-400">{mockStats.processingFiles}</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <TrendingUp className="h-4 w-4 text-purple-400" />
              <span className="text-sm text-muted-foreground">Avg Score</span>
            </div>
            <div className="text-2xl font-bold text-purple-400">{mockStats.averageScore}%</div>
          </CardContent>
        </Card>
        <Card className="glass-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-1">
              <Activity className="h-4 w-4 text-orange-400" />
              <span className="text-sm text-muted-foreground">Total Size</span>
            </div>
            <div className="text-2xl font-bold text-orange-400">{mockStats.totalSize}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="files" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="files" className="flex items-center gap-2">
            <FileImage className="h-4 w-4" />
            Files
          </TabsTrigger>
          <TabsTrigger value="errors" className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Issues
          </TabsTrigger>
          <TabsTrigger value="analytics" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Analytics
          </TabsTrigger>
          <TabsTrigger value="processing" className="flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Processing
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            History
          </TabsTrigger>
        </TabsList>

        {/* Files Tab */}
        <TabsContent value="files" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                  {/* Breadcrumb Navigation */}
                  <div className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setCurrentPath('/')}
                      className="h-6 px-2"
                    >
                      <Home className="h-3 w-3" />
                    </Button>
                    {breadcrumbPaths.map((path, index) => (
                      <div key={index} className="flex items-center gap-1">
                        <ChevronRight className="h-3 w-3" />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCurrentPath('/' + breadcrumbPaths.slice(0, index + 1).join('/'))}
                          className="h-6 px-2 text-foreground hover:text-primary"
                        >
                          {path}
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <Search className="h-4 w-4 absolute left-2 top-2.5 text-muted-foreground" />
                    <Input
                      placeholder="Search files..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-8 w-48"
                    />
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                  >
                    {viewMode === 'grid' ? <List className="h-4 w-4" /> : <Grid3X3 className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {viewMode === 'grid' ? (
                  <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                    {filteredFiles.map((file) => (
                      <Card
                        key={file.id}
                        className={`cursor-pointer transition-all hover:scale-105 ${
                          selectedFile?.id === file.id ? 'ring-2 ring-primary' : ''
                        }`}
                        onClick={() => setSelectedFile(file)}
                      >
                        <CardContent className="p-3">
                          <div className="aspect-square mb-2 bg-muted rounded flex items-center justify-center">
                            {file.type === 'folder' ? (
                              <Folder className="h-8 w-8 text-blue-400" />
                            ) : file.preview ? (
                              <img src={file.preview} alt={file.name} className="w-full h-full object-cover rounded" />
                            ) : (
                              <FileImage className="h-8 w-8 text-muted-foreground" />
                            )}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-1">
                              {getStatusIcon(file.status)}
                              <span className="text-xs font-medium truncate">{file.name}</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {formatFileSize(file.size)}
                            </div>
                            {file.validationScore && (
                              <div className="text-xs">
                                <Progress value={file.validationScore} className="h-1" />
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-2">
                    {filteredFiles.map((file) => (
                      <Card
                        key={file.id}
                        className={`cursor-pointer transition-colors hover:bg-accent/50 ${
                          selectedFile?.id === file.id ? 'bg-accent' : ''
                        }`}
                        onClick={() => setSelectedFile(file)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-muted rounded flex items-center justify-center">
                              {file.type === 'folder' ? (
                                <Folder className="h-4 w-4 text-blue-400" />
                              ) : (
                                <FileImage className="h-4 w-4 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                {getStatusIcon(file.status)}
                                <span className="font-medium truncate">{file.name}</span>
                                {file.errorMessage && (
                                  <Badge variant="destructive" className="text-xs">Error</Badge>
                                )}
                              </div>
                              <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                                <span>{formatFileSize(file.size)}</span>
                                <span>{format(file.lastModified, 'MMM d, yyyy')}</span>
                                {file.validationScore && (
                                  <span>Score: {file.validationScore}%</span>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Issues Tab */}
        <TabsContent value="errors" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-400" />
                Validation Issues
              </CardTitle>
              <CardDescription>
                Review and resolve validation errors, warnings, and information messages
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-3">
                  {mockIssues.map((issue) => (
                    <Card key={issue.id} className="border-l-4 border-l-red-500">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          {getIssueIcon(issue.level)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                              <Badge
                                variant={
                                  issue.level === 'error' ? 'destructive' :
                                  issue.level === 'warning' ? 'default' : 'secondary'
                                }
                                className="text-xs"
                              >
                                {issue.level.toUpperCase()}
                              </Badge>
                              <span className="text-sm font-medium text-primary">{issue.file}</span>
                            </div>
                            <p className="text-sm text-foreground mb-2">{issue.message}</p>
                            {issue.suggestion && (
                              <p className="text-xs text-muted-foreground">{issue.suggestion}</p>
                            )}
                          </div>
                          <Button variant="outline" size="sm">
                            <Eye className="h-3 w-3 mr-1" />
                            View
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">File Status Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-400" />
                      Completed
                    </span>
                    <span className="text-sm font-medium">{mockStats.completedFiles}</span>
                  </div>
                  <Progress value={(mockStats.completedFiles / mockStats.totalFiles) * 100} className="h-2" />
                  
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-2">
                      <XCircle className="h-4 w-4 text-red-400" />
                      Errors
                    </span>
                    <span className="text-sm font-medium">{mockStats.errorFiles}</span>
                  </div>
                  <Progress 
                    value={(mockStats.errorFiles / mockStats.totalFiles) * 100} 
                    className="h-2" 
                  />
                </div>
              </CardContent>
            </Card>

            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="text-lg">Quality Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm">Average Quality Score</span>
                      <span className="text-sm font-medium">{mockStats.averageScore}%</span>
                    </div>
                    <Progress value={mockStats.averageScore} className="h-2" />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Best Score</span>
                      <p className="font-medium text-green-400">98%</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Needs Work</span>
                      <p className="font-medium text-red-400">3 files</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Processing Tab */}
        <TabsContent value="processing" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-blue-400" />
                Active Processing Jobs
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockFiles.filter(f => f.status === 'processing').map((file) => (
                  <Card key={file.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{file.name}</span>
                        <Badge variant="secondary">Converting</Badge>
                      </div>
                      <Progress value={65} className="h-2" />
                      <p className="text-xs text-muted-foreground mt-2">
                        Processing LabPBR conversion...
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-4">
          <Card className="glass-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-purple-400" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {[
                    { action: "Converted stone_s.png to LabPBR format", time: "2 minutes ago", status: "success" },
                    { action: "Upload completed: medieval_pack.zip", time: "15 minutes ago", status: "success" },
                    { action: "Validation failed for dirt_n.png", time: "1 hour ago", status: "error" },
                    { action: "Project created", time: "2 days ago", status: "info" }
                  ].map((activity, index) => (
                    <div key={index} className="flex items-center gap-3 pb-3 border-b border-border/40 last:border-0">
                      <div className={`w-2 h-2 rounded-full ${
                        activity.status === 'success' ? 'bg-green-400' :
                        activity.status === 'error' ? 'bg-red-400' : 'bg-blue-400'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm text-foreground">{activity.action}</p>
                        <p className="text-xs text-muted-foreground">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* File Detail Panel */}
      {selectedFile && (
        <Card className="glass-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileImage className="h-5 w-5" />
              {selectedFile.name}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">File Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Path:</span>
                      <span className="font-mono text-xs">{selectedFile.path}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Size:</span>
                      <span>{formatFileSize(selectedFile.size)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Status:</span>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(selectedFile.status)}
                        <span className="capitalize">{selectedFile.status}</span>
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Modified:</span>
                      <span>{format(selectedFile.lastModified, 'MMM d, yyyy HH:mm')}</span>
                    </div>
                  </div>
                </div>
                
                {selectedFile.validationScore && (
                  <div>
                    <h4 className="font-medium mb-2">Quality Score</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Overall Score</span>
                        <span className="font-medium">{selectedFile.validationScore}%</span>
                      </div>
                      <Progress value={selectedFile.validationScore} className="h-2" />
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-4">
                {selectedFile.preview && (
                  <div>
                    <h4 className="font-medium mb-2">Preview</h4>
                    <div className="aspect-square bg-muted rounded-lg flex items-center justify-center">
                      <img 
                        src={selectedFile.preview} 
                        alt={selectedFile.name}
                        className="max-w-full max-h-full object-contain rounded"
                      />
                    </div>
                  </div>
                )}
                
                {selectedFile.errorMessage && (
                  <div>
                    <h4 className="font-medium mb-2 text-red-400">Error Details</h4>
                    <Card className="border-red-500/20 bg-red-500/10">
                      <CardContent className="p-3">
                        <p className="text-sm text-red-300">{selectedFile.errorMessage}</p>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}