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

export default function ClientLessonPage({ lessonId }: { lessonId: string }) {
  const { roadmap, loading: studyLoading, updateLessonProgress, setLessonMastery } = useStudy();
  const router = useRouter();
  const { toast } = useToast();
  
  const [lessonContent, setLessonContent] = useState<GenerateLessonContentOutput | null>(null);
  const [contentLoading, setContentLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizResult, setQuizResult] = useState<{ correct: number, total: number } | null>(null);
  const fetchedLessonIdRef = useRef<string | null>(null);

  const { lesson, nextLesson } = useMemo(() => {
    if (!roadmap || !lessonId) {
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
    }

    return { lesson: currentLesson, nextLesson: nextLessonResult };
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
  };

  const handleRetryQuiz = () => {
    if (lesson) {
        fetchedLessonIdRef.current = null; // Reset to allow refetch
        router.refresh(); // Use router refresh for a cleaner state update
    }
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

  const isLoadingState = studyLoading || contentLoading || (!lesson && !error);

  if (isLoadingState) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 text-center">
        <LoadingSpinner className="h-16 w-16" />
        <p className="text-lg text-muted-foreground">
          {`Generating your lesson on "${lesson?.title || 'this topic'}"...`}
        </p>
      </div>
    );
  }

  // Display error if present or if lessonContent is missing its 'content' array.
  if (error || !lessonContent?.content) { 
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