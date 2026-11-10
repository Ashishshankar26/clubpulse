import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import mongoose from 'mongoose';

export async function GET() {
  const startTime = Date.now();
  let dbStatus = 'disconnected';
  let dbPingMs = 0;

  try {
    const t0 = Date.now();
    await connectToDatabase();
    dbPingMs = Date.now() - t0;
    const state = mongoose.connection.readyState;
    dbStatus = state === 1 ? 'connected' : 'connecting';
  } catch (err) {
    dbStatus = 'error';
  }

  return NextResponse.json({
    status: dbStatus === 'connected' ? 'healthy' : 'degraded',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus,
      host: mongoose.connection.host || 'unknown',
      name: mongoose.connection.name || 'clubpulse',
      pingMs: dbPingMs,
    },
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
  });
}

