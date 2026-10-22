import Image from "next/image";
import Link from "next/link";
import { EditorialStateBadge } from "@/components/status-badges";
import { claimReviewStateLabel } from "@/lib/labels";
import { claimStateCounts, openClaimStates } from "@/lib/mock/claims";
import { formatRelativeDay } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { ClaimReview } from "@/lib/types";

export function ClaimDraftCard({ review }: { review: ClaimReview }) {
  const counts = claimStateCounts(review.claims);
  const openParts = openClaimStates
    .filter((state) => counts[state] > 0)
    .map((state) => `${counts[state]} ${claimReviewStateLabel(state).toLowerCase()}`);
  const blocked = counts.unsupported + counts.conflicting > 0;

  return (
    <Link
      href={`/claims/${review.articleSlug}`}
      className="group flex h-full w-full gap-4 rounded-xl border bg-card p-4 ring-border/50 transition-shadow outline-none hover:shadow-md focus-visible:ring-3 focus-visible:ring-ring"
    >
      <div className="relative hidden aspect-square w-24 shrink-0 overflow-hidden rounded-lg bg-muted sm:block">
        <Image
          src={review.thumbnailUrl}
          alt=""
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
          sizes="96px"
        />
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <h2 className="font-[family-name:var(--font-card-serif)] text-lg leading-snug font-normal tracking-tight">
            {review.title}
          </h2>
          <EditorialStateBadge state={review.state} />
        </div>
        <p className="text-xs text-muted-foreground">
          {review.author}
          <span aria-hidden> · </span>
          {review.claims.length} {review.claims.length === 1 ? "claim" : "claims"}
          <span aria-hidden> · </span>
          Updated {formatRelativeDay(review.updatedAt)}
        </p>
        <p
          className={cn(
            "text-sm font-medium",
            blocked ? "text-destructive" : "text-foreground",
          )}
        >
          {openParts.length > 0 ? openParts.join(", ") : "No open claims"}
        </p>
        {openParts.length === 0 && (
          <p className="text-xs text-muted-foreground">
            {counts.supported} supported, {counts.editor_verified} editor-verified.
          </p>
        )}
      </div>
    </Link>
  );
}
