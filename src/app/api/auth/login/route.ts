export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectDB from '@/lib/db';
import { Admin } from '@/models/Admin';
import { signToken } from '@/lib/auth';
import { cookies } from 'next/headers';

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { username, password } = body;

    if (!username || !password) {
      return NextResponse.json({ error: 'Username and password are required' }, { status: 400 });
    }

    const trimmedUsername = username.trim();

    await connectDB();
    const adminUser = await Admin.findOne({ username: trimmedUsername });

    if (!adminUser) {
      return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
    }

    const isMatch = await bcrypt.compare(password, adminUser.passwordHash);

    if (!isMatch) {
      return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
    }

    const token = await signToken({ username: adminUser.username });

    const cookieStore = await cookies();
    cookieStore.set({
      name: 'admin_session',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 12, // 12 hours
    });

    return NextResponse.json({ success: true });
  } catch (error: unknown) {
    console.error('Login error:', error);
    
    // Check if it's a database connection error
    if (error instanceof Error) {
      const err = error as Error & { code?: string | number };
      if (err.code === 'ECONNREFUSED' || err.name === 'MongooseServerSelectionError' || err.message?.includes('ECONNREFUSED')) {
        return NextResponse.json({ error: 'Unable to connect to the server. Please try again.' }, { status: 503 });
      }
    }
    
    return NextResponse.json({ error: 'Something went wrong. Please try again.' }, { status: 500 });
  }
}
