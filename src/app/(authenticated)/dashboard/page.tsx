
"use client";

import Link from "next/link";
import { useStudy } from "@/hooks/useStudy";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProgressTracker } from "@/components/ProgressTracker";
import { RoadmapViewer } from "@/components/RoadmapViewer";
import { BookOpen } from "lucide-react";
import { LoadingSpinner } from "@/components/LoadingSpinner";

export default function DashboardPage() {
  const { roadmap, loading } = useStudy();

  if (loading) {
    return (
      <div className="container mx-auto flex h-[calc(100vh-4rem)] items-center justify-center text-center">
        <div className="flex flex-col items-center gap-4">
            <LoadingSpinner className="h-12 w-12" />
            <p className="text-muted-foreground">Loading your roadmap...</p>
        </div>
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="container mx-auto flex h-[calc(100vh-4rem)] items-center justify-center text-center">
        <Card className="max-w-md p-8">
            <CardHeader>
                <BookOpen className="mx-auto h-12 w-12 text-primary" />
                <CardTitle className="mt-4 font-headline text-2xl">Create Your First Study Plan</CardTitle>
                <CardDescription>
                You haven't created a study plan yet. Let's get you started on your personalized journey.
                </CardDescription>
            </CardHeader>
          <CardContent>
            <Button asChild size="lg">
              <Link href="/onboarding">Create Your Roadmap</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
          <ProgressTracker />
        </div>
        <div className="lg:col-span-2">
          <RoadmapViewer roadmap={roadmap} />
        </div>
      </div>
    </div>
  );
}
