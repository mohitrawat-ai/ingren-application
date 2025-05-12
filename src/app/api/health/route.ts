// app/api/health/route.ts
import { NextResponse } from 'next/server';
import { db as dbClient} from '@/lib/db'; // Your existing db import
import { sql } from 'drizzle-orm';

const db = await dbClient();


export async function GET() {
  try {
    // Basic service checks
    const checks = {
      database: false,
    };

    // Check database connection
    try {
      // Using your existing DB connection to run a simple query
      await db.execute(sql`SELECT 1`);
      checks.database = true;
    } catch (error) {
      console.error('Database health check failed:', error);
    }

    // Determine overall health status
    const isHealthy = Object.values(checks).every(Boolean);

    // Create response with detailed health information
    const response = {
      status: isHealthy ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      services: checks,
      uptime: process.uptime(),
      environment: process.env.NODE_ENV
    };

    // Return 200 if healthy, 503 if not
    return NextResponse.json(
      response,
      {
        status: isHealthy ? 200 : 503,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
  } catch (error) {
    console.error('Health check failed:', error);
    
    return NextResponse.json(
      {
        status: 'error',
        timestamp: new Date().toISOString(),
        error: 'Internal server error during health check'
      },
      { status: 500 }
    );
  }
}