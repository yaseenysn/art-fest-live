import { NextRequest, NextResponse } from 'next/server';
import { getIO, SOCKET_EVENTS } from '@/lib/socket';
import { requireAdmin } from '@/lib/auth';
import connectDB from '@/lib/db';
import { TVState } from '@/models/TVState';

export const POST = requireAdmin(async (req: NextRequest) => {
  try {
    await connectDB();
    const { programId, position } = await req.json();
    
    if (!programId) {
      return NextResponse.json({ error: 'Program ID is required' }, { status: 400 });
    }

    if (!position || ![1, 2, 3].includes(position)) {
      return NextResponse.json({ error: 'Valid position (1, 2, or 3) is required' }, { status: 400 });
    }

    await TVState.findOneAndUpdate(
      {},
      {
        $set: {
          presentationType: null,
          presentationStartedAt: null,
          presentationExpiresAt: null,
          presentationDuration: null,
          presentationData: null
        }
      },
      { new: true, upsert: true }
    );

    // Emit event to end the reveal on TV
    const io = getIO();
    if (io) {
      io.emit(SOCKET_EVENTS.POSITION_REVEAL_ENDED, { programId, position });
      io.emit(SOCKET_EVENTS.PRESENTATION_STATE_UPDATED, {
        presentationType: null,
        presentationStartedAt: null,
        presentationExpiresAt: null,
        presentationDuration: null,
        presentationData: null
      });
    }

    return NextResponse.json({ message: 'Reveal ended successfully' });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
});
