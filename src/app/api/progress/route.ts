// src/app/api/progress/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedContext } from '@/lib/auth-handler';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

const progressSchema = z.object({
  lessonId: z.string().uuid(),
  completed: z.boolean(),
  mastery: z.boolean().optional(),
  quiz_score: z.number().int().min(0).optional(),
});

/**
 * API endpoint to update the progress for a specific lesson.
 * This corresponds to the `lesson_progress` table requested, but for simplicity,
 * the progress fields are stored directly on the `lessons` table.
 */
async function postProgressHandler(req: NextRequest, context: AuthenticatedContext) {
  const { uid } = context.user;
  const body = await req.json();

  const parseResult = progressSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json({ error: 'Invalid request body', details: parseResult.error.flatten() }, { status: 400 });
  }

  const { lessonId, ...progressData } = parseResult.data;

  // Verify the user owns this lesson before updating
  const { error } = await supabase
    .from('lessons')
    .update(progressData)
    .eq('id', lessonId)
    .eq('user_uid', uid);

  if (error) {
    console.error('Failed to update lesson progress:', error);
    return NextResponse.json({ error: 'Failed to update lesson progress' }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}

export const POST = await withAuth(postProgressHandler);

/**
 * API endpoint to retrieve all progress data for the current user.
 */
async function getProgressHandler(req: NextRequest, context: AuthenticatedContext) {
  const { uid } = context.user;

  const { data, error } = await supabase
    .from('lessons')
    .select('id, completed, mastery, quiz_score')
    .eq('user_uid', uid);

  if (error) {
    console.error('Failed to fetch progress:', error);
    return NextResponse.json({ error: 'Failed to fetch progress' }, { status: 500 });
  }

  return NextResponse.json(data);
}

export const GET = await withAuth(getProgressHandler);