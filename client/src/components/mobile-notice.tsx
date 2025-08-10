import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Monitor, Smartphone, AlertCircle, ExternalLink } from "lucide-react";

interface MobileNoticeProps {
  feature?: string;
  showDesktopButton?: boolean;
}

export default function MobileNotice({ feature = "feature", showDesktopButton = true }: MobileNoticeProps) {
  // Mobile limitations have been removed - return null to disable all mobile notices
  return null;
}