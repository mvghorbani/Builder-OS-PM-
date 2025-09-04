import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Home} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
  
  if (!clientId) {
    console.error("VITE_GOOGLE_CLIENT_ID is not set");
    return <div>Configuration error: Google Client ID not found</div>;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </QueryClientProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
