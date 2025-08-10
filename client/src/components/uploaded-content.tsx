import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Download, Eye, FileImage, Calendar, HardDrive } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface UploadedFile {
  id: number;
  userId: string;
  fileName: string;
  fileSize: number;
  fileType: string;
  uploadDate: Date;
  fileUrl?: string;
  thumbnailUrl?: string;
  metadata?: any;
}

export function UploadedContent() {
  const { toast } = useToast();
  const [selectedFile, setSelectedFile] = useState<UploadedFile | null>(null);

  const { data: files, isLoading } = useQuery<UploadedFile[]>({
    queryKey: ["/api/uploaded-content"],
    retry: false,
  });

  const deleteMutation = useMutation({
    mutationFn: async (fileId: number) => {
      await apiRequest("DELETE", `/api/uploaded-content/${fileId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/uploaded-content"] });
      toast({
        title: "File deleted",
        description: "The file has been removed from your library.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to delete the file. Please try again.",
        variant: "destructive",
      });
    },
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  const handleDownload = (file: UploadedFile) => {
    if (file.fileUrl) {
      const link = document.createElement('a');
      link.href = file.fileUrl;
      link.download = file.fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-muted-foreground">Loading your content...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col p-4">
      <div className="mb-4">
        <h2 className="text-2xl font-bold text-foreground">Your Uploaded Content</h2>
        <p className="text-muted-foreground">
          Access all your previously uploaded textures and files
        </p>
      </div>

      {files && files.length > 0 ? (
        <ScrollArea className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {files.map((file) => (
              <Card key={file.id} className="glass-card moss-texture hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <FileImage className="h-5 w-5 text-primary" />
                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => setSelectedFile(file)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={() => handleDownload(file)}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8 text-destructive"
                        onClick={() => deleteMutation.mutate(file.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  <CardTitle className="text-sm truncate">{file.fileName}</CardTitle>
                  <CardDescription className="text-xs">
                    {file.fileType}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {file.thumbnailUrl && (
                    <div className="mb-3">
                      <img 
                        src={file.thumbnailUrl} 
                        alt={file.fileName}
                        className="w-full h-32 object-cover rounded-md"
                      />
                    </div>
                  )}
                  <div className="space-y-1 text-xs text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <HardDrive className="h-3 w-3" />
                      <span>{formatFileSize(file.fileSize)}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      <span>{formatDistanceToNow(new Date(file.uploadDate), { addSuffix: true })}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </ScrollArea>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center space-y-4">
            <FileImage className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="text-lg font-semibold text-foreground">No uploaded content yet</h3>
              <p className="text-sm text-muted-foreground">
                Files you upload will appear here for easy access
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {selectedFile && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedFile(null)}
        >
          <Card className="max-w-2xl w-full max-h-[80vh] overflow-auto glass-card">
            <CardHeader>
              <CardTitle>{selectedFile.fileName}</CardTitle>
              <CardDescription>
                {selectedFile.fileType} • {formatFileSize(selectedFile.fileSize)}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedFile.fileUrl && selectedFile.fileType.startsWith('image/') && (
                <img 
                  src={selectedFile.fileUrl} 
                  alt={selectedFile.fileName}
                  className="w-full rounded-lg"
                />
              )}
              <div className="mt-4 flex gap-2">
                <Button onClick={() => handleDownload(selectedFile)}>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button variant="outline" onClick={() => setSelectedFile(null)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}