// src/components/PracticeQuiz.tsx

"use client";

import { useState } from 'react';
import { useStudy } from '@/hooks/useStudy';
import { useGamification } from '@/hooks/useGamification';
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
  const { setLessonMastery, updateLessonProgress } = useStudy();
  const { updateProgress } = useGamification();
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
    const isPassed = correctCount >= 4;
    
    setSubmitted(true);
    onQuizComplete({ correct: correctCount, total: totalCount });

    try {
      // Update both mastery and lesson completion if passed
      const promises = [setLessonMastery(lessonId, isMastered, correctCount)];
      
      if (isPassed) {
        promises.push(updateLessonProgress(lessonId, true));
        
        // Update gamification progress for lesson completion only
        // Note: This is a lesson quiz, not a practice quiz (mock test)
        promises.push(
          updateProgress({
            lessonCompleted: true,
          })
        );
      }
      
      await Promise.all(promises);
    } catch (error) {
      console.error('Failed to update lesson progress:', error);
    }
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
  
  // Function to preprocess mathematical expressions
  const preprocessMathContent = (content: string) => {
    if (!content) return content;
    
    // Common mathematical patterns that need LaTeX formatting
    const mathPatterns = [
      // Superscripts like ^2, ^3
      { pattern: /\^(\d+)/g, replacement: '^{$1}' },
      { pattern: /\^(\([^)]+\))/g, replacement: '^{$1}' },
      // Subscripts like _2, _3
      { pattern: /_(\d+)/g, replacement: '_{$1}' },
      { pattern: /_(\([^)]+\))/g, replacement: '_{$1}' },
      // Fractions like a/b (only if not already in LaTeX)
      { pattern: /(\w+)\/(\w+)/g, replacement: '\\frac{$1}{$2}' },
      // Integrals
      { pattern: /∫/g, replacement: '\\int' },
      // Greek letters
      { pattern: /π/g, replacement: '\\pi' },
      { pattern: /α/g, replacement: '\\alpha' },
      { pattern: /β/g, replacement: '\\beta' },
      { pattern: /γ/g, replacement: '\\gamma' },
      { pattern: /δ/g, replacement: '\\delta' },
      { pattern: /Δ/g, replacement: '\\Delta' },
      { pattern: /θ/g, replacement: '\\theta' },
      { pattern: /λ/g, replacement: '\\lambda' },
      { pattern: /μ/g, replacement: '\\mu' },
      { pattern: /σ/g, replacement: '\\sigma' },
      { pattern: /φ/g, replacement: '\\phi' },
      { pattern: /ω/g, replacement: '\\omega' },
      // Special symbols
      { pattern: /∞/g, replacement: '\\infty' },
      { pattern: /±/g, replacement: '\\pm' },
      { pattern: /≤/g, replacement: '\\leq' },
      { pattern: /≥/g, replacement: '\\geq' },
      { pattern: /≠/g, replacement: '\\neq' },
      { pattern: /×/g, replacement: '\\times' },
      { pattern: /÷/g, replacement: '\\div' },
      { pattern: /√/g, replacement: '\\sqrt' },
    ];
    
    let processed = content;
    
    // Check if content already has LaTeX delimiters
    const hasLatexDelimiters = /\$[^$]+\$/.test(processed) || /\$\$[^$]+\$\$/.test(processed);
    
    if (!hasLatexDelimiters) {
      // Apply mathematical pattern replacements
      mathPatterns.forEach(({ pattern, replacement }) => {
        processed = processed.replace(pattern, replacement);
      });
      
      // Wrap in LaTeX delimiters if we made any changes and it contains math symbols
      if (processed !== content && /[\\^_{}]/.test(processed)) {
        processed = `$${processed}$`;
      }
    }
    
    return processed;
  };

  // Custom renderer to handle paragraphs inside labels and other inline contexts
  const renderers = {
    p: (props: any) => <span {...props} className="inline" />
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div className="flex-1">
            <div className="flex items-center gap-3">
              <BrainCircuit className="h-6 w-6 sm:h-7 sm:w-7 text-primary" />
              <CardTitle className="font-headline text-xl sm:text-2xl">Practice Quiz</CardTitle>
            </div>
            <CardDescription className="text-sm sm:text-base">Score at least 4/{questions.length} to pass. Get a perfect score to earn a mastery badge.</CardDescription>
          </div>
          {resultStats && !resultStats.isMastered && (
            <Button onClick={handleRetry} variant="outline" size="sm" className="w-full sm:w-auto">
                <RefreshCw className="mr-2 h-4 w-4" />
                Try Again
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-6 sm:space-y-8">
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
                     <AlertTitle className="font-bold text-sm sm:text-base">
                        {resultStats.isMastered
                          ? "Mastery Achieved!"
                          : resultStats.isPassed
                          ? "Congratulations, You Passed!"
                          : "Review Needed"}
                    </AlertTitle>
                    <AlertDescription className="text-sm">
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
          <div key={qIndex} className="space-y-3 sm:space-y-4">
            <div className="font-semibold flex items-start gap-2 prose prose-base sm:prose-lg dark:prose-invert max-w-none">
              <span className="mt-1 text-sm sm:text-base">{qIndex + 1}.</span>
              <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                {preprocessMathContent(q.question)}
              </ReactMarkdown>
            </div>
            <RadioGroup
              value={answers[qIndex]?.toString() ?? ''}
              onValueChange={(value) => handleAnswerChange(qIndex, parseInt(value))}
              disabled={submitted}
              className="gap-2 sm:gap-3"
            >
              {q.options.map((option, oIndex) => {
                 const isCorrect = oIndex === q.correctAnswerIndex;
                 const isSelected = answers[qIndex] === oIndex;
                 const statusIcon = isCorrect ? <Check className="h-4 w-4 sm:h-5 sm:w-5 text-green-600" /> : <X className="h-4 w-4 sm:h-5 sm:w-5 text-destructive" />;

                return (
                  <div
                    key={oIndex}
                    className={cn(
                      "flex items-start space-x-3 rounded-md border p-3 transition-colors touch-manipulation",
                      submitted && isCorrect && "border-green-500 bg-green-50 dark:bg-green-950",
                      submitted && !isCorrect && isSelected && "border-destructive bg-red-50 dark:bg-red-950"
                    )}
                  >
                    <RadioGroupItem 
                      value={oIndex.toString()} 
                      id={`q${qIndex}-o${oIndex}`}
                      className="mt-1 shrink-0"
                    />
                    <Label 
                      htmlFor={`q${qIndex}-o${oIndex}`} 
                      className="flex-1 font-normal cursor-pointer text-sm sm:text-base leading-relaxed"
                    >
                      <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={renderers}>
                        {preprocessMathContent(option)}
                      </ReactMarkdown>
                    </Label>
                    {submitted && (isSelected || isCorrect) && (
                      <div className="ml-auto mt-1 shrink-0">{statusIcon}</div>
                    )}
                  </div>
                );
              })}
            </RadioGroup>
            {submitted && (
                <div className="p-3 sm:p-4 bg-muted/50 rounded-md mt-2 text-sm">
                    <span className="font-semibold">Explanation: </span>
                    <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]} components={renderers}>
                        {preprocessMathContent(q.explanation)}
                    </ReactMarkdown>
                </div>
            )}
          </div>
        ))}
        
        <div className="flex justify-start">
            {!submitted && (
                <Button 
                  onClick={handleSubmit} 
                  disabled={Object.keys(answers).length !== questions.length}
                  className="w-full sm:w-auto"
                >
                    Submit Quiz
                </Button>
            )}
            {submitted && (
              <Button 
                onClick={() => onQuizComplete({ correct: resultStats?.correctCount ?? 0, total: resultStats?.totalCount ?? 0})}
                className="w-full sm:w-auto"
              >
                Close
              </Button>
            )}
        </div>
      </CardContent>
    </Card>
  );
}