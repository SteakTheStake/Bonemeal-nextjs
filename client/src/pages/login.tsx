import { useEffect } from "react";
import { Link, useLocation } from "wouter";
import { LogIn, Shield, Users, Zap, ArrowRight, CheckCircle, Globe, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import bonemeaLogo from "@assets/SkyBlock_items_enchanted_bonemeal_1752287919002.gif";

export default function Login() {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  // Redirect if already logged in
  useEffect(() => {
    if (!isLoading && user) {
      setLocation('/');
    }
  }, [user, isLoading, setLocation]);

  const benefits = [
    {
      icon: CheckCircle,
      title: "Save Your Work",
      description: "Projects and settings sync across all your devices"
    },
    {
      icon: Zap,
      title: "Advanced Features",
      description: "Access AI tools, batch processing, and premium templates"
    },
    {
      icon: Users,
      title: "Project Sharing",
      description: "Collaborate with others and share your texture packs"
    },
    {
      icon: Globe,
      title: "Cloud Storage",
      description: "Your textures are safely stored and backed up"
    }
  ];

  const securityFeatures = [
    "Discord OAuth 2.0 secure authentication",
    "No passwords stored on our servers",
    "Data encrypted in transit and at rest",
    "You control your data and privacy"
  ];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background organic-bg flex items-center justify-center">
        <div className="flex items-center gap-3 text-muted-foreground">
          <div className="w-6 h-6 border-2 border-primary/20 border-t-primary rounded-full animate-spin" />
          <span>Checking authentication...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background organic-bg">
      {/* Header */}
      <header className="glass-card border-b living-border px-4 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img 
              src={bonemeaLogo} 
              alt="Bonemeal" 
              className="w-8 h-8 floating" 
              style={{ imageRendering: 'pixelated' }}
            />
            <div>
              <h1 className="text-xl font-bold text-primary">Bonemeal</h1>
              <p className="text-xs text-muted-foreground">Texture Lab</p>
            </div>
          </Link>
          
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowRight className="w-4 h-4 mr-2" />
              Back to App
            </Button>
          </Link>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="grid md:grid-cols-2 gap-8 items-start">
          {/* Login Card */}
          <div className="space-y-6">
            <Card className="glass-card border-primary/20">
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl flex items-center justify-center gap-3">
                  <LogIn className="w-6 h-6 text-primary" />
                  Welcome to Bonemeal
                </CardTitle>
                <p className="text-muted-foreground">
                  Login to access the full texture conversion experience
                </p>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-4">
                  <a href="/api/auth/discord" className="block">
                    <Button size="lg" className="w-full h-14 text-lg moss-texture">
                      <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
                      </svg>
                      Continue with Discord
                    </Button>
                  </a>

                  <div className="text-center text-xs text-muted-foreground">
                    By continuing, you agree to our terms of service and privacy policy
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Security Info */}
            <Card className="glass-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  Secure & Private
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <ul className="space-y-2">
                  {securityFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Lock className="w-3 h-3 text-primary mt-0.5 flex-shrink-0" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Benefits */}
          <div className="space-y-6">
            <div>
              <h2 className="text-2xl font-bold mb-2">Why Create an Account?</h2>
              <p className="text-muted-foreground">
                Unlock the full potential of Bonemeal with these member benefits:
              </p>
            </div>

            <div className="space-y-4">
              {benefits.map((benefit, index) => (
                <Card key={index} className="glass-card hover:bg-accent/10 transition-colors">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <benefit.icon className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-medium mb-1">{benefit.title}</h3>
                        <p className="text-sm text-muted-foreground">{benefit.description}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Card className="glass-card border-primary/20">
              <CardContent className="p-4">
                <div className="text-center">
                  <div className="mb-2">
                    <Badge variant="secondary" className="text-xs">
                      Free Forever
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    No subscription required. All core features are completely free.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Guest Mode Notice */}
        <div className="mt-12 text-center">
          <Card className="glass-card max-w-2xl mx-auto">
            <CardContent className="p-6">
              <h3 className="text-lg font-medium mb-2">Continue as Guest?</h3>
              <p className="text-sm text-muted-foreground mb-4">
                You can use Bonemeal without logging in, but your work won't be saved and you'll have limited access to advanced features.
              </p>
              <Link href="/">
                <Button variant="outline" size="sm">
                  Continue as Guest
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}