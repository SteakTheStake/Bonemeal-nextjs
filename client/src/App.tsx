import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/navbar";
import MobileLayout from "@/components/mobile-layout";

import PWAInstallPrompt from "@/components/pwa-install-prompt";
import { MinecraftFarmlandFooter } from "@/components/water-drops";

import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Projects from "@/pages/projects";
import Greenhouse from "@/pages/greenhouse";
import Docs from "@/pages/docs";
import JoinProject from "@/pages/join-project";
import { useState, useEffect } from "react";

function Router() {
  const [location] = useLocation();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Use mobile layout for small screens
  if (isMobile) {
    return (
      <MobileLayout>
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/projects" component={Projects} />
          <Route path="/projects/:id" component={Projects} />
          <Route path="/docs" component={Docs} />
          <Route path="/join/:inviteCode" component={JoinProject} />
          <Route component={NotFound} />
        </Switch>
      </MobileLayout>
    );
  }

  // Desktop layout
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 relative flex flex-col">
      <div className="relative z-20 flex-1">
        <Navbar />
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/projects" component={Projects} />
          <Route path="/projects/:id" component={Projects} />
          <Route path="/greenhouse" component={Greenhouse} />
          <Route path="/docs" component={Docs} />
          <Route path="/join/:inviteCode" component={JoinProject} />
          <Route component={NotFound} />
        </Switch>
      </div>
      <MinecraftFarmlandFooter />
      <PWAInstallPrompt />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
