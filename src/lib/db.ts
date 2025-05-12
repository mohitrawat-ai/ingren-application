// src/lib/db.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import * as schema from './schema';
import { ensureAppInitialized } from "@/lib/config/appInitializer";

// Create a lazy-loading DB function that ensures initialization
let dbInstance: ReturnType<typeof createDbClient> | null = null;

function createDbClient() {
  // Read the CA certificate
  const pemPath = path.join(process.cwd(), 'certs', 'us-east-1-bundle.pem');
  const ca = fs.readFileSync(pemPath).toString();

  // Create postgres.js client with connection pool settings
  const sql = postgres(process.env.DATABASE_URL!, {
    max: 10,
    idle_timeout: 20,
    connect_timeout: 10,
    ssl: {
      ca: ca,
      rejectUnauthorized: true
    },
    types: {
      date: {
        to: 1184,
        from: [1082, 1083, 1114, 1184],
        serialize: (date: Date) => date.toISOString(),
        parse: (str: string) => new Date(str),
      },
    },
    debug: process.env.NODE_ENV === 'development',
  });

  // Initialize Drizzle with the postgres.js client
  return drizzle(sql, {schema: schema});
}

// Export an async function to get DB that ensures initialization
export async function getDb() {
  // Ensure app initialization has completed
  await ensureAppInitialized();
  
  // Create DB instance if needed
  if (!dbInstance) {
    dbInstance = createDbClient();
  }
  
  return dbInstance;
}

// For compatibility with existing code
export const db = createDbClient();
