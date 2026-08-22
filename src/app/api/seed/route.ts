import { NextResponse } from 'next/server';
import connectDB from '@/lib/db';
import { Team } from '@/models/Team';
import { Student } from '@/models/Student';
import { Program } from '@/models/Program';
import { Result } from '@/models/Result';
import { Admin } from '@/models/Admin';
import bcrypt from 'bcryptjs';
import { getIO, SOCKET_EVENTS } from '@/lib/socket';
import { getTeamRankings } from '@/lib/rankings';

const TEAMS = [
  { name: 'Team A', slug: 'team-a', color: '#10B981' }, // Emerald
  { name: 'Team B', slug: 'team-b', color: '#3B82F6' }, // Blue
  { name: 'Team C', slug: 'team-c', color: '#F59E0B' }, // Amber
  { name: 'Team D', slug: 'team-d', color: '#F43F5E' }, // Rose
];

const PROGRAMS = [
  { name: 'Quran Recitation', language: 'Arabic', category: 'Senior', maxPoints: 10, status: 'live' },
  { name: 'Hifz', language: 'Arabic', category: 'Junior', maxPoints: 10, status: 'upcoming' },
  { name: 'Malayalam Speech', language: 'Malayalam', category: 'Senior', maxPoints: 10, status: 'completed' },
  { name: 'Arabic Speech', language: 'Arabic', category: 'Senior', maxPoints: 10, status: 'upcoming' },
  { name: 'Quiz', language: 'English', category: 'Sub Junior', maxPoints: 20, status: 'upcoming' },
];

// STUDENTS array removed since they are no longer used

export async function POST() {
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Seed endpoint is disabled in production.' }, { status: 403 });
  }

  try {
    await connectDB();

    // Clear existing data (optional, but good for seed)
    await Team.deleteMany({});
    await Student.deleteMany({});
    await Program.deleteMany({});
    await Result.deleteMany({});

    // Seed Teams
    const createdTeams = await Team.insertMany(TEAMS);

    // Students no longer seeded in DB for results since we use studentName string


    // Seed Programs
    const createdPrograms = await Program.insertMany(PROGRAMS);

    // Seed Admin
    await Admin.deleteMany({});
    const adminUser = process.env.ADMIN_USERNAME || 'admin';
    const adminPass = process.env.ADMIN_PASSWORD || 'adminpassword';
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(adminPass, salt);
    await Admin.create({ username: adminUser, passwordHash });

    // Create a sample result set for "Malayalam Speech" (completed)
    const malSpeech = createdPrograms.find(p => p.name === 'Malayalam Speech');
    if (malSpeech) {
      await Result.insertMany([
        {
          programId: malSpeech._id,
          studentName: 'Muhammad',
          teamId: createdTeams[0]._id,
          position: 1,
          points: 10,
          revealed: true
        },
        {
          programId: malSpeech._id,
          studentName: 'Afnan',
          teamId: createdTeams[1]._id,
          position: 2,
          points: 7,
          revealed: true
        },
        {
          programId: malSpeech._id,
          studentName: 'Shamil',
          teamId: createdTeams[2]._id,
          position: 3,
          points: 5,
          revealed: true
        }
      ]);
    }

    // Recalculate and emit
    const rankings = await getTeamRankings();
    const io = getIO();
    if (io) {
      io.emit(SOCKET_EVENTS.SCORE_UPDATED, rankings);
    }

    return NextResponse.json({ message: 'Database seeded successfully!' });
  } catch (error: unknown) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
