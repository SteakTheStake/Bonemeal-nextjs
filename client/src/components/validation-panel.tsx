import { useState } from "react";
import { type ConversionJob, type TextureFile, type ValidationIssue } from "@shared/schema";
import { CheckCircle, AlertTriangle, XCircle, ChevronDown, ChevronUp, Info, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ValidationPanelProps {
  job: ConversionJob | undefined;
  textureFiles: TextureFile[] | undefined;
}

export function ValidationPanel({ job, textureFiles }: ValidationPanelProps) {
  const [expandedSections, setExpandedSections] = useState({
    errors: true,
    warnings: false,
    info: false,
    files: false
  });
  const [showDetails, setShowDetails] = useState(false);

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

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
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-medium">LabPBR Validation</h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => setShowDetails(!showDetails)}
          className="h-6 text-xs"
        >
          {showDetails ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
          {showDetails ? 'Hide' : 'Details'}
        </Button>
      </div>
      
      {/* Validation Summary */}
      <div className="mb-4 space-y-2">
        <div className="flex items-center justify-between p-2 bg-success/20 rounded">
          <span className="text-xs text-success flex items-center">
            <CheckCircle className="h-3 w-3 mr-1" />
            Valid Textures
          </span>
          <span className="text-xs text-success">{validFiles.length}</span>
        </div>
        
        <Collapsible open={expandedSections.warnings}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full p-2 bg-warning/20 rounded flex items-center justify-between hover:bg-warning/30"
              onClick={() => toggleSection('warnings')}
            >
              <span className="text-xs text-warning flex items-center">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Warnings
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-warning">{warningIssues.length}</span>
                {expandedSections.warnings ? 
                  <ChevronUp className="h-3 w-3" /> : 
                  <ChevronDown className="h-3 w-3" />
                }
              </div>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            {warningIssues.length > 0 && (
              <div className="space-y-1 ml-4">
                {warningIssues.slice(0, showDetails ? undefined : 3).map((issue, index) => (
                  <Card key={index} className="border-warning/30">
                    <CardContent className="p-2">
                      <div className="text-xs text-warning">{issue.message}</div>
                      {issue.filename && (
                        <div className="text-xs text-muted-foreground mt-1">
                          File: {issue.filename}
                        </div>
                      )}
                      {issue.suggestion && showDetails && (
                        <div className="text-xs text-muted-foreground mt-1 italic">
                          💡 {issue.suggestion}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {!showDetails && warningIssues.length > 3 && (
                  <div className="text-xs text-muted-foreground text-center">
                    +{warningIssues.length - 3} more warnings
                  </div>
                )}
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
        
        <Collapsible open={expandedSections.errors}>
          <CollapsibleTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full p-2 bg-error/20 rounded flex items-center justify-between hover:bg-error/30"
              onClick={() => toggleSection('errors')}
            >
              <span className="text-xs text-error flex items-center">
                <XCircle className="h-3 w-3 mr-1" />
                Errors
              </span>
              <div className="flex items-center gap-2">
                <span className="text-xs text-error">{criticalIssues.length}</span>
                {expandedSections.errors ? 
                  <ChevronUp className="h-3 w-3" /> : 
                  <ChevronDown className="h-3 w-3" />
                }
              </div>
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="pt-2">
            {criticalIssues.length > 0 && (
              <div className="space-y-1 ml-4">
                {criticalIssues.slice(0, showDetails ? undefined : 3).map((issue, index) => (
                  <Card key={index} className="border-error/30">
                    <CardContent className="p-2">
                      <div className="text-xs text-error font-medium">{issue.message}</div>
                      {issue.filename && (
                        <div className="text-xs text-muted-foreground mt-1">
                          File: {issue.filename}
                        </div>
                      )}
                      {issue.suggestion && showDetails && (
                        <div className="text-xs text-muted-foreground mt-1 italic">
                          💡 {issue.suggestion}
                        </div>
                      )}
                      {issue.channel && showDetails && (
                        <div className="text-xs text-muted-foreground mt-1">
                          Channel: {issue.channel}
                          {issue.value !== undefined && ` (${issue.value})`}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
                {!showDetails && criticalIssues.length > 3 && (
                  <div className="text-xs text-muted-foreground text-center">
                    +{criticalIssues.length - 3} more errors
                  </div>
                )}
              </div>
            )}
          </CollapsibleContent>
        </Collapsible>
        
        {showDetails && (
          <Collapsible open={expandedSections.info}>
            <CollapsibleTrigger asChild>
              <Button 
                variant="ghost" 
                className="w-full p-2 bg-info/20 rounded flex items-center justify-between hover:bg-info/30"
                onClick={() => toggleSection('info')}
              >
                <span className="text-xs text-info flex items-center">
                  <Info className="h-3 w-3 mr-1" />
                  Information
                </span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-info">{infoIssues.length}</span>
                  {expandedSections.info ? 
                    <ChevronUp className="h-3 w-3" /> : 
                    <ChevronDown className="h-3 w-3" />
                  }
                </div>
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              {infoIssues.length > 0 && (
                <div className="space-y-1 ml-4">
                  {infoIssues.map((issue, index) => (
                    <Card key={index} className="border-info/30">
                      <CardContent className="p-2">
                        <div className="text-xs text-info">{issue.message}</div>
                        {issue.filename && (
                          <div className="text-xs text-muted-foreground mt-1">
                            File: {issue.filename}
                          </div>
                        )}
                        {issue.suggestion && (
                          <div className="text-xs text-muted-foreground mt-1 italic">
                            💡 {issue.suggestion}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CollapsibleContent>
          </Collapsible>
        )}
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
