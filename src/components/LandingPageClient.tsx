
"use client";

import { useRef, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { LoadingSpinner } from "./LoadingSpinner";

export function LandingPageClient() {
  const { login, loading, isAuthenticated } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const hasTriedLogin = useRef(false);

  useEffect(() => {
    if (!loading && isAuthenticated && hasTriedLogin.current) {
      router.push("/dashboard");
    }
  }, [isAuthenticated, loading, router]);


  const handleGetStarted = async () => {
    hasTriedLogin.current = true;
    try {
      await login(); // this triggers popup
    } catch (error) {
      toast({
        title: "Login Failed",
        description: "Could not sign you in. Please ensure popups are enabled and try again.",
        variant: "destructive",
      });
    }
  };

  if (loading || isAuthenticated) {
     return (
        <div className="flex h-11 items-center justify-center">
            <LoadingSpinner />
        </div>
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
