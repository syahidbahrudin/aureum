import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

const url = process.env.DATABASE_URL;
if (!url) throw new Error("DATABASE_URL is not set");

const globalForDb = globalThis as unknown as {
  postgres?: ReturnType<typeof postgres>;
};

// ponytail: 8 — page reads and ingest jobs share this process. Raise if the pooler starts refusing connections.
const client = globalForDb.postgres ?? postgres(url, { prepare: false, max: 8 });

if (process.env.NODE_ENV !== "production") globalForDb.postgres = client;

export const db = drizzle({ client });
