import { useState, useEffect } from "react";
import { Link } from "wouter";
import { LogIn, X, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";

interface AuthTooltipProps {
  children: React.ReactNode;
  message?: string;
  showOnHover?: boolean;
}

export default function AuthTooltip({ 
  children, 
  message = "Login required to access this feature", 
  showOnHover = true 
}: AuthTooltipProps) {
  const { user, isLoading } = useAuth();
  const [showPersistent, setShowPersistent] = useState(false);

  // Show persistent tooltip for important actions when not logged in
  useEffect(() => {
    if (!isLoading && !user) {
      const timer = setTimeout(() => {
        setShowPersistent(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [user, isLoading]);

  if (isLoading) {
    return <div className="opacity-50">{children}</div>;
  }

  if (user) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider>
      <div className="relative">
        <Tooltip open={showOnHover ? undefined : showPersistent}>
          <TooltipTrigger asChild>
            <div className="relative cursor-not-allowed opacity-75">
              {children}
              <div className="absolute inset-0 bg-background/20 backdrop-blur-[1px] rounded-md" />
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-sm">
            <LoginPrompt message={message} onClose={() => setShowPersistent(false)} />
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}

interface LoginPromptProps {
  message: string;
  onClose?: () => void;
  compact?: boolean;
}

export function LoginPrompt({ message, onClose, compact = false }: LoginPromptProps) {
  if (compact) {
    return (
      <div className="p-3 space-y-2">
        <div className="flex items-center gap-2 text-sm font-medium">
          <Shield className="w-4 h-4 text-primary" />
          Login Required
        </div>
        <p className="text-xs text-muted-foreground">{message}</p>
        <a href="/api/auth/discord" className="block">
          <Button size="sm" className="w-full">
            <LogIn className="w-4 h-4 mr-2" />
            Login with Discord
          </Button>
        </a>
      </div>
    );
  }

  return (
    <Card className="w-72 border-primary/20">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4 text-primary" />
            Login Required
          </CardTitle>
          {onClose && (
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onClose}>
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">{message}</p>
          
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Shield className="w-3 h-3" />
            <span>Secure authentication via Discord</span>
          </div>
          
          <a href="/api/auth/discord" className="block">
            <Button className="w-full moss-texture">
              <LogIn className="w-4 h-4 mr-2" />
              Continue with Discord
            </Button>
          </a>
          
          <div className="text-center">
            <Link href="/login">
              <Button variant="link" size="sm" className="text-xs h-auto p-0">
                Learn more about login
              </Button>
            </Link>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Persistent notification component for mobile
export function MobileAuthNotification() {
  const { user, isLoading } = useAuth();
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const wasDismissed = localStorage.getItem('authNotificationDismissed');
    if (wasDismissed) {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    localStorage.setItem('authNotificationDismissed', 'true');
  };

  if (isLoading || user || dismissed) {
    return null;
  }

  return (
    <div className="fixed top-16 left-4 right-4 z-50 md:hidden">
      <Card className="mobile-glass border-primary/20 shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <User className="w-4 h-4 text-primary" />
                <span className="text-sm font-medium">Login to unlock all features</span>
              </div>
              <p className="text-xs text-muted-foreground mb-3">
                Save your work, access advanced tools, and sync across devices
              </p>
              <div className="flex gap-2">
                <a href="/api/auth/discord" className="flex-1">
                  <Button size="sm" className="w-full">
                    <LogIn className="w-3 h-3 mr-1" />
                    Login
                  </Button>
                </a>
                <Button variant="outline" size="sm" onClick={handleDismiss}>
                  Later
                </Button>
              </div>
            </div>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={handleDismiss}>
              <X className="w-3 h-3" />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}