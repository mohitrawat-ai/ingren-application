import type { Config } from 'drizzle-kit';
import fs from 'fs';
import path from 'path';


export default {
  // Path to your schema file
  schema: './src/lib/schema/index.ts',
  
  // Directory where migrations will be stored
  out: './drizzle/migrations',
  
  // Specify 'pg' as the driver for PostgreSQL
  dialect: 'postgresql',
  
  // Database connection details
  dbCredentials: {
    // Use connection string from environment variable
    url: process.env.DATABASE_URL!,
    // Alternatively, you can specify individual connection parameters:
    // host: process.env.DB_HOST,
    // port: parseInt(process.env.DB_PORT || '5432'),
    // user: process.env.DB_USER,
    // password: process.env.DB_PASSWORD,
    // database: process.env.DB_NAME,
    
    // SSL configuration for production (especially important for services like Vercel)
    ssl: {
      rejectUnauthorized: true,
      ca: fs.readFileSync(path.join(__dirname, "./certs/us-east-1-bundle.pem")).toString(),
    },
  },

  // Table naming configuration
  tablesFilter: ['!_migrations'], // Exclude migration tables from schema generation
  
  // Enable verbose logging for debugging
  verbose: true,
  
  // Enforce strict mode for better type safety
  strict: true
} satisfies Config;