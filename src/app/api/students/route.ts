import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Student } from '@/models/Student';
import { Team } from '@/models/Team';

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const teamId = searchParams.get('team');
    
    const query = teamId ? { teamId } : {};
    const students = await Student.find(query).populate('teamId', 'name color').sort({ name: 1 });
    
    return NextResponse.json(students);
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    
    // Validate team exists
    const team = await Team.findById(body.teamId);
    if (!team) {
      return NextResponse.json({ error: 'Invalid team ID' }, { status: 400 });
    }

    const student = await Student.create(body);
    const populatedStudent = await Student.findById(student._id).populate('teamId', 'name color');
    
    return NextResponse.json(populatedStudent, { status: 201 });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
