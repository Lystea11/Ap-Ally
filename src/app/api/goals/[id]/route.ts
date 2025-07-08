// src/app/api/goals/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedContext } from '@/lib/auth-handler';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

const updateGoalSchema = z.object({
  completed: z.boolean(),
});

// PATCH an existing goal
async function updateGoal(req: NextRequest, context: AuthenticatedContext) {
  const { uid } = context.user;
  const { id } = context.params;
  const body = await req.json();

  const parseResult = updateGoalSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { completed } = parseResult.data;

  const { error } = await supabase
    .from('goals')
    .update({ completed })
    .eq('id', id)
    .eq('user_uid', uid);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}

// DELETE a goal
async function deleteGoal(req: NextRequest, context: AuthenticatedContext) {
  const { uid } = context.user;
  const { id } = context.params;

  const { error } = await supabase
    .from('goals')
    .delete()
    .eq('id', id)
    .eq('user_uid', uid);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return new NextResponse(null, { status: 204 });
}

export const PATCH = await withAuth(updateGoal);
export const DELETE = await withAuth(deleteGoal);