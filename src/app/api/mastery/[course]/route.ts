// src/app/api/mastery/[course]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedContext } from '@/lib/auth-handler';
import { supabase } from '@/lib/supabase';

/**
 * API endpoint to get the mastery level for a specific course for the current user.
 */
async function getMasteryHandler(req: NextRequest, context: AuthenticatedContext) {
  const { uid } = context.user;
  const courseName = decodeURIComponent(context.params.course);

  if (!courseName) {
    return NextResponse.json({ error: 'Course name is required' }, { status: 400 });
  }

  const { data, error } = await supabase
    .from('course_mastery')
    .select('mastery_level, updated_at')
    .eq('user_uid', uid)
    .eq('course_name', courseName)
    .single();

  if (error) {
    // If no row is found, it's not an error, just means no mastery has been set yet.
    if (error.code === 'PGRST116') {
      return NextResponse.json({ mastery_level: 0, updated_at: null });
    }
    console.error('Failed to fetch course mastery:', error);
    return NextResponse.json({ error: 'Failed to fetch course mastery' }, { status: 500 });
  }

  return NextResponse.json(data);
}

export const GET = await withAuth(getMasteryHandler);