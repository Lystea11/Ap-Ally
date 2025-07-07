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
  title: string;
  units: Unit[];
}

export interface OnboardingState {
  apCourse: string;
  experienceLevel: string;
}