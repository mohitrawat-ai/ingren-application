// src/lib/db.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import * as schema from './schema';
import { ensureAppInitialized } from "@/lib/config/appInitializer";

// Define the DbClient type
type DbClient = ReturnType<typeof drizzle<typeof schema>>;

// Database instance - initialized to null
let dbInstance: DbClient | null = null;

/**
 * Creates a database client
 */
async function createDbClient(): Promise<DbClient> {
  // Wait for environment variables to be loaded
  await ensureAppInitialized();
  
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
  return drizzle(sql, { schema });
}

/**
 * Gets (or lazily creates) the database instance
 */
export async function getDb(): Promise<DbClient> {
  if (!dbInstance) {
    dbInstance = await createDbClient();
  }
  return dbInstance;
}

// Export the async function as the primary way to access the db
export { getDb as db };