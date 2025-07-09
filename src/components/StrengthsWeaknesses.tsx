"use client";

import { useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { CheckCircle, AlertTriangle, TrendingUp, BarChart3 } from "lucide-react";
import type { Roadmap } from "@/lib/types";

interface StrengthsWeaknessesProps {
  roadmap: Roadmap;
}

interface UnitAnalysis {
  name: string;
  completed: number;
  total: number;
  percentage: number;
  mastery: number;
  status: "strong" | "developing" | "needs-focus";
}

export function StrengthsWeaknesses({ roadmap }: StrengthsWeaknessesProps) {
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

  const getStatusIcon = (status: UnitAnalysis["status"]) => {
    switch (status) {
      case "strong":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "developing":
        return <TrendingUp className="h-4 w-4 text-blue-600" />;
      case "needs-focus":
        return <AlertTriangle className="h-4 w-4 text-amber-600" />;
    }
  };

  const getStatusColor = (status: UnitAnalysis["status"]) => {
    switch (status) {
      case "strong":
        return "bg-green-100 text-green-800 border-green-200";
      case "developing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "needs-focus":
        return "bg-amber-100 text-amber-800 border-amber-200";
    }
  };

  return (
    <Card className="bg-card/60 backdrop-blur border-border/40">
      <CardHeader>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-primary" />
          <CardTitle className="text-lg">Your Progress Analysis</CardTitle>
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

        {/* Strengths Section */}
        {analysis.strengths.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-600" />
              <h4 className="font-medium text-green-700">Strong Areas</h4>
            </div>
            <div className="space-y-2">
              {analysis.strengths.map((unit, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="h-3 w-3 text-green-600" />
                    <span className="text-sm font-medium text-green-900">{unit.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-green-700">{unit.percentage}%</span>
                    <Badge variant="secondary" className="bg-green-100 text-green-800 text-xs">
                      {unit.mastery} mastered
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Areas for Improvement */}
        {analysis.weaknesses.length > 0 && (
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
              <h4 className="font-medium text-amber-700">Focus Areas</h4>
            </div>
            <div className="space-y-2">
              {analysis.weaknesses.map((unit, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-amber-50 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-3 w-3 text-amber-600" />
                    <span className="text-sm font-medium text-amber-900">{unit.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-amber-700">{unit.percentage}%</span>
                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 text-xs">
                      {unit.total - unit.completed} remaining
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Units Overview */}
        <div className="space-y-3">
          <h4 className="font-medium text-foreground">Unit Progress</h4>
          <div className="space-y-2">
            {analysis.units.map((unit, index) => (
              <div key={index} className="space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(unit.status)}
                    <span className="text-sm font-medium truncate">{unit.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {unit.completed}/{unit.total}
                    </span>
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getStatusColor(unit.status)}`}
                    >
                      {unit.status === "strong" ? "Strong" : 
                       unit.status === "developing" ? "Developing" : "Focus"}
                    </Badge>
                  </div>
                </div>
                <Progress value={unit.percentage} className="h-1" />
              </div>
            ))}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 pt-2 border-t">
          <div className="text-center">
            <div className="text-lg font-bold text-green-600">{analysis.strengths.length}</div>
            <div className="text-xs text-muted-foreground">Strong Units</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-blue-600">
              {analysis.units.filter(u => u.status === "developing").length}
            </div>
            <div className="text-xs text-muted-foreground">Developing</div>
          </div>
          <div className="text-center">
            <div className="text-lg font-bold text-amber-600">{analysis.weaknesses.length}</div>
            <div className="text-xs text-muted-foreground">Need Focus</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}