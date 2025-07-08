// src/components/LandingPageClient.tsx

"use client";

import { useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowRight, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "./LoadingSpinner";

export function LandingPageClient() {
  const { login, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const hasTriedLogin = useRef(false);
  const isInitialRender = useRef(true);

  // Automatically redirect to dashboard after successful login
  useEffect(() => {
    // Only redirect if user just logged in (not if they navigated to landing page while logged in)
    if (isAuthenticated && hasTriedLogin.current) {
      router.push("/dashboard");
    }
    
    // Handle initial load when user is already authenticated
    if (isAuthenticated && isInitialRender.current) {
      isInitialRender.current = false;
      // Check if we're on the root path and not coming from another page
      if (window.location.pathname === "/" && document.referrer === "") {
        router.push("/dashboard");
      }
    }
  }, [isAuthenticated, router]);

  const handleGetStarted = () => {
    hasTriedLogin.current = true;

    login().catch((error) => {
      toast({
        title: "Login Failed",
        description: "Could not sign you in. Please ensure popups are enabled and try again.",
        variant: "destructive",
      });
    });
  };
  
  const handleStartStudying = () => {
    router.push("/dashboard");
  };

  if (loading) {
     return (
        <div className="flex h-11 items-center justify-center">
            <LoadingSpinner />
        </div>
    )
  }
  
  if (isAuthenticated) {
    return (
      <Button
        size="lg"
        onClick={handleStartStudying}
        className="font-bold"
      >
        <GraduationCap className="mr-2 h-5 w-5" />
        Start Studying!
      </Button>
    )
  }

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row">
      <Button
        size="lg"
        onClick={handleGetStarted}
        disabled={loading}
        className="font-bold"
      >
        Get Started for Free
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
      <Button
        size="lg"
        variant="outline"
        onClick={handleGetStarted}
        disabled={loading}
      >
        Sign In
      </Button>
    </div>
  );
}