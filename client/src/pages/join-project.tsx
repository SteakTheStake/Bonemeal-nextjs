import { useEffect, useState } from 'react';
import { useRoute, useLocation } from 'wouter';
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/useAuth";
import { Users, CheckCircle, XCircle, Loader2, ExternalLink } from "lucide-react";
import bonemeaLogo from "@assets/SkyBlock_items_enchanted_bonemeal_1752287919002.gif";

export default function JoinProject() {
  const [, params] = useRoute('/join/:inviteCode');
  const [, setLocation] = useLocation();
  const { user, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const [joinStatus, setJoinStatus] = useState<'pending' | 'success' | 'error'>('pending');
  const [projectData, setProjectData] = useState<any>(null);

  const joinProjectMutation = useMutation({
    mutationFn: async (inviteCode: string) => {
      return apiRequest(`/api/projects/join/${inviteCode}`, {
        method: 'POST'
      });
    },
    onSuccess: (data) => {
      setProjectData(data.project);
      setJoinStatus('success');
      toast({ 
        title: "Successfully joined project!",
        description: `You now have access to "${data.project.name}"`
      });
    },
    onError: (error) => {
      setJoinStatus('error');
      toast({ 
        title: "Failed to join project", 
        description: error.message,
        variant: "destructive" 
      });
    }
  });

  useEffect(() => {
    if (!authLoading && user && params?.inviteCode) {
      joinProjectMutation.mutate(params.inviteCode);
    }
  }, [user, authLoading, params?.inviteCode]);

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background organic-bg flex items-center justify-center p-6">
        <Card className="w-full max-w-md moss-card">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background organic-bg flex items-center justify-center p-6">
        <Card className="w-full max-w-md moss-card">
          <CardHeader className="text-center">
            <img 
              src={bonemeaLogo} 
              alt="Bonemeal" 
              className="w-16 h-16 mx-auto mb-4 floating"
              style={{ imageRendering: 'pixelated' }}
            />
            <CardTitle>Join Project</CardTitle>
            <CardDescription>
              Sign in with Discord to join this Bonemeal project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={() => window.location.href = '/api/login'}
              className="w-full grow-button"
            >
              <Users className="h-4 w-4 mr-2" />
              Sign In with Discord
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setLocation('/')}
              className="w-full"
            >
              Go to Homepage
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background organic-bg flex items-center justify-center p-6">
      <Card className="w-full max-w-md moss-card">
        <CardHeader className="text-center">
          <img 
            src={bonemeaLogo} 
            alt="Bonemeal" 
            className="w-16 h-16 mx-auto mb-4 floating"
            style={{ imageRendering: 'pixelated' }}
          />
          <CardTitle className="flex items-center justify-center space-x-2">
            {joinStatus === 'pending' && <Loader2 className="h-5 w-5 animate-spin text-primary" />}
            {joinStatus === 'success' && <CheckCircle className="h-5 w-5 text-green-500" />}
            {joinStatus === 'error' && <XCircle className="h-5 w-5 text-red-500" />}
            <span>
              {joinStatus === 'pending' && 'Joining Project...'}
              {joinStatus === 'success' && 'Project Joined!'}
              {joinStatus === 'error' && 'Join Failed'}
            </span>
          </CardTitle>
          <CardDescription>
            {joinStatus === 'pending' && 'Please wait while we add you to the project'}
            {joinStatus === 'success' && `You now have access to "${projectData?.name}"`}
            {joinStatus === 'error' && 'The invite link may be invalid or expired'}
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {joinStatus === 'success' && (
            <>
              <div className="bg-muted p-3 rounded-md">
                <h4 className="font-medium mb-2">Project Details:</h4>
                <p className="text-sm text-muted-foreground">
                  <strong>Name:</strong> {projectData.name}
                </p>
                {projectData.description && (
                  <p className="text-sm text-muted-foreground mt-1">
                    <strong>Description:</strong> {projectData.description}
                  </p>
                )}
                <p className="text-sm text-muted-foreground mt-1">
                  <strong>Status:</strong> {projectData.status}
                </p>
              </div>
              
              <Button 
                onClick={() => setLocation('/projects')}
                className="w-full grow-button"
              >
                <ExternalLink className="h-4 w-4 mr-2" />
                Go to Projects
              </Button>
            </>
          )}
          
          {joinStatus === 'error' && (
            <Button 
              variant="outline" 
              onClick={() => setLocation('/')}
              className="w-full"
            >
              Go to Homepage
            </Button>
          )}
          
          {joinStatus === 'pending' && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                This should only take a moment...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}