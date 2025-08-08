import { useState } from 'react';
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Share2, Copy, Clock, Users } from "lucide-react";

interface ProjectShareDialogProps {
  projectId: number;
  projectName: string;
}

export default function ProjectShareDialog({ projectId, projectName }: ProjectShareDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expiresInHours, setExpiresInHours] = useState("24");
  const [inviteData, setInviteData] = useState<{
    inviteCode: string;
    inviteUrl: string;
    expiresAt: string;
  } | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const generateInviteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest(`/api/projects/${projectId}/invite`, {
        method: 'POST',
        body: { expiresInHours: parseInt(expiresInHours) }
      });
    },
    onSuccess: (data) => {
      setInviteData(data);
      toast({ 
        title: "Invite link generated!",
        description: "Share this link with other Discord users to give them access to your project."
      });
    },
    onError: (error) => {
      toast({ 
        title: "Failed to generate invite", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({ title: "Copied to clipboard!" });
    } catch {
      // Fallback for browsers that don't support clipboard API
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast({ title: "Copied to clipboard!" });
    }
  };

  const handleDialogChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setInviteData(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline">
          <Share2 className="h-4 w-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Project</DialogTitle>
          <DialogDescription>
            Generate an invite link to share "{projectName}" with other Discord users
          </DialogDescription>
        </DialogHeader>
        
        {!inviteData ? (
          <div className="space-y-4">
            <div>
              <Label htmlFor="expires">Link expires in</Label>
              <Select value={expiresInHours} onValueChange={setExpiresInHours}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hour</SelectItem>
                  <SelectItem value="6">6 hours</SelectItem>
                  <SelectItem value="24">24 hours</SelectItem>
                  <SelectItem value="72">3 days</SelectItem>
                  <SelectItem value="168">1 week</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <Button 
              onClick={() => generateInviteMutation.mutate()} 
              disabled={generateInviteMutation.isPending}
              className="w-full"
            >
              <Share2 className="h-4 w-4 mr-2" />
              {generateInviteMutation.isPending ? "Generating..." : "Generate Invite Link"}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Expires: {new Date(inviteData.expiresAt).toLocaleString()}</span>
            </div>
            
            <div>
              <Label htmlFor="invite-url">Invite Link</Label>
              <div className="flex mt-2">
                <Input
                  id="invite-url"
                  value={inviteData.inviteUrl}
                  readOnly
                  className="flex-1"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(inviteData.inviteUrl)}
                  className="ml-2"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div>
              <Label htmlFor="invite-code">Invite Code</Label>
              <div className="flex mt-2">
                <Input
                  id="invite-code"
                  value={inviteData.inviteCode}
                  readOnly
                  className="flex-1 font-mono"
                />
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => copyToClipboard(inviteData.inviteCode)}
                  className="ml-2"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="bg-muted p-3 rounded-md">
              <div className="flex items-center space-x-2 text-sm font-medium mb-2">
                <Users className="h-4 w-4" />
                <span>How to join:</span>
              </div>
              <ol className="text-sm text-muted-foreground space-y-1">
                <li>1. Share the invite link with Discord users</li>
                <li>2. They must be logged in to Bonemeal</li>
                <li>3. Clicking the link will add them to your project</li>
                <li>4. They'll have view access to all project files</li>
              </ol>
            </div>
            
            <Button 
              variant="outline" 
              onClick={() => setInviteData(null)}
              className="w-full"
            >
              Generate New Link
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}