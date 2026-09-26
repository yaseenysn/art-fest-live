import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import { Program } from '@/models/Program';
import { requireAdmin } from '@/lib/auth';
import { getIO, SOCKET_EVENTS } from '@/lib/socket';

export const PATCH = requireAdmin(async (req: NextRequest) => {
  try {
    await connectDB();
    const body = await req.json();
    const { programIds } = body;

    if (!Array.isArray(programIds) || programIds.length === 0) {
      return NextResponse.json({ error: 'programIds must be a non-empty array of program IDs.' }, { status: 400 });
    }

    // Validate that all programIds are valid ObjectIds
    for (const id of programIds) {
      if (!mongoose.Types.ObjectId.isValid(id)) {
        return NextResponse.json({ error: `Invalid program ID format: ${id}` }, { status: 400 });
      }
    }

    // Update programOrder for each program sequentially (1-based index)
    const bulkOps = programIds.map((id: string, index: number) => ({
      updateOne: {
        filter: { _id: id },
        update: { $set: { programOrder: index + 1 } }
      }
    }));

    await Program.bulkWrite(bulkOps);

    // Fetch updated programs sorted by programOrder
    const updatedPrograms = await Program.find({}).sort({ programOrder: 1, createdAt: 1 });

    const io = getIO();
    if (io) {
      io.emit(SOCKET_EVENTS.PROGRAM_UPDATED, { type: 'reorder' });
    }

    return NextResponse.json({ success: true, programs: updatedPrograms });
  } catch (error: unknown) {
    console.error('PATCH /api/programs/reorder error:', error);
    return NextResponse.json({ error: (error as Error).message || 'Failed to reorder programs.' }, { status: 500 });
  }
});
