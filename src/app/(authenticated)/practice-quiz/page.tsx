"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Clock, FileText, CheckSquare, PenTool, Target, ArrowRight, ArrowLeft } from "lucide-react";

interface QuizQuestion {
  type: "mcq" | "leq" | "laq";
  question?: string;
  prompt?: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
  unit: string;
  difficulty: string;
  timeLimit?: number;
  points?: number;
  rubric?: any;
  requirements?: string[];
  sampleResponse?: string;
}

interface QuizData {
  title: string;
  format: string;
  totalQuestions: number;
  estimatedTime: number;
  instructions: string;
  questions: QuizQuestion[];
}

export default function PracticeQuizPage() {
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showAnswers, setShowAnswers] = useState(false);

  useEffect(() => {
    const storedQuiz = sessionStorage.getItem('practice-quiz');
    if (storedQuiz) {
      setQuizData(JSON.parse(storedQuiz));
    }
  }, []);

  if (!quizData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">No quiz data found.</p>
            <Button onClick={() => window.close()}>Close Window</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = quizData.questions[currentQuestion];
  const isLastQuestion = currentQuestion === quizData.questions.length - 1;
  const isFirstQuestion = currentQuestion === 0;

  const handleAnswerSelect = (answer: string) => {
    setAnswers(prev => ({ ...prev, [currentQuestion]: answer }));
  };

  const nextQuestion = () => {
    if (currentQuestion < quizData.questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const previousQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const finishQuiz = () => {
    setShowAnswers(true);
  };

  const getQuestionIcon = (type: string) => {
    switch (type) {
      case "mcq": return <CheckSquare className="h-5 w-5" />;
      case "leq": return <FileText className="h-5 w-5" />;
      case "laq": return <PenTool className="h-5 w-5" />;
      default: return <Target className="h-5 w-5" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Quiz Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-2xl font-headline">{quizData.title}</CardTitle>
                <div className="flex items-center gap-4 mt-2">
                  <Badge variant="secondary">{quizData.format.toUpperCase()}</Badge>
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-4 w-4" />
                    <span className="text-sm">{quizData.estimatedTime} minutes</span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {quizData.totalQuestions} questions
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground">Question</div>
                <div className="text-2xl font-bold text-primary">
                  {currentQuestion + 1} / {quizData.questions.length}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Instructions */}
        {currentQuestion === 0 && !showAnswers && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Instructions</h3>
              <p className="text-sm text-muted-foreground">{quizData.instructions}</p>
            </CardContent>
          </Card>
        )}

        {/* Question Card */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center gap-3">
              {getQuestionIcon(question.type)}
              <div>
                <CardTitle className="text-lg">
                  Question {currentQuestion + 1}
                  {question.type === "leq" && " - Long Essay Question"}
                  {question.type === "laq" && " - Long Answer Question"}
                  {question.type === "mcq" && " - Multiple Choice"}
                </CardTitle>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{question.unit}</Badge>
                  <Badge variant="outline">{question.difficulty}</Badge>
                  {question.timeLimit && (
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {question.timeLimit} min
                    </div>
                  )}
                  {question.points && (
                    <div className="text-sm text-muted-foreground">
                      {question.points} points
                    </div>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Question Content */}
            <div className="prose prose-sm max-w-none">
              <p className="text-base leading-relaxed">
                {question.question || question.prompt}
              </p>
            </div>

            {/* MCQ Options */}
            {question.type === "mcq" && question.options && (
              <div className="space-y-3">
                <RadioGroup
                  value={answers[currentQuestion] || ""}
                  onValueChange={handleAnswerSelect}
                >
                  {question.options.map((option, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-muted/50">
                      <RadioGroupItem value={option} id={`option-${index}`} className="mt-1" />
                      <Label htmlFor={`option-${index}`} className="text-sm cursor-pointer flex-1">
                        <span className="font-medium mr-2">{String.fromCharCode(65 + index)}.</span>
                        {option}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

            {/* LEQ Rubric */}
            {question.type === "leq" && question.rubric && (
              <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold mb-2">Scoring Rubric</h4>
                <div className="space-y-2 text-sm">
                  <div><strong>Thesis/Claim:</strong> {question.rubric.thesis}</div>
                  <div><strong>Evidence:</strong> {question.rubric.evidence}</div>
                  <div><strong>Analysis:</strong> {question.rubric.analysis}</div>
                  <div><strong>Synthesis:</strong> {question.rubric.synthesis}</div>
                </div>
              </div>
            )}

            {/* LAQ Requirements */}
            {question.type === "laq" && question.requirements && (
              <div className="mt-4 p-4 bg-muted/30 rounded-lg">
                <h4 className="font-semibold mb-2">Requirements</h4>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  {question.requirements.map((req, index) => (
                    <li key={index}>{req}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* Show Answer/Explanation */}
            {showAnswers && question.type === "mcq" && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">Correct Answer</h4>
                <p className="text-sm"><strong>Answer:</strong> {question.correctAnswer}</p>
                {question.explanation && (
                  <p className="text-sm mt-2"><strong>Explanation:</strong> {question.explanation}</p>
                )}
              </div>
            )}

            {showAnswers && (question.type === "leq" || question.type === "laq") && question.sampleResponse && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold text-blue-800 mb-2">Sample Response Points</h4>
                <p className="text-sm">{question.sampleResponse}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <Button
            variant="outline"
            onClick={previousQuestion}
            disabled={isFirstQuestion}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Previous
          </Button>

          <div className="flex gap-2">
            {!showAnswers ? (
              <>
                {!isLastQuestion ? (
                  <Button onClick={nextQuestion} className="flex items-center gap-2">
                    Next
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <Button onClick={finishQuiz} className="bg-green-600 hover:bg-green-700">
                    Finish & Show Answers
                  </Button>
                )}
              </>
            ) : (
              <Button
                variant="outline"
                onClick={nextQuestion}
                disabled={isLastQuestion}
                className="flex items-center gap-2"
              >
                Next Question
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}