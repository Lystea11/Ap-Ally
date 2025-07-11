// src/components/LessonViewer.tsx
"use client";

import dynamic from 'next/dynamic';
import { Lesson } from "@/lib/types";
import type { GenerateLessonContentOutput } from "@/ai/flows/generate-lesson-content";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Circle, ArrowRight } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { PracticeQuiz } from "./PracticeQuiz";
import { JsonTable } from './JsonTable';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState } from 'react';


const MermaidDiagram = dynamic(() => import('./MermaidDiagram').then(mod => mod.MermaidDiagram), {
  ssr: false, // This is the crucial part
});


interface LessonViewerProps {
  lesson: Lesson;
  content: GenerateLessonContentOutput;
  onToggleComplete: () => void;
  nextLesson: Lesson | null;
  onQuizComplete: (score: { correct: number, total: number }) => void;
  onRetryQuiz: () => void;
  quizResult: { correct: number, total: number } | null;
}

export function LessonViewer({ lesson, content, onToggleComplete, nextLesson, onQuizComplete, onRetryQuiz, quizResult }: LessonViewerProps) {
  const hasPracticeQuestions = content.practiceQuestions && content.practiceQuestions.length > 0;
  // A lesson can be completed if it has no questions, or if the quiz has been passed.
  const canComplete = !hasPracticeQuestions || (quizResult ? quizResult.correct >= 4 : false);
  const [isQuizOpen, setIsQuizOpen] = useState(false);


  return (
    <div className="space-y-8">
      <Card>
          <CardContent>
            <div className="prose prose-lg pt-8 max-w-none dark:prose-invert">
              {content.content.map((block, index) => {
                switch (block.type) {
                  case 'markdown':
                    return <ReactMarkdown key={index} remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>{block.content}</ReactMarkdown>;
                  case 'table':
                    return <JsonTable key={index} headers={block.headers} rows={block.rows} />;
                  case 'diagram':
                    return <MermaidDiagram key={index} code={block.code} />;
                  default:
                    return null;
                }
              })}
            </div>
          </CardContent>
        <CardFooter className="flex flex-wrap gap-4">
          <Button onClick={onToggleComplete} size="lg" disabled={!lesson.completed && !canComplete}>
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

          {hasPracticeQuestions && (
            <Dialog open={isQuizOpen} onOpenChange={setIsQuizOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="lg">Take Practice Quiz</Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Practice Quiz</DialogTitle>
                </DialogHeader>
                <PracticeQuiz
                  lessonId={lesson.id}
                  questions={content.practiceQuestions}
                  onQuizComplete={(score) => {
                    onQuizComplete(score);
                    setIsQuizOpen(false);
                  }}
                  onRetry={onRetryQuiz}
                />
              </DialogContent>
            </Dialog>
          )}
        </CardFooter>
      </Card>


    </div>
  );
}