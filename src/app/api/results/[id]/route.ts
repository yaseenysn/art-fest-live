import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import { Result } from '@/models/Result';
import { getIO, SOCKET_EVENTS } from '@/lib/socket';
import { syncTVLeaderboardState, getTeamRankings } from '@/lib/rankings';
import { requireAdmin } from '@/lib/auth';

export const PUT = requireAdmin(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    await connectDB();
    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Valid Result ID is required' }, { status: 400 });
    }

    const body = await req.json();

    const updatePayload: Record<string, any> = {};

    if (body.studentName !== undefined) {
      if (typeof body.studentName !== 'string' || !body.studentName.trim()) {
        return NextResponse.json({ error: 'Student name must be a non-empty string' }, { status: 400 });
      }
      updatePayload.studentName = body.studentName.trim();
    }

    if (body.teamId !== undefined) {
      if (!mongoose.Types.ObjectId.isValid(body.teamId)) {
        return NextResponse.json({ error: 'Valid Team ID is required' }, { status: 400 });
      }
      updatePayload.teamId = body.teamId;
    }

    if (body.position !== undefined) {
      const pos = Number(body.position);
      if (!Number.isInteger(pos) || pos < 1) {
        return NextResponse.json({ error: 'Position must be a positive integer (1, 2, 3...)' }, { status: 400 });
      }
      updatePayload.position = pos;
    }

    if (body.points !== undefined) {
      const pts = Number(body.points);
      if (typeof pts !== 'number' || isNaN(pts) || !isFinite(pts) || pts < 0) {
        return NextResponse.json({ error: 'Points must be a non-negative number' }, { status: 400 });
      }
      updatePayload.points = pts;
    }
    
    const result = await Result.findByIdAndUpdate(
      id,
      updatePayload,
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

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Valid Result ID is required' }, { status: 400 });
    }
    
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
