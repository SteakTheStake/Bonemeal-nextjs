import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/navbar";
import MobileNav from "@/components/mobile-nav";
import { MinecraftFarmlandFooter } from "@/components/water-drops";
import { useDeviceType } from "@/hooks/useDeviceType";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Projects from "@/pages/projects";
import Greenhouse from "@/pages/greenhouse";
import Docs from "@/pages/docs";
import JoinProject from "@/pages/join-project";
import { useLocation } from "wouter";

function Router() {
  const { isMobile } = useDeviceType();

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 relative flex flex-col">
      <div className="relative z-20 flex-1">
        {/* Show mobile nav on mobile, desktop nav on desktop */}
        {isMobile ? <MobileNav /> : <Navbar />}
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/projects" component={Projects} />
          <Route path="/greenhouse" component={Greenhouse} />
          <Route path="/docs" component={Docs} />
          <Route path="/join/:inviteCode" component={JoinProject} />
          <Route component={NotFound} />
        </Switch>
      </div>
      <MinecraftFarmlandFooter />
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
