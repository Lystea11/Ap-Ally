"use client";

import { useState } from "react";
import { ParsedQuiz } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface QuizEngineProps {
  quiz: ParsedQuiz;
  onSubmit: (answers: string) => void;
}

export function QuizEngine({ quiz, onSubmit }: QuizEngineProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const handleAnswerChange = (questionId: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmit = () => {
    const formattedAnswers = Object.entries(answers)
      .map(([questionId, answer]) => {
        const question = quiz.questions.find((q) => q.id === parseInt(questionId));
        return `Question: ${question?.question}\nAnswer: ${answer}`;
      })
      .join("\n\n");
    onSubmit(formattedAnswers);
  };

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-xl">
            Question {currentQuestionIndex + 1} / {quiz.questions.length}
          </CardTitle>
          <CardDescription className="text-lg pt-2">{currentQuestion.question}</CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={answers[currentQuestion.id] || ""}
            onValueChange={(value) => handleAnswerChange(currentQuestion.id, value)}
            className="space-y-4"
          >
            {currentQuestion.options.map((option, i) => (
              <div key={i} className="flex items-center space-x-3">
                <RadioGroupItem value={option} id={`q${currentQuestion.id}-o${i}`} />
                <Label htmlFor={`q${currentQuestion.id}-o${i}`} className="text-base font-normal">
                  {option}
                </Label>
              </div>
            ))}
          </RadioGroup>
        </CardContent>
        <CardFooter className="flex justify-end">
          {isLastQuestion ? (
            <Button
              onClick={handleSubmit}
              disabled={!answers[currentQuestion.id]}
              size="lg"
            >
              Finish & Generate Roadmap
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={!answers[currentQuestion.id]}
              size="lg"
            >
              Next
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
