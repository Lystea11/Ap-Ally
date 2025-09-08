// src/components/ProgressTracker.tsx

"use client";

import { useStudy } from "@/hooks/useStudy";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Target } from "lucide-react";

export function ProgressTracker() {
  const { progress, roadmap } = useStudy();

  const totalLessons = roadmap?.units.flatMap(unit => unit.lessons).length || 0;
  const completedLessons = roadmap?.units.flatMap(unit => unit.lessons).filter(l => l.completed).length || 0;

  return (
    <Card className="shadow-lg">
      <CardHeader>
        <div className="flex items-center gap-4">
          <Target className="h-8 w-8 text-primary" />
          <CardTitle className="font-headline text-2xl">Your Progress</CardTitle>
        </div>
        <CardDescription>
          You are on your way to mastering {roadmap?.title}!
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <div className="flex justify-between text-sm font-medium mb-1">
            <span>Overall Progress</span>
            <span className="font-bold text-primary">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} aria-label={`${Math.round(progress)}% complete`} />
        </div>
        <div className="text-center text-muted-foreground">
          <p>{completedLessons} of {totalLessons} lessons completed</p>
        </div>
      </CardContent>
    </Card>
  );
}