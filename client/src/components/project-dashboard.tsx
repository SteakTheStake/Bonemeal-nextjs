import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  Calendar,
  Activity,
  FileImage,
  CheckCircle,
  AlertCircle,
  Clock,
  TrendingUp,
  Package,
  Layers,
  BarChart3
} from "lucide-react";

interface TextureItem {
  id: string;
  name: string;
  type: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  preview?: string;
  size: number;
  resolution: string;
  lastModified: Date;
  validationScore: number;
}

interface ProjectStats {
  totalTextures: number;
  completed: number;
  processing: number;
  failed: number;
  averageProcessingTime: number;
  totalSize: number;
}

export default function ProjectDashboard({ projectId }: { projectId?: number }) {
  const [view, setView] = useState<'grid' | 'list' | 'kanban'>('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('name');

  // Mock data - will be replaced with real API calls
  const mockTextures: TextureItem[] = Array.from({ length: 12 }, (_, i) => ({
    id: `texture-${i}`,
    name: `texture_${i + 1}.png`,
    type: ['base', 'normal', 'specular'][i % 3],
    status: ['completed', 'processing', 'pending', 'failed'][i % 4] as any,
    preview: '/api/placeholder/64/64',
    size: Math.floor(Math.random() * 1000) + 100,
    resolution: ['16x16', '32x32', '64x64', '128x128'][i % 4],
    lastModified: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
    validationScore: Math.floor(Math.random() * 30) + 70
  }));

  const stats: ProjectStats = {
    totalTextures: mockTextures.length,
    completed: mockTextures.filter(t => t.status === 'completed').length,
    processing: mockTextures.filter(t => t.status === 'processing').length,
    failed: mockTextures.filter(t => t.status === 'failed').length,
    averageProcessingTime: 2.3,
    totalSize: mockTextures.reduce((sum, t) => sum + t.size, 0)
  };

  const getStatusColor = (status: TextureItem['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'processing': return 'bg-blue-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getValidationColor = (score: number) => {
    if (score >= 90) return 'text-green-500';
    if (score >= 70) return 'text-yellow-500';
    return 'text-red-500';
  };

  const filteredTextures = mockTextures.filter(texture => {
    const matchesSearch = texture.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = filterType === 'all' || texture.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const KanbanColumn = ({ status, items }: { status: string; items: TextureItem[] }) => (
    <div className="flex-1 min-w-[300px]">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-semibold capitalize">{status}</h3>
        <Badge variant="outline">{items.length}</Badge>
      </div>
      <div className="space-y-2">
        {items.map(item => (
          <Card key={item.id} className="p-3 moss-card cursor-move hover:shadow-md transition-shadow">
            <div className="flex items-center gap-2">
              <FileImage className="h-4 w-4" />
              <span className="text-sm font-medium flex-1">{item.name}</span>
              <Badge className={`${getStatusColor(item.status)} text-white`}>
                {item.validationScore}%
              </Badge>
            </div>
            <div className="mt-2 text-xs text-muted-foreground">
              {item.resolution} • {item.size} KB
            </div>
          </Card>
        ))}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="moss-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Textures</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTextures}</div>
            <p className="text-xs text-muted-foreground">
              {(stats.totalSize / 1024).toFixed(1)} MB total
            </p>
          </CardContent>
        </Card>

        <Card className="moss-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <Progress value={(stats.completed / stats.totalTextures) * 100} className="h-1 mt-2" />
          </CardContent>
        </Card>

        <Card className="moss-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Processing</CardTitle>
            <Activity className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.processing}</div>
            <p className="text-xs text-muted-foreground">
              ~{stats.averageProcessingTime}s avg
            </p>
          </CardContent>
        </Card>

        <Card className="moss-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.failed}</div>
            <p className="text-xs text-muted-foreground">
              {stats.failed > 0 ? 'Review errors' : 'All good!'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Controls Bar */}
      <Card className="moss-card">
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search textures..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="base">Base Color</SelectItem>
                  <SelectItem value="normal">Normal Map</SelectItem>
                  <SelectItem value="specular">Specular Map</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="date">Date Modified</SelectItem>
                  <SelectItem value="size">Size</SelectItem>
                  <SelectItem value="status">Status</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                variant={view === 'grid' ? 'default' : 'outline'}
                onClick={() => setView('grid')}
                className="grow-button"
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={view === 'list' ? 'default' : 'outline'}
                onClick={() => setView('list')}
                className="grow-button"
              >
                <List className="h-4 w-4" />
              </Button>
              <Button
                size="sm"
                variant={view === 'kanban' ? 'default' : 'outline'}
                onClick={() => setView('kanban')}
                className="grow-button"
              >
                <Layers className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Content Area */}
      {view === 'grid' && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {filteredTextures.map(texture => (
            <Card key={texture.id} className="moss-card hover:shadow-lg transition-shadow cursor-pointer">
              <div className="aspect-square bg-gray-100 dark:bg-gray-800 rounded-t-lg flex items-center justify-center">
                <FileImage className="h-12 w-12 text-muted-foreground" />
              </div>
              <CardContent className="p-3">
                <div className="truncate text-sm font-medium">{texture.name}</div>
                <div className="flex items-center justify-between mt-2">
                  <Badge variant="outline" className="text-xs">
                    {texture.resolution}
                  </Badge>
                  <span className={`text-xs font-bold ${getValidationColor(texture.validationScore)}`}>
                    {texture.validationScore}%
                  </span>
                </div>
                <div className={`h-1 w-full rounded-full mt-2 ${getStatusColor(texture.status)}`} />
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {view === 'list' && (
        <Card className="moss-card">
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredTextures.map(texture => (
                <div key={texture.id} className="p-4 hover:bg-accent/50 transition-colors flex items-center gap-4">
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-800 rounded flex items-center justify-center">
                    <FileImage className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{texture.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {texture.type} • {texture.resolution} • {texture.size} KB
                    </div>
                  </div>
                  <Badge className={`${getStatusColor(texture.status)} text-white`}>
                    {texture.status}
                  </Badge>
                  <span className={`font-bold ${getValidationColor(texture.validationScore)}`}>
                    {texture.validationScore}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {view === 'kanban' && (
        <div className="flex gap-4 overflow-x-auto pb-4">
          <KanbanColumn 
            status="pending" 
            items={filteredTextures.filter(t => t.status === 'pending')} 
          />
          <KanbanColumn 
            status="processing" 
            items={filteredTextures.filter(t => t.status === 'processing')} 
          />
          <KanbanColumn 
            status="completed" 
            items={filteredTextures.filter(t => t.status === 'completed')} 
          />
          <KanbanColumn 
            status="failed" 
            items={filteredTextures.filter(t => t.status === 'failed')} 
          />
        </div>
      )}
    </div>
  );
}