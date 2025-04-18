import { useEffect, useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { subscribeToAuthChanges } from "@/lib/auth";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import SignUp from "@/pages/SignUp";
import Dashboard from "@/pages/Dashboard";

// Import stylesheets for Font Awesome and other assets
import "@/lib/firebase"; // Initialize Firebase

function Router() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      setIsAuthenticated(!!user);
    });
    
    return () => unsubscribe();
  }, []);
  
  // Show loading indicator while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-secondary to-accent flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-primary font-medium">Loading app...</p>
        </div>
      </div>
    );
  }
  
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/signup" component={SignUp} />
      <Route path="/dashboard" component={Dashboard} />
      <Route path="/">
        {isAuthenticated ? <Dashboard /> : <Login />}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
