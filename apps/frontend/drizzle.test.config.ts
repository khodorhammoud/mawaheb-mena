import { Config, defineConfig } from 'drizzle-kit';
import { config } from 'dotenv';
import * as path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Get current directory
const currentDir = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(currentDir, '../../'); // Go up to project root

// Load test environment variables
config({ path: path.resolve(currentDir, '.env.test') });

// Ensure the test database URL is available
if (!process.env.DATABASE_URL) {
  throw new Error('Missing DATABASE_URL environment variable for test database');
}

// Parse database connection URL
const url = new URL(process.env.DATABASE_URL);
const dbCredentials = {
  host: url.hostname,
  database: url.pathname.substring(1),
  user: url.username,
  password: url.password,
  port: parseInt(url.port) || 5433, // Use test DB port
  ssl: false, // Typically no SSL for local test DB
};

// Check which schema file exists
const tsSchemaPath = path.resolve(projectRoot, 'packages/db/src/schema/schema.ts');
const jsSchemaPath = path.resolve(projectRoot, 'packages/db/dist/schema/schema.js');

const schemaPath = fs.existsSync(tsSchemaPath)
  ? tsSchemaPath
  : fs.existsSync(jsSchemaPath)
    ? jsSchemaPath
    : null;

if (!schemaPath) {
  console.error('Schema file not found at either:', tsSchemaPath, 'or', jsSchemaPath);
  // Using the TypeScript path as fallback
  // This will fail, but at least with a clear error message
}

export default defineConfig({
  // Use the schema from the shared package - use absolute path for reliability
  schema: schemaPath || tsSchemaPath,
  out: path.resolve(currentDir, './app/db/drizzle/test-migrations'),
  dialect: 'postgresql',
  dbCredentials,
  verbose: true,
  strict: true,
} satisfies Config);
