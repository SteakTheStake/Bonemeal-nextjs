import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Upload, 
  Play, 
  Pause, 
  RotateCcw, 
  CheckCircle, 
  AlertCircle,
  Clock,
  Zap,
  FolderOpen,
  FileImage,
  Loader2
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface QueueItem {
  id: string;
  name: string;
  size: number;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  progress: number;
  startTime?: number;
  endTime?: number;
  error?: string;
}

export default function BatchProcessor() {
  const [queue, setQueue] = useState<QueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newItems: QueueItem[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      status: 'pending' as const,
      progress: 0
    }));
    
    setQueue(prev => [...prev, ...newItems]);
    toast({
      title: `Added ${acceptedFiles.length} files to queue`,
      description: "Click 'Start Processing' to begin"
    });
  }, [toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.gif', '.tiff', '.tga'],
      'application/zip': ['.zip']
    },
    multiple: true
  });

  const startProcessing = async () => {
    toast({
      title: "Batch processing coming soon",
      description: "Batch uploads aren't wired up yet. Please convert files individually for now.",
    });
  };

  const pauseProcessing = () => {
    setIsPaused(true);
    setIsProcessing(false);
  };

  const resetQueue = () => {
    setQueue([]);
    setCurrentIndex(0);
    setIsProcessing(false);
    setIsPaused(false);
  };

  const getStatusIcon = (status: QueueItem['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'processing':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getProcessingTime = (item: QueueItem) => {
    if (!item.startTime) return '';
    const endTime = item.endTime || Date.now();
    const seconds = Math.floor((endTime - item.startTime) / 1000);
    return `${seconds}s`;
  };

  const completedCount = queue.filter(q => q.status === 'completed').length;
  const totalProgress = queue.length ? (completedCount / queue.length) * 100 : 0;

  return (
    <Card className="moss-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Batch Processing Pipeline
        </CardTitle>
        <CardDescription>
          Process multiple textures simultaneously with parallel processing
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Drop Zone */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-primary bg-primary/10' : 'border-gray-300 hover:border-primary'}`}
        >
          <input {...getInputProps()} />
          <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-lg font-medium">
            {isDragActive ? 'Drop files here' : 'Drag & drop files or click to browse'}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Supports PNG, JPG, TIFF, TGA, and ZIP files
          </p>
        </div>

        <p className="text-sm text-muted-foreground">
          Batch automation is still being wired up. The controls below remain available for preview, but
          conversions will need to be run individually for now.
        </p>

        {/* Controls */}
        {queue.length > 0 && (
          <>
            <div className="flex items-center justify-between">
              <div className="flex gap-2">
                {!isProcessing && !isPaused && (
                  <Button onClick={startProcessing} className="grow-button moss-texture">
                    <Play className="h-4 w-4 mr-2" />
                    Start Processing
                  </Button>
                )}
                {isProcessing && (
                  <Button onClick={pauseProcessing} variant="outline" className="grow-button">
                    <Pause className="h-4 w-4 mr-2" />
                    Pause
                  </Button>
                )}
                {isPaused && (
                  <Button onClick={startProcessing} className="grow-button moss-texture">
                    <Play className="h-4 w-4 mr-2" />
                    Resume
                  </Button>
                )}
                <Button onClick={resetQueue} variant="outline" className="grow-button">
                  <RotateCcw className="h-4 w-4 mr-2" />
                  Clear Queue
                </Button>
              </div>
              <div className="text-sm text-muted-foreground">
                {completedCount} of {queue.length} completed
              </div>
            </div>

            {/* Overall Progress */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Overall Progress</span>
                <span>{Math.round(totalProgress)}%</span>
              </div>
              <Progress value={totalProgress} className="h-2" />
            </div>

            {/* Queue Tabs */}
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="all">All ({queue.length})</TabsTrigger>
                <TabsTrigger value="pending">
                  Pending ({queue.filter(q => q.status === 'pending').length})
                </TabsTrigger>
                <TabsTrigger value="processing">
                  Processing ({queue.filter(q => q.status === 'processing').length})
                </TabsTrigger>
                <TabsTrigger value="completed">
                  Completed ({completedCount})
                </TabsTrigger>
              </TabsList>

              {['all', 'pending', 'processing', 'completed'].map(tab => (
                <TabsContent key={tab} value={tab}>
                  <ScrollArea className="h-[400px] w-full rounded-md border p-4">
                    <div className="space-y-2">
                      {queue
                        .filter(item => tab === 'all' || item.status === tab)
                        .map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                          >
                            <div className="flex items-center gap-3">
                              {getStatusIcon(item.status)}
                              <div>
                                <div className="flex items-center gap-2">
                                  <FileImage className="h-4 w-4" />
                                  <span className="font-medium">{item.name}</span>
                                  <Badge variant="outline" className="text-xs">
                                    {(item.size / 1024).toFixed(1)} KB
                                  </Badge>
                                </div>
                                {item.status === 'processing' && (
                                  <Progress value={item.progress} className="h-1 w-32 mt-1" />
                                )}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {item.status === 'completed' && (
                                <Badge variant="default" className="bg-green-500">
                                  Complete
                                </Badge>
                              )}
                              {item.status === 'processing' && (
                                <Badge variant="default" className="bg-blue-500">
                                  {item.progress}%
                                </Badge>
                              )}
                              {item.startTime && (
                                <span className="text-xs text-muted-foreground">
                                  {getProcessingTime(item)}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                    </div>
                  </ScrollArea>
                </TabsContent>
              ))}
            </Tabs>
          </>
        )}
      </CardContent>
    </Card>
  );
}