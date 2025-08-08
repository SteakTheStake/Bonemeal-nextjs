import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Navbar } from "@/components/navbar";
import { MinecraftFarmlandFooter } from "@/components/water-drops";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Projects from "@/pages/projects";
import Greenhouse from "@/pages/greenhouse";
import Docs from "@/pages/docs";
import JoinProject from "@/pages/join-project";
import { useLocation } from "wouter";

function Router() {
  return (
    <div className="min-h-screen bg-background text-foreground transition-colors duration-300 relative flex flex-col">
      <div className="relative z-20 flex-1">
        <Navbar />
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
