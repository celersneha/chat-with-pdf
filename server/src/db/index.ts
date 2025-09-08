import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import type { PostgresJsDatabase } from "drizzle-orm/postgres-js";

const isProduction = process.env.NODE_ENV === "production";

let db: PostgresJsDatabase;

if (isProduction) {
  // Supabase (production) config
  const connectionString = process.env.DATABASE_URL!;
  const client = postgres(connectionString, {
    ssl: { rejectUnauthorized: false },
  });
  db = drizzle(client);
} else {
  // Development config - you need to fix this line too
  const connectionString = process.env.DATABASE_URL!;
  const client = postgres(connectionString);
  db = drizzle(client);
}

export { db };
