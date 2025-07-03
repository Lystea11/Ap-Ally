'use server';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from './firebase-admin';
import { supabase } from './supabase';

export interface AuthenticatedContext {
  params: any;
  user: {
    uid: string;
    email?: string;
  };
}

type AuthenticatedHandler = (
  req: NextRequest,
  context: AuthenticatedContext
) => Promise<NextResponse | Response> | NextResponse | Response;

/**
 * A higher-order function to wrap Next.js API route handlers with Firebase authentication.
 * It verifies the Firebase ID token from the Authorization header,
 * upserts the user into the Supabase 'users' table, and passes the user info to the handler.
 *
 * @param handler The API route handler to wrap.
 * @returns A new handler that includes authentication checks.
 */
export function withAuth(handler: AuthenticatedHandler) {
  return async (req: NextRequest, context: { params: any }) => {
    const authHeader = req.headers.get('authorization');
    const token = authHeader?.split('Bearer ')[1];

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized: No token provided' }, { status: 401 });
    }

    try {
      const decodedToken = await auth.verifyIdToken(token);
      const { uid, email } = decodedToken;

      // Ensure user exists in our public `users` table
      const { error: upsertError } = await supabase
        .from('users')
        .upsert({ uid, email }, { onConflict: 'uid' });

      if (upsertError) {
        console.error('Supabase user upsert error:', upsertError);
        return NextResponse.json({ error: 'Database error during user sync' }, { status: 500 });
      }

      const authenticatedContext: AuthenticatedContext = { ...context, user: { uid, email } };
      return handler(req, authenticatedContext);
    } catch (error: any) {
      console.error('Token verification error:', error.message);
      return NextResponse.json({ error: 'Forbidden: Invalid token' }, { status: 403 });
    }
  };
}
