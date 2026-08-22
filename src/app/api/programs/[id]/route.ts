import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose'; // Force HMR reload
import connectDB from '@/lib/db';
import { Program } from '@/models/Program';
import { requireAdmin } from '@/lib/auth';
import { getIO, SOCKET_EVENTS } from '@/lib/socket';
import { PROGRAM_LANGUAGES, PROGRAM_CATEGORIES } from '@/types';

export const PUT = requireAdmin(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    
    // Validate ObjectID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid program ID' }, { status: 400 });
    }

    const currentProgram = await Program.findById(id);
    if (!currentProgram) {
      return NextResponse.json({ error: 'Program not found' }, { status: 404 });
    }
    
    // Validate language
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (body.language && !PROGRAM_LANGUAGES.includes(body.language as any)) {
      return NextResponse.json({ error: 'Invalid language' }, { status: 400 });
    }
    
    // Validate category (Legacy Safe)
    if (body.category && body.category !== currentProgram.category) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!PROGRAM_CATEGORIES.includes(body.category as any)) {
        return NextResponse.json({ error: 'Invalid category / age group' }, { status: 400 });
      }
    }

    // Validation: UPCOMING -> LIVE
    if (body.status === 'live' && currentProgram.status !== 'live') {
      const program = await Program.findByIdAndUpdate(id, body, { new: true });
      
      const io = getIO();
      if (io) {
        io.emit(SOCKET_EVENTS.PROGRAM_UPDATED, { programId: id });
      }
      
      return NextResponse.json(program);
    }

    // Validation: LIVE -> COMPLETED
    if (body.status === 'completed' && currentProgram.status === 'live') {
      // Must have results completely revealed
      let Result;
      try {
        Result = mongoose.models.Result || (await import('@/models/Result')).Result;
      } catch {
        Result = (await import('@/models/Result')).Result;
      }
      
      const results = await Result.find({ programId: id });
      if (results.length !== 3 || !results.every((r: { revealed: boolean }) => r.revealed)) {
        return NextResponse.json({ error: 'Reveal the result before completing this program.' }, { status: 400 });
      }
    }

    // Generic update
    const program = await Program.findByIdAndUpdate(id, body, { new: true });
    
    const io = getIO();
    if (io) {
      io.emit(SOCKET_EVENTS.PROGRAM_UPDATED, { programId: id });
    }
    
    return NextResponse.json(program);
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
});

export const DELETE = requireAdmin(async (req: NextRequest, { params }: { params: Promise<{ id: string }> }) => {
  try {
    await connectDB();
    const { id } = await params;

    // Validate ObjectID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: 'Invalid program ID' }, { status: 400 });
    }
    
    let Result;
    try {
      Result = mongoose.models.Result || (await import('@/models/Result')).Result;
    } catch {
      Result = (await import('@/models/Result')).Result;
    }
    
    // Use transaction for safe cascade delete
    let session = null;
    try {
      session = await mongoose.startSession();
      session.startTransaction();
    } catch {
      console.warn("Transactions not supported, proceeding without transaction");
      session = null;
    }
    
    try {
      // 1. Delete all results belonging to this program
      if (session) {
        await Result.deleteMany({ programId: id }).session(session);
      } else {
        await Result.deleteMany({ programId: id });
      }
      
      // 2. Delete the program
      let program;
      if (session) {
        program = await Program.findByIdAndDelete(id).session(session);
      } else {
        program = await Program.findByIdAndDelete(id);
      }
      
      if (!program) {
        if (session) {
          await session.abortTransaction();
          session.endSession();
        }
        return NextResponse.json({ error: 'Program not found' }, { status: 404 });
      }
      
      // 3. Commit transaction
      if (session) {
        await session.commitTransaction();
        session.endSession();
      }
      
      // 4. Emit socket event
      const io = getIO();
      if (io) {
        io.emit(SOCKET_EVENTS.PROGRAM_DELETED, { programId: id });
      }
      
      return NextResponse.json({ success: true, deletedProgramId: id, message: 'Program deleted safely' }, { status: 200 });
      
    } catch (err: unknown) {
      if (session) {
        try {
          await session.abortTransaction();
          session.endSession();
        } catch {
          // ignore abort errors
        }
      }
      throw err;
    }
    
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message || 'Failed to delete program safely.' }, { status: 500 });
  }
});
