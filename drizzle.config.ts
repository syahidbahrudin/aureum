import { defineConfig } from "drizzle-kit";

const url = process.env.DIRECT_URL;
if (!url) throw new Error("DIRECT_URL is not set");

export default defineConfig({
  dialect: "postgresql",
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dbCredentials: { url },
});
