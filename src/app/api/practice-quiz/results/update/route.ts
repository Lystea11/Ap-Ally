import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedContext } from '@/lib/auth-handler';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';

const UpdateQuizResultSchema = z.object({
  classId: z.string().describe('The AP class ID'),
  quizTitle: z.string().describe('The quiz title to match'),
  newScore: z.number().min(0).max(100).describe('Updated overall score from AI feedback'),
});

type UpdateQuizResult = z.infer<typeof UpdateQuizResultSchema>;

async function updateQuizResultHandler(req: NextRequest, context: AuthenticatedContext) {
  const { uid } = context.user;
  const body = await req.json();

  const parseResult = UpdateQuizResultSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json({ error: 'Invalid request body', details: parseResult.error.flatten() }, { status: 400 });
  }

  const { classId, quizTitle, newScore } = parseResult.data;

  try {
    // Find the most recent quiz result for this user, class, and title
    const { data: existingResults, error: fetchError } = await supabase
      .from('practice_quiz_results')
      .select('id')
      .eq('user_uid', uid)
      .eq('ap_class_id', classId)
      .eq('quiz_title', quizTitle)
      .order('created_at', { ascending: false })
      .limit(1);

    if (fetchError) {
      console.error('Error fetching existing quiz result:', fetchError);
      return NextResponse.json({ error: 'Failed to find quiz result' }, { status: 500 });
    }

    if (!existingResults || existingResults.length === 0) {
      return NextResponse.json({ error: 'Quiz result not found' }, { status: 404 });
    }

    // Update the quiz result with the new AI-generated score
    const { data, error } = await supabase
      .from('practice_quiz_results')
      .update({
        overall_score: newScore,
        updated_at: new Date().toISOString(),
      })
      .eq('id', existingResults[0].id)
      .select()
      .single();

    if (error) {
      console.error('Error updating quiz result:', error);
      return NextResponse.json({ error: 'Failed to update quiz result' }, { status: 500 });
    }

    return NextResponse.json({ success: true, result: data });
  } catch (error) {
    console.error('Failed to update quiz result:', error);
    return NextResponse.json({ error: 'Failed to update quiz result' }, { status: 500 });
  }
}

export const PATCH = await withAuth(updateQuizResultHandler);