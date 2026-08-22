import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { generateLeaderboardConfig } from '@/lib/rankings';
import { requireAdmin } from '@/lib/auth';

export const POST = requireAdmin(async (req: NextRequest) => {
  try {
    await connectDB();
    const { type, startDate, endDate } = await req.json();
    
    let options = undefined;
    if (startDate && endDate) {
      options = { startDate: new Date(startDate), endDate: new Date(endDate) };
    }

    const config = await generateLeaderboardConfig(type, options);
    
    return NextResponse.json(config);
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
});
