import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Team } from '@/models/Team';
import { requireAdmin } from '@/lib/auth';
import { getIO, SOCKET_EVENTS } from '@/lib/socket';

export async function GET() {
  try {
    await connectDB();
    const teams = await Team.find({}).sort({ name: 1 });
    return NextResponse.json(teams);
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export const POST = requireAdmin(async (req: NextRequest) => {
  try {
    const body = await req.json();
    let { name, shortName } = body;
    const { color } = body;

    if (!name || typeof name !== 'string') {
      return NextResponse.json({ error: 'Team name is required.' }, { status: 400 });
    }

    name = name.trim();
    if (name.length < 2) {
      return NextResponse.json({ error: 'Team name must be at least 2 characters.' }, { status: 400 });
    }

    if (!color || typeof color !== 'string') {
      return NextResponse.json({ error: 'Team color is required.' }, { status: 400 });
    }

    shortName = shortName ? shortName.trim() : undefined;

    await connectDB();

    // Application-level duplicate check (case-insensitive) using regex matching collation
    const existingTeam = await Team.findOne({ name: { $regex: `^${name}$`, $options: 'i' } });
    if (existingTeam) {
      return NextResponse.json({ error: 'A team with this name already exists.' }, { status: 409 });
    }

    // Slug generation based on name (if we still need slug for older features)
    let slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    let slugExists = await Team.findOne({ slug });
    let counter = 1;
    while (slugExists) {
      slug = `${slug}-${counter}`;
      slugExists = await Team.findOne({ slug });
      counter++;
    }

    const team = await Team.create({
      name,
      shortName,
      color,
      slug,
    });

    const io = getIO();
    if (io) {
      io.emit(SOCKET_EVENTS.TEAM_CREATED, team);
    }

    return NextResponse.json({ success: true, team }, { status: 201 });
  } catch (error: unknown) {
    console.error('POST /api/teams error:', error);
    if (error instanceof Error) {
      const err = error as Error & { code?: string | number };
      if (err.code === 11000) {
        return NextResponse.json({ error: 'A team with this name already exists.' }, { status: 409 });
      }
      return NextResponse.json({ error: err.message || 'Failed to create team.' }, { status: 500 });
    }
    return NextResponse.json({ error: 'Failed to create team.' }, { status: 500 });
  }
});
