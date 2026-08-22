import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Result } from '@/models/Result';
import { Program } from '@/models/Program';
import { requireAdmin } from '@/lib/auth';
import { EVENT_NAME } from '@/types';

export const POST = requireAdmin(async (req: NextRequest) => {
  try {
    await connectDB();
    const { presentation, programId } = await req.json();
    
    if (!programId) {
      return NextResponse.json({ error: 'Program ID is required' }, { status: 400 });
    }

    const program = await Program.findById(programId).lean();
    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    // Get all results for this program that are revealed
    const results = await Result.find({ programId, revealed: true }).populate('teamId').lean();

    const winnersByPosition: any = { 1: [], 2: [], 3: [] };

    results.forEach((res: any) => {
      if (res.position === 1 || res.position === 2 || res.position === 3) {
        const team = res.teamId;
        winnersByPosition[res.position].push({
          studentName: res.studentName || 'Unknown',
          teamName: team?.name || 'Unknown',
          teamColor: team?.color || '#f59e0b',
          points: res.points || 0,
        });
      }
    });

    return NextResponse.json({
      programName: program.name || 'Program',
      language: program.language || 'Other',
      category: program.category || '',
      eventName: EVENT_NAME,
      eventYear: new Date().getFullYear().toString(),
      winnersByPosition,
      presentation: presentation || 'design1',
    });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
});
