import postgres from "postgres";
import * as dotenv from "dotenv";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

dotenv.config();

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

// Create PostgreSQL connection using `postgres` package
const psqlConnector = postgres({
  host,
  port,
  database,
  username: user,
  password,
  ssl: ssl ? { rejectUnauthorized: false } : undefined, // Handle SSL mode correctly
});

// Export the db instance for use in other files
export const db = drizzle(psqlConnector);

async function drizzleMigrator() {
<<<<<<< HEAD
=======
  console.log("Running Drizzle migrations...");
>>>>>>> 4ad0352 (the database is now working ( 2 databases created in postgres - .env variables updated - seeders/connectors/migrator/drizzle.config.ts are edited - migrate + generate + seed ))
  await migrate(drizzle(psqlConnector), {
    migrationsFolder: "app/db/drizzle/migrations",
  });

<<<<<<< HEAD
  // await psqlConnector.end();
=======
  console.log("Migrations completed successfully!");
  await psqlConnector.end();
>>>>>>> 4ad0352 (the database is now working ( 2 databases created in postgres - .env variables updated - seeders/connectors/migrator/drizzle.config.ts are edited - migrate + generate + seed ))
}

// Run migration
drizzleMigrator().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
