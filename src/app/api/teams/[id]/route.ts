import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Team } from '@/models/Team';
import { Result } from '@/models/Result';
import { requireAdmin } from '@/lib/auth';
import { getIO, SOCKET_EVENTS } from '@/lib/socket';

export const PUT = requireAdmin(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    const { id } = await params;
    const body = await req.json();
    let { name, shortName } = body;
    const { color } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Team name is required.' }, { status: 400 });
    }

    name = name.trim();
    if (name.length < 2) {
      return NextResponse.json({ error: 'Team name must be at least 2 characters.' }, { status: 400 });
    }

    if (!color || typeof color !== 'string') {
      return NextResponse.json({ error: 'Team color is required.' }, { status: 400 });
    }

    shortName = shortName ? shortName.trim() : undefined;

    await connectDB();

    const existingTeam = await Team.findOne({ 
      name: { $regex: `^${name}$`, $options: 'i' },
      _id: { $ne: id }
    });
    
    if (existingTeam) {
      return NextResponse.json({ error: 'A team with this name already exists.' }, { status: 409 });
    }

    const team = await Team.findByIdAndUpdate(
      id,
      {
        $set: {
          name,
          shortName,
          color,
          updatedAt: new Date()
        }
      },
      { new: true, runValidators: true }
    );

    if (!team) {
      return NextResponse.json({ error: 'Team not found.' }, { status: 404 });
    }

    const io = getIO();
    if (io) {
      io.emit(SOCKET_EVENTS.TEAM_UPDATED, team);
    }

    return NextResponse.json({ success: true, team }, { status: 200 });
  } catch (error: unknown) {
    console.error(`PUT /api/teams/[id] error:`, error);
    if (error instanceof Error) {
      const err = error as Error & { code?: string | number };
      if (err.code === 11000) {
        return NextResponse.json({ error: 'A team with this name already exists.' }, { status: 409 });
      }
      return NextResponse.json({ error: err.message || 'Failed to update team.' }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to update team.' }, { status: 500 });
  }
});

export const DELETE = requireAdmin(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  let session = null;
  try {
    const { id } = await params;
    await connectDB();
    
    // Fallback if mongoose doesn't expose startSession directly, we use mongoose.connection.startSession
    const mongoose = (await import('mongoose')).default;
    
    try {
      session = await mongoose.startSession();
      session.startTransaction();
    } catch {
      // If replica set is not available for transactions in dev, we just proceed without transaction safely
      console.warn("Transactions not supported, proceeding without transaction");
      session = null;
    }

    const team = await Team.findById(id).session(session);
    if (!team) {
      if (session) {
        await session.abortTransaction();
        session.endSession();
      }
      return NextResponse.json({ error: 'Team not found.' }, { status: 404 });
    }

    // Cascade Delete: Delete all results belonging to this team
    const resultDeleteInfo = await Result.deleteMany({ teamId: id }).session(session);

    // Delete the team itself
    await Team.findByIdAndDelete(id).session(session);

    if (session) {
      await session.commitTransaction();
      session.endSession();
    }

    const io = getIO();
    if (io) {
      io.emit(SOCKET_EVENTS.TEAM_DELETED, { _id: id });
    }

    return NextResponse.json({ 
      success: true, 
      deletedTeamId: id,
      deletedResults: resultDeleteInfo.deletedCount || 0
    }, { status: 200 });

  } catch (error: unknown) {
    console.error(`DELETE /api/teams/[id] error:`, error);
    if (session) {
      try {
        await session.abortTransaction();
        session.endSession();
      } catch {
        // Ignore abort errors
      }
    }
    return NextResponse.json({ error: 'Failed to delete team safely.' }, { status: 500 });
  }
});
