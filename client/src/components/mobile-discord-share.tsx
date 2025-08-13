import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Users, Share2, Copy, Check, MessageSquare, UserPlus, 
  Crown, Eye, Edit, X, Send
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import type { Project, ProjectShare } from "@shared/schema";

interface MobileDiscordShareProps {
  project: Project;
}

interface DiscordFriend {
  id: string;
  username: string;
  discriminator?: string;
  avatar?: string;
  status: 'online' | 'offline' | 'idle' | 'dnd';
}

export default function MobileDiscordShare({ project }: MobileDiscordShareProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedFriend, setSelectedFriend] = useState<string>('');
  const [sharePermission, setSharePermission] = useState<'view' | 'edit'>('view');
  const [isShareSheetOpen, setIsShareSheetOpen] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);

  // Fetch project shares
  const { data: projectShares = [] } = useQuery<ProjectShare[]>({
    queryKey: ['/api/projects', project.id, 'shares'],
    enabled: !!project.id,
  });

  // Fetch Discord friends (mock for demo)
  const { data: discordFriends = [] } = useQuery<DiscordFriend[]>({
    queryKey: ['/api/discord/friends'],
    enabled: !!user,
  });

  // Fetch project invite
  const { data: projectInvite } = useQuery<{ inviteCode: string; expiresAt: string }>({
    queryKey: ['/api/projects', project.id, 'invite'],
    enabled: !!project.id,
  });

  // Share project mutation
  const shareProjectMutation = useMutation({
    mutationFn: async (data: { userId: string, permission: 'view' | 'edit' }) => {
      return apiRequest('/api/projects/share', {
        method: 'POST',
        body: JSON.stringify({
          projectId: project.id,
          userIds: [data.userId],
          permission: data.permission
        })
      });
    },
    onSuccess: () => {
      toast({
        title: "Project Shared",
        description: "Your project has been shared successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', project.id, 'shares'] });
      setSelectedFriend('');
      setIsShareSheetOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Share Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Generate invite mutation
  const generateInviteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/projects/invite', {
        method: 'POST',
        body: JSON.stringify({
          projectId: project.id,
          expiresInHours: 168 // 1 week
        })
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects', project.id, 'invite'] });
    },
  });

  const handleQuickShare = () => {
    if (!selectedFriend) {
      toast({
        title: "No User Selected",
        description: "Please select a Discord friend to share with.",
        variant: "destructive",
      });
      return;
    }

    shareProjectMutation.mutate({
      userId: selectedFriend,
      permission: sharePermission
    });
  };

  const copyInviteLink = async () => {
    if (!projectInvite) {
      // Generate invite first
      await generateInviteMutation.mutateAsync();
      return;
    }
    
    const inviteUrl = `${window.location.origin}/join/${projectInvite.inviteCode}`;
    await navigator.clipboard.writeText(inviteUrl);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
    
    toast({
      title: "Link Copied",
      description: "Invite link copied to clipboard",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'bg-green-500';
      case 'idle': return 'bg-yellow-500';
      case 'dnd': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  if (!user) {
    return (
      <Card className="mobile-card">
        <CardContent className="p-4 text-center">
          <MessageSquare className="w-10 h-10 mx-auto text-muted-foreground mb-2" />
          <h3 className="font-medium mb-1">Discord Sharing</h3>
          <p className="text-xs text-muted-foreground mb-3">
            Login to share projects with Discord friends
          </p>
          <a href="/api/auth/discord">
            <Button size="sm" className="moss-texture">
              Connect Discord
            </Button>
          </a>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quick Share Card */}
      <Card className="mobile-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Share Project
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-3">
            {/* Quick Share with Friends */}
            <div className="flex gap-2">
              <div className="flex-1">
                <Select value={selectedFriend} onValueChange={setSelectedFriend}>
                  <SelectTrigger className="h-9">
                    <SelectValue placeholder="Select Discord friend" />
                  </SelectTrigger>
                  <SelectContent>
                    {discordFriends.map((friend) => (
                      <SelectItem key={friend.id} value={friend.id}>
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${getStatusColor(friend.status)}`} />
                          <span className="text-sm">
                            {friend.username}
                            {friend.discriminator && `#${friend.discriminator}`}
                          </span>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button
                size="sm"
                onClick={handleQuickShare}
                disabled={!selectedFriend || shareProjectMutation.isPending}
                className="moss-texture"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>

            {/* Permission Quick Select */}
            <div className="flex gap-2">
              <Button
                variant={sharePermission === 'view' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSharePermission('view')}
                className="flex-1"
              >
                <Eye className="w-3 h-3 mr-1" />
                View
              </Button>
              <Button
                variant={sharePermission === 'edit' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setSharePermission('edit')}
                className="flex-1"
              >
                <Edit className="w-3 h-3 mr-1" />
                Edit
              </Button>
            </div>

            {/* Copy Invite Link */}
            <Button
              variant="outline"
              size="sm"
              onClick={copyInviteLink}
              disabled={generateInviteMutation.isPending}
              className="w-full"
            >
              {copiedInvite ? (
                <>
                  <Check className="w-4 h-4 mr-2" />
                  Copied!
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 mr-2" />
                  {projectInvite ? 'Copy Invite Link' : 'Generate & Copy Link'}
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Collaborators List */}
      <Card className="mobile-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Users className="w-4 h-4" />
              Collaborators ({projectShares.length + 1})
            </CardTitle>
            
            <Sheet open={isShareSheetOpen} onOpenChange={setIsShareSheetOpen}>
              <SheetTrigger asChild>
                <Button size="sm" variant="outline">
                  <UserPlus className="w-4 h-4" />
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="mobile-glass">
                <SheetHeader className="text-left">
                  <SheetTitle>Share Project</SheetTitle>
                  <SheetDescription>
                    Share "{project.name}" with your Discord friends
                  </SheetDescription>
                </SheetHeader>
                <div className="mt-4 space-y-4">
                  <div>
                    <Label className="text-sm">Discord Friends</Label>
                    <div className="mt-2 space-y-2 max-h-48 overflow-y-auto">
                      {discordFriends.map((friend) => (
                        <label key={friend.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer">
                          <input
                            type="radio"
                            name="selected-friend"
                            value={friend.id}
                            checked={selectedFriend === friend.id}
                            onChange={(e) => setSelectedFriend(e.target.value)}
                          />
                          <div className="flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${getStatusColor(friend.status)}`} />
                            <span className="text-sm font-medium">
                              {friend.username}
                              {friend.discriminator && `#${friend.discriminator}`}
                            </span>
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <Label className="text-sm">Permission Level</Label>
                    <Select value={sharePermission} onValueChange={(value: 'view' | 'edit') => setSharePermission(value)}>
                      <SelectTrigger className="mt-2">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="view">View Only</SelectItem>
                        <SelectItem value="edit">Can Edit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <Button
                    onClick={handleQuickShare}
                    disabled={!selectedFriend || shareProjectMutation.isPending}
                    className="w-full moss-texture"
                  >
                    {shareProjectMutation.isPending ? "Sharing..." : "Share Project"}
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="space-y-2">
            {/* Project Owner */}
            <div className="flex items-center justify-between p-2 rounded-lg bg-accent/30">
              <div className="flex items-center gap-2">
                <Crown className="w-4 h-4 text-primary" />
                <div>
                  <div className="text-sm font-medium">You</div>
                  <div className="text-xs text-muted-foreground">Owner</div>
                </div>
              </div>
              <Badge variant="secondary" className="text-xs">Owner</Badge>
            </div>

            {/* Collaborators */}
            {projectShares.length === 0 ? (
              <div className="text-center py-4 text-muted-foreground">
                <Users className="w-8 h-8 mx-auto mb-1 opacity-50" />
                <p className="text-xs">No collaborators yet</p>
              </div>
            ) : (
              projectShares.map((share) => (
                <div key={share.id} className="flex items-center justify-between p-2 rounded-lg border">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-full bg-accent flex items-center justify-center">
                      {share.permission === 'edit' ? (
                        <Edit className="w-2 h-2" />
                      ) : (
                        <Eye className="w-2 h-2" />
                      )}
                    </div>
                    <div>
                      <div className="text-sm font-medium">
                        Discord User #{share.sharedWithUserId}
                      </div>
                      <div className="text-xs text-muted-foreground capitalize">
                        {share.permission} access
                      </div>
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-red-500">
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}