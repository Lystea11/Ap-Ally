export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Lesson {
  id: string;
  title: string;
  completed: boolean;
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

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
}

export interface ParsedQuiz {
  questions: QuizQuestion[];
}

export interface OnboardingState {
  apCourse: string;
  experienceLevel: string;
}
