// db.ts
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import fs from 'fs';
import path from 'path';
import * as schema from './schema';

// Read the CA certificate
const pemPath = path.join(process.cwd(), 'certs', 'us-east-1-bundle.pem');

const ca = fs.readFileSync(pemPath).toString();

// Create postgres.js client with connection pool settings
const sql = postgres(process.env.DATABASE_URL!, {
  // Connection pool settings
  max: 10,               // Maximum number of connections
  idle_timeout: 20,      // Max seconds a client can be idle before being removed
  connect_timeout: 10,   // Max seconds to wait for connection
  
  // SSL settings for AWS RDS
  ssl: {
    ca: ca,
    rejectUnauthorized: true
  },
  
  // Other useful options
  types: {               // Custom type parsers
    date: {
      to: 1184,          // Convert 'date' to postgres type OID
      from: [1082, 1083, 1114, 1184], // Convert from postgres types
      serialize: (date: Date) => date.toISOString(),
      parse: (str: string) => new Date(str),
    },
  },
  
  // Debug mode (remove in production)
  debug: process.env.NODE_ENV === 'development',
  
  // Disable prepared statements if needed (required for some AWS environments)
  // prepared: false,
});

// Initialize Drizzle with the postgres.js client
export const db = drizzle(sql, {schema: schema});

// Export sql client for direct queries if needed
export { sql };