"use client";

import { LeadCard } from "@/components/newsroom/lead-card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { storyLeadStateLabel } from "@/lib/labels";
import type { StoryLead, StoryLeadState } from "@/lib/types";

const tabStates: StoryLeadState[] = [
  "new",
  "accepted",
  "converted",
  "dismissed",
];

type LeadsBrowserProps = {
  leads: StoryLead[];
};

export function LeadsBrowser({ leads }: LeadsBrowserProps) {
  return (
    <Tabs defaultValue="all" className="gap-4">
      <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1">
        <TabsTrigger value="all" className="flex-none">
          All
          <span className="text-muted-foreground tabular-nums">({leads.length})</span>
        </TabsTrigger>
        {tabStates.map((state) => {
          const count = leads.filter((lead) => lead.state === state).length;
          return (
            <TabsTrigger key={state} value={state} className="flex-none">
              {storyLeadStateLabel(state)}
              <span className="text-muted-foreground tabular-nums">({count})</span>
            </TabsTrigger>
          );
        })}
      </TabsList>
      {["all", ...tabStates].map((value) => {
        const filtered =
          value === "all"
            ? leads
            : leads.filter((lead) => lead.state === value);
        return (
          <TabsContent key={value} value={value}>
            {filtered.length === 0 ? (
              <p className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
                No leads in this state yet.
              </p>
            ) : (
              <ul className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
                {filtered.map((lead) => (
                  <li key={lead.id} className="flex">
                    <LeadCard lead={lead} />
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
