import { Switch, Route, Redirect, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/lib/auth";
import { lazy, Suspense } from "react";
import Landing from "@/pages/landing";
const Onboarding = lazy(() => import("@/pages/onboarding"));
const Dashboard = lazy(() => import("@/pages/dashboard"));
const Evolution = lazy(() => import("@/pages/evolution"));
const Community = lazy(() => import("@/pages/community"));
const Shop = lazy(() => import("@/pages/shop"));
const Profile = lazy(() => import("@/pages/profile"));
const WorkoutDetail = lazy(() => import("@/pages/workout-detail"));
import NotFound from "@/pages/not-found";
import { MatrixLoader } from "@/components/ui/matrix-loader";
import { trackEvent } from "@/lib/analytics";
import { useEffect } from "react";

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
      <Route path="/community">
        {() => <ProtectedRoute component={Community} path="/community" />}
      </Route>
      <Route path="/shop">
        {() => <ProtectedRoute component={Shop} path="/shop" />}
      </Route>
      <Route path="/profile">
        {() => <ProtectedRoute component={Profile} path="/profile" />}
      </Route>
      <Route path="/profile/:id">
        {() => <ProtectedRoute component={Profile} path="/profile/:id" />}
      </Route>
      <Route path="/workout/:id">
        {() => <ProtectedRoute component={WorkoutDetail} path="/workout/:id" />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

import { useUserStore } from "@/stores/useUserStore";
import { useGameStore } from "@/stores/useGameStore";
import GamificationLayer from "@/components/features/GamificationLayer";

function StoreInitializer() {
  const { user } = useAuth();
  const { fetchSettings } = useUserStore();
  const { fetchEvents } = useGameStore();

  useEffect(() => {
    if (user) {
      fetchSettings();
      fetchEvents();
    }
  }, [user]);

  return null;
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <StoreInitializer />
        <GamificationLayer />
        <TooltipProvider>
          <div className="dark">
            <Toaster />
            <Suspense fallback={
              <div className="min-h-screen bg-dark-bg flex items-center justify-center p-8">
                <div className="w-full max-w-sm">
                  <MatrixLoader onComplete={() => { }} />
                  <p className="text-center text-primary-main text-[10px] font-black uppercase tracking-[0.5em] mt-4 animate-pulse">
                    Otimizando Protocolos...
                  </p>
                </div>
              </div>
            }>
              <Router />
            </Suspense>
          </div>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
