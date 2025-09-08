"use client";

import { useMemo, useEffect, useState, useContext } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertTriangle, BarChart3 } from "lucide-react";
import type { Roadmap, OnboardingQuizResult } from "@/lib/types";
import { AuthContext } from "@/context/AuthContext";

interface StrengthsWeaknessesProps {
  roadmap: Roadmap;
  classId: string;
}

interface QuizAnalysis {
  unit_title: string;
  correct_answers: number;
  total_answers: number;
  accuracy: number;
  status: "strong" | "developing" | "needs-focus";
}

interface UnitAnalysis {
  name: string;
  completed: number;
  total: number;
  percentage: number;
  mastery: number;
  status: "strong" | "developing" | "needs-focus";
}

export function StrengthsWeaknesses({ roadmap, classId }: StrengthsWeaknessesProps) {
  const authContext = useContext(AuthContext);
  const [quizResults, setQuizResults] = useState<OnboardingQuizResult[]>([]);
  const [quizAnalysis, setQuizAnalysis] = useState<QuizAnalysis[]>([]);
  
  if (!authContext) {
    throw new Error("StrengthsWeaknesses must be used within AuthProvider");
  }
  
  const { user } = authContext;

  // Fetch quiz results when component mounts
  useEffect(() => {
    const fetchQuizResults = async () => {
      if (!user?.uid || !classId) return;
      
      try {
        const response = await fetch(`/api/onboarding-quiz?userUid=${user.uid}&apClassId=${classId}`);
        if (response.ok) {
          const data = await response.json();
          setQuizResults(data.results || []);
        }
      } catch (error) {
        console.error('Failed to fetch quiz results:', error);
      }
    };

    fetchQuizResults();
  }, [user?.uid, classId]);

  // Analyze quiz results by unit
  useEffect(() => {
    if (quizResults.length === 0) return;

    const unitStats = quizResults.reduce((acc, result) => {
      const unit = result.unit_title;
      if (!acc[unit]) {
        acc[unit] = { correct: 0, total: 0 };
      }
      acc[unit].total += 1;
      if (result.is_correct) {
        acc[unit].correct += 1;
      }
      return acc;
    }, {} as Record<string, { correct: number; total: number }>);

    const analysis = Object.entries(unitStats).map(([unit_title, stats]) => {
      const accuracy = (stats.correct / stats.total) * 100;
      let status: "strong" | "developing" | "needs-focus";
      
      if (accuracy >= 75) {
        status = "strong";
      } else if (accuracy >= 50) {
        status = "developing";
      } else {
        status = "needs-focus";
      }

      return {
        unit_title,
        correct_answers: stats.correct,
        total_answers: stats.total,
        accuracy,
        status
      };
    });

    setQuizAnalysis(analysis);
  }, [quizResults]);

  const analysis = useMemo((): {
    units: UnitAnalysis[];
    strengths: UnitAnalysis[];
    weaknesses: UnitAnalysis[];
    overall: { completed: number; total: number; percentage: number };
  } => {
    const units: UnitAnalysis[] = roadmap.units.map(unit => {
      const completed = unit.lessons.filter(lesson => lesson.completed).length;
      const total = unit.lessons.length;
      const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
      const mastery = unit.lessons.filter(lesson => lesson.mastery).length;
      
      let status: "strong" | "developing" | "needs-focus";
      if (percentage >= 80 && mastery >= Math.ceil(total * 0.6)) {
        status = "strong";
      } else if (percentage >= 50) {
        status = "developing";
      } else {
        status = "needs-focus";
      }

      return {
        name: unit.title,
        completed,
        total,
        percentage,
        mastery,
        status
      };
    });

    const strengths = units.filter(unit => unit.status === "strong");
    const weaknesses = units.filter(unit => unit.status === "needs-focus");
    
    const totalCompleted = units.reduce((sum, unit) => sum + unit.completed, 0);
    const totalLessons = units.reduce((sum, unit) => sum + unit.total, 0);
    const overallPercentage = totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

    return {
      units,
      strengths,
      weaknesses,
      overall: {
        completed: totalCompleted,
        total: totalLessons,
        percentage: overallPercentage
      }
    };
  }, [roadmap]);


  return (
    <Card className="bg-card/60 backdrop-blur border-border/40">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-6 w-6 text-primary" />
          <CardTitle className="text-2xl font-headline">Your Progress Analysis</CardTitle>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Overall Progress</span>
            <span className="text-muted-foreground">
              {analysis.overall.completed}/{analysis.overall.total} lessons
            </span>
          </div>
          <Progress value={analysis.overall.percentage} className="h-2" />
          <p className="text-xs text-muted-foreground">
            {analysis.overall.percentage}% complete
          </p>
        </div>

        {/* Quiz-Based Analysis */}
        {quizAnalysis.length > 0 ? (
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Strengths Section */}
            {quizAnalysis.filter(unit => unit.status === "strong").length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <div>
                    <h4 className="font-semibold text-green-700">Strong Areas</h4>
                    <Badge variant="secondary" className="text-xs">Based on your diagnostic quiz</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  {quizAnalysis.filter(unit => unit.status === "strong").map((unit, index) => (
                    <div key={index} className="p-3 bg-green-50 rounded-lg border border-green-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <CheckCircle className="h-3 w-3 text-green-600" />
                          <div>
                            <span className="font-medium text-green-900 text-sm">{unit.unit_title}</span>
                            <span className="text-xs text-green-700 block">{Math.round(unit.accuracy)}% accuracy</span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                          {unit.correct_answers}/{unit.total_answers}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

                        {/* Developing Areas */}
            {quizAnalysis.filter(unit => unit.status === "developing").length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  <div>
                    <h4 className="font-semibold text-blue-700">Developing Areas</h4>
                    <Badge variant="secondary" className="text-xs">Based on your diagnostic quiz</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  {quizAnalysis.filter(unit => unit.status === "developing").map((unit, index) => (
                    <div key={index} className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <BarChart3 className="h-3 w-3 text-blue-600" />
                          <div>
                            <span className="font-medium text-blue-900 text-sm">{unit.unit_title}</span>
                            <span className="text-xs text-blue-700 block">{Math.round(unit.accuracy)}% accuracy</span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800 text-xs">
                          {unit.correct_answers}/{unit.total_answers}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Areas for Improvement */}
            {quizAnalysis.filter(unit => unit.status === "needs-focus").length > 0 && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600" />
                  <div>
                    <h4 className="font-semibold text-amber-700">Focus Areas</h4>
                    <Badge variant="secondary" className="text-xs">Based on your diagnostic quiz</Badge>
                  </div>
                </div>
                <div className="space-y-2">
                  {quizAnalysis.filter(unit => unit.status === "needs-focus").map((unit, index) => (
                    <div key={index} className="p-3 bg-amber-50 rounded-lg border border-amber-200">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-3 w-3 text-amber-600" />
                          <div>
                            <span className="font-medium text-amber-900 text-sm">{unit.unit_title}</span>
                            <span className="text-xs text-amber-700 block">{Math.round(unit.accuracy)}% accuracy</span>
                          </div>
                        </div>
                        <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">
                          {unit.correct_answers}/{unit.total_answers}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}


          </div>
        ) : (
          <div className="space-y-3 text-center p-4 bg-muted/30 rounded-lg">
            <div className="text-sm text-muted-foreground">
              Complete the diagnostic quiz during onboarding to see your personalized strengths and weaknesses analysis.
            </div>
          </div>
        )}


        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center p-3 bg-green-50/50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {quizAnalysis.length > 0 ? quizAnalysis.filter(u => u.status === "strong").length : analysis.strengths.length}
            </div>
            <div className="text-sm font-medium text-green-700">Strong Units</div>
          </div>
          <div className="text-center p-3 bg-blue-50/50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {quizAnalysis.length > 0 ? quizAnalysis.filter(u => u.status === "developing").length : analysis.units.filter(u => u.status === "developing").length}
            </div>
            <div className="text-sm font-medium text-blue-700">Developing</div>
          </div>
          <div className="text-center p-3 bg-amber-50/50 rounded-lg">
            <div className="text-2xl font-bold text-amber-600">
              {quizAnalysis.length > 0 ? quizAnalysis.filter(u => u.status === "needs-focus").length : analysis.weaknesses.length}
            </div>
            <div className="text-sm font-medium text-amber-700">Need Focus</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}