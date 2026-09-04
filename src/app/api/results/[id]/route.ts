import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Result } from '@/models/Result';
import { getIO, SOCKET_EVENTS } from '@/lib/socket';
import { syncTVLeaderboardState, getTeamRankings } from '@/lib/rankings';
import { requireAdmin } from '@/lib/auth';

export const PUT = requireAdmin(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    
    const result = await Result.findByIdAndUpdate(
      id,
      {
        studentName: body.studentName,
        teamId: body.teamId,
        position: body.position,
        points: body.points
      },
      { new: true, runValidators: true }
    );
    
    if (!result) {
      return NextResponse.json({ error: 'Result not found' }, { status: 404 });
    }
    
    // Recalculate rankings
    const rankings = await getTeamRankings();
    
    // Emit events
    const io = getIO();
    if (io) {
      await syncTVLeaderboardState();
      io.emit(SOCKET_EVENTS.SCORE_UPDATED, rankings);
      // We could use RESULT_SAVED for this if it's general
      io.emit(SOCKET_EVENTS.RESULT_SAVED, [result]);
    }
    
    return NextResponse.json({ message: 'Result updated successfully', result }, { status: 200 });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
});

export const DELETE = requireAdmin(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    await connectDB();
    const { id } = await params;
    
    // We are deleting a specific result by ID
    const result = await Result.findByIdAndDelete(id);
    if (!result) {
      return NextResponse.json({ error: 'Result not found' }, { status: 404 });
    }
    
    // Recalculate rankings
    const rankings = await getTeamRankings();
    
    // Emit events
    const io = getIO();
    if (io) {
      await syncTVLeaderboardState();
      io.emit(SOCKET_EVENTS.SCORE_UPDATED, rankings);
      io.emit(SOCKET_EVENTS.RESULT_DELETED, { id, programId: result.programId });
    }
    
    return NextResponse.json({ message: 'Result deleted successfully' });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
});
