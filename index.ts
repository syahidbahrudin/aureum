import "dotenv/config";
import { sql } from "drizzle-orm";

import { db } from "./lib/db";

async function main() {
  const rows = await db.execute(sql`select 1 as ok`);
  console.log(rows);
  await db.$client.end();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
