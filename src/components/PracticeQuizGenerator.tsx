"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { LoadingSpinner } from "@/components/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import { FileText, BookOpen, PenTool, Target, Play, CheckSquare } from "lucide-react";
import type { Roadmap } from "@/lib/types";

interface PracticeQuizGeneratorProps {
  roadmap: Roadmap;
  apCourse: string;
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
    label: "Long Answer (LAQ)", 
    description: "Detailed response questions",
    icon: PenTool 
  },
  { 
    value: "mixed", 
    label: "Mixed Format", 
    description: "Combination of question types",
    icon: Target 
  }
] as const;

const questionCounts = [5, 10, 15, 20, 25, 30];
const difficulties = ["easy", "medium", "hard", "mixed"] as const;

export function PracticeQuizGenerator({ roadmap, apCourse }: PracticeQuizGeneratorProps) {
  const [selectedFormat, setSelectedFormat] = useState<QuizFormat>("mcq");
  const [selectedUnits, setSelectedUnits] = useState<string[]>([]);
  const [questionCount, setQuestionCount] = useState(10);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard" | "mixed">("medium");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const handleUnitToggle = (unitTitle: string) => {
    setSelectedUnits(prev => 
      prev.includes(unitTitle) 
        ? prev.filter(u => u !== unitTitle)
        : [...prev, unitTitle]
    );
  };

  const selectAllUnits = () => {
    setSelectedUnits(roadmap.units.map(unit => unit.title));
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
      const response = await fetch('/api/practice-quiz/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          apCourse,
          ...quizRequest
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate quiz');
      }

      const quizData = await response.json();
      
      // Store quiz data and redirect to quiz page
      sessionStorage.setItem('practice-quiz', JSON.stringify(quizData));
      window.open('/practice-quiz', '_blank');
      
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

  const selectedFormatOption = formatOptions.find(option => option.value === selectedFormat);
  const SelectedIcon = selectedFormatOption?.icon || Target;

  return (
    <Card className="bg-card/60 backdrop-blur border-border/40">
      <CardHeader>
        <div className="flex items-center gap-2">
          <Target className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">AP Practice Quiz Generator</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
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

        {/* Selected Format Info */}
        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <div className="flex items-center gap-2 mb-1">
            <SelectedIcon className="h-4 w-4 text-primary" />
            <span className="font-medium text-primary">{selectedFormatOption?.label}</span>
          </div>
          <p className="text-xs text-muted-foreground">{selectedFormatOption?.description}</p>
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
            {roadmap.units.map((unit, index) => (
              <div key={unit.id} className="flex items-center space-x-2">
                <Checkbox
                  id={`unit-${index}`}
                  checked={selectedUnits.includes(unit.title)}
                  onCheckedChange={() => handleUnitToggle(unit.title)}
                />
                <label 
                  htmlFor={`unit-${index}`} 
                  className="text-sm cursor-pointer flex-1 flex items-center justify-between"
                >
                  <span>{unit.title}</span>
                  <Badge variant="outline" className="text-xs">
                    {unit.lessons.length} lessons
                  </Badge>
                </label>
              </div>
            ))}
          </div>
          
          {selectedUnits.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {selectedUnits.map((unit, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {unit}
                </Badge>
              ))}
            </div>
          )}
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
                {questionCounts.map((count) => (
                  <SelectItem key={count} value={count.toString()}>
                    {count} questions
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
          onClick={generateQuiz}
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

        {/* Quick Info */}
        <div className="text-xs text-muted-foreground text-center space-y-1">
          <p>✓ Questions follow official AP exam format and rubrics</p>
          <p>✓ Generated quiz will open in a new tab</p>
        </div>
      </CardContent>
    </Card>
  );
}