// src/components/LandingPageClient.tsx

"use client";

import { useRef, useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowRight, GraduationCap } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "./LoadingSpinner";
import { hasExistingClassesAPI } from "@/lib/api-client";

export function LandingPageClient() {
  const { login, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const hasTriedLogin = useRef(false);
  const redirectedAfterLogin = useRef(false);
  const [checkingClasses, setCheckingClasses] = useState(false);

  useEffect(() => {
    // Redirect immediately if user just logged in via popup
    if (isAuthenticated && hasTriedLogin.current && !redirectedAfterLogin.current) {
      redirectedAfterLogin.current = true;
      setCheckingClasses(true);
      
      // Check if user has existing classes to determine redirect destination
      hasExistingClassesAPI()
        .then((hasClasses) => {
          if (hasClasses) {
            router.push("/dashboard");
          } else {
            router.push("/onboarding");
          }
        })
        .catch((error) => {
          console.error("Error checking classes, defaulting to onboarding:", error);
          router.push("/onboarding");
        })
        .finally(() => {
          setCheckingClasses(false);
        });
    }
  }, [isAuthenticated, router]);

  const handleGetStarted = () => {
    // Redirect directly to onboarding without requiring login
    router.push("/onboarding");
  };

  const handleSignIn = () => {
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

  if (loading || checkingClasses) {
    return (
      <div className="flex h-11 items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  if (isAuthenticated) {
    // Show "Start Studying" button if user is already logged in
    return (
      <button
        onClick={handleStartStudying}
        className="group relative px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_ease-in-out_infinite]" />
        <span className="relative flex items-center gap-2">
          <GraduationCap className="h-5 w-5 group-hover:rotate-12 transition-transform" />
          Start Studying
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </span>
      </button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
      <button
        onClick={handleGetStarted}
        disabled={loading}
        className="group relative px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-xl overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-primary/25 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
      >
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_ease-in-out_infinite]" />
        <span className="relative flex items-center gap-2">
          Get Started
          <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
        </span>
      </button>
      <button
        onClick={handleSignIn}
        disabled={loading}
        className="px-8 py-4 bg-transparent border-2 border-border text-foreground font-semibold rounded-xl transition-all duration-300 hover:bg-foreground hover:text-background hover:border-transparent active:translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Sign In
      </button>
    </div>
  );
}