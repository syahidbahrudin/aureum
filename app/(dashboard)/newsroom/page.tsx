import { LeadsBrowser } from "@/components/newsroom/leads-browser";
import { mockStoryLeads } from "@/lib/mock/newsroom";
import { storyLeadStateLabel } from "@/lib/labels";
import type { StoryLeadState } from "@/lib/types";

const statStates: StoryLeadState[] = [
  "new",
  "accepted",
  "converted",
  "dismissed",
];

export default function NewsroomPage() {
  return (
    <div className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Newsroom</h1>
        <p className="text-muted-foreground">
          Story leads suggested from incoming material and coverage trends.
          Suggestions, not editorial decisions.
        </p>
      </div>
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {statStates.map((state) => {
          const count = mockStoryLeads.filter(
            (lead) => lead.state === state,
          ).length;
          return (
            <div key={state} className="rounded-lg border p-4">
              <dt className="text-sm text-muted-foreground">
                {storyLeadStateLabel(state)}
              </dt>
              <dd className="mt-1 text-2xl font-semibold tabular-nums">
                {count}
              </dd>
            </div>
          );
        })}
      </dl>
      <LeadsBrowser leads={mockStoryLeads} />
    </div>
  );
}
