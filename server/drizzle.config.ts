import { config as dotenvConfig } from "dotenv";
dotenvConfig({ path: ".env.production" });
import { defineConfig } from "drizzle-kit";

const config =
  process.env.NODE_ENV === "production"
    ? defineConfig({
        schema: "./src/db/schema/*",
        out: "./supabase/migrations",
        dialect: "postgresql",
        dbCredentials: {
          url: process.env.DATABASE_URL!,
          ssl: { rejectUnauthorized: false },
        },
      })
    : defineConfig({
        out: "./drizzle",
        schema: "./src/db/schema/*",
        dialect: "postgresql",
        dbCredentials: {
          url: process.env.DATABASE_URL!,
          ssl: { rejectUnauthorized: false },
        },
      });

export default config;
