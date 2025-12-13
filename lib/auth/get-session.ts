import { auth } from '@/lib/auth/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function getSession() {
  return await auth();
}

export async function requireAuth() {
  const session = await getSession();

  if (!session || !session.user) {
    return {
      error: NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      ),
      session: null,
    };
  }

  return { session, error: null };
}
