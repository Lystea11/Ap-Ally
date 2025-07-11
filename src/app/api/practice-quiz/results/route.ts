import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedContext } from '@/lib/auth-handler';
import { z } from 'zod';
import { supabase } from '@/lib/supabase';

const QuizResultSchema = z.object({
  classId: z.string().describe('The AP class ID'),
  quizTitle: z.string().describe('The quiz title'),
  quizFormat: z.string().describe('The quiz format (mcq, leq, laq, mixed)'),
  overallScore: z.number().min(0).max(100).describe('Overall score percentage'),
  questionsAnswered: z.number().describe('Number of questions answered'),
  totalQuestions: z.number().describe('Total number of questions'),
  timeSpent: z.number().optional().describe('Time spent in minutes'),
  units: z.array(z.string()).describe('Units covered in the quiz'),
});

type QuizResult = z.infer<typeof QuizResultSchema>;

async function saveQuizResultHandler(req: NextRequest, context: AuthenticatedContext) {
  const { uid } = context.user;
  const body = await req.json();

  const parseResult = QuizResultSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json({ error: 'Invalid request body', details: parseResult.error.flatten() }, { status: 400 });
  }

  const quizResult = parseResult.data;

  try {
    const { data, error } = await supabase
      .from('practice_quiz_results')
      .insert({
        user_uid: uid,
        ap_class_id: quizResult.classId,
        quiz_title: quizResult.quizTitle,
        quiz_format: quizResult.quizFormat,
        overall_score: quizResult.overallScore,
        questions_answered: quizResult.questionsAnswered,
        total_questions: quizResult.totalQuestions,
        time_spent: quizResult.timeSpent,
        units: quizResult.units,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving quiz result:', error);
      return NextResponse.json({ error: 'Failed to save quiz result' }, { status: 500 });
    }

    return NextResponse.json({ success: true, result: data });
  } catch (error) {
    console.error('Failed to save quiz result:', error);
    return NextResponse.json({ error: 'Failed to save quiz result' }, { status: 500 });
  }
}

async function getQuizResultsHandler(req: NextRequest, context: AuthenticatedContext) {
  const { uid } = context.user;
  const { searchParams } = new URL(req.url);
  const classId = searchParams.get('classId');

  if (!classId) {
    return NextResponse.json({ error: 'Missing classId parameter' }, { status: 400 });
  }

  try {
    const { data, error } = await supabase
      .from('practice_quiz_results')
      .select('*')
      .eq('user_uid', uid)
      .eq('ap_class_id', classId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching quiz results:', error);
      return NextResponse.json({ error: 'Failed to fetch quiz results' }, { status: 500 });
    }

    return NextResponse.json({ results: data || [] });
  } catch (error) {
    console.error('Failed to fetch quiz results:', error);
    return NextResponse.json({ error: 'Failed to fetch quiz results' }, { status: 500 });
  }
}

export const POST = await withAuth(saveQuizResultHandler);
export const GET = await withAuth(getQuizResultsHandler);