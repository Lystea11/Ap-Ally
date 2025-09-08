-- This file documents the database schema for the AP Ally application.
-- It is intended for reference and for setting up your Supabase database manually.

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table to store basic user info, linked to Firebase Auth
-- The `uid` from Firebase Auth will be the primary key.
CREATE TABLE users (
  uid TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  boar_level INTEGER DEFAULT 1 CHECK (boar_level >= 1 AND boar_level <= 3),
  lessons_completed_count INTEGER DEFAULT 0,
  current_streak INTEGER DEFAULT 0,
  longest_streak INTEGER DEFAULT 0,
  last_lesson_date TIMESTAMPTZ,
  practice_quizzes_completed INTEGER DEFAULT 0
);

-- AP Classes table
CREATE TABLE ap_classes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_uid TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  course_name TEXT NOT NULL,
  test_date TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Roadmaps table to group lessons for a specific study plan
CREATE TABLE roadmaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_uid TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  ap_class_id UUID NOT NULL REFERENCES ap_classes(id) ON DELETE CASCADE,
  course_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Lessons table with content and progress tracking for each lesson in a roadmap
CREATE TABLE lessons (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  roadmap_id UUID NOT NULL REFERENCES roadmaps(id) ON DELETE CASCADE,
  user_uid TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE, -- Denormalized for easier RLS policies and queries
  unit_title TEXT NOT NULL,
  title TEXT NOT NULL,
  content JSONB, -- To store structured lesson content from the AI (e.g., markdown, questions)
  completed BOOLEAN DEFAULT false NOT NULL,
  mastery BOOLEAN DEFAULT false NOT NULL,
  quiz_score INTEGER,
  unit_order INTEGER NOT NULL,
  lesson_order INTEGER NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Course mastery table to track overall progress for a user in a course
CREATE TABLE course_mastery (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_uid TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  course_name TEXT NOT NULL,
  mastery_level FLOAT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  UNIQUE(user_uid, course_name) -- Each user can only have one mastery entry per course
);

-- Goals table
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_uid TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  text TEXT NOT NULL,
  completed BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Onboarding quiz results table to store initial assessment data
CREATE TABLE onboarding_quiz_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_uid TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  ap_class_id UUID NOT NULL REFERENCES ap_classes(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  unit_title TEXT NOT NULL,
  skill TEXT NOT NULL,
  user_answer TEXT NOT NULL,
  correct_answer TEXT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Practice quiz results table to store practice test performance
CREATE TABLE practice_quiz_results (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_uid TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
  ap_class_id UUID NOT NULL REFERENCES ap_classes(id) ON DELETE CASCADE,
  quiz_title TEXT NOT NULL,
  quiz_format TEXT NOT NULL,
  overall_score DECIMAL(5,2) NOT NULL,
  questions_answered INTEGER NOT NULL,
  total_questions INTEGER NOT NULL,
  time_spent INTEGER,
  units TEXT[] NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Create indexes for frequently queried columns
CREATE INDEX idx_roadmaps_user_uid ON roadmaps(user_uid);
CREATE INDEX idx_lessons_roadmap_id ON lessons(roadmap_id);
CREATE INDEX idx_lessons_user_uid ON lessons(user_uid);
CREATE INDEX idx_course_mastery_user_uid ON course_mastery(user_uid);
CREATE INDEX idx_goals_user_uid ON goals(user_uid);
CREATE INDEX idx_ap_classes_user_uid ON ap_classes(user_uid);
CREATE INDEX idx_onboarding_quiz_results_user_uid ON onboarding_quiz_results(user_uid);
CREATE INDEX idx_onboarding_quiz_results_ap_class_id ON onboarding_quiz_results(ap_class_id);
CREATE INDEX idx_practice_quiz_results_user_uid ON practice_quiz_results(user_uid);
CREATE INDEX idx_practice_quiz_results_ap_class_id ON practice_quiz_results(ap_class_id);