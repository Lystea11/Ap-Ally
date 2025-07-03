
"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStudy } from "@/hooks/useStudy";
import { generateLessonContent } from "@/ai/flows/generate-lesson-content";
import type { GenerateLessonContentOutput } from "@/ai/flows/generate-lesson-content";
import { LessonViewer } from "@/components/LessonViewer";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { Lesson } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

export default function LessonPage({ params }: { params: { lessonId: string } }) {
  const { lessonId } = params;
  const { roadmap, updateLessonProgress, setLessonMastery } = useStudy();
  const router = useRouter();
  const { toast } = useToast();
  
  const [lessonContent, setLessonContent] = useState<GenerateLessonContentOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [quizResult, setQuizResult] = useState<{ correct: number, total: number } | null>(null);
  const fetchedLessonIdRef = useRef<string | null>(null);

  const { lesson, nextLesson } = useMemo(() => {
    if (!roadmap) return { lesson: null, nextLesson: null };

    const allLessons = roadmap.units.flatMap((unit) => unit.lessons);
    let currentLesson: Lesson | null = null;
    let nextLessonResult: Lesson | null = null;

    const currentLessonIndex = allLessons.findIndex((l) => l.id === lessonId);

    if (currentLessonIndex !== -1) {
      currentLesson = allLessons[currentLessonIndex];
      if (currentLessonIndex < allLessons.length - 1) {
        nextLessonResult = allLessons[currentLessonIndex + 1];
      }
    }

    return { lesson: currentLesson, nextLesson: nextLessonResult };
  }, [roadmap, lessonId]);

  const fetchLessonContent = async () => {
    if (!lesson) return;
    setLoading(true);
    setError(null);
    setQuizResult(null); // Reset quiz results when fetching new content
    try {
      const content = await generateLessonContent({ topic: lesson.title });
      setLessonContent(content);
    } catch (err) {
      setError("Failed to load lesson content. Please try again later.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Only fetch content if the lesson ID has changed since the last fetch.
    // This prevents re-fetching when lesson metadata (like mastery) changes.
    if (lesson && fetchedLessonIdRef.current !== lessonId) {
      fetchedLessonIdRef.current = lessonId;
      fetchLessonContent();
    } else if (roadmap && !lesson) { // roadmap has loaded but no lesson found
      setLoading(false);
      setError("Lesson not found.");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lesson, roadmap, lessonId]);

  const handleQuizComplete = (result: { correct: number, total: number }) => {
    setQuizResult(result);
  };

  const handleRetryQuiz = () => {
    fetchLessonContent();
  };

  const handleMarkAsComplete = () => {
    if (lesson.completed) {
      updateLessonProgress(lesson.id, false);
      setLessonMastery(lesson.id, false); // Reset mastery
      setQuizResult(null); // Reset quiz result for this session
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

    updateLessonProgress(lesson.id, true);
    
    if (nextLesson) {
      router.push(`/lesson/${nextLesson.id}`);
    } else {
      router.push('/dashboard');
    }
  };


  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 text-center">
        <LoadingSpinner className="h-16 w-16" />
        <p className="text-lg text-muted-foreground">{quizResult ? 'Generating new questions...' : `Generating your lesson on "${lesson?.title || 'this topic'}"...`}</p>
      </div>
    );
  }

  if (error || !lessonContent || !lesson) {
    return (
      <div className="container mx-auto py-8 text-center">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="font-headline text-2xl text-destructive">Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error || "Lesson not found."}</p>
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
