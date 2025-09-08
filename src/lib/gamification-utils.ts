// src/lib/gamification-utils.ts

export function getBoarLevelFromProgress(
  lessonsCompleted: number = 0,
  quizzesCompleted: number = 0,
  currentStreak: number = 0
): number {
  // Level 3: 25+ lessons OR 7+ quizzes OR 7+ day streak
  if (lessonsCompleted >= 25 || quizzesCompleted >= 7 || currentStreak >= 7) {
    return 3;
  }
  
  // Level 2: 10+ lessons OR 3+ quizzes
  if (lessonsCompleted >= 10 || quizzesCompleted >= 3) {
    return 2;
  }
  
  // Level 1: Default
  return 1;
}

export function getNextBoarLevelRequirements(currentLevel: number): string {
  switch (currentLevel) {
    case 1:
      return "Complete 10 lessons or pass 3 practice quizzes to evolve!";
    case 2:
      return "Complete 25 lessons or pass 7 quizzes or maintain a 7-day streak to reach Master level!";
    case 3:
      return "You've reached the highest level! Keep learning!";
    default:
      return "";
  }
}

export function calculateStreakFromDate(lastLessonDate?: string, currentStreak: number = 0): {
  newStreak: number;
  shouldIncrementStreak: boolean;
  streakBroken: boolean;
} {
  if (!lastLessonDate) {
    return {
      newStreak: 0,
      shouldIncrementStreak: false,
      streakBroken: currentStreak > 0
    };
  }

  const lastLesson = new Date(lastLessonDate);
  const now = new Date();
  const diffHours = (now.getTime() - lastLesson.getTime()) / (1000 * 60 * 60);

  // If it's been less than 12 hours since last lesson, don't increment (same day)
  if (diffHours < 12) {
    return {
      newStreak: currentStreak,
      shouldIncrementStreak: false,
      streakBroken: false
    };
  }

  // If it's been 12-36 hours, increment streak (next day)
  if (diffHours >= 12 && diffHours < 36) {
    return {
      newStreak: currentStreak + 1,
      shouldIncrementStreak: true,
      streakBroken: false
    };
  }

  // If it's been more than 36 hours, streak is broken
  return {
    newStreak: 1, // Start new streak
    shouldIncrementStreak: true,
    streakBroken: currentStreak > 0
  };
}