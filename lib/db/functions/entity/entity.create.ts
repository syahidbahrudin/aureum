import { db } from "../..";
import { entityTable } from "../../schema";

export async function createEntity(entity: typeof entityTable.$inferInsert) {
  return db.insert(entityTable).values(entity).returning({
    id: entityTable.id,
    name: entityTable.name,
    description: entityTable.description,
    createdAt: entityTable.createdAt,
    updatedAt: entityTable.updatedAt,
  });
}
