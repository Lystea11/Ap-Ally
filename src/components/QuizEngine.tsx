"use client";

import { useState } from "react";
import { GenerateQuizOutput } from "@/ai/flows/generate-quiz";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

interface QuizEngineProps {
  quiz: GenerateQuizOutput;
  onSubmit: (answers: string) => void;
}

export function QuizEngine({ quiz, onSubmit }: QuizEngineProps) {
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  if (!quiz?.questions?.length) {
    return (
        <Card>
            <CardHeader>
                <CardTitle>Quiz Not Available</CardTitle>
                <CardDescription>
                    We couldn&apos;t generate a quiz for you at this moment. You can proceed without it.
                </CardDescription>
            </CardHeader>
            <CardFooter>
                <Button onClick={() => onSubmit("No quiz taken.")} size="lg">
                    Generate Roadmap Anyway
                </Button>
            </CardFooter>
        </Card>
    );
  }


  const handleAnswerChange = (questionIndex: number, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionIndex]: value }));
  };

  const handleNext = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    }
  };

  const handleSubmit = () => {
    const formattedAnswers = Object.entries(answers)
      .map(([questionIndex, answer]) => {
        const question = quiz.questions[parseInt(questionIndex)];
        return `Question: ${question?.question}\nAnswer: ${answer}`;
      })
      .join("\n\n");
    onSubmit(formattedAnswers);
  };

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  if (!currentQuestion) {
    return null;
  }

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
            value={answers[currentQuestionIndex] || ""}
            onValueChange={(value) => handleAnswerChange(currentQuestionIndex, value)}
            className="space-y-4"
          >
            {currentQuestion.options.map((option, i) => (
              <div key={i} className="flex items-center space-x-3">
                <RadioGroupItem value={option} id={`q${currentQuestionIndex}-o${i}`} />
                <Label htmlFor={`q${currentQuestionIndex}-o${i}`} className="text-base font-normal">
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
              disabled={answers[currentQuestionIndex] === undefined}
              size="lg"
            >
              Finish & Generate Roadmap
            </Button>
          ) : (
            <Button
              onClick={handleNext}
              disabled={answers[currentQuestionIndex] === undefined}
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
