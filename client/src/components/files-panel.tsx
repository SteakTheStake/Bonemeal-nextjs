import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { File, Package, CheckCircle, AlertTriangle, XCircle, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ValidationResults } from "./validation-results";
import type { ConversionJob, TextureFile } from "@shared/schema";

interface FilesPanelProps {
  selectedJob: ConversionJob | null;
  validationResults: any;
  isValidating: boolean;
}

export function FilesPanel({ selectedJob, validationResults, isValidating }: FilesPanelProps) {
  const [showValidationResults, setShowValidationResults] = useState(false);

  // Query for texture files if we have a selected job
  const { data: textureFiles, isLoading: filesLoading } = useQuery({
    queryKey: ["/api/jobs", selectedJob?.id, "files"],
    enabled: !!selectedJob?.id,
  });

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'valid':
        return <CheckCircle className="h-3 w-3 text-success" />;
      case 'warning':
        return <AlertTriangle className="h-3 w-3 text-warning" />;
      case 'error':
        return <XCircle className="h-3 w-3 text-error" />;
      default:
        return <File className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'valid':
        return 'text-success';
      case 'warning':
        return 'text-warning';
      case 'error':
        return 'text-error';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="p-4 space-y-4 h-full flex flex-col">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Files & Validation</h3>
        {validationResults && (
          <Button
            onClick={() => setShowValidationResults(!showValidationResults)}
            variant="outline"
            size="sm"
            className="grow-button moss-texture"
          >
            <Eye className="h-3 w-3 mr-2" />
            {showValidationResults ? 'Hide Results' : 'Show Results'}
          </Button>
        )}
      </div>

      {/* Validation Results Section */}
      {showValidationResults && (
        <Card className="moss-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Validation Results</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ValidationResults 
              results={validationResults} 
              isLoading={isValidating} 
            />
          </CardContent>
        </Card>
      )}

      {/* Current Job Files */}
      {selectedJob && (
        <Card className="moss-card flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center space-x-2">
              <Package className="h-4 w-4" />
              <span>Current Job Files</span>
            </CardTitle>
            <CardDescription className="text-xs">
              {selectedJob.filename} - {selectedJob.status}
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-64">
              {filesLoading ? (
                <div className="p-4 text-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto mb-2"></div>
                  <p className="text-xs text-muted-foreground">Loading files...</p>
                </div>
              ) : textureFiles && textureFiles.length > 0 ? (
                <div className="space-y-1 p-2">
                  {textureFiles.map((file: TextureFile, index: number) => (
                    <div
                      key={index}
                      className="flex items-center justify-between p-2 bg-muted/50 rounded text-xs hover:bg-muted/70 transition-colors"
                    >
                      <div className="flex items-center space-x-2 flex-1 min-w-0">
                        {getStatusIcon(file.validationStatus || 'unknown')}
                        <span className="truncate" title={file.originalPath}>
                          {file.filename}
                        </span>
                        {file.textureType && (
                          <Badge variant="secondary" className="text-xs px-1 py-0">
                            {file.textureType}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                        <span>{formatFileSize(file.fileSize || 0)}</span>
                        <span className={getStatusColor(file.validationStatus || 'unknown')}>
                          {file.validationStatus || 'pending'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-muted-foreground">
                  <File className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">No files found</p>
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {/* Instructions when no job selected */}
      {!selectedJob && !validationResults && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center text-muted-foreground">
            <Package className="h-12 w-12 mx-auto mb-3 opacity-50" />
            <p className="text-sm mb-1">No files selected</p>
            <p className="text-xs">Upload or validate files to see them here</p>
          </div>
        </div>
      )}

      {/* Show validation results when available but no job */}
      {!selectedJob && validationResults && (
        <Card className="moss-card flex-1">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Validation Results</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ValidationResults 
              results={validationResults} 
              isLoading={isValidating} 
            />
          </CardContent>
        </Card>
      )}

      {/* Download button for completed jobs */}
      {selectedJob && selectedJob.status === 'completed' && (
        <Button 
          className="w-full grow-button moss-texture"
          onClick={() => {
            window.open(`/api/jobs/${selectedJob.id}/download`, '_blank');
          }}
        >
          <Download className="h-4 w-4 mr-2" />
          Download Converted Pack
        </Button>
      )}
    </div>
  );
}