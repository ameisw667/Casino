import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Clerk user provisioning has been retired — the app runs on native Supabase Auth' },
    { status: 410 }
  );
}
