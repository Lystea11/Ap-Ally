// src/app/api/gamification/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedContext } from '@/lib/auth-handler';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';
import { getBoarLevelFromProgress, calculateStreakFromDate } from '@/lib/gamification-utils';

const updateGamificationSchema = z.object({
  lessonCompleted: z.boolean().optional(),
  practiceQuizCompleted: z.boolean().optional(),
  quizPassed: z.boolean().optional(),
});

/**
 * API endpoint to get user's gamification data
 */
async function getGamificationHandler(req: NextRequest, context: AuthenticatedContext) {
  const { uid } = context.user;

  const { data: userData, error } = await supabase
    .from('users')
    .select(`
      boar_level,
      lessons_completed_count,
      current_streak,
      longest_streak,
      last_lesson_date,
      practice_quizzes_completed
    `)
    .eq('uid', uid)
    .single();

  if (error) {
    console.error('Failed to fetch gamification data:', error);
    return NextResponse.json({ error: 'Failed to fetch gamification data' }, { status: 500 });
  }

  // Calculate current boar level based on progress
  const calculatedBoarLevel = getBoarLevelFromProgress(
    userData?.lessons_completed_count || 0,
    userData?.practice_quizzes_completed || 0,
    userData?.current_streak || 0
  );

  // Update boar level if it's changed
  if (calculatedBoarLevel !== (userData?.boar_level || 1)) {
    await supabase
      .from('users')
      .update({ boar_level: calculatedBoarLevel })
      .eq('uid', uid);

    userData.boar_level = calculatedBoarLevel;
  }

  return NextResponse.json({
    boar_level: userData?.boar_level || 1,
    lessons_completed_count: userData?.lessons_completed_count || 0,
    current_streak: userData?.current_streak || 0,
    longest_streak: userData?.longest_streak || 0,
    last_lesson_date: userData?.last_lesson_date || null,
    practice_quizzes_completed: userData?.practice_quizzes_completed || 0,
  });
}

/**
 * API endpoint to update user's gamification progress
 */
async function postGamificationHandler(req: NextRequest, context: AuthenticatedContext) {
  const { uid } = context.user;
  const body = await req.json();

  const parseResult = updateGamificationSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json({ 
      error: 'Invalid request body', 
      details: parseResult.error.flatten() 
    }, { status: 400 });
  }

  const { lessonCompleted, practiceQuizCompleted, quizPassed } = parseResult.data;

  // Get current user data
  const { data: currentUser, error: fetchError } = await supabase
    .from('users')
    .select(`
      boar_level,
      lessons_completed_count,
      current_streak,
      longest_streak,
      last_lesson_date,
      practice_quizzes_completed
    `)
    .eq('uid', uid)
    .single();

  if (fetchError) {
    console.error('Failed to fetch current user data:', fetchError);
    return NextResponse.json({ error: 'Failed to fetch user data' }, { status: 500 });
  }

  // Initialize values if null
  const currentData = {
    boar_level: currentUser?.boar_level || 1,
    lessons_completed_count: currentUser?.lessons_completed_count || 0,
    current_streak: currentUser?.current_streak || 0,
    longest_streak: currentUser?.longest_streak || 0,
    last_lesson_date: currentUser?.last_lesson_date || null,
    practice_quizzes_completed: currentUser?.practice_quizzes_completed || 0,
  };

  let updateData: any = {};
  let leveledUp = false;
  const oldLevel = currentData.boar_level;

  // Handle lesson completion
  if (lessonCompleted) {
    const now = new Date().toISOString();
    
    // Update lesson count
    updateData.lessons_completed_count = currentData.lessons_completed_count + 1;
    updateData.last_lesson_date = now;

    // Calculate streak
    const streakData = calculateStreakFromDate(
      currentData.last_lesson_date,
      currentData.current_streak
    );

    updateData.current_streak = streakData.newStreak;
    updateData.longest_streak = Math.max(
      currentData.longest_streak,
      streakData.newStreak
    );
  }

  // Handle practice quiz completion
  if (practiceQuizCompleted && quizPassed) {
    updateData.practice_quizzes_completed = currentData.practice_quizzes_completed + 1;
  }

  // Calculate new boar level
  const newBoarLevel = getBoarLevelFromProgress(
    updateData.lessons_completed_count || currentData.lessons_completed_count,
    updateData.practice_quizzes_completed || currentData.practice_quizzes_completed,
    updateData.current_streak || currentData.current_streak
  );

  if (newBoarLevel !== oldLevel) {
    updateData.boar_level = newBoarLevel;
    leveledUp = true;
  }

  // Update user data
  const { error: updateError } = await supabase
    .from('users')
    .update(updateData)
    .eq('uid', uid);

  if (updateError) {
    console.error('Failed to update gamification data:', updateError);
    return NextResponse.json({ error: 'Failed to update gamification data' }, { status: 500 });
  }

  // Return updated data
  const finalData = {
    ...currentData,
    ...updateData,
  };

  return NextResponse.json({
    success: true,
    leveledUp,
    oldLevel,
    newLevel: finalData.boar_level,
    data: finalData,
  });
}

export const GET = await withAuth(getGamificationHandler);
export const POST = await withAuth(postGamificationHandler);