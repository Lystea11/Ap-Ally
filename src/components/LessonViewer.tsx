// src/components/LessonViewer.tsx
"use client";

import dynamic from 'next/dynamic';
import { Lesson } from "@/lib/types";
import type { GenerateLessonContentOutput } from "@/ai/flows/generate-lesson-content";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, ArrowRight, RefreshCw, Trophy, Star, Sparkles } from "lucide-react";
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { PracticeQuiz } from "./PracticeQuiz";
import { JsonTable } from './JsonTable';
import { YouTubeEmbed } from './YouTubeEmbed';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useState, useEffect, useRef } from 'react';


const MermaidDiagram = dynamic(() => import('./MermaidDiagram').then(mod => mod.MermaidDiagram), {
  ssr: false, // This is the crucial part
});


interface LessonViewerProps {
  lesson: Lesson;
  content: GenerateLessonContentOutput;
  onToggleComplete: () => void;
  onNavigateNext: () => void;
  nextLesson: Lesson | null;
  onQuizComplete: (score: { correct: number, total: number }) => void;
  onRetryQuiz: () => void;
  quizResult: { correct: number, total: number } | null;
}

export function LessonViewer({ lesson, content, onToggleComplete, onNavigateNext, nextLesson, onQuizComplete, onRetryQuiz, quizResult }: LessonViewerProps) {
  const hasPracticeQuestions = content.practiceQuestions && content.practiceQuestions.length > 0;
  // A lesson can be completed if it has no questions, or if the quiz has been passed.
  const canComplete = !hasPracticeQuestions || (quizResult ? quizResult.correct >= 4 : false);
  const hasFailedQuiz = quizResult && quizResult.correct < 4;
  const hasMastery = quizResult && quizResult.correct === quizResult.total;
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [showCelebration, setShowCelebration] = useState(false);
  const [canDismissCelebration, setCanDismissCelebration] = useState(false);
  const celebrationShownRef = useRef<string | null>(null);

  // Trigger celebration effect when mastery is achieved
  useEffect(() => {
    const quizKey = quizResult ? `${quizResult.correct}-${quizResult.total}` : null;
    
    if (hasMastery && quizKey && celebrationShownRef.current !== quizKey) {
      celebrationShownRef.current = quizKey;
      setShowCelebration(true);
      setCanDismissCelebration(false);
      
      // Enable dismissal after delay to prevent submit button click interference
      const timer = setTimeout(() => {
        setCanDismissCelebration(true);
      }, 300);
      
      return () => clearTimeout(timer);
    }
  }, [hasMastery, quizResult]);

  // Add keyboard event listener to dismiss celebration (with delay to avoid submit button interference)
  useEffect(() => {
    const handleKeyPress = () => {
      if (canDismissCelebration) {
        setShowCelebration(false);
      }
    };

    if (showCelebration && canDismissCelebration) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [showCelebration, canDismissCelebration]);

  // Reset dismissal state when celebration is hidden
  useEffect(() => {
    if (!showCelebration) {
      setCanDismissCelebration(false);
    }
  }, [showCelebration]);

  return (
    <div className="space-y-8 relative">
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
                  case 'video':
                    return <YouTubeEmbed key={index} url={block.url} title={block.title} />;
                  default:
                    return null;
                }
              })}
            </div>
          </CardContent>
        <CardFooter className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <Button 
            onClick={lesson.completed ? onNavigateNext : onToggleComplete} 
            size="lg" 
            disabled={!lesson.completed && !canComplete}
            className="w-full sm:w-auto"
          >
            <CheckCircle className="mr-2 h-5 w-5" />
            {nextLesson ? 'Next Lesson' : 'Complete & Finish'}
            {nextLesson && <ArrowRight className="ml-2 h-5 w-5" />}
          </Button>

          {hasPracticeQuestions && (
            <Dialog open={isQuizOpen} onOpenChange={setIsQuizOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  {hasFailedQuiz ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4" />
                      Try Again
                    </>
                  ) : (
                    "Take Practice Quiz"
                  )}
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-0">
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

      {/* Mastery Achievement Celebration */}
      {showCelebration && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center cursor-pointer"
          onClick={() => canDismissCelebration && setShowCelebration(false)}
        >
          <div className="bg-black/10 absolute inset-0 backdrop-blur-sm" />
          <div className="relative bg-gradient-to-br from-background via-background to-primary/5 border border-primary/20 rounded-2xl p-6 shadow-2xl animate-in zoom-in duration-300 max-w-sm mx-4">
            {/* Floating icons animation */}
            <div className="absolute -top-3 -left-3 text-primary animate-bounce">
              <Star className="h-6 w-6 fill-current" />
            </div>
            <div className="absolute -top-3 -right-3 text-primary animate-bounce delay-100">
              <Sparkles className="h-6 w-6" />
            </div>
            <div className="absolute -bottom-3 -left-3 text-primary animate-bounce delay-200">
              <Trophy className="h-6 w-6" />
            </div>
            <div className="absolute -bottom-3 -right-3 text-primary animate-bounce delay-300">
              <Star className="h-6 w-6 fill-current" />
            </div>
            
            {/* Main content */}
            <div className="text-center space-y-3">
              <div className="flex justify-center">
                <div className="bg-primary p-3 rounded-full animate-pulse">
                  <Trophy className="h-8 w-8 text-primary-foreground" />
                </div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-foreground mb-1">Mastery Achieved!</h2>
                <p className="text-sm text-muted-foreground">
                  Perfect score! You've earned the mastery badge.
                </p>
              </div>
              <div className="flex justify-center space-x-1">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className="h-4 w-4 text-primary fill-current animate-pulse" 
                    style={{ animationDelay: `${i * 50}ms` }}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}