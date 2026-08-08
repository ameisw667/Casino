import { NextResponse } from 'next/server';

export async function POST() {
  return NextResponse.json(
    { error: 'Client-supplied wallet and progression migration has been retired' },
    { status: 410 }
  );
}