import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { ArrowLeft, Share2, Download, Upload, Settings, Eye, Edit } from "lucide-react";
import { useDeviceType } from "@/hooks/useDeviceType";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/useAuth";
import DiscordIntegration from "@/components/discord-integration";
import MobileDiscordShare from "@/components/mobile-discord-share";
import type { Project } from "@shared/schema";

export default function ProjectDetail() {
  const { user } = useAuth();
  const { isMobile } = useDeviceType();
  const [match, params] = useRoute('/projects/:id');
  
  const projectId = params?.id ? parseInt(params.id) : null;

  // Fetch project details
  const { data: project, isLoading, error } = useQuery<Project>({
    queryKey: ['/api/projects', projectId],
    enabled: !!projectId,
  });

  if (!match || !projectId) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold text-destructive mb-4">Invalid Project ID</h1>
        <Link href="/projects">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
        </Link>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-4">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/3"></div>
          <div className="h-32 bg-muted rounded"></div>
          <div className="h-64 bg-muted rounded"></div>
        </div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="container mx-auto p-4 text-center">
        <h1 className="text-2xl font-bold text-destructive mb-4">Project Not Found</h1>
        <p className="text-muted-foreground mb-4">
          The project you're looking for doesn't exist or you don't have access to it.
        </p>
        <Link href="/projects">
          <Button variant="outline">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Projects
          </Button>
        </Link>
      </div>
    );
  }

  if (isMobile) {
    return (
      <div className="space-y-4">
        {/* Mobile Header */}
        <div className="flex items-center gap-3 p-4 border-b">
          <Link href="/projects">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4" />
            </Button>
          </Link>
          <div className="flex-1">
            <h1 className="font-bold text-lg">{project.name}</h1>
            <p className="text-xs text-muted-foreground">{project.description}</p>
          </div>
          <Badge variant="outline" className="text-xs">
            {project.status}
          </Badge>
        </div>

        {/* Mobile Content */}
        <div className="px-4 space-y-4">
          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <Button variant="outline" size="sm" className="h-12">
              <Upload className="w-4 h-4 mb-1" />
              <span className="text-xs">Upload</span>
            </Button>
            <Button variant="outline" size="sm" className="h-12">
              <Download className="w-4 h-4 mb-1" />
              <span className="text-xs">Download</span>
            </Button>
          </div>

          {/* Discord Sharing - Mobile */}
          {user && <MobileDiscordShare project={project} />}

          {/* Project Stats */}
          <Card className="mobile-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Project Overview</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-lg font-bold text-primary">
                    {project.textureCount || 0}
                  </div>
                  <div className="text-xs text-muted-foreground">Textures</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-primary">
                    {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}
                  </div>
                  <div className="text-xs text-muted-foreground">Created</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity - Mobile */}
          <Card className="mobile-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-base">Recent Activity</CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Project created</span>
                  <span className="text-xs text-muted-foreground ml-auto">
                    {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-sm opacity-50">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span>No recent activity</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Desktop Layout
  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Desktop Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/projects">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Projects
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">{project.name}</h1>
            <p className="text-muted-foreground">{project.description}</p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Badge variant="outline">{project.status}</Badge>
          <Button variant="outline">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </Button>
          <Button className="moss-texture">
            <Download className="w-4 h-4 mr-2" />
            Download Pack
          </Button>
        </div>
      </div>

      {/* Desktop Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList>
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="textures">Textures</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>

            <TabsContent value="overview">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Project Stats</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span>Total Textures</span>
                        <span className="font-bold">{project.textureCount || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Created</span>
                        <span>{project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Last Updated</span>
                        <span>{project.updatedAt ? new Date(project.updatedAt).toLocaleDateString() : 'N/A'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Status</span>
                        <Badge variant="outline">{project.status}</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-sm">Project created</span>
                        <span className="text-xs text-muted-foreground ml-auto">
                          {project.createdAt ? new Date(project.createdAt).toLocaleDateString() : 'N/A'}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 opacity-50">
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                        <span className="text-sm">No recent activity</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>

            <TabsContent value="textures">
              <Card>
                <CardHeader>
                  <CardTitle>Texture Management</CardTitle>
                  <CardDescription>
                    Upload, organize, and convert your texture files
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-12">
                    <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-medium mb-2">No Textures Yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Upload your first texture files to get started
                    </p>
                    <Button className="moss-texture">
                      <Upload className="w-4 h-4 mr-2" />
                      Upload Textures
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="settings">
              <Card>
                <CardHeader>
                  <CardTitle>Project Settings</CardTitle>
                  <CardDescription>
                    Configure your project preferences and options
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-medium mb-2">Export Settings</h4>
                      <div className="space-y-2">
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked />
                          <span className="text-sm">Include normal maps</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" defaultChecked />
                          <span className="text-sm">Include specular maps</span>
                        </label>
                        <label className="flex items-center space-x-2">
                          <input type="checkbox" />
                          <span className="text-sm">Generate heightmaps</span>
                        </label>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                <Upload className="w-4 h-4 mr-2" />
                Upload Textures
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Download className="w-4 h-4 mr-2" />
                Download Pack
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Share2 className="w-4 h-4 mr-2" />
                Share Project
              </Button>
            </CardContent>
          </Card>

          {/* Discord Integration - Desktop */}
          {user && <DiscordIntegration project={project} />}
        </div>
      </div>
    </div>
  );
}