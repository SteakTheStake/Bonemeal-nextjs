import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { 
  Users, Share2, Copy, Check, Plus, Crown, Eye, Edit, 
  Trash2, Clock, MessageSquare, UserPlus, Shield, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import type { Project, ProjectShare, User } from "@shared/schema";

interface DiscordIntegrationProps {
  project: Project;
  className?: string;
}

interface DiscordFriend {
  id: string;
  username: string;
  discriminator?: string;
  avatar?: string;
  status: 'online' | 'offline' | 'idle' | 'dnd';
}

interface ShareInvite {
  inviteCode: string;
  expiresAt: string;
  maxUses?: number;
  usedCount: number;
}

export default function DiscordIntegration({ project, className }: DiscordIntegrationProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
  const [sharePermission, setSharePermission] = useState<'view' | 'edit'>('view');
  const [inviteMessage, setInviteMessage] = useState('');
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [copiedInvite, setCopiedInvite] = useState(false);

  // Fetch project shares
  const { data: projectShares } = useQuery<ProjectShare[]>({
    queryKey: ['/api/projects', project.id, 'shares'],
    enabled: !!project.id,
  });

  // Fetch Discord friends (mock data for now)
  const { data: discordFriends = [] } = useQuery<DiscordFriend[]>({
    queryKey: ['/api/discord/friends'],
    enabled: !!user,
  });

  // Fetch project invite
  const { data: projectInvite } = useQuery<ShareInvite>({
    queryKey: ['/api/projects', project.id, 'invite'],
    enabled: !!project.id,
  });

  // Share project mutation
  const shareProjectMutation = useMutation({
    mutationFn: async (data: { userIds: string[], permission: 'view' | 'edit', message?: string }) => {
      return apiRequest('/api/projects/share', {
        method: 'POST',
        body: JSON.stringify({
          projectId: project.id,
          ...data
        })
      });
    },
    onSuccess: () => {
      toast({
        title: "Project Shared",
        description: "Your project has been shared with the selected users.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', project.id, 'shares'] });
      setSelectedFriends([]);
      setIsShareDialogOpen(false);
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
    mutationFn: async (data: { expiresInHours: number }) => {
      return apiRequest('/api/projects/invite', {
        method: 'POST',
        body: JSON.stringify({
          projectId: project.id,
          ...data
        })
      });
    },
    onSuccess: () => {
      toast({
        title: "Invite Generated",
        description: "Project invite link has been created.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', project.id, 'invite'] });
    },
  });

  // Remove share mutation
  const removeShareMutation = useMutation({
    mutationFn: async (shareId: number) => {
      return apiRequest(`/api/projects/shares/${shareId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      toast({
        title: "Share Removed",
        description: "User access has been revoked.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/projects', project.id, 'shares'] });
    },
  });

  const handleShareProject = () => {
    if (selectedFriends.length === 0) {
      toast({
        title: "No Users Selected",
        description: "Please select at least one user to share with.",
        variant: "destructive",
      });
      return;
    }

    shareProjectMutation.mutate({
      userIds: selectedFriends,
      permission: sharePermission,
      message: inviteMessage || undefined
    });
  };

  const copyInviteLink = async () => {
    if (!projectInvite) return;
    
    const inviteUrl = `${window.location.origin}/join/${projectInvite.inviteCode}`;
    await navigator.clipboard.writeText(inviteUrl);
    setCopiedInvite(true);
    setTimeout(() => setCopiedInvite(false), 2000);
    
    toast({
      title: "Invite Link Copied",
      description: "The invite link has been copied to your clipboard.",
    });
  };

  const getPermissionIcon = (permission: string) => {
    switch (permission) {
      case 'edit': return <Edit className="w-4 h-4" />;
      case 'view': return <Eye className="w-4 h-4" />;
      default: return <Shield className="w-4 h-4" />;
    }
  };

  const getPermissionColor = (permission: string) => {
    switch (permission) {
      case 'edit': return 'text-orange-500';
      case 'view': return 'text-blue-500';
      default: return 'text-gray-500';
    }
  };

  if (!user) {
    return (
      <Card className={className}>
        <CardContent className="p-6 text-center">
          <MessageSquare className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium mb-2">Discord Integration</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Login to share projects with your Discord friends and collaborate on texture packs.
          </p>
          <a href="/api/auth/discord">
            <Button className="moss-texture">
              Connect Discord
            </Button>
          </a>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className={className}>
      <Tabs defaultValue="collaborators" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="collaborators">
            <Users className="w-4 h-4 mr-2" />
            Collaborators
          </TabsTrigger>
          <TabsTrigger value="share">
            <Share2 className="w-4 h-4 mr-2" />
            Share Project
          </TabsTrigger>
          <TabsTrigger value="invite">
            <UserPlus className="w-4 h-4 mr-2" />
            Invite Links
          </TabsTrigger>
        </TabsList>

        {/* Collaborators Tab */}
        <TabsContent value="collaborators">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Project Collaborators
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {/* Project Owner */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-accent/50">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                      <Crown className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <div className="font-medium">You (Owner)</div>
                      <div className="text-xs text-muted-foreground">Full access to project</div>
                    </div>
                  </div>
                  <Badge variant="secondary">Owner</Badge>
                </div>

                {/* Shared Users */}
                {projectShares?.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-sm">No collaborators yet</p>
                    <p className="text-xs">Share your project to start collaborating</p>
                  </div>
                ) : (
                  projectShares?.map((share) => (
                    <div key={share.id} className="flex items-center justify-between p-3 rounded-lg border">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-accent flex items-center justify-center">
                          {getPermissionIcon(share.permission)}
                        </div>
                        <div>
                          <div className="font-medium">Discord User #{share.sharedWithUserId}</div>
                          <div className="text-xs text-muted-foreground">
                            Joined {new Date(share.joinedAt || '').toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className={getPermissionColor(share.permission)}>
                          {share.permission}
                        </Badge>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeShareMutation.mutate(share.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Share Project Tab */}
        <TabsContent value="share">
          <Card>
            <CardHeader>
              <CardTitle>Share with Discord Friends</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Select Friends to Share With</Label>
                  <div className="mt-2 max-h-60 overflow-y-auto border rounded-md p-3">
                    {discordFriends.length === 0 ? (
                      <div className="text-center py-6 text-muted-foreground">
                        <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No Discord friends found</p>
                        <p className="text-xs">Make sure you're connected to Discord</p>
                      </div>
                    ) : (
                      <div className="space-y-2">
                        {discordFriends.map((friend) => (
                          <label key={friend.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-accent cursor-pointer">
                            <input
                              type="checkbox"
                              checked={selectedFriends.includes(friend.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedFriends([...selectedFriends, friend.id]);
                                } else {
                                  setSelectedFriends(selectedFriends.filter(id => id !== friend.id));
                                }
                              }}
                              className="rounded border-gray-300"
                            />
                            <div className="flex items-center gap-2">
                              <div className={`w-3 h-3 rounded-full ${
                                friend.status === 'online' ? 'bg-green-500' :
                                friend.status === 'idle' ? 'bg-yellow-500' :
                                friend.status === 'dnd' ? 'bg-red-500' : 'bg-gray-500'
                              }`} />
                              <span className="text-sm font-medium">
                                {friend.username}
                                {friend.discriminator && `#${friend.discriminator}`}
                              </span>
                            </div>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <Label>Permission Level</Label>
                  <Select value={sharePermission} onValueChange={(value: 'view' | 'edit') => setSharePermission(value)}>
                    <SelectTrigger className="mt-2">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="view">
                        <div className="flex items-center gap-2">
                          <Eye className="w-4 h-4" />
                          View Only - Can see and download
                        </div>
                      </SelectItem>
                      <SelectItem value="edit">
                        <div className="flex items-center gap-2">
                          <Edit className="w-4 h-4" />
                          Edit Access - Can modify textures
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Optional Message</Label>
                  <Textarea
                    value={inviteMessage}
                    onChange={(e) => setInviteMessage(e.target.value)}
                    placeholder="Add a message to your collaboration invite..."
                    className="mt-2"
                    rows={3}
                  />
                </div>

                <Button
                  onClick={handleShareProject}
                  disabled={selectedFriends.length === 0 || shareProjectMutation.isPending}
                  className="w-full moss-texture"
                >
                  {shareProjectMutation.isPending ? (
                    "Sharing..."
                  ) : (
                    <>
                      <Share2 className="w-4 h-4 mr-2" />
                      Share Project ({selectedFriends.length} selected)
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invite Links Tab */}
        <TabsContent value="invite">
          <Card>
            <CardHeader>
              <CardTitle>Project Invite Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {projectInvite ? (
                  <div className="space-y-4">
                    <div className="p-4 border rounded-lg bg-accent/20">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">Active Invite Link</h4>
                        <Badge variant="outline">
                          <Clock className="w-3 h-3 mr-1" />
                          Expires {new Date(projectInvite.expiresAt).toLocaleDateString()}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2 mt-3">
                        <Input
                          value={`${window.location.origin}/join/${projectInvite.inviteCode}`}
                          readOnly
                          className="font-mono text-sm"
                        />
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={copyInviteLink}
                          className="shrink-0"
                        >
                          {copiedInvite ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                        </Button>
                      </div>
                      
                      <div className="text-xs text-muted-foreground mt-2">
                        Used {projectInvite.usedCount} times
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => generateInviteMutation.mutate({ expiresInHours: 168 })}
                        disabled={generateInviteMutation.isPending}
                      >
                        Regenerate Link
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <UserPlus className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                    <h4 className="font-medium mb-2">No Invite Link Created</h4>
                    <p className="text-sm text-muted-foreground mb-4">
                      Generate a shareable link that anyone can use to join your project
                    </p>
                    <Button
                      onClick={() => generateInviteMutation.mutate({ expiresInHours: 168 })}
                      disabled={generateInviteMutation.isPending}
                      className="moss-texture"
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      Create Invite Link
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}