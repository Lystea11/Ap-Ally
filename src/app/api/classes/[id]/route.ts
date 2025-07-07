// src/app/api/classes/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { withAuth, AuthenticatedContext } from '@/lib/auth-handler';
import { supabase } from '@/lib/supabase';

async function deleteClass(req: NextRequest, context: AuthenticatedContext) {
    const { uid } = context.user;
    const { id } = context.params;

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

export const DELETE = await withAuth(deleteClass);