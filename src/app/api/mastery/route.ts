// src/app/api/mastery/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedContext } from '@/lib/auth-handler';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

const masterySchema = z.object({
  courseName: z.string().min(1),
  masteryLevel: z.number().min(0).max(100),
});

/**
 * API endpoint to create or update the mastery level for a course.
 */
async function postMasteryHandler(req: NextRequest, context: AuthenticatedContext) {
  const { uid } = context.user;
  const body = await req.json();

  const parseResult = masterySchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json({ error: 'Invalid request body', details: parseResult.error.flatten() }, { status: 400 });
  }
  const { courseName, masteryLevel } = parseResult.data;

  const { error } = await supabase
    .from('course_mastery')
    .upsert(
      {
        user_uid: uid,
        course_name: courseName,
        mastery_level: masteryLevel,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'user_uid,course_name' }
    );

  if (error) {
    console.error('Failed to update course mastery:', error);
    return NextResponse.json({ error: 'Failed to update course mastery' }, { status: 500 });
  }

  return NextResponse.json({ success: true }, { status: 200 });
}

export const POST = await withAuth(postMasteryHandler);