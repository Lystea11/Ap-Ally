
"use client";

import { useEffect, useState, useMemo } from "react";
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

export default function LessonPage({ params }: { params: { lessonId: string } }) {
  const { lessonId } = params;
  const { roadmap, updateLessonProgress } = useStudy();
  const router = useRouter();
  const [lessonContent, setLessonContent] = useState<GenerateLessonContentOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  useEffect(() => {
    if (lesson) {
      setLoading(true);
      setError(null);
      const fetchContent = async () => {
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
      fetchContent();
    } else if (roadmap) { // roadmap has loaded but no lesson found
      setLoading(false);
      setError("Lesson not found.");
    }
  }, [lesson, roadmap]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 text-center">
        <LoadingSpinner className="h-16 w-16" />
        <p className="text-lg text-muted-foreground">Generating your lesson on "{lesson?.title || 'this topic'}"...</p>
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

  const handleMarkAsComplete = () => {
    // If it's already completed, we're marking it as incomplete.
    if (lesson.completed) {
      updateLessonProgress(lesson.id, false);
      return;
    }

    // Otherwise, we're marking it as complete.
    updateLessonProgress(lesson.id, true);
    
    // Then navigate to the next lesson, or the dashboard if it's the last one.
    if (nextLesson) {
      router.push(`/lesson/${nextLesson.id}`);
    } else {
      router.push('/dashboard');
    }
  };

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
      />
    </div>
  );
}
