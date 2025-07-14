"use client";

import { useState } from "react";
import { GenerateQuizOutput } from "@/ai/flows/generate-quiz";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import ReactMarkdown from "react-markdown";
import remarkMath from "remark-math";
import rehypeKatex from "rehype-katex";
import "katex/dist/katex.min.css";

interface QuizEngineProps {
  quiz: GenerateQuizOutput;
  onSubmit: (answers: string, rawAnswers: Record<number, string>, quizData: GenerateQuizOutput) => void;
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
                <Button onClick={() => onSubmit("No quiz taken.", {}, quiz)} size="lg">
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
        return `Question: ${question?.question}\nUnit: ${question?.unit}\nSkill: ${question?.skill}\nAnswer: ${answer}`;
      })
      .join("\n\n");
    onSubmit(formattedAnswers, answers, quiz);
  };

  const currentQuestion = quiz.questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === quiz.questions.length - 1;

  if (!currentQuestion) {
    return null;
  }

  const progressValue = ((currentQuestionIndex + 1) / quiz.questions.length) * 100;
  
  // Clean the question text by removing "Unit X:" prefixes
  const cleanQuestion = currentQuestion.question.replace(/^Unit\s+\d+:\s*/i, '').trim();
  
  // Extract unit number if it exists in the unit field
  const unitMatch = currentQuestion.unit.match(/Unit\s+(\d+)/i);
  const unitNumber = unitMatch ? unitMatch[1] : null;

  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>Diagnostic Quiz Progress</span>
          <span>{currentQuestionIndex + 1} of {quiz.questions.length}</span>
        </div>
        <Progress value={progressValue} className="h-2" />
      </div>
      
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2 mb-3">
            {unitNumber && (
              <Badge className="bg-blue-500 hover:bg-blue-600 text-white">
                Unit {unitNumber}
              </Badge>
            )}
            <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
              {currentQuestion.unit.replace(/Unit\s+\d+:?\s*/i, '').trim()}
            </Badge>
            <Badge variant="outline" className="border-green-200 text-green-700">
              {currentQuestion.skill}
            </Badge>
          </div>
          <CardTitle className="font-headline text-xl">
            Question {currentQuestionIndex + 1}
          </CardTitle>
          <CardDescription className="text-lg pt-2">
            <ReactMarkdown
              remarkPlugins={[remarkMath]}
              rehypePlugins={[rehypeKatex]}
            >
              {cleanQuestion}
            </ReactMarkdown>
          </CardDescription>
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
                  <ReactMarkdown
                    remarkPlugins={[remarkMath]}
                    rehypePlugins={[rehypeKatex]}
                    className="inline"
                  >
                    {option}
                  </ReactMarkdown>
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
