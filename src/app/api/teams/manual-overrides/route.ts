import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import { ManualTeamScoreOverride } from '@/models/ManualTeamScoreOverride';
import { Team } from '@/models/Team';
import { getTeamRankings, syncTVLeaderboardState } from '@/lib/rankings';
import { requireAdmin, verifyToken } from '@/lib/auth';
import { getIO, SOCKET_EVENTS } from '@/lib/socket';
import { cookies } from 'next/headers';

export async function GET() {
  try {
    await connectDB();
    const overrides = await ManualTeamScoreOverride.find({}).lean();
    return NextResponse.json(overrides);
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export const POST = requireAdmin(async (req: NextRequest) => {
  try {
    await connectDB();
    const body = await req.json();
    const { teamId, manualScore } = body;

    if (!teamId || !mongoose.Types.ObjectId.isValid(teamId)) {
      return NextResponse.json({ error: 'Valid Team ID is required.' }, { status: 400 });
    }

    const parsedScore = Number(manualScore);
    if (manualScore === undefined || manualScore === null || isNaN(parsedScore)) {
      return NextResponse.json({ error: 'Manual score must be a valid number.' }, { status: 400 });
    }

    if (parsedScore < 0 || !Number.isFinite(parsedScore) || parsedScore > 1000000) {
      return NextResponse.json({ error: 'Manual score must be a non-negative number within reasonable limits (0 - 1,000,000).' }, { status: 400 });
    }

    const team = await Team.findById(teamId);
    if (!team) {
      return NextResponse.json({ error: 'Team not found.' }, { status: 404 });
    }

    // Retrieve admin session payload for audit log
    const cookieStore = await cookies();
    const token = cookieStore.get('admin_session')?.value;
    const payload = token ? await verifyToken(token) : null;
    const updatedBy = (payload?.username as string) || 'admin';

    const previousOverride = await ManualTeamScoreOverride.findOne({ teamId });
    const previousValue = previousOverride ? previousOverride.manualScore : 'None (Automatic)';

    const override = await ManualTeamScoreOverride.findOneAndUpdate(
      { teamId },
      {
        $set: {
          teamId,
          manualScore: parsedScore,
          updatedBy,
          updatedAt: new Date()
        }
      },
      { upsert: true, new: true, runValidators: true }
    );

    console.log(`[AUDIT - MANUAL SCORE OVERRIDE] Team: ${team.name} (${teamId}) | Previous Override: ${previousValue} | New Manual Score: ${parsedScore} | Updated By: ${updatedBy} | Time: ${new Date().toISOString()}`);

    // Sync TV state and broadcast socket events
    await syncTVLeaderboardState();
    const updatedRankings = await getTeamRankings();

    const io = getIO();
    if (io) {
      io.emit(SOCKET_EVENTS.SCORE_UPDATED, updatedRankings);
      io.emit(SOCKET_EVENTS.TEAM_UPDATED);
    }

    return NextResponse.json({
      success: true,
      override,
      rankings: updatedRankings
    });
  } catch (error: unknown) {
    console.error('POST /api/teams/manual-overrides error:', error);
    return NextResponse.json({ error: (error as Error).message || 'Failed to save manual score override.' }, { status: 500 });
  }
});

export const DELETE = requireAdmin(async (req: NextRequest) => {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    let teamId = searchParams.get('teamId');

    if (!teamId) {
      try {
        const body = await req.json();
        teamId = body.teamId;
      } catch {
        // Body was empty or invalid JSON, ignore
      }
    }

    if (!teamId || !mongoose.Types.ObjectId.isValid(teamId)) {
      return NextResponse.json({ error: 'Valid Team ID is required for reset.' }, { status: 400 });
    }

    const team = await Team.findById(teamId);
    const existingOverride = await ManualTeamScoreOverride.findOneAndDelete({ teamId });

    if (existingOverride) {
      console.log(`[AUDIT - MANUAL SCORE RESET] Team: ${team?.name || teamId} (${teamId}) | Reset manual score override of ${existingOverride.manualScore} back to automatic calculated score | Time: ${new Date().toISOString()}`);
    }

    // Sync TV state and broadcast socket events
    await syncTVLeaderboardState();
    const updatedRankings = await getTeamRankings();

    const io = getIO();
    if (io) {
      io.emit(SOCKET_EVENTS.SCORE_UPDATED, updatedRankings);
      io.emit(SOCKET_EVENTS.TEAM_UPDATED);
    }

    return NextResponse.json({
      success: true,
      message: 'Manual override reset to automatic score successfully.',
      rankings: updatedRankings
    });
  } catch (error: unknown) {
    console.error('DELETE /api/teams/manual-overrides error:', error);
    return NextResponse.json({ error: (error as Error).message || 'Failed to reset manual score override.' }, { status: 500 });
  }
});
