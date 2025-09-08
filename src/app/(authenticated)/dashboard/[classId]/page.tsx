// src/app/(authenticated)/dashboard/[classId]/page.tsx

"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from 'next/navigation';
import { useStudy } from "@/hooks/useStudy";
import { ProgressTracker } from "@/components/ProgressTracker";
import { RoadmapViewer } from "@/components/RoadmapViewer";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { InteractiveGuide } from "@/components/InteractiveGuide";
import { StrengthsWeaknesses } from "@/components/StrengthsWeaknesses";
import { PracticeQuizGenerator } from "@/components/PracticeQuizGenerator";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft, BookOpen, Target, Trophy, AlertCircle, HelpCircle } from "lucide-react";

export default function ClassDashboardPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const { roadmap, loading, refetchRoadmap } = useStudy();

  const classId = params.classId as string;
  
  // Guide state
  const [showGuide, setShowGuide] = useState(false);
  const [hasSeenGuide, setHasSeenGuide] = useState(false);

  useEffect(() => {
    if (classId) {
      refetchRoadmap(classId);
    }
  }, [classId, refetchRoadmap]);

  // Check if guide should be shown for new users
  useEffect(() => {
    const shouldShowGuide = searchParams.get('guide') === 'true';
    const guideKey = `guide-seen-${classId}`;
    const hasSeenBefore = localStorage.getItem(guideKey) === 'true';
    
    setHasSeenGuide(hasSeenBefore);
    
    if (shouldShowGuide && !hasSeenBefore && roadmap) {
      setShowGuide(true);
    }
  }, [classId, searchParams, roadmap]);

  const handleGuideComplete = () => {
    setShowGuide(false);
    const guideKey = `guide-seen-${classId}`;
    localStorage.setItem(guideKey, 'true');
    setHasSeenGuide(true);
  };

  const handleGuideSkip = () => {
    setShowGuide(false);
    const guideKey = `guide-seen-${classId}`;
    localStorage.setItem(guideKey, 'true');
    setHasSeenGuide(true);
  };

  const startGuideManually = () => {
    setShowGuide(true);
  };

  const progressData = useMemo(() => {
    if (!roadmap) return null;
    
    const allLessons = roadmap.units.flatMap(unit => unit.lessons);
    const completedLessons = allLessons.filter(lesson => lesson.completed).length;
    const totalLessons = allLessons.length;
    const progressPercentage = Math.round((completedLessons / totalLessons) * 100);
    
    return {
      completed: completedLessons,
      total: totalLessons,
      percentage: progressPercentage
    };
  }, [roadmap]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-6 text-center">
          <div className="flex flex-col items-center gap-4">
            <div className="relative">
              <LoadingSpinner className="h-16 w-16" />
              <div className="absolute inset-0 flex items-center justify-center">
                <BookOpen className="h-8 w-8 text-primary animate-pulse" />
              </div>
            </div>
            <div className="space-y-2">
              <p className="text-lg font-medium text-foreground">
                Loading your study roadmap...
              </p>
              <p className="text-sm text-muted-foreground">
                Preparing your personalized learning path
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header Navigation */}
      <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link href="/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  All Classes
                </Link>
              </Button>
              
              {roadmap && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <BookOpen className="h-4 w-4" />
                  <span className="font-medium text-foreground max-w-[300px] truncate">{roadmap.title}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4">
              {progressData && (
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 text-sm">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="font-medium">
                      {progressData.completed}/{progressData.total} lessons
                    </span>
                  </div>
                  <Progress value={progressData.percentage} className="w-20 h-2" />
                  <span className="text-xs text-muted-foreground">
                    {progressData.percentage}%
                  </span>
                </div>
              )}
              
              {progressData && progressData.percentage === 100 && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Trophy className="w-3 h-3 mr-1" />
                  Complete
                </Badge>
              )}

              {hasSeenGuide && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={startGuideManually}
                  className="flex items-center gap-2"
                >
                  <HelpCircle className="h-4 w-4" />
                  Tour
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {!roadmap ? (
          <div className="max-w-md mx-auto text-center">
            <Card className="bg-card/60 backdrop-blur border-destructive/20">
              <CardHeader>
                <div className="flex items-center justify-center w-16 h-16 bg-destructive/10 rounded-full mx-auto mb-4">
                  <AlertCircle className="h-8 w-8 text-destructive" />
                </div>
                <CardTitle className="font-headline text-2xl text-destructive">Roadmap Not Found</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-foreground/70">
                  We couldn't find a study plan for this class. You may need to create one first.
                </p>
                <div className="flex flex-col gap-2">
                  <Button asChild variant="outline">
                    <Link href="/dashboard">
                      <ArrowLeft className="mr-2 h-4 w-4" /> Back to All Classes
                    </Link>
                  </Button>
                  <Button 
                    variant="ghost" 
                    onClick={() => window.location.reload()}
                    className="text-sm"
                  >
                    Try again
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Main Content Grid */}
            <div className="grid gap-8 lg:grid-cols-3 lg:items-start">
              <div className="lg:col-span-1 space-y-6">
                <div data-guide="progress-tracker">
                  <ProgressTracker />
                </div>
                
                <div data-guide="practice-quiz">
                  <PracticeQuizGenerator roadmap={roadmap} apCourse={roadmap.title} classId={classId} />
                </div>
              </div>
              <div className="lg:col-span-2" data-guide="roadmap-units">
                <RoadmapViewer roadmap={roadmap} />
              </div>
            </div>
            
            {/* Progress Analysis - Bottom Card */}
            <div data-guide="strengths-weaknesses">
              <StrengthsWeaknesses roadmap={roadmap} classId={classId} />
            </div>
          </div>
        )}
      </div>

      {/* Interactive Guide */}
      <InteractiveGuide
        isVisible={showGuide}
        onComplete={handleGuideComplete}
        onSkip={handleGuideSkip}
        steps={[]} // Will use default steps
      />
    </div>
  );
}