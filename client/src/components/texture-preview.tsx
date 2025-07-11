import { useState } from "react";
import { ExpandIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type ConversionJob, type TextureFile } from "@shared/schema";

interface TexturePreviewProps {
  job: ConversionJob | undefined;
  textureFiles: TextureFile[] | undefined;
}

export function TexturePreview({ job, textureFiles }: TexturePreviewProps) {
  const [zoom, setZoom] = useState("100");

  if (!job) {
    return (
      <div className="flex-1 flex items-center justify-center text-muted-foreground">
        <p>No job selected</p>
      </div>
    );
  }

  return (
    <div className="h-full p-6">
      <div className="h-full elevated rounded-lg overflow-hidden">
        {/* Preview Header */}
        <div className="surface px-4 py-3 border-b border-border">
          <div className="flex items-center justify-between">
            <h3 className="font-medium">{job.filename}</h3>
            <div className="flex items-center space-x-2">
              <Select value={zoom} onValueChange={setZoom}>
                <SelectTrigger className="w-20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="25">25%</SelectItem>
                  <SelectItem value="50">50%</SelectItem>
                  <SelectItem value="75">75%</SelectItem>
                  <SelectItem value="100">100%</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="ghost" size="sm">
                <ExpandIcon className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Preview Grid */}
        <div className="p-4 h-full overflow-auto">
          {job.status === 'processing' ? (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Processing textures...</p>
              </div>
            </div>
          ) : job.status === 'completed' ? (
            <div className="grid grid-cols-3 gap-4 h-full">
              {/* Original */}
              <div className="surface rounded-lg overflow-hidden">
                <div className="bg-muted px-3 py-2 text-xs font-medium">Original</div>
                <div className="aspect-square bg-muted flex items-center justify-center text-muted-foreground text-xs">
                  Original Image
                </div>
              </div>

              {/* Base Color */}
              <div className="surface rounded-lg overflow-hidden">
                <div className="bg-muted px-3 py-2 text-xs font-medium">Base Color</div>
                <div className="aspect-square bg-muted flex items-center justify-center text-muted-foreground text-xs">
                  Generated
                </div>
              </div>

              {/* Roughness */}
              <div className="surface rounded-lg overflow-hidden">
                <div className="bg-muted px-3 py-2 text-xs font-medium">Roughness</div>
                <div className="aspect-square bg-muted flex items-center justify-center text-muted-foreground text-xs">
                  Generated
                </div>
              </div>

              {/* Normal Map */}
              <div className="surface rounded-lg overflow-hidden">
                <div className="bg-muted px-3 py-2 text-xs font-medium">Normal Map</div>
                <div className="aspect-square bg-muted flex items-center justify-center text-muted-foreground text-xs">
                  Generated
                </div>
              </div>

              {/* Height Map */}
              <div className="surface rounded-lg overflow-hidden">
                <div className="bg-muted px-3 py-2 text-xs font-medium">Height Map</div>
                <div className="aspect-square bg-muted flex items-center justify-center text-muted-foreground text-xs">
                  Generated
                </div>
              </div>

              {/* AO */}
              <div className="surface rounded-lg overflow-hidden">
                <div className="bg-muted px-3 py-2 text-xs font-medium">Ambient Occlusion</div>
                <div className="aspect-square bg-muted flex items-center justify-center text-muted-foreground text-xs">
                  Generated
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              <p>Processing failed. Check the validation panel for details.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
