import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Announcement } from '@/models/Announcement';
import { TVState } from '@/models/TVState';
import { getIO, SOCKET_EVENTS } from '@/lib/socket';
import { requireAdmin } from '@/lib/auth';

export const POST = requireAdmin(async (req: NextRequest) => {
  try {
    await connectDB();
    const body = await req.json();
    
    const announcement = await Announcement.create(body);
    
    const displayDuration = announcement.duration || 10;
    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + displayDuration * 1000);

    await TVState.findOneAndUpdate(
      {},
      {
        $set: {
          presentationType: 'ANNOUNCEMENT',
          presentationData: announcement,
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
      io.emit(SOCKET_EVENTS.ANNOUNCEMENT_SHOWN, announcement);
      io.emit(SOCKET_EVENTS.PRESENTATION_STATE_UPDATED, {
        presentationType: 'ANNOUNCEMENT',
        presentationStartedAt: startedAt,
        presentationExpiresAt: expiresAt,
        presentationDuration: displayDuration
      });
    }
    
    return NextResponse.json(announcement, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
});
