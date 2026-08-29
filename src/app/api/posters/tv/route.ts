import { NextRequest, NextResponse } from 'next/server';
import { getIO, SOCKET_EVENTS } from '@/lib/socket';
import { requireAdmin } from '@/lib/auth';
import { TVState } from '@/models/TVState';
import connectDB from '@/lib/db';

const ALLOWED_DURATIONS = [5, 10, 15, 30];
// Max base64 string length for ~1MB image is roughly 1.4 million characters. We'll set limit to 1.5M.
const MAX_URL_LENGTH = 1500000;

export const POST = requireAdmin(async (req: NextRequest) => {
  try {
    await connectDB();
    const body = await req.json();
    const { posterUrl, duration } = body;

    if (!posterUrl || typeof posterUrl !== 'string') {
      return NextResponse.json({ error: 'Poster URL is required.' }, { status: 400 });
    }

    if (!posterUrl.startsWith('data:image/jpeg;base64,')) {
      return NextResponse.json({ error: 'Invalid image format. Expected JPEG data URL.' }, { status: 400 });
    }

    if (posterUrl.length > MAX_URL_LENGTH) {
      return NextResponse.json({ error: 'Poster image is too large. Please try again.' }, { status: 400 });
    }

    const parsedDuration = Number(duration);
    // Allow wider range for consistency with the new system, fallback to 15s if missing or invalid
    const displayDuration = (parsedDuration >= 5 && parsedDuration <= 300) ? parsedDuration : 15;

    const startedAt = new Date();
    const expiresAt = new Date(startedAt.getTime() + displayDuration * 1000);
    const presentationId = crypto.randomUUID();

    const state = await TVState.findOneAndUpdate(
      {},
      {
        $set: {
          presentationId,
          presentationType: 'POSTER',
          presentationData: { url: posterUrl, duration: displayDuration },
          presentationStartedAt: startedAt,
          presentationExpiresAt: expiresAt,
          presentationDuration: displayDuration
        }
      },
      { new: true, upsert: true }
    );

    const io = getIO();
    if (io) {
      io.emit(SOCKET_EVENTS.POSTER_SHOWN, { url: posterUrl, duration: displayDuration });
      io.emit(SOCKET_EVENTS.PRESENTATION_STATE_UPDATED, {
        presentationId,
        presentationType: 'POSTER',
        presentationStartedAt: startedAt,
        presentationExpiresAt: expiresAt,
        presentationDuration: displayDuration
      });
    } else {
      return NextResponse.json({ error: 'Live connection is currently unavailable.' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: 'Failed to process request.' }, { status: 500 });
  }
});
