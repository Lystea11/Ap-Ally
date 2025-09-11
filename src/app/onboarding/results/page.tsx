// src/app/onboarding/results/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { GuestRoadmapRecap } from "@/components/GuestRoadmapRecap";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { GuestSessionManager, GuestOnboardingData } from "@/lib/guest-session";


export default function OnboardingResultsPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuth();
  const [guestData, setGuestData] = useState<GuestOnboardingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load guest data using the session manager
    const data = GuestSessionManager.getData();
    if (data && data.roadmap) {
      setGuestData(data);
    } else {
      // No data found or expired, redirect back to onboarding
      router.push('/onboarding');
      return;
    }
    
    setLoading(false);
  }, [router]);

  const handleGoBack = () => {
    router.push('/onboarding');
  };

  if (loading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <LoadingSpinner className="h-12 w-12 text-primary" />
      </div>
    );
  }

  if (!guestData || !guestData.roadmap) {
    return (
      <div className="container mx-auto max-w-2xl py-12 px-4">
        <Card>
          <CardHeader>
            <CardTitle>No Results Found</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              We couldn't find your study plan. Please complete the onboarding process again.
            </p>
            <Button onClick={() => router.push('/onboarding')}>
              Start Over
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-4xl py-6 sm:py-12 px-4">
        {/* Header with back button */}
        <div className="mb-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleGoBack}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Onboarding
          </Button>
          <h1 className="font-headline text-3xl sm:text-4xl font-bold text-center">
            Your Personalized Study Plan
          </h1>
          <p className="text-muted-foreground text-center mt-2">
            {guestData.formData.apCourse} • {guestData.isCustomFlow ? 'Custom Plan' : 'Diagnostic-Based Plan'}
          </p>
        </div>

        {/* Results Component */}
        <GuestRoadmapRecap
          roadmap={guestData.roadmap}
          quizResults={guestData.quizAnswers || ""}
          isCustomFlow={guestData.isCustomFlow || false}
          apCourse={guestData.formData.apCourse}
          testDate={guestData.formData.testDate}
        />
      </div>
    </div>
  );
}