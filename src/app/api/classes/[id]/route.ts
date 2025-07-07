// src/app/api/classes/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedContext } from '@/lib/auth-handler';
import { supabase } from '@/lib/supabase';
import { classSchema } from '../route';

async function deleteClass(req: NextRequest, context: AuthenticatedContext) {
    const { uid } = context.user;
    const params = await context.params;
    const { id } = params;

    const { error } = await supabase
        .from('ap_classes')
        .delete()
        .eq('id', id)
        .eq('user_uid', uid);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return new NextResponse(null, { status: 204 });
}

async function updateClass(req: NextRequest, context: AuthenticatedContext) {
    const { uid } = context.user;
    const params = await context.params;
    const { id } = params;
    const body = await req.json();

    const parseResult = classSchema.pick({ test_date: true }).safeParse(body);
    if (!parseResult.success) {
        return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
    }

    const { test_date } = parseResult.data;

    const { error } = await supabase
        .from('ap_classes')
        .update({ test_date })
        .eq('id', id)
        .eq('user_uid', uid);

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true }, { status: 200 });
}

export const DELETE = await withAuth(deleteClass);
export const PATCH = await withAuth(updateClass);