import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db'; // Force HMR reload
import { Program } from '@/models/Program';
import { requireAdmin } from '@/lib/auth';

import { getIO, SOCKET_EVENTS } from '@/lib/socket';
import { PROGRAM_LANGUAGES, PROGRAM_CATEGORIES } from '@/types';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get('status');
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const query: any = status ? { status } : {};
    const programs = await Program.find(query).sort({ programOrder: 1, createdAt: 1 });
    
    return NextResponse.json(programs);
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export const POST = requireAdmin(async (req: NextRequest) => {
  try {
    await connectDB();
    const body = await req.json();
    
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!body.language || !PROGRAM_LANGUAGES.includes(body.language as any)) {
      return NextResponse.json({ error: 'Invalid or missing language' }, { status: 400 });
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if (!body.category || !PROGRAM_CATEGORIES.includes(body.category as any)) {
      return NextResponse.json({ error: 'Invalid or missing age group (category)' }, { status: 400 });
    }
    
    console.log("[PROGRAM CREATE] body.language", body.language);
    
    const program = await Program.create(body);
    
    console.log("[PROGRAM CREATE] saved.language", program.language);
    
    const io = getIO();
    if (io) {
      io.emit(SOCKET_EVENTS.PROGRAM_CREATED, { programId: program._id });
    }
    
    return NextResponse.json(program, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
});
