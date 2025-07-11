// src/lib/types.ts

export interface User {
  id: string;
  name: string;
  email: string;
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