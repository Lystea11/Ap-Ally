-- This file documents the database schema for the AP Ally application.
-- It is intended for reference and for setting up your Supabase database manually.

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table to store basic user info, linked to Firebase Auth
-- The `uid` from Firebase Auth will be the primary key.
CREATE TABLE users (
  uid TEXT PRIMARY KEY,
  email TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Roadmaps table to group lessons for a specific study plan
CREATE TABLE roadmaps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_uid TEXT NOT NULL REFERENCES users(uid) ON DELETE CASCADE,
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

-- Create indexes for frequently queried columns
CREATE INDEX idx_roadmaps_user_uid ON roadmaps(user_uid);
CREATE INDEX idx_lessons_roadmap_id ON lessons(roadmap_id);
CREATE INDEX idx_lessons_user_uid ON lessons(user_uid);
CREATE INDEX idx_course_mastery_user_uid ON course_mastery(user_uid);
