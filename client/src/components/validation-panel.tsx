import { type ConversionJob, type TextureFile, type ValidationIssue } from "@shared/schema";
import { CheckCircle, AlertTriangle, XCircle, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ValidationPanelProps {
  job: ConversionJob | undefined;
  textureFiles: TextureFile[] | undefined;
}

export function ValidationPanel({ job, textureFiles }: ValidationPanelProps) {
  if (!job) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <p>No job selected</p>
      </div>
    );
  }

  const validFiles = textureFiles?.filter(f => f.validationStatus === 'valid') || [];
  const warningFiles = textureFiles?.filter(f => f.validationStatus === 'warning') || [];
  const errorFiles = textureFiles?.filter(f => f.validationStatus === 'error') || [];

  const allIssues: (ValidationIssue & { filename: string })[] = [];
  textureFiles?.forEach(file => {
    if (file.validationIssues && Array.isArray(file.validationIssues)) {
      file.validationIssues.forEach((issue: ValidationIssue) => {
        allIssues.push({
          ...issue,
          filename: file.originalPath
        });
      });
    }
  });

  const criticalIssues = allIssues.filter(i => i.level === 'error');
  const warningIssues = allIssues.filter(i => i.level === 'warning');
  const infoIssues = allIssues.filter(i => i.level === 'info');

  return (
    <div className="p-4 flex flex-col h-full">
      <h3 className="text-sm font-medium mb-3">LabPBR Validation</h3>
      
      {/* Validation Summary */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center justify-between p-2 bg-success/20 rounded">
          <span className="text-xs text-success flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" />
            Valid Textures
          </span>
          <span className="text-xs text-success">{validFiles.length}</span>
        </div>
        <div className="flex items-center justify-between p-2 bg-warning/20 rounded">
          <span className="text-xs text-warning flex items-center">
            <AlertTriangle className="h-3 w-3 mr-1" />
            Warnings
          </span>
          <span className="text-xs text-warning">{warningIssues.length}</span>
        </div>
        <div className="flex items-center justify-between p-2 bg-error/20 rounded">
          <span className="text-xs text-error flex items-center">
            <XCircle className="h-3 w-3 mr-1" />
            Errors
          </span>
          <span className="text-xs text-error">{criticalIssues.length}</span>
        </div>
      </div>

      {/* Issue Details */}
      <ScrollArea className="flex-1">
        <div className="space-y-2">
          {/* Critical Errors */}
          {criticalIssues.map((issue, index) => (
            <IssueCard key={`error-${index}`} issue={issue} />
          ))}

          {/* Warnings */}
          {warningIssues.map((issue, index) => (
            <IssueCard key={`warning-${index}`} issue={issue} />
          ))}

          {/* Info */}
          {infoIssues.map((issue, index) => (
            <IssueCard key={`info-${index}`} issue={issue} />
          ))}

          {allIssues.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-2 text-success" />
              <p>No validation issues found</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}

interface IssueCardProps {
  issue: ValidationIssue & { filename: string };
}

function IssueCard({ issue }: IssueCardProps) {
  const getIcon = () => {
    switch (issue.level) {
      case 'error':
        return <XCircle className="h-3 w-3 text-error" />;
      case 'warning':
        return <AlertTriangle className="h-3 w-3 text-warning" />;
      default:
        return <CheckCircle className="h-3 w-3 text-success" />;
    }
  };

  const getTitle = () => {
    switch (issue.level) {
      case 'error':
        return 'Critical Error';
      case 'warning':
        return 'Warning';
      default:
        return 'Info';
    }
  };

  return (
    <div className="elevated rounded p-3">
      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-2">
            {getIcon()}
            <span className="text-xs font-medium">{getTitle()}</span>
          </div>
          <ChevronDown className="h-3 w-3 text-muted-foreground" />
        </CollapsibleTrigger>
        <CollapsibleContent className="mt-2">
          <div className="text-xs text-muted-foreground mb-1">{issue.filename}</div>
          <div className="text-xs text-foreground mb-1">{issue.message}</div>
          {issue.suggestion && (
            <div className="text-xs text-muted-foreground">
              Suggestion: {issue.suggestion}
            </div>
          )}
          {issue.channel && (
            <div className="text-xs text-muted-foreground">
              Channel: {issue.channel}
            </div>
          )}
          {issue.value !== undefined && (
            <div className="text-xs text-muted-foreground">
              Value: {issue.value}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
