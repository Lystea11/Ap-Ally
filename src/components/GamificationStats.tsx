"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BoarAvatar } from "@/components/BoarAvatar";
import { Trophy, BookOpen, Flame, Target, Star, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

interface GamificationStatsProps {
  boarLevel: number;
  lessonsCompleted: number;
  currentStreak: number;
  longestStreak: number;
  practiceQuizzes: number;
  className?: string;
}

const LEVEL_NAMES = {
  1: "Apprentice Elephant",
  2: "Scholar Elephant", 
  3: "Master Elephant"
} as const;

const LEVEL_COLORS = {
  1: "from-slate-500 to-slate-600",
  2: "from-blue-500 to-blue-600",
  3: "from-amber-500 to-amber-600"
} as const;

const LEVEL_REQUIREMENTS = {
  1: { lessons: 0, quizzes: 0, streak: 0 },
  2: { lessons: 10, quizzes: 3, streak: 0 },
  3: { lessons: 25, quizzes: 7, streak: 7 }
} as const;

function calculateLevelProgress(
  currentLevel: number,
  lessonsCompleted: number,
  practiceQuizzes: number,
  currentStreak: number
) {
  if (currentLevel >= 3) {
    return {
      isMaxLevel: true,
      progressPercentage: 100,
      nextLevelRequirements: null,
      progressToNext: null
    };
  }

  const nextLevel = (currentLevel + 1) as 2 | 3;
  const requirements = LEVEL_REQUIREMENTS[nextLevel];
  
  // Calculate progress for each requirement type
  const lessonProgress = Math.min((lessonsCompleted / requirements.lessons) * 100, 100);
  const quizProgress = Math.min((practiceQuizzes / requirements.quizzes) * 100, 100);
  const streakProgress = requirements.streak > 0 
    ? Math.min((currentStreak / requirements.streak) * 100, 100) 
    : 0;

  // Use the highest progress (OR condition - any path can unlock next level)
  const overallProgress = Math.max(lessonProgress, quizProgress, streakProgress);

  return {
    isMaxLevel: false,
    progressPercentage: overallProgress,
    nextLevelRequirements: requirements,
    progressToNext: {
      lessons: {
        current: lessonsCompleted,
        needed: requirements.lessons,
        remaining: Math.max(0, requirements.lessons - lessonsCompleted),
        progress: lessonProgress
      },
      quizzes: {
        current: practiceQuizzes,
        needed: requirements.quizzes,
        remaining: Math.max(0, requirements.quizzes - practiceQuizzes),
        progress: quizProgress
      },
      streak: requirements.streak > 0 ? {
        current: currentStreak,
        needed: requirements.streak,
        remaining: Math.max(0, requirements.streak - currentStreak),
        progress: streakProgress
      } : null
    }
  };
}

export function GamificationStats({
  boarLevel,
  lessonsCompleted,
  currentStreak,
  longestStreak,
  practiceQuizzes,
  className
}: GamificationStatsProps) {
  const validLevel = Math.min(Math.max(boarLevel, 1), 3) as 1 | 2 | 3;
  const levelProgress = calculateLevelProgress(validLevel, lessonsCompleted, practiceQuizzes, currentStreak);

  return (
    <Card className={cn("bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20", className)}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3">
          <div className="relative">
            <BoarAvatar 
              boarLevel={validLevel} 
              size="lg" 
              showBadge={true}
            />
            <div className={cn(
              "absolute -inset-1 bg-gradient-to-r opacity-20 rounded-full blur",
              LEVEL_COLORS[validLevel]
            )} />
          </div>
          <div>
            <h3 className="font-headline text-xl">{LEVEL_NAMES[validLevel]}</h3>
            <Badge 
              className={cn(
                "mt-1 bg-gradient-to-r text-white font-semibold",
                LEVEL_COLORS[validLevel]
              )}
            >
              Level {validLevel}
            </Badge>
          </div>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Level Progress */}
        {!levelProgress.isMaxLevel && levelProgress.progressToNext && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium flex items-center gap-1">
                <TrendingUp className="h-4 w-4 text-primary" />
                Progress to Level {validLevel + 1}
              </span>
              <span className="text-sm text-muted-foreground">
                {Math.round(levelProgress.progressPercentage)}%
              </span>
            </div>
            <Progress 
              value={levelProgress.progressPercentage} 
              className="h-3 bg-muted"
            />
            
            {/* Requirements Breakdown */}
            <div className="grid gap-3 text-xs">
              <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <BookOpen className="h-3 w-3 text-blue-500" />
                  <span>Lessons</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {levelProgress.progressToNext.lessons.current}/{levelProgress.progressToNext.lessons.needed}
                  </div>
                  {levelProgress.progressToNext.lessons.remaining > 0 && (
                    <div className="text-muted-foreground">
                      {levelProgress.progressToNext.lessons.remaining} more needed
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                <div className="flex items-center gap-2">
                  <Trophy className="h-3 w-3 text-purple-500" />
                  <span>Quizzes</span>
                </div>
                <div className="text-right">
                  <div className="font-semibold">
                    {levelProgress.progressToNext.quizzes.current}/{levelProgress.progressToNext.quizzes.needed}
                  </div>
                  {levelProgress.progressToNext.quizzes.remaining > 0 && (
                    <div className="text-muted-foreground">
                      {levelProgress.progressToNext.quizzes.remaining} more needed
                    </div>
                  )}
                </div>
              </div>

              {levelProgress.progressToNext.streak && (
                <div className="flex items-center justify-between p-2 bg-muted/30 rounded-lg">
                  <div className="flex items-center gap-2">
                    <Flame className="h-3 w-3 text-orange-500" />
                    <span>Daily Streak</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {levelProgress.progressToNext.streak.current}/{levelProgress.progressToNext.streak.needed}
                    </div>
                    {levelProgress.progressToNext.streak.remaining > 0 && (
                      <div className="text-muted-foreground">
                        {levelProgress.progressToNext.streak.remaining} more days
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="text-xs text-center text-muted-foreground italic">
              Complete any one requirement above to level up!
            </div>
          </div>
        )}

        {/* Max Level Message */}
        {levelProgress.isMaxLevel && (
          <div className="text-center p-4 bg-gradient-to-r from-amber-50 to-yellow-50 rounded-lg border border-amber-200">
            <Star className="h-6 w-6 text-amber-500 mx-auto mb-2" />
            <p className="text-sm font-semibold text-amber-800 mb-1">
              Congratulations! You've reached the highest level!
            </p>
            <p className="text-xs text-amber-700">
              Keep learning to maintain your mastery status
            </p>
          </div>
        )}

        {/* Current Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50">
          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <BookOpen className="h-4 w-4 text-blue-500" />
              <span className="text-xs font-medium text-muted-foreground">Lessons</span>
            </div>
            <div className="text-2xl font-bold text-blue-600">{lessonsCompleted}</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Trophy className="h-4 w-4 text-purple-500" />
              <span className="text-xs font-medium text-muted-foreground">Quizzes</span>
            </div>
            <div className="text-2xl font-bold text-purple-600">{practiceQuizzes}</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Flame className="h-4 w-4 text-orange-500" />
              <span className="text-xs font-medium text-muted-foreground">Current Streak</span>
            </div>
            <div className="text-2xl font-bold text-orange-600">{currentStreak}</div>
          </div>

          <div className="text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Target className="h-4 w-4 text-green-500" />
              <span className="text-xs font-medium text-muted-foreground">Best Streak</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{longestStreak}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}