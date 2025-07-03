
"use client";

import { Lesson } from "@/lib/types";
import type { GenerateLessonContentOutput } from "@/ai/flows/generate-lesson-content";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, Circle, BrainCircuit, ArrowRight } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface LessonViewerProps {
  lesson: Lesson;
  content: GenerateLessonContentOutput;
  onToggleComplete: () => void;
  nextLesson: Lesson | null;
}

export function LessonViewer({ lesson, content, onToggleComplete, nextLesson }: LessonViewerProps) {
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
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <BrainCircuit className="h-7 w-7 text-primary" />
              <CardTitle className="font-headline text-2xl">Practice Questions</CardTitle>
            </div>
            <CardDescription>Test your understanding of the material.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {content.practiceQuestions.map((question, index) => (
              <div key={index}>
                <p className="font-semibold">{index + 1}. {question}</p>
                {index < content.practiceQuestions.length - 1 && <Separator className="mt-6" />}
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
