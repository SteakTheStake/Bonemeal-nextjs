import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CloudUpload, FolderOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface UploadZoneProps {
  onJobCreated: (jobId: number) => void;
}

export function UploadZone({ onJobCreated }: UploadZoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("settings", JSON.stringify({
        generateBaseColor: true,
        generateRoughness: true,
        generateNormal: true,
        generateHeight: true,
        generateAO: true,
        baseColorContrast: 1.2,
        roughnessIntensity: 0.8,
        roughnessInvert: false,
        normalStrength: 1.0,
        heightDepth: 0.25,
        aoRadius: 0.5,
        inputType: file.name.endsWith('.zip') ? 'resourcepack' : 'single',
        advancedProcessing: {
          enableBulkResize: false,
          baseColorResolution: 256,
          specularResolution: 256,
          normalResolution: 256,
          baseColorInterpolation: 'cubic',
          specularInterpolation: 'linear',
          normalInterpolation: 'lanczos',
          enableCompression: false,
          compressionQuality: 85,
          enableDithering: false,
          enableCTMSplit: false,
          ctmVariations: 47
        }
      }));

      const response = await apiRequest("POST", "/api/upload", formData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Upload successful",
        description: "Your file has been uploaded and processing has started.",
      });
      onJobCreated(data.jobId);
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
    },
    onError: (error) => {
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileUpload(files[0]);
    }
  }, []);

  const handleFileUpload = (file: File) => {
    // Validate file type
    const validExtensions = ['.png', '.jpg', '.jpeg', '.tiff', '.tga', '.zip'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!validExtensions.includes(fileExtension)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a PNG, JPG, TIFF, TGA, or ZIP file.",
        variant: "destructive",
      });
      return;
    }

    // Check file size (200MB limit)
    if (file.size > 200 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 200MB.",
        variant: "destructive",
      });
      return;
    }

    uploadMutation.mutate(file);
  };

  const handleBrowseFiles = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".png,.jpg,.jpeg,.tiff,.tga,.zip";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleFileUpload(file);
      }
    };
    input.click();
  };

  return (
    <div className="flex-1 p-6">
      <div 
        className={`h-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors ${
          isDragging ? "border-primary/50 bg-primary/5" : "border-border hover:border-primary/50"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <CloudUpload className="h-16 w-16 text-muted-foreground mb-4 mx-auto" />
          <h3 className="text-xl font-medium mb-2">Drop your images here</h3>
          <p className="text-muted-foreground mb-2">
            Supported formats: PNG, JPG, TIFF, TGA, ZIP
          </p>
          <p className="text-xs text-purple-400 mb-4">
            🌱 Let Bonemeal grow your texture productivity
          </p>
          <div className="space-y-2">
            <Button 
              onClick={handleBrowseFiles}
              disabled={uploadMutation.isPending}
            >
              <FolderOpen className="h-4 w-4 mr-2" />
              {uploadMutation.isPending ? "Processing with Bonemeal..." : "Browse Files"}
            </Button>
            <div className="text-xs text-muted-foreground">
              or drag a resource pack ZIP file (max 200MB)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
