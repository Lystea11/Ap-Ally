import { createClient } from '@supabase/supabase-js';
import type { OnboardingQuizResult } from './types';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Supabase URL and service key are required. Check your .env file.');
}

// Create a single supabase client for use in backend operations
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    // We are using Firebase for auth, so we disable Supabase's auto-refreshing of tokens.
    autoRefreshToken: false,
    persistSession: false,
  },
});

// Function to save onboarding quiz results
export async function saveOnboardingQuizResults(
  userUid: string,
  apClassId: string,
  quizResults: Array<{
    question: string;
    unit_title: string;
    skill: string;
    user_answer: string;
    correct_answer: string;
    is_correct: boolean;
  }>
) {
  const { data, error } = await supabase
    .from('onboarding_quiz_results')
    .insert(
      quizResults.map(result => ({
        user_uid: userUid,
        ap_class_id: apClassId,
        ...result
      }))
    )
    .select();

  if (error) {
    console.error('Error saving quiz results:', error);
    throw error;
  }

  return data;
}

// Function to get onboarding quiz results for a user and class
export async function getOnboardingQuizResults(
  userUid: string,
  apClassId: string
): Promise<OnboardingQuizResult[]> {
  const { data, error } = await supabase
    .from('onboarding_quiz_results')
    .select('*')
    .eq('user_uid', userUid)
    .eq('ap_class_id', apClassId)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching quiz results:', error);
    throw error;
  }

  return data || [];
}
