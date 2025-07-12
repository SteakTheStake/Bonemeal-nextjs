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
      console.log('Uploading file:', file.name, 'Size:', file.size, 'Type:', file.type);
      
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

      console.log('Sending request to /api/upload');
      const response = await apiRequest("POST", "/api/upload", formData);
      console.log('Upload response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Upload error response:', errorText);
        throw new Error(`Upload failed: ${response.status} ${response.statusText}`);
      }
      
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
    console.log('handleFileUpload called with file:', file.name, 'size:', file.size, 'type:', file.type);
    
    // Validate file type
    const validExtensions = ['.png', '.jpg', '.jpeg', '.tiff', '.tga', '.zip'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    console.log('File extension:', fileExtension);
    
    if (!validExtensions.includes(fileExtension)) {
      console.log('Invalid file type:', fileExtension);
      toast({
        title: "Invalid file type",
        description: "Please upload a PNG, JPG, TIFF, TGA, or ZIP file.",
        variant: "destructive",
      });
      return;
    }

    // Check file size (200MB limit)
    if (file.size > 200 * 1024 * 1024) {
      console.log('File too large:', file.size);
      toast({
        title: "File too large",
        description: "Maximum file size is 200MB.",
        variant: "destructive",
      });
      return;
    }

    // Check if file is empty
    if (file.size === 0) {
      console.log('File is empty');
      toast({
        title: "Empty file",
        description: "Please select a valid file.",
        variant: "destructive",
      });
      return;
    }

    console.log('File validation passed, starting upload...');
    uploadMutation.mutate(file);
  };

  const handleBrowseFiles = () => {
    console.log('Browse files button clicked');
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".png,.jpg,.jpeg,.tiff,.tga,.zip";
    input.onchange = (e) => {
      console.log('File input changed');
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        console.log('File selected:', file.name);
        handleFileUpload(file);
      } else {
        console.log('No file selected');
      }
    };
    input.click();
  };

  return (
    <div className="flex-1 p-6">
      <div 
        className={`h-full border-2 border-dashed rounded-lg flex flex-col items-center justify-center transition-colors glass-card vine-texture ${
          isDragging ? "living-border bg-primary/10" : "border-border hover:living-border"
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="text-center">
          <CloudUpload className="h-16 w-16 text-primary mb-4 mx-auto floating" />
          <h3 className="text-xl font-medium mb-2 text-primary">Drop your textures here</h3>
          <p className="text-muted-foreground mb-2">
            Supported formats: PNG, JPG, TIFF, TGA, ZIP
          </p>
          <p className="text-sm text-primary mb-4 branch-sway">
            🌱 Let Bonemeal grow your texture productivity
          </p>
          <div className="space-y-2">
            <Button 
              onClick={handleBrowseFiles}
              disabled={uploadMutation.isPending}
              className="grow-button moss-texture"
            >
              <FolderOpen className="h-4 w-4 mr-2 branch-sway" />
              {uploadMutation.isPending ? "Growing with Bonemeal..." : "Browse Files"}
            </Button>
            
            {/* Visible file input for testing */}
            <input
              type="file"
              accept=".png,.jpg,.jpeg,.tiff,.tga,.zip"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  console.log('Direct file input selected:', file.name);
                  handleFileUpload(file);
                }
              }}
              className="block w-full text-sm text-muted-foreground file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-primary-foreground hover:file:bg-primary/80"
            />
            
            <div className="text-xs text-muted-foreground">
              or drag a resource pack ZIP file (max 200MB)
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
