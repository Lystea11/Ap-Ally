// src/components/PracticeQuiz.tsx

"use client";

import { useState } from 'react';
import { useStudy } from '@/hooks/useStudy';
import { type GenerateLessonContentOutput } from '@/ai/flows/generate-lesson-content';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Award, BrainCircuit, Check, X, RefreshCw, ThumbsUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

type PracticeQuestion = GenerateLessonContentOutput['practiceQuestions'][0];

interface PracticeQuizProps {
  lessonId: string;
  questions: PracticeQuestion[];
  onQuizComplete: (score: { correct: number, total: number }) => void;
  onRetry: () => void;
}

export function PracticeQuiz({ lessonId, questions, onQuizComplete, onRetry }: PracticeQuizProps) {
  const { setLessonMastery } = useStudy();
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleAnswerChange = (questionIndex: number, optionIndex: number) => {
    if (submitted) return;
    setAnswers((prev) => ({ ...prev, [questionIndex]: optionIndex }));
  };

  const handleSubmit = async () => {
    const correctCount = questions.filter((q, i) => answers[i] === q.correctAnswerIndex).length;
    const totalCount = questions.length;
    const isMastered = correctCount === totalCount;
    
    setSubmitted(true);
    onQuizComplete({ correct: correctCount, total: totalCount });

    await setLessonMastery(lessonId, isMastered, correctCount);
  };

  const handleRetry = () => {
    setAnswers({});
    setSubmitted(false);
    onRetry();
  }

  const getResultStats = () => {
    if (!submitted) return null;
    const correctCount = questions.filter((q, i) => answers[i] === q.correctAnswerIndex).length;
    const totalCount = questions.length;
    const isMastered = correctCount === totalCount;
    const isPassed = correctCount >= 4;
    return { correctCount, totalCount, isMastered, isPassed };
  };

  const resultStats = getResultStats();
  
  // Custom renderer to handle paragraphs inside labels and other inline contexts
  const renderers = {
    p: (props: any) => <span {...props} className="inline" />
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3">
              <BrainCircuit className="h-7 w-7 text-primary" />
              <CardTitle className="font-headline text-2xl">Practice Quiz</CardTitle>
            </div>
            <CardDescription>Score at least 4/{questions.length} to pass. Get a perfect score to earn a mastery badge.</CardDescription>
          </div>
          {resultStats && !resultStats.isMastered && (
            <Button onClick={handleRetry} variant="outline">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-8">
        {resultStats && (
            <div className="space-y-4">
                <Alert 
                  variant={resultStats.isPassed ? 'default' : 'destructive'} 
                  className={cn(
                    resultStats.isMastered && "border-green-500 bg-green-50 text-green-800 dark:bg-green-950 dark:text-green-200 dark:border-green-800",
                    resultStats.isPassed && !resultStats.isMastered && "border-primary/50 bg-primary/10 text-primary dark:bg-primary/20 dark:border-primary/60"
                  )}
                >
                    {resultStats.isMastered ? (
                      <Award className="h-4 w-4 !text-green-800 dark:!text-green-200" />
                    ) : resultStats.isPassed ? (
                      <ThumbsUp className="h-4 w-4 text-primary" />
                    ) : null}
                     <AlertTitle className="font-bold">
                        {resultStats.isMastered
                          ? "Mastery Achieved!"
                          : resultStats.isPassed
                          ? "Congratulations, You Passed!"
                          : "Review Needed"}
                    </AlertTitle>
                    <AlertDescription>
                        You scored {resultStats.correctCount} out of {resultStats.totalCount}. 
                        {resultStats.isMastered
                          ? " Great job! You've earned the mastery badge for this lesson."
                          : resultStats.isPassed
                          ? " You're ready to move on. Retake the quiz for a perfect score to earn the mastery badge!"
                          : " Review the explanations below and try again."}
                    </AlertDescription>
                </Alert>
            </div>
        )}

        {questions.map((q, qIndex) => (
          <div key={qIndex} className="space-y-4">
            <div className="font-semibold flex items-center gap-2 prose prose-lg dark:prose-invert max-w-none">
              <span>{qIndex + 1}.</span>
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {q.question}
              </ReactMarkdown>
            </div>
            <RadioGroup
              value={answers[qIndex]?.toString() ?? ''}
              onValueChange={(value) => handleAnswerChange(qIndex, parseInt(value))}
              disabled={submitted}
            >
              {q.options.map((option, oIndex) => {
                 const isCorrect = oIndex === q.correctAnswerIndex;
                 const isSelected = answers[qIndex] === oIndex;
                 const statusIcon = isCorrect ? <Check className="h-5 w-5 text-green-600" /> : <X className="h-5 w-5 text-destructive" />;

                return (
                  <div
                    key={oIndex}
                    className={cn(
                      "flex items-center space-x-3 rounded-md border p-3 transition-colors",
                      submitted && isCorrect && "border-green-500 bg-green-50 dark:bg-green-950",
                      submitted && !isCorrect && isSelected && "border-destructive bg-red-50 dark:bg-red-950"
                    )}
                  >
                    <RadioGroupItem value={oIndex.toString()} id={`q${qIndex}-o${oIndex}`} />
                    <Label htmlFor={`q${qIndex}-o${oIndex}`} className="flex-1 font-normal cursor-pointer">
                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={renderers}>
                        {option}
                      </ReactMarkdown>
                    </Label>
                    {submitted && (isSelected || isCorrect) && (
                      <div className="ml-auto">{statusIcon}</div>
                    )}
                  </div>
                );
              })}
            </RadioGroup>
            {submitted && (
                <div className="p-4 bg-muted/50 rounded-md mt-2 text-sm">
                    <span className="font-semibold">Explanation: </span>
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={renderers}>
                        {q.explanation}
                    </ReactMarkdown>
                </div>
            )}
          </div>
        ))}
        
        <div className="flex justify-start">
            {!submitted && (
                <Button onClick={handleSubmit} disabled={Object.keys(answers).length !== questions.length}>
                    Submit Quiz
                </Button>
            )}
        </div>
      </CardContent>
    </Card>
  );
}