import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Result } from '@/models/Result';
import { Program } from '@/models/Program';
import { Team } from '@/models/Team';
import { Student } from '@/models/Student';
import { Announcement } from '@/models/Announcement';
import { getIO, SOCKET_EVENTS } from '@/lib/socket';
import { requireAdmin } from '@/lib/auth';

export const POST = requireAdmin(async () => {
  try {
    await connectDB();
    
    // Verify DB connectivity
    if (mongoose.connection.readyState !== 1) {
      throw new Error("Database connection is not ready.");
    }
    
    let useTransaction = false;
    let session = null;
    
    try {
      session = await mongoose.startSession();
      session.startTransaction();
      useTransaction = true;
    } catch (e) {
      console.warn("MongoDB transactions not supported, falling back to sequential deletion.", e);
    }

    try {
      const options = useTransaction && session ? { session } : {};
      
      const resultsDeleted = await Result.deleteMany({}, options);
      const programsDeleted = await Program.deleteMany({}, options);
      const teamsDeleted = await Team.deleteMany({}, options);
      const studentsDeleted = await Student.deleteMany({}, options);
      const announcementsDeleted = await Announcement.deleteMany({}, options);

      if (useTransaction && session) {
        await session.commitTransaction();
      }

      console.log(`[EVENT RESET] Programs: ${programsDeleted.deletedCount}, Teams: ${teamsDeleted.deletedCount}, Results: ${resultsDeleted.deletedCount}, Students: ${studentsDeleted.deletedCount}, Announcements: ${announcementsDeleted.deletedCount}`);
    } catch (dbError) {
      if (useTransaction && session) {
        await session.abortTransaction();
      }
      throw new Error(`Database deletion failed: ${(dbError as Error).message}`);
    } finally {
      if (session) {
        session.endSession();
      }
    }
    
    const io = getIO();
    if (io) {
      io.emit(SOCKET_EVENTS.EVENT_RESET, { resetAt: new Date().toISOString() });
    }
    
    return NextResponse.json({ success: true, message: 'Event reset successfully' });
  } catch (error: unknown) {
    console.error("Event Reset Error:", error);
    return NextResponse.json({ error: (error as Error).message || "Event reset failed. No successful reset was reported." }, { status: 500 });
  }
});
