"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Clock, FileText, PenTool, Target, ArrowRight, ArrowLeft, Brain, TrendingUp, BookOpen, Lightbulb, RotateCcw } from "lucide-react";
import { generateQuizFeedbackAPI, saveQuizResultAPI } from "@/lib/api-client";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAdTrigger } from "@/context/AdContext";
import { useGamification } from "@/hooks/useGamification";
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface QuizQuestion {
  type: "leq" | "laq";
  question?: string;
  prompt?: string;
  unit: string;
  difficulty: string;
  skillCategory?: string;
  stimulus?: string;
  timeLimit?: number;
  points?: number;
  rubric?: {
    thesis?: { points: number; criteria: string };
    evidence?: { points: number; criteria: string };
    analysis?: { points: number; criteria: string };
    complexity?: { points: number; criteria: string };
  };
  parts?: Array<{
    letter: string;
    question: string;
    points: number;
    sampleResponse: string;
  }>;
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

interface FeedbackData {
  overallScore: number;
  totalQuestions: number;
  correctAnswers: number;
  strengths: string[];
  weaknesses: string[];
  improvementSuggestions: Array<{
    area: string;
    suggestion: string;
    resources: string[];
  }>;
  questionFeedback: Array<{
    questionIndex: number;
    isCorrect: boolean;
    correctAnswer: string;
    explanation: string;
    rubricFeedback?: string;
  }>;
}

type ViewMode = 'quiz' | 'grading' | 'results';

export default function FreeResponseQuizPage() {
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<FeedbackData | null>(null);
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('quiz');
  const [quizStartTime, setQuizStartTime] = useState<number>(Date.now());
  const { triggerQuizCompletionAd } = useAdTrigger();
  const { updateProgress } = useGamification();

  useEffect(() => {
    const storedQuiz = sessionStorage.getItem('practice-quiz');
    if (storedQuiz) {
      const quiz = JSON.parse(storedQuiz);
      // Only allow free response formats
      if (quiz.format === 'leq' || quiz.format === 'laq') {
        setQuizData(quiz);
      } else {
        // Redirect to regular quiz page for MCQ
        window.location.href = '/practice-quiz';
      }
    }
  }, []);

  if (!quizData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground mb-4">No free response quiz data found.</p>
            <Button onClick={() => window.close()}>Close Window</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const question = quizData.questions[currentQuestion];
  const isLastQuestion = currentQuestion === quizData.questions.length - 1;
  const isFirstQuestion = currentQuestion === 0;

  const isQuestionAnswered = (questionIndex: number, question: QuizQuestion) => {
    if (question.type === 'leq') {
      return !!(answers[questionIndex] && answers[questionIndex].trim());
    }
    if (question.type === 'laq' && question.parts) {
      return question.parts.every(part => 
        answers[`${questionIndex}-${part.letter}`] && 
        answers[`${questionIndex}-${part.letter}`].trim()
      );
    }
    return false;
  };

  const getAllAnsweredCount = () => {
    if (!quizData) return 0;
    return quizData.questions.filter((question, index) => 
      isQuestionAnswered(index, question)
    ).length;
  };

  const isAllQuestionsAnswered = () => {
    if (!quizData) return false;
    return quizData.questions.every((question, index) => 
      isQuestionAnswered(index, question)
    );
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

  const submitQuiz = async () => {
    setViewMode('grading');
    setIsGeneratingFeedback(true);
    
    try {
      const apCourse = sessionStorage.getItem('ap-course') || 'AP Course';
      
      // Generate AI feedback immediately for free response questions
      const feedbackData = await generateQuizFeedbackAPI({
        apCourse,
        quizData,
        answers: Object.fromEntries(Object.entries(answers).map(([key, value]) => [key, value]))
      });
      
      setFeedback(feedbackData);
      
      // Save quiz results with AI-generated score
      const classId = sessionStorage.getItem('class-id');
      if (classId && feedbackData) {
        try {
          const timeSpent = Math.round((Date.now() - quizStartTime) / 60000);
          const questionsAnswered = getAllAnsweredCount();
          const totalQuestions = quizData.questions.length;
          
          const selectedUnits = Array.from(new Set(
            quizData.questions
              .filter((_, index) => isQuestionAnswered(index, quizData.questions[index]))
              .map(question => question.unit || 'General')
          ));
          
          await saveQuizResultAPI({
            classId,
            quizTitle: quizData.title,
            quizFormat: quizData.format,
            overallScore: feedbackData.overallScore, // Use AI-generated score
            questionsAnswered,
            totalQuestions,
            timeSpent,
            units: selectedUnits,
          });
          
          // Update gamification progress for completing a practice quiz (mock test)
          // This is different from lesson quizzes - this counts toward boar evolution
          try {
            await updateProgress({
              practiceQuizCompleted: true,
              quizPassed: feedbackData.overallScore >= 50, // Consider 50%+ as passing for practice quiz
            });
          } catch (error) {
            console.error('Failed to update gamification progress:', error);
          }
          
          // Trigger ad after successful quiz completion
          triggerQuizCompletionAd({
            quizTitle: quizData.title,
            quizFormat: quizData.format,
            overallScore: feedbackData.overallScore,
            questionsAnswered,
            totalQuestions,
          });
        } catch (error) {
          console.error('Failed to save quiz results:', error);
        }
      }
      
      setViewMode('results');
    } catch (error) {
      console.error('Failed to generate feedback:', error);
      setViewMode('quiz'); // Return to quiz mode on error
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  const goToReview = () => {
    setViewMode('quiz');
    setCurrentQuestion(0);
  };

  const renderLatex = (text: string) => {
    if (!text) return '';
    
    const parts = text.split(/(\$\$.*?\$\$|\$.*?\$|\\\\.*?\\\\|\\\(.*?\\\)|\\\[.*?\\\])/);
    
    return parts.map((part, index) => {
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const math = part.slice(2, -2);
        return <BlockMath key={index} math={math} />;
      }
      if (part.startsWith('\\[') && part.endsWith('\\]')) {
        const math = part.slice(2, -2);
        return <BlockMath key={index} math={math} />;
      }
      if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
        const math = part.slice(1, -1);
        return <InlineMath key={index} math={math} />;
      }
      if (part.startsWith('\\(') && part.endsWith('\\)')) {
        const math = part.slice(2, -2);
        return <InlineMath key={index} math={math} />;
      }
      return <span key={index}>{part}</span>;
    });
  };

  const getQuestionIcon = (type: string) => {
    switch (type) {
      case "leq": return <FileText className="h-5 w-5" />;
      case "laq": return <PenTool className="h-5 w-5" />;
      default: return <Target className="h-5 w-5" />;
    }
  };

  // AI Grading Screen
  if (viewMode === 'grading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <Card className="mb-6">
            <CardContent className="p-8 text-center">
              <div className="flex flex-col items-center gap-6">
                <div className="h-16 w-16 rounded-full bg-blue-100 flex items-center justify-center">
                  <Brain className="h-8 w-8 text-blue-600 animate-pulse" />
                </div>
                <div className="space-y-3">
                  <h2 className="text-2xl font-bold text-blue-800">AI Grading in Progress</h2>
                  <p className="text-muted-foreground max-w-md">
                    Our AI is analyzing your free response answers using official AP rubrics and scoring guidelines. This may take a few moments.
                  </p>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <LoadingSpinner className="h-4 w-4" />
                  <span>Evaluating {quizData.questions.length} {quizData.format.toUpperCase()} question{quizData.questions.length !== 1 ? 's' : ''}...</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Results Screen
  if (viewMode === 'results' && feedback) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Results Header */}
          <Card className="mb-6">
            <CardHeader>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Brain className="h-6 w-6 text-blue-600" />
                  <CardTitle className="text-2xl font-headline">Free Response Quiz Complete!</CardTitle>
                </div>
                <p className="text-muted-foreground">
                  {quizData?.title} - AI-Graded Performance Analysis
                </p>
              </div>
            </CardHeader>
          </Card>

          {/* AI Score Overview */}
          <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-blue-600" />
                AI-Generated Score
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600">
                    {feedback.overallScore}%
                  </div>
                  <div className="text-sm text-muted-foreground">Overall Score</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600">
                    {feedback.correctAnswers}
                  </div>
                  <div className="text-sm text-muted-foreground">Questions Answered</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-600">
                    {feedback.totalQuestions}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Questions</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            <Button
              onClick={goToReview}
              variant="outline"
              className="h-14 text-sm px-3"
            >
              <RotateCcw className="mr-1 h-4 w-4 flex-shrink-0" />
              <span className="truncate">Review Questions & Feedback</span>
            </Button>

            <Button
              onClick={() => {
                // Refresh the parent window (dashboard) before closing
                if (window.opener && !window.opener.closed) {
                  window.opener.location.reload();
                }
                window.close();
              }}
              variant="secondary"
              className="h-14 text-sm px-3"
            >
              <ArrowLeft className="mr-1 h-4 w-4 flex-shrink-0" />
              <span className="truncate">Back to Dashboard</span>
            </Button>
          </div>

          {/* Strengths and Weaknesses */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <Card className="bg-green-50 border-green-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-green-800">
                  <TrendingUp className="h-5 w-5" />
                  Strengths
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feedback.strengths.map((strength, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 mt-2 flex-shrink-0"></div>
                      <span className="text-sm">{strength}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card className="bg-red-50 border-red-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-800">
                  <Target className="h-5 w-5" />
                  Areas for Improvement
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {feedback.weaknesses.map((weakness, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <div className="w-2 h-2 rounded-full bg-red-500 mt-2 flex-shrink-0"></div>
                      <span className="text-sm">{weakness}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>

          {/* Improvement Suggestions */}
          <Card className="bg-amber-50 border-amber-200">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-amber-800">
                <Lightbulb className="h-5 w-5" />
                Personalized Study Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {feedback.improvementSuggestions.map((suggestion, index) => (
                  <div key={index} className="p-4 bg-white rounded-lg border border-amber-200">
                    <h4 className="font-semibold text-amber-900 mb-2">{suggestion.area}</h4>
                    <p className="text-sm text-gray-700 mb-3">{suggestion.suggestion}</p>
                    <div className="flex flex-wrap gap-2">
                      {suggestion.resources.map((resource, resourceIndex) => (
                        <Badge key={resourceIndex} variant="outline" className="text-xs">
                          {resource}
                        </Badge>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Quiz Header */}
        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <CardTitle className="text-2xl font-headline">{quizData.title}</CardTitle>
                  {viewMode === 'quiz' && feedback && (
                    <Button
                      onClick={() => setViewMode('results')}
                      variant="outline"
                      size="sm"
                    >
                      <ArrowLeft className="mr-2 h-4 w-4" />
                      Back to Results
                    </Button>
                  )}
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant="secondary">{quizData.format.toUpperCase()}</Badge>
                  <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">AI Graded</Badge>
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
        {currentQuestion === 0 && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="p-4">
              <h3 className="font-semibold mb-2">Instructions</h3>
              <p className="text-sm text-muted-foreground">{quizData.instructions}</p>
              <div className="mt-3 p-3 bg-blue-100 rounded-lg">
                <p className="text-sm font-medium text-blue-800">
                  🤖 This quiz will be automatically graded by AI using official AP rubrics when you submit.
                </p>
              </div>
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
                  Question {currentQuestion + 1} of {quizData.questions.length}
                  {question.type === "leq" && " - Long Essay Question"}
                  {question.type === "laq" && " - Long Answer Question"}
                </CardTitle>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <span>Progress: {getAllAnsweredCount()}/{quizData.questions.length} questions answered</span>
                  {isQuestionAnswered(currentQuestion, question) && (
                    <Badge variant="default" className="bg-green-600 text-white text-xs">
                      ✓ Answered
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline">{question.unit}</Badge>
                  <Badge variant="outline">{question.difficulty}</Badge>
                  {question.skillCategory && (
                    <Badge variant="secondary">{question.skillCategory}</Badge>
                  )}
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
            {/* Stimulus Material */}
            {question.stimulus && (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <h4 className="font-semibold mb-2 text-gray-700">Stimulus Material</h4>
                <div className="text-sm leading-relaxed">
                  {renderLatex(question.stimulus)}
                </div>
              </div>
            )}

            {/* Question Content */}
            <div className="prose prose-sm max-w-none">
              <div className="text-base leading-relaxed">
                {renderLatex(question.question || question.prompt || '')}
              </div>
            </div>

            {/* LEQ Essay Response */}
            {question.type === "leq" && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor={`essay-${currentQuestion}`} className="text-sm font-medium">
                    Your Essay Response
                  </Label>
                  <Textarea
                    id={`essay-${currentQuestion}`}
                    placeholder="Write your essay response here... Be sure to include a clear thesis, supporting evidence, and analysis."
                    value={answers[currentQuestion] || ""}
                    onChange={(e) => setAnswers(prev => ({ ...prev, [currentQuestion]: e.target.value }))}
                    className="min-h-[300px] resize-none"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Time Limit: {question.timeLimit || 45} minutes</span>
                    <span>{(answers[currentQuestion] || "").length} characters</span>
                  </div>
                </div>
              </div>
            )}

            {/* LAQ Short Answer Response */}
            {question.type === "laq" && question.parts && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Your Short Answer Responses
                  </Label>
                  {question.parts.map((part, partIndex) => (
                    <div key={partIndex} className="space-y-2">
                      <Label htmlFor={`laq-${currentQuestion}-${part.letter}`} className="text-sm font-medium text-green-700">
                        Part {part.letter.toUpperCase()}: {part.question}
                      </Label>
                      <Textarea
                        id={`laq-${currentQuestion}-${part.letter}`}
                        placeholder={`Answer for part ${part.letter}... Be specific and concise.`}
                        value={answers[`${currentQuestion}-${part.letter}`] || ""}
                        onChange={(e) => setAnswers(prev => ({ ...prev, [`${currentQuestion}-${part.letter}`]: e.target.value }))}
                        className="min-h-[100px] resize-none"
                      />
                      <div className="text-xs text-muted-foreground">
                        {part.points} point{part.points !== 1 ? 's' : ''} • {(answers[`${currentQuestion}-${part.letter}`] || "").length} characters
                      </div>
                    </div>
                  ))}
                  <div className="text-xs text-muted-foreground mt-2">
                    Time Limit: {question.timeLimit || 15} minutes total
                  </div>
                </div>
              </div>
            )}

            {/* LEQ Rubric */}
            {question.type === "leq" && question.rubric && (
              <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <h4 className="font-semibold mb-3 text-blue-800">AP LEQ Scoring Rubric</h4>
                <div className="space-y-3 text-sm">
                  {question.rubric.thesis && (
                    <div className="p-3 bg-white rounded border">
                      <div className="flex justify-between items-start mb-1">
                        <strong className="text-blue-700">Thesis/Claim</strong>
                        <span className="text-xs bg-blue-100 px-2 py-1 rounded">{question.rubric.thesis.points} pt</span>
                      </div>
                      <div className="text-gray-700">{question.rubric.thesis.criteria}</div>
                    </div>
                  )}
                  {question.rubric.evidence && (
                    <div className="p-3 bg-white rounded border">
                      <div className="flex justify-between items-start mb-1">
                        <strong className="text-blue-700">Evidence</strong>
                        <span className="text-xs bg-blue-100 px-2 py-1 rounded">{question.rubric.evidence.points} pts</span>
                      </div>
                      <div className="text-gray-700">{question.rubric.evidence.criteria}</div>
                    </div>
                  )}
                  {question.rubric.analysis && (
                    <div className="p-3 bg-white rounded border">
                      <div className="flex justify-between items-start mb-1">
                        <strong className="text-blue-700">Analysis & Reasoning</strong>
                        <span className="text-xs bg-blue-100 px-2 py-1 rounded">{question.rubric.analysis.points} pts</span>
                      </div>
                      <div className="text-gray-700">{question.rubric.analysis.criteria}</div>
                    </div>
                  )}
                  {question.rubric.complexity && (
                    <div className="p-3 bg-white rounded border">
                      <div className="flex justify-between items-start mb-1">
                        <strong className="text-blue-700">Complexity</strong>
                        <span className="text-xs bg-blue-100 px-2 py-1 rounded">{question.rubric.complexity.points} pt</span>
                      </div>
                      <div className="text-gray-700">{question.rubric.complexity.criteria}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* LAQ Parts */}
            {question.type === "laq" && question.parts && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold mb-3 text-green-800">AP Short Answer Question Parts</h4>
                <div className="space-y-3">
                  {question.parts.map((part, index) => (
                    <div key={index} className="p-3 bg-white rounded border">
                      <div className="flex justify-between items-start mb-2">
                        <strong className="text-green-700">{part.letter})</strong>
                        <span className="text-xs bg-green-100 px-2 py-1 rounded">{part.points} pt</span>
                      </div>
                      <div className="text-gray-700 mb-2">{part.question}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Feedback for Current Question */}
            {feedback && feedback.questionFeedback && (
              <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="font-semibold mb-3 text-amber-800 flex items-center gap-2">
                  <Brain className="h-4 w-4" />
                  AI Feedback for This Question
                </h4>
                {(() => {
                  const questionFeedback = feedback.questionFeedback.find(f => f.questionIndex === currentQuestion);
                  console.log('Current question:', currentQuestion, 'Available feedback:', feedback.questionFeedback);
                  
                  if (questionFeedback) {
                    return (
                      <div className="space-y-3">
                        <div className="p-3 bg-white rounded border">
                          <div className="flex items-start justify-between mb-2">
                            <strong className="text-amber-700">Score Assessment</strong>
                            <Badge variant={questionFeedback.isCorrect ? "default" : "destructive"}>
                              {questionFeedback.correctAnswer || (questionFeedback.isCorrect ? "Full Points" : "Partial/No Points")}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-700">{questionFeedback.explanation}</p>
                        </div>
                        {questionFeedback.rubricFeedback && (
                          <div className="p-3 bg-blue-50 rounded border border-blue-200">
                            <strong className="text-blue-700 block mb-2">Rubric-Based Feedback</strong>
                            <p className="text-sm text-blue-800">{questionFeedback.rubricFeedback}</p>
                          </div>
                        )}
                      </div>
                    );
                  }
                  
                  // Fallback: show general feedback if specific question feedback is missing
                  if (feedback.questionFeedback && feedback.questionFeedback.length > 0) {
                    return (
                      <div className="space-y-3">
                        <div className="p-3 bg-yellow-50 rounded border border-yellow-200">
                          <strong className="text-yellow-700 block mb-2">General Feedback Available</strong>
                          <p className="text-sm text-yellow-800">
                            Specific feedback for this question is not available, but you can view your overall performance in the Results section.
                          </p>
                        </div>
                        <Button
                          onClick={() => setViewMode('results')}
                          variant="outline"
                          className="w-full"
                        >
                          View Overall Results & Feedback
                        </Button>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="p-3 bg-red-50 rounded border border-red-200">
                      <strong className="text-red-700 block mb-2">Feedback Processing Issue</strong>
                      <p className="text-sm text-red-800">
                        There was an issue generating feedback for this question. Please try resubmitting the quiz or contact support if the problem persists.
                      </p>
                    </div>
                  );
                })()}
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
            className="flex items-center gap-1 px-3 py-2 text-sm"
          >
            <ArrowLeft className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Previous</span>
          </Button>

          <div className="flex gap-2">
            {!isLastQuestion ? (
              <Button onClick={nextQuestion} className="flex items-center gap-1 px-3 py-2 text-sm">
                <span className="hidden sm:inline">Next</span>
                <span className="sm:hidden">Next</span>
                <ArrowRight className="h-4 w-4 flex-shrink-0" />
              </Button>
            ) : (
              feedback ? (
                <Button 
                  onClick={() => setViewMode('results')}
                  className="bg-green-600 hover:bg-green-700 px-3 py-2 text-sm"
                >
                  <Brain className="mr-2 h-4 w-4" />
                  <span className="truncate">View Results & Feedback</span>
                </Button>
              ) : (
                <Button 
                  onClick={submitQuiz} 
                  disabled={!isAllQuestionsAnswered()}
                  className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed px-3 py-2 text-sm"
                >
                  <Brain className="mr-2 h-4 w-4" />
                  <span className="truncate">
                    {isAllQuestionsAnswered() ? 'Submit for AI Grading' : `Answer All Questions (${getAllAnsweredCount()}/${quizData.questions.length})`}
                  </span>
                </Button>
              )
            )}
          </div>
        </div>

      </div>
    </div>
  );
}