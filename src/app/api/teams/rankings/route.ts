import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { getTeamRankings } from '@/lib/rankings';

export async function GET() {
  try {
    await connectDB();
    const rankings = await getTeamRankings();
    return NextResponse.json(rankings);
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
