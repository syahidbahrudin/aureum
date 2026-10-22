import { and, eq, isNull, lte, sql, type SQL } from "drizzle-orm";
import { db } from "@/lib/db";
import { ingestTable } from "@/lib/db/schema";

const active = and(eq(ingestTable.status, "active"), isNull(ingestTable.deletedAt));

function claim(where: SQL | undefined, limit?: number) {
  const selected = db
    .select({ id: ingestTable.id })
    .from(ingestTable)
    .where(where)
    .orderBy(ingestTable.nextRunAt);
  const rows = (limit ? selected.limit(limit) : selected).for("update", {
    skipLocked: true,
  });

  return db
    .update(ingestTable)
    .set({
      lastRunAt: sql`now()`,
      nextRunAt: sql`now() + make_interval(secs => ${ingestTable.interval})`,
      updatedAt: sql`now()`,
    })
    .where(sql`${ingestTable.id} in (${rows})`)
    .returning({ id: ingestTable.id });
}

export function claimDueIngest(limit = 20) {
  return claim(and(active, lte(ingestTable.nextRunAt, sql`now()`)), limit);
}

export function claimAllIngest() {
  return claim(active);
}