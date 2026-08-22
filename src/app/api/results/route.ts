import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Result } from '@/models/Result';
// Student import removed since we no longer use it for results
import { Program } from '@/models/Program';
import { getIO, SOCKET_EVENTS } from '@/lib/socket';
import { getTeamRankings } from '@/lib/rankings';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const programId = searchParams.get('programId');
    
    const query = programId ? { programId } : {};
    
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : 0;
    
    // Get results and populate references
    const results = await Result.find(query)
      .populate('programId', 'name language category type')
      .populate('teamId', 'name color')
      .sort({ createdAt: -1 })
      .limit(limit);
      
    return NextResponse.json(results);
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export const POST = requireAdmin(async (req: NextRequest) => {
  try {
    await connectDB();
    const body = await req.json();
    
    // Expecting an array of results for a program
    if (!Array.isArray(body) || body.length === 0) {
      return NextResponse.json({ error: 'Expected an array of results' }, { status: 400 });
    }

    const programId = body[0].programId;

    // Validate program exists and is live/completed
    const program = await Program.findById(programId);
    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    // Process results
    const savedResults = [];
    for (const result of body) {
      if (!result.studentName || !result.position || !result.points || !result.teamId) {
         continue; // Skip incomplete entries
      }
      
      const newResult = {
        programId,
        studentName: result.studentName,
        teamId: result.teamId,
        position: result.position,
        points: result.points,
        revealed: false // always start unrevealed
      };
      
      const savedResult = await Result.create(newResult);
      // Wait to ensure socket gets full populated data if needed, but here we can just push it
      savedResults.push(savedResult);
    }
    
    // Recalculate rankings
    const rankings = await getTeamRankings();
    
    // Emit events
    const io = getIO();
    if (io) {
      io.emit(SOCKET_EVENTS.SCORE_UPDATED, rankings);
      io.emit(SOCKET_EVENTS.RESULT_SAVED, savedResults);
    }

    return NextResponse.json({ message: 'Results saved successfully', results: savedResults }, { status: 201 });
  } catch (error: unknown) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any).code === 11000) {
       return NextResponse.json({ error: 'Duplicate entry detected (e.g. same student twice)' }, { status: 400 });
    }
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
});
