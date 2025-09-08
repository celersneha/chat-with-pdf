import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
const isProduction = process.env.NODE_ENV === "production";

let db;

if (isProduction) {
  // Supabase (production) config

  const connectionString = process.env.DATABASE_URL!;
  const client = postgres(connectionString, { prepare: false });
  db = drizzle(client);
} else {
  db = drizzle(process.env.DATABASE_URL!);
}

export { db };
