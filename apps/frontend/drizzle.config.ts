import { Config, defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config();

interface PoolConfig {
  PGHOST: string;
  PGDATABASE: string;
  PGUSER: string;
  PGPASSWORD: string;
  ENDPOINT_ID: string;
}

// Configuration options for database connection
let dbCredentials;

// Check if DATABASE_URL is available (for local development)
if (process.env.DATABASE_URL) {
  try {
    // Parse the URL manually to ensure correct extraction of credentials
    const url = new URL(process.env.DATABASE_URL);
    const user = url.username;
    const password = url.password;
    const host = url.hostname;
    const port = parseInt(url.port) || 5432;
    const database = url.pathname.substring(1); // Remove leading '/'

    dbCredentials = {
      host,
      database,
      user,
      password,
      port,
      ssl: url.searchParams.get("sslmode") === "require",
    };
  } catch (error) {
    console.error("Error parsing DATABASE_URL:", error);
    throw new Error("Invalid DATABASE_URL format");
  }
} else {
  // Fallback to individual environment variables
  const { PGHOST, PGDATABASE, PGUSER, PGPASSWORD, ENDPOINT_ID }: PoolConfig =
    process.env as unknown as PoolConfig;

  if (!PGHOST || !PGDATABASE || !PGUSER || !PGPASSWORD || !ENDPOINT_ID) {
    throw new Error("Missing db connection environment variables");
  }

  dbCredentials = {
    host: PGHOST,
    database: PGDATABASE,
    user: PGUSER,
    password: PGPASSWORD,
    port: 5432,
    ssl: true,
  };
}

export default defineConfig({
  schema: "./app/db/drizzle/schemas/schema.ts",
  out: "./app/db/drizzle/migrations",
  dialect: "postgresql",
  dbCredentials,
  verbose: true,
  strict: true,
} satisfies Config);
