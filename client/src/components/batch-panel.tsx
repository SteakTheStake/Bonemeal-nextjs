import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { type ConversionJob } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Play, Pause, Clock, HourglassIcon, X, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface BatchPanelProps {
  jobs: ConversionJob[] | undefined;
  activeJob: number | null;
  onJobSelect: (jobId: number) => void;
}

export function BatchPanel({ jobs, activeJob, onJobSelect }: BatchPanelProps) {
  const [autoDetectTypes, setAutoDetectTypes] = useState(true);
  const [skipExisting, setSkipExisting] = useState(false);
  const [validateAfterProcessing, setValidateAfterProcessing] = useState(true);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const downloadMutation = useMutation({
    mutationFn: async (jobId: number) => {
      const response = await apiRequest("GET", `/api/jobs/${jobId}/download`);
      return response.blob();
    },
    onSuccess: (blob, jobId) => {
      const job = jobs?.find(j => j.id === jobId);
      if (job) {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${job.filename.replace('.zip', '')}_labpbr.zip`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Download started",
          description: "Your converted resource pack is being downloaded.",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Download failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const pendingJobs = jobs?.filter(j => j.status === 'pending') || [];
  const processingJobs = jobs?.filter(j => j.status === 'processing') || [];
  const completedJobs = jobs?.filter(j => j.status === 'completed') || [];
  const failedJobs = jobs?.filter(j => j.status === 'failed') || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-3 w-3 text-muted-foreground" />;
      case 'processing':
        return <HourglassIcon className="h-3 w-3 text-warning animate-pulse" />;
      case 'completed':
        return <Play className="h-3 w-3 text-success" />;
      case 'failed':
        return <X className="h-3 w-3 text-error" />;
      default:
        return <Clock className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const handleDownload = (jobId: number) => {
    downloadMutation.mutate(jobId);
  };

  return (
    <div className="p-4 flex flex-col h-full">
      <h3 className="text-sm font-medium mb-3">Batch Processing</h3>
      
      {/* Processing Queue */}
      <div className="mb-4 flex-1 min-h-0">
        <h4 className="text-xs font-medium text-muted-foreground mb-2">Processing Queue</h4>
        <ScrollArea className="h-40">
          <div className="space-y-2">
            {/* Processing Jobs */}
            {processingJobs.map((job) => (
              <div 
                key={job.id}
                className={`flex items-center justify-between p-2 elevated rounded cursor-pointer hover:bg-accent/50 ${
                  activeJob === job.id ? 'bg-accent' : ''
                }`}
                onClick={() => onJobSelect(job.id)}
              >
                <div className="flex items-center space-x-2">
                  {getStatusIcon(job.status)}
                  <span className="text-xs text-foreground">{job.filename}</span>
                </div>
                <div className="text-xs text-muted-foreground">
                  {job.progress}%
                </div>
              </div>
            ))}
            
            {/* Pending Jobs */}
            {pendingJobs.map((job) => (
              <div 
                key={job.id}
                className={`flex items-center justify-between p-2 elevated rounded cursor-pointer hover:bg-accent/50 ${
                  activeJob === job.id ? 'bg-accent' : ''
                }`}
                onClick={() => onJobSelect(job.id)}
              >
                <div className="flex items-center space-x-2">
                  {getStatusIcon(job.status)}
                  <span className="text-xs text-foreground">{job.filename}</span>
                </div>
                <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-error hover:text-error">
                  <X className="h-3 w-3" />
                </Button>
              </div>
            ))}

            {/* Completed Jobs */}
            {completedJobs.map((job) => (
              <div 
                key={job.id}
                className={`flex items-center justify-between p-2 elevated rounded cursor-pointer hover:bg-accent/50 ${
                  activeJob === job.id ? 'bg-accent' : ''
                }`}
                onClick={() => onJobSelect(job.id)}
              >
                <div className="flex items-center space-x-2">
                  {getStatusIcon(job.status)}
                  <span className="text-xs text-foreground">{job.filename}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 text-success hover:text-success"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDownload(job.id);
                  }}
                  disabled={downloadMutation.isPending}
                >
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            ))}

            {/* Failed Jobs */}
            {failedJobs.map((job) => (
              <div 
                key={job.id}
                className={`flex items-center justify-between p-2 elevated rounded cursor-pointer hover:bg-accent/50 ${
                  activeJob === job.id ? 'bg-accent' : ''
                }`}
                onClick={() => onJobSelect(job.id)}
              >
                <div className="flex items-center space-x-2">
                  {getStatusIcon(job.status)}
                  <span className="text-xs text-foreground">{job.filename}</span>
                </div>
                <span className="text-xs text-error">Failed</span>
              </div>
            ))}

            {!jobs?.length && (
              <div className="text-center py-4 text-muted-foreground text-xs">
                No jobs in queue
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Batch Settings */}
      <div className="mb-4">
        <h4 className="text-xs font-medium text-muted-foreground mb-2">Batch Settings</h4>
        <div className="space-y-2">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="autoDetect"
              checked={autoDetectTypes}
              onCheckedChange={setAutoDetectTypes}
            />
            <Label htmlFor="autoDetect" className="text-xs">Auto-detect texture types</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="skipExisting"
              checked={skipExisting}
              onCheckedChange={setSkipExisting}
            />
            <Label htmlFor="skipExisting" className="text-xs">Skip existing textures</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="validateAfter"
              checked={validateAfterProcessing}
              onCheckedChange={setValidateAfterProcessing}
            />
            <Label htmlFor="validateAfter" className="text-xs">Validate after processing</Label>
          </div>
        </div>
      </div>

      {/* Batch Actions */}
      <div className="space-y-2">
        <Button 
          className="w-full" 
          size="sm"
          disabled={pendingJobs.length === 0}
        >
          <Play className="h-4 w-4 mr-2" />
          Start Batch Processing
        </Button>
        <Button 
          variant="secondary" 
          className="w-full" 
          size="sm"
          disabled={processingJobs.length === 0}
        >
          <Pause className="h-4 w-4 mr-2" />
          Pause Queue
        </Button>
      </div>
    </div>
  );
}
