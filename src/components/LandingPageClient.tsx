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
      <Button
        size="lg"
        onClick={handleStartStudying}
        className="font-bold"
      >
        <GraduationCap className="mr-2 h-5 w-5" />
        Start Studying!
      </Button>
    );
  }

  return (
    <div className="flex flex-col items-center gap-3 sm:flex-row sm:gap-4">
      <Button
        size="lg"
        onClick={handleGetStarted}
        disabled={loading}
        className="font-bold w-full sm:w-auto"
      >
        Get Started for Free
        <ArrowRight className="ml-2 h-5 w-5" />
      </Button>
      <Button
        size="lg"
        variant="outline"
        onClick={handleGetStarted}
        disabled={loading}
        className="w-full sm:w-auto"
      >
        Sign In
      </Button>
    </div>
  );
}