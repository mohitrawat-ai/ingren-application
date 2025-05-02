import { drizzle } from 'drizzle-orm/postgres-js';
import { migrate } from 'drizzle-orm/postgres-js/migrator';
import postgres from 'postgres';
import path from 'path';
import fs from 'fs';

// For one-time migrations in development/CI environments
async function main() {
  console.log('Running migrations...');
  
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is not set');
  }

  const pemPath = path.join(process.cwd(), 'certs', 'us-east-1-bundle.pem');


  // Read the CA certificate
  const ca = fs.readFileSync(pemPath).toString();

// Create the postgres.js client with SSL options
const queryClient = postgres(process.env.DATABASE_URL!, {
  ssl: {
    ca: ca,
    rejectUnauthorized: true
  }
});

// Initialize Drizzle with the postgres.js client
 const db = drizzle(queryClient);

  const migrationsFolder = path.join(process.cwd(), "drizzle/migrations");

  
  await migrate(db, { migrationsFolder: migrationsFolder });
  
  console.log('Migrations completed successfully');
  process.exit(0);
}

main().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});