import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import Landing from "@/pages/landing";
import Onboarding from "@/pages/onboarding";
import Dashboard from "@/pages/dashboard";
import Evolution from "@/pages/evolution";
import Leagues from "@/pages/leagues";
import Marketplace from "@/pages/marketplace";
import Account from "@/pages/account";
import WorkoutDetail from "@/pages/workout-detail";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component, path }: { component: React.ComponentType; path: string }) {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-muted-foreground">Carregando...</div>
      </div>
    );
  }

  if (!user) {
    return <Redirect to="/" />;
  }

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/onboarding" component={Onboarding} />
      <Route path="/dashboard">
        {() => <ProtectedRoute component={Dashboard} path="/dashboard" />}
      </Route>
      <Route path="/evolution">
        {() => <ProtectedRoute component={Evolution} path="/evolution" />}
      </Route>
      <Route path="/leagues">
        {() => <ProtectedRoute component={Leagues} path="/leagues" />}
      </Route>
      <Route path="/marketplace">
        {() => <ProtectedRoute component={Marketplace} path="/marketplace" />}
      </Route>
      <Route path="/account">
        {() => <ProtectedRoute component={Account} path="/account" />}
      </Route>
      <Route path="/workout/:id">
        {() => <ProtectedRoute component={WorkoutDetail} path="/workout/:id" />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <div className="dark">
            <Toaster />
            <Router />
          </div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
