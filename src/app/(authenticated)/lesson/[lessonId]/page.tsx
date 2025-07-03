"use client";

import { useEffect, useState, useMemo } from "react";
import Link from "next/link";
import { useStudy } from "@/hooks/useStudy";
import { generateLessonContent } from "@/ai/flows/generate-lesson-content";
import type { GenerateLessonContentOutput } from "@/ai/flows/generate-lesson-content";
import { LessonViewer } from "@/components/LessonViewer";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function LessonPage({ params }: { params: { lessonId: string } }) {
  const { lessonId } = params;
  const { roadmap, updateLessonProgress } = useStudy();
  const [lessonContent, setLessonContent] = useState<GenerateLessonContentOutput | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const lesson = useMemo(() => {
    if (!roadmap) return null;
    for (const unit of roadmap.units) {
      const foundLesson = unit.lessons.find((l) => l.id === lessonId);
      if (foundLesson) return foundLesson;
    }
    return null;
  }, [roadmap, lessonId]);

  useEffect(() => {
    if (lesson) {
      const fetchContent = async () => {
        setLoading(true);
        setError(null);
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
    }
  }, [lesson]);

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
    updateLessonProgress(lesson.id, !lesson.completed);
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
      />
    </div>
  );
}
