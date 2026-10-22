import { EntitiesBrowser } from "@/components/entities/entities-browser";
import { listEntities } from "@/lib/db/functions/entity/entity.get";
import type { Entity } from "@/lib/types";

export const instant = false;

export default async function EntitiesPage() {
  let entities: Entity[] = [];
  let loadError: string | null = null;
  try {
    entities = await listEntities();
  } catch (error) {
    console.error(
      "entity list failed",
      error instanceof Error ? error.message : "unknown",
    );
    loadError = "Entities could not be loaded. Check the database connection.";
  }

  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Entities</h1>
        <p className="text-muted-foreground">
          People, organizations, and other entities extracted from archive
          articles. Browse by category.
        </p>
      </div>
      {loadError ? (
        <p role="alert" className="text-sm text-destructive">
          {loadError}
        </p>
      ) : entities.length === 0 ? (
        <p className="text-sm text-muted-foreground">No entities yet.</p>
      ) : (
        <EntitiesBrowser entities={entities} />
      )}
    </div>
  );
}
