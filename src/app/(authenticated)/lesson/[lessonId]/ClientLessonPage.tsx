// src/app/(authenticated)/lesson/[lessonId]/ClientLessonPage.tsx

"use client"

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStudy } from "@/hooks/useStudy";
import { getLessonContentAPI } from "@/lib/api-client";
import type { GenerateLessonContentOutput } from "@/ai/flows/generate-lesson-content";
import { LessonViewer } from "@/components/LessonViewer";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ChevronRight, Clock, CheckCircle, AlertCircle, BookOpen, Target, Trophy, ArrowRight, ChevronDown, Menu } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useIsMobile } from "@/hooks/use-mobile";
import type { Lesson } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { useAdTrigger } from "@/context/AdContext";
import { useGamification } from "@/hooks/useGamification";
import { BoarLevelUpModal } from "@/components/BoarLevelUpModal";

export default function ClientLessonPage({ lessonId }: { lessonId: string }) {
  const { roadmap, loading: studyLoading, updateLessonProgress, setLessonMastery } = useStudy();
  const router = useRouter();
  const { toast } = useToast();
  const { triggerLessonCompletionAd } = useAdTrigger();
  const { updateProgress, gamificationData } = useGamification();
  const isMobile = useIsMobile();
  
  const [lessonContent, setLessonContent] = useState<GenerateLessonContentOutput | null>(null);
  const [contentLoading, setContentLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizResult, setQuizResult] = useState<{ correct: number, total: number } | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [levelUpModal, setLevelUpModal] = useState<{
    isOpen: boolean;
    oldLevel: number;
    newLevel: number;
  }>({ isOpen: false, oldLevel: 1, newLevel: 1 });
  const fetchedLessonIdRef = useRef<string | null>(null);

  const { lesson, nextLesson, previousLesson, currentUnit, progressData } = useMemo(() => {
    if (!roadmap || !lessonId) {
      return { lesson: null, nextLesson: null, previousLesson: null, currentUnit: null, progressData: null };
    }

    const allLessons = roadmap.units.flatMap((unit) => unit.lessons);
    const currentLessonIndex = allLessons.findIndex((l) => l.id === lessonId);

    let currentLesson: Lesson | null = null;
    let nextLessonResult: Lesson | null = null;
    let previousLessonResult: Lesson | null = null;
    let unitForLesson = null;

    if (currentLessonIndex !== -1) {
      currentLesson = allLessons[currentLessonIndex];
      if (currentLessonIndex < allLessons.length - 1) {
        nextLessonResult = allLessons[currentLessonIndex + 1];
      }
      if (currentLessonIndex > 0) {
        previousLessonResult = allLessons[currentLessonIndex - 1];
      }
      
      // Find the unit that contains this lesson
      unitForLesson = roadmap.units.find(unit => 
        unit.lessons.some(lesson => lesson.id === lessonId)
      );
    }

    // Calculate progress data
    const completedLessons = allLessons.filter(l => l.completed).length;
    const totalLessons = allLessons.length;
    const progressPercentage = Math.round((completedLessons / totalLessons) * 100);

    return { 
      lesson: currentLesson, 
      nextLesson: nextLessonResult, 
      previousLesson: previousLessonResult,
      currentUnit: unitForLesson,
      progressData: {
        completed: completedLessons,
        total: totalLessons,
        percentage: progressPercentage,
        currentIndex: currentLessonIndex + 1
      }
    };
  }, [roadmap, lessonId]);

  useEffect(() => {
    const fetchLessonContent = async () => {
      if (!lesson) {
        setContentLoading(false);
        setError("Lesson data is not available. Please go back to the dashboard.");
        return;
      }
      
      setContentLoading(true);
      setError(null);
      setQuizResult(null);

      try {
        const content = await getLessonContentAPI(lesson.id);
        // Add a validation check here
        console.log("Received content from server:", content);
        if (!content || !Array.isArray(content.content)) {
            throw new Error("Received malformed lesson content from the server.");
        }
        setLessonContent(content);
      } catch (err) {
        console.error("Failed to load lesson content:", err);
        setError("Failed to generate or load the lesson content. Please try refreshing the page or come back later.");
      } finally {
        setContentLoading(false);
      }
    };

    if (lesson && fetchedLessonIdRef.current !== lessonId) {
      fetchedLessonIdRef.current = lessonId;
      fetchLessonContent();
    } else if (studyLoading === false && !roadmap) { 
      setContentLoading(false);
      setError("No roadmap found for your account. Please create one.");
    } else if (studyLoading === false && roadmap && !lesson) { 
        setContentLoading(false);
        setError("Lesson not found in your roadmap.");
    }
  }, [lesson, lessonId, studyLoading, roadmap]);

  const handleQuizComplete = (result: { correct: number, total: number }) => {
    setQuizResult(result);
    // Note: Lesson completion and mastery are now handled in PracticeQuiz component
  };

  const handleRetryQuiz = () => {
    if (lesson) {
        fetchedLessonIdRef.current = null; // Reset to allow refetch
        router.refresh(); // Use router refresh for a cleaner state update
    }
  };

  const handleNavigateNext = () => {
    if (nextLesson) {
      router.push(`/lesson/${nextLesson.id}`);
    } else {
      router.push('/dashboard');
    }
  };

  const handleMarkAsComplete = async () => {
    if (!lesson || !lessonContent) return;

    // Only allow manual completion if lesson isn't already completed and quiz requirements are met
    if (lesson.completed) {
      // If lesson is already completed, just navigate
      handleNavigateNext();
      return;
    }

    const hasPracticeQuestions = lessonContent.practiceQuestions && lessonContent.practiceQuestions.length > 0;
    if (hasPracticeQuestions && (!quizResult || quizResult.correct < 4)) {
      toast({
        title: "Quiz Not Passed",
        description: `You need to score at least 4/${lessonContent.practiceQuestions.length} to complete the lesson.`,
        variant: "destructive",
      });
      return;
    }

    try {
      // Update lesson progress first
      await updateLessonProgress(lesson.id, true);
      
      // Update gamification data
      const gamificationResult = await updateProgress({
        lessonCompleted: true,
      });

      // Show level-up modal if user leveled up
      if (gamificationResult.leveledUp) {
        setLevelUpModal({
          isOpen: true,
          oldLevel: gamificationResult.oldLevel,
          newLevel: gamificationResult.newLevel,
        });
      }

      // Trigger ad after successful lesson completion
      triggerLessonCompletionAd({
        lessonId: lesson.id,
        lessonTitle: lesson.title,
        unitTitle: currentUnit?.title,
        quizResult: quizResult,
      });
      
      handleNavigateNext();
    } catch (error) {
      console.error('Error completing lesson:', error);
      toast({
        title: "Error",
        description: "Failed to complete lesson. Please try again.",
        variant: "destructive",
      });
    }
  };

  const isLoadingState = studyLoading || contentLoading || (!lesson && !error);

  if (isLoadingState) {
    return (
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
              {`Generating your lesson on "${lesson?.title || 'this topic'}"`}
            </p>
            <p className="text-sm text-muted-foreground">
              Our AI is creating personalized content just for you...
            </p>
          </div>
        </div>
        
        {progressData && (
          <Card className="w-full max-w-md bg-card/60 backdrop-blur border-border/40">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">
                  {progressData.completed}/{progressData.total} lessons
                </span>
              </div>
              <Progress value={progressData.percentage} className="h-2" />
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Display error if present or if lessonContent is missing its 'content' array.
  if (error || !lessonContent?.content) { 
    return (
      <div className="container mx-auto py-8 text-center">
        <Card className="max-w-md mx-auto bg-card/60 backdrop-blur border-destructive/20">
          <CardHeader>
            <div className="flex items-center justify-center w-16 h-16 bg-destructive/10 rounded-full mx-auto mb-4">
              <AlertCircle className="h-8 w-8 text-destructive" />
            </div>
            <CardTitle className="font-headline text-2xl text-destructive">Something went wrong</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-foreground/70">{error || "Lesson content could not be loaded."}</p>
            <div className="flex flex-col gap-2">
              <Button asChild variant="outline">
                <Link href="/dashboard">
                  <ArrowLeft className="mr-2 h-4 w-4" /> Go back to Dashboard
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
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      {/* Header Navigation */}
      <div className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 sm:gap-4">
              <Button asChild variant="ghost" size="sm">
                <Link href={roadmap ? `/dashboard/${roadmap.id}` : "/dashboard"}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  <span className="hidden sm:inline">Roadmap</span>
                  <span className="sm:hidden">Back</span>
                </Link>
              </Button>
              
              {/* Mobile Navigation Button */}
              {isMobile && (
                <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <Menu className="h-4 w-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80 p-0">
                    <SheetHeader className="p-6 pb-4 border-b">
                      <SheetTitle className="text-left flex items-center gap-2">
                        <BookOpen className="h-5 w-5" />
                        Lesson Navigation
                      </SheetTitle>
                    </SheetHeader>
                    <div className="p-6 space-y-4">
                      {/* Previous Lesson */}
                      {previousLesson && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Previous
                          </p>
                          <Button 
                            asChild 
                            variant="ghost" 
                            size="sm" 
                            className="w-full justify-start h-auto p-3"
                            onClick={() => setSidebarOpen(false)}
                          >
                            <Link href={`/lesson/${previousLesson.id}`}>
                              <div className="flex items-center gap-2 w-full">
                                <ArrowLeft className="h-4 w-4 shrink-0" />
                                <div className="text-left w-full overflow-hidden">
                                  <p className="font-medium text-sm truncate block">{previousLesson.title}</p>
                                  <p className="text-xs text-muted-foreground">Continue from here</p>
                                </div>
                              </div>
                            </Link>
                          </Button>
                        </div>
                      )}
                      
                      {/* Current Lesson */}
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                          Current
                        </p>
                        <div className="p-3 bg-purple-100/60 rounded-lg border border-purple-200/50">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                            <div>
                              <p className="font-medium text-sm">{lesson?.title}</p>
                              <p className="text-xs text-muted-foreground">In progress</p>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Next Lesson */}
                      {nextLesson && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Next
                          </p>
                          <Button 
                            asChild 
                            variant="ghost" 
                            size="sm" 
                            className="w-full justify-start h-auto p-3"
                            disabled={!lesson?.completed}
                            onClick={() => setSidebarOpen(false)}
                          >
                            <Link href={`/lesson/${nextLesson.id}`}>
                              <div className="flex items-center gap-2 w-full">
                                <div className="text-left w-full overflow-hidden">
                                  <p className="font-medium text-sm truncate block">{nextLesson.title}</p>
                                  <p className="text-xs text-muted-foreground">
                                    {lesson?.completed ? "Ready to start" : "Complete current lesson first"}
                                  </p>
                                </div>
                                <ArrowRight className="h-4 w-4 shrink-0" />
                              </div>
                            </Link>
                          </Button>
                        </div>
                      )}
                      
                      <Separator />
                      
                      {/* Quiz Status */}
                      {quizResult && (
                        <div className="space-y-2">
                          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Quiz Results
                          </p>
                          <div className="p-3 bg-secondary/50 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <Trophy className="h-4 w-4 text-yellow-500" />
                              <span className="font-medium text-sm">
                                {quizResult.correct}/{quizResult.total} correct
                              </span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              {quizResult.correct >= 4 ? "Great job! You passed!" : "Keep practicing to improve"}
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </SheetContent>
                </Sheet>
              )}
              
              {currentUnit && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm" className="h-auto p-1 text-sm hover:bg-muted">
                        <span className="max-w-[80px] sm:max-w-[120px] truncate">{currentUnit.title}</span>
                        <ChevronDown className="ml-1 h-3 w-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-60">
                      {currentUnit.lessons.map((unitLesson) => (
                        <DropdownMenuItem key={unitLesson.id} asChild>
                          <Link 
                            href={`/lesson/${unitLesson.id}`}
                            className={`flex items-center gap-2 ${unitLesson.id === lessonId ? 'bg-accent' : ''}`}
                          >
                            <div className="flex items-center gap-2 flex-1 overflow-hidden">
                              {unitLesson.completed && (
                                <CheckCircle className="h-4 w-4 text-green-600 shrink-0" />
                              )}
                              <span className="truncate block max-w-full">{unitLesson.title}</span>
                            </div>
                            {unitLesson.id === lessonId && (
                              <div className="w-2 h-2 bg-primary rounded-full shrink-0" />
                            )}
                          </Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                  <ChevronRight className="h-4 w-4" />
                  <span className="font-medium text-foreground max-w-[120px] sm:max-w-[200px] truncate">{lesson?.title}</span>
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-2 sm:gap-4">
              {progressData && (
                <div className="flex items-center gap-2 sm:gap-3">
                  <div className="flex items-center gap-1 sm:gap-2 text-sm">
                    <Target className="h-4 w-4 text-primary" />
                    <span className="font-medium text-xs sm:text-sm">
                      {progressData.currentIndex}/{progressData.total}
                    </span>
                  </div>
                  <Progress value={progressData.percentage} className="w-12 sm:w-20 h-2" />
                  <span className="text-xs text-muted-foreground hidden sm:inline">
                    {progressData.percentage}%
                  </span>
                </div>
              )}
              
              {lesson?.completed && (
                <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                  <CheckCircle className="w-3 h-3 mr-1" />
                  <span className="hidden sm:inline">Completed</span>
                  <span className="sm:hidden">✓</span>
                </Badge>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6 sm:py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 sm:gap-8">
          {/* Desktop Sidebar Navigation */}
          {!isMobile && (
            <div className="lg:col-span-1">
              <Card className="sticky top-24 bg-card/60 backdrop-blur border-border/40">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <BookOpen className="h-5 w-5" />
                    Lesson Navigation
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Previous Lesson */}
                  {previousLesson && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Previous
                      </p>
                      <Button asChild variant="ghost" size="sm" className="w-full justify-start h-auto p-3">
                        <Link href={`/lesson/${previousLesson.id}`}>
                          <div className="flex items-center gap-2 w-full">
                            <ArrowLeft className="h-4 w-4 shrink-0" />
                            <div className="text-left w-full overflow-hidden">
                              <p className="font-medium text-sm truncate block">{previousLesson.title}</p>
                              <p className="text-xs text-muted-foreground">Continue from here</p>
                            </div>
                          </div>
                        </Link>
                      </Button>
                    </div>
                  )}
                  
                  {/* Current Lesson */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                      Current
                    </p>
                    <div className="p-3 bg-purple-100/60 rounded-lg border border-purple-200/50">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-purple-500 rounded-full animate-pulse" />
                        <div>
                          <p className="font-medium text-sm">{lesson?.title}</p>
                          <p className="text-xs text-muted-foreground">In progress</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Next Lesson */}
                  {nextLesson && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Next
                      </p>
                      <Button 
                        asChild 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-start h-auto p-3"
                        disabled={!lesson?.completed}
                      >
                        <Link href={`/lesson/${nextLesson.id}`}>
                          <div className="flex items-center gap-2 w-full">
                            <div className="text-left w-full overflow-hidden">
                              <p className="font-medium text-sm truncate block">{nextLesson.title}</p>
                              <p className="text-xs text-muted-foreground">
                                {lesson?.completed ? "Ready to start" : "Complete current lesson first"}
                              </p>
                            </div>
                            <ArrowRight className="h-4 w-4 shrink-0" />
                          </div>
                        </Link>
                      </Button>
                    </div>
                  )}
                  
                  <Separator />
                  
                  {/* Quiz Status */}
                  {quizResult && (
                    <div className="space-y-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                        Quiz Results
                      </p>
                      <div className="p-3 bg-secondary/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Trophy className="h-4 w-4 text-yellow-500" />
                          <span className="font-medium text-sm">
                            {quizResult.correct}/{quizResult.total} correct
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {quizResult.correct >= 4 ? "Great job! You passed!" : "Keep practicing to improve"}
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
          
          {/* Main Content */}
          <div className={isMobile ? "col-span-1" : "lg:col-span-3"}>
            {lesson && lessonContent && (
              <LessonViewer
                lesson={lesson}
                content={lessonContent}
                onToggleComplete={handleMarkAsComplete}
                onNavigateNext={handleNavigateNext}
                nextLesson={nextLesson}
                onQuizComplete={handleQuizComplete}
                onRetryQuiz={handleRetryQuiz}
                quizResult={quizResult}
              />
            )}
          </div>
        </div>
      </div>
      
      {/* Boar Level Up Modal */}
      <BoarLevelUpModal
        isOpen={levelUpModal.isOpen}
        onClose={() => setLevelUpModal(prev => ({ ...prev, isOpen: false }))}
        oldLevel={levelUpModal.oldLevel}
        newLevel={levelUpModal.newLevel}
        lessonsCompleted={gamificationData?.lessons_completed_count || 0}
        currentStreak={gamificationData?.current_streak || 0}
        practiceQuizzes={gamificationData?.practice_quizzes_completed || 0}
      />
    </div>
  );
}