import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Result } from '@/models/Result';
import { Program } from '@/models/Program';
import { TVState } from '@/models/TVState';
import { getIO, SOCKET_EVENTS } from '@/lib/socket';
import { requireAdmin } from '@/lib/auth';

export const POST = requireAdmin(async (req: NextRequest) => {
  try {
    await connectDB();
    const { programId, position, duration, revealStage } = await req.json();
    
    if (!programId) {
      return NextResponse.json({ error: 'Program ID is required' }, { status: 400 });
    }

    if (!position || ![1, 2, 3].includes(position)) {
      return NextResponse.json({ error: 'Valid position (1, 2, or 3) is required' }, { status: 400 });
    }

    // Mark any unrevealed results for this position as revealed
    const updateRes = await Result.updateMany({ programId, position, revealed: false }, { $set: { revealed: true } });

    // Fetch the complete revealed result set for that position
    const allPositionResults = await Result.find({ programId, position, revealed: true })
      .populate('programId', 'name language category type')
      .populate('teamId', 'name color')
      .sort({ position: 1 });

    if (allPositionResults.length === 0) {
      return NextResponse.json({ error: 'No results found for this position' }, { status: 404 });
    }

    // Check if the program is completed (no more unrevealed results for the entire program)
    const remainingUnrevealed = await Result.countDocuments({ programId, revealed: false });
    if (remainingUnrevealed === 0) {
      await Program.findByIdAndUpdate(programId, { status: 'completed' });
    }

    // Update TVState with presentation expiration
    const displayDuration = duration || 15;
    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + displayDuration * 1000);
    // Use a stable presentationId for the same result so that moving from PLACE to WINNER stage
    // does not cause the TV React component tree to completely unmount and remount.
    const presentationId = `reveal-${programId}-${position}`;

    const state = await TVState.findOneAndUpdate(
      {},
      {
        $set: {
          presentationId,
          presentationType: 'RESULT_REVEAL',
          presentationData: { programId, position, results: allPositionResults, revealStage: revealStage || 'WINNER' },
          presentationStartedAt: startedAt,
          presentationExpiresAt: expiresAt,
          presentationDuration: displayDuration
        }
      },
      { new: true, upsert: true }
    );

    // Emit event
    const io = getIO();
    if (io) {
      // Keep the original event for data payload
      io.emit(SOCKET_EVENTS.POSITION_RESULT_REVEALED, { programId, position, results: allPositionResults });
      
      // Also emit presentation state updated so the central timer picks it up
      io.emit(SOCKET_EVENTS.PRESENTATION_STATE_UPDATED, {
        presentationId,
        presentationType: 'RESULT_REVEAL',
        presentationStartedAt: startedAt,
        presentationExpiresAt: expiresAt,
        presentationDuration: displayDuration
      });
      
      if (updateRes.modifiedCount > 0) {
        io.emit(SOCKET_EVENTS.SCORE_UPDATED); // Tell clients to refetch
      }
      
      if (remainingUnrevealed === 0 && updateRes.modifiedCount > 0) {
        io.emit(SOCKET_EVENTS.PROGRAM_UPDATED, { programId });
      }
    }

    return NextResponse.json({ message: 'Results revealed successfully', results: allPositionResults });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
});
