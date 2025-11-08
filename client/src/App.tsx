import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "@/pages/landing";
import Onboarding from "@/pages/onboarding";
import Dashboard from "@/pages/dashboard";
import Evolution from "@/pages/evolution";
import Leagues from "@/pages/leagues";
import Marketplace from "@/pages/marketplace";
import Account from "@/pages/account";
import WorkoutDetail from "@/pages/workout-detail";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/evolution" component={Evolution} />
      <Route path="/leagues" component={Leagues} />
      <Route path="/marketplace" component={Marketplace} />
      <Route path="/account" component={Account} />
      <Route path="/workout/:date" component={WorkoutDetail} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="dark">
          <Toaster />
          <Router />
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
