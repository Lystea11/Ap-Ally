"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import { useAdTrigger } from "@/context/AdContext";
import { FileText, BookOpen, PenTool, Target, Play, CheckSquare, Clock } from "lucide-react";
import type { Roadmap } from "@/lib/types";
import { generatePracticeQuizAPI, getQuizResultsAPI } from "@/lib/api-client";

interface PracticeQuizGeneratorProps {
  roadmap: Roadmap;
  apCourse: string;
  classId: string;
}

type QuizFormat = "mcq" | "leq" | "laq" | "mixed";

interface QuizRequest {
  format: QuizFormat;
  units: string[];
  questionCount: number;
  difficulty: "easy" | "medium" | "hard" | "mixed";
}

const formatOptions = [
  { 
    value: "mcq", 
    label: "Multiple Choice (MCQ)", 
    description: "AP-style multiple choice questions",
    icon: CheckSquare 
  },
  { 
    value: "leq", 
    label: "Long Essay (LEQ)", 
    description: "Extended essay questions with rubrics",
    icon: FileText 
  },
  { 
    value: "laq", 
    label: "Short Answer (SAQ)", 
    description: "Short Answer Questions",
    icon: PenTool 
  }
] as const;

const getQuestionCounts = (format: QuizFormat) => {
  switch (format) {
    case "mcq":
      return [5, 10, 20];
    case "leq":
      return [1];
    case "laq":
      return [1, 3];
    case "mixed":
      return [5, 10, 20];
    default:
      return [5, 10, 20];
  }
};
const difficulties = ["easy", "medium", "hard", "mixed"] as const;

export function PracticeQuizGenerator({ roadmap, apCourse, classId }: PracticeQuizGeneratorProps) {
  const [selectedFormat, setSelectedFormat] = useState<QuizFormat>("mcq");
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState(5);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | "mixed">("medium");
  const [isGenerating, setIsGenerating] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [generatedQuiz, setGeneratedQuiz] = useState<any>(null);
  const [showQuizReady, setShowQuizReady] = useState(false);
  const [quizResults, setQuizResults] = useState<any[]>([]);
  const { toast } = useToast();
  const { triggerPracticeQuizGeneratedAd } = useAdTrigger();

  // Load quiz results on component mount
  useEffect(() => {
    const loadQuizResults = async () => {
      try {
        const results = await getQuizResultsAPI(classId);
        setQuizResults(results.results);
      } catch (error) {
        console.error('Failed to load quiz results:', error);
      }
    };

    loadQuizResults();
  }, [classId]);

  // Update question count when format changes
  useEffect(() => {
    const validCounts = getQuestionCounts(selectedFormat);
    if (!validCounts.includes(questionCount)) {
      setQuestionCount(validCounts[0]);
    }
  }, [selectedFormat, questionCount]);

  const handleUnitToggle = (unitTitle: string) => {
    const cleanTitle = unitTitle.replace(/^Unit\s+\d+:?\s*/i, '').trim();
    setSelectedUnits(prev => 
      prev.includes(cleanTitle) 
        ? prev.filter(u => u !== cleanTitle)
        : [...prev, cleanTitle]
    );
  };

  const selectAllUnits = () => {
    setSelectedUnits(roadmap.units.map(unit => unit.title.replace(/^Unit\s+\d+:?\s*/i, '').trim()));
  };

  const clearAllUnits = () => {
    setSelectedUnits([]);
  };

  const generateQuiz = async () => {
    if (selectedUnits.length === 0) {
      toast({
        title: "No Units Selected",
        description: "Please select at least one unit for your practice quiz.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    
    const quizRequest: QuizRequest = {
      format: selectedFormat,
      units: selectedUnits,
      questionCount,
      difficulty
    };

    try {
      const quizData = await generatePracticeQuizAPI({
        apCourse,
        ...quizRequest
      });
      
      setGeneratedQuiz(quizData);
      setShowQuizReady(true);
      
      // Trigger ad after successful quiz generation
      triggerPracticeQuizGeneratedAd({
        quizTitle: quizData.title,
        quizFormat: selectedFormat,
        questionCount,
        difficulty,
        selectedUnits,
      });
      
      toast({
        title: "Quiz Generated!",
        description: `Your ${selectedFormat.toUpperCase()} practice quiz is ready.`,
      });
    } catch (error) {
      console.error('Failed to generate quiz:', error);
      toast({
        title: "Generation Failed",
        description: "Could not generate your practice quiz. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const startQuiz = () => {
    if (generatedQuiz) {
      // Store quiz data and AP course info, then redirect to appropriate quiz page
      sessionStorage.setItem('practice-quiz', JSON.stringify(generatedQuiz));
      sessionStorage.setItem('ap-course', apCourse);
      sessionStorage.setItem('class-id', classId);
      
      // Route to appropriate quiz page based on format
      if (generatedQuiz.format === 'leq' || generatedQuiz.format === 'laq') {
        window.open('/practice-quiz-free-response', '_blank');
      } else {
        window.open('/practice-quiz', '_blank');
      }
    }
  };


  return (
    <Card className="bg-card/60 backdrop-blur border-border/40">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">AP Practice Quiz Generator</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full" size="lg">
              <Play className="mr-2 h-4 w-4" />
              Create Practice Quiz
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Generate AP Practice Quiz</DialogTitle>
            </DialogHeader>
            
            <div className="space-y-6 py-4">
              {/* Quiz Format Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Quiz Format</label>
                <Select value={selectedFormat} onValueChange={(value: QuizFormat) => setSelectedFormat(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select quiz format" />
                  </SelectTrigger>
                  <SelectContent>
                    {formatOptions.map((option) => {
                      const Icon = option.icon;
                      return (
                        <SelectItem key={option.value} value={option.value}>
                          <div className="flex items-center gap-2">
                            <Icon className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{option.label}</div>
                              <div className="text-xs text-muted-foreground">{option.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              {/* Unit Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-medium">Select Units</label>
                  <div className="flex gap-2">
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={selectAllUnits}
                      className="text-xs h-7"
                    >
                      All
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={clearAllUnits}
                      className="text-xs h-7"
                    >
                      Clear
                    </Button>
                  </div>
                </div>
                
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {roadmap.units.map((unit, index) => {
                    const cleanTitle = unit.title.replace(/^Unit\s+\d+:?\s*/i, '').trim();
                    return (
                      <div key={unit.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`unit-${index}`}
                          checked={selectedUnits.includes(cleanTitle)}
                          onCheckedChange={() => handleUnitToggle(unit.title)}
                        />
                        <label 
                          htmlFor={`unit-${index}`} 
                          className="text-sm cursor-pointer flex-1 flex items-center justify-between"
                        >
                          <span>Unit {index + 1}: {cleanTitle}</span>
                          <Badge variant="outline" className="text-xs">
                            {unit.lessons.length} lessons
                          </Badge>
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Quiz Configuration */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Questions</label>
                  <Select value={questionCount.toString()} onValueChange={(value) => setQuestionCount(parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {getQuestionCounts(selectedFormat).map((count) => (
                        <SelectItem key={count} value={count.toString()}>
                          {count} {count === 1 ? 'question' : 'questions'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Difficulty</label>
                  <Select value={difficulty} onValueChange={(value: typeof difficulty) => setDifficulty(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {difficulties.map((diff) => (
                        <SelectItem key={diff} value={diff}>
                          {diff.charAt(0).toUpperCase() + diff.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Generate Button */}
              <Button 
                onClick={() => {
                  generateQuiz();
                  if (!isGenerating) {
                    setDialogOpen(false);
                  }
                }}
                disabled={isGenerating || selectedUnits.length === 0}
                className="w-full"
                size="lg"
              >
                {isGenerating ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    Generating Quiz...
                  </>
                ) : (
                  <>
                    <Play className="mr-2 h-4 w-4" />
                    Generate AP Practice Quiz
                  </>
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
      
      {/* Previous Quiz Results */}
      {quizResults.length > 0 && (
        <CardContent className="pt-0">
          <div className="border-t border-border/40 mt-6 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Target className="h-5 w-5 text-primary" />
              <h3 className="font-semibold">Recent Practice Tests</h3>
            </div>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {quizResults.slice(0, 5).map((result) => (
                <div key={result.id} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{result.quiz_title}</span>
                      <Badge variant="outline" className="text-xs">
                        {result.quiz_format.toUpperCase()}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{result.questions_answered}/{result.total_questions} questions</span>
                      {result.time_spent && <span>{result.time_spent}m</span>}
                      <span>{new Date(result.created_at).toLocaleDateString()}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {result.units.slice(0, 3).map((unit: string, unitIndex: number) => (
                        <Badge key={unitIndex} variant="secondary" className="text-xs">
                          {unit}
                        </Badge>
                      ))}
                      {result.units.length > 3 && (
                        <Badge variant="secondary" className="text-xs">
                          +{result.units.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-right ml-4">
                    <div className={`text-2xl font-bold ${
                      result.overall_score >= 90 ? 'text-green-600' :
                      result.overall_score >= 70 ? 'text-blue-600' :
                      result.overall_score >= 50 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {Math.round(result.overall_score)}%
                    </div>
                    <div className="text-xs text-muted-foreground">Score</div>
                  </div>
                </div>
              ))}
            </div>
            
            {quizResults.length > 5 && (
              <div className="text-center mt-3">
                <span className="text-xs text-muted-foreground">
                  +{quizResults.length - 5} more practice tests
                </span>
              </div>
            )}
          </div>
        </CardContent>
      )}
      
      {/* Quiz Generation Status */}
      {(isGenerating || showQuizReady) && (
        <CardContent className="pt-0">
          <div className="border-t border-border/40 mt-6 pt-6">
            {isGenerating && (
              <div className="text-center py-8">
                <div className="flex flex-col items-center gap-4">
                  <LoadingSpinner className="h-8 w-8 text-primary" />
                  <div className="space-y-2">
                    <h3 className="font-semibold text-lg">Generating Your AP Practice Quiz</h3>
                    <p className="text-muted-foreground text-sm">
                      Creating {questionCount} {selectedFormat.toUpperCase()} questions covering {selectedUnits.length} unit{selectedUnits.length !== 1 ? 's' : ''}...
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center mt-3">
                      {selectedUnits.map((unit, index) => (
                        <Badge key={index} variant="outline" className="text-xs">
                          {unit}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            
            {showQuizReady && generatedQuiz && (
              <div className="space-y-4">
                <div className="text-center py-6">
                  <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                      <CheckSquare className="h-6 w-6 text-green-600" />
                    </div>
                    <div className="space-y-2">
                      <h3 className="font-semibold text-lg text-green-800">Quiz Ready!</h3>
                      <p className="text-muted-foreground text-sm">
                        Your {selectedFormat.toUpperCase()} practice quiz has been generated successfully.
                      </p>
                    </div>
                  </div>
                </div>
                
                {/* Quiz Details */}
                <div className="bg-muted/30 rounded-lg p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Quiz Details</span>
                    <Badge variant="secondary">{generatedQuiz.format?.toUpperCase() || selectedFormat.toUpperCase()}</Badge>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span>{generatedQuiz.totalQuestions || questionCount} Questions</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>{generatedQuiz.estimatedTime || '~45'} Minutes</span>
                    </div>
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedUnits.map((unit, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {unit}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                  {/* Action Buttons */}
                  <div className="flex justify-center pt-2 w-full">
                    <Button 
                      onClick={startQuiz}
                      className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
                      size="lg"
                    >
                      <Play className="mr-2 h-4 w-4" />
                      Start Practice Quiz
                    </Button>
                  </div>
              </div>
            )}
          </div>
        </CardContent>
      )}
    </Card>
  );
}