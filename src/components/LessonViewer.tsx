
"use client";

import { Lesson } from "@/lib/types";
import type { GenerateLessonContentOutput } from "@/ai/flows/generate-lesson-content";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Circle, ArrowRight } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { PracticeQuiz } from "./PracticeQuiz";

interface LessonViewerProps {
  lesson: Lesson;
  content: GenerateLessonContentOutput;
  onToggleComplete: () => void;
  nextLesson: Lesson | null;
  onQuizComplete: (score: { correct: number, total: number }) => void;
  onRetryQuiz: () => void;
}

export function LessonViewer({ lesson, content, onToggleComplete, nextLesson, onQuizComplete, onRetryQuiz }: LessonViewerProps) {
  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-4xl">{lesson.title}</CardTitle>
          <CardDescription className="text-lg pt-2">{content.progress}</CardDescription>
        </CardHeader>
        <CardContent>
            <div className="prose prose-lg max-w-none dark:prose-invert">
                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                    {content.content}
                </ReactMarkdown>
            </div>
        </CardContent>
        <CardFooter>
          <Button onClick={onToggleComplete} size="lg">
            {lesson.completed ? (
              <>
                <Circle className="mr-2 h-5 w-5" />
                Mark as Incomplete
              </>
            ) : (
              <>
                <CheckCircle className="mr-2 h-5 w-5" />
                {nextLesson ? 'Complete & Next Lesson' : 'Complete & Finish'}
                {nextLesson && <ArrowRight className="ml-2 h-5 w-5" />}
              </>
            )}
          </Button>
        </CardFooter>
      </Card>

      {content.practiceQuestions && content.practiceQuestions.length > 0 && (
        <PracticeQuiz
          lessonId={lesson.id}
          questions={content.practiceQuestions}
          onQuizComplete={onQuizComplete}
          onRetry={onRetryQuiz}
        />
      )}
    </div>
  );
}
