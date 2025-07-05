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
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Lesson } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

// Changed prop type to directly receive lessonId as a string
export default function ClientLessonPage({ lessonId }: { lessonId: string }) {
  const { roadmap, loading: studyLoading, updateLessonProgress, setLessonMastery } = useStudy();
  const router = useRouter();
  const { toast } = useToast();
  
  const [lessonContent, setLessonContent] = useState<GenerateLessonContentOutput | null>(null);
  const [contentLoading, setContentLoading] = useState(true); // Separate loading state for content generation
  const [error, setError] = useState<string | null>(null);
  const [quizResult, setQuizResult] = useState<{ correct: number, total: number } | null>(null);
  const fetchedLessonIdRef = useRef<string | null>(null);

  console.log("ClientLessonPage Render: Initializing/Re-rendering.");
  console.log("ClientLessonPage Render: lessonId (from props) =", lessonId); // This should now show the actual ID
  console.log("ClientLessonPage Render: studyLoading =", studyLoading);
  console.log("ClientLessonPage Render: contentLoading =", contentLoading);
  console.log("ClientLessonPage Render: lessonContent =", lessonContent ? "available" : "null");
  console.log("ClientLessonPage Render: error =", error);

  // Derive lesson and nextLesson from the roadmap
  const { lesson, nextLesson } = useMemo(() => {
    console.log("useMemo: Re-calculating lesson and nextLesson. Roadmap:", roadmap ? "available" : "null");
    // Ensure lessonId is available before trying to find the lesson
    if (!roadmap || !lessonId) {
      console.log("useMemo: Roadmap or lessonId is null/undefined, returning null for lesson and nextLesson.");
      return { lesson: null, nextLesson: null };
    }

    const allLessons = roadmap.units.flatMap((unit) => unit.lessons);
    const currentLessonIndex = allLessons.findIndex((l) => l.id === lessonId);

    let currentLesson: Lesson | null = null;
    let nextLessonResult: Lesson | null = null;

    if (currentLessonIndex !== -1) {
      currentLesson = allLessons[currentLessonIndex];
      if (currentLessonIndex < allLessons.length - 1) {
        nextLessonResult = allLessons[currentLessonIndex + 1];
      }
      console.log("useMemo: Found lesson:", currentLesson.title, "with ID:", currentLesson.id);
    } else {
      console.log("useMemo: Lesson with ID", lessonId, "NOT found in roadmap.");
    }

    return { lesson: currentLesson, nextLesson: nextLessonResult };
  }, [roadmap, lessonId]); // Added roadmap to dependencies to ensure re-evaluation when it loads

  // Function to fetch lesson content (from API, which handles AI generation)
  const fetchLessonContent = async () => {
    console.log("fetchLessonContent: Function called.");
    if (!lesson) {
        console.log("fetchLessonContent: Lesson object is null, cannot fetch content. Setting contentLoading=false, error.");
        setContentLoading(false); // Stop content loading
        setError("Lesson data is not available. Please go back to dashboard.");
        return;
    }
    
    console.log("fetchLessonContent: Starting content fetch for lesson:", lesson.title, "ID:", lesson.id);
    setContentLoading(true); // Start content loading
    setError(null);
    setQuizResult(null); // Reset quiz results when fetching new content

    try {
      const content = await getLessonContentAPI(lesson.id);
      console.log("fetchLessonContent: Successfully fetched content. Content available:", !!content);
      setLessonContent(content);
    } catch (err) {
      console.error("fetchLessonContent: Failed to load lesson content. Error:", err);
      setError("Failed to load lesson content. Please try again later.");
    } finally {
      setContentLoading(false); // Stop content loading
      console.log("fetchLessonContent: Content loading finished.");
    }
  };

  // Effect to trigger content fetch when lesson changes or on initial load
  useEffect(() => {
    console.log("useEffect: Running. Current state: lesson:", lesson ? lesson.title : "null", "roadmap:", roadmap ? "available" : "null", "studyLoading:", studyLoading, "lessonId:", lessonId, "fetchedLessonIdRef.current:", fetchedLessonIdRef.current);

    // Condition 1: Lesson found in roadmap and not yet fetched
    if (lesson && fetchedLessonIdRef.current !== lessonId) {
      console.log("useEffect: Condition 1 met (lesson found and not fetched). Triggering fetchLessonContent.");
      fetchedLessonIdRef.current = lessonId; // Mark this lessonId as fetched
      fetchLessonContent();
    } 
    // Condition 2: Study loading is complete, but no roadmap was found at all
    else if (studyLoading === false && !roadmap) { 
      console.log("useEffect: Condition 2 met (study loading finished, no roadmap). Setting error.");
      setContentLoading(false);
      setError("No roadmap found for your account. Please create one.");
    } 
    // Condition 3: Roadmap loaded, but the specific lesson was not found within it
    else if (studyLoading === false && roadmap && !lesson) { 
        console.log("useEffect: Condition 3 met (roadmap loaded, but lesson not found in roadmap). Setting error.");
        setContentLoading(false);
        setError("Lesson not found in your roadmap.");
    }
    // Else: Keep loading (if studyLoading is true) or do nothing (if content already loaded/error handled)
    console.log("useEffect: Finished running.");
  }, [lesson, roadmap, lessonId, studyLoading]); // Removed params.lessonId from dependencies as it's now direct prop

  const handleQuizComplete = (result: { correct: number, total: number }) => {
    setQuizResult(result);
  };

  const handleRetryQuiz = () => {
    fetchLessonContent();
  };

  const handleMarkAsComplete = async () => {
    if (!lesson || !lessonContent) return;

    if (lesson.completed) {
      await updateLessonProgress(lesson.id, false);
      await setLessonMastery(lesson.id, false);
      setQuizResult(null);
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

    await updateLessonProgress(lesson.id, true);
    
    if (nextLesson) {
      router.push(`/lesson/${nextLesson.id}`);
    } else {
      router.push('/dashboard');
    }
  };

  // Combined loading condition:
  // Show spinner if:
  // 1. The overall study data (roadmap) is still loading (`studyLoading` is true).
  // 2. The specific lesson content is still being fetched/generated (`contentLoading` is true).
  // 3. The `lesson` object itself hasn't been found in the roadmap yet, AND we're not explicitly showing an error.
  const isLoadingState = studyLoading || contentLoading || (!lesson && !error);

  console.log("ClientLessonPage Render: isLoadingState =", isLoadingState);

  if (isLoadingState) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 text-center">
        <LoadingSpinner className="h-16 w-16" />
        <p className="text-lg text-muted-foreground">
          {quizResult ? 'Generating new questions...' : `Generating your lesson on "${lesson?.title || 'this topic'}"...`}
        </p>
      </div>
    );
  }

  // Display error if present or if lessonContent is unexpectedly null after loading
  if (error || !lessonContent) { 
    console.log("ClientLessonPage Render: Displaying Error/No Content message.");
    return (
      <div className="container mx-auto py-8 text-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error || "Lesson content could not be loaded."}</p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/dashboard">
                <ArrowLeft className="mr-2 h-4 w-4" /> Go back to Dashboard
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  console.log("ClientLessonPage Render: Displaying LessonViewer.");
  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <Button asChild variant="outline">
          <Link href="/dashboard">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
      <LessonViewer
        lesson={lesson}
        content={lessonContent}
        onToggleComplete={handleMarkAsComplete}
        nextLesson={nextLesson}
        onQuizComplete={handleQuizComplete}
        onRetryQuiz={handleRetryQuiz}
        quizResult={quizResult}
      />
    </div>
  );
}
