import { eq } from "drizzle-orm";
import { db } from "../..";
import { entityTable } from "../../schema";

export async function deleteEntity(id: number) {
  return db.delete(entityTable).where(eq(entityTable.id, id)).returning({
      id: entityTable.id,
    });
}