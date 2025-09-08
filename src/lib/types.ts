// src/lib/types.ts

export interface User {
  id: string;
  name: string;
  email: string;
  boar_level?: number;
  lessons_completed_count?: number;
  current_streak?: number;
  longest_streak?: number;
  last_lesson_date?: string;
  practice_quizzes_completed?: number;
}

export interface APClass {
    id: string;
    course_name: string;
    test_date?: string;
    created_at: string;
    user_uid: string;
}

export interface Lesson {
  id: string;
  title: string;
  completed: boolean;
  mastery: boolean;
}

export interface Unit {
  id: string;
  title: string;
  lessons: Lesson[];
}

export interface Roadmap {
  id: string;
  title: string;
  units: Unit[];
}

export interface OnboardingState {
  apCourse: string;
  testDate?: string;
}

export interface OnboardingQuizResult {
  id: string;
  user_uid: string;
  ap_class_id: string;
  question: string;
  unit_title: string;
  skill: string;
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
  created_at: string;
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
}

export interface ParsedQuiz {
  questions: QuizQuestion[];
}