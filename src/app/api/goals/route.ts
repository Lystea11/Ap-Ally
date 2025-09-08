// src/app/api/goals/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedContext } from '@/lib/auth-handler';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

const goalSchema = z.object({
  text: z.string().min(1),
});

// GET all goals for the logged-in user
async function getGoals(req: NextRequest, context: AuthenticatedContext) {
  const { uid } = context.user;
  const { data, error } = await supabase
    .from('goals')
    .select('*')
    .eq('user_uid', uid)
    .order('created_at', { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// POST a new goal
async function createGoal(req: NextRequest, context: AuthenticatedContext) {
  const { uid } = context.user;
  const body = await req.json();

  const parseResult = goalSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { text } = parseResult.data;
  const { data, error } = await supabase
    .from('goals')
    .insert({ user_uid: uid, text })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}

export const GET = await withAuth(getGoals);
export const POST = await withAuth(createGoal);