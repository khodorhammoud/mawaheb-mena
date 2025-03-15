import { Config, defineConfig } from "drizzle-kit";
import dotenv from "dotenv";

dotenv.config(); // Load .env file

if (!process.env.DATABASE_URL) {
  throw new Error("Missing DATABASE_URL environment variable");
}

// Parse DATABASE_URL
const url = new URL(process.env.DATABASE_URL);
const host = url.hostname;
const port = parseInt(url.port || "5432");
const database = url.pathname.substring(1); // Remove leading slash
const user = url.username;
const password = url.password;
const ssl = url.searchParams.get("sslmode") === "require";

export default defineConfig({
  schema: "./app/db/drizzle/schemas/schema.ts", // ✅ UPDATED PATH TO MATCH YOUR FILE LOCATION
  out: "./app/db/drizzle/migrations", // ✅ UPDATED PATH TO MATCH YOUR FILE LOCATION
  dialect: "postgresql",
  dbCredentials: {
    host,
    port,
    database,
    user,
    password,
    ssl,
  },
  verbose: true,
  strict: true,
} satisfies Config);
