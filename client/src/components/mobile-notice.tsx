import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Monitor, Smartphone, AlertCircle, ExternalLink } from "lucide-react";

interface MobileNoticeProps {
  feature?: string;
  showDesktopButton?: boolean;
}

export default function MobileNotice({ feature = "feature", showDesktopButton = true }: MobileNoticeProps) {
  return (
    <Card className="glass-card border-amber-500/30 bg-amber-50/5 dark:bg-amber-900/10">
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <AlertCircle className="h-5 w-5 text-amber-500" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <Smartphone className="h-4 w-4 text-amber-600" />
              <span className="font-medium text-amber-700 dark:text-amber-400">Mobile Experience</span>
            </div>
            <p className="text-sm text-amber-600 dark:text-amber-300">
              This {feature} has limited functionality on mobile. For the full experience with advanced editing tools, 
              texture processing, and batch operations, please use a desktop computer.
            </p>
            {showDesktopButton && (
              <div className="flex items-center gap-2 pt-2">
                <Monitor className="h-4 w-4 text-amber-600" />
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="border-amber-500/30 text-amber-600 hover:bg-amber-50/10"
                  onClick={() => {
                    // Copy URL to clipboard for easy access on desktop
                    navigator.clipboard.writeText(window.location.href);
                  }}
                >
                  <ExternalLink className="h-3 w-3 mr-1" />
                  Copy URL for Desktop
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}