
"use client";

import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function LandingPageClient() {
  const { login, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const handleGetStarted = async () => {
    try {
      await login();
      router.push("/onboarding");
    } catch (error) {
      console.error("Login failed", error);
      toast({
        title: "Login Failed",
        description: "There was a problem signing you in. Please try again.",
        variant: "destructive"
      })
    }
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
