import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import { Result } from '@/models/Result';
import { Program } from '@/models/Program';
import { getIO, SOCKET_EVENTS } from '@/lib/socket';
import { getTeamRankings } from '@/lib/rankings';
import { requireAdmin } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const programId = searchParams.get('programId');
    
    if (programId && !mongoose.Types.ObjectId.isValid(programId)) {
      return NextResponse.json({ error: 'Invalid program ID format' }, { status: 400 });
    }

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

    if (!programId || !mongoose.Types.ObjectId.isValid(programId)) {
      return NextResponse.json({ error: 'Valid Program ID is required' }, { status: 400 });
    }

    // Validate program exists and is live/completed
    const program = await Program.findById(programId);
    if (!program) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    // Process results
    const savedResults = [];
    for (const result of body) {
      if (!result.studentName || typeof result.studentName !== 'string' || !result.studentName.trim()) {
        continue; // Skip incomplete entries
      }
      
      if (!result.teamId || !mongoose.Types.ObjectId.isValid(result.teamId)) {
        continue; // Skip invalid team entries
      }

      const positionNum = Number(result.position);
      if (!Number.isInteger(positionNum) || positionNum < 1) {
        continue; // Skip invalid position entries
      }

      const pointsNum = Number(result.points);
      if (typeof pointsNum !== 'number' || isNaN(pointsNum) || !isFinite(pointsNum) || pointsNum < 0) {
        continue; // Skip negative/invalid point entries
      }
      
      const newResult = {
        programId,
        studentName: result.studentName.trim(),
        teamId: result.teamId,
        position: positionNum,
        points: pointsNum,
        revealed: false // always start unrevealed
      };
      
      const savedResult = await Result.create(newResult);
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
