import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import connectDB from '@/lib/db';
import { Program } from '@/models/Program';
import { requireAdmin } from '@/lib/auth';
import { getIO, SOCKET_EVENTS } from '@/lib/socket';

export const POST = requireAdmin(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    await connectDB();
    const { id } = await params;

    // Validate ObjectID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid program ID' }, { status: 400 });
    }

    const currentProgram = await Program.findById(id);
    if (!currentProgram) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }

    // Atomically increment posterCount and set posterCreated
    const updatedProgram = await Program.findByIdAndUpdate(
      id,
      {
        $inc: { posterCount: 1 },
        $set: { posterCreated: true, posterCreatedAt: new Date() }
      },
      { new: true }
    );

    const io = getIO();
    if (io) {
      io.emit(SOCKET_EVENTS.PROGRAM_UPDATED, { programId: id });
    }

    return NextResponse.json({ success: true, program: updatedProgram });
  } catch (error: unknown) {
    console.error('Error tracking poster:', error);
    return NextResponse.json({ error: 'Failed to track poster generation' }, { status: 500 });
  }
});
