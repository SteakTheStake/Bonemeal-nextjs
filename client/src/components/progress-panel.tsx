import { type ConversionJob, type ProcessingStatus } from "@shared/schema";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle, AlertTriangle, Info, XCircle } from "lucide-react";

interface ProgressPanelProps {
  job: ConversionJob | undefined;
  processingStatus: ProcessingStatus | undefined;
}

export function ProgressPanel({ job, processingStatus }: ProgressPanelProps) {
  if (!job) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>No job selected</p>
      </div>
    );
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${minutes}m ${remainingSeconds}s`;
  };

  const getLogIcon = (level: string) => {
    switch (level) {
      case 'success':
        return <CheckCircle className="h-3 w-3 text-success" />;
      case 'warning':
        return <AlertTriangle className="h-3 w-3 text-warning" />;
      case 'error':
        return <XCircle className="h-3 w-3 text-error" />;
      default:
        return <Info className="h-3 w-3 text-muted-foreground" />;
    }
  };

  return (
    <div className="p-4 flex flex-col h-full">
      <h3 className="text-sm font-medium mb-3">Processing Status</h3>
      
      {/* Current Task */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">Current Task</span>
          <span className="text-xs text-foreground">
            {processingStatus?.currentTask || 'Idle'}
          </span>
        </div>
        <Progress value={job.progress || 0} className="w-full" />
      </div>

      {/* Processing Log */}
      <div className="mb-4 flex-1 min-h-0">
        <h4 className="text-xs font-medium text-muted-foreground mb-2">Processing Log</h4>
        <ScrollArea className="h-40 bg-background rounded p-3 text-xs font-mono">
          {processingStatus?.logs?.map((log, index) => (
            <div key={index} className="flex items-center space-x-2 mb-1">
              {getLogIcon(log.level)}
              <span className="text-muted-foreground">
                [{new Date(log.timestamp).toLocaleTimeString()}]
              </span>
              <span className={
                log.level === 'success' ? 'text-success' :
                log.level === 'warning' ? 'text-warning' :
                log.level === 'error' ? 'text-error' :
                'text-muted-foreground'
              }>
                {log.message}
              </span>
            </div>
          ))}
        </ScrollArea>
      </div>

      {/* Statistics */}
      <div className="space-y-3">
        <div className="elevated rounded p-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Images Processed</span>
            <span className="text-xs text-foreground">
              {processingStatus?.imagesProcessed || 0}/{processingStatus?.totalImages || 0}
            </span>
          </div>
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Textures Generated</span>
            <span className="text-xs text-foreground">
              {processingStatus?.texturesGenerated || 0}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Elapsed Time</span>
            <span className="text-xs text-foreground">
              {processingStatus?.elapsedTime ? formatTime(processingStatus.elapsedTime / 1000) : '0s'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
