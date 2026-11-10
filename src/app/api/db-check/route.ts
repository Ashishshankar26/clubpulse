import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        {
          connected: false,
          error: 'MONGODB_URI is not defined in .env.local',
        },
        { status: 400 }
      );
    }

    const start = Date.now();
    await connectToDatabase();
    const duration = Date.now() - start;

    const state = mongoose.connection.readyState;
    const stateMap: Record<number, string> = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting',
    };

    const host = mongoose.connection.host || 'unknown';
    const dbName = mongoose.connection.name || 'default';

    return NextResponse.json({
      connected: state === 1,
      status: stateMap[state] || 'unknown',
      database: dbName,
      host,
      pingMs: duration,
      message: 'MongoDB Atlas connection established successfully!',
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Unknown database error';
    return NextResponse.json(
      {
        connected: false,
        error: message,
      },
      { status: 500 }
    );
  }
}
