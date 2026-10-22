import { claimStateCounts, claimStateOrder } from "@/lib/mock/claims";
import { claimReviewStateLabel } from "@/lib/labels";
import { cn } from "@/lib/utils";
import type { Claim, ClaimReviewState } from "@/lib/types";

const segmentClass: Record<ClaimReviewState, string> = {
  unsupported: "bg-destructive",
  conflicting: "bg-destructive/50",
  unchecked: "bg-muted-foreground/30",
  supported: "bg-foreground/60",
  editor_verified: "bg-foreground",
};

export function ClaimStateSummary({
  claims,
  showLegend = true,
}: {
  claims: Claim[];
  showLegend?: boolean;
}) {
  const counts = claimStateCounts(claims);
  const total = claims.length;

  return (
    <div className="flex flex-col gap-2">
      <div
        className="flex h-2 w-full overflow-hidden rounded-full bg-muted"
        role="img"
        aria-label={claimStateOrder
          .filter((state) => counts[state] > 0)
          .map((state) => `${counts[state]} ${claimReviewStateLabel(state)}`)
          .join(", ")}
      >
        {claimStateOrder.map((state) =>
          counts[state] > 0 ? (
            <span
              key={state}
              className={segmentClass[state]}
              style={{ width: `${(counts[state] / total) * 100}%` }}
            />
          ) : null,
        )}
      </div>
      {showLegend && (
        <ul className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
          {claimStateOrder.map((state) =>
            counts[state] > 0 ? (
              <li key={state} className="flex items-center gap-1.5">
                <span
                  className={cn("size-2 rounded-full", segmentClass[state])}
                  aria-hidden
                />
                <span className="tabular-nums text-foreground">
                  {counts[state]}
                </span>
                {claimReviewStateLabel(state)}
              </li>
            ) : null,
          )}
        </ul>
      )}
    </div>
  );
}
