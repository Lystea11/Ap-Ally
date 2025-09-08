"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { Clock, FileText, CheckSquare, PenTool, Target, ArrowRight, ArrowLeft, Brain, TrendingUp, BookOpen, Lightbulb, RotateCcw } from "lucide-react";
import { generateQuizFeedbackAPI, saveQuizResultAPI, updateQuizResultAPI } from "@/lib/api-client";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useAdTrigger } from "@/context/AdContext";
import { useGamification } from "@/hooks/useGamification";
import 'katex/dist/katex.min.css';
import { InlineMath, BlockMath } from 'react-katex';

interface QuizQuestion {
  type: "mcq" | "leq" | "laq";
  question?: string;
  prompt?: string;
  options?: string[];
  correctAnswer?: string;
  explanation?: string;
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

type ViewMode = 'quiz' | 'results' | 'review';

export default function PracticeQuizPage() {
  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showAnswers, setShowAnswers] = useState(false);
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
      // Only allow MCQ and mixed formats, redirect pure free response to other page
      if (quiz.format === 'leq' || quiz.format === 'laq') {
        window.location.href = '/practice-quiz-free-response';
      } else {
        setQuizData(quiz);
      }
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

  const isQuestionAnswered = (questionIndex: number, question: QuizQuestion) => {
    if (question.type === 'mcq') {
      return !!answers[questionIndex];
    }
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

  const finishQuiz = async () => {
    setShowAnswers(true);
    setViewMode('results');
    
    // Save quiz results
    if (quizData) {
      try {
        const classId = sessionStorage.getItem('class-id');
        const apCourse = sessionStorage.getItem('ap-course') || 'AP Course';
        
        if (classId) {
          const timeSpent = Math.round((Date.now() - quizStartTime) / 60000); // Convert to minutes
          const questionsAnswered = getAllAnsweredCount();
          const totalQuestions = quizData.questions.length;
          
          // Calculate score based on MCQ questions only
          let correctAnswers = 0;
          let mcqQuestions = 0;
          quizData.questions.forEach((question, index) => {
            if (question.type === 'mcq') {
              mcqQuestions++;
              if (answers[index] === question.correctAnswer) {
                correctAnswers++;
              }
            }
          });
          
          // For MCQ-only or mixed quizzes, calculate score based on MCQ questions
          const overallScore = mcqQuestions > 0 ? Math.round((correctAnswers / mcqQuestions) * 100) : 0;
          
          // Get unique units from answered questions
          const selectedUnits = Array.from(new Set(
            quizData.questions
              .filter((_, index) => isQuestionAnswered(index, quizData.questions[index]))
              .map(question => question.unit || 'General')
          ));
          
          await saveQuizResultAPI({
            classId,
            quizTitle: quizData.title,
            quizFormat: quizData.format,
            overallScore,
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
              quizPassed: overallScore >= 50, // Consider 50%+ as passing for practice quiz
            });
          } catch (error) {
            console.error('Failed to update gamification progress:', error);
          }
          
          // Trigger ad after successful quiz completion
          triggerQuizCompletionAd({
            quizTitle: quizData.title,
            quizFormat: quizData.format,
            overallScore,
            questionsAnswered,
            totalQuestions,
          });
        }
      } catch (error) {
        console.error('Failed to save quiz results:', error);
      }
    }
  };

  const generateFeedback = async () => {
    if (!quizData) return;
    
    setIsGeneratingFeedback(true);
    try {
      const apCourse = sessionStorage.getItem('ap-course') || 'AP History';
      const feedbackData = await generateQuizFeedbackAPI({
        apCourse,
        quizData,
        answers: Object.fromEntries(Object.entries(answers).map(([key, value]) => [key, value]))
      });
      
      setFeedback(feedbackData);
      
      // For mixed quizzes with free response questions, update the database score
      const hasEssayQuestions = quizData.questions.some(q => q.type === 'leq' || q.type === 'laq');
      if (hasEssayQuestions && feedbackData.overallScore !== undefined) {
        try {
          const classId = sessionStorage.getItem('class-id');
          if (classId) {
            await updateQuizResultAPI({
              classId,
              quizTitle: quizData.title,
              newScore: feedbackData.overallScore,
            });
          }
        } catch (updateError) {
          console.error('Failed to update quiz score in database:', updateError);
        }
      }
    } catch (error) {
      console.error('Failed to generate feedback:', error);
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  const goToReview = () => {
    setViewMode('review');
    setShowAnswers(true);
    setCurrentQuestion(0);
  };

  const backToResults = () => {
    setViewMode('results');
  };

  // Function to render LaTeX content
  const renderLatex = (text: string) => {
    if (!text) return '';
    
    // Split text by LaTeX delimiters and render accordingly
    const parts = text.split(/(\$\$.*?\$\$|\$.*?\$|\\\\.*?\\\\|\\\(.*?\\\)|\\\[.*?\\\])/);
    
    return parts.map((part, index) => {
      // Block math: $$...$$ or \[...\]
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const math = part.slice(2, -2);
        return <BlockMath key={index} math={math} />;
      }
      if (part.startsWith('\\[') && part.endsWith('\\]')) {
        const math = part.slice(2, -2);
        return <BlockMath key={index} math={math} />;
      }
      
      // Inline math: $...$ or \(...\)
      if (part.startsWith('$') && part.endsWith('$') && part.length > 2) {
        const math = part.slice(1, -1);
        return <InlineMath key={index} math={math} />;
      }
      if (part.startsWith('\\(') && part.endsWith('\\)')) {
        const math = part.slice(2, -2);
        return <InlineMath key={index} math={math} />;
      }
      
      // Regular text
      return <span key={index}>{part}</span>;
    });
  };

  const getQuestionIcon = (type: string) => {
    switch (type) {
      case "mcq": return <CheckSquare className="h-5 w-5" />;
      case "leq": return <FileText className="h-5 w-5" />;
      case "laq": return <PenTool className="h-5 w-5" />;
      default: return <Target className="h-5 w-5" />;
    }
  };

  // Performance Results Screen
  if (viewMode === 'results') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-primary/5">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          {/* Results Header */}
          <Card className="mb-6">
            <CardHeader>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <Brain className="h-6 w-6 text-blue-600" />
                  <CardTitle className="text-2xl font-headline">Quiz Complete!</CardTitle>
                </div>
                <p className="text-muted-foreground">
                  {quizData?.title} - Performance Analysis
                </p>
                {(() => {
                  const hasEssayQuestions = quizData?.questions.some(q => q.type === 'leq' || q.type === 'laq');
                  if (!hasEssayQuestions) {
                    return (
                      <div className="mt-3 p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <p className="text-sm text-blue-800">
                          📊 Your score has been calculated based on correct MCQ answers. Click "Review Questions & Answers" to see detailed explanations.
                        </p>
                      </div>
                    );
                  }
                  return null;
                })()}
              </div>
            </CardHeader>
          </Card>

          {/* Quick Stats */}
          <Card className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-blue-600 mb-2">
                    {(() => {
                      if (!quizData?.questions) return '0';
                      let correctAnswers = 0;
                      let mcqQuestions = 0;
                      quizData.questions.forEach((question, index) => {
                        if (question.type === 'mcq') {
                          mcqQuestions++;
                          if (answers[index] === question.correctAnswer) {
                            correctAnswers++;
                          }
                        }
                      });
                      return mcqQuestions > 0 ? Math.round((correctAnswers / mcqQuestions) * 100) : 0;
                    })()}%
                  </div>
                  <div className="text-sm text-muted-foreground">Overall Score</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-green-600 mb-2">
                    {(() => {
                      if (!quizData?.questions) return '0';
                      let correctAnswers = 0;
                      quizData.questions.forEach((question, index) => {
                        if (question.type === 'mcq' && answers[index] === question.correctAnswer) {
                          correctAnswers++;
                        }
                      });
                      return correctAnswers;
                    })()}
                  </div>
                  <div className="text-sm text-muted-foreground">Correct Answers</div>
                </div>
                <div className="text-center">
                  <div className="text-4xl font-bold text-gray-600 mb-2">
                    {quizData?.questions.length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Questions</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {(() => {
            // Only show AI feedback for mixed quizzes with free response questions
            const hasEssayQuestions = quizData?.questions.some(q => q.type === 'leq' || q.type === 'laq');
            
            if (hasEssayQuestions) {
              return (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-6">
                  <Button
                    onClick={generateFeedback}
                    disabled={isGeneratingFeedback}
                    className="bg-blue-600 hover:bg-blue-700 h-14 text-sm px-3"
                  >
                    {isGeneratingFeedback ? (
                      <>
                        <LoadingSpinner className="mr-1 h-4 w-4 flex-shrink-0" />
                        <span className="truncate">Generating AI Analysis...</span>
                      </>
                    ) : (
                      <>
                        <Brain className="mr-1 h-4 w-4 flex-shrink-0" />
                        <span className="truncate">Get AI Performance Analysis</span>
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={goToReview}
                    variant="outline"
                    className="h-14 text-sm px-3"
                  >
                    <RotateCcw className="mr-1 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Review Questions & Answers</span>
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
              );
            } else {
              // For pure MCQ quizzes, no AI feedback needed
              return (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                  <Button
                    onClick={goToReview}
                    className="bg-blue-600 hover:bg-blue-700 h-14 text-sm px-3"
                  >
                    <RotateCcw className="mr-1 h-4 w-4 flex-shrink-0" />
                    <span className="truncate">Review Questions & Answers</span>
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
              );
            }
          })()}

          {/* AI Feedback Results */}
          {feedback && (
            <div className="space-y-6">
              <Separator />
              
              {/* Score Overview */}
              <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-blue-600" />
                    Overall Performance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">
                        {feedback.overallScore}%
                      </div>
                      <div className="text-sm text-muted-foreground">Overall Score</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">
                        {feedback.correctAnswers}
                      </div>
                      <div className="text-sm text-muted-foreground">Correct Answers</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-gray-600">
                        {feedback.totalQuestions}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Questions</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Strengths and Weaknesses */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
          )}
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
                  {viewMode === 'review' && (
                    <Button
                      onClick={backToResults}
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
                  {viewMode === 'review' && <Badge variant="outline">Review Mode</Badge>}
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
                  Question {currentQuestion + 1} of {quizData.questions.length}
                  {question.type === "leq" && " - Long Essay Question"}
                  {question.type === "laq" && " - Long Answer Question"}
                  {question.type === "mcq" && " - Multiple Choice"}
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
                        <span className="inline-flex items-center">{renderLatex(option)}</span>
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </div>
            )}

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
                    disabled={showAnswers}
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
                        disabled={showAnswers}
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
                      {showAnswers && (
                        <div className="text-sm bg-green-50 p-2 rounded border-l-4 border-green-400">
                          <strong>Sample Response:</strong> {part.sampleResponse}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* LAQ Requirements (fallback for old format) */}
            {question.type === "laq" && question.requirements && !question.parts && (
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
                <div className="text-sm"><strong>Answer:</strong> <span className="inline-flex items-center">{renderLatex(question.correctAnswer || '')}</span></div>
                {question.explanation && (
                  <div className="text-sm mt-2"><strong>Explanation:</strong> <span className="inline-flex items-center">{renderLatex(question.explanation)}</span></div>
                )}
                {/* Show user's answer if incorrect */}
                {answers[currentQuestion] && answers[currentQuestion] !== question.correctAnswer && (
                  <div className="text-sm mt-2 text-red-700">
                    <strong>Your Answer:</strong> <span className="inline-flex items-center">{renderLatex(answers[currentQuestion])}</span>
                  </div>
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
            className="flex items-center gap-1 px-3 py-2 text-sm"
          >
            <ArrowLeft className="h-4 w-4 flex-shrink-0" />
            <span className="hidden sm:inline">Previous</span>
          </Button>

          <div className="flex gap-2">
            {viewMode === 'quiz' && !showAnswers ? (
              <>
                {!isLastQuestion ? (
                  <Button onClick={nextQuestion} className="flex items-center gap-1 px-3 py-2 text-sm">
                    <span className="hidden sm:inline">Next</span>
                    <span className="sm:hidden">Next</span>
                    <ArrowRight className="h-4 w-4 flex-shrink-0" />
                  </Button>
                ) : (
                  <Button 
                    onClick={finishQuiz} 
                    disabled={!isAllQuestionsAnswered()}
                    className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed px-3 py-2 text-sm"
                  >
                    <span className="truncate">
                      {isAllQuestionsAnswered() ? 'Finish Quiz' : `Answer All Questions (${getAllAnsweredCount()}/${quizData.questions.length})`}
                    </span>
                  </Button>
                )}
              </>
            ) : (
              <div className="flex gap-2">
                {!isLastQuestion ? (
                  <Button onClick={nextQuestion} className="flex items-center gap-1 px-3 py-2 text-sm">
                    <span className="hidden sm:inline">Next Question</span>
                    <span className="sm:hidden">Next</span>
                    <ArrowRight className="h-4 w-4 flex-shrink-0" />
                  </Button>
                ) : (
                  <Button
                    onClick={backToResults}
                    variant="outline"
                    className="flex items-center gap-1 px-3 py-2 text-sm"
                  >
                    <ArrowLeft className="h-4 w-4 flex-shrink-0" />
                    <span className="hidden sm:inline">Back to Results</span>
                    <span className="sm:hidden">Back</span>
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}