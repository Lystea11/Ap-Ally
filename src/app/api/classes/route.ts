// src/app/api/classes/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedContext } from '@/lib/auth-handler';
import { supabase } from '@/lib/supabase';
import { z } from 'zod';

export const classSchema = z.object({
  course_name: z.string().min(1),
  test_date: z.string().optional(),
});

// GET all AP classes for the logged-in user
async function getClasses(req: NextRequest, context: AuthenticatedContext) {
  const { uid } = context.user;
  const { data, error } = await supabase
    .from('ap_classes')
    .select('*')
    .eq('user_uid', uid);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data);
}

// POST a new AP class
async function createClass(req: NextRequest, context: AuthenticatedContext) {
  const { uid } = context.user;
  const body = await req.json();

  const parseResult = classSchema.safeParse(body);
  if (!parseResult.success) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const { course_name, test_date } = parseResult.data;
  const { data, error } = await supabase
    .from('ap_classes')
    .insert({ user_uid: uid, course_name, test_date })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json(data, { status: 201 });
}

export const GET = await withAuth(getClasses);
export const POST = await withAuth(createClass);