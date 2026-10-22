"use client";

import type { Entity } from "@/lib/types";
import { EntityCard } from "@/components/entities/entity-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { portraitCardGridClass } from "@/lib/card-layout";
import { entityCategoryLabel } from "@/lib/entity-categories";

type EntitiesBrowserProps = {
  entities: Entity[];
};

function tabsFor(entities: Entity[]) {
  const categories = [...new Set(entities.map((entity) => entity.category))].sort();
  return [
    { value: "all", label: "All" },
    ...categories.map((value) => ({
      value,
      label: entityCategoryLabel(value),
    })),
  ];
}

function filterEntities(entities: Entity[], tab: string): Entity[] {
  if (tab === "all") return entities;
  return entities.filter((entity) => entity.category === tab);
}

export function EntitiesBrowser({ entities }: EntitiesBrowserProps) {
  const tabs = tabsFor(entities);
  return (
    <Tabs defaultValue="all" className="gap-4">
      <TabsList className="flex! h-auto! w-full flex-wrap items-start justify-start gap-1 py-1 group-data-horizontal/tabs:h-auto!">
        {tabs.map((tab) => {
          const count =
            tab.value === "all"
              ? entities.length
              : entities.filter((e) => e.category === tab.value).length;
          return (
            <TabsTrigger key={tab.value} value={tab.value} className="h-8! flex-none">
              {tab.label}
              <span className="text-muted-foreground tabular-nums">({count})</span>
            </TabsTrigger>
          );
        })}
      </TabsList>
      {tabs.map((tab) => {
        const filtered = filterEntities(entities, tab.value);
        return (
          <TabsContent key={tab.value} value={tab.value}>
            {filtered.length === 0 ? (
              <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                No entities in this category yet.
              </p>
            ) : (
              <ul className={portraitCardGridClass}>
                {filtered.map((entity) => (
                  <li key={entity.id}>
                    <EntityCard entity={entity} />
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>
        );
      })}
    </Tabs>
  );
}
