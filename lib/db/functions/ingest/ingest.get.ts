import { eq, isNull } from "drizzle-orm";
import { db } from "../..";
import { ingestTable } from "../../schema";

export const getActiveUrls = async () => {
  return await db
    .select()
    .from(ingestTable)
    .where((eq(ingestTable.status, "active"), isNull(ingestTable.deletedAt)));
};
export const getActiveUrl = async () => {
  return (
    await db
    .select().from(ingestTable)
    .where(eq(ingestTable.status, "active")),
    isNull(ingestTable.deletedAt)
  );
};


