"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Flame, Sparkles, Trophy, Target } from "lucide-react";
import { cn } from "@/lib/utils";

interface StreakWidgetProps {
  currentStreak: number;
  longestStreak: number;
  lastLessonDate?: string;
  className?: string;
}

const STREAK_MILESTONES = [3, 7, 14, 30];

function getStreakLevel(streak: number): string {
  if (streak === 0) return "Beginner";
  if (streak < 3) return "Getting Started";
  if (streak < 7) return "Building Momentum";
  if (streak < 14) return "Consistent Learner";
  if (streak < 30) return "Advanced Learner";
  return "Master Student";
}

function getStreakMessage(streak: number): string {
  if (streak === 0) return "Start your learning journey!";
  if (streak === 1) return "Great start! Keep it up!";
  if (streak < 3) return "Building momentum!";
  if (streak === 3) return "3-day streak! You're on fire!";
  if (streak < 7) return "Consistency is key!";
  if (streak === 7) return "Week-long streak! Amazing!";
  if (streak < 14) return "You're unstoppable!";
  if (streak === 14) return "Two weeks strong! Incredible!";
  if (streak < 30) return "Learning legend in the making!";
  if (streak === 30) return "30-day master! You're incredible!";
  return `${streak} days of excellence!`;
}

function getNextMilestone(streak: number): number | null {
  return STREAK_MILESTONES.find(milestone => milestone > streak) || null;
}

function isStreakActive(lastLessonDate?: string): boolean {
  if (!lastLessonDate) return false;
  
  const lastLesson = new Date(lastLessonDate);
  const now = new Date();
  const diffHours = (now.getTime() - lastLesson.getTime()) / (1000 * 60 * 60);
  
  return diffHours < 36; // Allow 36 hours for timezone flexibility
}

export function StreakWidget({ 
  currentStreak, 
  longestStreak, 
  lastLessonDate, 
  className 
}: StreakWidgetProps) {
  const streakActive = isStreakActive(lastLessonDate);

  return (
    <Card className={cn("transition-all duration-200 hover:shadow-md", className)}>
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <Flame className={cn(
            "h-5 w-5 transition-colors duration-200",
            streakActive ? "text-orange-500" : "text-gray-400"
          )} />
          <span className="text-sm font-medium text-muted-foreground">Streak</span>
        </div>
        <div className="text-right">
          <div className={cn(
            "text-lg font-semibold transition-colors duration-200",
            streakActive ? "text-orange-600" : "text-gray-500"
          )}>
            {currentStreak}
          </div>
          {longestStreak > 0 && longestStreak !== currentStreak && (
            <div className="text-xs text-muted-foreground">
              Best: {longestStreak}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Re-export from utils for convenience
export { calculateStreakFromDate } from '@/lib/gamification-utils';