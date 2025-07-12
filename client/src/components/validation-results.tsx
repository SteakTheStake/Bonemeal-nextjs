import { CheckCircle, AlertTriangle, XCircle, FileText, Package } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ValidationResults {
  isValid: boolean;
  issues: ValidationIssue[];
  version: string;
  totalFiles: number;
  textureFiles: number;
  fileDetails: FileDetail[];
}

interface ValidationIssue {
  level: 'error' | 'warning' | 'info';
  message: string;
  suggestion?: string;
  filename?: string;
  path?: string;
  channel?: string;
  value?: number;
}

interface FileDetail {
  filename: string;
  path: string;
  validation: {
    isValid: boolean;
    issues: ValidationIssue[];
    version: string;
  };
  size: number;
}

interface ValidationResultsProps {
  results: ValidationResults | null;
  isLoading: boolean;
}

export function ValidationResults({ results, isLoading }: ValidationResultsProps) {
  if (isLoading) {
    return (
      <div className="p-4 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
        <p className="text-sm text-muted-foreground">Validating textures...</p>
      </div>
    );
  }

  if (!results) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <CheckCircle className="h-12 w-12 mx-auto mb-2 opacity-50" />
        <p>Click "Validate Only" to check your textures</p>
        <p className="text-xs mt-1">Get instant LabPBR compliance report</p>
      </div>
    );
  }

  const errorIssues = results.issues.filter(i => i.level === 'error');
  const warningIssues = results.issues.filter(i => i.level === 'warning');
  const infoIssues = results.issues.filter(i => i.level === 'info');

  const validFiles = results.fileDetails.filter(f => f.validation.isValid);
  const invalidFiles = results.fileDetails.filter(f => !f.validation.isValid);

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Validation Results</h3>
        <Badge variant={results.isValid ? "default" : "destructive"}>
          {results.isValid ? "Valid" : "Issues Found"}
        </Badge>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 gap-2">
        <Card className="moss-card">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <Package className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Total Files</p>
                <p className="text-sm font-medium">{results.totalFiles}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="moss-card">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <FileText className="h-4 w-4 text-primary" />
              <div>
                <p className="text-xs text-muted-foreground">Textures</p>
                <p className="text-sm font-medium">{results.textureFiles}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Issue Summary */}
      <div className="space-y-2">
        <div className="flex items-center justify-between p-2 bg-success/20 rounded">
          <span className="text-xs text-success flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" />
            Valid Textures
          </span>
          <span className="text-xs text-success">{validFiles.length}</span>
        </div>
        
        {warningIssues.length > 0 && (
          <div className="flex items-center justify-between p-2 bg-warning/20 rounded">
            <span className="text-xs text-warning flex items-center">
              <AlertTriangle className="h-3 w-3 mr-1" />
              Warnings
            </span>
            <span className="text-xs text-warning">{warningIssues.length}</span>
          </div>
        )}
        
        {errorIssues.length > 0 && (
          <div className="flex items-center justify-between p-2 bg-error/20 rounded">
            <span className="text-xs text-error flex items-center">
              <XCircle className="h-3 w-3 mr-1" />
              Errors
            </span>
            <span className="text-xs text-error">{errorIssues.length}</span>
          </div>
        )}
      </div>

      {/* Detailed Issues */}
      <ScrollArea className="max-h-96">
        <div className="space-y-2">
          {/* Error Issues */}
          {errorIssues.map((issue, index) => (
            <IssueCard key={`error-${index}`} issue={issue} />
          ))}
          
          {/* Warning Issues */}
          {warningIssues.map((issue, index) => (
            <IssueCard key={`warning-${index}`} issue={issue} />
          ))}
          
          {/* Info Issues */}
          {infoIssues.map((issue, index) => (
            <IssueCard key={`info-${index}`} issue={issue} />
          ))}

          {/* Show success message if no issues */}
          {results.issues.length === 0 && (
            <div className="text-center py-4">
              <CheckCircle className="h-8 w-8 text-success mx-auto mb-2" />
              <p className="text-sm text-success">All textures are LabPBR compliant!</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* File Details */}
      {results.fileDetails.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-xs font-medium text-muted-foreground">File Details</h4>
          <ScrollArea className="max-h-32">
            <div className="space-y-1">
              {results.fileDetails.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-muted/50 rounded text-xs">
                  <div className="flex items-center space-x-2">
                    {file.validation.isValid ? (
                      <CheckCircle className="h-3 w-3 text-success" />
                    ) : (
                      <XCircle className="h-3 w-3 text-error" />
                    )}
                    <span className="truncate max-w-[100px]" title={file.path}>
                      {file.filename}
                    </span>
                  </div>
                  <span className="text-muted-foreground">
                    {formatFileSize(file.size)}
                  </span>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
}

interface IssueCardProps {
  issue: ValidationIssue;
}

function IssueCard({ issue }: IssueCardProps) {
  const getIcon = () => {
    switch (issue.level) {
      case 'error':
        return <XCircle className="h-3 w-3 text-error" />;
      case 'warning':
        return <AlertTriangle className="h-3 w-3 text-warning" />;
      case 'info':
        return <CheckCircle className="h-3 w-3 text-primary" />;
      default:
        return <CheckCircle className="h-3 w-3 text-muted-foreground" />;
    }
  };

  const getTextColor = () => {
    switch (issue.level) {
      case 'error':
        return 'text-error';
      case 'warning':
        return 'text-warning';
      case 'info':
        return 'text-primary';
      default:
        return 'text-muted-foreground';
    }
  };

  return (
    <div className="p-2 border rounded-lg space-y-1">
      <div className="flex items-start space-x-2">
        {getIcon()}
        <div className="flex-1 min-w-0">
          <p className={`text-xs font-medium ${getTextColor()}`}>
            {issue.message}
          </p>
          {issue.filename && (
            <p className="text-xs text-muted-foreground truncate">
              {issue.filename}
            </p>
          )}
          {issue.suggestion && (
            <p className="text-xs text-muted-foreground mt-1">
              💡 {issue.suggestion}
            </p>
          )}
          {issue.channel && (
            <p className="text-xs text-muted-foreground">
              Channel: {issue.channel}
              {issue.value !== undefined && ` (${issue.value})`}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}