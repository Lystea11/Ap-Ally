// src/app/(authenticated)/dashboard/[classId]/page.tsx

"use client";

import { useEffect } from "react";
import { useParams } from 'next/navigation'; // Import the useParams hook
import { useStudy } from "@/hooks/useStudy";
import { ProgressTracker } from "@/components/ProgressTracker";
import { RoadmapViewer } from "@/components/RoadmapViewer";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function ClassDashboardPage() {
  const params = useParams(); // Use the hook to get params
  const { roadmap, loading, refetchRoadmap } = useStudy();

  // The classId is now a simple string, not a Promise
  const classId = params.classId as string;

  useEffect(() => {
    if (classId) {
      refetchRoadmap(classId);
    }
    // The dependency array now correctly uses the string `classId`
  }, [classId, refetchRoadmap]);

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

  return (
    <div className="w-full">
         <div className="bg-muted/40 border-b">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4">
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to All Classes
                  </Link>
                </Button>
            </div>
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!roadmap ? (
            <div className="text-center py-16 border-2 border-dashed rounded-lg bg-card">
              <h2 className="mt-4 text-xl font-semibold">Roadmap Not Found</h2>
              <p className="mt-2 text-muted-foreground">
                We couldn't find a study plan for this class. You may need to create one.
              </p>
           </div>
        ) : (
            <div className="grid gap-8 lg:grid-cols-3 lg:items-start">
                <div className="lg:col-span-1 lg:sticky top-24">
                <ProgressTracker />
                </div>
                <div className="lg:col-span-2">
                <RoadmapViewer roadmap={roadmap} />
                </div>
            </div>
        )}
        </div>
    </div>
  );
}