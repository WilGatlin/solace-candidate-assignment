import { drizzle, PostgresJsDatabase } from "drizzle-orm/postgres-js";
import postgres, { Postgres } from "postgres";

// Type for the client
let db: PostgresJsDatabase | null = null;

const setup = (): PostgresJsDatabase | null => {
  if (db) return db;

  if (!process.env.DATABASE_URL) {
    console.error("DATABASE_URL is not set");
    return null;
  }

  const queryClient: Postgres = postgres(process.env.DATABASE_URL);

  db = drizzle(queryClient);

  return db;
};

const client = setup();
export default client;
