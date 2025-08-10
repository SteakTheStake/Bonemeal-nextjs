import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { 
  Star, 
  Plus, 
  Trash2, 
  GripVertical, 
  Settings,
  Zap,
  FolderOpen,
  Brush,
  Sparkles,
  Package,
  Box,
  BarChart3
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { type UserFavorite } from "@shared/schema";

interface FavoritesPanelProps {
  onNavigateToSection: (sectionId: string) => void;
  currentSection: string;
}

const GREENHOUSE_SECTIONS = [
  { id: 'convert', label: 'Convert', icon: Zap, description: 'Upload & convert textures' },
  { id: 'dashboard', label: 'Projects', icon: FolderOpen, description: 'Manage your projects' },
  { id: 'editor', label: 'Editor', icon: Brush, description: 'Visual texture editing' },
  { id: 'ai', label: 'AI Generate', icon: Sparkles, description: 'AI-powered generation' },
  { id: 'templates', label: 'Templates', icon: Package, description: 'Material templates' },
  { id: 'batch', label: 'Batch', icon: Box, description: 'Bulk processing' },
  { id: 'quality', label: 'Quality', icon: BarChart3, description: 'Texture quality analysis' },
];

export default function FavoritesPanel({ onNavigateToSection, currentSection }: FavoritesPanelProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [selectedSection, setSelectedSection] = useState("");

  // Fetch user favorites
  const { data: favorites = [] } = useQuery<UserFavorite[]>({
    queryKey: ["/api/favorites"],
    enabled: !!user,
  });

  // Add favorite mutation
  const addFavoriteMutation = useMutation({
    mutationFn: async (data: {
      sectionType: string;
      sectionId: string;
      order: number;
    }) => {
      await apiRequest("/api/favorites", "POST", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      setShowAddDialog(false);
      setSelectedSection("");
      toast({
        title: "Added to favorites",
        description: "Section pinned to your favorites panel",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to add to favorites",
        variant: "destructive",
      });
    },
  });

  // Remove favorite mutation
  const removeFavoriteMutation = useMutation({
    mutationFn: async (favoriteId: number) => {
      await apiRequest(`/api/favorites/${favoriteId}`, "DELETE");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
      toast({
        title: "Removed from favorites",
        description: "Section unpinned from favorites panel",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to remove from favorites",
        variant: "destructive",
      });
    },
  });

  // Reorder favorites mutation
  const reorderMutation = useMutation({
    mutationFn: async (updates: { id: number; order: number }[]) => {
      await apiRequest("/api/favorites/reorder", "POST", { updates });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites"] });
    },
  });

  const handleAddFavorite = () => {
    if (!selectedSection) {
      toast({
        title: "Error",
        description: "Please select a section to add",
        variant: "destructive",
      });
      return;
    }

    const existingFavorite = favorites.find(fav => fav.sectionId === selectedSection);
    if (existingFavorite) {
      toast({
        title: "Already favorited",
        description: "This section is already in your favorites",
        variant: "destructive",
      });
      return;
    }

    addFavoriteMutation.mutate({
      sectionType: 'greenhouse',
      sectionId: selectedSection,
      order: favorites.length,
    });
  };

  const getSectionInfo = (sectionId: string) => {
    return GREENHOUSE_SECTIONS.find(section => section.id === sectionId);
  };

  const availableSections = GREENHOUSE_SECTIONS.filter(
    section => !favorites.some(fav => fav.sectionId === section.id)
  );

  // Sort favorites by order
  const sortedFavorites = [...favorites].sort((a, b) => (a.order || 0) - (b.order || 0));

  if (!user) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
        <p className="text-sm">Sign in to pin favorite sections</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Star className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-medium">Quick Access</h3>
        </div>
        
        {availableSections.length > 0 && (
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline" className="glass-card">
                <Plus className="h-3 w-3" />
              </Button>
            </DialogTrigger>
            <DialogContent className="glass-card">
              <DialogHeader>
                <DialogTitle>Pin Section</DialogTitle>
                <DialogDescription>
                  Select a section to pin for quick access
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label htmlFor="section-select" className="text-sm font-medium">
                    Choose a section to pin:
                  </label>
                  <Select value={selectedSection} onValueChange={setSelectedSection}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select a section..." />
                    </SelectTrigger>
                    <SelectContent>
                      {availableSections.map(section => {
                        const Icon = section.icon;
                        return (
                          <SelectItem key={section.id} value={section.id}>
                            <div className="flex items-center gap-2">
                              <Icon className="h-3 w-3" />
                              <span>{section.label}</span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                
                {selectedSection && (
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-2 mb-1">
                      {(() => {
                        const Icon = getSectionInfo(selectedSection)?.icon || Settings;
                        return <Icon className="h-4 w-4 text-primary" />;
                      })()}
                      <span className="font-medium">{getSectionInfo(selectedSection)?.label}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {getSectionInfo(selectedSection)?.description}
                    </p>
                  </div>
                )}
                
                <div className="flex gap-2">
                  <Button onClick={handleAddFavorite} disabled={addFavoriteMutation.isPending}>
                    {addFavoriteMutation.isPending ? "Adding..." : "Pin Section"}
                  </Button>
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Favorites list */}
      <ScrollArea className="h-48">
        <div className="space-y-2">
          {sortedFavorites.map(favorite => {
            const sectionInfo = getSectionInfo(favorite.sectionId);
            if (!sectionInfo) return null;
            
            const Icon = sectionInfo.icon;
            const isActive = currentSection === favorite.sectionId;
            
            return (
              <Card 
                key={favorite.id} 
                className={`glass-card cursor-pointer transition-colors ${
                  isActive ? 'ring-2 ring-primary border-primary/50' : 'hover:border-primary/30'
                }`}
                onClick={() => onNavigateToSection(favorite.sectionId)}
              >
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <GripVertical className="h-3 w-3 text-muted-foreground" />
                      <Icon className={`h-3 w-3 ${isActive ? 'text-primary' : 'text-muted-foreground'}`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs font-medium truncate ${
                            isActive ? 'text-primary' : 'text-foreground'
                          }`}>
                            {sectionInfo.label}
                          </span>
                          {isActive && (
                            <Badge variant="outline" className="text-xs px-1 py-0">
                              Current
                            </Badge>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground truncate">
                          {sectionInfo.description}
                        </p>
                      </div>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFavoriteMutation.mutate(favorite.id);
                      }}
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
          
          {sortedFavorites.length === 0 && (
            <div className="text-center py-6 text-muted-foreground">
              <Star className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No pinned sections</p>
              <p className="text-xs">Pin your most-used sections for quick access</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Quick stats */}
      {sortedFavorites.length > 0 && (
        <div className="text-xs text-muted-foreground text-center">
          {sortedFavorites.length} pinned section{sortedFavorites.length !== 1 ? 's' : ''}
        </div>
      )}
    </div>
  );
}