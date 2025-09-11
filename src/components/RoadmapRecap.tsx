"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CheckCircle, AlertTriangle, Target, BookOpen, TrendingUp, Users } from "lucide-react";
import type { Roadmap } from "@/lib/types";

interface RoadmapRecapProps {
  roadmap: Roadmap;
  quizResults: string;
  onStartJourney: () => void;
  isAuthenticated?: boolean;
}

interface AnalysisResult {
  strengths: string[];
  weaknesses: string[];
  priorityUnits: string[];
  recommendedStartingPoint: string;
  totalLessons: number;
  estimatedWeeks: number;
}

export function RoadmapRecap({ roadmap, quizResults, onStartJourney, isAuthenticated = true }: RoadmapRecapProps) {
  const analysis = useMemo((): AnalysisResult => {
    // Parse quiz results to identify patterns
    const questions = quizResults.split("\n\n");
    const totalQuestions = questions.length;
    
    // Extract units and performance (simplified analysis)
    const unitPerformance: Record<string, { correct: number; total: number }> = {};
    const skillPerformance: Record<string, { correct: number; total: number }> = {};
    
    questions.forEach(questionBlock => {
      const lines = questionBlock.split("\n");
      const unitMatch = lines.find(line => line.startsWith("Unit:"));
      const skillMatch = lines.find(line => line.startsWith("Skill:"));
      const answerMatch = lines.find(line => line.startsWith("Answer:"));
      
      if (unitMatch && skillMatch && answerMatch) {
        const unit = unitMatch.replace("Unit:", "").trim();
        const skill = skillMatch.replace("Skill:", "").trim();
        
        // Initialize tracking
        if (!unitPerformance[unit]) {
          unitPerformance[unit] = { correct: 0, total: 0 };
        }
        if (!skillPerformance[skill]) {
          skillPerformance[skill] = { correct: 0, total: 0 };
        }
        
        unitPerformance[unit].total++;
        skillPerformance[skill].total++;
        
        // Simple heuristic: assume longer, more detailed answers indicate better understanding
        const answer = answerMatch.replace("Answer:", "").trim();
        if (answer.length > 10) { // Basic performance indicator
          unitPerformance[unit].correct++;
          skillPerformance[skill].correct++;
        }
      }
    });
    
    // Identify strengths and weaknesses
    const strengths: string[] = [];
    const weaknesses: string[] = [];
    const priorityUnits: string[] = [];
    
    Object.entries(unitPerformance).forEach(([unit, performance]) => {
      const percentage = performance.total > 0 ? (performance.correct / performance.total) * 100 : 0;
      if (percentage >= 70) {
        strengths.push(unit);
      } else if (percentage <= 40) {
        weaknesses.push(unit);
        priorityUnits.push(unit);
      }
    });
    
    // Find recommended starting point
    const firstWeakUnit = roadmap.units.find(unit => 
      weaknesses.some(weakness => unit.title.toLowerCase().includes(weakness.toLowerCase()))
    );
    
    const recommendedStartingPoint = firstWeakUnit 
      ? firstWeakUnit.title 
      : roadmap.units[0]?.title || "Begin with the first unit";
    
    // Calculate metrics
    const totalLessons = roadmap.units.reduce((sum, unit) => sum + unit.lessons.length, 0);
    const estimatedWeeks = Math.ceil(totalLessons / 3); // Assume 3 lessons per week
    
    return {
      strengths: strengths.length > 0 ? strengths : ["Problem-solving approach", "Basic concepts"],
      weaknesses: weaknesses.length > 0 ? weaknesses : ["Advanced applications", "Complex analysis"],
      priorityUnits: priorityUnits.length > 0 ? priorityUnits : [roadmap.units[0]?.title || "First unit"],
      recommendedStartingPoint,
      totalLessons,
      estimatedWeeks
    };
  }, [roadmap, quizResults]);

  return (
    <div className="space-y-6">
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-blue-500/5">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Target className="h-6 w-6 text-primary" />
            <CardTitle className="text-2xl font-headline">Your Personalized Study Plan</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Overview Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3 p-4 bg-background/60 rounded-lg border">
              <BookOpen className="h-8 w-8 text-primary" />
              <div>
                <p className="text-2xl font-bold">{analysis.totalLessons}</p>
                <p className="text-sm text-muted-foreground">Total Lessons</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-background/60 rounded-lg border">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">{analysis.estimatedWeeks}</p>
                <p className="text-sm text-muted-foreground">Estimated Weeks</p>
              </div>
            </div>
            <div className="flex items-center gap-3 p-4 bg-background/60 rounded-lg border">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{roadmap.units.length}</p>
                <p className="text-sm text-muted-foreground">Study Units</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Strengths Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-600" />
              <h3 className="text-lg font-semibold text-green-700">Your Strengths</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.strengths.map((strength, index) => (
                <Badge key={index} variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                  {strength}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              These areas show your existing knowledge. We'll include lighter review sessions for these topics.
            </p>
          </div>

          <Separator />

          {/* Areas for Improvement */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
              <h3 className="text-lg font-semibold text-amber-700">Priority Focus Areas</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              {analysis.priorityUnits.map((unit, index) => (
                <Badge key={index} variant="destructive" className="bg-amber-100 text-amber-800 border-amber-200">
                  {unit}
                </Badge>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              These units need extra attention. Your roadmap includes additional practice and detailed explanations for these topics.
            </p>
          </div>

          <Separator />

          {/* Recommended Starting Point */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Recommended Starting Point</h3>
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-2">
                <Target className="h-5 w-5 text-blue-600" />
                <span className="font-medium text-blue-900">{analysis.recommendedStartingPoint}</span>
              </div>
              <p className="text-sm text-blue-700 mt-2">
                Based on your diagnostic results, this is the optimal starting point for your study journey.
              </p>
            </div>
          </div>

          {/* Study Plan Summary */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Your Personalized Approach</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-medium text-green-900 mb-2">Strength Areas</h4>
                <p className="text-sm text-green-700">
                  Quick review sessions and practice problems to maintain your knowledge
                </p>
              </div>
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <h4 className="font-medium text-amber-900 mb-2">Focus Areas</h4>
                <p className="text-sm text-amber-700">
                  In-depth lessons, extra practice, and step-by-step explanations
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Action Button */}
      <div className="flex justify-center">
        <Button 
          onClick={onStartJourney} 
          size="lg" 
          className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white font-medium px-8 py-3"
        >
          Start Your Study Journey
        </Button>
      </div>
    </div>
  );
}