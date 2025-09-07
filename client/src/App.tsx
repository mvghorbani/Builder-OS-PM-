import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Dashboard from "./pages/dashboard";
import Analytics from "./pages/analytics";
import Schedule from "./pages/schedule";
import Budget from "./pages/budget";
import BudgetTrackingPage from "./pages/budget-tracking";
import Vendors from "./pages/vendors";
import Permits from "./pages/permits";
import Documents from "./pages/documents";
import Projects from "./pages/projects";


function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
          <Route path="/dashboard" component={Dashboard} />
          <Route path="/analytics" component={Analytics} />
          <Route path="/schedule" component={Schedule} />
          <Route path="/budget" component={Budget} />
          <Route path="/budget/tracking" component={BudgetTrackingPage} />
          <Route path="/vendors" component={Vendors} />
          <Route path="/permits" component={Permits} />
          <Route path="/documents" component={Documents} />
          <Route path="/projects" component={Projects} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
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
